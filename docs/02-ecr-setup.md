# ECR Setup

Amazon Elastic Container Registry (ECR) stores Docker images for App Runner deployments.

## Overview

Create two repositories:
- `mekapal-api-dev` - Development environment images
- `mekapal-api-prod` - Production environment images

## 1. Create Repositories

### Development Repository

```bash
aws ecr create-repository \
  --repository-name mekapal-api-dev \
  --region us-east-1 \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256
```

### Production Repository

```bash
aws ecr create-repository \
  --repository-name mekapal-api-prod \
  --region us-east-1 \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256
```

## 2. Configure Lifecycle Policy (Optional)

To automatically clean up old images and save costs, apply a lifecycle policy.

Create a file named `ecr-lifecycle-policy.json`:

```json
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 10 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
```

Apply to both repositories:

```bash
# Development
aws ecr put-lifecycle-policy \
  --repository-name mekapal-api-dev \
  --lifecycle-policy-text file://ecr-lifecycle-policy.json

# Production
aws ecr put-lifecycle-policy \
  --repository-name mekapal-api-prod \
  --lifecycle-policy-text file://ecr-lifecycle-policy.json
```

## 3. Push Initial Image

Before creating App Runner services, you need at least one image in ECR.

### Get your AWS Account ID

```bash
aws sts get-caller-identity --query Account --output text
```

### Login to ECR

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
```

### Build and Push Image

```bash
# Build the image
docker build -t mekapal-api-dev .

# Tag for ECR
docker tag mekapal-api-dev:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/mekapal-api-dev:latest

# Push to ECR
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/mekapal-api-dev:latest
```

Repeat for production when ready:

```bash
docker build -t mekapal-api-prod .
docker tag mekapal-api-prod:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/mekapal-api-prod:latest
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/mekapal-api-prod:latest
```

## 4. Verify

```bash
# List repositories
aws ecr describe-repositories

# List images in repository
aws ecr list-images --repository-name mekapal-api-dev
```

## Repository URIs

Save these URIs for later:

| Environment | Repository URI |
|-------------|----------------|
| Development | `<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/mekapal-api-dev` |
| Production | `<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/mekapal-api-prod` |

## Next Step

Continue to [RDS Setup](./03-rds-setup.md)
