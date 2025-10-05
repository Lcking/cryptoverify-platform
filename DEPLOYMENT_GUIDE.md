# Production Deployment Guide (Docker Compose + Caddy)

This guide helps you deploy the project on a fresh Ubuntu 22.04/24.04 server using Docker Compose and Caddy with automatic HTTPS. It serves the frontend (static files) and proxies the backend (Strapi) securely.

## Prerequisites
- OS: Ubuntu 22.04/24.04 (x86_64)
- Resources (minimum): 1 vCPU / 2 GB RAM / 30 GB SSD, Swap 2 GB
- Recommended for small production: 2 vCPU / 4 GB RAM / 60 GB SSD, Swap 4 GB
- Domains:
	- Frontend: app.gambleverify.com
	- API: api.gambleverify.com

## 1) Install Docker & Compose
```bash
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
	"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
	$(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
	sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

## 2) Clone project & prepare files
```bash
cd /opt
git clone https://github.com/Lcking/cryptoverify-platform.git
cd cryptoverify-platform
```

Create production env for Strapi:
```bash
cp backend/.env.example backend/.env.production
# Edit backend/.env.production and set:
# - APP_KEYS, API_TOKEN_SALT, ADMIN_JWT_SECRET, JWT_SECRET, TRANSFER_TOKEN_SALT
# - (Optional) database vars if using Postgres/MySQL
# - FRONTEND_ORIGIN=https://app.gambleverify.com
# - STRAPI_ADMIN_BACKEND_URL=https://api.gambleverify.com
# These ensure secure cookies work behind the proxy and CORS matches your frontend origin.
```

Build frontend locally (optional) or on server:
```bash
cd frontend
npm ci
npm run build
cd ..
```

## 3) Configure Caddy
Edit `deployment/Caddyfile`, confirm domains:
```
app.gambleverify.com {
	root * /srv/www
	try_files {path} /index.html
	file_server
}

api.gambleverify.com {
	reverse_proxy strapi:1337
}
```

## 4) Start services
```bash
cd deployment
docker compose -f docker-compose.prod.yml up -d
```

On first run, Strapi will build the admin panel and start the server.

## 5) Initialize Strapi
Visit: https://api.gambleverify.com/admin
- Create admin account (first-time only). You do NOT need to register on strapi.io — Strapi admin is self-hosted per-instance.
- If an admin already exists, you'll see a Login screen (no registration). Use the existing credentials.
- Settings → Users & Permissions → Roles → Public: allow find/findOne for platforms/news/insights/exposures/verifications and your custom `/api/search` route
- If you use API Tokens: create a Read token and configure frontend env `REACT_APP_CMS_TOKEN`

### 5a) Admin login, forgot password, and reset
- Forgot password: use the “Forgot password?” link on the login page. This requires a working email provider configured in Strapi.
- If email is not configured or the email cannot be received, you can reset the admin password from the running container:

```bash
# Open a shell in the Strapi container
docker compose -f deployment/docker-compose.prod.yml exec strapi sh

# Inside the container, run the Strapi admin reset command
# (npx will resolve the local Strapi binary in node_modules)
npx strapi admin:reset-user-password --email="admin@yourdomain.com" --password='NewStrongP@ssw0rd!'

# Then exit the container
exit
```

Notes:
- The exact command may vary slightly by Strapi version; if the above fails, try `yarn strapi admin:reset-user-password` or `node node_modules/.bin/strapi admin:reset-user-password` inside the container.
- After the first admin is created, registration is disabled by design; subsequent admins must be invited from the Admin UI.

## 6) Frontend → Backend integration
- Set React env (for hosting elsewhere, e.g. Netlify/Cloudflare Pages):
	- `REACT_APP_ENABLE_CMS=true`
	- `REACT_APP_CMS_URL=https://api.gambleverify.com`
- Rebuild if env changed and redeploy static assets.

### Rebuild frontend on server (Dockerized Node)
```bash
# Run inside repo root on server
docker run --rm \
	-e REACT_APP_ENABLE_CMS=true \
	-e REACT_APP_CMS_URL=https://api.gambleverify.com \
	-v "$PWD/frontend":/app \
	-w /app node:20 bash -lc "npm ci && npm run build"

# Restart Caddy (static is served from ../frontend/build mounted to /srv/www)
docker compose -f deployment/docker-compose.prod.yml restart caddy
```

## 7) Health checks
- API: `curl -I https://api.gambleverify.com/api/search?q=test`
- App: open `https://app.gambleverify.com/search?q=test`

### 7a) Permissions & data checklist (avoid 403/empty)
If your `/api/search` returns empty arrays and `/api/<collection>` returns 403 for anonymous requests, follow this:

1. Choose access mode for frontend:
	- Public role (no token): In Strapi Admin → Settings → Users & Permissions → Roles → Public, enable `find`/`findOne` for: platforms, news, insights, exposures, verifications; also enable the custom `/api/search` route (auth: false).
	- API Token mode: Create a Read-only API Token (Settings → API Tokens). Set it as `REACT_APP_CMS_TOKEN` during frontend build so requests include `Authorization: Bearer <token>`.

2. Verify data exists and is published:
	- Ensure there are published entries in those collections (Draft & Publish enabled means only Published records are returned to public).

3. Quick probes (expect 200):
```bash
curl -I https://api.gambleverify.com/api/search?q=test
curl -I https://api.gambleverify.com/api/platforms
curl -I https://api.gambleverify.com/api/news
curl -I https://api.gambleverify.com/api/insights
curl -I https://api.gambleverify.com/api/exposures
curl -I https://api.gambleverify.com/api/verifications
```

4. If still 403 but you prefer token mode, verify frontend build has token:
	- Build env includes `REACT_APP_CMS_TOKEN=<your-token>`
	- Network requests from the app contain `Authorization: Bearer ...`

5. If `/admin/auth/login` shows login instead of registration:
	- This is expected when an admin already exists (checked by `/admin/init` → `hasAdmin: true`). Use login or reset the password as described above.

## 8) Backups & operations
- Volumes:
	- `strapi_uploads` (user uploads)
	- `strapi_db` (SQLite data). If you switch to Postgres/MySQL, back up DB dumps instead of this volume.
- Logs: `docker logs -f cryptoverify-strapi-prod` and `docker logs -f cryptoverify-caddy`
- Update:
	```bash
	git pull
	docker compose -f deployment/docker-compose.prod.yml restart strapi
	```

## Notes
- For production databases, prefer Postgres and object storage for uploads.
- Keep only 80/443 open to the internet; other ports are internal.
- Make sure strong secrets are set in `.env.production`.

