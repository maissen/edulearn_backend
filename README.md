# backend-ed
backend

## Logging Setup

This application uses Winston for structured logging with support for:
- Console output (development)
- File logging (error.log and combined.log in the logs directory)
- Loki integration for centralized log aggregation (production)

### Log Levels
- error: Critical errors that need immediate attention
- warn: Warning messages for potential issues
- info: General information about application operations
- debug: Detailed debugging information (not shown in production)

### Log Files
- `logs/error.log`: Contains only error-level logs
- `logs/combined.log`: Contains all logs (info, warn, error)

### Loki Integration
In production, logs are sent to Loki at `http://loki:3100/loki/api/v1/push` for centralized storage and querying.

### Grafana Dashboard
A sample Grafana dashboard configuration is available in `grafana-dashboard.json` for monitoring application logs.