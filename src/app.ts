import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import errorHandler from './middleware/errorHandler';
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

// Health check endpoint (always available)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(apiKeyMiddleware);

// Graceful shutdown handler
const gracefulShutdown = async () => {
  try {
    process.exit(0);
  } catch (error) {
    logError(`Error during graceful shutdown: ${error}`);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server after ensuring connections
const startServer = async () => {
  try {
    // 1. Load secrets FIRST
    await loadSecrets();

    // 2. Initialize database
    await initDatabase();
    logInfo('Database connection established successfully');

    // 3. Initialize SQS Consumer
    const consumer = new AdEventConsumer();
    
    if (process.env.NODE_ENV === 'development') {
      await sqsClient.ensureQueueExists('adcrivo-ad-events-local').catch(err => {
        logError(`Warning: Could not ensure queue exists: ${err}`);
      });
    }

    consumer.startPolling().catch(err => {
      logError(`SQS Consumer error: ${err}`);
    });
    logInfo('SQS Consumer started in background');

    // 4. Import and Register Routes ONLY after secrets are loaded
    // This prevents premature Prisma initialization
    const adsRoutes = (await import('./routes/adEvent.routes')).default;
    app.use('/api/adEvent', adsRoutes);

    // 5. Error handling
    app.use(errorHandler);

    // 6. Start listening
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
