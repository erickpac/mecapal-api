#!/bin/bash

# =============================================================================
# IAM Setup Script
# =============================================================================
# Creates IAM users and policies for CI/CD and application
# =============================================================================

set -e

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/00-config.sh"

POLICIES_DIR="$SCRIPT_DIR/../policies"

echo ""
echo "🔐 Setting up IAM users and policies..."
echo "========================================="

# -----------------------------------------------------------------------------
# Create CI/CD User
# -----------------------------------------------------------------------------
echo ""
echo "1️⃣  Creating CI/CD user: $IAM_CI_CD_USER"

aws iam create-user --user-name $IAM_CI_CD_USER
check_result "Created user $IAM_CI_CD_USER"

echo "   Attaching CI/CD policy..."
aws iam put-user-policy \
  --user-name $IAM_CI_CD_USER \
  --policy-name ${IAM_CI_CD_USER}-policy \
  --policy-document file://$POLICIES_DIR/ci-cd-policy.json
check_result "Attached policy to $IAM_CI_CD_USER"

echo "   Creating access keys..."
aws iam create-access-key --user-name $IAM_CI_CD_USER > /tmp/${IAM_CI_CD_USER}-credentials.json
check_result "Created access keys for $IAM_CI_CD_USER"

echo ""
echo "   ⚠️  CI/CD Credentials saved to: /tmp/${IAM_CI_CD_USER}-credentials.json"
echo "   ⚠️  SAVE THESE CREDENTIALS - You won't be able to see them again!"
cat /tmp/${IAM_CI_CD_USER}-credentials.json

# -----------------------------------------------------------------------------
# Create App User
# -----------------------------------------------------------------------------
echo ""
echo "2️⃣  Creating App user: $IAM_APP_USER"

aws iam create-user --user-name $IAM_APP_USER
check_result "Created user $IAM_APP_USER"

echo "   Attaching App policy..."
aws iam put-user-policy \
  --user-name $IAM_APP_USER \
  --policy-name ${IAM_APP_USER}-policy \
  --policy-document file://$POLICIES_DIR/app-policy.json
check_result "Attached policy to $IAM_APP_USER"

echo "   Creating access keys..."
aws iam create-access-key --user-name $IAM_APP_USER > /tmp/${IAM_APP_USER}-credentials.json
check_result "Created access keys for $IAM_APP_USER"

echo ""
echo "   ⚠️  App Credentials saved to: /tmp/${IAM_APP_USER}-credentials.json"
echo "   ⚠️  SAVE THESE CREDENTIALS - You won't be able to see them again!"
cat /tmp/${IAM_APP_USER}-credentials.json

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
echo ""
echo "========================================="
echo "✅ IAM Setup Complete!"
echo "========================================="
echo ""
echo "Created users:"
echo "  - $IAM_CI_CD_USER (for GitHub Actions)"
echo "  - $IAM_APP_USER (for application)"
echo ""
echo "⚠️  IMPORTANT: Save the credentials from the JSON files above!"
echo "    - CI/CD credentials → GitHub Secrets"
echo "    - App credentials → App Runner environment variables"
echo ""
