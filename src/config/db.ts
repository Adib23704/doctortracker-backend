import dns from 'node:dns';
import mongoose from 'mongoose';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in environments where setting DNS servers is not supported
}

export const connectDB = async (): Promise<typeof mongoose> => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/doctortracker';

  try {
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('[Database] Failed to connect to MongoDB:', error);
    }
    throw error;
  }
};
