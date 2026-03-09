Scaffold a new API endpoint following this project's Clean Architecture patterns for: $ARGUMENTS

## Steps

1. **Analyze existing patterns** — Before creating anything, read an existing well-structured module (e.g., `src/modules/order/`) to understand:
   - Controller structure: decorators, guards, route naming, response patterns
   - Use case structure: constructor injection with tokens, `execute()` method
   - DTO structure: class-validator decorators, property types
   - Entity structure: pure business objects with methods
   - Repository interface: method signatures, return types
   - Repository implementation: PrismaService usage, entity mapping
   - Module registration: providers array with use case and repository bindings
   - Domain constants: injection tokens pattern

2. **Determine the module** — Based on `$ARGUMENTS`, determine:
   - Which existing module this endpoint belongs to, OR
   - If a new module is needed (use `/create-module` instead)

3. **Create the endpoint files** — Following the exact patterns found in step 1:

   **If adding to an existing module:**
   - Add the controller method with proper decorators (`@Get`, `@Post`, `@Patch`, `@Delete`)
   - Apply guards: `@UseGuards(CognitoAuthGuard, RolesGuard)` and `@Roles(...)` as appropriate
   - Use `@CurrentUser()` for authenticated user context
   - Use `ParseUUIDPipe` for UUID path params
   - Create the use case class: `{Action}{Entity}UseCase` with `@Injectable()` and `@Inject(TOKEN)` for repository
   - Create input/output DTOs with class-validator decorators (`@IsString`, `@IsOptional`, `@IsUUID`, etc.)
   - Add repository interface method if needed
   - Implement repository method using PrismaService
   - Register new providers in the module file

   **If creating a new module:**
   - Suggest using `/create-module` command instead

4. **Register everything** — Ensure:
   - Use case is in the module's `providers` array
   - Repository binding uses the domain token: `{ provide: TOKEN, useClass: RepositoryImpl }`
   - Controller is in the `controllers` array
   - New exports are added to barrel files (`index.ts`)

5. **Show the result** — List all created/modified files and the endpoint URL pattern.

## File Structure Reference

```
src/modules/<module>/
├── domain/
│   ├── constants/
│   │   └── injection-tokens.ts    # Symbol tokens for DI
│   ├── entities/
│   │   └── <entity>.entity.ts     # Pure business object
│   ├── enums/
│   │   └── <entity>-status.enum.ts
│   ├── exceptions/
│   │   └── <entity>-not-found.exception.ts
│   └── interfaces/
│       └── <entity>.repository.ts  # I<Entity>Repository interface
├── application/
│   ├── use-cases/
│   │   └── <action>-<entity>.use-case.ts
│   ├── dtos/
│   │   └── <action>-<entity>.dto.ts
│   └── mappers/
│       └── <entity>.mapper.ts
└── infrastructure/
    ├── controllers/
    │   └── <entity>.controller.ts
    └── repositories/
        └── <entity>.repository.ts  # Implements I<Entity>Repository
```

## Important

- Match the EXACT patterns found in the existing codebase — do not invent new conventions.
- Use the same guard combination seen in existing controllers.
- Follow the same DTO validation patterns.
- Use domain injection tokens (Symbols), not string tokens.
- Controllers should only call use cases, never repositories.
- Use cases should depend on interfaces, not concrete repositories.
