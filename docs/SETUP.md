# PrintSoft ERP Setup Instructions

This guide will help you set up the complete PrintSoft ERP system with authentication and subscription management.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MySQL** (v8.0 or higher)
3. **Git**

## Database Setup

### 1. Install MySQL
If you don't have MySQL installed:
- **macOS**: `brew install mysql`
- **Windows**: Download from [MySQL website](https://dev.mysql.com/downloads/mysql/)
- **Linux**: `sudo apt-get install mysql-server`

### 2. Create Database
```sql
-- Login to MySQL
mysql -u root -p

-- Run the setup script
source /Users/apple/Desktop/PrintSoftERP/database/setup/setup-database.sql
```

Or manually run:
```bash
mysql -u root -p < /Users/apple/Desktop/PrintSoftERP/database/setup/setup-database.sql
```

## Backend Setup

### 1. Navigate to server directory
```bash
cd /Users/apple/Desktop/PrintSoftERP/server
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```

Edit `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=printsoft_erp
JWT_SECRET=your-very-secure-jwt-secret-key-change-this-in-production
PORT=3001
NODE_ENV=development
```

### 4. Start the backend server
```bash
# Development mode
npm run dev

# Or production mode
npm start
```

The backend will be available at `http://localhost:3001`

## Frontend Setup

### 1. Navigate to project root
```bash
cd /Users/apple/Desktop/PrintSoftERP
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```

Edit `.env` file:
```env
VITE_API_URL=http://localhost:3001
VITE_NODE_ENV=development
```

### 4. Start the frontend
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Verification

### 1. Test API Health
```bash
curl http://localhost:3001/api/health
```

Should return:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-10T08:36:14.000Z"
}
```

### 2. Test Subscription Plans
```bash
curl http://localhost:3001/api/subscription-plans
```

Should return available subscription plans.

### 3. Test Frontend
1. Open `http://localhost:5173` in your browser
2. Try registering a new account
3. Test login functionality
4. Verify subscription plan selection works

## Default Subscription Plans

The system comes with three default plans:

1. **7-Day Free Trial** - Free trial for testing
2. **Monthly Pro** - $29.99/month for up to 5 users
3. **Yearly Pro** - $299.99/year for up to 10 users

## Admin Token Usage

When you register as the first user in a company:
1. You become the admin
2. You receive an admin token
3. Share this token with team members to join your subscription
4. Team members use the token during registration

## Troubleshooting

### Database Connection Issues
```bash
# Check MySQL status
brew services list | grep mysql

# Start MySQL if not running
brew services start mysql

# Test connection
mysql -u root -p -e "SELECT 1"
```

### Backend Issues
```bash
# Check if port 3001 is in use
lsof -i :3001

# View backend logs
cd server && npm run dev
```

### Frontend Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check if port 5173 is in use
lsof -i :5173
```

## Development Workflow

1. **Backend Changes**: Restart the server after code changes
2. **Frontend Changes**: Hot reload is enabled automatically
3. **Database Changes**: Run migration scripts manually

## Production Deployment

For production deployment:

1. **Backend**: 
   - Set `NODE_ENV=production`
   - Use environment variables for secrets
   - Set up proper CORS origins

2. **Frontend**:
   - Build: `npm run build`
   - Serve the `dist` folder

3. **Database**:
   - Use a managed MySQL service
   - Set up proper backup procedures

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Subscription
- `GET /api/subscription-plans` - Get available plans
- `GET /api/subscription` - Get user subscription details

### Health
- `GET /api/health` - API health check

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API endpoints documentation
3. Check browser console for frontend errors
4. Check server logs for backend errors
