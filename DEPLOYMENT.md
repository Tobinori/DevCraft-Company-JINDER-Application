# JINDER Deployment Guide

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Production Environment Setup](#production-environment-setup)
3. [Database Configuration](#database-configuration)
4. [Environment Variables](#environment-variables)
5. [Build Commands](#build-commands)
6. [Testing Steps](#testing-steps)
7. [Final Verification Checklist](#final-verification-checklist)
8. [Troubleshooting](#troubleshooting)
9. [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Checklist

- [ ] All tests passing in CI/CD pipeline
- [ ] Code review completed and approved
- [ ] Database migrations tested
- [ ] Security vulnerabilities scanned
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Backup strategy in place
- [ ] Monitoring and logging configured

---

## Production Environment Setup

### Server Requirements

#### Minimum System Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04 LTS or CentOS 8+

#### Recommended System Requirements
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **OS**: Ubuntu 22.04 LTS

### Software Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y

# Install certbot for SSL certificates
sudo apt install certbot python3-certbot-nginx -y
```

### Directory Structure

```bash
/var/www/jinder/
├── app/                 # Application files
├── logs/               # Application logs
├── backups/            # Database backups
├── ssl/                # SSL certificates
└── scripts/            # Deployment scripts
```

### User Setup

```bash
# Create deployment user
sudo useradd -m -s /bin/bash jinder
sudo usermod -aG sudo jinder

# Setup SSH key authentication
sudo mkdir -p /home/jinder/.ssh
sudo chown jinder:jinder /home/jinder/.ssh
sudo chmod 700 /home/jinder/.ssh
```

---

## Database Configuration

### MongoDB Production Setup

#### Installation

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org
```

#### Configuration

```bash
# Edit MongoDB configuration
sudo nano /etc/mongod.conf
```

```yaml
# /etc/mongod.conf
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1

security:
  authorization: enabled

replication:
  replSetName: "rs0"
```

#### Database User Setup

```javascript
// Connect to MongoDB
mongo

// Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "your-secure-admin-password",
  roles: ["root"]
})

// Create application database and user
use jinder
db.createUser({
  user: "jinder_user",
  pwd: "your-secure-app-password",
  roles: ["readWrite"]
})
```

#### Database Indexes

```javascript
// Create necessary indexes for performance
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "username": 1 }, { unique: true })
db.profiles.createIndex({ "userId": 1 })
db.profiles.createIndex({ "location": "2dsphere" })
db.matches.createIndex({ "userId1": 1, "userId2": 1 })
db.messages.createIndex({ "matchId": 1, "timestamp": -1 })
```

### Redis Configuration (for sessions and caching)

```bash
# Install Redis
sudo apt install redis-server -y

# Configure Redis
sudo nano /etc/redis/redis.conf
```

```conf
# /etc/redis/redis.conf
bind 127.0.0.1
port 6379
requirepass your-redis-password
maxmemory 256mb
maxmemory-policy allkeys-lru
```

---

## Environment Variables

### Production Environment File

Create `/var/www/jinder/app/.env.production`:

```env
# Application Settings
NODE_ENV=production
PORT=3000
APP_URL=https://your-domain.com
API_URL=https://api.your-domain.com

# Database Configuration
MONGODB_URI=mongodb://jinder_user:your-secure-app-password@localhost:27017/jinder?authSource=jinder
REDIS_URL=redis://:your-redis-password@localhost:6379

# Authentication
JWT_SECRET=your-very-secure-jwt-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-very-secure-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# Session Configuration
SESSION_SECRET=your-very-secure-session-secret-key
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@your-domain.com

# File Upload (AWS S3)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=jinder-uploads-prod

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Security
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-newrelic-license-key

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=/var/www/jinder/logs/app.log
```

### Environment Variable Security

```bash
# Set proper file permissions
sudo chown jinder:jinder /var/www/jinder/app/.env.production
sudo chmod 600 /var/www/jinder/app/.env.production
```

---

## Build Commands

### Automated Deployment Script

Create `/var/www/jinder/scripts/deploy.sh`:

```bash
#!/bin/bash

# JINDER Production Deployment Script
set -e

# Configuration
APP_DIR="/var/www/jinder/app"
BACKUP_DIR="/var/www/jinder/backups"
LOG_FILE="/var/www/jinder/logs/deploy.log"
REPO_URL="https://github.com/your-org/jinder.git"
BRANCH="main"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log "Starting deployment..."

# Create backup
log "Creating backup..."
mongodump --host localhost --port 27017 --db jinder --out $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)

# Stop application
log "Stopping application..."
pm2 stop jinder || true

# Pull latest code
log "Pulling latest code..."
cd $APP_DIR
git fetch origin
git reset --hard origin/$BRANCH

# Install dependencies
log "Installing dependencies..."
npm ci --production

# Run database migrations
log "Running database migrations..."
npm run migrate:prod

# Build application
log "Building application..."
npm run build:prod

# Run tests
log "Running tests..."
npm run test:production

# Start application
log "Starting application..."
pm2 start ecosystem.config.js --env production

# Health check
log "Performing health check..."
sleep 10
if curl -f http://localhost:3000/health; then
    log "Deployment successful!"
else
    log "Health check failed! Rolling back..."
    pm2 stop jinder
    git reset --hard HEAD~1
    npm ci --production
    npm run build:prod
    pm2 start ecosystem.config.js --env production
    exit 1
fi

log "Deployment completed successfully!"
```

### PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'jinder',
    script: './dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/jinder/logs/err.log',
    out_file: '/var/www/jinder/logs/out.log',
    log_file: '/var/www/jinder/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
```

### Manual Build Commands

```bash
# Install dependencies
npm ci --production

# Run TypeScript compilation
npm run build

# Run database migrations
npm run migrate

# Start with PM2
pm2 start ecosystem.config.js --env production
```

---

## Testing Steps

### Pre-Deployment Testing

```bash
# Run all tests
npm test

# Run integration tests
npm run test:integration

# Run security audit
npm audit

# Run performance tests
npm run test:performance

# Test database connections
npm run test:db
```

### Post-Deployment Testing

#### Automated Health Checks

```bash
#!/bin/bash
# health-check.sh

BASE_URL="https://your-domain.com"

# Test API endpoints
echo "Testing API health..."
curl -f $BASE_URL/api/health || exit 1

echo "Testing user registration..."
curl -f -X POST $BASE_URL/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"testpass123"}' || exit 1

echo "Testing database connectivity..."
curl -f $BASE_URL/api/status/db || exit 1

echo "Testing file upload..."
curl -f $BASE_URL/api/status/storage || exit 1

echo "All health checks passed!"
```

#### Manual Testing Checklist

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Profile creation/editing works
- [ ] Photo upload functionality
- [ ] Swiping mechanism works
- [ ] Matching system functions
- [ ] Chat messaging works
- [ ] Push notifications sent
- [ ] Email notifications sent
- [ ] Mobile responsiveness
- [ ] SSL certificate valid
- [ ] Database queries performing well
- [ ] File uploads to S3 working

---

## Final Verification Checklist

### Security Verification

- [ ] SSL certificate installed and valid
- [ ] HTTPS redirect configured
- [ ] Security headers implemented
- [ ] Rate limiting active
- [ ] CORS configured properly
- [ ] Input validation working
- [ ] SQL injection protection active
- [ ] XSS protection enabled
- [ ] Authentication tokens secure
- [ ] Session management secure
- [ ] File upload restrictions working
- [ ] Environment variables secured

### Performance Verification

- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database query performance optimal
- [ ] CDN configured for static assets
- [ ] Gzip compression enabled
- [ ] Image optimization working
- [ ] Caching headers set correctly
- [ ] Database indexes created
- [ ] Connection pooling configured

### Monitoring Verification

- [ ] Application logs being written
- [ ] Error logging to Sentry working
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured
- [ ] Database monitoring active
- [ ] Server resource monitoring
- [ ] Alert notifications configured
- [ ] Log rotation configured

### Backup Verification

- [ ] Database backup script working
- [ ] Automated backup schedule active
- [ ] Backup restoration tested
- [ ] File backup configured
- [ ] Backup retention policy set

---

## Troubleshooting

### Common Issues and Solutions

#### Application Won't Start

**Symptoms**: PM2 shows app as stopped or errored

```bash
# Check PM2 logs
pm2 logs jinder

# Check application logs
tail -f /var/www/jinder/logs/combined.log

# Common fixes:
# 1. Check environment variables
ls -la /var/www/jinder/app/.env.production

# 2. Verify database connection
mongo --eval "db.stats()"

# 3. Check port availability
sudo netstat -tulpn | grep :3000

# 4. Restart PM2
pm2 restart jinder
```

#### Database Connection Issues

**Symptoms**: "Connection refused" or "Authentication failed"

```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongo mongodb://jinder_user:password@localhost:27017/jinder

# Common fixes:
# 1. Restart MongoDB
sudo systemctl restart mongod

# 2. Check firewall
sudo ufw status

# 3. Verify user permissions
mongo
use jinder
db.auth("jinder_user", "password")
```

#### High Memory Usage

**Symptoms**: Application crashes with out of memory errors

```bash
# Check memory usage
free -m
pm2 monit

# Analyze heap dumps
node --inspect server.js

# Common fixes:
# 1. Increase memory limit
# Edit ecosystem.config.js: max_memory_restart: '2G'

# 2. Check for memory leaks
npm run test:memory

# 3. Optimize database queries
# Enable MongoDB profiler
mongo
use jinder
db.setProfilingLevel(2)
```

#### SSL Certificate Issues

**Symptoms**: "Not secure" warning in browser

```bash
# Check certificate status
sudo certbot certificates

# Test SSL configuration
openssl s_client -connect your-domain.com:443

# Renew certificates
sudo certbot renew

# Restart Nginx
sudo systemctl restart nginx
```

#### File Upload Failures

**Symptoms**: Images not uploading or 500 errors

```bash
# Check AWS credentials
aws s3 ls s3://jinder-uploads-prod

# Check file permissions
ls -la uploads/

# Test S3 connectivity
curl -I https://s3.amazonaws.com

# Common fixes:
# 1. Verify AWS IAM permissions
# 2. Check S3 bucket policy
# 3. Validate file size limits
```

#### Performance Issues

**Symptoms**: Slow page loads, timeouts

```bash
# Check server resources
top
iotop

# Analyze slow queries
mongo
use jinder
db.runCommand({profile: -1})

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Common fixes:
# 1. Add database indexes
# 2. Enable query caching
# 3. Optimize images
# 4. Configure CDN
```

### Log Analysis Commands

```bash
# Application errors
grep -i "error" /var/www/jinder/logs/combined.log

# Database connection issues
grep -i "connection" /var/log/mongodb/mongod.log

# Nginx errors
sudo tail -f /var/log/nginx/error.log

# System errors
sudo dmesg | grep -i error
```

### Emergency Contacts

- **DevOps Team**: devops@yourcompany.com
- **Database Admin**: dba@yourcompany.com
- **Security Team**: security@yourcompany.com
- **On-call Engineer**: +1-555-0123

---

## Rollback Procedures

### Automated Rollback Script

```bash
#!/bin/bash
# rollback.sh

set -e

APP_DIR="/var/www/jinder/app"
BACKUP_DIR="/var/www/jinder/backups"
LOG_FILE="/var/www/jinder/logs/rollback.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log "Starting rollback procedure..."

# Stop application
pm2 stop jinder

# Rollback code
cd $APP_DIR
git reset --hard HEAD~1

# Restore database if needed
if [ "$1" = "--restore-db" ]; then
    log "Restoring database..."
    LATEST_BACKUP=$(ls -t $BACKUP_DIR | head -n1)
    mongorestore --host localhost --port 27017 --db jinder $BACKUP_DIR/$LATEST_BACKUP/jinder
fi

# Reinstall dependencies
npm ci --production
npm run build:prod

# Start application
pm2 start ecosystem.config.js --env production

log "Rollback completed!"
```

### Manual Rollback Steps

1. **Stop the application**:
   ```bash
   pm2 stop jinder
   ```

2. **Revert to previous version**:
   ```bash
   git reset --hard HEAD~1
   ```

3. **Restore database backup** (if needed):
   ```bash
   mongorestore --drop /path/to/backup
   ```

4. **Rebuild and restart**:
   ```bash
   npm ci --production
   npm run build:prod
   pm2 start ecosystem.config.js --env production
   ```

---

## Post-Deployment Tasks

- [ ] Update DNS records if needed
- [ ] Configure monitoring alerts
- [ ] Update documentation
- [ ] Notify stakeholders of deployment
- [ ] Schedule post-deployment review
- [ ] Update runbooks
- [ ] Plan next release cycle

---

## Support and Maintenance

### Daily Tasks
- Monitor application logs
- Check system resources
- Verify backup completion
- Review error rates

### Weekly Tasks
- Security updates
- Performance analysis
- Database optimization
- Log rotation

### Monthly Tasks
- SSL certificate renewal check
- Dependency updates
- Security audit
- Capacity planning review

---

*Last updated: $(date)*
*Version: 1.0.0*
*Maintainer: DevOps Team*