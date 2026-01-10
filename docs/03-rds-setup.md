# RDS Setup

Amazon RDS provides managed PostgreSQL databases for the application.

## Overview

Create two database instances:
- `mekapal-dev` - Development database
- `mekapal-prod` - Production database

## 1. Create Security Group

First, create a security group that allows PostgreSQL access.

### Via AWS Console (Recommended)

1. Go to **EC2 → Security Groups → Create security group**
2. **Name**: `mekapal-rds-sg`
3. **Description**: Security group for Mecapal RDS instances
4. **Inbound rules**:
   - Type: PostgreSQL
   - Port: 5432
   - Source: `0.0.0.0/0` (for development) or your IP range

### Via CLI

```bash
# Create security group
aws ec2 create-security-group \
  --group-name mekapal-rds-sg \
  --description "Security group for Mecapal RDS instances"

# Add inbound rule (PostgreSQL)
aws ec2 authorize-security-group-ingress \
  --group-name mekapal-rds-sg \
  --protocol tcp \
  --port 5432 \
  --cidr 0.0.0.0/0
```

## 2. Create Development Database

### Via AWS Console (Recommended)

1. Go to **RDS → Create database**
2. **Choose a database creation method**: Standard create
3. **Engine options**:
   - Engine type: PostgreSQL
   - Version: PostgreSQL 16.x
4. **Templates**: Free tier
5. **Settings**:
   - DB instance identifier: `mekapal-dev`
   - Master username: `postgres`
   - Master password: (generate a secure password)
6. **Instance configuration**:
   - DB instance class: `db.t3.micro`
7. **Storage**:
   - Storage type: gp2
   - Allocated storage: 20 GB
   - Storage autoscaling: Disable (for dev)
8. **Connectivity**:
   - VPC: Default VPC
   - Subnet group: Default
   - Public access: **Yes** (required for local development access)
   - VPC security group: Choose existing → `mekapal-rds-sg`
9. **Database authentication**: Password authentication
10. **Additional configuration**:
    - Initial database name: `mekapal`
    - Backup retention: 7 days (or 0 for dev to save costs)
    - Enable auto minor version upgrade: Yes

11. Click **Create database**

### Via CLI

```bash
aws rds create-db-instance \
  --db-instance-identifier mekapal-dev \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.4 \
  --master-username postgres \
  --master-user-password "YOUR_SECURE_PASSWORD" \
  --allocated-storage 20 \
  --storage-type gp2 \
  --db-name mekapal \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --publicly-accessible \
  --backup-retention-period 7 \
  --no-multi-az \
  --auto-minor-version-upgrade
```

## 3. Create Production Database

Repeat the steps above with these differences:

| Setting | Development | Production |
|---------|-------------|------------|
| Instance identifier | `mekapal-dev` | `mekapal-prod` |
| Instance class | `db.t3.micro` | `db.t3.small` or larger |
| Storage | 20 GB | 50 GB or more |
| Storage autoscaling | Disabled | Enabled |
| Public access | Yes | **No** (use VPC) |
| Multi-AZ | No | Yes (recommended) |
| Backup retention | 7 days | 14+ days |

## 4. Wait for Database to be Available

Database creation takes 5-10 minutes.

```bash
# Check status
aws rds describe-db-instances \
  --db-instance-identifier mekapal-dev \
  --query 'DBInstances[0].DBInstanceStatus'
```

Wait until status is `available`.

## 5. Get Connection Information

```bash
# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier mekapal-dev \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

## 6. Build Connection String

The `DATABASE_URL` format for Prisma:

```
postgresql://USERNAME:PASSWORD@ENDPOINT:5432/DATABASE_NAME
```

### Examples

**Development:**
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@mekapal-dev.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/mekapal
```

**Production:**
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@mekapal-prod.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/mekapal
```

## 7. Test Connection

```bash
# Using psql
psql -h mekapal-dev.xxxxxxxxx.us-east-1.rds.amazonaws.com -U postgres -d mekapal

# Or test with Prisma
DATABASE_URL="postgresql://..." npx prisma db pull
```

## Security Notes

### For Development
- Public access is enabled for convenience
- Use strong passwords
- Consider restricting security group to your IP

### For Production
- Disable public access
- Use VPC peering or VPN for access
- Enable Multi-AZ for high availability
- Enable automated backups
- Use AWS Secrets Manager for credentials

## Summary

Save these values:

| Environment | Endpoint | Database |
|-------------|----------|----------|
| Development | `mekapal-dev.xxx.us-east-1.rds.amazonaws.com` | `mekapal` |
| Production | `mekapal-prod.xxx.us-east-1.rds.amazonaws.com` | `mekapal` |

## Next Step

Continue to [S3 Setup](./04-s3-setup.md)
