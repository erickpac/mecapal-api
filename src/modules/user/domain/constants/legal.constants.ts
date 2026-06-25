/**
 * Single source of truth for the legal document version the backend
 * stamps when a user accepts. Update this string on each legal release
 * (the lawyer owns the ver.rev). The client never sends the version.
 */
export const CURRENT_TERMS_VERSION = '2.1';

export const LEGAL_DOCUMENT_TYPE = {
  TERMS: 'TERMS',
} as const;

export type LegalDocumentType =
  (typeof LEGAL_DOCUMENT_TYPE)[keyof typeof LEGAL_DOCUMENT_TYPE];
