import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    console.log(`[${new Date().toISOString()}] Attempting Database Connection...`);
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000, // 15 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });

    console.log(`[${new Date().toISOString()}] ✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`[${new Date().toISOString()}] Target Database: ${conn.connection.name}`);
    
    return conn.connection;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ MongoDB Connection Error: ${error.message}`);
    // If it's an IP whitelist error, the message usually contains "IP" or "whitelist"
    if (error.message.includes('M0') || error.message.includes('IP')) {
       console.error(`[${new Date().toISOString()}] CRITICAL: This looks like a MongoDB Atlas IP Whitelist error. Please ensure 0.0.0.0/0 is whitelisted.`);
    }
    throw error;
  }
};

export default connectDB;
