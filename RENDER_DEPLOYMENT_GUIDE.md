# PrintSoft ERP - Render.com Deployment Guide

## 🚀 Quick Deploy to Render

Your PrintSoft ERP application is now ready for production deployment on Render.com!

### Prerequisites
- ✅ GitHub repository: `https://github.com/Cmilimo-dev/PrintSoftERP-20250721`
- ✅ Clean Git history (no secrets detected)
- ✅ Production-ready configuration

## Option 1: One-Click Deploy (Recommended)

### Step 1: Deploy to Render
1. **Go to Render.com** → [https://render.com](https://render.com)
2. **Sign up/Login** with your GitHub account
3. **Click "New" → "Blueprint"**
4. **Connect Repository**: Select `PrintSoftERP-20250721`
5. **Click "Connect"** - Render will automatically read the `render.yaml` file
6. **Review the services** that will be created:
   - 📡 **Backend API** (Node.js web service)
   - 🌐 **Frontend** (Static site)
   - 🗄️ **PostgreSQL Database** (Free tier)

7. **Click "Deploy"** and wait for deployment to complete (5-10 minutes)

### Step 2: Get Your URLs
After deployment, you'll get:
- **Backend API**: `https://printsoft-erp-backend-xxx.onrender.com`
- **Frontend**: `https://printsoft-erp-frontend-xxx.onrender.com`

## Option 2: Manual Deploy

If you prefer manual setup:

### Backend Setup
1. **New Web Service**
   - Repository: `PrintSoftERP-20250721`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

2. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your_secure_jwt_secret_here
   ```

3. **Add PostgreSQL Database**:
   - Go to Dashboard → New → PostgreSQL
   - Copy the connection string to `DATABASE_URL`

### Frontend Setup
1. **New Static Site**
   - Repository: `PrintSoftERP-20250721`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Environment Variables**:
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com
   ```

## Step 3: Update Frontend Configuration

Once your backend is deployed, update the frontend API configuration:

```bash
# Update frontend environment file
echo "VITE_API_BASE_URL=https://your-backend-url.onrender.com" > frontend/.env.production
```

## Step 4: Verify Deployment

1. **Check Backend Health**:
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```

2. **Check API Endpoints**:
   ```bash
   curl https://your-backend-url.onrender.com/api
   ```

3. **Test Frontend**: Visit your frontend URL and verify it connects to the backend

## 🎯 Important Notes

### Free Tier Limitations
- **Backend**: Sleeps after 15 minutes of inactivity (cold starts ~30 seconds)
- **Database**: 90-day free PostgreSQL database
- **Bandwidth**: 100GB/month

### Production Recommendations
- Consider upgrading to a paid plan for production use
- Set up environment-specific secrets
- Configure proper CORS origins
- Set up monitoring and logging

### Database Migration
Your SQLite data won't automatically transfer. To migrate:
1. Export data from SQLite
2. Import to PostgreSQL after deployment
3. Or continue using SQLite by updating the database configuration

## 📱 Android APK Update

After deployment, update your Android APK:

```bash
# Update frontend API URL
cd frontend
echo "VITE_API_BASE_URL=https://your-backend-url.onrender.com" > .env.production

# Rebuild for Capacitor
npm run build
npx cap sync android
npx cap build android

# Generate new APK
cd android
./gradlew assembleRelease
```

## 🔧 Troubleshooting

### Common Issues
1. **Build Fails**: Check Node.js version compatibility
2. **Database Connection**: Verify `DATABASE_URL` is correctly set
3. **CORS Errors**: Update CORS configuration in backend
4. **Frontend API Calls Fail**: Verify `VITE_API_BASE_URL` is correct

### Logs
- Check Render dashboard for build and runtime logs
- Monitor application performance and errors

## 🎉 Success!

Your PrintSoft ERP is now live on Render! 

- **Backend API**: Production-ready with PostgreSQL
- **Frontend**: Deployed as static site
- **Android APK**: Ready for distribution

## Next Steps
1. Set up custom domain (optional)
2. Configure SSL certificates
3. Set up monitoring and alerts
4. Plan for scaling as your business grows

---

**Need Help?** Check Render's documentation or the troubleshooting section above.
