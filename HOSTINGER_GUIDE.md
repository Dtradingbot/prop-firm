# PropFirmHub — Complete Hostinger Deployment Guide

This guide deploys PropFirmHub on Hostinger shared/business hosting.
Hostinger uses **MySQL** and supports **Node.js** apps via hPanel.

---

## Overview — How It Works on Hostinger

```
yourdomain.com          → Next.js frontend  (Node.js App #1, port 3000)
api.yourdomain.com      → Express backend   (Node.js App #2, port 3001)
MySQL database          → From hPanel → Databases → MySQL Databases
Uploads folder          → /public_html/api.yourdomain.com/uploads/
```

You will create **2 Node.js applications** in hPanel, one for each subdomain.

---

## PART 1 — Prepare on Your Local PC

### Step 1 — Build the Backend

Open **Git Bash** or **Command Prompt** on your PC:

```bash
cd "C:\Users\Welcome\Desktop\popframj\propfirmhub\backend"

# Install all packages
npm install

# Build TypeScript to JavaScript
npm run build
```

You will see a new folder `backend/dist/` created. This is what you upload.

---

### Step 2 — Build the Frontend

```bash
cd "C:\Users\Welcome\Desktop\popframj\propfirmhub\frontend"

# Install all packages
npm install

# Build Next.js for production
npm run build
```

After build finishes, copy static files into standalone:

**Windows — run these in Git Bash:**
```bash
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
```

You will upload the `.next/standalone/` folder.

---

## PART 2 — Hostinger hPanel Setup

### Step 3 — Create MySQL Database

1. Login to **hPanel** at `hpanel.hostinger.com`
2. Go to **Hosting** → click **Manage** on your plan
3. Left sidebar → **Databases** → **MySQL Databases**
4. Click **Create new database**
5. Fill in:
   - Database name: `propfirm` → Hostinger will prefix it: `u123456789_propfirm`
   - Username: `propfirm` → becomes `u123456789_propfirm`
   - Password: create a **strong password** (save it!)
6. Click **Create**

> **Write down these 4 values — you need them for `.env`:**
> - Host: `127.0.0.1`
> - Database: `u123456789_propfirm`
> - Username: `u123456789_propfirm`
> - Password: (what you set)

---

### Step 4 — Create Subdomains

You need **2 subdomains** for the two Node.js apps.

1. hPanel → **Domains** → **Subdomains**
2. Create subdomain: `api` → points to `/public_html/api.yourdomain.com`
3. That's it — the frontend lives on the main domain

---

### Step 5 — Create Node.js App for Backend (API)

1. hPanel → **Advanced** → **Node.js**
2. Click **Create Application**
3. Fill in:
   - **Node.js version**: `20.x` (or highest available)
   - **Application mode**: `Production`
   - **Application root**: `api.yourdomain.com` ← this is the folder name
   - **Application URL**: `api.yourdomain.com`
   - **Application startup file**: `dist/index.js`
4. Click **Create**
5. Note the **application path** shown (e.g. `/home/u123456789/api.yourdomain.com`)

---

### Step 6 — Create Node.js App for Frontend

1. hPanel → **Advanced** → **Node.js**
2. Click **Create Application**
3. Fill in:
   - **Node.js version**: `20.x`
   - **Application mode**: `Production`
   - **Application root**: `public_html` (main domain root)
   - **Application URL**: `yourdomain.com`
   - **Application startup file**: `.next/standalone/server.js`
4. Click **Create**

---

## PART 3 — Upload Files

### Step 7 — Upload via File Manager or FileZilla

#### Option A: File Manager (easier for beginners)

1. hPanel → **Files** → **File Manager**
2. Navigate to your home directory

**Upload Backend files:**
- Open `/api.yourdomain.com/` folder
- Upload these files/folders from your `backend/` folder:
  ```
  dist/           ← compiled backend code
  node_modules/   ← WARNING: this is 150MB, see tip below
  prisma/         ← schema and migrations
  package.json
  .env            ← create this (see Step 8)
  ```

> **Tip:** `node_modules` is huge. Instead, upload everything EXCEPT `node_modules`, then install via SSH (Step 10).

**Upload Frontend files:**
- Open `/public_html/` folder
- Upload the `.next/standalone/` folder contents:
  ```
  .next/          ← from .next/standalone/.next/
  node_modules/   ← from .next/standalone/node_modules/
  public/         ← from .next/standalone/public/
  server.js       ← from .next/standalone/server.js
  package.json    ← from .next/standalone/package.json
  .env.local      ← create this (see Step 9)
  ```

#### Option B: FileZilla (faster for large files)

1. Open **FileZilla**
2. File → Site Manager → New Site
3. Protocol: `SFTP`
4. Host: your domain or server IP (from hPanel → SSH Access)
5. Username & Password: your Hostinger login OR SSH credentials
6. Connect
7. Left panel = your PC files, Right panel = server
8. Drag and drop folders as described above

---

### Step 8 — Create Backend `.env` on Server

In **File Manager**, inside `/api.yourdomain.com/`, create a new file called `.env`:

```
DATABASE_URL="mysql://u123456789_propfirm:YourPassword@127.0.0.1:3306/u123456789_propfirm"
JWT_SECRET="paste-your-64-char-random-string-here"
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://yourdomain.com"
```

**To generate JWT_SECRET on your PC (Git Bash):**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and paste it as the JWT_SECRET value.

---

### Step 9 — Create Frontend `.env.local` on Server

In **File Manager**, inside `/public_html/`, create a new file called `.env.local`:

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
PORT=3000
HOSTNAME=0.0.0.0
```

---

## PART 4 — SSH Setup & Database Migration

### Step 10 — Connect via SSH

1. hPanel → **Advanced** → **SSH Access**
2. Enable SSH if not already enabled
3. Note your SSH username and server IP

**Open Git Bash on your PC:**
```bash
ssh u123456789@yourdomain.com
# Enter your password when asked
```

---

### Step 11 — Install Backend Dependencies (if not uploaded node_modules)

```bash
# Navigate to backend folder
cd ~/api.yourdomain.com

# Install production dependencies only
npm install --omit=dev
```

---

### Step 12 — Run Database Migration

```bash
# Still in ~/api.yourdomain.com
cd ~/api.yourdomain.com

# Generate Prisma client
npx prisma generate

# Push schema to MySQL (creates all tables)
npx prisma db push

# Seed with demo data
npx tsx prisma/seed.ts
```

You should see:
```
✅ Database seeded successfully!
Admin login: admin@propfirmhub.com / admin123!
```

---

### Step 13 — Create Uploads Folder

```bash
mkdir -p ~/api.yourdomain.com/uploads
chmod 755 ~/api.yourdomain.com/uploads
```

---

## PART 5 — Start Applications

### Step 14 — Start Both Node.js Apps

1. hPanel → **Advanced** → **Node.js**
2. Find **api.yourdomain.com** app → click **Restart** (or Start)
3. Find **yourdomain.com** app → click **Restart** (or Start)

Both should show status: **Running** ✓

---

### Step 15 — Configure .htaccess for Backend Subdomain

In **File Manager**, go to `/api.yourdomain.com/` and create `.htaccess`:

```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3001/$1 [P,L]
```

For the frontend, go to `/public_html/` and create/update `.htaccess`:

```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

---

## PART 6 — Verify Everything Works

### Step 16 — Test Each URL

Open your browser and check:

| URL | Expected Result |
|-----|----------------|
| `https://yourdomain.com` | PropFirmHub homepage |
| `https://yourdomain.com/firms` | Firm directory |
| `https://yourdomain.com/admin` | Admin login page |
| `https://api.yourdomain.com/health` | `{"status":"ok"}` |
| `https://api.yourdomain.com/api/firms` | JSON list of firms |
| `https://yourdomain.com/go/ftmo` | Redirects to FTMO |
| `https://yourdomain.com/sitemap.xml` | XML sitemap |

### Login to Admin Panel

URL: `https://yourdomain.com/admin`

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@propfirmhub.com | admin123! |
| Editor | editor@propfirmhub.com | editor123! |

> **Change the admin password immediately after first login!**

---

## PART 7 — Add SSL (HTTPS)

Hostinger provides **free SSL** for all domains.

1. hPanel → **Security** → **SSL/TLS**
2. Find `yourdomain.com` → click **Install**
3. Find `api.yourdomain.com` → click **Install**
4. Wait 5-10 minutes for SSL to activate

---

## PART 8 — Add Your Content

### Add Prop Firms

1. Login to `https://yourdomain.com/admin`
2. Go to **Prop Firms** → **Add Firm**
3. For each firm fill in:
   - Name, Logo, Description
   - **Website URL** = their actual website
   - **Affiliate URL** = YOUR affiliate link (e.g. `https://ftmo.com/?affiliateId=YOUR_ID`)
   - Funding sizes, profit split, platforms
4. Save

### How Affiliate Links Work

When a visitor clicks **"Visit Website"** on any firm:
1. They go to `yourdomain.com/go/firm-slug`
2. Server logs the click (device, source, country)
3. Server redirects to your affiliate URL
4. You earn commission

You can change the affiliate URL anytime from admin — **no code changes needed.**

### Add Coupon Codes

1. Admin → **Offers** → **Add Offer**
2. Fill: Title, Discount %, Coupon Code, Affiliate URL
3. Link to the firm
4. Save — appears on homepage, firm page, and offers page

---

## Troubleshooting

### App shows "Application Error"

```bash
# SSH in and check logs
cd ~/api.yourdomain.com
cat logs/error.log

# Or check if .env is correct
cat .env
```

### Database connection error

```bash
# Test MySQL connection
mysql -u u123456789_propfirm -p -h 127.0.0.1 u123456789_propfirm
# Enter password → if it connects, database is fine
# Then check DATABASE_URL in .env matches exactly
```

### Frontend shows blank page

```bash
# SSH in
cd ~/public_html
ls -la .next/standalone/

# Make sure these exist:
# server.js
# .next/
# public/
# node_modules/
```

### Uploads folder — images not showing

```bash
# SSH in
chmod -R 755 ~/api.yourdomain.com/uploads/
```

### Node.js app won't start — wrong startup file

- Go to hPanel → Node.js
- Backend startup file must be: `dist/index.js`
- Frontend startup file must be: `.next/standalone/server.js`

---

## Update the Website (After Changes)

When you add new features or fix something:

**Backend update:**
```bash
# On your PC - rebuild
cd backend
npm run build

# Upload the new dist/ folder via FileZilla
# Then in hPanel → Node.js → Restart backend app
```

**Frontend update:**
```bash
# On your PC - rebuild
cd frontend
npm run build
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

# Upload .next/standalone/ contents via FileZilla
# Then in hPanel → Node.js → Restart frontend app
```

---

## File Structure on Hostinger Server

```
/home/u123456789/
├── api.yourdomain.com/        ← BACKEND
│   ├── dist/                  ← compiled Express.js
│   ├── node_modules/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── uploads/               ← uploaded images
│   ├── package.json
│   └── .env                   ← your secrets
│
└── public_html/               ← FRONTEND
    ├── .next/
    │   └── standalone/
    │       ├── server.js      ← Next.js server
    │       ├── .next/
    │       └── node_modules/
    ├── public/
    ├── package.json
    └── .env.local             ← frontend config
```

---

## Monthly Maintenance

- **Check Node.js apps** → hPanel → Node.js → both should say Running
- **Update prop firm data** → Admin panel → Prop Firms → Edit
- **Moderate reviews** → Admin panel → Reviews → Approve/Reject
- **Add new offers** → Admin panel → Offers → Add
- **Database backup** → hPanel → Databases → Backup/Export
- **Renew SSL** → Hostinger auto-renews free SSL

---

## Hostinger Plan Requirements

| Feature | Required Plan |
|---------|--------------|
| Node.js support | Business or higher |
| MySQL database | All plans |
| SSH access | Business or higher |
| Multiple subdomains | Premium or higher |
| Free SSL | All plans |

> If you are on a **Starter** plan, upgrade to **Business** to get Node.js support.
