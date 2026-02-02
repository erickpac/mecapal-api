export interface OrderLocationProps {
  id: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  orderId: string;
  createdAt: Date;
}

export class OrderLocation {
  readonly id: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly speed?: number;
  readonly heading?: number;
  readonly accuracy?: number;
  readonly orderId: string;
  readonly createdAt: Date;

  constructor(props: OrderLocationProps) {
    this.id = props.id;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.speed = props.speed;
    this.heading = props.heading;
    this.accuracy = props.accuracy;
    this.orderId = props.orderId;
    this.createdAt = props.createdAt;
  }
}
