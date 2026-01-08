export class Address {
  id: string;
  alias: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  contactName: string | null;
  contactPhone: string | null;
  isDefault: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Address>) {
    Object.assign(this, partial);
  }
}
