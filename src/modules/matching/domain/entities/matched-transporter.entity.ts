import { Vehicle } from '../../../vehicle/domain/entities/vehicle.entity';
import { User } from '../../../cognito/domain/entities/user.entity';

export class MatchedTransporter {
  transporter: User;
  vehicle: Vehicle;
  zonePreference: 'PREFERRED' | 'NEUTRAL';
  matchScore: number;

  constructor(partial: Partial<MatchedTransporter>) {
    Object.assign(this, partial);
  }
}
