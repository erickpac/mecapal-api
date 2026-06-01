# ECS Express Mode Setup

Amazon ECS Express Mode hosts the NestJS API with automatic load balancing, HTTPS, and auto-scaling.

> **Note:** This project was previously deployed on AWS App Runner. App Runner entered maintenance mode on April 30, 2026. ECS Express Mode is the recommended replacement by AWS.

## Prerequisites

Before creating ECS Express services, ensure you have:
- ECR repositories created with at least one image ([ECR Setup](./02-ecr-setup.md))
- RDS database created ([RDS Setup](./03-rds-setup.md))
- S3 buckets created ([S3 Setup](./04-s3-setup.md))
- Cognito user pools created ([Cognito Setup](./05-cognito-setup.md))
- IAM roles created ([IAM Setup](./01-iam-setup.md))

## 1. Create Development Service

### Via AWS Console (Recommended)

1. Go to **Amazon ECS → Express Mode → Create service**

2. **Service configuration**:
   - Service name: `mekapal-api-dev`
   - Container image: Browse → Select `mekapal-api-dev:latest` from ECR
   - Port: `8080`

3. **Roles**:
   - Execution role: `mekapalEcsTaskExecutionRole`
   - Infrastructure role: `mekapalEcsInfrastructureRole`
   - Task role: `mekapalApiTaskRole`

4. **Resources**:
   - CPU: 0.5 vCPU (512)
   - Memory: 1 GB (1024)

5. **Health check**:
   - Path: `/api/health`

6. **Environment variables** (Add all):

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
| `AWS_SES_REGION` | `us-east-1` |
| `AWS_SES_FROM_EMAIL` | `noreply@yourdomain.com` |
| `CORS_ORIGIN` | `http://localhost:3000` |

> **Note:** No AWS access keys needed. The task role (`mekapalApiTaskRole`) provides credentials automatically via the AWS SDK credential chain.

7. Click **Create**

### Via CLI

```bash
aws ecs create-express-gateway-service \
  --service-name mekapal-api-dev \
  --primary-container '{
    "image": "<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/mekapal-api-dev:latest",
    "port": 8080,
    "environment": [
      {"name": "NODE_ENV", "value": "development"},
      {"name": "PORT", "value": "8080"},
      {"name": "DATABASE_URL", "value": "postgresql://..."},
      {"name": "AWS_REGION", "value": "us-east-1"},
      {"name": "AWS_COGNITO_USER_POOL_ID", "value": "us-east-1_xxx"},
      {"name": "AWS_COGNITO_CLIENT_ID", "value": "xxx"},
      {"name": "AWS_S3_REGION", "value": "us-east-1"},
      {"name": "AWS_S3_BUCKET", "value": "mekapal-uploads-dev"},
      {"name": "CORS_ORIGIN", "value": "http://localhost:3000"}
    ]
  }' \
  --health-check-path "/api/health" \
  --execution-role-arn arn:aws:iam::<ACCOUNT_ID>:role/mekapalEcsTaskExecutionRole \
  --infrastructure-role-arn arn:aws:iam::<ACCOUNT_ID>:role/mekapalEcsInfrastructureRole \
  --task-role-arn arn:aws:iam::<ACCOUNT_ID>:role/mekapalApiTaskRole \
  --cpu 512 \
  --memory 1024
```

## 2. Wait for Deployment

Deployment takes 3-5 minutes. ECS Express Mode provisions:
- ECS Service on Fargate
- Application Load Balancer with HTTPS
- Security Groups
- CloudWatch Log Group
- Auto-scaling policies

```bash
# Check status
aws ecs describe-express-gateway-services \
  --service-names mekapal-api-dev \
  --query 'services[0].status'
```

Wait until status is `ACTIVE`.

## 3. Get Service URL

After deployment, ECS Express Mode provides an auto-generated URL:

```
https://mekapal-api-dev.ecs.us-east-1.on.aws
```

This URL has HTTPS enabled automatically with an AWS-managed certificate.

## 4. Create Production Service

Repeat steps above with these differences:

| Setting | Development | Production |
|---------|-------------|------------|
| Service name | `mekapal-api-dev` | `mekapal-api-prod` |
| CPU | 0.5 vCPU (512) | 1 vCPU (1024) |
| Memory | 1 GB (1024) | 2 GB (2048) |
| NODE_ENV | `development` | `production` |
| DATABASE_URL | RDS dev endpoint | RDS prod endpoint |
| S3 bucket | `mekapal-uploads-dev` | `mekapal-uploads-prod` |
| Cognito pool | dev pool | prod pool |

## 5. Custom Domain (Optional)

ECS Express Mode auto-provisions an ALB with HTTPS. To use your own domain:

1. Request an ACM certificate for `api.mekapal.com`
2. Add the certificate to the ALB's HTTPS listener
3. Create an ALB listener rule for your custom domain's host header
4. Create a Route 53 alias record pointing `api.mekapal.com` to the ALB

## 6. Docker Image Architecture

When building Docker images locally (especially on Mac M1/M2), you must build for `linux/amd64`:

```bash
docker buildx build --platform linux/amd64 -t <image> --push .
```

The GitHub Actions workflow handles this automatically with the `platforms: linux/amd64` setting.

## 7. View Logs

```bash
# Via CLI — logs go to CloudWatch under the auto-created log group
aws logs tail /ecs/mekapal-api-dev --follow

# Via Console
# Amazon ECS → Services → mekapal-api-dev → Logs
```

## 8. Migrations on deploy

Migrations run as a one-off in-VPC ECS RunTask in the deploy workflow, before
the service updates (private RDS is unreachable from the GitHub runner). See
[08-migrations.md](./08-migrations.md). The container does **not** migrate on
boot.

## 9. Networking, ALB, and cost notes

The Express gateway ALB (`ecs-express-gateway-alb-*`) is tagged
`AmazonECSManaged: true` and the service has `resourceManagementType: ECS` with
`availabilityZoneRebalancing: ENABLED` — **ECS owns the ALB, its AZ/subnet
spread, and the per-AZ Elastic IPs**. Do not `set-subnets` or release those EIPs
manually; ECS reconciles them back. There is no stable Express-native knob to
reduce the AZ count today, so the ALB spans all default-VPC AZs.

Cost log: see [13-networking-cost.md](./13-networking-cost.md).

## 10. Auto-scaling

ECS Express Mode configures CPU-based auto-scaling by default:
- Minimum: 1 task (always running)
- Scales up when CPU exceeds threshold
- You can adjust min/max counts via standard ECS APIs after creation

## Troubleshooting

### Service fails to start

1. Check CloudWatch logs for the service
2. Verify all environment variables are set
3. Ensure database is accessible from the VPC
4. Verify health check endpoint works on port 8080

### Cannot connect to RDS

1. Ensure RDS security group allows inbound from the ECS security group
2. Check that both are in the same VPC
3. Verify DATABASE_URL is correct

### Image not found

1. Verify image exists in ECR
2. Check execution role has ECR pull permissions
3. Verify image tag is correct

## Next Step

Continue to [GitHub Secrets](./07-github-secrets.md)
