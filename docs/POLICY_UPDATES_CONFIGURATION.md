# Policy Updates System - Feature Flags & Environment Variables

## Overview
The Policy Updates System includes comprehensive feature flags and environment variables to control automated policy monitoring, redline generation, and approval notifications.

## Core Feature Flags

### `POLICY_UPDATES_AUTO_REDLINE`
- **Purpose**: Controls automatic redline generation when framework changes are detected
- **Values**: `true` | `false`
- **Default**: `false` (disabled for safety)
- **Impact**: When enabled, system automatically generates redline packs for policy updates

```bash
# Enable automatic redline generation
POLICY_UPDATES_AUTO_REDLINE=true

# Disable automatic redline generation (manual review required)
POLICY_UPDATES_AUTO_REDLINE=false
```

### `POLICY_UPDATES_NOTIFICATIONS` 
- **Purpose**: Controls sending approval notifications to policy approvers
- **Values**: `true` | `false`
- **Default**: `false`
- **Impact**: When enabled, sends email/notification alerts for new redline packs

```bash
# Enable approval notifications
POLICY_UPDATES_NOTIFICATIONS=true

# Disable notifications (silent operation)
POLICY_UPDATES_NOTIFICATIONS=false
```

### `POLICY_UPDATES_DRY_RUN`
- **Purpose**: Runs policy updates job without making database changes
- **Values**: `true` | `false`
- **Default**: `false`
- **Impact**: Useful for testing and validation without affecting production data

```bash
# Enable dry run mode (safe testing)
POLICY_UPDATES_DRY_RUN=true

# Normal operation (makes database changes)
POLICY_UPDATES_DRY_RUN=false
```

## Notification Configuration

### Email Notifications
```bash
# Enable email notifications for policy updates
POLICY_UPDATE_EMAIL_ENABLED=true

# Email service configuration (if using external provider)
POLICY_UPDATE_EMAIL_PROVIDER=sendgrid
POLICY_UPDATE_EMAIL_API_KEY=your_api_key
POLICY_UPDATE_FROM_EMAIL=policies@yourschool.edu
```

### Slack Integration
```bash
# Enable Slack notifications
POLICY_UPDATE_SLACK_ENABLED=true
POLICY_UPDATE_SLACK_WEBHOOK=https://hooks.slack.com/services/...
POLICY_UPDATE_SLACK_CHANNEL=#policy-updates
```

### Custom Webhook
```bash
# Custom webhook for policy update notifications
POLICY_UPDATE_WEBHOOK_URL=https://your-system.com/webhooks/policy-updates
POLICY_UPDATE_WEBHOOK_SECRET=your_webhook_secret
```

## Cron Job Configuration

### GitHub Actions Secrets
```bash
# Required for scheduled job authentication
CRON_SECRET=your_secure_cron_secret

# Base URL for your application
APP_BASE_URL=https://your-app.vercel.app

# Policy update feature flags (set in GitHub repository secrets)
POLICY_UPDATES_AUTO_REDLINE=true
POLICY_UPDATES_NOTIFICATIONS=true
POLICY_UPDATES_DRY_RUN=false
```

## Monitoring & Logging

### Job Execution Logging
```bash
# Enable detailed job execution logging
POLICY_UPDATES_LOG_LEVEL=debug

# Log destination (console, file, or external service)
POLICY_UPDATES_LOG_DESTINATION=console
```

### Performance Monitoring
```bash
# Enable performance metrics collection
POLICY_UPDATES_METRICS_ENABLED=true

# Metrics export endpoint
POLICY_UPDATES_METRICS_ENDPOINT=https://metrics.yourschool.edu/policy-updates
```

## Framework-Specific Configuration

### Framework Monitoring Intervals
```bash
# Check intervals for different frameworks (in minutes)
FERPA_CHECK_INTERVAL=360    # 6 hours
COPPA_CHECK_INTERVAL=360    # 6 hours  
PPRA_CHECK_INTERVAL=720     # 12 hours
NIST_AI_RMF_CHECK_INTERVAL=1440  # 24 hours
GDPR_CHECK_INTERVAL=720     # 12 hours
```

### Impact Thresholds
```bash
# Minimum impact level to trigger redlines
FERPA_IMPACT_THRESHOLD=medium
COPPA_IMPACT_THRESHOLD=medium
PPRA_IMPACT_THRESHOLD=high
NIST_AI_RMF_IMPACT_THRESHOLD=medium
GDPR_IMPACT_THRESHOLD=high
```

## Database Configuration

### Connection Settings
```bash
# Policy updates require admin database access
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Enable database connection pooling
POLICY_UPDATES_DB_POOL_SIZE=10
POLICY_UPDATES_DB_TIMEOUT=30000
```

### Table Prefixes
```bash
# Optional table prefixes for policy updates tables
POLICY_UPDATES_TABLE_PREFIX=prod_
```

## Security Configuration

### Access Control
```bash
# Restrict policy updates job to specific IPs
POLICY_UPDATES_ALLOWED_IPS=10.0.0.1,10.0.0.2

# Enable audit logging for all policy update operations
POLICY_UPDATES_AUDIT_ENABLED=true
```

### Encryption
```bash
# Encrypt sensitive data in redline packs
POLICY_UPDATES_ENCRYPTION_KEY=your_encryption_key

# Enable encryption for stored framework metadata
POLICY_UPDATES_ENCRYPT_METADATA=true
```

## Example Production Configuration

```bash
# Production .env configuration for Policy Updates System

# Core feature flags
POLICY_UPDATES_AUTO_REDLINE=true
POLICY_UPDATES_NOTIFICATIONS=true
POLICY_UPDATES_DRY_RUN=false

# Notification settings
POLICY_UPDATE_EMAIL_ENABLED=true
POLICY_UPDATE_SLACK_ENABLED=true
POLICY_UPDATE_WEBHOOK_URL=https://yourschool.edu/webhooks/policy-updates

# Security
CRON_SECRET=prod_secure_cron_secret_here
POLICY_UPDATES_AUDIT_ENABLED=true

# Performance
POLICY_UPDATES_LOG_LEVEL=info
POLICY_UPDATES_METRICS_ENABLED=true

# Framework monitoring (6 hour default)
FERPA_CHECK_INTERVAL=360
COPPA_CHECK_INTERVAL=360
PPRA_CHECK_INTERVAL=720
```

## Testing Configuration

```bash
# Development/testing configuration

# Feature flags (safer defaults)
POLICY_UPDATES_AUTO_REDLINE=false
POLICY_UPDATES_NOTIFICATIONS=false
POLICY_UPDATES_DRY_RUN=true

# Faster check intervals for testing
FERPA_CHECK_INTERVAL=5
COPPA_CHECK_INTERVAL=5

# Enhanced logging
POLICY_UPDATES_LOG_LEVEL=debug
```

## Troubleshooting

### Common Issues

1. **Job not running**: Check `CRON_SECRET` is set correctly
2. **No redlines generated**: Verify `POLICY_UPDATES_AUTO_REDLINE=true`  
3. **Notifications not sent**: Check `POLICY_UPDATES_NOTIFICATIONS=true` and email/Slack configuration
4. **Database errors**: Verify `SUPABASE_SERVICE_ROLE_KEY` has admin permissions
5. **Performance issues**: Adjust check intervals and enable connection pooling

### Debug Mode
```bash
# Enable debug mode for troubleshooting
POLICY_UPDATES_DEBUG=true
POLICY_UPDATES_LOG_LEVEL=debug
POLICY_UPDATES_DRY_RUN=true
```

This configuration provides comprehensive control over the Policy Updates System while maintaining security and flexibility for different deployment environments.
