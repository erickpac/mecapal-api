import { Prisma } from '@prisma/client';
import { LegalDocumentType } from '../constants/legal.constants';

export interface CreateTermsAcceptanceData {
  userId: string;
  documentType: LegalDocumentType;
  version: string;
}

export interface ITermsAcceptanceRepository {
  create(
    data: CreateTermsAcceptanceData,
    tx?: Prisma.TransactionClient,
  ): Promise<void>;
}
