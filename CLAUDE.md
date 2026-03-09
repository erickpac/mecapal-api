# Logistics API Project

## Tech Stack

- NestJS with TypeScript (strict mode)
- PostgreSQL with Prisma ORM
- AWS (Lambda, SQS, S3, RDS, ECS)
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

This is a logistics/transport API handling:

- Package delivery tracking
- Route optimization
- Driver management
- Real-time shipment status
- Warehouse inventory

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
- External services: AWS, third-party APIs

### Rules

- Dependencies point inward only (Infrastructure → Application → Domain)
- Use Cases receive interfaces, not concrete implementations
- Controllers call Use Cases, never repositories directly
- DTOs validate input at controller level
- Entities contain business rules and validations

## File Structure

```
src/
├── modules/
│   └── shipments/
│       ├── domain/
│       │   ├── entities/
│       │   └── interfaces/
│       ├── application/
│       │   ├── use-cases/
│       │   ├── dtos/
│       │   └── mappers/
│       └── infrastructure/
│           ├── controllers/
│           ├── repositories/
│           └── shipments.module.ts
├── common/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   └── decorators/
└── config/
```

## Prisma Guidelines

- Schema location: `prisma/schema.prisma`
- Use PrismaService as singleton (injectable)
- Repositories implement domain interfaces
- Always use transactions for multi-table operations
- Prefer `findUnique` over `findFirst` when possible
- Use `select` or `include` to avoid over-fetching

## Code Standards

- Use Cases: One per file, named `{Action}{Entity}UseCase`
- DTOs: Suffix with `Dto` (e.g., `CreateShipmentDto`)
- Interfaces: Prefix with `I` (e.g., `IShipmentRepository`)
- Inject dependencies via constructor
- Unit test Use Cases in isolation with mocked repositories

## Commands

- `pnpm build` - Build the project
- `pnpm test` - Run unit tests
- `pnpm test:e2e` - Run E2E tests
- `pnpm lint` - Run ESLint
- `pnpm prisma generate` - Generate Prisma client
- `pnpm prisma migrate dev` - Create and run migration
- `pnpm prisma migrate deploy` - Deploy migrations (prod)
- `pnpm prisma studio` - Open Prisma Studio

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
