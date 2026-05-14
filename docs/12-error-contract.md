# Standardized Error Contract

Every error response from the Mekapal API — from every module, from DTO
validation, and from unexpected/unhandled errors — uses **one consistent
shape** so that mobile and console clients can map a stable machine code to a
localized string entirely client-side.

## The contract

```json
{
  "statusCode": 404,
  "error": "ADDRESS_NOT_FOUND",
  "message": "Address with ID abc-123 not found"
}
```

| Field | Role |
|-------|------|
| `statusCode` | HTTP status code. |
| `error` | **Stable, machine-readable error code** in `SCREAMING_SNAKE_CASE`. This is the contract. Clients map it to `errors.server.*` i18n keys. **Never renamed without a coordinated consumer sync.** |
| `message` | Human-readable, developer/log-facing only. Clients **must not** display it to end users. |

Some errors include extra contextual fields at the top level:

| Field | Appears with |
|-------|--------------|
| `messages` | `VALIDATION_ERROR` — per-field class-validator messages. |
| `blockers` | `DELETION_BLOCKED` — list of pending obligations. |
| `scheduledFor` | `DELETION_ALREADY_SCHEDULED` — the scheduled deletion date. |
| `session` | `NEW_PASSWORD_REQUIRED` — the Cognito challenge session. |
| `failureCode` | `PAYMENT_FAILED` — provider-specific (Stripe) decline code. |

## How it works

```
src/common/
├── exceptions/
│   ├── domain.exception.ts       # abstract base: carries code + httpStatus + details
│   ├── error-code.ts             # central registry of every error code
│   └── error-coded.exception.ts  # ErrorCoded interface + hasErrorCode() guard
├── filters/
│   └── global-exception.filter.ts  # @Catch() — the single APP_FILTER
└── pipes/
    └── validation-exception.factory.ts  # ValidationPipe exceptionFactory
```

1. **Domain exceptions** extend `DomainException` (`src/common/exceptions/
   domain.exception.ts`), which carries:
   - `code` — a value from `ErrorCode` (`src/common/exceptions/error-code.ts`)
   - `httpStatus` — the HTTP status to respond with
   - `details` — optional getter for extra contextual fields

   Every module's domain exceptions extend this base (auth, account, address,
   vehicle, delivery, order, payment, bank-account, settlement, review,
   incident, user).

2. **`GlobalExceptionFilter`** (`@Catch()`) is registered as the single
   `APP_FILTER` in `AppModule`. It resolves, in order:
   - `DomainException` → uses its `code`, `httpStatus`, `details`.
   - `HttpException` carrying a `SCREAMING_SNAKE_CASE` code (in the instance
     or its payload, e.g. the custom ValidationPipe) → uses that code.
   - Built-in `HttpException` (`NotFoundException`, `BadRequestException`, …)
     → mapped from HTTP status to a generic stable code (`NOT_FOUND`,
     `BAD_REQUEST`, …); per-field validation messages preserved under
     `details`.
   - Anything else → `INTERNAL_ERROR` 500, with a generic message. Internals
     are logged, never leaked to the client.

3. **Validation errors**: `main.ts` configures the global `ValidationPipe`
   with `validationExceptionFactory`, which throws a `BadRequestException`
   whose payload carries `error: 'VALIDATION_ERROR'` and the per-field
   messages under `details.messages`.

## Adding a new error

1. Add the code to `ErrorCode` in `src/common/exceptions/error-code.ts`.
2. Create the exception extending `DomainException` (pass `message`, the new
   code, and the `HttpStatus`). Override `details` if you need extra fields.
3. Throw it from the use case. Controllers never build error responses.
4. Document the code in `docs/API_ENDPOINTS.md` → "Catálogo de códigos de
   error".
5. **Consumer sync**: add `errors.server.<NEW_CODE>` i18n keys in
   `mekapal-mobile` and `mekapal-web/apps/console`. Run the
   `api-contract-sync` agent for the affected module.

## Consumer contract

- Clients read the code from the **`error`** field.
- `mekapal-mobile`: `utils/api-error.ts` (`parseApiError`).
- `mekapal-web/apps/console`: per-feature `api/` layer.
- Unknown codes should fall back to a generic localized message.
