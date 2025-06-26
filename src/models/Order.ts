import mongoose, { Schema, Model, Connection, Document } from 'mongoose';
import { IAddress, IUser } from './User'; 
export interface IOrderItem {
  productId: mongoose.Schema.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  _id: string;
  user: mongoose.Schema.Types.ObjectId | IUser;
  items: IOrderItem[];
  totalAmount: number;
  deliveryAddress: IAddress;
  status: 'Pending' | 'Confirmed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  deliveryType: 'Immediate' | 'Scheduled';
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  paymentMethod: string;
}

const OrderItemSchema: Schema<IOrderItem> = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
}, { _id: false });

const OrderSchema: Schema<IOrder> = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [OrderItemSchema], required: true },
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: Schema.Types.Mixed, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  deliveryType: {
    type: String,
    enum: ['Immediate', 'Scheduled'],
    required: true,
  },
  paymentMethod: { type: String, required: true },
  scheduledAt: { type: Date },
}, { timestamps: true, collection: 'orders' });

export default function getOrderModel(connection: Connection): Model<IOrder> {
  return connection.models.Order || connection.model<IOrder>('Order', OrderSchema);
}