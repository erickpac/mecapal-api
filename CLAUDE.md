# Mecapal Logistics API

## Tech Stack

- NestJS with TypeScript (strict mode)
- PostgreSQL with Prisma ORM
- AWS: App Runner (compute), RDS (database), S3 (storage), Cognito (auth), SES (email), CloudFront (CDN), WAF (security)
- Stripe for payment processing
- Docker for containerization
- GitHub Actions for CI/CD

## Package Manager

- Use `pnpm` exclusively (not npm or yarn)
- Lock file: `pnpm-lock.yaml`

## Expertise Context

You are a senior backend engineer expert in:

- NestJS with Clean Architecture principles
- Prisma ORM (schema design, migrations, relations, transactions)
- TypeScript best practices and strict typing
- AWS services integration and deployment
- CI/CD pipelines with GitHub Actions
- RESTful API design for logistics/transport domain

## Domain Knowledge

Mecapal is a logistics marketplace (Guatemala) connecting clients who need to send packages with independent transporters who bid competitively. The platform handles:

- **Delivery requests**: Clients create requests specifying pickup/delivery addresses, package details, and timeframes
- **Competitive bidding**: Transporters submit offers with pricing and estimated times
- **Payments**: Stripe integration — clients pay, platform takes commission, transporters receive settlements via ACH
- **Commission engine**: Configurable billing profiles (percentage or fixed amount) with min/max bounds and tax calculation
- **Order lifecycle**: CONFIRMED → IN_PROGRESS → PICKED_UP → IN_TRANSIT → DELIVERED → COMPLETED
- **Admin backoffice**: Document validation, settlements management, incident resolution, analytics

### User Roles

- `CLIENT` — creates delivery requests, compares offers, pays
- `TRANSPORTER` — registers vehicles, bids on requests, completes deliveries
- `ADMIN` — full system access, user management, financial operations
- `BACKOFFICE` — validations, settlements, incident management

## Clean Architecture Guidelines

Follow strict layer separation:

### Domain Layer (innermost)

- Entities: Pure business objects, no framework dependencies
- Interfaces: Repository contracts, service ports
- No imports from infrastructure or application layers

### Application Layer

- Use Cases: Single responsibility, one public `execute()` method
- DTOs: Input/Output data transfer objects with class-validator
- Mappers: Transform between layers (Entity ↔ DTO)

### Infrastructure Layer (outermost)

- Repositories: Prisma implementations of domain interfaces
- Controllers: HTTP adapters, only handle request/response
- External services: AWS, Stripe, third-party APIs

### Rules

- Dependencies point inward only (Infrastructure → Application → Domain)
- Use Cases receive interfaces, not concrete implementations
- Controllers call Use Cases, never repositories directly
- DTOs validate input at controller level
- Entities contain business rules and validations

## Module Structure

```
src/modules/{module-name}/
├── domain/
│   ├── entities/
│   ├── interfaces/
│   └── enums/
├── application/
│   ├── use-cases/
│   ├── dtos/
│   └── mappers/
└── infrastructure/
    ├── controllers/
    ├── repositories/
    ├── services/
    └── {module-name}.module.ts
```

### Existing Modules

cognito, user, address, vehicle, upload, backoffice, location, zone-preference, delivery, commission, payment, order, bank-account, settlement, review, matching, incident, reports, notification

## Prisma Guidelines

- Schema location: `prisma/schema.prisma`
- Use PrismaService as singleton (injectable)
- Repositories implement domain interfaces
- Always use transactions for multi-table operations
- Prefer `findUnique` over `findFirst` when possible
- Use `select` or `include` to avoid over-fetching
- **Generate a migration with every schema change** — never let schema drift from migrations
- Run `npx prisma migrate dev --name descriptive_name` locally, commit the migration file

## Code Standards

- Use Cases: One per file, named `{Action}{Entity}UseCase`
- DTOs: Suffix with `Dto` (e.g., `CreateDeliveryRequestDto`)
- Interfaces: Prefix with `I` (e.g., `IDeliveryRepository`)
- Inject dependencies via constructor
- Unit test Use Cases in isolation with mocked repositories
- Use NestJS `Logger` class, never `console.log/warn/error`

## Commands

- `pnpm build` - Build the project
- `pnpm test` - Run unit tests
- `pnpm test:e2e` - Run E2E tests
- `pnpm lint` - Run ESLint
- `pnpm prisma generate` - Generate Prisma client
- `pnpm prisma migrate dev` - Create and run migration
- `pnpm prisma migrate deploy` - Deploy migrations (prod)
- `pnpm prisma studio` - Open Prisma Studio

## Deployment

- **Dev**: Push to `develop` → GitHub Actions builds Docker image → pushes to ECR → deploys to App Runner
- **Prod**: Push to `main` → same pipeline targeting production service
- **Workflow files**: `.github/workflows/deploy-dev.yml`, `deploy-prod.yml`, `_deploy-apprunner.yml`
- **Docker**: Multi-stage build (`Dockerfile`), runs on port 8080
- **Health check**: `GET /api/health`
- **Environment variables** are passed via App Runner runtime config in the workflow

## Environment Variables

Key env vars (set in GitHub Secrets per environment):

- `DATABASE_URL` — PostgreSQL connection string
- `AWS_COGNITO_USER_POOL_ID`, `AWS_COGNITO_CLIENT_ID` — Auth
- `AWS_S3_BUCKET`, `AWS_S3_REGION` — File storage
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — Payments (optional for dev)
- `CORS_ORIGIN` — Comma-separated allowed origins
- `PORT` — Server port (default 8080 in Docker, 3001 locally)

## Related Projects

- **Admin Console**: `../../../frontend/mekapal-web/apps/console/` — React + Vite + TailwindCSS SPA
- **Landing Page**: `../../../frontend/mekapal-web/apps/landing/` — Astro static site

## Git Workflow

- Always create a new branch for new features/changes
- Branch naming: `feature/description` or `fix/description`
- Make incremental commits during development
- When feature is complete, squash commits into a single meaningful commit
- Base branch: `develop`

### Git Conventions

- **Commit format:** `type: description` (e.g., `feat: add order tracking endpoint`)
  - Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- **Branching model:** `main` (production) → `develop` (integration) → `feature/*` or `fix/*` (work branches)
- **Merge strategy:** Always squash merge feature branches into `develop`
- **No `Co-Authored-By`** lines in commits
