#!/bin/bash

# =============================================================================
# Cognito Setup Script
# =============================================================================
# Creates Cognito User Pool for authentication
# =============================================================================

set -e

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/00-config.sh"

echo ""
echo "🔑 Setting up Cognito User Pool..."
echo "========================================="

# -----------------------------------------------------------------------------
# Create User Pool
# -----------------------------------------------------------------------------
echo ""
echo "1️⃣  Creating User Pool: $COGNITO_POOL_NAME"

POOL_RESULT=$(aws cognito-idp create-user-pool \
  --pool-name $COGNITO_POOL_NAME \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": true,
      "TemporaryPasswordValidityDays": 7
    }
  }' \
  --auto-verified-attributes email \
  --username-attributes email \
  --username-configuration '{"CaseSensitive": false}' \
  --account-recovery-setting '{
    "RecoveryMechanisms": [
      {"Priority": 1, "Name": "verified_email"}
    ]
  }' \
  --admin-create-user-config '{
    "AllowAdminCreateUserOnly": false
  }' \
  --schema '[
    {
      "Name": "email",
      "Required": true,
      "Mutable": true
    }
  ]' \
  --region $AWS_REGION \
  --output json)

USER_POOL_ID=$(echo $POOL_RESULT | grep -o '"Id": "[^"]*"' | head -1 | cut -d'"' -f4)
check_result "Created User Pool: $USER_POOL_ID"

# -----------------------------------------------------------------------------
# Create App Client
# -----------------------------------------------------------------------------
echo ""
echo "2️⃣  Creating App Client..."

CLIENT_RESULT=$(aws cognito-idp create-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-name "${APP_NAME}-api" \
  --no-generate-secret \
  --explicit-auth-flows \
    "ALLOW_USER_PASSWORD_AUTH" \
    "ALLOW_ADMIN_USER_PASSWORD_AUTH" \
    "ALLOW_REFRESH_TOKEN_AUTH" \
  --access-token-validity 1 \
  --id-token-validity 1 \
  --refresh-token-validity 30 \
  --token-validity-units '{
    "AccessToken": "hours",
    "IdToken": "hours",
    "RefreshToken": "days"
  }' \
  --prevent-user-existence-errors ENABLED \
  --region $AWS_REGION \
  --output json)

CLIENT_ID=$(echo $CLIENT_RESULT | grep -o '"ClientId": "[^"]*"' | cut -d'"' -f4)
check_result "Created App Client: $CLIENT_ID"

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
echo ""
echo "========================================="
echo "✅ Cognito Setup Complete!"
echo "========================================="
echo ""
echo "User Pool ID: $USER_POOL_ID"
echo "Client ID: $CLIENT_ID"
echo ""
echo "Environment variables for App Runner:"
echo "  AWS_REGION=$AWS_REGION"
echo "  AWS_COGNITO_USER_POOL_ID=$USER_POOL_ID"
echo "  AWS_COGNITO_CLIENT_ID=$CLIENT_ID"
echo ""
echo "⚠️  Save these values for App Runner configuration!"
echo ""

# Save to temp file for reference
echo "USER_POOL_ID=$USER_POOL_ID" > /tmp/cognito-${ENVIRONMENT}-config.txt
echo "CLIENT_ID=$CLIENT_ID" >> /tmp/cognito-${ENVIRONMENT}-config.txt
echo ""
echo "Configuration saved to: /tmp/cognito-${ENVIRONMENT}-config.txt"
echo ""
