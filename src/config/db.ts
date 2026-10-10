import dns from 'node:dns';
import mongoose from 'mongoose';

// Ensure Node.js resolves MongoDB Atlas SRV records properly on Windows / local DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in environments where setting DNS servers is not supported
}

export const connectDB = async (): Promise<typeof mongoose> => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/doctortracker';

  try {
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
    });

    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('[Database] Failed to connect to MongoDB:', error);
    throw error;
  }
};
