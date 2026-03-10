import { UserRole } from '../../../cognito/domain/enums/user-role.enum';

export interface UserListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  companyName: string | null;
  createdAt: Date;
}

export interface UserListResult {
  data: UserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserListQuery {
  role?: UserRole;
  search?: string;
  sort: 'recent' | 'oldest';
  page: number;
  limit: number;
}

export interface IUserManagementRepository {
  findUsers(query: UserListQuery): Promise<UserListResult>;
}
