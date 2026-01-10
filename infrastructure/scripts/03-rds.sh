#!/bin/bash

# =============================================================================
# RDS Setup Script
# =============================================================================
# Creates RDS PostgreSQL database for the application
# =============================================================================

set -e

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/00-config.sh"

echo ""
echo "🗄️  Setting up RDS PostgreSQL..."
echo "========================================="

# -----------------------------------------------------------------------------
# Check for password
# -----------------------------------------------------------------------------
if [ -z "$RDS_MASTER_PASSWORD" ]; then
    echo ""
    echo "⚠️  RDS_MASTER_PASSWORD is not set!"
    echo "   Please set it before running this script:"
    echo ""
    echo "   export RDS_MASTER_PASSWORD='YourSecurePassword123!'"
    echo ""
    exit 1
fi

# -----------------------------------------------------------------------------
# Create Security Group
# -----------------------------------------------------------------------------
echo ""
echo "1️⃣  Creating security group..."

SG_RESULT=$(aws ec2 create-security-group \
  --group-name ${APP_NAME}-rds-sg-${ENVIRONMENT} \
  --description "Security group for ${APP_NAME} RDS ${ENVIRONMENT}" \
  --region $AWS_REGION \
  --output json)

SG_ID=$(echo $SG_RESULT | grep -o '"GroupId": "[^"]*"' | cut -d'"' -f4)
check_result "Created security group: $SG_ID"

echo "   Security Group ID: $SG_ID"

# -----------------------------------------------------------------------------
# Add Inbound Rule for PostgreSQL
# -----------------------------------------------------------------------------
echo ""
echo "2️⃣  Adding inbound rule for PostgreSQL (port 5432)..."

aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 5432 \
  --cidr 0.0.0.0/0 \
  --region $AWS_REGION
check_result "Added inbound rule"

# -----------------------------------------------------------------------------
# Create RDS Instance
# -----------------------------------------------------------------------------
echo ""
echo "3️⃣  Creating RDS instance: $RDS_INSTANCE_ID"
echo "   This will take 5-10 minutes..."

aws rds create-db-instance \
  --db-instance-identifier $RDS_INSTANCE_ID \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.4 \
  --master-username $RDS_MASTER_USERNAME \
  --master-user-password "$RDS_MASTER_PASSWORD" \
  --allocated-storage 20 \
  --storage-type gp2 \
  --db-name $RDS_DB_NAME \
  --vpc-security-group-ids $SG_ID \
  --publicly-accessible \
  --backup-retention-period 0 \
  --no-multi-az \
  --region $AWS_REGION
check_result "Created RDS instance"

# -----------------------------------------------------------------------------
# Wait for RDS to be available
# -----------------------------------------------------------------------------
echo ""
echo "4️⃣  Waiting for RDS to be available..."
echo "   (This can take 5-10 minutes)"

aws rds wait db-instance-available \
  --db-instance-identifier $RDS_INSTANCE_ID \
  --region $AWS_REGION
check_result "RDS instance is available"

# -----------------------------------------------------------------------------
# Get RDS Endpoint
# -----------------------------------------------------------------------------
echo ""
echo "5️⃣  Getting RDS endpoint..."

RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier $RDS_INSTANCE_ID \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text \
  --region $AWS_REGION)
check_result "Retrieved RDS endpoint"

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
echo ""
echo "========================================="
echo "✅ RDS Setup Complete!"
echo "========================================="
echo ""
echo "Connection details:"
echo "  Host: $RDS_ENDPOINT"
echo "  Port: 5432"
echo "  Database: $RDS_DB_NAME"
echo "  Username: $RDS_MASTER_USERNAME"
echo ""
echo "DATABASE_URL:"
echo "  postgresql://$RDS_MASTER_USERNAME:YOUR_PASSWORD@$RDS_ENDPOINT:5432/$RDS_DB_NAME"
echo ""
echo "⚠️  Save this connection string for App Runner configuration!"
echo ""
