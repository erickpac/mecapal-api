export class Address {
  id: string;
  alias: string;
  street: string;
  latitude: number | null;
  longitude: number | null;
  contactName: string | null;
  contactPhone: string | null;
  stateId: string;
  municipalityId: string;
  zoneId: string | null;
  state?: { id: string; name: string; code: string };
  municipality?: { id: string; name: string; code: string };
  zone?: {
    id: string;
    name: string;
    postalCode: string;
    latitude: number | null;
    longitude: number | null;
  } | null;
  isDefault: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Address>) {
    Object.assign(this, partial);
  }
}
