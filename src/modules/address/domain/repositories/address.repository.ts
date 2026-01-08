import { Address } from '../entities/address.entity';

export interface CreateAddressData {
  alias: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactPhone?: string;
  isDefault?: boolean;
}

export type UpdateAddressData = Partial<CreateAddressData>;

export interface IAddressRepository {
  create(userId: string, data: CreateAddressData): Promise<Address>;
  findById(id: string): Promise<Address | null>;
  findByUserId(userId: string): Promise<Address[]>;
  countByUserId(userId: string): Promise<number>;
  update(id: string, data: UpdateAddressData): Promise<Address>;
  delete(id: string): Promise<void>;
  setDefault(id: string, userId: string): Promise<Address>;
  unsetDefaultForUser(userId: string): Promise<void>;
}
