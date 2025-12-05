# Deployment Guide

This guide explains how to deploy the EduLearn backend platform using Docker and Docker Compose.

## Overview

The EduLearn platform is containerized using Docker and orchestrated with Docker Compose, making deployment straightforward and consistent across environments.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 1.29+
- At least 4GB RAM available
- 10GB free disk space

## Architecture

The platform consists of three main services:
1. **MySQL Database** - Stores all application data
2. **Node.js Application** - Backend API server
3. **PhpMyAdmin** - Database administration interface

## Configuration

### Environment Variables

The application uses the following environment variables defined in `.env`:

- `DB_NAME` - Database name (default: school_db)
- `DB_HOST` - Database host (default: school_platform_db)
- `DB_PORT` - Database port (default: 3306)
- `DB_ROOT_PASSWORD` - MySQL root password
- `DB_USER` - Application database user
- `DB_PASSWORD` - Application database password
- `PORT` - Application port (default: 5000)
- `JWT_SECRET` - Secret for JWT token signing
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level (default: info)

### Docker Configuration

The `docker-compose.yml` file defines:
- Service definitions for database, application, and PhpMyAdmin
- Network configuration for inter-service communication
- Volume mappings for persistent data storage
- Health checks for service readiness

## Deployment Steps

### Initial Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd edulearn/backend-ed
   ```

2. Configure environment variables in `.env` file

3. Build and start services:
   ```
   docker-compose up -d
   ```

### Production Deployment

1. Ensure production environment variables are set:
   ```
   NODE_ENV=production
   LOG_LEVEL=info
   ```

2. Build and start services:
   ```
   docker-compose up -d
   ```

### Stopping Services

To stop all services:
```
docker-compose down
```

To stop services and remove volumes:
```
docker-compose down -v
```

## Data Persistence

The platform uses Docker named volumes for data persistence:
- `mysql_data` - MySQL database files
- Local mounts for:
  - Uploads directory (`./src/uploads`)
  - Logs directory (`./logs`)
  - Backups directory (`./backups`)

## Monitoring and Logging

### Log Files

Application logs are written to:
- `logs/error.log` - Error-level logs only
- `logs/combined.log` - All log levels

### Loki Integration

In production, logs are sent to Loki at `http://loki:3100/loki/api/v1/push` for centralized storage and querying.

### Grafana Dashboard

A sample Grafana dashboard configuration is available in `grafana-dashboard.json`.

## Database Initialization

The database is automatically initialized using `init.sql` which:
1. Creates all required tables
2. Inserts initial data (sample courses, users, tests)
3. Applies necessary constraints and indexes

## Backup and Recovery

### Creating Backups

Administrators can create database backups through the admin API:
```
POST /admin/backup
```

### Restoring Backups

To restore from a backup file:
1. Stop the application service: `docker-compose stop app`
2. Copy the backup file to the container: `docker cp <backup-file> school_platform_db:/tmp/`
3. Enter the database container: `docker exec -it school_platform_db bash`
4. Restore the database: `mysql -u root -p school_db < /tmp/<backup-file>`
5. Restart services: `docker-compose up -d`

## Scaling Considerations

### Horizontal Scaling

To scale the application service:
```
docker-compose up -d --scale app=3
```

Note: This requires a load balancer configuration for production use.

### Resource Allocation

Recommended resource allocation:
- Database: 2GB RAM, 5GB disk space
- Application: 1GB RAM, 2GB disk space
- PhpMyAdmin: 512MB RAM, 1GB disk space

## Troubleshooting

### Common Issues

1. **Database connection failures**:
   - Check database service health: `docker-compose ps`
   - Verify database credentials in `.env`
   - Check database logs: `docker-compose logs db`

2. **Application startup failures**:
   - Check application logs: `docker-compose logs app`
   - Verify environment variables
   - Ensure all required ports are available

3. **Insufficient disk space**:
   - Clean up unused Docker objects: `docker system prune -a`
   - Remove old backup files
   - Expand disk capacity if needed

### Health Checks

Services include health checks:
- Database: MySQL ping command
- Application: N/A (can be added)
- PhpMyAdmin: N/A (can be added)

Check service status:
```
docker-compose ps
```

## Maintenance

### Regular Tasks

1. **Log rotation**: Implemented automatically
2. **Database optimization**: Run periodic optimization scripts
3. **Backup verification**: Regularly test backup restoration
4. **Security updates**: Update base Docker images regularly

### Updates

To update the application:

1. Pull the latest code:
   ```
   git pull
   ```

2. Rebuild and restart services:
   ```
   docker-compose down
   docker-compose up -d --build
   ```

### Monitoring Commands

- View running services: `docker-compose ps`
- View logs: `docker-compose logs`
- Execute commands in containers: `docker-compose exec <service> <command>`
- View resource usage: `docker stats`

## Security Considerations

1. Use strong passwords for all services
2. Restrict access to the PhpMyAdmin interface
3. Regularly update Docker images
4. Use HTTPS in production environments
5. Implement proper firewall rules
6. Regularly rotate JWT secrets