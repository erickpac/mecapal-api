import { Injectable, Inject } from '@nestjs/common';
import { MATCHING_TOKENS } from '../../domain/constants';
import {
  IMatchingService,
  MatchingCriteria,
} from '../../domain/interfaces';
import { MatchedTransporter } from '../../domain/entities';

@Injectable()
export class FindEligibleTransportersUseCase {
  constructor(
    @Inject(MATCHING_TOKENS.IMatchingService)
    private readonly matchingService: IMatchingService,
  ) {}

  async execute(criteria: MatchingCriteria): Promise<MatchedTransporter[]> {
    return this.matchingService.findEligibleTransporters(criteria);
  }
}
