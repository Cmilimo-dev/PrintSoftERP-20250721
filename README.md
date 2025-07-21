# PrintSoft ERP

A modern Enterprise Resource Planning system built with React and Node.js.

## Project Structure

```
PrintSoftERP/
├── frontend/           # React frontend application
│   ├── src/           # React source code
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
├── backend/           # Node.js backend API
│   ├── src/           # Modular backend code
│   │   ├── config/    # Database and app configuration
│   │   ├── controllers/ # Route handlers
│   │   ├── middlewares/ # Express middlewares
│   │   ├── models/    # Database models
│   │   └── routes/    # API routes
│   ├── database/      # Database schemas and migrations
│   └── server.js      # Main server entry point
├── config/            # Docker and deployment configurations
├── scripts/           # Build and utility scripts
├── docs/              # Project documentation
└── logs/              # Application logs
```

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Development

- **Backend**: Runs on port 3001
- **Frontend**: Runs on port 5173 (Vite dev server)

## Documentation

See the `docs/` directory for detailed documentation including:
- Setup guides
- API documentation
- Deployment instructions
- Testing guides

## Technologies

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, SQLite
- **Authentication**: JWT
- **Database**: SQLite with planned PostgreSQL support
