# Database Migrations

Run Prisma migrations to set up the database schema.

## Overview

RDS is **private** (not publicly accessible; ingress only from the ECS task SG).
Migrations therefore run **inside the VPC**, not from the GitHub runner or a
laptop.

**Principle: schema changes go through Prisma migrations only — never manual
`psql` / `ALTER TABLE`.** A migration file is the single source of truth; manual
edits cause drift the next `migrate deploy` cannot reconcile.

**Automatic (CI/CD):** every deploy to `develop` / `main` runs
`prisma migrate deploy` as a one-off in-VPC ECS task before the service updates.
No manual step for normal deployments.

## 1. How CI runs migrations (in-VPC ECS RunTask)

The deploy workflow (`.github/workflows/_deploy-ecs-express.yml`) runs migrations
after pushing the image and before updating the service:

1. Register a one-off task def (`mekapal-api-<env>-migrate`) using the freshly
   built image, command override `prisma migrate deploy`, `DATABASE_URL` from
   the environment secret.
2. `run-task` into the service subnet + task SG (`sg-04e2b769e3fa167a4`) so it
   reaches private RDS; `aws ecs wait tasks-stopped`.
3. If the container exit code is non-zero, the deploy **fails** before the
   service is touched. A bad migration is a visible CI failure, not a runtime
   crash-loop.

We deliberately do **not** run migrations on container startup (would re-run on
every boot and turn a bad migration into a crash-loop instead of a CI failure).

The `DATABASE_URL` secret is environment-specific (development vs production).

## 2. Verify Migrations

`prisma migrate status` / `prisma studio` work locally only against a reachable
DB — i.e. through the tunnel in section 4. In CI, the migrate task output (its
exit code and CloudWatch logs) is the source of truth.

## 3. Creating New Migrations

When you change `prisma/schema.prisma`:

```bash
# Create a new migration
pnpm prisma migrate dev --name descriptive_name

# Examples:
pnpm prisma migrate dev --name add_user_table
pnpm prisma migrate dev --name add_vehicle_status_field
```

This creates a migration file in `prisma/migrations/`.

## 4. Rare manual DB access (private RDS)

RDS has no public IP, so connect through an **EC2 Instance Connect Endpoint**
tunnel (~$0 standing cost; no NAT, no bastion instance). One-time: create an
EICE in the VPC. Then:

```bash
# Tunnel localhost:5432 -> RDS through the EICE (keep running in a terminal)
aws ec2-instance-connect open-tunnel \
  --instance-connect-endpoint-id eice-xxxxxxxx \
  --private-ip-address <rds-eni-private-ip> \
  --remote-port 5432 --local-port 5432 --region us-east-1

# In another terminal, point Prisma at the tunnel:
export DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/mekapal"
pnpm prisma migrate status
```

For routine migrations use CI (section 1). Reserve the tunnel for debugging and
`prisma studio`. Never `ALTER TABLE` by hand — use a migration.

## 5. Handling Migration Issues

### Reset Development Database

Pre-prod only, through the tunnel:

```bash
# WARNING: This deletes all data!
DATABASE_URL="postgresql://...@localhost:5432/mekapal" pnpm prisma migrate reset
```

### Failed Migration

If a migration fails:

1. Check the error message
2. Fix the issue in your schema
3. Create a new migration
4. Or manually fix the database and mark migration as applied:

```bash
pnpm prisma migrate resolve --applied "migration_name"
```

### Drift Detection

To check if database matches schema:

```bash
DATABASE_URL="postgresql://..." pnpm prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma
```

## 6. Seeding Data

### Development

```bash
DATABASE_URL="postgresql://..." pnpm prisma db seed
```

### Production

For production, seed data should be handled differently:
- Use a separate admin script
- Or seed during initial setup only
- Never auto-seed in production deployments

## 7. Backup Before Migrations (Production)

Always backup production before running migrations:

```bash
# Create RDS snapshot via CLI
aws rds create-db-snapshot \
  --db-instance-identifier mekapal-prod \
  --db-snapshot-identifier mekapal-prod-pre-migration-$(date +%Y%m%d)

# Or via Console:
# RDS → Databases → mekapal-prod → Actions → Take snapshot
```

## Migration Checklist

### Initial Setup
- [ ] Run migrations on development RDS
- [ ] Seed development database
- [ ] Run migrations on production RDS
- [ ] Verify both databases with Prisma Studio

### New Feature with Schema Changes
- [ ] Create migration locally: `pnpm prisma migrate dev --name xxx`
- [ ] Test migration on local database
- [ ] Commit migration files
- [ ] After merge to develop, run on development RDS
- [ ] After merge to main, backup production and run migration

## Next Step

Continue to [Verification](./09-verification.md)
