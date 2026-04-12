# IAM Setup

This guide covers creating the necessary IAM users and roles for the Mecapal API infrastructure.

## Overview

You need to create:

1. **mekapal-ci-cd** (IAM user): Used by GitHub Actions for deployments
2. **mekapalEcsTaskExecutionRole** (IAM role): Allows ECS to pull images from ECR and write logs
3. **mekapalEcsInfrastructureRole** (IAM role): Allows ECS Express Mode to provision ALB, security groups, etc.
4. **mekapalApiTaskRole** (IAM role): Grants the running application access to S3, SES, and Cognito

## 1. Create CI/CD User

This user is used by GitHub Actions to push images to ECR and deploy to ECS Express Mode.

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
      "Sid": "ECSFullDeploy",
      "Effect": "Allow",
      "Action": [
        "ecs:CreateCluster",
        "ecs:CreateService",
        "ecs:UpdateService",
        "ecs:DeleteService",
        "ecs:DescribeServices",
        "ecs:DescribeClusters",
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:DeregisterTaskDefinition",
        "ecs:ListServices",
        "ecs:ListClusters",
        "ecs:ListTaskDefinitions",
        "ecs:TagResource",
        "ecs:CreateExpressGatewayService",
        "ecs:UpdateExpressGatewayService",
        "ecs:DescribeExpressGatewayServices"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ECSExpressInfra",
      "Effect": "Allow",
      "Action": [
        "elasticloadbalancing:CreateLoadBalancer",
        "elasticloadbalancing:CreateTargetGroup",
        "elasticloadbalancing:CreateListener",
        "elasticloadbalancing:CreateRule",
        "elasticloadbalancing:DescribeLoadBalancers",
        "elasticloadbalancing:DescribeTargetGroups",
        "elasticloadbalancing:DescribeListeners",
        "elasticloadbalancing:DescribeRules",
        "elasticloadbalancing:ModifyLoadBalancerAttributes",
        "elasticloadbalancing:ModifyTargetGroupAttributes",
        "elasticloadbalancing:AddTags",
        "ec2:DescribeVpcs",
        "ec2:DescribeSubnets",
        "ec2:DescribeSecurityGroups",
        "ec2:CreateSecurityGroup",
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:AuthorizeSecurityGroupEgress",
        "ec2:RevokeSecurityGroupEgress",
        "ec2:CreateTags",
        "logs:CreateLogGroup",
        "logs:PutRetentionPolicy",
        "logs:TagLogGroup",
        "application-autoscaling:RegisterScalableTarget",
        "application-autoscaling:PutScalingPolicy",
        "application-autoscaling:DescribeScalableTargets",
        "application-autoscaling:DescribeScalingPolicies"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PassRolesToECS",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": [
        "arn:aws:iam::*:role/mekapalEcsTaskExecutionRole",
        "arn:aws:iam::*:role/mekapalEcsInfrastructureRole",
        "arn:aws:iam::*:role/mekapalApiTaskRole"
      ]
    },
    {
      "Sid": "CreateServiceLinkedRole",
      "Effect": "Allow",
      "Action": "iam:CreateServiceLinkedRole",
      "Resource": "arn:aws:iam::*:role/aws-service-role/ecs.amazonaws.com/*"
    }
  ]
}
```

> **Note:** This policy exceeds the 2048-byte inline policy limit. Use a managed policy instead of an inline policy.

### Attach the policy

```bash
# Create as managed policy
aws iam create-policy \
  --policy-name mekapal-ci-cd-policy \
  --policy-document file://ci-cd-policy.json

# Attach to user
aws iam attach-user-policy \
  --user-name mekapal-ci-cd \
  --policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/mekapal-ci-cd-policy
```

### Create access keys

```bash
aws iam create-access-key --user-name mekapal-ci-cd
```

**Important**: Save the output! You'll need these for GitHub Secrets:
- `AccessKeyId`
- `SecretAccessKey`

## 2. Create ECS Task Execution Role

This role allows ECS to pull container images from ECR and send logs to CloudWatch.

```bash
# Create trust policy
cat > ecs-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ecs-tasks.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name mekapalEcsTaskExecutionRole \
  --assume-role-policy-document file://ecs-trust-policy.json

# Attach managed policy
aws iam attach-role-policy \
  --role-name mekapalEcsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

Save the role ARN: `arn:aws:iam::<ACCOUNT_ID>:role/mekapalEcsTaskExecutionRole`

## 3. Create ECS Infrastructure Role

This role allows ECS Express Mode to provision resources (ALB, security groups, etc.) on your behalf.

```bash
# Create trust policy
cat > ecs-infra-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ecs.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name mekapalEcsInfrastructureRole \
  --assume-role-policy-document file://ecs-infra-trust-policy.json

# Attach managed policy
aws iam attach-role-policy \
  --role-name mekapalEcsInfrastructureRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSInfrastructureRoleForExpressGatewayServices
```

Save the role ARN: `arn:aws:iam::<ACCOUNT_ID>:role/mekapalEcsInfrastructureRole`

## 4. Create Application Task Role

This role is assumed by the running application container. It replaces the need for AWS access keys as environment variables — the AWS SDK automatically picks up credentials from the task role.

```bash
# Create role (same trust policy as execution role — ecs-tasks.amazonaws.com)
aws iam create-role \
  --role-name mekapalApiTaskRole \
  --assume-role-policy-document file://ecs-trust-policy.json
```

### Create the policy file

Create a file named `task-role-policy.json`:

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
        "cognito-idp:AdminUpdateUserAttributes",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:AdminDeleteUser"
      ],
      "Resource": "arn:aws:cognito-idp:us-east-1:*:userpool/*"
    }
  ]
}
```

### Attach the policy

```bash
aws iam put-role-policy \
  --role-name mekapalApiTaskRole \
  --policy-name mekapal-app-policy \
  --policy-document file://task-role-policy.json
```

Save the role ARN: `arn:aws:iam::<ACCOUNT_ID>:role/mekapalApiTaskRole`

## Summary

After completing this guide, you should have:

| Resource | Type | Purpose | ARN needed for |
|----------|------|---------|----------------|
| `mekapal-ci-cd` | IAM user | GitHub Actions deployments | GitHub repo secrets |
| `mekapalEcsTaskExecutionRole` | IAM role | ECS pulls images & writes logs | GitHub env secrets |
| `mekapalEcsInfrastructureRole` | IAM role | ECS Express provisions infra | GitHub env secrets |
| `mekapalApiTaskRole` | IAM role | App accesses S3, SES, Cognito | GitHub env secrets |

> **Note:** The `mekapal-app` IAM user (with access keys) is no longer needed. The task role provides credentials automatically, which is more secure.

## Next Step

Continue to [ECR Setup](./02-ecr-setup.md)
