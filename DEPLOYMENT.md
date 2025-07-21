# PrintSoft ERP - Render.com Deployment Guide

This guide explains how to deploy your PrintSoft ERP application to Render.com.

## 🚀 Quick Deployment

### Option 1: One-Click Deployment (Recommended)
1. Push your code to GitHub
2. Go to [Render.com](https://render.com) and sign up/login
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically read the `render.yaml` file and deploy both services

### Option 2: Manual Deployment

#### Backend Deployment
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `printsoft-erp-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`

#### Frontend Deployment
1. Click "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `printsoft-erp-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

#### Database Setup
1. Click "New" → "PostgreSQL"
2. Configure:
   - **Name**: `printsoft-erp-db`
   - **Database Name**: `printsoft_erp`
   - **User**: `erp_user`
   - **Plan**: Free

## 🔧 Environment Variables

### Backend Environment Variables
Set these in your Render backend service:

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `JWT_SECRET` | `[Generate a secure secret]` |
| `DATABASE_URL` | `[Auto-filled by Render PostgreSQL]` |

### Frontend Environment Variables
Set these in your Render static site:

| Variable | Value |
|----------|--------|
| `VITE_API_BASE_URL` | `https://printsoft-erp-backend.onrender.com` |
| `VITE_API_VERSION` | `v1` |
| `VITE_APP_NAME` | `PrintSoft ERP` |
| `VITE_APP_VERSION` | `1.0.0` |

## 📱 APK with Production Backend

After deployment, build your APK with the production backend:

```bash
# This will build APK connected to your Render backend
npm run build:apk

# For release version
npm run build:apk:release
```

## 🔄 Auto-Deploy Setup

1. In Render dashboard, go to your service settings
2. Enable "Auto-Deploy" 
3. Choose your branch (usually `main` or `master`)
4. Every push to that branch will trigger automatic deployment

## 📋 Deployment Checklist

### Before Deployment
- [ ] Code pushed to GitHub
- [ ] Database schema ready
- [ ] Environment variables configured
- [ ] CORS settings updated for production domain

### After Deployment
- [ ] Backend health check working: `https://your-backend.onrender.com/health`
- [ ] Frontend loading properly
- [ ] Database connection established
- [ ] API endpoints responding correctly
- [ ] Build new APK with production backend

## 🛠️ Database Migration

Your backend should handle database initialization automatically. If you need to run migrations:

1. Go to your backend service in Render
2. Open the "Shell" tab
3. Run your migration commands

## 🔍 Monitoring & Logs

- **Backend Logs**: Render Dashboard → Your Backend Service → Logs
- **Frontend Build Logs**: Render Dashboard → Your Static Site → Deploys
- **Database Metrics**: Render Dashboard → Your Database → Metrics

## 📱 URLs After Deployment

- **Backend API**: `https://printsoft-erp-backend.onrender.com`
- **Frontend Web**: `https://printsoft-erp-frontend.onrender.com`
- **Health Check**: `https://printsoft-erp-backend.onrender.com/health`

## 🔒 Security Notes

- All connections are HTTPS by default
- Database connections are encrypted
- Environment variables are securely stored
- Consider adding authentication middleware for production

## 💡 Free Tier Limitations

Render's free tier includes:
- ✅ 750 build hours/month
- ✅ Automatic SSL certificates
- ✅ Global CDN for static sites
- ⚠️ Services sleep after 15 minutes of inactivity
- ⚠️ 90-second cold start time

For production apps with consistent traffic, consider upgrading to a paid plan.

## 🆘 Troubleshooting

### Common Issues

1. **Service won't start**: Check logs for missing environment variables
2. **Database connection failed**: Verify DATABASE_URL is set
3. **CORS errors**: Update CORS settings in backend to include frontend domain
4. **Build fails**: Check Node.js version compatibility

### Getting Help

- Render Documentation: https://render.com/docs
- Community Forum: https://community.render.com
- Support: Available on paid plans

---

🎉 Your PrintSoft ERP is now ready for production!
