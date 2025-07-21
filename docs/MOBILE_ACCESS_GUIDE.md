# 📱 Mobile Access Guide for PrintSoftERP

## Quick Start

1. **Make sure your mobile device is connected to the same WiFi network as your computer**

2. **Start the app for mobile access:**
   ```bash
   ./start-mobile.sh
   ```

3. **Open the app on your mobile device:**
   - The script will show you the IP address
   - Open your mobile browser and go to: `http://YOUR_IP:8080`
   - Example: `http://192.168.100.40:8080`

## Manual Setup

If you prefer to start servers manually:

### 1. Start Backend Server
```bash
cd backend
node index.js
```

### 2. Start Frontend Server
```bash
npm run dev
```

### 3. Find Your IP Address
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### 4. Access on Mobile
Open your mobile browser and go to: `http://YOUR_IP:8080`

## Configuration Changes Made

### ✅ Backend Configuration
- **Server binding**: Changed from `localhost` to `0.0.0.0` to accept connections from all network interfaces
- **CORS**: Already configured to allow cross-origin requests
- **Network access**: Backend now accessible from any device on the same network

### ✅ Frontend Configuration
- **Vite host**: Changed from `::` to `0.0.0.0` for broader network compatibility
- **Dynamic API**: Created smart API configuration that automatically detects network IP
- **Mobile detection**: API endpoints adjust based on the device's network location

### ✅ API Configuration
- **Dynamic URLs**: API calls automatically use the correct IP address based on how you access the app
- **Network detection**: Smart detection of localhost vs network IP access
- **Mobile optimization**: Optimized for mobile browser access

## Network Requirements

### ✅ Same Network
- Your computer and mobile device must be on the same WiFi network
- The app will NOT work on different networks (e.g., mobile data vs WiFi)

### ✅ Firewall Settings
- Make sure your Mac's firewall allows connections on ports 3001 and 8080
- If you have issues, try temporarily disabling the firewall for testing

## Troubleshooting

### "Failed to fetch" Error
1. **Check network connection**: Ensure both devices are on the same WiFi
2. **Verify IP address**: Make sure you're using the correct IP address
3. **Check firewall**: Temporarily disable Mac firewall to test
4. **Restart servers**: Stop and restart both backend and frontend servers

### Backend Connection Issues
1. **Check backend logs**: Look for any error messages in the terminal
2. **Test backend directly**: Try accessing `http://YOUR_IP:3001` on your phone
3. **Verify port availability**: Make sure port 3001 isn't blocked

### Frontend Issues
1. **Clear browser cache**: Clear your mobile browser cache
2. **Try different browser**: Test with different mobile browsers
3. **Check console**: Open browser developer tools to see any error messages

## Access URLs

### On Your Computer
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3001`

### On Your Mobile Device
- Frontend: `http://YOUR_IP:8080`
- Backend: `http://YOUR_IP:3001`

## Features Working on Mobile

### ✅ Fully Responsive
- All components are mobile-optimized
- Touch-friendly interface
- Responsive tables and forms

### ✅ Authentication
- Login and registration work on mobile
- JWT tokens are properly handled
- Session management works across devices

### ✅ Full Functionality
- Customer management
- Supplier management
- Lead management
- Document generation
- Settings management
- User roles and permissions

## Security Notes

### 🔒 Development Only
- This configuration is for development only
- Do not use this setup in production
- The app is accessible to anyone on your network

### 🔒 Production Considerations
- For production, use proper SSL/TLS certificates
- Configure proper firewall rules
- Use environment variables for API endpoints
- Implement proper security headers

## Advanced Configuration

### Custom IP Address
If you need to use a specific IP address:

```bash
# Edit src/config/api.ts
export const API_BASE_URL = 'http://YOUR_SPECIFIC_IP:3001';
```

### Different Ports
To use different ports:

```bash
# Backend (edit backend/index.js)
const PORT = process.env.PORT || 3002;

# Frontend (edit vite.config.ts)
port: 8081,
```

## Need Help?

If you encounter issues:
1. Check the console logs in your mobile browser
2. Verify both servers are running
3. Confirm network connectivity
4. Check firewall settings
5. Try restarting both servers

The dynamic API configuration should automatically handle most network scenarios!
