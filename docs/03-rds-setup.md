# RDS Setup

Amazon RDS provides managed PostgreSQL databases for the application.

## Overview

Create two database instances:
- `mekapal-dev` - Development database
- `mekapal-prod` - Production database

## 1. Security Group (private, SG-to-SG)

RDS is **not publicly accessible**. The RDS SG allows 5432 **only from the ECS
task SG** — no `0.0.0.0/0`. The app reaches RDS over the in-VPC private path.

Current dev wiring:
- RDS SG: `sg-0d327f9ff2faf8d1c`
- ECS task SG: `sg-04e2b769e3fa167a4`

```bash
# Allow 5432 from the task SG only (no public CIDR)
aws ec2 authorize-security-group-ingress \
  --group-id sg-0d327f9ff2faf8d1c \
  --protocol tcp --port 5432 \
  --source-group sg-04e2b769e3fa167a4 \
  --region us-east-1
```

Do not add a `0.0.0.0/0` rule. For rare manual access use the EICE tunnel in
[08-migrations.md](./08-migrations.md#4-rare-manual-db-access-private-rds).

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
   - Public access: **No** (private; reached in-VPC by the ECS task)
   - VPC security group: Choose existing → the RDS SG
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
  --no-publicly-accessible \
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
| Public access | **No** | **No** |
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

RDS is private; connect through the EICE tunnel (see
[08-migrations.md](./08-migrations.md#4-rare-manual-db-access-private-rds)),
then:

```bash
psql -h localhost -U postgres -d mekapal
```

## Security Notes

- Public access **disabled** in both environments; access is in-VPC only.
- RDS SG allows 5432 only from the ECS task SG (no public CIDR).
- Use strong passwords; consider AWS Secrets Manager.
- Production: Multi-AZ, deletion protection, and longer backup retention on.

## Summary

Save these values:

| Environment | Endpoint | Database |
|-------------|----------|----------|
| Development | `mekapal-dev.xxx.us-east-1.rds.amazonaws.com` | `mekapal` |
| Production | `mekapal-prod.xxx.us-east-1.rds.amazonaws.com` | `mekapal` |

## Next Step

Continue to [S3 Setup](./04-s3-setup.md)
