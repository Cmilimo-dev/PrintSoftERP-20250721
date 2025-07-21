# PrintSoft ERP - Production Deployment Guide

## 🚀 Overview

This guide provides comprehensive instructions for deploying PrintSoft ERP to production environments. The application is built with React + TypeScript + Vite and uses Supabase as the backend.

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18+ (LTS recommended)
- **npm**: 8+ or yarn 1.22+
- **Docker**: 20+ (for containerized deployment)
- **Docker Compose**: 2.0+ (for multi-service deployment)

### Environment Setup
- Production Supabase project
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)
- CI/CD pipeline (optional)

## 🛠️ Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd printsoft-erp
npm install
```

### 2. Configure Environment
```bash
# Copy and configure production environment
cp .env.production .env.production.local
# Edit with your actual values
nano .env.production.local
```

### 3. Build for Production
```bash
./build-production.sh
```

### 4. Deploy
```bash
./deploy-production.sh
```

## 🔧 Configuration

### Environment Variables

Create `.env.production` with the following configuration:

```env
# Required
NODE_ENV=production
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Optional but recommended
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

### Supabase Setup

1. **Create Production Project**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create new project
   - Note the project URL and anon key

2. **Run Migrations**
   ```bash
   # Using Supabase CLI
   supabase db push --linked
   
   # Or manually run migration files from supabase/migrations/
   ```

3. **Configure Row Level Security (RLS)**
   - Enable RLS on all tables
   - Set up appropriate policies for your use case

## 🏗️ Deployment Options

### Option 1: Docker Deployment (Recommended)

**Advantages:**
- Consistent environment
- Easy scaling
- Isolated dependencies
- Built-in health checks

```bash
# Build and deploy with Docker
./deploy-production.sh

# Or manually
docker build -f Dockerfile.production -t printsoft-erp .
docker run -p 80:80 printsoft-erp
```

**Docker Compose with Monitoring:**
```bash
# Deploy with monitoring stack
docker-compose -f docker-compose.production.yml --profile monitoring up -d
```

### Option 2: Static File Hosting

**Suitable for:** Netlify, Vercel, AWS S3, Cloudflare Pages

```bash
# Build static files
npm run build

# Deploy dist/ folder to your hosting provider
```

**Example - Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Option 3: VPS/Server Deployment

**For:** Ubuntu, CentOS, DigitalOcean, Linode

```bash
# 1. Install Docker on server
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Transfer files
scp -r . user@server:/opt/printsoft-erp/

# 3. Deploy
ssh user@server
cd /opt/printsoft-erp
./deploy-production.sh
```

### Option 4: Kubernetes Deployment

**For:** Production clusters, auto-scaling needs

```yaml
# See k8s/ directory for complete manifests
apiVersion: apps/v1
kind: Deployment
metadata:
  name: printsoft-erp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: printsoft-erp
  template:
    metadata:
      labels:
        app: printsoft-erp
    spec:
      containers:
      - name: printsoft-erp
        image: printsoft-erp:latest
        ports:
        - containerPort: 80
```

## 🔒 Security Considerations

### Essential Security Measures

1. **Environment Variables**
   - Never commit `.env.production` to version control
   - Use secure secret management (AWS Secrets Manager, etc.)
   - Rotate keys regularly

2. **Content Security Policy**
   - Configure CSP headers in nginx/reverse proxy
   - Restrict script sources
   - Enable HSTS

3. **HTTPS Configuration**
   ```nginx
   server {
       listen 443 ssl http2;
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       # Security headers
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-Frame-Options "SAMEORIGIN" always;
   }
   ```

4. **Database Security**
   - Enable RLS on all Supabase tables
   - Use least-privilege access policies
   - Monitor database access logs

### Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Content Security Policy configured
- [ ] Security headers implemented
- [ ] Environment variables secured
- [ ] Database RLS policies active
- [ ] Regular security updates scheduled
- [ ] Access logs monitored
- [ ] Backup strategy implemented

## 📊 Monitoring & Observability

### Application Monitoring

1. **Health Checks**
   - Endpoint: `http://your-domain/health`
   - Automated monitoring with Uptime Robot/Pingdom
   - Docker health checks enabled

2. **Performance Monitoring**
   ```bash
   # Enable monitoring stack
   docker-compose -f docker-compose.production.yml --profile monitoring up -d
   ```
   - **Prometheus**: Metrics collection (port 9090)
   - **Grafana**: Dashboards and visualization (port 3000)

3. **Error Tracking**
   - Integrate Sentry for error monitoring
   - Set up alerts for critical issues
   - Monitor JavaScript errors and performance

### Log Management

```bash
# View application logs
docker-compose -f docker-compose.production.yml logs -f

# Monitor nginx access logs
tail -f logs/nginx/access.log

# Monitor error logs
tail -f logs/nginx/error.log
```

## 🚦 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Deploy to production
        run: ./deploy-production.sh
```

### GitLab CI Example

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - npm install
    - npm run test
    - npm run lint

build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  script:
    - ./deploy-production.sh
  only:
    - main
```

## 🔄 Backup & Recovery

### Database Backup

```bash
# Automated Supabase backup
supabase db dump --file backup-$(date +%Y%m%d).sql

# Or using pg_dump if direct access
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Application Backup

```bash
# Backup configuration and data
tar -czf printsoft-backup-$(date +%Y%m%d).tar.gz \
  .env.production \
  docker-compose.production.yml \
  logs/ \
  data/
```

### Recovery Procedures

1. **Database Recovery**
   ```bash
   # Restore from backup
   psql $DATABASE_URL < backup-20231201.sql
   ```

2. **Application Recovery**
   ```bash
   # Rollback to previous version
   docker-compose -f docker-compose.production.yml down
   docker tag printsoft-erp-backup-20231201 printsoft-erp:latest
   docker-compose -f docker-compose.production.yml up -d
   ```

## 📈 Performance Optimization

### Frontend Optimizations

1. **Code Splitting**
   - Lazy loading implemented for route components
   - Vendor chunks separated for better caching

2. **Asset Optimization**
   - Images optimized and compressed
   - Gzip compression enabled
   - Browser caching configured

3. **Bundle Analysis**
   ```bash
   # Analyze bundle size
   ./build-production.sh analyze
   ```

### Backend Optimizations

1. **Database**
   - Proper indexing on frequently queried columns
   - Connection pooling configured
   - Query optimization

2. **CDN Integration**
   - Static assets served from CDN
   - Geographic distribution

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clean and rebuild
   ./build-production.sh clean
   rm -rf node_modules package-lock.json
   npm install
   ./build-production.sh
   ```

2. **Docker Issues**
   ```bash
   # Check container logs
   docker logs printsoft-erp-prod
   
   # Check container health
   docker inspect printsoft-erp-prod | grep Health
   ```

3. **Environment Variable Issues**
   ```bash
   # Verify environment loading
   docker exec printsoft-erp-prod env | grep VITE_
   ```

### Health Check Endpoints

- **Application**: `GET /health`
- **Database**: Check Supabase dashboard
- **API**: `GET /api/health` (if applicable)

### Debug Mode

```bash
# Enable debug logging
docker-compose -f docker-compose.production.yml \
  -e VITE_ENABLE_DEBUG=true up -d
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks

- [ ] Weekly security updates
- [ ] Monthly dependency updates
- [ ] Quarterly performance reviews
- [ ] Semi-annual security audits

### Support Contacts

- **Development Team**: dev@printsoft.com
- **Infrastructure**: ops@printsoft.com
- **Security Issues**: security@printsoft.com

### Emergency Procedures

1. **Critical Bug**: Rollback to previous stable version
2. **Security Breach**: Immediate shutdown and investigation
3. **Data Loss**: Restore from latest backup
4. **Performance Issues**: Scale horizontally or optimize

---

## 📚 Additional Resources

- [Vite Production Build Guide](https://vitejs.dev/guide/build.html)
- [React Production Optimization](https://react.dev/learn/start-a-new-react-project#production-ready-react-frameworks)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Docker Production Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Last Updated**: $(date)
**Version**: 1.0.0
