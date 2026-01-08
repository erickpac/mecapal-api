import { State } from './state.entity';

export class Municipality {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  stateId: string;
  state?: State;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Municipality>) {
    Object.assign(this, partial);
  }
}
