import { IsUUID } from 'class-validator';

export class AssignBillingProfileDto {
  @IsUUID()
  profileId: string;
}
