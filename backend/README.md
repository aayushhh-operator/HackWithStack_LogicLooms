# Backend API - LogicLooms Authentication

Flask backend with MongoDB for user authentication.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. The `.env` file is already created with the MongoDB connection string. Make sure it exists in the backend folder.

3. Run the Flask server:
```bash
python app.py
```

The server will run on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Authentication
- `POST /api/signup` - Register a new user
  - Body: `{ "name": string, "email": string, "password": string, "phone": string, "userType": "borrower" | "lender" }`
  - Returns: User data with JWT token

- `POST /api/login` - Login user
  - Body: `{ "email": string, "password": string }`
  - Returns: User data with JWT token

- `GET /api/user` - Get user information
  - Headers: `Authorization: Bearer <token>`
  - Returns: User data

## Environment Variables

The `.env` file contains:
- `MONGODB_URI` - MongoDB connection string
- `SECRET_KEY` - JWT secret key (change in production!)

## Notes

- Passwords are hashed using Werkzeug's password hashing
- JWT tokens expire after 7 days
- CORS is enabled for frontend communication