import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import { connectDB } from "./config/db.js";
import logger from "./src/utils/logger.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    logger.info('Database connected successfully');
    
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Shutting down server...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGTERM', () => {
      logger.info('Shutting down server...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
    
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();