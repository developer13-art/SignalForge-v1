# SignalForge - Local Run Instructions (Windows, No Docker)

## Prerequisites

- Node.js 20.11.1 or higher
- pnpm 9 or higher
- A Neon PostgreSQL database (free tier is sufficient)

## One-time setup

1. Clone the repository.
2. Install dependencies at the root:
   pnpm install
3. Create the server environment file:
   copy server\.env.example server\.env
   Then edit `server\.env` and set `DATABASE_URL` to your Neon connection string.
4. Create the client environment file:
   copy client\.env.example client\.env
   The defaults in `client\.env.example` work for local development.

## Running the application

Open two PowerShell terminals at the repository root.

### Terminal 1 - Server

    pnpm dev:server

Expected output: "SignalForge server listening on port 4000" and "Database connection established".

### Terminal 2 - Client

    pnpm dev:client

Expected output: "VITE ready" and a local URL such as http://localhost:3000

### Verify

Open http://localhost:4000/api/health in a browser. It should return JSON with status "ok".

Open http://localhost:3000 in a browser. It should render the SignalForge landing page.