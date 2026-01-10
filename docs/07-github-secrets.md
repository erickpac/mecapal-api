# GitHub Secrets Setup

Configure GitHub repository secrets for CI/CD deployments.

## Overview

Los GitHub Actions workflows usan dos tipos de secrets:

1. **Repository Secrets** - Compartidos entre todos los environments (credenciales CI/CD)
2. **Environment Secrets** - Específicos por environment (dev/prod tienen valores diferentes)

> **Nota:** El workflow detecta automáticamente si el servicio App Runner existe. Si no existe, lo crea; si existe, lo actualiza. No necesitas configurar el ARN del servicio.

## 1. Access Repository Settings

1. Go to your GitHub repository
2. Click **Settings** tab
3. Navigate to **Secrets and variables → Actions**

## 2. Create Repository Secrets

Estos secrets son compartidos y usados por ambos workflows (dev y prod).

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
5. Add **environment secrets** (estos valores son específicos para DEV):

| Secret Name | Value | Example |
|-------------|-------|---------|
| `APP_RUNNER_ECR_ROLE_ARN` | ARN del rol ECR access | `arn:aws:iam::ACCOUNT:role/AppRunnerECRAccessRole` |
| `DATABASE_URL` | Connection string de RDS DEV | `postgresql://user:pass@mekapal-dev.xxx.rds.amazonaws.com:5432/mekapal` |
| `AWS_COGNITO_USER_POOL_ID` | User Pool ID DEV | `us-east-1_xxxxxxx` |
| `AWS_COGNITO_CLIENT_ID` | App Client ID DEV | `xxxxxxxxxxxxxxxxx` |
| `AWS_S3_BUCKET` | Bucket name DEV | `mekapal-uploads-dev` |
| `APP_AWS_ACCESS_KEY_ID` | Access key del usuario `mekapal-app` | `AKIA...` |
| `APP_AWS_SECRET_ACCESS_KEY` | Secret key del usuario `mekapal-app` | `xxx...` |

6. **Deployment branches**:
   - Selected branches → Add `develop`

### Production Environment

1. Click **New environment**
2. Name: `production`
3. Click **Configure environment**
4. Add **environment secrets** (estos valores son específicos para PROD):

| Secret Name | Value | Example |
|-------------|-------|---------|
| `APP_RUNNER_ECR_ROLE_ARN` | ARN del rol ECR access | `arn:aws:iam::ACCOUNT:role/AppRunnerECRAccessRole` |
| `DATABASE_URL` | Connection string de RDS PROD | `postgresql://user:pass@mekapal-prod.xxx.rds.amazonaws.com:5432/mekapal` |
| `AWS_COGNITO_USER_POOL_ID` | User Pool ID PROD | `us-east-1_yyyyyyy` |
| `AWS_COGNITO_CLIENT_ID` | App Client ID PROD | `yyyyyyyyyyyyyyyyy` |
| `AWS_S3_BUCKET` | Bucket name PROD | `mekapal-uploads-prod` |
| `APP_AWS_ACCESS_KEY_ID` | Access key del usuario `mekapal-app` | `AKIA...` |
| `APP_AWS_SECRET_ACCESS_KEY` | Secret key del usuario `mekapal-app` | `xxx...` |

5. **Environment protection rules** (Recommended):
   - Required reviewers: Add yourself or team members
   - This requires manual approval before production deploys

6. **Deployment branches**:
   - Selected branches → Add `main`

## 4. How Environment Secrets Work

Los workflows especifican qué environment usar:

```yaml
# deploy-dev.yml
jobs:
  deploy:
    environment: development  # ← Usa secrets de "development"
```

```yaml
# deploy-prod.yml
jobs:
  deploy:
    environment: production  # ← Usa secrets de "production"
```

Cuando el workflow accede a `${{ secrets.DATABASE_URL }}`:
- En `development` environment → Usa el `DATABASE_URL` de dev
- En `production` environment → Usa el `DATABASE_URL` de prod

**Mismo nombre, diferentes valores por environment.**

## 5. How the Workflow Works

El workflow maneja automáticamente la creación y actualización del servicio:

```
1. Build & Push Docker image to ECR
2. Check if App Runner service exists
   ├── If NOT exists → Create new service
   └── If exists → Update existing service
3. Wait for deployment to complete
4. Print service URL
```

**No necesitas crear el servicio manualmente.** El primer push a `develop` o `main` creará el servicio automáticamente.

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

Estos son los access keys del usuario IAM `mekapal-app` (no el CI/CD user).

```bash
# List access keys for mekapal-app user
aws iam list-access-keys --user-name mekapal-app
```

Si necesitas crear nuevas keys:
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

Los workflows utilizan una arquitectura DRY con un workflow reutilizable:

### `.github/workflows/_deploy-apprunner.yml` (Reusable Workflow)
- Contiene toda la lógica de deployment
- Recibe inputs: `environment`, `service_name`, `ecr_repository`, `node_env`
- Features:
  - Docker layer caching para builds rápidos
  - Concurrency control (previene deploys paralelos)
  - GitHub Job Summary con detalles del deployment
  - Manejo automático de create vs update del servicio

### `.github/workflows/deploy-dev.yml`
- Triggers on push to `develop`
- Llama al reusable workflow con configuración de desarrollo
- Service: `mekapal-api-dev`

### `.github/workflows/deploy-prod.yml`
- Triggers on push to `main`
- Llama al reusable workflow con configuración de producción
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

### "Service creation failed"

- Check that all environment secrets are configured
- Verify DATABASE_URL is correct and RDS is accessible
- Check CloudWatch logs for the App Runner service

### First deployment takes too long

- First deployment creates the service (~5-10 minutes)
- Subsequent deployments are faster (~2-5 minutes)

## Next Step

Continue to [Migrations](./08-migrations.md)
