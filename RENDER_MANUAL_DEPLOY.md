# Manual Render Deployment Guide
## (For users who already have a free database)

Since you already have a free PostgreSQL database on Render, we need to deploy manually instead of using the Blueprint.

## 🚀 Manual Deployment Steps

### Step 1: Deploy Backend Service
1. **Go to Render Dashboard**: [https://dashboard.render.com](https://dashboard.render.com)
2. **Click "New +" → "Web Service"**
3. **Connect GitHub Repository**: `PrintSoftERP-20250721`
4. **Configure Backend Service**:
   ```
   Name: printsoft-erp-backend
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=<click "Generate" for a secure value>
   DATABASE_URL=<your existing database connection string>
   ```

### Step 2: Get Your Existing Database URL
You have two options:

#### Option A: Use Existing Database
1. Go to your existing database in Render Dashboard
2. Copy the "External Database URL" or "Connection String"
3. Paste it as the `DATABASE_URL` environment variable

#### Option B: Create New Database (Delete Old One First)
1. Delete your existing unused database
2. Create new database: `printsoft-erp-db`
3. Use the new connection string

### Step 3: Deploy Frontend
1. **Click "New +" → "Static Site"**
2. **Connect Same Repository**: `PrintSoftERP-20250721`
3. **Configure Frontend**:
   ```
   Name: printsoft-erp-frontend
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

4. **Add Environment Variable**:
   ```
   VITE_API_BASE_URL=https://printsoft-erp-backend-xxx.onrender.com
   ```
   (Replace with your actual backend URL after backend is deployed)

### Step 4: Update Frontend After Backend Deployment
After your backend is deployed:

1. **Get Backend URL**: Copy from backend service dashboard
2. **Update Frontend Environment Variables**:
   - Go to frontend service → Environment
   - Update `VITE_API_BASE_URL` with actual backend URL
   - Save and trigger redeploy

### Step 5: Test Deployment
1. **Backend Health Check**: Visit `https://your-backend-url.onrender.com/health`
2. **Frontend**: Visit your frontend URL
3. **Verify**: Frontend can communicate with backend

## 🎯 Quick Alternative: Use SQLite for Now

If you want to deploy quickly without database issues, you can temporarily use SQLite:

1. **Deploy without DATABASE_URL** environment variable
2. **Backend will automatically use SQLite** (file-based database)
3. **Migrate to PostgreSQL later** when ready

To use SQLite, simply don't set the `DATABASE_URL` environment variable in your backend service.

## 📱 Update Mobile APK

After successful deployment, update your mobile APK:

```bash
./scripts/update-mobile-production.sh https://your-backend-url.onrender.com
```

---

**This manual approach will work around the free database limitation!** 🎉
