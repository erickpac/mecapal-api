import { EntityWithImage } from '../interfaces/entity-with-image.interface';

export interface EntityRepository<T extends EntityWithImage> {
  findById(id: string): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T>;
}
