import mongoose, { Document, Schema, Model, Connection } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema: Schema<IMenuItem> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for the menu item.'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description for the menu item.'],
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price for the menu item.'],
      min: [0, 'Price cannot be negative'],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'ItemList',
  }
);

export function getMenuItemModel(connection: Connection): Model<IMenuItem> {
    return connection.models.MenuItem || connection.model<IMenuItem>('MenuItem', MenuItemSchema);
}

const MenuItem: Model<IMenuItem> = mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
export default MenuItem;