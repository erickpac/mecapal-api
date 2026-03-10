import { Inject, Injectable } from '@nestjs/common';
import { BACKOFFICE_TOKENS } from '../../domain/constants/injection-tokens';
import {
  IUserManagementRepository,
  UserListResult,
} from '../../domain/interfaces/user-management.repository';
import { ListUsersQueryDto } from '../dtos/list-users-query.dto';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(BACKOFFICE_TOKENS.IUserManagementRepository)
    private readonly userManagementRepository: IUserManagementRepository,
  ) {}

  async execute(query: ListUsersQueryDto): Promise<UserListResult> {
    return this.userManagementRepository.findUsers({
      role: query.role,
      search: query.search,
      sort: query.sort ?? 'recent',
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }
}
