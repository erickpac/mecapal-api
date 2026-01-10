# App Runner Setup

AWS App Runner hosts the NestJS API with automatic scaling and HTTPS.

> **Note:** GitHub Actions workflow handles deployments automatically. This guide is for initial setup or manual configuration only.

## Prerequisites

Before creating App Runner services, ensure you have:
- ✅ ECR repositories created with at least one image ([ECR Setup](./02-ecr-setup.md))
- ✅ RDS database created ([RDS Setup](./03-rds-setup.md))
- ✅ S3 buckets created ([S3 Setup](./04-s3-setup.md))
- ✅ Cognito user pools created ([Cognito Setup](./05-cognito-setup.md))
- ✅ IAM user credentials for the app ([IAM Setup](./01-iam-setup.md))

## 1. Create ECR Access Role

App Runner needs permission to pull images from ECR.

### Via AWS Console

1. Go to **App Runner → Create service**
2. When prompted for ECR access, select **Create new service role**
3. AWS will create `AppRunnerECRAccessRole` automatically

### Via CLI (if needed)

```bash
# Create trust policy file
cat > apprunner-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "build.apprunner.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name AppRunnerECRAccessRole \
  --assume-role-policy-document file://apprunner-trust-policy.json

# Attach ECR policy
aws iam attach-role-policy \
  --role-name AppRunnerECRAccessRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess
```

## 2. Create Development Service

### Via AWS Console (Recommended)

1. Go to **App Runner → Create service**

2. **Source and deployment**:
   - Repository type: Container registry
   - Provider: Amazon ECR
   - Container image URI: Browse → Select `mekapal-api-dev:latest`
   - Deployment trigger: **Manual** (GitHub Actions handles deployments)
   - ECR access role: Use existing or create new

3. **Configure build**: Skip (using pre-built image)

4. **Configure service**:
   - Service name: `mekapal-api-dev`
   - CPU: 0.5 vCPU (minimum for NestJS + Prisma)
   - Memory: 1 GB (minimum for NestJS + Prisma)
   - Port: 8080

5. **Environment variables** (Add all):

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `development` |
| `PORT` | `8080` |
| `DATABASE_URL` | `postgresql://postgres:PASSWORD@mekapal-dev.xxx.rds.amazonaws.com:5432/mekapal` |
| `AWS_REGION` | `us-east-1` |
| `AWS_COGNITO_USER_POOL_ID` | `us-east-1_xxxxxxxxx` |
| `AWS_COGNITO_CLIENT_ID` | `your-client-id` |
| `AWS_S3_REGION` | `us-east-1` |
| `AWS_S3_BUCKET` | `mekapal-uploads-dev` |
| `AWS_ACCESS_KEY_ID` | `AKIA...` (from mekapal-app user) |
| `AWS_SECRET_ACCESS_KEY` | `xxx...` (from mekapal-app user) |
| `AWS_SES_REGION` | `us-east-1` |
| `AWS_SES_FROM_EMAIL` | `noreply@yourdomain.com` |

6. **Auto scaling**:
   - Minimum: 1
   - Maximum: 2 (for development)
   - Scale up/down: Keep defaults

7. **Health check**:
   - Protocol: HTTP
   - Path: `/api/health`
   - Interval: 10 seconds
   - Timeout: 5 seconds
   - Healthy threshold: 1
   - Unhealthy threshold: 5

8. **Security** (Optional):
   - Instance role: None (not needed)
   - Incoming traffic: Public

9. **Networking**:
   - Use default VPC connector settings
   - If RDS is private, configure VPC connector

10. Click **Create & deploy**

### Via CLI

```bash
aws apprunner create-service \
  --service-name mekapal-api-dev \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/mekapal-api-dev:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "8080",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "development",
          "PORT": "8080",
          "DATABASE_URL": "postgresql://...",
          "AWS_REGION": "us-east-1",
          "AWS_COGNITO_USER_POOL_ID": "us-east-1_xxx",
          "AWS_COGNITO_CLIENT_ID": "xxx",
          "AWS_S3_REGION": "us-east-1",
          "AWS_S3_BUCKET": "mekapal-uploads-dev",
          "AWS_ACCESS_KEY_ID": "xxx",
          "AWS_SECRET_ACCESS_KEY": "xxx"
        }
      }
    },
    "AutoDeploymentsEnabled": false,
    "AuthenticationConfiguration": {
      "AccessRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/AppRunnerECRAccessRole"
    }
  }' \
  --instance-configuration '{
    "Cpu": "512",
    "Memory": "1024"
  }' \
  --health-check-configuration '{
    "Protocol": "HTTP",
    "Path": "/api/health",
    "Interval": 10,
    "Timeout": 5,
    "HealthyThreshold": 1,
    "UnhealthyThreshold": 5
  }'
```

## 3. Wait for Deployment

Deployment takes 5-10 minutes.

```bash
# Check status
aws apprunner describe-service \
  --service-arn <service-arn> \
  --query 'Service.Status'
```

Wait until status is `RUNNING`.

## 4. Get Service URL

After deployment:

```bash
aws apprunner describe-service \
  --service-arn <service-arn> \
  --query 'Service.ServiceUrl' \
  --output text
```

The URL format is: `https://xxxxxxxxxx.us-east-1.awsapprunner.com`

## 5. Get Service ARN

You need the Service ARN for GitHub Actions:

```bash
aws apprunner list-services \
  --query "ServiceSummaryList[?ServiceName=='mekapal-api-dev'].ServiceArn" \
  --output text
```

Save this ARN for [GitHub Secrets](./07-github-secrets.md).

## 6. Create Production Service

Repeat steps above with these differences:

| Setting | Development | Production |
|---------|-------------|------------|
| Service name | `mekapal-api-dev` | `mekapal-api-prod` |
| CPU | 0.5 vCPU (512) | 1 vCPU (1024) |
| Memory | 1 GB (1024) | 2 GB (2048) |
| Auto scaling max | 2 | 5-10 |
| NODE_ENV | `development` | `production` |
| DATABASE_URL | RDS dev endpoint | RDS prod endpoint |
| S3 bucket | `mekapal-uploads-dev` | `mekapal-uploads-prod` |
| Cognito pool | dev pool | prod pool |

## Important: Docker Image Architecture

When building Docker images locally (especially on Mac M1/M2), you must build for `linux/amd64`:

```bash
# Build for correct architecture
docker buildx build --platform linux/amd64 -t <image> --push .
```

The GitHub Actions workflow handles this automatically with the `platforms: linux/amd64` setting.

## 7. Custom Domain (Optional)

To use your own domain:

1. Go to **App Runner → Your service → Custom domains**
2. Click **Add domain**
3. Enter your domain: `api.mekapal.com`
4. App Runner provides CNAME records
5. Add records to your DNS provider
6. Wait for certificate validation (up to 48 hours)

## 8. View Logs

```bash
# Via CLI
aws logs tail /aws/apprunner/mekapal-api-dev/service --follow

# Via Console
# App Runner → Service → Logs
```

## 9. Update Environment Variables

To update environment variables after creation:

1. Go to **App Runner → Service → Configuration**
2. Click **Edit**
3. Update variables
4. Click **Save changes**
5. Service will redeploy automatically

## Summary

Save these values:

| Environment | Service URL | Service ARN |
|-------------|-------------|-------------|
| Development | `https://xxx.awsapprunner.com` | `arn:aws:apprunner:...` |
| Production | `https://yyy.awsapprunner.com` | `arn:aws:apprunner:...` |

## Troubleshooting

### Service fails to start

1. Check logs in App Runner console
2. Verify all environment variables are set
3. Ensure database is accessible
4. Verify health check endpoint works

### Cannot connect to RDS

1. Ensure RDS is publicly accessible (for dev)
2. Check security group allows inbound on port 5432
3. For private RDS, configure VPC connector

### Image not found

1. Verify image exists in ECR
2. Check ECR access role is correctly configured
3. Verify image tag is correct

## Next Step

Continue to [GitHub Secrets](./07-github-secrets.md)
