import cors from 'cors';
import userRoutes from './routes/user';
import reviewRoutes from './routes/review';
import reviewRoutes from './routes/review';
import express from 'express';
import { config } from './config';
import { errorHandler } from './middleware/error';

// Import routes
import authRoutes from './routes/auth';
import listingRoutes from './routes/listings';
import ledgerRoutes from './routes/ledger';

const app = express();
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reviews', reviewRoutes);

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

// Start Server
app.listen(config.port, () => {
  console.log(`🚀 ResourceLink API running on http://localhost:${config.port}`);
});