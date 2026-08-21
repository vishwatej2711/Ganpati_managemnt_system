import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ganpati_management';
  try {
    await mongoose.connect(uri);
    console.log('MongoDB database connected successfully!');
  } catch (error) {
    console.error('MongoDB database connection error:', error);
    process.exit(1);
  }
}
