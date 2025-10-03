# Production Deployment Guide (Docker Compose + Caddy)

This guide helps you deploy the project on a fresh Ubuntu 22.04/24.04 server using Docker Compose and Caddy with automatic HTTPS. It serves the frontend (static files) and proxies the backend (Strapi) securely.

## Prerequisites
- OS: Ubuntu 22.04/24.04 (x86_64)
- Resources (minimum): 1 vCPU / 2 GB RAM / 30 GB SSD, Swap 2 GB
- Recommended for small production: 2 vCPU / 4 GB RAM / 60 GB SSD, Swap 4 GB
- Domains:
	- Frontend: app.example.com
	- API: api.example.com

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
git clone https://github.com/<your-org>/cryptoverify-platform.git
cd cryptoverify-platform
```

Create production env for Strapi:
```bash
cp backend/.env.example backend/.env.production
# Edit backend/.env.production and set:
# - APP_KEYS, API_TOKEN_SALT, ADMIN_JWT_SECRET, JWT_SECRET, TRANSFER_TOKEN_SALT
# - (Optional) database vars if using Postgres/MySQL
# - CORS_ORIGIN=https://app.example.com
```

Build frontend locally (optional) or on server:
```bash
cd frontend
npm ci
npm run build
cd ..
```

## 3) Configure Caddy
Edit `deployment/Caddyfile`, replace domains:
```
app.example.com {  # <- change to your app domain
	root * /srv/www
	try_files {path} /index.html
	file_server
}

api.example.com {  # <- change to your API domain
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
Visit: https://api.example.com/admin
- Create admin account
- Settings → Users & Permissions → Roles → Public: allow find/findOne for platforms/news/insights/exposures/verifications and your custom `/api/search` route
- If you use API Tokens: create a Read token and configure frontend env `REACT_APP_CMS_TOKEN`

## 6) Frontend → Backend integration
- Set React env (for hosting elsewhere, e.g. Netlify/Cloudflare Pages):
	- `REACT_APP_ENABLE_CMS=true`
	- `REACT_APP_CMS_URL=https://api.example.com`
- Rebuild if env changed and redeploy static assets.

## 7) Health checks
- API: `curl -I https://api.example.com/api/search?q=test`
- App: open `https://app.example.com/search?q=test`

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

