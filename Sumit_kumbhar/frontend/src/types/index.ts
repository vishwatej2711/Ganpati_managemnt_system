export interface Idol {
  _id: string;
  name: string;
  availableCount: number;
  photo?: string; // base64 string representation
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  bookingId: string;
  idolId?: string; // Optional for custom idols
  idolName: string;
  customerName?: string;
  phone?: string;
  size?: string;
  price?: number;
  advanceAmount?: number;
  clothesDescription?: string;
  photo?: string; // base64 string
  idolPhoto?: string; // fallback base model photo returned from backend
  bookingDate: string;
  status: 'Booked' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalBookings: number;
  totalIdolTypes: number;
  recentBookings: Booking[];
}
