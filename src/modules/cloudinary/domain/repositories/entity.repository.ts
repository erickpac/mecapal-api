import { EntityWithImage } from '../interfaces/entity-with-image.interface';

export interface EntityRepository<T extends EntityWithImage> {
  findById(id: number): Promise<T | null>;
  update(id: number, data: Partial<T>): Promise<T>;
}
