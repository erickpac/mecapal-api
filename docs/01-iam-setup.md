# IAM Setup

This guide covers creating the necessary IAM users and policies for the Mecapal API infrastructure.

## Overview

You need to create two IAM users:

1. **mekapal-ci-cd**: Used by GitHub Actions for deployments
2. **mekapal-app**: Used by the application to access AWS services (S3, SES, Cognito)

## 1. Create CI/CD User

This user is used by GitHub Actions to push images to ECR and trigger App Runner deployments.

### Create the user

```bash
aws iam create-user --user-name mekapal-ci-cd
```

### Create the policy file

Create a file named `ci-cd-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRAuth",
      "Effect": "Allow",
      "Action": "ecr:GetAuthorizationToken",
      "Resource": "*"
    },
    {
      "Sid": "ECRPush",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": [
        "arn:aws:ecr:us-east-1:*:repository/mekapal-api-dev",
        "arn:aws:ecr:us-east-1:*:repository/mekapal-api-prod"
      ]
    },
    {
      "Sid": "AppRunnerDeploy",
      "Effect": "Allow",
      "Action": [
        "apprunner:StartDeployment",
        "apprunner:DescribeService"
      ],
      "Resource": "arn:aws:apprunner:us-east-1:*:service/mekapal-api-*"
    }
  ]
}
```

### Attach the policy

```bash
aws iam put-user-policy \
  --user-name mekapal-ci-cd \
  --policy-name mekapal-ci-cd-policy \
  --policy-document file://ci-cd-policy.json
```

### Create access keys

```bash
aws iam create-access-key --user-name mekapal-ci-cd
```

**Important**: Save the output! You'll need these for GitHub Secrets:
- `AccessKeyId`
- `SecretAccessKey`

## 2. Create Application User

This user is used by the running application to access S3, SES, and Cognito.

### Create the user

```bash
aws iam create-user --user-name mekapal-app
```

### Create the policy file

Create a file named `app-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::mekapal-uploads-dev",
        "arn:aws:s3:::mekapal-uploads-dev/*",
        "arn:aws:s3:::mekapal-uploads-prod",
        "arn:aws:s3:::mekapal-uploads-prod/*"
      ]
    },
    {
      "Sid": "SESAccess",
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CognitoAccess",
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminInitiateAuth",
        "cognito-idp:AdminRespondToAuthChallenge",
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminUpdateUserAttributes"
      ],
      "Resource": "arn:aws:cognito-idp:us-east-1:*:userpool/*"
    }
  ]
}
```

### Attach the policy

```bash
aws iam put-user-policy \
  --user-name mekapal-app \
  --policy-name mekapal-app-policy \
  --policy-document file://app-policy.json
```

### Create access keys

```bash
aws iam create-access-key --user-name mekapal-app
```

**Important**: Save the output! You'll need these for App Runner environment variables:
- `AccessKeyId` → `AWS_ACCESS_KEY_ID`
- `SecretAccessKey` → `AWS_SECRET_ACCESS_KEY`

## Summary

After completing this guide, you should have:

| User | Purpose | Credentials Stored In |
|------|---------|----------------------|
| `mekapal-ci-cd` | GitHub Actions deployments | GitHub Secrets |
| `mekapal-app` | Application AWS access | App Runner env vars |

## Next Step

Continue to [ECR Setup](./02-ecr-setup.md)
