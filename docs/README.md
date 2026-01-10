# Mecapal API - AWS Infrastructure Guide

This guide provides step-by-step instructions for setting up the AWS infrastructure for both development and production environments.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT                                  │
├─────────────────────────────────────────────────────────────────────┤
│  GitHub (develop) → ECR → App Runner → RDS PostgreSQL               │
│                                                                      │
│  • App Runner: mekapal-api-dev                                       │
│  • ECR: mekapal-api-dev                                              │
│  • RDS: mekapal-dev                                                  │
│  • S3: mekapal-uploads-dev                                           │
│  • Cognito: mekapal-dev-pool                                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                                   │
├─────────────────────────────────────────────────────────────────────┤
│  GitHub (main) → ECR → App Runner → RDS PostgreSQL                  │
│                                                                      │
│  • App Runner: mekapal-api-prod                                      │
│  • ECR: mekapal-api-prod                                             │
│  • RDS: mekapal-prod                                                 │
│  • S3: mekapal-uploads-prod                                          │
│  • Cognito: mekapal-prod-pool                                        │
└─────────────────────────────────────────────────────────────────────┘
```

## CI/CD Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   GitHub     │────►│    Build     │────►│     ECR      │────►│  App Runner  │
│   Push       │     │   Docker     │     │    Push      │     │   Deploy     │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │
       ├── develop branch → Development environment
       └── main branch → Production environment
```

## Resources Summary

| Resource | Development | Production |
|----------|-------------|------------|
| ECR Repository | `mekapal-api-dev` | `mekapal-api-prod` |
| RDS Instance | `mekapal-dev` | `mekapal-prod` |
| S3 Bucket | `mekapal-uploads-dev` | `mekapal-uploads-prod` |
| Cognito Pool | `mekapal-dev-pool` | `mekapal-prod-pool` |
| App Runner | `mekapal-api-dev` | `mekapal-api-prod` |

## Setup Order

Follow these guides in order:

1. [IAM Setup](./01-iam-setup.md) - Create CI/CD user and app user
2. [ECR Setup](./02-ecr-setup.md) - Create container repositories
3. [RDS Setup](./03-rds-setup.md) - Create PostgreSQL databases
4. [S3 Setup](./04-s3-setup.md) - Create storage buckets
5. [Cognito Setup](./05-cognito-setup.md) - Create user pools
6. [App Runner Setup](./06-app-runner-setup.md) - Create and configure services
7. [GitHub Secrets](./07-github-secrets.md) - Configure repository secrets
8. [Migrations](./08-migrations.md) - Run database migrations
9. [Verification](./09-verification.md) - Verify deployments

## Environment Variables

The application requires these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment name | `development` / `production` |
| `PORT` | Application port | `8080` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `AWS_REGION` | AWS region for Cognito | `us-east-1` |
| `AWS_COGNITO_USER_POOL_ID` | Cognito User Pool ID | `us-east-1_xxxxxxxx` |
| `AWS_COGNITO_CLIENT_ID` | Cognito App Client ID | `xxxxxxxxxxxxxxxxx` |
| `AWS_S3_REGION` | AWS region for S3 | `us-east-1` |
| `AWS_S3_BUCKET` | S3 bucket name | `mekapal-uploads-dev` |
| `AWS_ACCESS_KEY_ID` | IAM access key for app | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key for app | `xxx...` |
| `AWS_SES_REGION` | AWS region for SES | `us-east-1` |
| `AWS_SES_FROM_EMAIL` | Verified SES email | `noreply@domain.com` |

## Estimated Costs (Monthly)

### Development Environment
- App Runner (0.25 vCPU, 0.5 GB): ~$5-15
- RDS (db.t3.micro): ~$15-20
- S3: ~$1-5
- Cognito: Free tier (50,000 MAU)
- **Total**: ~$20-40/month

### Production Environment
- App Runner (0.5 vCPU, 1 GB): ~$15-30
- RDS (db.t3.small): ~$25-35
- S3: ~$5-10
- Cognito: Free tier or ~$0.0055/MAU
- **Total**: ~$45-80/month

## Quick Reference

### AWS CLI Configuration
```bash
aws configure
# AWS Access Key ID: [Your access key]
# AWS Secret Access Key: [Your secret key]
# Default region name: us-east-1
# Default output format: json
```

### Useful Commands
```bash
# Check App Runner service status
aws apprunner describe-service --service-arn <service-arn>

# View App Runner logs
aws logs tail /aws/apprunner/mekapal-api-dev/service --follow

# Connect to RDS (requires psql)
psql -h <rds-endpoint> -U postgres -d mekapal
```
