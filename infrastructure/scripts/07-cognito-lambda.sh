#!/bin/bash

# =============================================================================
# Cognito CustomMessage Lambda — ONE-TIME BOOTSTRAP
# =============================================================================
# Run ONCE per environment to provision the Lambda: create the execution role,
# create the function, grant Cognito invoke permission, and attach the
# CustomMessage trigger to the user pool (update-user-pool).
#
# Recurring code deploys (rebuild + update-function-code when the handler or
# templates change) happen automatically via GitHub Actions:
#   .github/workflows/deploy-lambda-dev.yml  (push to develop)
#   .github/workflows/deploy-lambda-prod.yml (push to main)
#
# Requires USER_POOL_ID (exported, or produced by 05-cognito.sh into
# /tmp/cognito-<env>-config.txt).
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/00-config.sh"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

FUNCTION_NAME="${APP_NAME}-cognito-custom-message-${ENVIRONMENT}"
ROLE_NAME="${FUNCTION_NAME}-role"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Resolve USER_POOL_ID
if [ -z "$USER_POOL_ID" ] && [ -f "/tmp/cognito-${ENVIRONMENT}-config.txt" ]; then
  source "/tmp/cognito-${ENVIRONMENT}-config.txt"
fi
if [ -z "$USER_POOL_ID" ]; then
  echo "❌ USER_POOL_ID not set. Export it or run 05-cognito.sh first."
  exit 1
fi

echo "🔨 Building Lambda bundle..."
( cd "$ROOT_DIR" && pnpm build:lambda:cognito )

DIST_DIR="$ROOT_DIR/lambdas/cognito-custom-message/dist"
( cd "$DIST_DIR" && rm -f function.zip && zip -j -q function.zip index.js )

# Ensure execution role
if ! aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  echo "👤 Creating execution role $ROLE_NAME..."
  aws iam create-role --role-name "$ROLE_NAME" \
    --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Allow",
        "Principal": { "Service": "lambda.amazonaws.com" },
        "Action": "sts:AssumeRole"
      }]
    }' >/dev/null
  aws iam attach-role-policy --role-name "$ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  echo "⏳ Waiting for role to propagate..."
  sleep 10
fi
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

# Create or update the function
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$AWS_REGION" >/dev/null 2>&1; then
  echo "♻️  Updating function code..."
  aws lambda update-function-code --function-name "$FUNCTION_NAME" \
    --zip-file "fileb://$DIST_DIR/function.zip" --region "$AWS_REGION" >/dev/null
else
  echo "🆕 Creating function..."
  aws lambda create-function --function-name "$FUNCTION_NAME" \
    --runtime nodejs22.x --handler index.handler \
    --role "$ROLE_ARN" \
    --zip-file "fileb://$DIST_DIR/function.zip" \
    --region "$AWS_REGION" >/dev/null
fi

LAMBDA_ARN="arn:aws:lambda:${AWS_REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"

# Grant Cognito permission to invoke (idempotent)
aws lambda add-permission --function-name "$FUNCTION_NAME" \
  --statement-id CognitoInvoke \
  --action lambda:InvokeFunction \
  --principal cognito-idp.amazonaws.com \
  --source-arn "arn:aws:cognito-idp:${AWS_REGION}:${ACCOUNT_ID}:userpool/${USER_POOL_ID}" \
  --region "$AWS_REGION" >/dev/null 2>&1 \
  && echo "🔓 Granted Cognito invoke permission." \
  || echo "🔓 Invoke permission already present, skipping."

# Wire the trigger.
# ⚠️ update-user-pool REPLACES the whole config — every parameter below must be
# re-passed or it reverts to defaults. When SES email is wired later
# (docs/14-email-ses-setup.md step 3), that update MUST also include this
# --lambda-config, and this call MUST include --email-configuration, or one
# will clobber the other.
echo "🔗 Attaching CustomMessage trigger to user pool $USER_POOL_ID..."
aws cognito-idp update-user-pool --user-pool-id "$USER_POOL_ID" --region "$AWS_REGION" \
  --policies '{"PasswordPolicy":{"MinimumLength":8,"RequireUppercase":true,"RequireLowercase":true,"RequireNumbers":true,"RequireSymbols":true,"TemporaryPasswordValidityDays":7}}' \
  --auto-verified-attributes email \
  --account-recovery-setting '{"RecoveryMechanisms":[{"Priority":1,"Name":"verified_email"}]}' \
  --admin-create-user-config '{"AllowAdminCreateUserOnly":false}' \
  --lambda-config "{\"CustomMessage\":\"${LAMBDA_ARN}\"}"

echo ""
echo "✅ Bootstrap done. Lambda ARN: $LAMBDA_ARN"
echo "   The pool now renders Spanish auth emails."
echo "   (Delivery still uses Cognito's default sender until SES is wired — see docs/14.)"
echo "   Ongoing code changes deploy automatically via GitHub Actions."
