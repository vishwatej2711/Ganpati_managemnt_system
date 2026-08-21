import fs from 'fs';
import path from 'path';
import { Booking } from '../models/Booking';
import { User } from '../models/User';

// Helper to escape double quotes and wrap in quotes for Excel-safe CSV cells
function csvCell(val: any): string {
  if (val === undefined || val === null) {
    return '""';
  }
  const str = String(val);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function backupOwnerBookings(ownerId: string): Promise<string> {
  try {
    // 1. Fetch user to obtain business name
    const user = await User.findById(ownerId);
    if (!user) {
      console.warn(`User with ID ${ownerId} not found, skipping backup file export.`);
      return '';
    }

    // Sanitize business name for files
    const cleanBusinessName = user.businessName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    
    // 2. Fetch all bookings for this owner
    const bookings = await Booking.find({ owner: ownerId }).sort({ createdAt: -1 });

    // 3. Compile CSV columns
    const headers = [
      'Booking ID',
      'Customer Name',
      'Phone Number',
      'Selected Model',
      'Size / Height',
      'Total Price (Rs.)',
      'Advance Amount (Rs.)',
      'Remaining Balance (Rs.)',
      'Custom Paint Color',
      'Vastra / Clothes Description',
      'Description / Notes',
      'Booking Date',
      'Order Status'
    ];

    const rows = [headers.join(',')];

    for (const b of bookings) {
      const price = b.price !== undefined ? b.price : 0;
      const advance = b.advanceAmount !== undefined ? b.advanceAmount : 0;
      const remaining = price - advance;
      const dateStr = new Date(b.bookingDate).toLocaleDateString('en-IN');

      const dataRow = [
        csvCell(b.bookingId),
        csvCell(b.customerName || 'N/A'),
        csvCell(b.phone || 'N/A'),
        csvCell(b.idolName),
        csvCell(b.size || 'N/A'),
        csvCell(price),
        csvCell(advance),
        csvCell(remaining),
        csvCell(b.color || 'N/A'),
        csvCell(b.clothesDescription || 'N/A'),
        csvCell(b.description || 'N/A'),
        csvCell(dateStr),
        csvCell(b.status)
      ];

      rows.push(dataRow.join(','));
    }

    const csvContent = '\ufeff' + rows.join('\r\n'); // Add UTF-8 BOM so Excel opens special characters/currency correctly

    // 4. Write backup file
    const backupsDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const filename = `bookings_${cleanBusinessName}_backup.csv`;
    const filepath = path.join(backupsDir, filename);
    fs.writeFileSync(filepath, csvContent, 'utf8');

    console.log(`Live Excel backup updated successfully: backups/${filename}`);
    return csvContent;
  } catch (error) {
    console.error('Failed to export CSV backup for owner:', ownerId, error);
    return '';
  }
}
