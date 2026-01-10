#!/bin/bash

# =============================================================================
# Mekapal Infrastructure Configuration
# =============================================================================
# Edit these values before running the scripts
# =============================================================================

# AWS Configuration
export AWS_REGION="us-east-1"
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Environment (dev or prod)
export ENVIRONMENT="dev"

# Application name
export APP_NAME="mekapal"

# Resource naming
export ECR_REPO_NAME="${APP_NAME}-api-${ENVIRONMENT}"
export RDS_INSTANCE_ID="${APP_NAME}-${ENVIRONMENT}"
export RDS_DB_NAME="mekapal"
export S3_BUCKET_NAME="${APP_NAME}-uploads-${ENVIRONMENT}"
export COGNITO_POOL_NAME="${APP_NAME}-${ENVIRONMENT}-pool"
export APP_RUNNER_SERVICE_NAME="${APP_NAME}-api-${ENVIRONMENT}"

# RDS Configuration
export RDS_MASTER_USERNAME="postgres"
export RDS_MASTER_PASSWORD=""  # Set this before running 03-rds.sh

# IAM Users
export IAM_CI_CD_USER="${APP_NAME}-ci-cd"
export IAM_APP_USER="${APP_NAME}-app"

# =============================================================================
# Helper function to check if a command succeeded
# =============================================================================
check_result() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
    else
        echo "❌ $1 failed"
        exit 1
    fi
}

# =============================================================================
# Helper function to wait for user confirmation
# =============================================================================
confirm() {
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

echo "📋 Configuration loaded:"
echo "   AWS Region: $AWS_REGION"
echo "   AWS Account: $AWS_ACCOUNT_ID"
echo "   Environment: $ENVIRONMENT"
echo "   App Name: $APP_NAME"
