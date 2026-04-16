import './loadenv.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { checkOverdueTools } from './utils/overdueChecker.js';

// Import your routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import toolRoutes from './routes/tool.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import categoryRoutes from './routes/category.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import superAdminRoutes from './routes/superadmin.routes.js';
import orgRoutes from './routes/org.routes.js';
import paymentRoutes from './routes/payment.routes.js';
// Environment variables loaded via import './loadenv.js'

import connectDB from './utils/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); 
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true })); 

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});


// Global Error Logger to File (Listeners)
import fs from 'fs';
process.on('uncaughtException', (err) => {
  fs.appendFileSync('error.log', `[${new Date().toISOString()}] UNCAUGHT EXCEPTION: ${err.message}\n${err.stack}\n`);
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  fs.appendFileSync('error.log', `[${new Date().toISOString()}] UNHANDLED REJECTION: ${reason}\n`);
  console.error('UNHANDLED REJECTION:', reason);
});

// Start the application
const startServer = async () => {
  console.log(`[${new Date().toISOString()}] Initializing System Core...`);
  try {
    // Attempt DB connection first
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`[${new Date().toISOString()}] 🚀 Server RUNNING on port ${PORT}`);
      console.log(`[${new Date().toISOString()}] Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // List all registered tool routes for verification
      console.log('\n--- Registered Tool Routes ---');
      if (toolRoutes && toolRoutes.stack) {
        toolRoutes.stack.forEach(r => {
          if (r.route) {
            const methods = Object.keys(r.route.methods).join(', ').toUpperCase();
            console.log(`${methods} /api/tools${r.route.path}`);
          }
        });
      } else {
        console.log('Unable to list routes: toolRoutes.stack is undefined');
      }
      console.log('-----------------------------\n');
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ FATAL: Backend failed to start due to database error.`);
    console.warn(`[${new Date().toISOString()}] System will attempt to run anyway, but database dependent routes will fail.`);
    
    // Start server anyway so health checks can report the error to the frontend
    app.listen(PORT, () => {
      console.log(`[${new Date().toISOString()}] ⚠️ Server RUNNING (Degraded Mode) on port ${PORT}`);
    });
  }
};

startServer();

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
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/payment', paymentRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({ 
    status: 'OK', 
    database: dbStatus,
    timestamp: new Date().toISOString() 
  });
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


// Final Error Handler Middleware
app.use((err, req, res, next) => {
  try {
    fs.appendFileSync('error.log', `[${new Date().toISOString()}] ROUTE ERROR: ${err.message}\n${err.stack}\nBody: ${JSON.stringify(req.body)}\n`);
  } catch (e) {}
  console.error('ROUTE ERROR:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start the scheduled task
scheduleOverdueCheck();
