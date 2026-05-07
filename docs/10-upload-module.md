# Upload Module

How file uploads are designed, what the dev bucket currently looks like, and what production needs that dev does not yet have.

> Companion to [04-s3-setup.md](./04-s3-setup.md), which covers the procedural bucket setup. This doc covers the architecture decisions and the known gaps.

## Flow

```
mobile/console                           api                                S3
     │                                    │                                  │
     │ POST /upload/presigned-url ───────►│                                  │
     │   { category, contentType }        │                                  │
     │                                    │ createPresignedPost ────────────►│
     │                                    │   conditions: size, type, SSE,  │
     │                                    │   tagging                       │
     │                                    │◄────── { url, fields, fileUrl } │
     │◄──── { url, fields, fileUrl } ─────│                                  │
     │                                    │                                  │
     │ POST {url}  multipart ─────────────────────────────────────────────►│
     │   fields[] + file                  │                                  │
     │                                    │                                  │
     │◄────────────────── 204 ─────────────────────────────────────────────│
     │                                    │                                  │
     │ PATCH /user { profilePhotoUrl }   │                                  │
     │                                    │                                  │
     │                                    │  (best-effort delete previous)──►│
     │                                    │                                  │
```

The API never sees the file bytes. Uploads go directly from client to S3, signed by a presigned POST policy that pins:

- exact `Key` (server-generated: `{category}/{userId}/{timestamp}-{16hex}.{ext}`)
- `Content-Type` (must equal what was declared)
- `content-length-range` (server-side max-size enforcement)
- `x-amz-server-side-encryption: AES256`
- `tagging` (`userId`, `category`, `uploadedAt`)

The extension is derived from the declared MIME (allowlisted), not from the client filename — so a client cannot make S3 store `payload.html` while claiming `image/jpeg`.

## Dev bucket — current state

Inspected and configured on 2026-05-07 against `mekapal-uploads-dev` (us-east-1):

| Setting | Value | Notes |
|---|---|---|
| Default encryption | `AES256` | Aligns with the `x-amz-server-side-encryption` condition we sign |
| Public access block | All four flags `true` | Bucket stays fully private; reads go through CloudFront |
| Bucket policy | OAC-scoped `s3:GetObject` for CloudFront `E2EW3AB3L0LEL7` | Allows the CDN distribution to fetch objects, no one else |
| CORS | `*` origins, all verbs | Permissive, OK for dev |
| Lifecycle | None | Pending — see "Production must-haves" below |
| CloudFront | `d38792bkn2r1o4.cloudfront.net` (distribution `E2EW3AB3L0LEL7`, OAC `E3UO07JF1XN2VV`) | Public read path with cache + HTTPS |

## Read flow: CloudFront with OAC

Uploads work against the private bucket via presigned POST. Reads go through a CloudFront distribution that uses Origin Access Control (OAC) to fetch from the (still private) bucket. The bucket policy only allows the CloudFront service principal scoped to the specific distribution ARN — no one else can read directly.

The API constructs `fileUrl` as `https://{AWS_CLOUDFRONT_DOMAIN}/{key}` and returns it to the client. The mobile/console renders that URL directly via `<Image>` / `<img>`.

`extractKeyFromUrl` accepts **both** the CloudFront host and the direct S3 host. The S3 fallback exists only to keep orphan-cleanup working for any URLs persisted before the migration; new writes always use CloudFront.

### Sensitive prefixes (documents)

Profile photos are non-sensitive — keys are unguessable (`profile-photos/{uuid}/{ts}-{16hex}.{ext}`) and the URL embeds the random key. Documents (`profile-documents/`, `vehicle-documents/`) need stronger protection:

- Add a separate cache behavior on the distribution for the `*-documents/*` path patterns
- Restrict viewer access using a **trusted key group** (CloudFront signed URLs/cookies)
- Have the API issue a short-lived signed URL (5–10 min) on demand from an authenticated endpoint

Not yet implemented — only profile photos are in active use today. Tracked as a follow-up.

## Production must-haves

These are not present on dev and will need to be set up explicitly when the prod bucket is created:

### Lifecycle rules

```json
{
  "Rules": [
    {
      "ID": "AbortIncompleteMultipartUploads",
      "Status": "Enabled",
      "Filter": {},
      "AbortIncompleteMultipartUpload": { "DaysAfterInitiation": 1 }
    },
    {
      "ID": "MoveOldDocumentsToIA",
      "Status": "Enabled",
      "Filter": { "Prefix": "profile-documents/" },
      "Transitions": [{ "Days": 30, "StorageClass": "STANDARD_IA" }]
    }
  ]
}
```

Orphan-uploads cleanup (presigned-URL was issued but no PUT, or PUT succeeded but the user PATCH never happened) needs **DB-side tracking**, not lifecycle alone. Plan:

1. On presigned-POST issuance, insert a row into a new `pending_upload` table with the key, userId, category, expires_at (now + 24h).
2. On the user PATCH that consumes the URL, delete the row.
3. A daily cron deletes expired `pending_upload` rows + the corresponding S3 objects.

Tagged uploads (`userId`, `category`, `uploadedAt`) make incident forensics and ad-hoc cleanups easy via `aws s3api list-objects-v2 --query "Contents[?Tagging contains 'userId=...']"`.

### Tighter CORS

Restrict `AllowedOrigins` to:

- `https://app.mekapal.com`
- `https://admin.mekapal.com`
- iOS/Android app schemes if needed

Drop `DELETE` and `HEAD` from `AllowedMethods` — the app only needs `POST` to upload and `GET` for reads.

### Bucket policy: deny non-SSE uploads

Belt and suspenders: even though we sign the SSE header into the presigned POST, deny any PutObject without `s3:x-amz-server-side-encryption=AES256`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyUnencryptedUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::mekapal-uploads-prod/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    }
  ]
}
```

### CloudWatch alarms

- `BucketSizeBytes` growth rate (catches abuse spikes)
- `4xxErrors` and `5xxErrors` on `PutObject`
- Alarm if `pending_upload` table grows beyond expected daily volume

## Open follow-ups

Tracked elsewhere:

- **Mobile migration**: switch from PUT (legacy) to multipart POST (new presigned policy). API is already on POST as of `fix/upload-hardening`; mobile change is pending.
- **`pending_upload` table** + cron for orphan cleanup.
- **Signed URLs/cookies for documents**: protect `profile-documents/` and `vehicle-documents/` behind a CloudFront trusted key group; API issues short-lived signed URLs from an authenticated read endpoint.
- **Custom CDN domain** (`cdn.mekapal.com` / `cdn-staging.mekapal.com`) with ACM cert in `us-east-1`. Currently using the default `*.cloudfront.net`.
- **Revisit rate limit** (`@Throttle({ ttl: 60_000, limit: 10 })`) once we have real-user data; tune up or down.

## Code map

| Concern | File |
|---|---|
| Domain interface | `src/modules/upload/domain/interfaces/s3.service.interface.ts` |
| S3 wrapper (presigned POST, delete, key extraction) | `src/modules/upload/infrastructure/services/s3.service.ts` |
| Use case (server-generated key, MIME → ext, size/SSE/tagging) | `src/modules/upload/application/use-cases/generate-presigned-url.use-case.ts` |
| Per-category limits (max size, MIMEs, expiry) | `src/modules/upload/domain/constants/upload-config.ts` |
| Categories enum (kebab-case wire values) | `src/modules/upload/domain/enums/file-category.enum.ts` |
| Endpoint with rate limit | `src/modules/upload/infrastructure/controllers/upload.controller.ts` |
| Orphan cleanup on profile photo replace | `src/modules/user/application/use-cases/update-user.use-case.ts` |
