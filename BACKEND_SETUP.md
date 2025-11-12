# Backend Setup Guide

This guide explains how to set up and run the backend server for the Cloud Architect application.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

## Configuration

Create a `.env` file in the `server` directory (optional, defaults are provided):

```env
PORT=3002
JWT_SECRET=your-secret-key-change-in-production
```

**Important**: Change the `JWT_SECRET` to a secure random string in production!

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3002` (or the port specified in `.env`).

## Database

The database uses JSON file storage in the `server/data/` directory. The following files are created automatically when the server starts:
- `users.json` - User accounts
- `category-mappings.json` - Question category mappings
- `products.json` - Product definitions
- `discovery-questions.json` - Discovery questions
- `prompts.json` - Prompt settings
- `discovery-results.json` - Discovery results

### Default Admin User

- Username: `admin`
- Password: `admin`

**Important**: Change the default admin password after first login!

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/change-password` - Change password (authenticated)
- `POST /api/auth/users` - Create user (admin only)
- `GET /api/auth/users` - Get all users (admin only)
- `DELETE /api/auth/users/:userId` - Delete user (admin only)

### Configuration
- `GET /api/config/category-mappings` - Get all category mappings
- `POST /api/config/category-mappings` - Create/update category mapping (admin)
- `DELETE /api/config/category-mappings/:category` - Delete category mapping (admin)
- `GET /api/config/products` - Get all products
- `GET /api/config/products/:productId` - Get single product
- `POST /api/config/products` - Create product (admin)
- `PUT /api/config/products/:productId` - Update product (admin)
- `DELETE /api/config/products/:productId` - Delete product (admin)
- `GET /api/config/prompts` - Get prompt settings
- `PUT /api/config/prompts` - Update prompt settings (admin)

### Discovery Results
- `POST /api/discovery/results` - Save discovery result (authenticated)
- `GET /api/discovery/results` - Get all discovery results (authenticated)
- `GET /api/discovery/results/:id` - Get single discovery result (authenticated)
- `DELETE /api/discovery/results/:id` - Delete discovery result (authenticated)

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

The token is obtained from the login endpoint and is valid for 7 days.

## Frontend Configuration

Update your frontend `.env` file to include the backend API URL:

```env
VITE_API_BASE_URL=http://localhost:3002
```

## Troubleshooting

### Database Errors
If you encounter database errors, delete the `server/data/` directory and restart the server. All JSON files will be recreated automatically with default data.

### Port Already in Use
If port 3002 is already in use, change the `PORT` environment variable in the `.env` file.

### CORS Errors
The server is configured to allow CORS from all origins. In production, you should restrict this to your frontend domain.

## Production Deployment

1. Set a strong `JWT_SECRET` in the `.env` file
2. Change the default admin password
3. Configure CORS to only allow your frontend domain
4. Use a process manager like PM2 to keep the server running
5. Set up proper logging and monitoring
6. Backup the `server/data/` directory regularly (contains all JSON data files)

