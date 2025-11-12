# Cloud Architect Server

Backend server for Cloud Architect application using JSON file storage.

## Features

- User authentication and management
- Category mappings management
- Products and discovery questions management
- Prompt settings management
- Discovery results storage

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the server directory:

```env
PORT=3002
JWT_SECRET=your-secret-key-change-in-production
```

## Running

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

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

