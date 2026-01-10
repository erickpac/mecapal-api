# Cognito Setup

Amazon Cognito handles user authentication for the mobile app and web admin.

## Overview

Create two user pools:
- `mekapal-dev-pool` - Development user pool
- `mekapal-prod-pool` - Production user pool

## 1. Create User Pool via AWS Console

The Console provides the best experience for Cognito setup.

### Step 1: Configure Sign-in Experience

1. Go to **Cognito → Create user pool**
2. **Authentication providers**:
   - Provider types: Cognito user pool
3. **Cognito user pool sign-in options**:
   - ✅ Email
   - ❌ User name (uncheck)
   - ❌ Phone number (uncheck)

### Step 2: Configure Security Requirements

1. **Password policy**:
   - Password minimum length: 8
   - ✅ Contains at least 1 number
   - ✅ Contains at least 1 special character
   - ✅ Contains at least 1 uppercase letter
   - ✅ Contains at least 1 lowercase letter
2. **Multi-factor authentication**:
   - MFA enforcement: No MFA (for development)
   - For production, consider Optional MFA
3. **User account recovery**:
   - ✅ Enable self-service account recovery
   - Delivery method: Email only

### Step 3: Configure Sign-up Experience

1. **Self-service sign-up**:
   - ✅ Enable self-registration
2. **Attribute verification**:
   - ✅ Allow Cognito to automatically send messages
   - Attributes to verify: Email
3. **Required attributes**:
   - email (already required by sign-in)
4. **Custom attributes**: None needed (we store user data in our database)

### Step 4: Configure Message Delivery

#### For Development:
1. **Email**:
   - Email provider: Send email with Cognito
   - FROM email address: `no-reply@verificationemail.com`

#### For Production:
1. **Email**:
   - Email provider: Send email with Amazon SES
   - SES Region: us-east-1
   - FROM email address: Your verified SES email
   - Configuration set: (optional)

### Step 5: Integrate Your App

1. **User pool name**: `mekapal-dev-pool` or `mekapal-prod-pool`
2. **Hosted authentication pages**: Don't use Cognito Hosted UI
3. **Domain**: Skip (not using hosted UI)
4. **Initial app client**:
   - App type: Other
   - App client name: `mekapal-api`
   - Client secret: Don't generate (for mobile apps)
   - Authentication flows:
     - ✅ ALLOW_USER_PASSWORD_AUTH
     - ✅ ALLOW_ADMIN_USER_PASSWORD_AUTH (required for admin login)
     - ✅ ALLOW_REFRESH_TOKEN_AUTH
     - ❌ ALLOW_USER_SRP_AUTH (not needed)
5. **Advanced app client settings**:
   - Token expiration:
     - Access token: 1 hour
     - Refresh token: 30 days
     - ID token: 1 hour

### Step 6: Review and Create

1. Review all settings
2. Click **Create user pool**

## 2. Get User Pool Information

After creation, note these values:

### From User Pool Overview:
- **User pool ID**: `us-east-1_xxxxxxxxx`

### From App Integration → App clients:
- **Client ID**: `xxxxxxxxxxxxxxxxxxxxxxxxxx`

## 3. Create User Pool via CLI (Alternative)

If you prefer CLI:

```bash
# Create user pool
aws cognito-idp create-user-pool \
  --pool-name mekapal-dev-pool \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": true
    }
  }' \
  --auto-verified-attributes email \
  --username-attributes email \
  --username-configuration '{
    "CaseSensitive": false
  }' \
  --account-recovery-setting '{
    "RecoveryMechanisms": [
      {"Priority": 1, "Name": "verified_email"}
    ]
  }' \
  --region us-east-1

# Note the UserPool Id from the response
```

```bash
# Create app client
aws cognito-idp create-user-pool-client \
  --user-pool-id us-east-1_xxxxxxxxx \
  --client-name mekapal-api \
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
  }'
```

## 4. Configure for Admin User Creation

For creating ADMIN and BACKOFFICE users programmatically, ensure:

1. **ALLOW_ADMIN_USER_PASSWORD_AUTH** is enabled (allows `AdminInitiateAuth`)
2. The IAM user (`mekapal-app`) has Cognito permissions (see [IAM Setup](./01-iam-setup.md))

## 5. Test User Pool

### Create a test user via Console:

1. Go to **User pool → Users → Create user**
2. Email: `test@example.com`
3. Mark email as verified: ✅
4. Set password or send invitation

### Create a test user via CLI:

```bash
# Create user (will send invitation email)
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_xxxxxxxxx \
  --username test@example.com \
  --user-attributes Name=email,Value=test@example.com Name=email_verified,Value=true \
  --temporary-password "TempPass123!"
```

## 6. Production Considerations

For the production user pool (`mekapal-prod-pool`):

| Setting | Development | Production |
|---------|-------------|------------|
| MFA | No MFA | Optional or Required |
| Email delivery | Cognito | Amazon SES |
| Password policy | Standard | Consider stricter |
| Token expiration | 1 hour / 30 days | Consider shorter |

### Setup SES for Production

1. Verify your domain in SES
2. Move out of SES sandbox (request production access)
3. Configure user pool to use SES

## Summary

Save these values:

| Environment | User Pool ID | Client ID |
|-------------|--------------|-----------|
| Development | `us-east-1_xxxxxxxxx` | `xxxxxxxxxxxxxxxxx` |
| Production | `us-east-1_yyyyyyyyy` | `yyyyyyyyyyyyyyyyy` |

Environment variables:
- `AWS_REGION=us-east-1`
- `AWS_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx`
- `AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxx`

## Next Step

Continue to [App Runner Setup](./06-app-runner-setup.md)
