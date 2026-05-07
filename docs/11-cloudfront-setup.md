# CloudFront Setup

Procedural guide to wire a CloudFront distribution with Origin Access Control (OAC) in front of the upload bucket so reads work while the bucket stays private. The architecture rationale lives in [10-upload-module.md](./10-upload-module.md).

> The dev distribution was created on 2026-05-07. Use this doc verbatim when setting up the prod distribution.

## 1. Create the Origin Access Control

OAC lets CloudFront sign its requests to S3 with SigV4 against your bucket, without making the bucket public.

```bash
aws cloudfront create-origin-access-control --origin-access-control-config '{
  "Name": "mekapal-uploads-prod-oac",
  "Description": "OAC for mekapal uploads prod bucket",
  "SigningProtocol": "sigv4",
  "SigningBehavior": "always",
  "OriginAccessControlOriginType": "s3"
}'
```

Save the returned `Id` (e.g. `E3UO07JF1XN2VV`) — it goes in the distribution config.

## 2. Create the distribution

Replace `<OAC_ID>` and the bucket name. `PriceClass_100` is the cheapest tier (US/EU edges only) — change to `PriceClass_All` for global low-latency if needed.

```bash
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "mekapal-uploads-prod-2026-XX-XX",
  "Comment": "Mekapal uploads CDN (prod)",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "S3-mekapal-uploads-prod",
      "DomainName": "mekapal-uploads-prod.s3.us-east-1.amazonaws.com",
      "OriginAccessControlId": "<OAC_ID>",
      "S3OriginConfig": { "OriginAccessIdentity": "" },
      "ConnectionAttempts": 3,
      "ConnectionTimeout": 10,
      "OriginShield": { "Enabled": false },
      "CustomHeaders": { "Quantity": 0 }
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-mekapal-uploads-prod",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": { "Quantity": 2, "Items": ["GET", "HEAD"] }
    },
    "Compress": true,
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "FieldLevelEncryptionId": "",
    "SmoothStreaming": false
  },
  "CacheBehaviors": { "Quantity": 0 },
  "CustomErrorResponses": { "Quantity": 0 },
  "PriceClass": "PriceClass_100",
  "ViewerCertificate": {
    "CloudFrontDefaultCertificate": true,
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "Restrictions": { "GeoRestriction": { "RestrictionType": "none", "Quantity": 0 } },
  "WebACLId": "",
  "HttpVersion": "http2and3",
  "IsIPV6Enabled": true,
  "Staging": false
}'
```

`658327ea-f89d-4fab-a63d-7e88639e58f6` is the AWS-managed `CachingOptimized` cache policy.

Save the `Id` and `DomainName` (e.g. `dXXXXXXXXXX.cloudfront.net`). Status will be `InProgress` for ~10–15 minutes; reads return `403 Forbidden` until the bucket policy in step 3 is applied.

## 3. Bucket policy granting OAC read

Replace `<DISTRIBUTION_ID>` and `<ACCOUNT_ID>`:

```bash
aws s3api put-bucket-policy --bucket mekapal-uploads-prod --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFrontServicePrincipalRead",
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::mekapal-uploads-prod/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<DISTRIBUTION_ID>"
      }
    }
  }]
}'
```

The `AWS:SourceArn` condition is the security gate: any other distribution (yours or someone else's) that tries to use `cloudfront.amazonaws.com` as principal will be denied. **Always include it.**

The bucket's existing `PublicAccessBlock` does not need to change — this policy targets a service principal, not the public.

## 4. GitHub Actions secret

```bash
gh secret set AWS_CLOUDFRONT_DOMAIN --env production --body "<distribution-domain>"
gh secret set AWS_CLOUDFRONT_DOMAIN --env development --body "<distribution-domain>"
```

The deploy workflow (`_deploy-ecs-express.yml`) already reads this secret and injects `AWS_CLOUDFRONT_DOMAIN` into the ECS task definition. The API's `S3Service` calls `configService.getOrThrow('AWS_CLOUDFRONT_DOMAIN')` at boot — startup will fail loudly if the secret is missing.

## 5. Smoke test

After the distribution status flips to `Deployed`:

```bash
# Upload a known object directly (bypassing the API) for testing
aws s3 cp ./test.jpg s3://mekapal-uploads-prod/profile-photos/test/test.jpg

# Verify CDN can read it
curl -I https://<distribution-domain>/profile-photos/test/test.jpg
# Expect 200 OK
```

Then test through the actual app: upload a profile photo, confirm `<Image>` renders.

## Future steps (not yet done)

### Custom domain (`cdn.mekapal.com`)

1. Request an ACM certificate **in `us-east-1`** for `cdn.mekapal.com` (and `cdn-staging.mekapal.com` if separate).
2. Validate via DNS.
3. Update the distribution: add the alternate domain name and attach the cert.
4. Add a Route53 (or external DNS) `A AAAA` alias to the distribution.
5. Point `AWS_CLOUDFRONT_DOMAIN` secret at the custom domain.

### Signed URLs for documents

For `profile-documents/*` and `vehicle-documents/*`:

1. Generate a CloudFront key pair (private key stored in Secrets Manager, public key uploaded to a CloudFront key group).
2. Add a cache behavior on the distribution for those path patterns with the trusted key group attached.
3. API endpoint that issues short-lived signed URLs for authenticated users (`@aws-sdk/cloudfront-signer`).

The API currently returns the public CloudFront URL for any category. Documents work today because the keys are unguessable, but proper auth-gated read is a near-term must-have once documents are in active use.

### CloudFront WAF + rate limiting at the edge

For prod, attach a WAF web ACL with at least:

- AWS managed common rule set
- Rate-based rule (e.g. 2,000 req / 5 min per IP)

Set the `WebACLId` field in the distribution config.
