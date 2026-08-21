# 🕉️ Multi-Owner Ganpati Booking & Management Notebook

A simple, mobile-first website designed for Ganpati idol manufacturing and selling businesses. Built as an internal digital record-keeping notebook for multiple store owners (uncles) to manage their independent inventories and bookings using a single shared database.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** v18+ (tested on v22.17.0)
- **MongoDB** running locally on standard port `27017` (or MongoDB Atlas connection string)

### 2. Setup & Installation
Run the install command from the root directory:
```bash
npm run install-all
```
This automatically installs backend and frontend node packages, applying React 19 dependency resolutions.

### 3. Setup Environment Variables
Configure these variables in your environment or inside a `.env` file in the `/backend` folder:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ganpati_management
JWT_SECRET=festive_ganpati_secret_key_2026
```
*(To use a cloud database in production, set `MONGODB_URI` to your MongoDB Atlas connection string).*

### 4. Launch System
Start the database connection and boot both backend and frontend applications concurrently using a single command:
```bash
npm run dev
```
- **Frontend client** launches at: [http://localhost:5173](http://localhost:5173)
- **Backend API** launches at: [http://localhost:5000](http://localhost:5000)

*Note: Registration and login protect the application. Create an owner account on first start.*

---

## 📦 Project Architecture & Folders

```
Sumit_kumbhar/
├── backend/
│   ├── src/
│   │   ├── config/          # Database loader (db.ts)
│   │   ├── controllers/     # Route logic (authController, idolController, bookingController, dashboardController)
│   │   ├── middleware/      # JWT auth filter (auth.ts)
│   │   ├── models/          # Mongoose Schemas (User, Idol, Booking)
│   │   ├── routes/          # API route definitions (api.ts)
│   │   └── index.ts         # Server entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/      # Route guards (ProtectedRoute.tsx)
    │   ├── context/         # Owner state (AuthContext.tsx)
    │   ├── pages/           # Dashboard (Home), Login, Register, BookingsList, NewBooking, BookingDetails, EditBooking, IdolInventory
    │   ├── services/        # Axios API client (api.ts)
    │   ├── types/           # App interface definitions (index.ts)
    │   └── App.tsx          # Client routing mapping
    └── package.json
```

---

## 💾 Database Schema Layout

### 1. User
- `username` (String, unique) — Owner login username
- `passwordHash` (String) — Securely hashed with Bcryptjs
- `businessName` (String) — Store brand name (e.g. SK Arts)

### 2. Idol (Inventory Stock)
- `owner` (ObjectId ref User) — Owner association
- `name` (String) — Model name
- `availableCount` (Number) — Available stock count
- `photo` (String, base64) — Stock catalog photo
- *Unique constraint*: `{ owner: 1, name: 1 }` (unique name per owner)

### 3. Booking
- `owner` (ObjectId ref User) — Owner association
- `bookingId` (String) — Scoped sequence (e.g., `BK-001`)
- `idolId` (ObjectId ref Idol) — Optional linked stock idol type
- `idolName` (String) — Snapshot of selected style name
- `customerName` (String) — Client full name
- `phone` (String) — Client contact phone
- `size` (String) — Sizing/height custom value
- `price` (Number) — Final price
- `advanceAmount` (Number) — Deposit cash collected
- `color` (String) — Paint color specifications
- `clothesDescription` (String) — Vastra description
- `description` (String) — Generic description/notes
- `photo` (String, base64) — Captured photo
- `bookingDate` (Date) — Timestamp
- `status` (Enum: `Booked` | `Cancelled`)
- *Unique constraint*: `{ owner: 1, bookingId: 1 }` (unique booking code per owner)
