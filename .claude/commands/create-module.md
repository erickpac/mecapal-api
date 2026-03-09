Create a new NestJS module following Clean Architecture for: $ARGUMENTS

## Steps to follow:

### 1. Domain Layer

Create `src/modules/{module}/domain/`:

- `entities/{Entity}.ts` - Pure entity class with business logic
- `interfaces/I{Entity}Repository.ts` - Repository contract

### 2. Application Layer

Create `src/modules/{module}/application/`:

- `use-cases/Create{Entity}UseCase.ts`
- `use-cases/Get{Entity}ByIdUseCase.ts`
- `use-cases/Update{Entity}UseCase.ts`
- `use-cases/Delete{Entity}UseCase.ts`
- `use-cases/List{Entities}UseCase.ts`
- `dtos/Create{Entity}Dto.ts` - with class-validator decorators
- `dtos/Update{Entity}Dto.ts`
- `dtos/{Entity}ResponseDto.ts`
- `mappers/{Entity}Mapper.ts` - Entity ↔ DTO transformations

### 3. Infrastructure Layer

Create `src/modules/{module}/infrastructure/`:

- `repositories/Prisma{Entity}Repository.ts` - implements domain interface
- `controllers/{entity}.controller.ts` - REST endpoints
- `{module}.module.ts` - NestJS module with DI configuration

### 4. Prisma Schema

Add the entity model to `prisma/schema.prisma` with appropriate relations

### 5. Tests

Create `src/modules/{module}/`:

- `application/use-cases/__tests__/` - Unit tests for each use case
- `infrastructure/controllers/__tests__/` - Controller tests

### 6. Register Module

Import the new module in `src/app.module.ts`

## Conventions

- Use Cases: Single `execute()` method, inject repository interface
- DTOs: Use class-validator (@IsString, @IsUUID, @IsOptional, etc.)
- Repository: Inject PrismaService, implement domain interface
- Controller: Inject Use Cases, not repositories
- Follow existing patterns in the codebase

```

Para usarlo simplemente ejecuta en Claude Code:
```

/project:create-module shipments
/project:create-module drivers
/project:create-module routes
