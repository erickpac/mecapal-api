import { Country } from './country.entity';

export class State {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  countryId: string;
  country?: Country;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<State>) {
    Object.assign(this, partial);
  }
}
