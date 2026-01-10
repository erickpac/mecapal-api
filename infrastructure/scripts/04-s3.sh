#!/bin/bash

# =============================================================================
# S3 Setup Script
# =============================================================================
# Creates S3 bucket for file uploads
# =============================================================================

set -e

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/00-config.sh"

echo ""
echo "📁 Setting up S3 bucket..."
echo "========================================="

# -----------------------------------------------------------------------------
# Create S3 Bucket
# -----------------------------------------------------------------------------
echo ""
echo "1️⃣  Creating S3 bucket: $S3_BUCKET_NAME"

# Note: us-east-1 doesn't need LocationConstraint
if [ "$AWS_REGION" = "us-east-1" ]; then
    aws s3api create-bucket \
      --bucket $S3_BUCKET_NAME \
      --region $AWS_REGION
else
    aws s3api create-bucket \
      --bucket $S3_BUCKET_NAME \
      --region $AWS_REGION \
      --create-bucket-configuration LocationConstraint=$AWS_REGION
fi
check_result "Created S3 bucket"

# -----------------------------------------------------------------------------
# Configure CORS
# -----------------------------------------------------------------------------
echo ""
echo "2️⃣  Configuring CORS..."

aws s3api put-bucket-cors \
  --bucket $S3_BUCKET_NAME \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
        "MaxAgeSeconds": 3600
      }
    ]
  }'
check_result "Configured CORS"

# -----------------------------------------------------------------------------
# Block Public Access
# -----------------------------------------------------------------------------
echo ""
echo "3️⃣  Blocking public access (using presigned URLs)..."

aws s3api put-public-access-block \
  --bucket $S3_BUCKET_NAME \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
check_result "Blocked public access"

# -----------------------------------------------------------------------------
# Create folder structure
# -----------------------------------------------------------------------------
echo ""
echo "4️⃣  Creating folder structure..."

aws s3api put-object --bucket $S3_BUCKET_NAME --key vehicles/
aws s3api put-object --bucket $S3_BUCKET_NAME --key documents/
aws s3api put-object --bucket $S3_BUCKET_NAME --key profiles/
aws s3api put-object --bucket $S3_BUCKET_NAME --key temp/
check_result "Created folder structure"

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
echo ""
echo "========================================="
echo "✅ S3 Setup Complete!"
echo "========================================="
echo ""
echo "Bucket name: $S3_BUCKET_NAME"
echo "Region: $AWS_REGION"
echo ""
echo "Environment variables for App Runner:"
echo "  AWS_S3_BUCKET=$S3_BUCKET_NAME"
echo "  AWS_S3_REGION=$AWS_REGION"
echo ""
