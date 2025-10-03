/**
 * Password hasher interface
 * Abstracts password hashing and comparison operations
 */
export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}
