import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IOrderItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerEmail: string;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema<IOrderItem> = new Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtPurchase: { type: Number, required: true },
}, {_id: false});

export const OrderSchema: Schema<IOrder> = new Schema( // Export the schema
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerEmail: { type: String, required: true, trim: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    collection: 'OrderList', // Explicitly set the collection name for orders
  }
);

// Model compilation will be done in the API route using a specific connection
// export default Order; // Remove default export of the model
const OrderList: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default OrderList;