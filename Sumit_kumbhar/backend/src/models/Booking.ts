import { Schema, model, Document } from 'mongoose';

export interface IBooking extends Document {
  owner: Schema.Types.ObjectId;
  bookingId: string; // e.g. BK-001 (unique per owner)
  idolId?: Schema.Types.ObjectId; // Optional for custom idols
  idolName: string;
  customerName?: string;
  phone?: string;
  size?: string;
  price?: number;
  advanceAmount?: number;
  color?: string;
  clothesDescription?: string;
  description?: string; // generic description/notes
  photo?: string; // base64 string
  bookingDate: Date;
  status: 'Booked' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: String, required: true, index: true },
    idolId: { type: Schema.Types.ObjectId, ref: 'Idol' },
    idolName: { type: String, required: true },
    customerName: { type: String, trim: true },
    phone: { type: String, trim: true },
    size: { type: String, trim: true },
    price: { type: Number },
    advanceAmount: { type: Number, default: 0 },
    color: { type: String, trim: true },
    clothesDescription: { type: String, trim: true },
    description: { type: String, trim: true },
    photo: { type: String }, // base64 photo
    bookingDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Booked', 'Cancelled'], default: 'Booked' },
  },
  { timestamps: true }
);

// Compound unique index for bookingId per owner
BookingSchema.index({ owner: 1, bookingId: 1 }, { unique: true });

// Text index for searches
BookingSchema.index({ customerName: 'text', phone: 'text', bookingId: 'text', idolName: 'text' });

export const Booking = model<IBooking>('Booking', BookingSchema);
