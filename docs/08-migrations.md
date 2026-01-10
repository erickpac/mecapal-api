# Database Migrations

Run Prisma migrations to set up the database schema.

## Overview

Migrations are handled automatically by the GitHub Actions deploy workflow. The workflow runs `prisma migrate deploy` before deploying the new application version.

**Automatic (via GitHub Actions):**
- Migrations run automatically on every deploy to `develop` or `main`
- No manual intervention needed for normal deployments

**Manual:**
- Initial setup
- Local development
- Troubleshooting

## 1. Run Migrations Locally

The safest way is to run migrations from your local machine pointing to RDS.

### Development Database

```bash
# Set the DATABASE_URL for development RDS
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@mekapal-dev.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/mekapal"

# Run migrations
pnpm prisma migrate deploy

# Optionally, seed the database
pnpm prisma db seed
```

### Production Database

```bash
# Set the DATABASE_URL for production RDS
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@mekapal-prod.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/mekapal"

# Run migrations
pnpm prisma migrate deploy
```

## 2. Verify Migrations

```bash
# Check migration status
pnpm prisma migrate status

# Open Prisma Studio to inspect data
pnpm prisma studio
```

## 3. Automatic Migrations in CI/CD

The deploy workflow (`.github/workflows/_deploy-apprunner.yml`) automatically runs migrations before deploying:

```yaml
- name: Run database migrations
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: |
    pnpm install --frozen-lockfile
    pnpm prisma migrate deploy
```

**Flow:**
1. Push to `develop` → runs migrations on dev DB → deploys to dev App Runner
2. Push to `main` → runs migrations on prod DB → deploys to prod App Runner

**Important:** The `DATABASE_URL` secret is environment-specific:
- `development` environment uses dev database
- `production` environment uses prod database

## 4. Creating New Migrations

When you change `prisma/schema.prisma`:

```bash
# Create a new migration
pnpm prisma migrate dev --name descriptive_name

# Examples:
pnpm prisma migrate dev --name add_user_table
pnpm prisma migrate dev --name add_vehicle_status_field
```

This creates a migration file in `prisma/migrations/`.

## 5. Handling Migration Issues

### Reset Development Database

If you need to reset the dev database:

```bash
# WARNING: This deletes all data!
DATABASE_URL="postgresql://..." pnpm prisma migrate reset
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
