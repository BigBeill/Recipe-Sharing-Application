import mongoose from 'mongoose';
import { env } from './env';

export async function connectMongoose(): Promise<void> {
   try {
      await mongoose.connect(env.MONGOOSE_URL);
      console.log('Connected to MongoDB');
   } 
   catch (error) {
      console.error('MongoDB connection failed:', error);
      process.exit(1);
   }
}

export async function disconnectMongoose(): Promise<void> {
  await mongoose.disconnect();
}