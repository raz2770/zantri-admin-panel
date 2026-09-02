# Zantri Admin Panel Deployment Guide

The admin panel is a React SPA that talks to the **Go backend** (`jantri-backend-go`) via JWT — no Firebase.

## Prerequisites

1. Go API deployed (e.g. Render) with admin env vars:
   - `JWT_SECRET`, `MONGODB_URI`
   - `ADMIN_MOBILES` and/or `ADMIN_SECRET` for bootstrap
2. First admin created via `npm run create-admin` or `POST /admin/bootstrap`

## Build

Set the API URL at **build time**:

```bash
cd admin-panel
cp .env.example .env
# REACT_APP_API_BASE_URL=https://your-api.onrender.com
npm install
npm run build
```

## GitHub Pages

```bash
npm run deploy
```

Live URL (if configured): `https://raz2770.github.io/zantri-admin-panel/`

Ensure `homepage` in `package.json` matches your Pages path.

## Render Static Site (alternative)

| Setting | Value |
|---------|-------|
| Root Directory | `admin-panel` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `build` |
| Env | `REACT_APP_API_BASE_URL=https://your-api.onrender.com` |

## Login

Use **mobile number + password** for an admin account (not email).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API network errors | Check `REACT_APP_API_BASE_URL` was set when building |
| 401 on login | User must have `isAdmin` or mobile in `ADMIN_MOBILES` |
| CORS errors | Go backend allows `*` origins by default |

## Security

- Never commit `.env` with secrets
- Use HTTPS in production
- Rotate `JWT_SECRET` and admin passwords regularly
