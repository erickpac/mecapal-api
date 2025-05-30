import { Route } from '../entities/route.entity';

export interface IRouteRepository {
  create(userId: string, data: Partial<Route>): Promise<Route>;
  findAll(userId: string): Promise<Route[]>;
  findById(id: string): Promise<Route | null>;
  update(id: string, data: Partial<Route>): Promise<Route>;
  delete(id: string): Promise<void>;
}
