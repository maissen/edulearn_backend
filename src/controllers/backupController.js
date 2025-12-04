import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import mysql from 'mysql2/promise';
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

// Helper function to convert bytes to human readable format
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Create database backup using mysqldump via network connection
export const createBackup = async (req, res) => {
  try {
    logger.info('Admin requesting database backup', { adminId: req.user?.id });
    
    // Ensure backups directory exists
    const backupsDir = await ensureBackupsDirectory();
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filenameGz = `backup-${timestamp}.sql.gz`;
    const filepath = path.join(backupsDir, filename);
    const filepathGz = path.join(backupsDir, filenameGz);
    
    // Get database connection details from environment
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
    
    // Validate environment variables
    if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
      logger.error('Missing database environment variables for backup', { 
        DB_HOST: !!DB_HOST, 
        DB_USER: !!DB_USER, 
        DB_PASSWORD: !!DB_PASSWORD, 
        DB_NAME: !!DB_NAME 
      });
      return res.status(500).json({ 
        success: false, 
        error: 'Missing database configuration' 
      });
    }
    
    const port = DB_PORT || 3306;
    
    // Method 1: Try using mysqldump if available in the container
    const dumpCommand = `mysqldump --single-transaction --routines --triggers --set-gtid-purged=OFF -h ${DB_HOST} -P ${port} -u ${DB_USER} -p'${DB_PASSWORD}' ${DB_NAME} > "${filepath}"`;
    
    logger.info('Attempting database backup with mysqldump', { 
      command: dumpCommand.replace(DB_PASSWORD, '****'),
      filename 
    });
    
    let backupSuccess = false;
    
    try {
      // Try mysqldump first
      const { stdout, stderr } = await execPromise(dumpCommand, { 
        timeout: 120000,
        maxBuffer: 50 * 1024 * 1024
      });
      
      // Check if file was created
      const stats = await fs.stat(filepath);
      if (stats.size > 0) {
        backupSuccess = true;
        logger.info('Backup created with mysqldump', { size: stats.size });
      }
      
    } catch (execErr) {
      logger.warn('mysqldump not available or failed, trying alternative method', { 
        error: execErr.message
      });
      
      // Method 2: Fallback to manual SQL export using mysql2
      try {
        await createBackupManually(filepath, DB_HOST, port, DB_USER, DB_PASSWORD, DB_NAME);
        const stats = await fs.stat(filepath);
        if (stats.size > 0) {
          backupSuccess = true;
          logger.info('Backup created with manual method', { size: stats.size });
        }
      } catch (manualErr) {
        logger.error('Manual backup also failed', { error: manualErr.message });
        throw manualErr;
      }
    }
    
    if (!backupSuccess) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create backup with any method'
      });
    }
    
    // Compress the backup file
    try {
      await execPromise(`gzip -c "${filepath}" > "${filepathGz}"`, {
        timeout: 60000,
        maxBuffer: 50 * 1024 * 1024
      });
      
      // Remove uncompressed file
      await fs.unlink(filepath);
      
      logger.info('Backup compressed successfully');
    } catch (gzipErr) {
      logger.warn('Failed to compress backup, keeping uncompressed version', { 
        error: gzipErr.message 
      });
      // If compression fails, rename the uncompressed file
      await fs.rename(filepath, filepathGz.replace('.gz', ''));
    }
    
    // Get final file stats
    let finalFilepath = filepathGz;
    try {
      await fs.access(filepathGz);
    } catch {
      // If .gz doesn't exist, use .sql
      finalFilepath = filepathGz.replace('.gz', '');
    }
    
    const stats = await fs.stat(finalFilepath);
    const finalFilename = path.basename(finalFilepath);
    
    if (stats.size === 0) {
      logger.warn('Created backup file is empty', { filename: finalFilename, filepath: finalFilepath });
      return res.status(500).json({ 
        success: false, 
        error: 'Backup file is empty',
        details: 'The backup completed but resulted in an empty file'
      });
    }
    
    logger.info('Database backup created successfully', { 
      filename: finalFilename, 
      size: stats.size,
      sizeFormatted: formatBytes(stats.size),
      adminId: req.user?.id 
    });
    
    res.json({
      success: true,
      message: 'Backup created successfully',
      filename: finalFilename,
      size: stats.size,
      sizeFormatted: formatBytes(stats.size),
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

// Manual backup method using mysql2 library
async function createBackupManually(filepath, host, port, user, password, database) {
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database
  });
  
  let sqlDump = `-- MySQL dump created at ${new Date().toISOString()}\n`;
  sqlDump += `-- Host: ${host}    Database: ${database}\n`;
  sqlDump += `-- ------------------------------------------------------\n\n`;
  sqlDump += `SET NAMES utf8mb4;\n`;
  sqlDump += `SET FOREIGN_KEY_CHECKS=0;\n\n`;
  
  try {
    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      
      // Get CREATE TABLE statement
      const [createTable] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
      sqlDump += `-- Table structure for table \`${tableName}\`\n`;
      sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
      sqlDump += createTable[0]['Create Table'] + ';\n\n';
      
      // Get table data
      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
      
      if (rows.length > 0) {
        sqlDump += `-- Dumping data for table \`${tableName}\`\n`;
        sqlDump += `LOCK TABLES \`${tableName}\` WRITE;\n`;
        
        for (const row of rows) {
          const values = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return val;
          }).join(',');
          
          const columns = Object.keys(row).map(col => `\`${col}\``).join(',');
          sqlDump += `INSERT INTO \`${tableName}\` (${columns}) VALUES (${values});\n`;
        }
        
        sqlDump += `UNLOCK TABLES;\n\n`;
      }
    }
    
    sqlDump += `SET FOREIGN_KEY_CHECKS=1;\n`;
    
    // Write to file
    await fs.writeFile(filepath, sqlDump, 'utf8');
    
  } finally {
    await connection.end();
  }
}

// List available backups
export const listBackups = async (req, res) => {
  try {
    logger.info('Admin requesting list of backups', { adminId: req.user?.id });
    
    const backupsDir = path.join(process.cwd(), 'backups');
    
    try {
      await fs.access(backupsDir);
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.mkdir(backupsDir, { recursive: true });
        logger.info('Backups directory created', { adminId: req.user?.id });
      } else {
        throw err;
      }
    }
    
    const files = await fs.readdir(backupsDir);
    
    const backups = [];
    for (const file of files) {
      if (file.endsWith('.sql.gz') || file.endsWith('.sql')) {
        const filepath = path.join(backupsDir, file);
        const stats = await fs.stat(filepath);
        backups.push({
          filename: file,
          size: stats.size,
          sizeFormatted: formatBytes(stats.size),
          createdAt: stats.birthtime
        });
      }
    }
    
    backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    logger.info('Backups listed successfully', { count: backups.length, adminId: req.user?.id });
    
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
    
    logger.info('Admin downloading backup', { filename, adminId: req.user?.id });
    
    if (!filename || filename.includes('../') || filename.includes('/')) {
      logger.warn('Invalid backup filename', { filename, adminId: req.user?.id });
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid filename' 
      });
    }
    
    if (!filename.endsWith('.sql.gz') && !filename.endsWith('.sql')) {
      logger.warn('Invalid backup filename extension', { filename, adminId: req.user?.id });
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid filename extension' 
      });
    }
    
    const filepath = path.join(process.cwd(), 'backups', filename);
    
    try {
      await fs.access(filepath);
    } catch (err) {
      logger.warn('Backup file not found', { filename, adminId: req.user?.id });
      return res.status(404).json({ 
        success: false, 
        error: 'Backup file not found' 
      });
    }
    
    const contentType = filename.endsWith('.gz') ? 'application/gzip' : 'application/sql';
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    
    res.sendFile(filepath);
  } catch (err) {
    logger.error('Error downloading backup', { 
      error: err.message, 
      stack: err.stack,
      filename: req.params.filename,
      adminId: req.user?.id 
    });
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to download backup',
      message: err.message 
    });
  }
};

// Delete a backup file
export const deleteBackup = async (req, res) => {
  try {
    const { filename } = req.params;
    
    logger.info('Admin deleting backup', { filename, adminId: req.user?.id });
    
    if (!filename || filename.includes('../') || filename.includes('/')) {
      logger.warn('Invalid backup filename', { filename, adminId: req.user?.id });
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid filename' 
      });
    }
    
    if (!filename.endsWith('.sql.gz') && !filename.endsWith('.sql')) {
      logger.warn('Invalid backup filename extension', { filename, adminId: req.user?.id });
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid filename extension' 
      });
    }
    
    const filepath = path.join(process.cwd(), 'backups', filename);
    
    try {
      await fs.access(filepath);
    } catch (err) {
      logger.warn('Backup file not found', { filename, adminId: req.user?.id });
      return res.status(404).json({ 
        success: false, 
        error: 'Backup file not found' 
      });
    }
    
    await fs.unlink(filepath);
    
    logger.info('Backup deleted successfully', { filename, adminId: req.user?.id });
    
    res.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (err) {
    logger.error('Error deleting backup', { 
      error: err.message, 
      stack: err.stack,
      filename: req.params.filename,
      adminId: req.user?.id 
    });
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete backup',
      message: err.message 
    });
  }
};