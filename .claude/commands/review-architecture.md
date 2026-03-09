# Architecture Review & Refactoring

## Objective

Review the current codebase implementation and ensure it follows Clean Architecture principles correctly. Make necessary modifications without breaking existing functionality.

## Phase 1: Analysis

1. Scan the entire `src/modules/` directory structure
2. Identify all existing modules and their current architecture
3. List any deviations from Clean Architecture pattern
4. Check dependency directions (should point inward only)
5. Review existing tests and their coverage

## Phase 2: Architecture Compliance Check

### For each module, verify:

**Domain Layer**

- [ ] Entities are pure classes without framework dependencies
- [ ] Entities contain business logic and validations
- [ ] Repository interfaces are defined (not implementations)
- [ ] No imports from Application or Infrastructure layers

**Application Layer**

- [ ] Use Cases have single responsibility
- [ ] Use Cases have one public `execute()` method
- [ ] DTOs use class-validator decorators properly
- [ ] Mappers exist for Entity ↔ DTO transformations
- [ ] Use Cases inject interfaces, not concrete implementations

**Infrastructure Layer**

- [ ] Repositories implement domain interfaces
- [ ] Controllers only handle HTTP request/response
- [ ] Controllers call Use Cases, not repositories directly
- [ ] Module properly configures dependency injection

## Phase 3: Required Removals

### Remove Cloudinary Module

- Delete all Cloudinary-related files and dependencies
- Remove from `package.json`: `cloudinary`, `@cloudinary/*` packages
- Remove Cloudinary configuration from environment files references
- Remove Cloudinary module imports from `app.module.ts`
- Identify all usages and leave `// TODO: Replace with S3` comments
- Do NOT delete the business logic that uses file uploads, just remove Cloudinary implementation

### Remove Resend Module

- Delete all Resend-related files and dependencies
- Remove from `package.json`: `resend`, `@resend/*` packages
- Remove Resend configuration from environment files references
- Remove Resend module imports from `app.module.ts`
- Identify all usages and leave `// TODO: Replace with email alternative (SES, SendGrid, etc.)` comments
- Do NOT delete the business logic that uses email sending, just remove Resend implementation

## Phase 4: Refactoring (if needed)

For any module not following Clean Architecture:

1. Create proper folder structure (domain/application/infrastructure)
2. Extract entities to domain layer
3. Create repository interfaces in domain layer
4. Move Use Cases to application layer
5. Ensure DTOs are in application layer
6. Move implementations to infrastructure layer
7. Update imports and dependency injection
8. Run tests after each module refactor to ensure nothing breaks

## Phase 5: Validation

After all changes:

1. Run `pnpm lint` - fix any issues
2. Run `pnpm build` - ensure compilation works
3. Run `pnpm test` - all tests must pass
4. Run `pnpm prisma generate` - ensure Prisma client is up to date
5. List all `// TODO:` comments added for future implementation

## Rules

- Make incremental changes, commit logically
- Do NOT modify business logic, only restructure
- Preserve all existing functionality
- If unsure about a change, ask before proceeding
- Document any significant architectural decisions found
