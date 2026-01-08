import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IAddressRepository,
  CreateAddressData,
  UpdateAddressData,
} from '../../domain/repositories/address.repository';
import { Address } from '../../domain/entities/address.entity';

@Injectable()
export class AddressRepository implements IAddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateAddressData): Promise<Address> {
    const address = await this.prisma.address.create({
      data: {
        ...data,
        userId,
      },
    });

    return new Address(address);
  }

  async findById(id: string): Promise<Address | null> {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) return null;

    return new Address(address);
  }

  async findByUserId(userId: string): Promise<Address[]> {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return addresses.map((address) => new Address(address));
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.address.count({
      where: { userId },
    });
  }

  async update(id: string, data: UpdateAddressData): Promise<Address> {
    const address = await this.prisma.address.update({
      where: { id },
      data,
    });

    return new Address(address);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.address.delete({
      where: { id },
    });
  }

  async setDefault(id: string, userId: string): Promise<Address> {
    await this.unsetDefaultForUser(userId);

    const address = await this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    return new Address(address);
  }

  async unsetDefaultForUser(userId: string): Promise<void> {
    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }
}
