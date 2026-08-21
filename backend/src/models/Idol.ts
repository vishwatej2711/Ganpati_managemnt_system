import { Schema, model, Document } from 'mongoose';

export interface IIdol extends Document {
  owner: Schema.Types.ObjectId;
  name: string;
  availableCount: number;
  photo?: string; // base64 string
  createdAt: Date;
  updatedAt: Date;
}

const IdolSchema = new Schema<IIdol>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    availableCount: { type: Number, required: true, default: 0 },
    photo: { type: String },
  },
  { timestamps: true }
);

// Unique idol names per owner
IdolSchema.index({ owner: 1, name: 1 }, { unique: true });

export const Idol = model<IIdol>('Idol', IdolSchema);
