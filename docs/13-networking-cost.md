# Networking & Cost Log

Record of the networking posture and cost-reduction work on the dev (and only)
environment. Account `946839355377`, region `us-east-1`, VPC
`vpc-021b660a8ce126073`.

## Cost investigation (the $6 → $88 jump)

The bill jumped after the end-of-April 2026 move from App Runner to an **ECS
Express Mode** stack. The surprise driver was **public IPv4 addresses**
(`$0.005/hr ≈ $3.65/mo` each). Eight were in use:

| Count | Resource | Notes |
|------|----------|-------|
| 6 | ECS-managed Express gateway ALB | one Elastic IP per AZ (us-east-1a–1f) |
| 1 | ECS Fargate task ENI | the single app task |
| 1 | RDS `mekapal-dev` | public instance with its own Elastic IP |

8 × $3.65 ≈ **$29.72/mo** of the increase was public IPv4 alone.

## Changes made

### RDS made private + exposure closed

- Added scoped ingress: 5432 on RDS SG `sg-0d327f9ff2faf8d1c` from the ECS task
  SG `sg-04e2b769e3fa167a4` (rule `sgr-0bb5031d64872e857`).
- Verified app↔DB over the in-VPC path (one-off ECS task, `select 1` → `DB_OK`).
- `modify-db-instance --no-publicly-accessible --apply-immediately`.
- Revoked the `0.0.0.0/0:5432` rule on the RDS SG.
- RDS public IP gone; its Elastic IP `eipalloc-08549c0fc32090066` was released
  automatically when the instance went private.

Net: removed **1 public IP** (the RDS one) — ~$3.65/mo — and eliminated the open
database to the internet.

### Migration execution moved in-VPC

Because RDS is now private, the GitHub runner can no longer reach it. Migrations
now run as a **CI-triggered one-off ECS RunTask** inside the VPC (command
override `prisma migrate deploy`, same subnet + task SG), gated before the
service update. Chosen over running migrations on container startup: startup
migration re-runs on every boot and turns a bad migration into a crash-loop
instead of a visible CI failure. See [08-migrations.md](./08-migrations.md).

### ALB AZ reduction — NOT done (ECS-managed)

Goal was to shrink the ALB from 6 AZs to 2 and release 4 EIPs (~$14.60/mo). The
ALB is tagged `AmazonECSManaged: true`; the service reports
`resourceManagementType: ECS` and `availabilityZoneRebalancing: ENABLED`. ECS
owns the ALB subnets and EIPs and reconciles manual changes back. There is no
stable Express-native knob to set the AZ count today, so this was **not forced**.
The 6 ALB EIPs (~$21.90/mo) remain until a supported option exists.

## Result

- Public IPs: **8 → 7** (removed RDS).
- Realized saving: **~$3.65/mo** plus closing the public DB.
- Remaining IPv4 cost: 6 ALB EIPs + 1 app task ENI = ~$25.55/mo, all ECS-managed.
- The `$88 → ~$70` target depended on the ALB AZ reduction, which is blocked by
  ECS Express Mode management; revisit if AWS exposes AZ control.

## Reversal notes

| Change | Reverse |
|--------|---------|
| SG-to-SG ingress | `revoke-security-group-ingress --group-id sg-0d327f9ff2faf8d1c --protocol tcp --port 5432 --source-group sg-04e2b769e3fa167a4` |
| RDS private | `modify-db-instance --db-instance-identifier mekapal-dev --publicly-accessible --apply-immediately` |
| Revoked public 5432 | `authorize-security-group-ingress --group-id sg-0d327f9ff2faf8d1c --protocol tcp --port 5432 --cidr 0.0.0.0/0` |

Do not create a NAT Gateway to "fix" private RDS — it costs more than the IPs
saved. The single app task keeps its public IP for image pulls.
