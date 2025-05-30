export class Location {
  address: string;
  latitude?: number;
  longitude?: number;
}

export class Route {
  id: string;
  origin: Location;
  destination: Location;
  basePrice: number;
  maxWeight?: number;
  isAvailable: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
