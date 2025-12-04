import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import logger from '../utils/logger.js';

const execPromise = promisify(exec);

// Ensure backups directory exists
async function ensureBackupsDirectory() {
  const backupsDir = path.join(process.cwd(), 'backups');
  try {
    await fs.access(backupsDir);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(backupsDir, { recursive: true });
    } else {
      throw err;
    }
  }
  return backupsDir;
}

// Create database backup
export const createBackup = async (req, res) => {
  try {
    logger.info('Admin requesting database backup', { adminId: req.user?.id });
    
    // Ensure backups directory exists
    const backupsDir = await ensureBackupsDirectory();
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql.gz`;
    const filepath = path.join(backupsDir, filename);
    
    // Get database connection details from environment
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
    
    // Create mysqldump command
    const dumpCommand = `mysqldump -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} | gzip > ${filepath}`;
    
    logger.info('Creating database backup', { command: dumpCommand });
    
    // Execute the backup command
    await execPromise(dumpCommand);
    
    // Get file stats
    const stats = await fs.stat(filepath);
    
    logger.info('Database backup created successfully', { 
      filename, 
      size: stats.size,
      adminId: req.user?.id 
    });
    
    res.json({
      success: true,
      message: 'Backup created successfully',
      filename,
      size: stats.size,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    logger.error('Error creating database backup', { 
      error: err.message, 
      stack: err.stack,
      adminId: req.user?.id 
    });
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create backup',
      message: err.message 
    });
  }
};

// List available backups
export const listBackups = async (req, res) => {
  try {
    logger.info('Admin requesting backup list', { adminId: req.user?.id });
    
    const backupsDir = path.join(process.cwd(), 'backups');
    
    // Check if backups directory exists
    try {
      await fs.access(backupsDir);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // Return empty list if directory doesn't exist
        return res.json({
          success: true,
          backups: []
        });
      }
      throw err;
    }
    
    // Read directory contents
    const files = await fs.readdir(backupsDir);
    
    // Filter for .sql.gz files and get their stats
    const backups = [];
    for (const file of files) {
      if (file.endsWith('.sql.gz')) {
        const filepath = path.join(backupsDir, file);
        const stats = await fs.stat(filepath);
        backups.push({
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        });
      }
    }
    
    // Sort by creation date (newest first)
    backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    logger.info('Backup list retrieved', { 
      count: backups.length,
      adminId: req.user?.id 
    });
    
    res.json({
      success: true,
      backups
    });
  } catch (err) {
    logger.error('Error listing backups', { 
      error: err.message, 
      stack: err.stack,
      adminId: req.user?.id 
    });
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to list backups',
      message: err.message 
    });
  }
};

// Download a backup file
export const downloadBackup = async (req, res) => {
  try {
    const { filename } = req.params;
    
    logger.info('Admin downloading backup', { 
      filename, 
      adminId: req.user?.id 
    });
    
    // Validate filename (prevent directory traversal)
    if (!filename || filename.includes('/') || filename.includes('..') || !filename.endsWith('.sql.gz')) {
      logger.warn('Invalid backup filename requested', { 
        filename, 
        adminId: req.user?.id 
      });
      
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }
    
    const filepath = path.join(process.cwd(), 'backups', filename);
    
    // Check if file exists
    try {
      await fs.access(filepath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        logger.warn('Backup file not found', { 
          filename, 
          adminId: req.user?.id 
        });
        
        return res.status(404).json({
          success: false,
          error: 'Backup file not found'
        });
      }
      throw err;
    }
    
    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/gzip');
    
    // Stream the file
    const fileStream = (await fs.open(filepath, 'r')).createReadStream();
    fileStream.pipe(res);
    
    fileStream.on('error', (err) => {
      logger.error('Error streaming backup file', { 
        error: err.message, 
        stack: err.stack,
        filename, 
        adminId: req.user?.id 
      });
      
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Failed to stream backup file'
        });
      }
    });
    
    res.on('finish', () => {
      logger.info('Backup file downloaded successfully', { 
        filename, 
        adminId: req.user?.id 
      });
    });
  } catch (err) {
    logger.error('Error downloading backup', { 
      error: err.message, 
      stack: err.stack,
      adminId: req.user?.id 
    });
    
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to download backup',
        message: err.message 
      });
    }
  }
};