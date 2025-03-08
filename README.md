# Agent Management System

This MERN stack application manages agents and distributes customer lists among them.

## Features

- Admin user authentication
- Agent creation and management
- CSV file upload and list distribution
- Equal distribution of tasks among agents

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/agent-management
   JWT_SECRET=your-secret-key
   PORT=5000
   ```

4. Start the development server -> open to server folder path:
   ```bash
   # Start backend server
   npm run server

   # Start frontend development server
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/auth/login`
  - Body: `{ email: string, password: string }`
  - Returns: JWT token and user data

### Agents
- POST `/api/agents`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name: string, email: string, mobile: string, password: string }`
  - Creates a new agent

- GET `/api/agents`
  - Headers: `Authorization: Bearer <token>`
  - Returns list of all agents

### Lists
- POST `/api/lists/upload`
  - Headers: `Authorization: Bearer <token>`
  - Body: FormData with CSV file
  - Uploads and distributes lists among agents

- GET `/api/lists`
  - Headers: `Authorization: Bearer <token>`
  - Returns all distributed lists

## CSV Format
The CSV file should have the following columns:
- FirstName (text)
- Phone (number)
- Notes (text)

## Testing
Note: I have added a functionality where the system check if an admin exist or not. If does then the user just has to login with the below credentials else the system will automatically create an admin with the below credentials.(I have made this functionality to make testing easy)

1. Login using admin credentials:
   - Email: admin@example.com
   - Password: admin123

2. Create agents through the Agents page

3. Upload CSV file through the Lists page

4. View distributed lists in the Lists section

## Project Structure
- `/server` - Backend Node.js/Express server
- `/src` - Frontend React application
- `/src/components` - Reusable React components
- `/src/pages` - Main application pages

## Data Storage
- MongoDB collections:
  - users: Admin user information
  - agents: Agent details
  - lists: Distributed customer lists

## Security
- JWT authentication
- Password hashing
- Protected API routes
- Input validation

This project helps businesses efficiently manage their agents and distribute customer lists among them, ensuring equal workload distribution and organized task management.