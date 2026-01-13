# GitHub Secrets Setup

Configure GitHub repository secrets for CI/CD deployments.

## Overview

GitHub Actions workflows use two types of secrets:

1. **Repository Secrets** - Shared between all environments (CI/CD credentials)
2. **Environment Secrets** - Specific per environment (dev/prod have different values)

> **Important:** The workflow **only updates** existing App Runner services. Services must be created beforehand using infrastructure scripts (`infrastructure/scripts/06-app-runner.sh`) or manually via AWS Console.

## 1. Access Repository Settings

1. Go to your GitHub repository
2. Click **Settings** tab
3. Navigate to **Secrets and variables → Actions**

## 2. Create Repository Secrets

These secrets are shared and used by both workflows (dev and prod).

Click **New repository secret** and add:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AWS_ACCESS_KEY_ID` | `AKIA...` | From `mekapal-ci-cd` IAM user |
| `AWS_SECRET_ACCESS_KEY` | `xxx...` | From `mekapal-ci-cd` IAM user |

## 3. Create Environments with Secrets

### Development Environment

1. Go to **Settings → Environments**
2. Click **New environment**
3. Name: `development`
4. Click **Configure environment**
5. Add **environment secrets** (these values are specific to DEV):

| Secret Name | Value | Example |
|-------------|-------|---------|
| `APP_RUNNER_ECR_ROLE_ARN` | ECR access role ARN | `arn:aws:iam::ACCOUNT:role/AppRunnerECRAccessRole` |
| `DATABASE_URL` | DEV RDS connection string | `postgresql://user:pass@mekapal-dev.xxx.rds.amazonaws.com:5432/mekapal` |
| `AWS_COGNITO_USER_POOL_ID` | DEV User Pool ID | `us-east-1_xxxxxxx` |
| `AWS_COGNITO_CLIENT_ID` | DEV App Client ID | `xxxxxxxxxxxxxxxxx` |
| `AWS_S3_BUCKET` | DEV bucket name | `mekapal-uploads-dev` |
| `APP_AWS_ACCESS_KEY_ID` | Access key from `mekapal-app` user | `AKIA...` |
| `APP_AWS_SECRET_ACCESS_KEY` | Secret key from `mekapal-app` user | `xxx...` |

6. **Deployment branches**:
   - Selected branches → Add `develop`

### Production Environment

1. Click **New environment**
2. Name: `production`
3. Click **Configure environment**
4. Add **environment secrets** (these values are specific to PROD):

| Secret Name | Value | Example |
|-------------|-------|---------|
| `APP_RUNNER_ECR_ROLE_ARN` | ECR access role ARN | `arn:aws:iam::ACCOUNT:role/AppRunnerECRAccessRole` |
| `DATABASE_URL` | PROD RDS connection string | `postgresql://user:pass@mekapal-prod.xxx.rds.amazonaws.com:5432/mekapal` |
| `AWS_COGNITO_USER_POOL_ID` | PROD User Pool ID | `us-east-1_yyyyyyy` |
| `AWS_COGNITO_CLIENT_ID` | PROD App Client ID | `yyyyyyyyyyyyyyyyy` |
| `AWS_S3_BUCKET` | PROD bucket name | `mekapal-uploads-prod` |
| `APP_AWS_ACCESS_KEY_ID` | Access key from `mekapal-app` user | `AKIA...` |
| `APP_AWS_SECRET_ACCESS_KEY` | Secret key from `mekapal-app` user | `xxx...` |

5. **Environment protection rules** (Recommended):
   - Required reviewers: Add yourself or team members
   - This requires manual approval before production deploys

6. **Deployment branches**:
   - Selected branches → Add `main`

## 4. How Environment Secrets Work

Workflows specify which environment to use:

```yaml
# deploy-dev.yml
jobs:
  deploy:
    environment: development  # ← Uses secrets from "development"
```

```yaml
# deploy-prod.yml
jobs:
  deploy:
    environment: production  # ← Uses secrets from "production"
```

When the workflow accesses `${{ secrets.DATABASE_URL }}`:
- In `development` environment → Uses the DEV `DATABASE_URL`
- In `production` environment → Uses the PROD `DATABASE_URL`

**Same name, different values per environment.**

## 5. How the Workflow Works

The workflow only updates existing services:

```
1. Run database migrations (Prisma)
2. Build & Push Docker image to ECR
3. Find existing App Runner service
   └── If NOT exists → Fail with error message
4. Update App Runner service with new image
5. Wait for deployment to complete
6. Print service URL
```

**Prerequisite:** The App Runner service must exist before the first deploy. Use infrastructure scripts or AWS Console to create it.

## 6. Get Values for Secrets

### App Runner ECR Role ARN

```bash
aws iam get-role --role-name AppRunnerECRAccessRole \
  --query 'Role.Arn' --output text
```

### Database URL

```bash
# Get RDS endpoint
aws rds describe-db-instances \
  --db-instance-identifier mekapal-dev \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text

# Format: postgresql://USER:PASSWORD@ENDPOINT:5432/DATABASE
```

### Cognito IDs

```bash
# User Pool ID
aws cognito-idp list-user-pools --max-results 10 \
  --query "UserPools[?Name=='mekapal-dev-pool'].Id" \
  --output text

# Client ID
aws cognito-idp list-user-pool-clients \
  --user-pool-id YOUR_POOL_ID \
  --query 'UserPoolClients[0].ClientId' \
  --output text
```

### App User Credentials

These are the access keys from the IAM user `mekapal-app` (not the CI/CD user).

```bash
# List access keys for mekapal-app user
aws iam list-access-keys --user-name mekapal-app
```

If you need to create new keys:
```bash
aws iam create-access-key --user-name mekapal-app
```

## 7. Verify Configuration

### Check Secrets in GitHub

In **Settings → Secrets and variables → Actions**, you should see:

**Repository secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

**Environment: development** (7 secrets):
- `APP_RUNNER_ECR_ROLE_ARN`
- `DATABASE_URL`
- `AWS_COGNITO_USER_POOL_ID`
- `AWS_COGNITO_CLIENT_ID`
- `AWS_S3_BUCKET`
- `APP_AWS_ACCESS_KEY_ID`
- `APP_AWS_SECRET_ACCESS_KEY`

**Environment: production** (7 secrets):
- Same secret names, different values

### Test Workflow

1. Push a commit to `develop` branch
2. Go to **Actions** tab
3. Watch the "Deploy to Development" workflow run
4. Verify it completes successfully

## 8. Workflow Files Reference

Workflows use a DRY architecture with a reusable workflow:

### `.github/workflows/_deploy-apprunner.yml` (Reusable Workflow)
- Contains all deployment logic
- Receives inputs: `environment`, `service_name`, `ecr_repository`, `node_env`
- Features:
  - Automatic Prisma migrations
  - Docker layer caching for fast builds
  - Concurrency control (prevents parallel deploys)
  - GitHub Job Summary with deployment details
  - Fails early if service doesn't exist

### `.github/workflows/deploy-dev.yml`
- Triggers on push to `develop`
- Calls the reusable workflow with development configuration
- Service: `mekapal-api-dev`

### `.github/workflows/deploy-prod.yml`
- Triggers on push to `main`
- Calls the reusable workflow with production configuration
- Requires approval (if protection rules enabled)
- Service: `mekapal-api-prod`

## 9. Branch Protection (Recommended)

### Develop Branch

1. Go to **Settings → Branches**
2. Click **Add rule**
3. Branch name pattern: `develop`
4. Enable:
   - Require a pull request before merging
   - Require status checks to pass
   - Select: `build-test-quality` (from CI workflow)

### Main Branch

1. Add another rule for `main`
2. Enable:
   - Require a pull request before merging
   - Require approvals (1 or more)
   - Require status checks to pass
   - Require branches to be up to date

## Summary

```
Repository Secrets (shared):
├── AWS_ACCESS_KEY_ID        → CI/CD user credentials
└── AWS_SECRET_ACCESS_KEY

Environment: development (7 secrets)
├── APP_RUNNER_ECR_ROLE_ARN  → ECR access role
├── DATABASE_URL             → DEV database
├── AWS_COGNITO_USER_POOL_ID → DEV Cognito Pool
├── AWS_COGNITO_CLIENT_ID    → DEV Cognito Client
├── AWS_S3_BUCKET            → DEV bucket
├── APP_AWS_ACCESS_KEY_ID    → App user key
└── APP_AWS_SECRET_ACCESS_KEY→ App user secret

Environment: production (7 secrets)
├── APP_RUNNER_ECR_ROLE_ARN  → ECR access role
├── DATABASE_URL             → PROD database
├── AWS_COGNITO_USER_POOL_ID → PROD Cognito Pool
├── AWS_COGNITO_CLIENT_ID    → PROD Cognito Client
├── AWS_S3_BUCKET            → PROD bucket
├── APP_AWS_ACCESS_KEY_ID    → App user key
└── APP_AWS_SECRET_ACCESS_KEY→ App user secret
```

## Troubleshooting

### "Resource not accessible by integration"

- Ensure the IAM user has correct permissions
- Check that `APP_RUNNER_ECR_ROLE_ARN` is correct

### "Invalid credentials"

- Double-check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
- Ensure they're from the `mekapal-ci-cd` user

### Workflow doesn't trigger

- Verify the branch name matches the workflow trigger
- Check that the workflow file is in `.github/workflows/`

### "App Runner service not found"

- The service must exist before running the workflow
- Create the service using `infrastructure/scripts/06-app-runner.sh`
- Or create it manually via AWS Console ([see docs](./06-app-runner-setup.md))

### Deployment takes too long

- Deployments typically take ~2-5 minutes
- Health check may add extra time if the app takes longer to start

## Next Step

Continue to [Migrations](./08-migrations.md)
