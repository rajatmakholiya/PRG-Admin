import mongoose, { Document, Schema, Model, Connection } from 'mongoose';

export interface IAddress {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
}

export const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
}, { timestamps: true });

export function getUserModel(connection: Connection): Model<IUser> {
  return connection.models.User || connection.model<IUser>('User', UserSchema);
}

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;