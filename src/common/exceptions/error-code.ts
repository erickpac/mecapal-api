/**
 * Central registry of every stable, machine-readable error code the API can
 * emit. Clients (mobile, console) map these codes to localized strings via
 * `errors.server.*` i18n keys — the human `message` in the response is
 * dev/log-facing only and is never displayed.
 *
 * Codes are SCREAMING_SNAKE_CASE and must remain stable: renaming one is a
 * breaking contract change that requires a coordinated consumer sync.
 */
export const ErrorCode = {
  // --- Generic / cross-cutting ---
  /** Request body/params failed class-validator validation. */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  /** Unhandled / unexpected server error. Internals are never leaked. */
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  /** Generic 400 with no more specific domain code. */
  BAD_REQUEST: 'BAD_REQUEST',
  /** Generic 401 (missing/invalid auth) with no more specific domain code. */
  UNAUTHORIZED: 'UNAUTHORIZED',
  /** Generic 403 (authenticated but not allowed). */
  FORBIDDEN: 'FORBIDDEN',
  /** Generic 404 with no more specific domain code. */
  NOT_FOUND: 'NOT_FOUND',
  /** Generic 409 with no more specific domain code. */
  CONFLICT: 'CONFLICT',
  /** Too many requests (throttled). */
  RATE_LIMITED: 'RATE_LIMITED',

  // --- Cognito / auth ---
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_CONFIRMED: 'USER_NOT_CONFIRMED',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  INVALID_CODE: 'INVALID_CODE',
  EXPIRED_CODE: 'EXPIRED_CODE',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_TOKEN: 'INVALID_TOKEN',
  UNAUTHORIZED_ROLE: 'UNAUTHORIZED_ROLE',
  NEW_PASSWORD_REQUIRED: 'NEW_PASSWORD_REQUIRED',

  // --- Account deletion ---
  DELETION_BLOCKED: 'DELETION_BLOCKED',
  DELETION_ALREADY_SCHEDULED: 'DELETION_ALREADY_SCHEDULED',
  DELETION_NOT_SCHEDULED: 'DELETION_NOT_SCHEDULED',

  // --- User ---
  EMAIL_ALREADY_TAKEN: 'EMAIL_ALREADY_TAKEN',

  // --- Address ---
  ADDRESS_NOT_FOUND: 'ADDRESS_NOT_FOUND',
  ADDRESS_IN_USE: 'ADDRESS_IN_USE',
  ADDRESS_LIMIT_EXCEEDED: 'ADDRESS_LIMIT_EXCEEDED',

  // --- Vehicle ---
  VEHICLE_NOT_FOUND: 'VEHICLE_NOT_FOUND',
  VEHICLE_IN_USE: 'VEHICLE_IN_USE',
  VEHICLE_LIMIT_EXCEEDED: 'VEHICLE_LIMIT_EXCEEDED',

  // --- Delivery ---
  DELIVERY_REQUEST_NOT_FOUND: 'DELIVERY_REQUEST_NOT_FOUND',
  DELIVERY_OFFER_NOT_FOUND: 'DELIVERY_OFFER_NOT_FOUND',
  OFFER_WINDOW_EXPIRED: 'OFFER_WINDOW_EXPIRED',
  INVALID_REQUEST_STATUS: 'INVALID_REQUEST_STATUS',
  INVALID_OFFER_STATUS: 'INVALID_OFFER_STATUS',
  DUPLICATE_OFFER: 'DUPLICATE_OFFER',

  // --- Order ---
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  INVALID_ORDER_STATUS: 'INVALID_ORDER_STATUS',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',

  // --- Payment ---
  PAYMENT_METHOD_NOT_FOUND: 'PAYMENT_METHOD_NOT_FOUND',
  TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INVALID_PAYMENT_METHOD: 'INVALID_PAYMENT_METHOD',

  // --- Bank account ---
  BANK_ACCOUNT_NOT_FOUND: 'BANK_ACCOUNT_NOT_FOUND',
  BANK_ACCOUNT_NOT_VERIFIED: 'BANK_ACCOUNT_NOT_VERIFIED',
  DUPLICATE_BANK_ACCOUNT: 'DUPLICATE_BANK_ACCOUNT',
  BANK_ACCOUNT_HAS_SETTLEMENTS: 'BANK_ACCOUNT_HAS_SETTLEMENTS',

  // --- Settlement ---
  SETTLEMENT_NOT_FOUND: 'SETTLEMENT_NOT_FOUND',
  SETTLEMENT_ALREADY_PAID: 'SETTLEMENT_ALREADY_PAID',
  SETTLEMENT_ALREADY_EXISTS: 'SETTLEMENT_ALREADY_EXISTS',

  // --- Review ---
  REVIEW_NOT_FOUND: 'REVIEW_NOT_FOUND',
  REVIEW_ALREADY_EXISTS: 'REVIEW_ALREADY_EXISTS',
  INVALID_REVIEW_TARGET: 'INVALID_REVIEW_TARGET',
  ORDER_NOT_COMPLETED: 'ORDER_NOT_COMPLETED',

  // --- Incident ---
  INCIDENT_NOT_FOUND: 'INCIDENT_NOT_FOUND',
  INVALID_INCIDENT_STATUS: 'INVALID_INCIDENT_STATUS',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
