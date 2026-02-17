import express from 'express';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { checkOverdueTools } from './utils/overdueChecker.js';

// Import your routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import toolRoutes from './routes/tool.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import categoryRoutes from './routes/category.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allows cross-origin requests
app.use(express.json({ limit: '50mb' })); // Allows parsing of JSON request bodies with 50MB limit for images
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Support URL-encoded bodies

// --- Database Connection ---
console.log('Attempting to connect to MongoDB...');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'Not found');

mongoose.connect(process.env.MONGO_URI, {
  // Removed deprecated options
})
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch(err => {
    console.error('Database connection error:', err);
    // Don't exit here, let's start the server anyway for testing
  });

// --- API Routes ---
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Tool Room API' });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Other routes
app.use('/api/users', userRoutes);
app.use('/api/tools', toolRoutes); // Mount tool routes at /api/tools
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// --- Scheduled Tasks ---
// Check for overdue tools every day at midnight
const scheduleOverdueCheck = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const timeUntilMidnight = tomorrow.getTime() - now.getTime();

  setTimeout(() => {
    // Run the check immediately when the timeout completes
    checkOverdueTools();

    // Then set up a daily interval
    setInterval(checkOverdueTools, 24 * 60 * 60 * 1000); // 24 hours
  }, timeUntilMidnight);
};

// Start the scheduled task
scheduleOverdueCheck();

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});