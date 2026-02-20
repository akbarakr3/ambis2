# Database Setup Guide

The application requires a PostgreSQL database to run. You have two options:

## Option 1: Use Supabase PostgreSQL (Recommended)

1. Log in to your Supabase project at https://app.supabase.com
2. Go to **Project Settings** → **Database** → **Connection strings**
3. Copy the connection string in **URI** format
4. Replace `[YOUR-PASSWORD]` with your actual database password
5. Open the `.env` file in the project root
6. Paste your connection string as the `DATABASE_URL`:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## Option 2: Use Local PostgreSQL

If you have PostgreSQL installed locally:

1. Create a database:
```bash
createdb canteen_order_queue
```

2. Update `.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/canteen_order_queue
```

## Running the Application

Once DATABASE_URL is configured:

```bash
npm run dev
```

This starts both the frontend (Vite) and backend (Express) servers:
- Frontend: http://localhost:5176 (will try 5173, 5174, 5175 if those ports are in use)
- Backend API: http://localhost:3000

## Testing the Product Creation Flow

1. Open http://localhost:5176 in your browser
2. Go to the **Login** page
3. Enter admin credentials (default):
   - Mobile: `9999999999`
   - Password: `admin123`
4. Complete OTP verification (use `123456` in demo mode)
5. Navigate to **Menu** section
6. Click the **+ Add Product** button
7. Fill in product details and submit

The product should now be saved to the database and visible in both the admin Menu and the student order page!

## Troubleshooting

### "DATABASE_URL must be set" error
- Make sure your `.env` file has the `DATABASE_URL` configured
- Verify the connection string is valid

### Connection refused
- If using Supabase, ensure the IP is whitelisted or set to "Allow all"
- If using local Postgres, ensure the service is running

### Tables don't exist
- Tables are created automatically on first run via Drizzle schema

