# Mekapal Infrastructure Scripts

Scripts to set up AWS infrastructure for the Mekapal API.

## Structure

```
infrastructure/
├── README.md
├── policies/
│   ├── ci-cd-policy.json    # IAM policy for GitHub Actions
│   └── app-policy.json      # IAM policy for application
└── scripts/
    ├── 00-config.sh         # Configuration variables
    ├── 01-iam.sh            # IAM users setup
    ├── 02-ecr.sh            # ECR repository setup
    ├── 03-rds.sh            # RDS PostgreSQL setup
    ├── 04-s3.sh             # S3 bucket setup
    ├── 05-cognito.sh        # Cognito user pool setup
    └── 06-app-runner.sh     # App Runner service setup
```

## Prerequisites

- AWS CLI installed and configured
- Docker installed and running
- Sufficient AWS permissions to create resources

## Usage

### Option 1: Run scripts individually

```bash
cd infrastructure/scripts

# 1. Edit configuration
nano 00-config.sh

# 2. Run each script in order
./01-iam.sh
./02-ecr.sh

export RDS_MASTER_PASSWORD='YourSecurePassword123!'
./03-rds.sh

./04-s3.sh
./05-cognito.sh

# 6. Set required variables for App Runner
export DATABASE_URL='postgresql://postgres:password@host:5432/mekapal'
export AWS_COGNITO_USER_POOL_ID='us-east-1_xxxxxxx'
export AWS_COGNITO_CLIENT_ID='xxxxxxxxxxxxxxxxx'
export AWS_S3_BUCKET='mekapal-uploads-dev'
export APP_AWS_ACCESS_KEY_ID='AKIA...'
export APP_AWS_SECRET_ACCESS_KEY='xxx...'
./06-app-runner.sh
```

### Option 2: Run all at once (after configuration)

```bash
cd infrastructure/scripts
chmod +x *.sh

# Set all required variables
export RDS_MASTER_PASSWORD='YourSecurePassword123!'
export DATABASE_URL='...'  # After RDS is created
export AWS_COGNITO_USER_POOL_ID='...'  # After Cognito is created
export AWS_COGNITO_CLIENT_ID='...'
export AWS_S3_BUCKET='mekapal-uploads-dev'
export APP_AWS_ACCESS_KEY_ID='...'
export APP_AWS_SECRET_ACCESS_KEY='...'

# Run scripts
./01-iam.sh && ./02-ecr.sh && ./03-rds.sh && ./04-s3.sh && ./05-cognito.sh && ./06-app-runner.sh
```

## Configuration

Edit `scripts/00-config.sh` to customize:

- `AWS_REGION` - AWS region (default: us-east-1)
- `ENVIRONMENT` - Environment name (dev/prod)
- `APP_NAME` - Application name prefix

## Resources Created

### Development Environment

| Resource | Name |
|----------|------|
| IAM User (CI/CD) | mekapal-ci-cd |
| IAM User (App) | mekapal-app |
| ECR Repository | mekapal-api-dev |
| RDS Instance | mekapal-dev |
| S3 Bucket | mekapal-uploads-dev |
| Cognito Pool | mekapal-dev-pool |
| App Runner | mekapal-api-dev |

## Credentials

After running the scripts, credentials are saved to:

- `/tmp/mekapal-ci-cd-credentials.json` - CI/CD user credentials (for GitHub)
- `/tmp/mekapal-app-credentials.json` - App user credentials (for App Runner)
- `/tmp/cognito-dev-config.txt` - Cognito IDs
- `/tmp/apprunner-dev-config.txt` - App Runner URL and ARN

**Important**: Save these credentials securely and delete the temp files.

## Cleanup

To delete all resources (use with caution):

```bash
# App Runner
aws apprunner delete-service --service-arn <SERVICE_ARN>

# Cognito
aws cognito-idp delete-user-pool --user-pool-id <POOL_ID>

# S3 (must be empty first)
aws s3 rm s3://mekapal-uploads-dev --recursive
aws s3 rb s3://mekapal-uploads-dev

# RDS
aws rds delete-db-instance --db-instance-identifier mekapal-dev --skip-final-snapshot

# ECR
aws ecr delete-repository --repository-name mekapal-api-dev --force

# IAM
aws iam delete-user-policy --user-name mekapal-ci-cd --policy-name mekapal-ci-cd-policy
aws iam delete-access-key --user-name mekapal-ci-cd --access-key-id <KEY_ID>
aws iam delete-user --user-name mekapal-ci-cd

aws iam delete-user-policy --user-name mekapal-app --policy-name mekapal-app-policy
aws iam delete-access-key --user-name mekapal-app --access-key-id <KEY_ID>
aws iam delete-user --user-name mekapal-app
```
