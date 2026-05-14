/**
 * The user module's domain exceptions extend the shared, API-wide
 * `DomainException` base (see `src/common/exceptions/domain.exception.ts`),
 * which carries a stable `code` and `httpStatus`. Re-exported here so existing
 * imports (`./domain.exception`) keep working.
 */
export { DomainException } from '../../../../common/exceptions/domain.exception';
