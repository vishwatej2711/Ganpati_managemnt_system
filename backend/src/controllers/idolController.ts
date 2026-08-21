import { Response } from 'express';
import { Idol } from '../models/Idol';
import { AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '../config/cloudinary';

export async function getIdols(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const idols = await Idol.find({ owner: req.user.id }).sort({ name: 1 });
    return res.json(idols);
  } catch (error) {
    console.error('Error fetching idols:', error);
    return res.status(500).json({ message: 'Error retrieving idols.' });
  }
}

export async function createIdol(req: AuthRequest, res: Response) {
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

    const { name, availableCount } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Idol name is required.' });
    }

    try {
      const existing = await Idol.findOne({
        owner: req.user.id,
        name: name.trim(),
      });
      if (existing) {
        return res.status(400).json({ message: `An idol named "${name}" already exists in your inventory.` });
      }

      // Upload photo if present in request
      let photoUrl = undefined;
      if (req.file) {
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        photoUrl = uploadResult.secure_url;
      }

      const idol = await Idol.create({
        owner: req.user.id,
        name: name.trim(),
        availableCount: availableCount !== undefined ? Number(availableCount) : 0,
        photo: photoUrl || undefined,
      });
      return res.status(201).json(idol);
    } catch (error) {
      console.error('Error creating idol:', error);
      return res.status(500).json({ message: 'Error creating idol.' });
    }
  });
}

export async function updateIdol(req: AuthRequest, res: Response) {
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

    const { name, availableCount, clearPhoto } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Idol name is required.' });
    }

    try {
      const existing = await Idol.findOne({
        owner: req.user.id,
        name: name.trim(),
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res.status(400).json({ message: `An idol named "${name}" already exists in your inventory.` });
      }

      const idol = await Idol.findOne({ _id: req.params.id, owner: req.user.id });
      if (!idol) {
        return res.status(404).json({ message: 'Idol not found or access denied.' });
      }

      idol.name = name.trim();
      idol.availableCount = availableCount !== undefined ? Number(availableCount) : 0;

      // Handle Cloudinary Image replacements and deletions
      if (clearPhoto === 'true') {
        if (idol.photo) {
          const oldPublicId = getPublicIdFromUrl(idol.photo);
          if (oldPublicId) {
            deleteFromCloudinary(oldPublicId); // non-blocking background task
          }
          idol.photo = undefined;
        }
      } else if (req.file) {
        // Upload new image file to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.buffer);

        // Delete old image from Cloudinary if it exists
        if (idol.photo) {
          const oldPublicId = getPublicIdFromUrl(idol.photo);
          if (oldPublicId) {
            deleteFromCloudinary(oldPublicId); // non-blocking background task
          }
        }

        idol.photo = uploadResult.secure_url;
      }

      await idol.save();
      return res.json(idol);
    } catch (error) {
      console.error('Error updating idol:', error);
      return res.status(500).json({ message: 'Error updating idol.' });
    }
  });
}

export async function deleteIdol(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const idol = await Idol.findOne({ _id: req.params.id, owner: req.user.id });
    if (!idol) {
      return res.status(404).json({ message: 'Idol not found or access denied.' });
    }

    // Delete image from Cloudinary before dropping document
    if (idol.photo) {
      const oldPublicId = getPublicIdFromUrl(idol.photo);
      if (oldPublicId) {
        deleteFromCloudinary(oldPublicId); // non-blocking background task
      }
    }

    await Idol.deleteOne({ _id: req.params.id, owner: req.user.id });
    return res.json({ message: 'Idol deleted successfully.' });
  } catch (error) {
    console.error('Error deleting idol:', error);
    return res.status(500).json({ message: 'Error deleting idol.' });
  }
}

export async function incrementCount(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const idol = await Idol.findOne({ _id: req.params.id, owner: req.user.id });
    if (!idol) {
      return res.status(404).json({ message: 'Idol not found or access denied.' });
    }
    idol.availableCount += 1;
    await idol.save();
    return res.json(idol);
  } catch (error) {
    console.error('Error incrementing idol count:', error);
    return res.status(500).json({ message: 'Error updating count.' });
  }
}

export async function decrementCount(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const idol = await Idol.findOne({ _id: req.params.id, owner: req.user.id });
    if (!idol) {
      return res.status(404).json({ message: 'Idol not found or access denied.' });
    }
    if (idol.availableCount > 0) {
      idol.availableCount -= 1;
      await idol.save();
    }
    return res.json(idol);
  } catch (error) {
    console.error('Error decrementing idol count:', error);
    return res.status(500).json({ message: 'Error updating count.' });
  }
}
