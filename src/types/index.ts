export interface OrderItem {
  name: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  address: string;
  deliveryTime: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  customerName: string;
}
