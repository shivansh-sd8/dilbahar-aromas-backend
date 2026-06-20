import app from './app.js';
import env from './config/env.js';
import logger from './config/logger.js';
import connectDB from './config/db.js';

async function start() {
  try {
    await connectDB();
    const server = app.listen(env.port, () => {
      logger.info(`API listening on port ${env.port} (${env.nodeEnv})`);
    });

    const shutdown = (signal) => {
      logger.info(`${signal} received — shutting down`);
      server.close(() => process.exit(0));
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    logger.error(`Startup failed: ${err.message}`);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
});

start();
