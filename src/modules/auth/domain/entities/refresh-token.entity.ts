export class RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<RefreshToken>) {
    Object.assign(this, partial);
  }
}
