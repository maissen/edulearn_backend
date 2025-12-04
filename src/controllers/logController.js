import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger.js';

// Helper function to read last N lines from a file
async function readLastLines(filePath, numLines) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    return lines.slice(-numLines);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return []; // File doesn't exist, return empty array
    }
    throw err;
  }
}

// Helper function to parse log entries
function parseLogEntries(lines) {
  return lines.map(line => {
    try {
      return JSON.parse(line);
    } catch (err) {
      // If parsing fails, return the raw line
      return { raw: line, timestamp: new Date().toISOString(), level: 'unknown' };
    }
  });
}

// Get recent logs
export const getLogs = async (req, res) => {
  try {
    const { count = 50, type = 'combined' } = req.query;
    const numLines = Math.min(parseInt(count) || 50, 1000); // Limit to 1000 max
    
    logger.info('Administrateur demandant les journaux', { adminId: req.user?.id, count: numLines, type });
    
    let logFilePath;
    if (type === 'error') {
      logFilePath = path.join(process.cwd(), 'logs', 'error.log');
    } else {
      logFilePath = path.join(process.cwd(), 'logs', 'combined.log');
    }
    
    const lines = await readLastLines(logFilePath, numLines);
    const parsedLogs = parseLogEntries(lines.reverse()); // Reverse to show newest first
    
    res.json({
      success: true,
      count: parsedLogs.length,
      logs: parsedLogs
    });
  } catch (err) {
    logger.error('Erreur lors de la lecture des journaux', { error: err.message, stack: err.stack });
    res.status(500).json({ 
      success: false, 
      error: 'Échec de la lecture des journaux',
      message: err.message 
    });
  }
};

// Clear all logs
export const clearLogs = async (req, res) => {
  try {
    logger.info('Administrateur effaçant tous les journaux', { adminId: req.user?.id });
    
    const logsDir = path.join(process.cwd(), 'logs');
    
    // Check if logs directory exists
    try {
      await fs.access(logsDir);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // If directory doesn't exist, create it
        await fs.mkdir(logsDir, { recursive: true });
        logger.info('Répertoire des journaux créé', { adminId: req.user?.id });
      } else {
        throw err;
      }
    }
    
    // Clear error log file
    const errorLogPath = path.join(logsDir, 'error.log');
    await fs.writeFile(errorLogPath, '');
    
    // Clear combined log file
    const combinedLogPath = path.join(logsDir, 'combined.log');
    await fs.writeFile(combinedLogPath, '');
    
    logger.info('Tous les journaux effacés avec succès', { adminId: req.user?.id });
    
    res.json({
      success: true,
      message: 'Tous les journaux effacés avec succès'
    });
  } catch (err) {
    logger.error('Erreur lors de l\'effacement des journaux', { 
      error: err.message, 
      stack: err.stack,
      adminId: req.user?.id 
    });
    
    res.status(500).json({ 
      success: false, 
      error: 'Échec de l\'effacement des journaux',
      message: err.message 
    });
  }
};

// Get log file stats
export const getLogStats = async (req, res) => {
  try {
    logger.info('Administrateur demandant les statistiques des journaux', { adminId: req.user?.id });
    
    const combinedLogPath = path.join(process.cwd(), 'logs', 'combined.log');
    const errorLogPath = path.join(process.cwd(), 'logs', 'error.log');
    
    const stats = {};
    
    try {
      const combinedStats = await fs.stat(combinedLogPath);
      stats.combined = {
        size: combinedStats.size,
        modified: combinedStats.mtime
      };
    } catch (err) {
      stats.combined = { size: 0, modified: null };
    }
    
    try {
      const errorStats = await fs.stat(errorLogPath);
      stats.error = {
        size: errorStats.size,
        modified: errorStats.mtime
      };
    } catch (err) {
      stats.error = { size: 0, modified: null };
    }
    
    res.json({
      success: true,
      stats
    });
  } catch (err) {
    logger.error('Erreur lors de l\'obtention des statistiques des journaux', { error: err.message, stack: err.stack });
    res.status(500).json({ 
      success: false, 
      error: 'Échec de l\'obtention des statistiques des journaux',
      message: err.message 
    });
  }
};

// Export logs as CSV
export const exportLogsCSV = async (req, res) => {
  try {
    const { type = 'combined' } = req.query;
    
    logger.info('Administrateur demandant l\'exportation des journaux au format CSV', { adminId: req.user?.id, type });
    
    let logFilePath;
    if (type === 'error') {
      logFilePath = path.join(process.cwd(), 'logs', 'error.log');
    } else {
      logFilePath = path.join(process.cwd(), 'logs', 'combined.log');
    }
    
    // Read all lines from the log file
    const data = await fs.readFile(logFilePath, 'utf8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    
    // Parse log entries
    const parsedLogs = parseLogEntries(lines);
    
    // Create CSV content
    const csvHeaders = ['Horodatage', 'Niveau', 'Message', 'Service', 'Métadonnées'];
    let csvContent = csvHeaders.join(',') + '\n';
    
    // Add each log entry as a row
    parsedLogs.forEach(log => {
      const row = [
        log.timestamp || '',
        log.level || '',
        `"${(log.message || log.raw || '').replace(/"/g, '""')}"`, // Escape quotes
        log.service || '',
        `"${JSON.stringify(log).replace(/"/g, '""')}"` // Full log entry as JSON string
      ];
      csvContent += row.join(',') + '\n';
    });
    
    // Set headers for CSV download
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `journaux-${type}-${timestamp}.csv`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/csv');
    
    res.send(csvContent);
    
    logger.info('Exportation des journaux au format CSV terminée', { 
      adminId: req.user?.id, 
      type, 
      count: parsedLogs.length,
      filename
    });
  } catch (err) {
    logger.error('Erreur lors de l\'exportation des journaux au format CSV', { 
      error: err.message, 
      stack: err.stack,
      adminId: req.user?.id 
    });
    
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: 'Échec de l\'exportation des journaux au format CSV',
        message: err.message 
      });
    }
  }
};