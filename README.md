# Zantri Admin Panel

A React.js web admin panel for managing users, subscriptions, and analytics for the Zantri mobile application. It connects to the **Go backend** (`jantri-backend-go`) via JWT-authenticated REST APIs.

## Features

- **User Management**: Create, view, edit, and delete users
- **Subscription Management**: Manage user subscriptions, assign plans, set expiry dates
- **Analytics Dashboard**: View user growth, subscription distribution, and revenue analytics
- **Admin Authentication**: JWT login via Go backend with admin role checks
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- React.js 18
- Material-UI (MUI) for UI components
- Go REST API + MongoDB (via `jantri-backend-go`)
- Axios for HTTP with JWT refresh
- Recharts for analytics visualization

## Prerequisites

- Node.js (v14 or higher)
- Running Go backend at `jantri-backend-go` (default `http://localhost:8080`)
- MongoDB (via Docker Compose or local instance)

## Setup

### 1. Start the Go backend

```bash
cd jantri-backend-go
cp .env.example .env
# Set ADMIN_SECRET and optionally ADMIN_MOBILES
docker compose up -d   # or: go run ./cmd/server
```

### 2. Bootstrap the first admin

```bash
cd admin-panel
npm install
npm run create-admin
```

This calls `POST /admin/bootstrap` with your `ADMIN_SECRET`. Alternatively, add a mobile number to `ADMIN_MOBILES` in the Go backend `.env` and use an existing user's credentials.

### 3. Configure the admin panel

```bash
cp .env.example .env
# REACT_APP_API_BASE_URL=http://localhost:8080
```

### 4. Run the admin panel

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your **admin mobile number** and password.

## Admin Panel Pages

| Page | Description |
|------|-------------|
| Dashboard | User counts, subscription stats, recent users |
| Users | CRUD, search/filter, subscription assignment |
| Subscriptions | Active/trial/expired subscriptions, revenue estimates |
| Analytics | Growth charts, plan distribution, revenue by plan |
| Settings | Create additional admin accounts |

## Environment Variables

### Admin panel (`.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Go backend URL | `http://localhost:8080` |

### Go backend (required for admin access)

| Variable | Description |
|----------|-------------|
| `ADMIN_MOBILES` | Comma-separated mobile numbers always treated as admin |
| `ADMIN_SECRET` | Secret for one-time `POST /admin/bootstrap` |
| `JWT_SECRET` | Must match between backend restarts |

## API Endpoints Used

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/admin/auth/login` | Admin login |
| POST | `/admin/bootstrap` | First admin setup (requires `ADMIN_SECRET`) |
| GET | `/admin/me` | Current admin profile |
| GET | `/admin/stats` | Dashboard statistics |
| GET | `/admin/users` | List all users |
| POST | `/admin/users` | Create user |
| PATCH | `/admin/users/:id` | Update user |
| DELETE | `/admin/users/:id` | Delete user |
| PATCH | `/admin/users/:id/subscription` | Manage subscription |
| PATCH | `/admin/users/:id/password` | Reset password |
| POST | `/admin/admins` | Create/promote admin |
| GET | `/admin/transactions` | List payment transactions |

All `/admin/*` routes (except login and bootstrap) require a valid JWT and admin privileges.

## Security

- Admin access is granted when a user has `isAdmin: true` in MongoDB **or** their mobile is listed in `ADMIN_MOBILES`
- Admin routes are protected by JWT auth + admin middleware on the Go backend
- Tokens are stored in `localStorage` and refreshed automatically on 401

## Build & Deploy

```bash
npm run build
```

Set `REACT_APP_API_BASE_URL` to your production Go API URL before building.

Deploy the `build/` folder to any static host (Netlify, Vercel, GitHub Pages, etc.).

## Troubleshooting

**403 Admin privileges required**
- Ensure the user has `isAdmin: true` or their mobile is in `ADMIN_MOBILES`
- Use `npm run create-admin` to bootstrap the first admin

**Network / CORS errors**
- Confirm Go backend is running and reachable at `REACT_APP_API_BASE_URL`
- Backend allows all origins in dev (`cors.Options{AllowedOrigins: ["*"]}`)

**Users not loading**
- Check browser console and Go backend logs
- Verify JWT token is present in localStorage (`zantri_admin_access_token`)

## License

Part of the Zantri project.
