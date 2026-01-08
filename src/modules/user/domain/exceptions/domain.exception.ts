/**
 * Base Domain Exception
 * Abstract base class for all domain exceptions
 */
export abstract class DomainException extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}
