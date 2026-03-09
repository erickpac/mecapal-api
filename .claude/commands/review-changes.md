Review all uncommitted changes in the working tree for quality and correctness.

## Steps

1. **Gather changes** — Run:
   ```
   git status
   git diff
   git diff --staged
   ```

2. **Review each changed file** for the following:

### Type Safety
- New `any` types introduced
- Missing type annotations on function parameters or return values
- Incorrect type assertions or casts

### Clean Architecture Compliance
- Dependencies pointing in the wrong direction
- Business logic added to controllers (should be in use cases)
- Infrastructure concerns leaking into domain layer
- Use cases not following the single `execute()` method pattern

### Security
- Hardcoded secrets, API keys, or credentials
- Unvalidated user input
- Missing authentication/authorization guards on new endpoints
- SQL injection risks in Prisma raw queries

### NestJS Patterns
- Missing `@Injectable()` on new providers
- New providers not registered in their module
- Missing validation decorators on DTO properties
- Incorrect use of dependency injection tokens

### Code Quality
- Missing imports or unused imports
- Inconsistent naming (use cases, DTOs, interfaces, entities)
- Hardcoded values that should be environment variables or constants
- Missing error handling for expected failure cases
- Console.log statements left in production code

### Prisma Usage
- Over-fetching (missing `select`/`include`)
- Missing transactions for multi-table writes
- `findFirst` where `findUnique` would be correct

## Output Format

For each changed file:
- ✅ `file_path` — No issues
- ⚠️  `file_path:line_number` — Description of the issue

## Important

- Do NOT fix anything — report only.
- Ask before applying any changes.
- Only review changed/new files, not the entire codebase.
- Focus on substantive issues, not style preferences.
