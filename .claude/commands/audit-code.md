Audit the codebase for common issues specific to this NestJS + Prisma + AWS project.

## Scan Categories

### 1. Type Safety
- Search for `any` type usage across all `.ts` files (excluding test files and generated code)
- Flag untyped function parameters and return types
- Check for missing generics in Prisma queries

### 2. Hardcoded Values
- Look for hardcoded URLs, ports, API keys, secrets, or credentials
- Check for hardcoded database connection strings
- Find values that should be environment variables (AWS regions, bucket names, queue URLs, etc.)
- Check for hardcoded magic numbers or strings that should be constants

### 3. Clean Architecture Violations
- Controllers importing from domain layer directly (should go through use cases)
- Use cases importing from infrastructure layer
- Domain entities importing framework dependencies (NestJS decorators, Prisma types)
- Repositories not implementing domain interfaces
- Business logic in controllers instead of use cases

### 4. NestJS-Specific Issues
- Missing `@Injectable()` decorators on services/use cases
- Missing module registrations (providers not registered in module)
- Incorrect dependency injection (missing `@Inject()` for interface tokens)
- Guards or interceptors not properly applied
- Missing validation pipes on DTOs

### 5. Prisma-Specific Issues
- Missing `select`/`include` causing over-fetching
- Raw queries without parameterization (SQL injection risk)
- Missing transactions for multi-table operations
- Using `findFirst` where `findUnique` would be appropriate
- Missing error handling for Prisma-specific exceptions

### 6. Security Issues
- Exposed secrets or API keys in source code
- Missing authentication guards on endpoints
- Missing role-based authorization where expected
- Unvalidated user input reaching database queries
- Missing rate limiting on sensitive endpoints
- CORS misconfiguration

### 7. Missing Imports & Exports
- Unused imports
- Missing barrel exports (index.ts files)
- Circular dependencies between modules

### 8. Inconsistent Patterns
- Use cases not following `{Action}{Entity}UseCase` naming
- DTOs not suffixed with `Dto`
- Interfaces not prefixed with `I`
- Inconsistent error handling patterns
- Missing domain exceptions (using generic errors instead)

## Output Format

Report findings grouped by category. For each finding:
- ✅ Category clean — no issues found
- ⚠️  `file_path:line_number` — Description of the issue

## Important

- Do NOT fix anything — report only.
- Ask before applying any changes.
- Skip `node_modules/`, `dist/`, `generated/`, and test files unless specifically relevant.
- Focus on actionable issues, not style nitpicks.
