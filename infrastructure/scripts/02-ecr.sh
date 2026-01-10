#!/bin/bash

# =============================================================================
# ECR Setup Script
# =============================================================================
# Creates ECR repository and pushes initial image
# =============================================================================

set -e

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/00-config.sh"

PROJECT_ROOT="$SCRIPT_DIR/../.."

echo ""
echo "📦 Setting up ECR repository..."
echo "========================================="

# -----------------------------------------------------------------------------
# Create ECR Repository
# -----------------------------------------------------------------------------
echo ""
echo "1️⃣  Creating ECR repository: $ECR_REPO_NAME"

aws ecr create-repository \
  --repository-name $ECR_REPO_NAME \
  --region $AWS_REGION \
  --image-scanning-configuration scanOnPush=true
check_result "Created ECR repository $ECR_REPO_NAME"

# -----------------------------------------------------------------------------
# Login to ECR
# -----------------------------------------------------------------------------
echo ""
echo "2️⃣  Logging in to ECR..."

aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
check_result "Logged in to ECR"

# -----------------------------------------------------------------------------
# Build and Push Image
# -----------------------------------------------------------------------------
echo ""
echo "3️⃣  Building Docker image..."

cd $PROJECT_ROOT
docker build -t $ECR_REPO_NAME .
check_result "Built Docker image"

echo ""
echo "4️⃣  Tagging image..."

docker tag $ECR_REPO_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest
check_result "Tagged image"

echo ""
echo "5️⃣  Pushing image to ECR..."

docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest
check_result "Pushed image to ECR"

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
echo ""
echo "========================================="
echo "✅ ECR Setup Complete!"
echo "========================================="
echo ""
echo "Repository URI:"
echo "  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME"
echo ""
echo "Image URI:"
echo "  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest"
echo ""
