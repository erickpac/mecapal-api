import { MatchedTransporter } from '../entities/matched-transporter.entity';
import { LoadType } from '../../../vehicle/domain/enums/load-type.enum';

export interface MatchingCriteria {
  pickupMunicipality: string;
  deliveryMunicipality: string;
  loadType: LoadType;
  minRating?: number;
  limit?: number;
}

export interface IMatchingService {
  findEligibleTransporters(
    criteria: MatchingCriteria,
  ): Promise<MatchedTransporter[]>;
}
