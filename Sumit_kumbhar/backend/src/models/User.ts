import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  username: string; // unique lowercase identifier
  passwordHash: string;
  businessName: string;
  phone: string; // owner's WhatsApp number
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    businessName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
