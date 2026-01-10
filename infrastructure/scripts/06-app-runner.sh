#!/bin/bash

# =============================================================================
# App Runner Setup Script
# =============================================================================
# Creates App Runner service to host the API
# =============================================================================

set -e

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/00-config.sh"

echo ""
echo "🚀 Setting up App Runner..."
echo "========================================="

# -----------------------------------------------------------------------------
# Required environment variables check
# -----------------------------------------------------------------------------
echo ""
echo "Checking required environment variables..."

REQUIRED_VARS=(
    "DATABASE_URL"
    "AWS_COGNITO_USER_POOL_ID"
    "AWS_COGNITO_CLIENT_ID"
    "AWS_S3_BUCKET"
    "APP_AWS_ACCESS_KEY_ID"
    "APP_AWS_SECRET_ACCESS_KEY"
)

MISSING_VARS=()
for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        MISSING_VARS+=($VAR)
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo ""
    echo "⚠️  Missing required environment variables:"
    for VAR in "${MISSING_VARS[@]}"; do
        echo "   - $VAR"
    done
    echo ""
    echo "Please set them before running this script:"
    echo ""
    echo "export DATABASE_URL='postgresql://user:pass@host:5432/db'"
    echo "export AWS_COGNITO_USER_POOL_ID='us-east-1_xxxxxxx'"
    echo "export AWS_COGNITO_CLIENT_ID='xxxxxxxxxxxxxxxxx'"
    echo "export AWS_S3_BUCKET='mekapal-uploads-dev'"
    echo "export APP_AWS_ACCESS_KEY_ID='AKIA...' # From mekapal-app user"
    echo "export APP_AWS_SECRET_ACCESS_KEY='xxx...' # From mekapal-app user"
    echo ""
    exit 1
fi

echo "✅ All required variables are set"

# -----------------------------------------------------------------------------
# Create ECR Access Role for App Runner
# -----------------------------------------------------------------------------
echo ""
echo "1️⃣  Creating ECR Access Role for App Runner..."

# Check if role exists
ROLE_EXISTS=$(aws iam get-role --role-name AppRunnerECRAccessRole 2>/dev/null || echo "not found")

if [[ "$ROLE_EXISTS" == "not found" ]]; then
    # Create trust policy
    cat > /tmp/apprunner-trust-policy.json << 'EOF'
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

    aws iam create-role \
      --role-name AppRunnerECRAccessRole \
      --assume-role-policy-document file:///tmp/apprunner-trust-policy.json

    aws iam attach-role-policy \
      --role-name AppRunnerECRAccessRole \
      --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess

    check_result "Created ECR Access Role"
else
    echo "   Role already exists, skipping..."
fi

# Get role ARN
ECR_ROLE_ARN=$(aws iam get-role --role-name AppRunnerECRAccessRole --query 'Role.Arn' --output text)
echo "   Role ARN: $ECR_ROLE_ARN"

# -----------------------------------------------------------------------------
# Create App Runner Service
# -----------------------------------------------------------------------------
echo ""
echo "2️⃣  Creating App Runner service: $APP_RUNNER_SERVICE_NAME"
echo "   This may take a few minutes..."

IMAGE_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest"

SERVICE_RESULT=$(aws apprunner create-service \
  --service-name $APP_RUNNER_SERVICE_NAME \
  --source-configuration "{
    \"ImageRepository\": {
      \"ImageIdentifier\": \"$IMAGE_URI\",
      \"ImageRepositoryType\": \"ECR\",
      \"ImageConfiguration\": {
        \"Port\": \"8080\",
        \"RuntimeEnvironmentVariables\": {
          \"NODE_ENV\": \"$ENVIRONMENT\",
          \"PORT\": \"8080\",
          \"DATABASE_URL\": \"$DATABASE_URL\",
          \"AWS_REGION\": \"$AWS_REGION\",
          \"AWS_COGNITO_USER_POOL_ID\": \"$AWS_COGNITO_USER_POOL_ID\",
          \"AWS_COGNITO_CLIENT_ID\": \"$AWS_COGNITO_CLIENT_ID\",
          \"AWS_S3_REGION\": \"$AWS_REGION\",
          \"AWS_S3_BUCKET\": \"$AWS_S3_BUCKET\",
          \"AWS_ACCESS_KEY_ID\": \"$APP_AWS_ACCESS_KEY_ID\",
          \"AWS_SECRET_ACCESS_KEY\": \"$APP_AWS_SECRET_ACCESS_KEY\"
        }
      }
    },
    \"AutoDeploymentsEnabled\": false,
    \"AuthenticationConfiguration\": {
      \"AccessRoleArn\": \"$ECR_ROLE_ARN\"
    }
  }" \
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
  }' \
  --region $AWS_REGION \
  --output json)

SERVICE_ARN=$(echo $SERVICE_RESULT | grep -o '"ServiceArn": "[^"]*"' | cut -d'"' -f4)
SERVICE_URL=$(echo $SERVICE_RESULT | grep -o '"ServiceUrl": "[^"]*"' | cut -d'"' -f4)

check_result "Created App Runner service"

echo ""
echo "   Service ARN: $SERVICE_ARN"
echo "   Waiting for service to be running..."

# -----------------------------------------------------------------------------
# Wait for Service to be Running
# -----------------------------------------------------------------------------
echo ""
echo "3️⃣  Waiting for service to be running..."
echo "   (This can take 5-10 minutes)"

aws apprunner wait service-running \
  --service-arn $SERVICE_ARN \
  --region $AWS_REGION
check_result "Service is running"

# Get final service URL
SERVICE_URL=$(aws apprunner describe-service \
  --service-arn $SERVICE_ARN \
  --query 'Service.ServiceUrl' \
  --output text \
  --region $AWS_REGION)

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
echo ""
echo "========================================="
echo "✅ App Runner Setup Complete!"
echo "========================================="
echo ""
echo "Service URL: https://$SERVICE_URL"
echo "Service ARN: $SERVICE_ARN"
echo ""
echo "Test the health endpoint:"
echo "  curl https://$SERVICE_URL/api/health"
echo ""
echo "⚠️  Save the Service ARN for GitHub Secrets:"
echo "    APP_RUNNER_SERVICE_ARN_DEV=$SERVICE_ARN"
echo ""

# Save to temp file for reference
echo "SERVICE_URL=https://$SERVICE_URL" > /tmp/apprunner-${ENVIRONMENT}-config.txt
echo "SERVICE_ARN=$SERVICE_ARN" >> /tmp/apprunner-${ENVIRONMENT}-config.txt
echo ""
echo "Configuration saved to: /tmp/apprunner-${ENVIRONMENT}-config.txt"
echo ""
