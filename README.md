# VM Management Dashboard

A web application for managing virtual machine details in your company. This dashboard allows you to track VM information, including host names, IP addresses, credentials, and installed services.

## Features

- User authentication with admin and user roles
- VM management (add, edit, delete)
- Service management for each VM
- Expandable dashboard sections
- Secure password storage
- Role-based access control

## Technology Stack

- **Frontend**: React with Vite
- **UI Framework**: React Bootstrap
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com/](https://supabase.com/) and sign up or log in
2. Click "New Project" to create a new project
3. Fill in the project details:
   - Name: "VM Dashboard"
   - Database Password: Create a strong password
   - Region: Choose the region closest to your users
4. Click "Create new project"

### 2. Set Up the Database

1. Once your project is created, go to the SQL Editor
2. Create the database schema by running the SQL scripts in the `supabase/migrations` folder:
   - First run `01_create_tables.sql`
   - Then run `02_seed_data.sql`

### 3. Configure Environment Variables

1. Copy the `.env.example` file to `.env`
2. Update the Supabase URL and anon key:
   - Go to your Supabase project settings
   - Copy the URL and anon key
   - Update the `.env` file with these values

### 4. Install Dependencies and Run the Application

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

### 5. Create Admin User

1. Go to the Authentication section in your Supabase dashboard
2. Click "Users" and then "Add User"
3. Create a user with the following details:
   - Email: admin@example.com
   - Password: admin123
4. After creating the user, go to the SQL Editor and run:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = 'user-id-from-supabase';
```

### 6. Add Test Data

To add test data to your application:

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/seed/auto_test_data.sql`
3. Paste it into the SQL Editor and run the script
4. The script will automatically:
   - Find your admin user
   - Create test VMs and services
   - Show a success message with the admin ID used

The test data includes:
- 5 virtual machines with different roles (production, application, test, development, management)
- 8 services distributed across these VMs
- Various service types including databases, application servers, and management tools

If you want to reset the data, you can uncomment the DELETE statements at the top of the script.

## Usage

1. Log in with your admin credentials
2. Use the dashboard to manage VMs and their services
3. Admin users can add, edit, and delete VMs
4. Regular users can only view VM information

## Security Considerations

- Passwords are stored securely in the database
- Role-based access control restricts actions based on user roles
- Row-level security in Supabase ensures data protection

## Development

### Project Structure

- `src/components`: React components
- `src/context`: Context providers (authentication)
- `src/utils`: Utility functions and API clients
- `src/data`: Initial data models
- `supabase/migrations`: SQL scripts for database setup

### Adding New Features

1. Create new components in the `src/components` folder
2. Update the Supabase client in `src/utils/supabaseClient.js` if needed
3. Add new routes in `src/App.jsx`
