import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IBankAccountRepository,
  CreateBankAccountData,
  UpdateBankAccountData,
  VerifyBankAccountData,
} from '../../domain/interfaces';
import { BankAccount } from '../../domain/entities';
import { BankAccountType, BankAccountStatus } from '../../domain/enums';
import {
  BankAccount as PrismaBankAccount,
  BankAccountType as PrismaBankAccountType,
  BankAccountStatus as PrismaBankAccountStatus,
} from '@prisma/client';

@Injectable()
export class BankAccountRepository implements IBankAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    transporterId: string,
    data: CreateBankAccountData,
  ): Promise<BankAccount> {
    // Check if this is the first bank account for the transporter
    const existingCount = await this.prisma.bankAccount.count({
      where: { transporterId },
    });

    const bankAccount = await this.prisma.bankAccount.create({
      data: {
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        accountType: data.accountType as PrismaBankAccountType,
        accountNumber: data.accountNumber,
        accountNumberLast4: data.accountNumberLast4,
        verificationDocUrl: data.verificationDocUrl,
        isDefault: existingCount === 0, // First account is default
        transporterId,
      },
    });

    return this.mapToEntity(bankAccount);
  }

  async findById(id: string): Promise<BankAccount | null> {
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!bankAccount) return null;
    return this.mapToEntity(bankAccount);
  }

  async findByTransporterId(transporterId: string): Promise<BankAccount[]> {
    const bankAccounts = await this.prisma.bankAccount.findMany({
      where: { transporterId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return bankAccounts.map((ba) => this.mapToEntity(ba));
  }

  async findDefaultByTransporterId(
    transporterId: string,
  ): Promise<BankAccount | null> {
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { transporterId, isDefault: true },
    });

    if (!bankAccount) return null;
    return this.mapToEntity(bankAccount);
  }

  async findVerifiedByTransporterId(
    transporterId: string,
  ): Promise<BankAccount[]> {
    const bankAccounts = await this.prisma.bankAccount.findMany({
      where: {
        transporterId,
        status: PrismaBankAccountStatus.VERIFIED,
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return bankAccounts.map((ba) => this.mapToEntity(ba));
  }

  async update(id: string, data: UpdateBankAccountData): Promise<BankAccount> {
    const bankAccount = await this.prisma.bankAccount.update({
      where: { id },
      data: {
        bankName: data.bankName,
        accountHolderName: data.accountHolderName,
        verificationDocUrl: data.verificationDocUrl,
      },
    });

    return this.mapToEntity(bankAccount);
  }

  async setDefault(
    transporterId: string,
    bankAccountId: string,
  ): Promise<void> {
    await this.prisma.$transaction([
      // Remove default from all transporter's bank accounts
      this.prisma.bankAccount.updateMany({
        where: { transporterId },
        data: { isDefault: false },
      }),
      // Set new default
      this.prisma.bankAccount.update({
        where: { id: bankAccountId },
        data: { isDefault: true },
      }),
    ]);
  }

  async verify(id: string, data: VerifyBankAccountData): Promise<BankAccount> {
    const bankAccount = await this.prisma.bankAccount.update({
      where: { id },
      data: {
        status: data.status as PrismaBankAccountStatus,
        rejectionReason: data.rejectionReason,
        verifiedAt:
          data.status === BankAccountStatus.VERIFIED ? new Date() : null,
      },
    });

    return this.mapToEntity(bankAccount);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.bankAccount.delete({
      where: { id },
    });
  }

  async existsByAccountNumber(
    transporterId: string,
    accountNumber: string,
  ): Promise<boolean> {
    const count = await this.prisma.bankAccount.count({
      where: {
        transporterId,
        accountNumber,
      },
    });

    return count > 0;
  }

  async hasSettlements(id: string): Promise<boolean> {
    const count = await this.prisma.settlement.count({
      where: { bankAccountId: id },
    });

    return count > 0;
  }

  private mapToEntity(bankAccount: PrismaBankAccount): BankAccount {
    return new BankAccount({
      id: bankAccount.id,
      bankName: bankAccount.bankName,
      accountHolderName: bankAccount.accountHolderName,
      accountType: bankAccount.accountType as BankAccountType,
      accountNumber: bankAccount.accountNumber,
      accountNumberLast4: bankAccount.accountNumberLast4,
      status: bankAccount.status as BankAccountStatus,
      verificationDocUrl: bankAccount.verificationDocUrl ?? undefined,
      verifiedAt: bankAccount.verifiedAt ?? undefined,
      rejectionReason: bankAccount.rejectionReason ?? undefined,
      isDefault: bankAccount.isDefault,
      transporterId: bankAccount.transporterId,
      createdAt: bankAccount.createdAt,
      updatedAt: bankAccount.updatedAt,
    });
  }
}
