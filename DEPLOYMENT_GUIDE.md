# PropFirmHub — Complete Manual Deployment Guide

This guide covers deploying PropFirmHub manually on a VPS (Ubuntu/Debian)
without Docker. This is the recommended method for traditional hosting.

---

## Table of Contents
1. [Server Requirements](#server-requirements)
2. [Step 1 — Server Preparation](#step-1--server-preparation)
3. [Step 2 — Install PostgreSQL](#step-2--install-postgresql)
4. [Step 3 — Install Node.js](#step-3--install-nodejs)
5. [Step 4 — Upload Project Files](#step-4--upload-project-files)
6. [Step 5 — Configure Backend](#step-5--configure-backend)
7. [Step 6 — Configure Frontend](#step-6--configure-frontend)
8. [Step 7 — Install Nginx](#step-7--install-nginx)
9. [Step 8 — SSL with Let's Encrypt](#step-8--ssl-with-lets-encrypt)
10. [Step 9 — PM2 Process Manager](#step-9--pm2-process-manager)
11. [Step 10 — Seed Database](#step-10--seed-database)
12. [Common Commands](#common-commands)
13. [Troubleshooting](#troubleshooting)

---

## Server Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| RAM | 1 GB | 2 GB |
| CPU | 1 vCPU | 2 vCPU |
| Disk | 20 GB | 40 GB |
| OS | Ubuntu 20.04 | Ubuntu 22.04 LTS |
| Domain | Required | Required |

---

## Step 1 — Server Preparation

SSH into your server:
```bash
ssh root@YOUR_SERVER_IP
```

Update system packages:
```bash
apt update && apt upgrade -y
apt install -y curl wget git unzip build-essential
```

Create a non-root user (recommended):
```bash
adduser propfirmhub
usermod -aG sudo propfirmhub
su - propfirmhub
```

---

## Step 2 — Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

Inside the PostgreSQL prompt:
```sql
CREATE USER propfirmhub WITH PASSWORD 'YOUR_STRONG_PASSWORD_HERE';
CREATE DATABASE propfirmhub OWNER propfirmhub;
GRANT ALL PRIVILEGES ON DATABASE propfirmhub TO propfirmhub;
\q
```

Test the connection:
```bash
psql -U propfirmhub -d propfirmhub -h localhost
# Enter your password when prompted
\q
```

---

## Step 3 — Install Node.js

```bash
# Install Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version    # Should show v20.x.x
npm --version     # Should show 10.x.x
```

Install PM2 globally (process manager):
```bash
sudo npm install -g pm2
```

---

## Step 4 — Upload Project Files

### Option A: Upload via FileZilla (SFTP)

1. Open **FileZilla**
2. Host: `sftp://YOUR_SERVER_IP`
3. Username: `propfirmhub` (or your user)
4. Password: your SSH password
5. Port: `22`
6. Upload the entire `propfirmhub/` folder to `/home/propfirmhub/`

### Option B: Upload via SCP command (from your PC)

```bash
# Run this on YOUR LOCAL machine (Windows: use Git Bash or WSL)
scp -r "C:\Users\Welcome\Desktop\popframj\propfirmhub" propfirmhub@YOUR_SERVER_IP:/home/propfirmhub/
```

### Option C: Git Clone (if you push to GitHub first)

```bash
# On server
cd /home/propfirmhub
git clone https://github.com/yourusername/propfirmhub.git
```

---

## Step 5 — Configure Backend

```bash
cd /home/propfirmhub/propfirmhub/backend
```

**Install dependencies:**
```bash
npm install
```

**Create environment file:**
```bash
cp .env.example .env
nano .env
```

Fill in your `.env`:
```env
DATABASE_URL="postgresql://propfirmhub:YOUR_STRONG_PASSWORD_HERE@localhost:5432/propfirmhub"
JWT_SECRET="replace-this-with-a-64-character-random-string"
PORT=5000
FRONTEND_URL="https://couponen.com"
NODE_ENV="production"

# Optional: Email settings
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your@gmail.com"
SMTP_PASS="your-app-password"
```

**Generate a strong JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and paste it as your `JWT_SECRET`.

**Generate Prisma client:**
```bash
npx prisma generate
```

**Run database migrations:**
```bash
npx prisma migrate deploy
```

If migrations folder doesn't exist yet:
```bash
npx prisma db push
```

**Build the backend:**
```bash
npm run build
```

**Test the backend works:**
```bash
node dist/index.js
# Should show: PropFirmHub API running on port 5000
# Press Ctrl+C to stop
```

**Create uploads directory:**
```bash
mkdir -p uploads
chmod 755 uploads
```

---

## Step 6 — Configure Frontend

```bash
cd /home/propfirmhub/propfirmhub/frontend
```

**Install dependencies:**
```bash
npm install
```

**Create environment file:**
```bash
cp .env.local.example .env.local
nano .env.local
```

Fill in `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://couponen.com/api
NEXT_PUBLIC_SITE_URL=https://couponen.com
```

**Add Next.js standalone output** (edit `next.config.ts`):
```bash
nano next.config.ts
```

Add `output: 'standalone'` to the config:
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',   // ADD THIS LINE
  images: {
    remotePatterns: [...]
  },
  // ... rest of config
};
```

**Build the frontend:**
```bash
npm run build
```

This takes 2-5 minutes. When done you'll see:
```
✓ Compiled successfully
Route (app) ...
```

---

## Step 7 — Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

**Create Nginx configuration:**
```bash
sudo nano /etc/nginx/sites-available/propfirmhub
```

Paste this configuration (replace `couponen.com`):

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;

server {
    listen 80;
    server_name couponen.com www.couponen.com;

    # Logs
    access_log /var/log/nginx/propfirmhub.access.log;
    error_log  /var/log/nginx/propfirmhub.error.log;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Client upload size
    client_max_body_size 10M;

    # Frontend (Next.js) — port 3000
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API — port 5000
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Affiliate redirect — port 5000
    location /go/ {
        proxy_pass http://127.0.0.1:5000/go/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploaded images from backend
    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        # Cache images for 7 days
        proxy_cache_valid 200 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # Next.js static files
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000/_next/static/;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

**Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/propfirmhub /etc/nginx/sites-enabled/
sudo nginx -t          # Test config — should say "test is successful"
sudo systemctl reload nginx
```

---

## Step 8 — SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d couponen.com -d www.couponen.com

# Follow prompts:
# - Enter your email
# - Agree to terms (A)
# - Choose to redirect HTTP to HTTPS (2)
```

Certbot will automatically update your Nginx config with SSL. Test renewal:
```bash
sudo certbot renew --dry-run
```

---

## Step 9 — PM2 Process Manager

PM2 keeps your Node.js apps running and restarts them on crash or server reboot.

**Create PM2 ecosystem file:**
```bash
nano /home/propfirmhub/propfirmhub/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'propfirmhub-api',
      script: './backend/dist/index.js',
      cwd: '/home/propfirmhub/propfirmhub',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: '/home/propfirmhub/logs/api-error.log',
      out_file: '/home/propfirmhub/logs/api-out.log',
    },
    {
      name: 'propfirmhub-web',
      script: '.next/standalone/server.js',
      cwd: '/home/propfirmhub/propfirmhub/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1',
      },
      error_file: '/home/propfirmhub/logs/web-error.log',
      out_file: '/home/propfirmhub/logs/web-out.log',
    },
  ],
};
```

**Create logs directory:**
```bash
mkdir -p /home/propfirmhub/logs
```

**Copy Next.js standalone files:**
```bash
# Required for standalone mode
cp -r /home/propfirmhub/propfirmhub/frontend/public \
      /home/propfirmhub/propfirmhub/frontend/.next/standalone/public

cp -r /home/propfirmhub/propfirmhub/frontend/.next/static \
      /home/propfirmhub/propfirmhub/frontend/.next/standalone/.next/static
```

**Start both apps:**
```bash
cd /home/propfirmhub/propfirmhub
pm2 start ecosystem.config.js
pm2 save
```

**Enable PM2 on system startup:**
```bash
pm2 startup
# Copy and run the command it outputs, e.g.:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u propfirmhub --hp /home/propfirmhub
```

**Check both apps are running:**
```bash
pm2 list
# Should show propfirmhub-api and propfirmhub-web both as "online"
```

---

## Step 10 — Seed Database

```bash
cd /home/propfirmhub/propfirmhub/backend

# Run seed (creates admin user + demo data)
npx tsx prisma/seed.ts
```

Output should show:
```
✅ Database seeded successfully!
Admin login: admin@propfirmhub.com / admin123!
```

**IMPORTANT: Change admin password immediately after first login!**

---

## Verify Everything Works

Open your browser and check:

| URL | Expected |
|-----|---------|
| `https://couponen.com` | Homepage loads |
| `https://couponen.com/firms` | Firm directory |
| `https://couponen.com/admin` | Redirects to login |
| `https://couponen.com/api/health` | `{"status":"ok"}` |
| `https://couponen.com/go/ftmo` | Redirects to FTMO |
| `https://couponen.com/sitemap.xml` | XML sitemap |

---

## Common Commands

```bash
# View logs
pm2 logs propfirmhub-api
pm2 logs propfirmhub-web

# Restart apps
pm2 restart propfirmhub-api
pm2 restart propfirmhub-web
pm2 restart all

# Stop apps
pm2 stop all

# Monitor CPU/RAM
pm2 monit

# View Nginx logs
sudo tail -f /var/log/nginx/propfirmhub.access.log
sudo tail -f /var/log/nginx/propfirmhub.error.log

# Check PostgreSQL status
sudo systemctl status postgresql

# Connect to database
psql -U propfirmhub -d propfirmhub -h localhost

# Database backup
pg_dump -U propfirmhub -d propfirmhub -h localhost > backup_$(date +%Y%m%d).sql

# Database restore
psql -U propfirmhub -d propfirmhub -h localhost < backup_20241201.sql
```

---

## Updating the Application

When you make changes and want to redeploy:

```bash
# 1. Upload new files via FileZilla or SCP

# 2. Rebuild backend
cd /home/propfirmhub/propfirmhub/backend
npm install
npm run build
pm2 restart propfirmhub-api

# 3. Rebuild frontend
cd /home/propfirmhub/propfirmhub/frontend
npm install
npm run build

# Copy standalone files again
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

pm2 restart propfirmhub-web

# 4. Run new migrations (if schema changed)
cd ../backend
npx prisma migrate deploy
```

---

## Troubleshooting

### App won't start
```bash
pm2 logs propfirmhub-api --lines 50
# Look for the error message
```

### Database connection error
```bash
# Check DATABASE_URL in .env
cat /home/propfirmhub/propfirmhub/backend/.env

# Test connection
psql "postgresql://propfirmhub:PASSWORD@localhost:5432/propfirmhub"
```

### Nginx 502 Bad Gateway
```bash
# Check if PM2 apps are running
pm2 list

# Check ports are listening
ss -tlnp | grep -E '3000|5000'
```

### Port already in use
```bash
# Find what's on port 5000
fuser 5000/tcp
# Kill it
fuser -k 5000/tcp
```

### Images not uploading
```bash
# Fix permissions on uploads folder
chmod -R 755 /home/propfirmhub/propfirmhub/backend/uploads
chown -R propfirmhub:propfirmhub /home/propfirmhub/propfirmhub/backend/uploads
```

### SSL certificate expiry
```bash
# Renew certificate manually
sudo certbot renew
# Auto-renewal is already set up by certbot via cron
```

---

## Security Checklist

- [ ] Changed default admin password
- [ ] Set strong `JWT_SECRET` (64+ chars)
- [ ] Set strong database password
- [ ] Nginx rate limiting is configured
- [ ] Firewall is configured (`ufw allow 22,80,443`)
- [ ] SSH key-based login (disable password login)
- [ ] Regular database backups scheduled
- [ ] Let's Encrypt SSL is active

**Firewall setup:**
```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw deny 5000/tcp  # Block direct API access (use Nginx)
sudo ufw deny 3000/tcp  # Block direct Next.js access (use Nginx)
sudo ufw enable
sudo ufw status
```

---

## Automated Backup Script

Create a daily backup cron job:

```bash
nano /home/propfirmhub/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/propfirmhub/backups"
DATE=$(date +%Y%m%d_%H%M)
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U propfirmhub -d propfirmhub -h localhost > "$BACKUP_DIR/db_$DATE.sql"

# Uploads backup
cp -r /home/propfirmhub/propfirmhub/backend/uploads "$BACKUP_DIR/uploads_$DATE"

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "uploads_*" -mtime +7 -type d -exec rm -rf {} + 2>/dev/null

echo "Backup completed: $DATE"
```

```bash
chmod +x /home/propfirmhub/backup.sh

# Add to cron (runs daily at 2 AM)
crontab -e
# Add this line:
0 2 * * * /home/propfirmhub/backup.sh >> /home/propfirmhub/logs/backup.log 2>&1
```

---

## Default Credentials (Change Immediately!)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@propfirmhub.com | admin123! |
| Editor | editor@propfirmhub.com | editor123! |

Login at: `https://couponen.com/admin`
