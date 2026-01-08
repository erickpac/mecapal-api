import { Injectable, Inject } from '@nestjs/common';
import { BACKOFFICE_TOKENS } from '../../domain/constants/injection-tokens';
import {
  IValidationRepository,
  PendingValidationsResult,
} from '../../domain/repositories/validation.repository';
import { PendingValidationsQueryDto } from '../dtos/pending-validations-query.dto';

@Injectable()
export class GetPendingValidationsUseCase {
  constructor(
    @Inject(BACKOFFICE_TOKENS.IValidationRepository)
    private readonly validationRepository: IValidationRepository,
  ) {}

  async execute(
    query: PendingValidationsQueryDto,
  ): Promise<PendingValidationsResult> {
    return this.validationRepository.findPendingValidations({
      type: query.type,
      search: query.search,
      sort: query.sort ?? 'recent',
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }
}
