# S3 Setup

Amazon S3 stores uploaded files like vehicle photos, documents, and other media.

## Overview

Create two buckets:
- `mekapal-uploads-dev` - Development uploads
- `mekapal-uploads-prod` - Production uploads

## 1. Create Buckets

### Development Bucket

```bash
aws s3 mb s3://mekapal-uploads-dev --region us-east-1
```

### Production Bucket

```bash
aws s3 mb s3://mekapal-uploads-prod --region us-east-1
```

**Note**: S3 bucket names must be globally unique. If the name is taken, add a suffix like your account ID or organization name (e.g., `mekapal-uploads-dev-123456`).

## 2. Configure CORS

CORS (Cross-Origin Resource Sharing) allows the mobile app and web admin to upload files directly.

Create a file named `cors-config.json`:

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

Apply to both buckets:

```bash
# Development
aws s3api put-bucket-cors \
  --bucket mekapal-uploads-dev \
  --cors-configuration file://cors-config.json

# Production
aws s3api put-bucket-cors \
  --bucket mekapal-uploads-prod \
  --cors-configuration file://cors-config.json
```

### Production CORS (More Restrictive)

For production, consider restricting origins:

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": [
        "https://admin.mekapal.com",
        "https://app.mekapal.com"
      ],
      "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

## 3. Block Public Access (Recommended)

By default, keep buckets private. The app uses presigned URLs for access.

```bash
# Development
aws s3api put-public-access-block \
  --bucket mekapal-uploads-dev \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Production
aws s3api put-public-access-block \
  --bucket mekapal-uploads-prod \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

## 4. Configure Lifecycle Rules (Optional)

To manage storage costs, you can set lifecycle rules to delete old files or move them to cheaper storage.

Create a file named `lifecycle-config.json`:

```json
{
  "Rules": [
    {
      "ID": "DeleteOldTempFiles",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "temp/"
      },
      "Expiration": {
        "Days": 7
      }
    },
    {
      "ID": "MoveToGlacier",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "documents/"
      },
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

Apply lifecycle rules:

```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket mekapal-uploads-prod \
  --lifecycle-configuration file://lifecycle-config.json
```

## 5. Create Folder Structure (Optional)

Create a logical folder structure:

```bash
# Development
aws s3api put-object --bucket mekapal-uploads-dev --key vehicles/
aws s3api put-object --bucket mekapal-uploads-dev --key documents/
aws s3api put-object --bucket mekapal-uploads-dev --key profiles/
aws s3api put-object --bucket mekapal-uploads-dev --key temp/

# Production
aws s3api put-object --bucket mekapal-uploads-prod --key vehicles/
aws s3api put-object --bucket mekapal-uploads-prod --key documents/
aws s3api put-object --bucket mekapal-uploads-prod --key profiles/
aws s3api put-object --bucket mekapal-uploads-prod --key temp/
```

## 6. Verify Configuration

```bash
# List buckets
aws s3 ls

# Check CORS configuration
aws s3api get-bucket-cors --bucket mekapal-uploads-dev

# Check public access block
aws s3api get-public-access-block --bucket mekapal-uploads-dev
```

## Summary

Save these values for App Runner environment variables:

| Environment | Bucket Name | Region |
|-------------|-------------|--------|
| Development | `mekapal-uploads-dev` | `us-east-1` |
| Production | `mekapal-uploads-prod` | `us-east-1` |

Environment variables:
- `AWS_S3_BUCKET=mekapal-uploads-dev`
- `AWS_S3_REGION=us-east-1`

## Next Step

Continue to [Cognito Setup](./05-cognito-setup.md)

> **Reads go through CloudFront, not S3 directly.** With public access blocked, the bucket cannot be hit from a browser/app — the upload module returns CloudFront URLs as `fileUrl`. See [11-cloudfront-setup.md](./11-cloudfront-setup.md) for the procedural CDN setup, and [10-upload-module.md](./10-upload-module.md) for the architecture rationale.
