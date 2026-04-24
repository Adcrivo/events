import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import adsRoutes from './routes/adEvent.routes';
import errorHandler from './middleware/errorHandler';
// import { rateLimiter } from './middleware/rateLimiter';
import { apiKeyMiddleware } from './middleware/apiKey';
import { initDatabase } from './config/db.config';
import { AdEventConsumer } from './services/adEvent.consumer';
import sqsClient from './sqs/sqs.client';
import { logInfo, logError } from './utils/logger';
import { loadSecrets } from './config/secrets';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(json());

// Health check endpoint (before API key middleware)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// app.use(rateLimiter); // disabled rate limiter for now
app.use(apiKeyMiddleware);

// Routes
app.use('/api/adEvent', adsRoutes);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = async () => {
  try {
    process.exit(0);
  } catch (error) {
    logError(`Error during graceful shutdown: ${error}`);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server after ensuring connections
const startServer = async () => {
  try {
    // Load secrets from .env (local) or AWS SSM (deployed)
    await loadSecrets();

    // Initialize database connection
    await initDatabase();
    logInfo('Database connection established successfully');

    // Initialize SQS Consumer
    const consumer = new AdEventConsumer();

    // Start consumer in background (don't block server startup)
    if (process.env.NODE_ENV === 'development') {
      await sqsClient.ensureQueueExists('adcrivo-ad-events-local').catch(err => {
        logError(`Warning: Could not ensure queue exists (LocalStack may not be running): ${err}`);
      });
    }

    // Start polling without blocking
    consumer.startPolling().catch(err => {
      logError(`SQS Consumer error: ${err}`);
    });
    logInfo('SQS Consumer started in background');

    // Start the HTTP server
    app.listen(PORT, () => {
      logInfo(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logError(`Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
};

startServer();

export default app;
