# Verification

Verify that all services are correctly configured and working.

## 1. Health Check

Test the health endpoint:

```bash
# Development
curl https://mekapal-api-dev.ecs.us-east-1.on.aws/api/health

# Production
curl https://mekapal-api-prod.ecs.us-east-1.on.aws/api/health
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
curl https://mekapal-api-dev.ecs.us-east-1.on.aws/locations/countries
```

If you get data, the database is connected. If you get a 500 error, check:
- DATABASE_URL is correct
- RDS security group allows inbound from ECS security group
- RDS is in the same VPC as the ECS service

## 3. Cognito Authentication

### Test Sign Up (Mobile)

```bash
curl -X POST https://mekapal-api-dev.ecs.us-east-1.on.aws/auth/sign-up \
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
curl -X POST https://mekapal-api-dev.ecs.us-east-1.on.aws/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

Expected response includes `accessToken`, `refreshToken`, `idToken`, and `user`.

### Test Admin Sign In

```bash
curl -X POST https://mekapal-api-dev.ecs.us-east-1.on.aws/auth/admin/sign-in \
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
curl -X POST https://mekapal-api-dev.ecs.us-east-1.on.aws/upload/presigned-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fileName": "test.jpg",
    "contentType": "image/jpeg",
    "folder": "vehicles"
  }'
```

## 5. ECS Service Status

```bash
# Check service status
aws ecs describe-express-gateway-services \
  --service-names mekapal-api-dev \
  --query 'services[0].{Status:status,URL:serviceUrl}'
```

Status should be `ACTIVE`.

## 6. View Logs

### Via CLI

```bash
# Development logs
aws logs tail /ecs/mekapal-api-dev --follow

# Production logs
aws logs tail /ecs/mekapal-api-prod --follow
```

### Via Console

1. Go to **Amazon ECS → Services → Your service**
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
1. Sign up as CLIENT
2. Confirm email (check for confirmation code)
3. Sign in
4. Access protected endpoints

### Transporter User Flow
1. Sign up as TRANSPORTER
2. Confirm email
3. Sign in
4. Complete profile
5. Add vehicle
6. Upload vehicle photos

### Admin User Flow
1. Create ADMIN user (via database or existing admin)
2. Admin signs in via `/auth/admin/sign-in`
3. Complete new password challenge
4. Create BACKOFFICE user via `/auth/admin/users`
5. BACKOFFICE signs in and changes password

## Troubleshooting

### Health check fails

- Check ECS CloudWatch logs
- Verify PORT is set to 8080
- Ensure health endpoint exists at `/api/health`

### Database connection fails

- Verify DATABASE_URL format
- Check RDS security group allows inbound from ECS security group
- Ensure RDS is in "Available" state
- Verify both services are in the same VPC

### Cognito errors

- Verify User Pool ID and Client ID
- Check AWS_REGION matches Cognito region
- Ensure app client has correct auth flows enabled

### S3 errors

- Verify bucket exists
- Check task role (`mekapalApiTaskRole`) has S3 permissions
- No access keys needed — task role provides credentials automatically

### CI/CD fails

- Check GitHub Actions logs
- Verify all secrets are set correctly
- Ensure ECS role ARNs are correct

## Monitoring Checklist

### Daily Checks
- [ ] ECS service status is ACTIVE
- [ ] Health endpoint responds
- [ ] No error spikes in CloudWatch logs

### Weekly Checks
- [ ] Review ECS service metrics (CPU, memory)
- [ ] Check RDS storage usage
- [ ] Review S3 storage costs
- [ ] Check for failed deployments

### Monthly Checks
- [ ] Review AWS costs
- [ ] Check for security updates
- [ ] Review and rotate CI/CD credentials if needed

## Summary

If all verifications pass:
- API is running and accessible
- Database is connected
- Authentication works
- File uploads work
- CI/CD is operational

Your infrastructure is ready for development!
