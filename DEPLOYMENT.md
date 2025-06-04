# Production Deployment Guide

This guide covers deployment options for the Civil Society Grants Website.

## Quick Start

```bash
# 1. Prepare for deployment
npm run deploy

# 2. Start in production mode
npm run start:prod
```

## Deployment Options

### Option 1: Traditional Server Deployment

#### Prerequisites
- Node.js 18+
- PM2 (process manager)
- Nginx (reverse proxy)
- SSL certificates

#### Steps

1. **Prepare the application**
   ```bash
   npm run deploy
   ```

2. **Configure environment**
   ```bash
   cp server/.env.production server/.env
   # Edit server/.env with your production values
   ```

3. **Install PM2 globally**
   ```bash
   npm install -g pm2
   ```

4. **Start with PM2**
   ```bash
   cd server
   pm2 start server.js --name "grants-website"
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**
   ```bash
   sudo cp config/nginx.conf /etc/nginx/sites-available/grants-website
   sudo ln -s /etc/nginx/sites-available/grants-website /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Option 2: Docker Deployment

#### Prerequisites
- Docker
- Docker Compose

#### Steps

1. **Prepare environment**
   ```bash
   cp server/.env.production server/.env
   # Edit server/.env with your production values
   ```

2. **Build and start**
   ```bash
   docker-compose up -d
   ```

3. **View logs**
   ```bash
   docker-compose logs -f
   ```

### Option 3: Systemd Service

1. **Configure service**
   ```bash
   sudo cp config/grants-website.service /etc/systemd/system/
   # Edit the service file with correct paths
   sudo systemctl daemon-reload
   ```

2. **Start service**
   ```bash
   sudo systemctl enable grants-website
   sudo systemctl start grants-website
   sudo systemctl status grants-website
   ```

## Environment Configuration

### Required Environment Variables

#### Server (.env)
```bash
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secure-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGIN=https://yourdomain.com
```

#### Client (.env.production)
```bash
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_ENVIRONMENT=production
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## Monitoring and Maintenance

### Health Checks

The application includes health check endpoints:
- `GET /api/grants` - Basic API health
- Database connection is verified on server start

### Logging

Logs are stored in:
- `server/logs/` - Application logs
- `/var/log/nginx/` - Nginx logs
- `journalctl -u grants-website` - Systemd logs

### Database Backups

```bash
# Manual backup
npm run backup

# Automated backups (add to crontab)
0 2 * * * cd /path/to/app && npm run backup
```

### Performance Monitoring

Monitor these metrics:
- Response times (`/api/grants` endpoint)
- Memory usage (Node.js process)
- Database size and query performance
- Nginx access/error logs

## Security Checklist

- [ ] Change default admin passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure firewall (allow only 80, 443, 22)
- [ ] Keep dependencies updated
- [ ] Monitor security advisories
- [ ] Regular database backups
- [ ] Rate limiting configured
- [ ] Security headers enabled

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :5001
   sudo kill -9 <PID>
   ```

2. **Database permissions**
   ```bash
   chmod 755 server/database/
   chmod 644 server/database/grants.db
   ```

3. **Nginx configuration errors**
   ```bash
   sudo nginx -t
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Node.js memory issues**
   ```bash
   # Increase memory limit
   node --max-old-space-size=4096 server.js
   ```

### Log Analysis

```bash
# Application logs
tail -f server/logs/production.log

# PM2 logs
pm2 logs grants-website

# System logs
journalctl -u grants-website -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Scaling Considerations

For high traffic scenarios:

1. **Load Balancing**: Use multiple Node.js instances
2. **Database**: Consider PostgreSQL for better performance
3. **Caching**: Implement Redis for session storage
4. **CDN**: Use CloudFlare or similar for static assets
5. **Monitoring**: Implement Prometheus + Grafana

## Support

For deployment issues:
1. Check logs first
2. Verify environment configuration
3. Test database connectivity
4. Check network/firewall settings