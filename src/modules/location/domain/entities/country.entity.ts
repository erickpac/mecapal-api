export class Country {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Country>) {
    Object.assign(this, partial);
  }
}
