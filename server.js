import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import { connectDB } from "./config/db.js";
import logger from "./src/utils/logger.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    logger.info('Base de données connectée avec succès');
    
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Serveur en cours d'exécution sur le port ${PORT}`);
    });
    
    // Gérer l'arrêt gracieux
    process.on('SIGINT', () => {
      logger.info('Arrêt du serveur...');
      server.close(() => {
        logger.info('Serveur fermé');
        process.exit(0);
      });
    });
    
    process.on('SIGTERM', () => {
      logger.info('Arrêt du serveur...');
      server.close(() => {
        logger.info('Serveur fermé');
        process.exit(0);
      });
    });
    
  } catch (err) {
    logger.error('Échec du démarrage du serveur:', err);
    process.exit(1);
  }
};

startServer();