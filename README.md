# SitePulse

Website Monitoring Dashboard for tracking uptime, response time, incidents and alerts.

## Current Features

- **Auth JWT**: Secure user authentication and session management using JSON Web Tokens.
- **User-owned Monitors**: Users can create, manage, and delete their own website monitors.
- **Manual Website Checks**: Manually trigger an immediate health check for any configured monitor.
- **Check History**: View historical check results and response times.
- **Incidents**: Automatically track downtime incidents when checks fail.
- **Alert Rule Settings**: Configure alert rules per monitor (e.g., failure threshold, notification email, recovery notifications).

## Upcoming Features

- **Redis Integration & Background Workers**: For scheduling automated, distributed monitor checks.
- **Email Notifications**: Sending real-time alerts via email when monitors go down or recover.

## Local Development

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Running locally or via Docker)
- Redis (Planned for background jobs, currently optional for basic API features)

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   Ensure your PostgreSQL instance is running and create a `.env` file in the root directory (do not commit this file to version control). 
   Configure your `DATABASE_URL` and `JWT_SECRET` in the `.env` file.
   
   Apply database migrations:
   ```bash
   npm run db:push
   ```
   *(Or run `npx prisma migrate dev` in the `packages/database` directory)*

3. **Start Development Server**
   Run the following command from the root directory to start both the frontend and backend in development mode:
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - **Frontend UI**: http://localhost:3000
   - **Backend API**: http://localhost:3001
   - **API Health Check**: http://localhost:3001/health
