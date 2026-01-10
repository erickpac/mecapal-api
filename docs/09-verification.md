# Verification

Verify that all services are correctly configured and working.

## 1. Health Check

Test the health endpoint:

```bash
# Development
curl https://YOUR_DEV_URL.us-east-1.awsapprunner.com/health

# Production
curl https://YOUR_PROD_URL.us-east-1.awsapprunner.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 2. Database Connection

Test database connectivity by accessing an endpoint that queries the database:

```bash
# This should work if database is connected
curl https://YOUR_DEV_URL.us-east-1.awsapprunner.com/locations/departments
```

If you get data, the database is connected. If you get a 500 error, check:
- DATABASE_URL is correct
- RDS security group allows inbound traffic
- RDS is publicly accessible (for dev)

## 3. Cognito Authentication

### Test Sign Up (Mobile)

```bash
curl -X POST https://YOUR_DEV_URL.us-east-1.awsapprunner.com/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "phone": "+50212345678",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Test Sign In (Mobile)

```bash
curl -X POST https://YOUR_DEV_URL.us-east-1.awsapprunner.com/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

Expected response includes `accessToken`, `refreshToken`, `idToken`, and `user`.

### Test Admin Sign In

```bash
curl -X POST https://YOUR_DEV_URL.us-east-1.awsapprunner.com/auth/admin/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123!"
  }'
```

## 4. S3 Upload

Test file upload (requires authentication):

```bash
# First, get an access token from sign-in
TOKEN="your-access-token"

# Test presigned URL generation
curl -X POST https://YOUR_DEV_URL.us-east-1.awsapprunner.com/upload/presigned-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fileName": "test.jpg",
    "contentType": "image/jpeg",
    "folder": "vehicles"
  }'
```

## 5. App Runner Service Status

```bash
# Development
aws apprunner describe-service \
  --service-arn YOUR_DEV_SERVICE_ARN \
  --query 'Service.{Status:Status,URL:ServiceUrl}'

# Production
aws apprunner describe-service \
  --service-arn YOUR_PROD_SERVICE_ARN \
  --query 'Service.{Status:Status,URL:ServiceUrl}'
```

Status should be `RUNNING`.

## 6. View Logs

### Via CLI

```bash
# Development logs
aws logs tail /aws/apprunner/mekapal-api-dev/service --follow

# Production logs
aws logs tail /aws/apprunner/mekapal-api-prod/service --follow
```

### Via Console

1. Go to **App Runner → Your service**
2. Click **Logs** tab
3. Select log stream to view

## 7. CI/CD Verification

### Test Development Deploy

1. Make a small change (e.g., update health response)
2. Push to `develop` branch
3. Go to GitHub **Actions** tab
4. Watch "Deploy to Development" workflow
5. Verify it completes successfully
6. Test the change on dev URL

### Test Production Deploy

1. Create a PR from `develop` to `main`
2. Merge the PR
3. If approval required, approve the deployment
4. Watch "Deploy to Production" workflow
5. Verify it completes successfully
6. Test the change on prod URL

## 8. Full System Test

Run through the complete user flow:

### Client User Flow
1. ✅ Sign up as CLIENT
2. ✅ Confirm email (check for confirmation code)
3. ✅ Sign in
4. ✅ Access protected endpoints

### Transporter User Flow
1. ✅ Sign up as TRANSPORTER
2. ✅ Confirm email
3. ✅ Sign in
4. ✅ Complete profile
5. ✅ Add vehicle
6. ✅ Upload vehicle photos

### Admin User Flow
1. ✅ Create ADMIN user (via database or existing admin)
2. ✅ Admin signs in via `/auth/admin/sign-in`
3. ✅ Complete new password challenge
4. ✅ Create BACKOFFICE user via `/auth/admin/users`
5. ✅ BACKOFFICE signs in and changes password

## Troubleshooting

### Health check fails

- Check App Runner logs
- Verify PORT is set to 8080
- Ensure health endpoint exists at `/health`

### Database connection fails

- Verify DATABASE_URL format
- Check RDS security group
- Ensure RDS is in "Available" state
- Test connection from local machine first

### Cognito errors

- Verify User Pool ID and Client ID
- Check AWS_REGION matches Cognito region
- Ensure app client has correct auth flows enabled

### S3 errors

- Verify bucket exists
- Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
- Verify IAM user has S3 permissions

### CI/CD fails

- Check GitHub Actions logs
- Verify all secrets are set correctly
- Ensure App Runner service ARN is correct

## Monitoring Checklist

### Daily Checks
- [ ] App Runner service status is RUNNING
- [ ] Health endpoint responds
- [ ] No error spikes in logs

### Weekly Checks
- [ ] Review App Runner metrics
- [ ] Check RDS storage usage
- [ ] Review S3 storage costs
- [ ] Check for failed deployments

### Monthly Checks
- [ ] Review AWS costs
- [ ] Check for security updates
- [ ] Review and rotate credentials if needed

## Summary

If all verifications pass:
- ✅ API is running and accessible
- ✅ Database is connected
- ✅ Authentication works
- ✅ File uploads work
- ✅ CI/CD is operational

Your infrastructure is ready for development!
