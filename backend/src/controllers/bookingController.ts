import { Response } from 'express';
import { Booking } from '../models/Booking';
import { Idol } from '../models/Idol';
import { AuthRequest } from '../middleware/auth';
import { backupOwnerBookings } from '../config/backupUtility';
import { upload } from '../middleware/upload';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '../config/cloudinary';

// Helper to generate sequential Booking ID (scoped to owner)
async function generateBookingId(ownerId: string): Promise<string> {
  const lastBooking = await Booking.findOne({ owner: ownerId }).sort({ createdAt: -1 });
  if (!lastBooking) {
    return 'BK-001';
  }
  const lastId = lastBooking.bookingId; // e.g. BK-024
  const numMatch = lastId.match(/BK-(\d+)/);
  if (numMatch) {
    const nextNum = parseInt(numMatch[1], 10) + 1;
    return `BK-${String(nextNum).padStart(3, '0')}`;
  }
  return 'BK-001';
}

export async function getBookings(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const { search } = req.query;
    let query: any = { owner: req.user.id };

    if (search) {
      const searchStr = String(search).trim();
      query.customerName = { $regex: searchStr, $options: 'i' };
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ message: 'Error retrieving bookings.' });
  }
}

export async function getBookingById(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const booking = await Booking.findOne({ _id: req.params.id, owner: req.user.id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or access denied.' });
    }

    let idolPhoto = undefined;
    if (!booking.photo && booking.idolId) {
      const idol = await Idol.findOne({ _id: booking.idolId, owner: req.user.id });
      if (idol && idol.photo) {
        idolPhoto = idol.photo;
      }
    }

    return res.json({
      ...booking.toObject(),
      idolPhoto,
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return res.status(500).json({ message: 'Error retrieving booking.' });
  }
}

export async function createBooking(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  // Parse multipart file upload using Multer middleware manually for localized error handling
  upload.single('photo')(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Image upload validation failed.' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const {
      idolId,
      customIdolName,
      customerName,
      phone,
      size,
      price,
      advanceAmount,
      clothesDescription,
      description,
    } = req.body;

    if (!idolId) {
      return res.status(400).json({ message: 'Please select an idol or choose Custom.' });
    }
    if (idolId === 'custom' && !customIdolName?.trim()) {
      return res.status(400).json({ message: 'Please enter a custom idol name.' });
    }

    try {
      let finalIdolId: any = undefined;
      let finalIdolName = '';
      let idolRecord = null;

      if (idolId !== 'custom') {
        idolRecord = await Idol.findOne({ _id: idolId, owner: req.user.id });
        if (!idolRecord) {
          return res.status(404).json({ message: 'Selected inventory idol not found.' });
        }
        if (idolRecord.availableCount <= 0) {
          return res.status(400).json({ message: 'This idol is currently out of stock.' });
        }
        finalIdolId = idolRecord._id;
        finalIdolName = idolRecord.name;
      } else {
        finalIdolName = customIdolName.trim();
      }

      // Generate Booking ID scoped to owner
      const bookingId = await generateBookingId(req.user.id);

      // Upload image to Cloudinary if file provided in multipart body
      let photoUrl = undefined;
      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        photoUrl = uploadResult.secure_url;
      }

      // Create Booking
      const booking = await Booking.create({
        owner: req.user.id,
        bookingId,
        idolId: finalIdolId,
        idolName: finalIdolName,
        customerName: customerName || undefined,
        phone: phone || undefined,
        size: size || undefined,
        price: price !== undefined && price !== '' ? Number(price) : undefined,
        advanceAmount: advanceAmount !== undefined && advanceAmount !== '' ? Number(advanceAmount) : 0,
        clothesDescription: clothesDescription || undefined,
        description: description || undefined,
        photo: photoUrl || undefined,
        bookingDate: new Date(),
        status: 'Booked',
      });

      // Decrement stock count
      if (idolRecord) {
        idolRecord.availableCount -= 1;
        await idolRecord.save();
      }

      // Trigger local Excel CSV backup
      await backupOwnerBookings(req.user.id);

      return res.status(201).json(booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      return res.status(500).json({ message: 'Error saving booking.' });
    }
  });
}

export async function updateBooking(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  // Parse multipart file upload using Multer middleware manually for localized error handling
  upload.single('photo')(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Image upload validation failed.' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const {
      customerName,
      phone,
      size,
      price,
      advanceAmount,
      clothesDescription,
      description,
      clearPhoto, // 'true' or 'false'
      status,
    } = req.body;

    try {
      const booking = await Booking.findOne({ _id: req.params.id, owner: req.user.id });
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found or access denied.' });
      }

      booking.customerName = customerName || undefined;
      booking.phone = phone || undefined;
      booking.size = size || undefined;
      booking.price = price !== undefined && price !== '' ? Number(price) : undefined;
      booking.advanceAmount = advanceAmount !== undefined && advanceAmount !== '' ? Number(advanceAmount) : 0;
      booking.clothesDescription = clothesDescription || undefined;
      booking.description = description || undefined;

      // Handle Cloudinary Image replacements and deletions
      if (clearPhoto === 'true') {
        if (booking.photo) {
          const oldPublicId = getPublicIdFromUrl(booking.photo);
          if (oldPublicId) {
            deleteFromCloudinary(oldPublicId); // non-blocking background task
          }
          booking.photo = undefined;
        }
      } else if (req.file) {
        // Upload new image file to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.buffer);

        // Delete old image from Cloudinary if it exists
        if (booking.photo) {
          const oldPublicId = getPublicIdFromUrl(booking.photo);
          if (oldPublicId) {
            deleteFromCloudinary(oldPublicId); // non-blocking background task
          }
        }

        booking.photo = uploadResult.secure_url;
      }

      if (status && status !== booking.status) {
        booking.status = status;
      }

      await booking.save();

      // Trigger local Excel CSV backup
      await backupOwnerBookings(req.user.id);

      return res.json(booking);
    } catch (error) {
      console.error('Error updating booking:', error);
      return res.status(500).json({ message: 'Error updating booking.' });
    }
  });
}

export async function cancelBooking(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const booking = await Booking.findOne({ _id: req.params.id, owner: req.user.id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or access denied.' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }

    booking.status = 'Cancelled';

    // Delete image from Cloudinary on cancellation to conserve storage
    if (booking.photo) {
      const oldPublicId = getPublicIdFromUrl(booking.photo);
      if (oldPublicId) {
        deleteFromCloudinary(oldPublicId); // non-blocking background task
      }
      booking.photo = undefined;
    }

    await booking.save();

    // Return stock count
    if (booking.idolId) {
      const idol = await Idol.findOne({ _id: booking.idolId, owner: req.user.id });
      if (idol) {
        idol.availableCount += 1;
        await idol.save();
      }
    }

    // Trigger local Excel CSV backup
    await backupOwnerBookings(req.user.id);

    return res.json(booking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({ message: 'Error cancelling booking.' });
  }
}

export async function exportBookings(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const csvContent = await backupOwnerBookings(req.user.id);
    
    // Set download headers
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings_backup.csv');
    return res.send(csvContent);
  } catch (error) {
    console.error('Error exporting bookings CSV:', error);
    return res.status(500).json({ message: 'Error exporting backup file.' });
  }
}
