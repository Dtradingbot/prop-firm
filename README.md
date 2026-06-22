# PropFirmHub

The most comprehensive prop trading firm directory and comparison platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| UI Components | ShadCN UI, Radix UI |
| Backend | Node.js, Express.js |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT |
| State | TanStack Query |
| Deployment | Docker, Docker Compose |

---

## Project Structure

```
propfirmhub/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Full DB schema (13 models)
│   │   └── seed.ts              # Demo data seed
│   ├── src/
│   │   ├── index.ts             # Express app entry
│   │   ├── middleware/auth.ts   # JWT + RBAC middleware
│   │   ├── routes/
│   │   │   ├── auth.ts          # Register, login, /me
│   │   │   ├── firms.ts         # Full CRUD + filters + sorting
│   │   │   ├── brokers.ts       # Broker CRUD
│   │   │   ├── offers.ts        # Offer CRUD
│   │   │   ├── reviews.ts       # Reviews with moderation
│   │   │   ├── compare.ts       # Multi-firm comparison
│   │   │   ├── redirect.ts      # /go/:slug affiliate tracking
│   │   │   ├── analytics.ts     # Click analytics + dashboard
│   │   │   ├── blog.ts          # Blog CRUD
│   │   │   ├── search.ts        # Global search
│   │   │   ├── pages.ts         # CMS pages
│   │   │   ├── menus.ts         # Dynamic menus
│   │   │   ├── settings.ts      # Site settings KV
│   │   │   ├── newsletter.ts    # Email subscription
│   │   │   └── admin.ts         # User/role management
│   │   └── utils/
│   │       ├── prisma.ts        # Prisma singleton
│   │       └── upload.ts        # Multer image upload
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/        # Public routes with Navbar+Footer
│   │   │   │   ├── page.tsx             # Homepage
│   │   │   │   ├── firms/page.tsx       # Directory + filters
│   │   │   │   ├── firms/[slug]/        # Single firm page
│   │   │   │   ├── brokers/page.tsx     # Broker directory
│   │   │   │   ├── compare/page.tsx     # Comparison tool
│   │   │   │   ├── offers/page.tsx      # Offers & coupons
│   │   │   │   ├── top-rated/page.tsx   # Top rated firms
│   │   │   │   ├── trending/page.tsx    # Trending firms
│   │   │   │   └── blog/                # Blog listing + posts
│   │   │   ├── admin/           # Admin panel
│   │   │   │   ├── page.tsx             # Dashboard
│   │   │   │   ├── login/page.tsx       # Admin login
│   │   │   │   ├── firms/page.tsx       # Manage firms
│   │   │   │   ├── reviews/page.tsx     # Moderate reviews
│   │   │   │   ├── offers/page.tsx      # Manage offers
│   │   │   │   ├── blog/page.tsx        # Manage blog
│   │   │   │   └── analytics/page.tsx   # Analytics
│   │   │   ├── sitemap.ts       # Auto-generated sitemap
│   │   │   └── robots.ts        # Robots.txt
│   │   ├── components/
│   │   │   ├── layout/          # Navbar, Footer, Providers
│   │   │   ├── firms/           # FirmCard, FirmFilters, ReviewSection
│   │   │   ├── home/            # Hero, Featured, Trending, Offers, etc.
│   │   │   └── admin/           # FirmFormModal, etc.
│   │   ├── lib/
│   │   │   ├── api.ts           # All API client functions
│   │   │   └── utils.ts         # Formatting helpers
│   │   ├── types/index.ts       # Full TypeScript types
│   │   └── hooks/useDebounce.ts
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or pnpm

### 2. Backend Setup

```bash
cd backend

# Copy env file
cp .env.example .env
# Edit DATABASE_URL with your PostgreSQL credentials

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to DB
npm run db:push

# Seed with demo data
npm run db:seed

# Start dev server
npm run dev
```

Backend runs on: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend

# Copy env file
cp .env.local.example .env.local

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs on: **http://localhost:3000**

### 4. Admin Panel

Navigate to **http://localhost:3000/admin**

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@propfirmhub.com | admin123! |
| Editor | editor@propfirmhub.com | editor123! |

---

## Docker Deployment

```bash
# Copy and configure
cp .env.example .env
# Set POSTGRES_PASSWORD, JWT_SECRET, NEXT_PUBLIC_API_URL

# Build and start all services
docker compose up -d --build

# Run migrations + seed
docker compose exec backend npm run db:seed
```

---

## Database Models

| Model | Description |
|-------|-------------|
| User | Traders and admins with RBAC roles |
| PropFirm | Full firm data including rules, drawdown, platforms |
| FundingProgram | Account sizes and profit splits per firm |
| FAQ | Firm-specific Q&A |
| Broker | Regulated brokers linked to firms |
| Offer | Coupon codes and discounts |
| Review | User reviews with approval workflow |
| BlogPost | CMS blog with categories and tags |
| Category / Tag | Blog taxonomy |
| Click | Affiliate click tracking with source/device |
| Analytics | Page view analytics |
| Page | CMS static pages |
| Menu / MenuItem | Dynamic header/footer menus |
| Setting | Key-value site settings |
| Newsletter | Email subscriptions |

---

## API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/firms | List firms with filters & pagination |
| GET | /api/firms/featured | Featured firms |
| GET | /api/firms/top-rated | Highest rated firms |
| GET | /api/firms/trending | Trending firms |
| GET | /api/firms/:slug | Single firm with all relations |
| POST | /api/compare | Compare up to 4 firms |
| GET | /api/search?q= | Global search |
| GET | /api/brokers | List all brokers |
| GET | /api/brokers/:slug | Single broker |
| GET | /api/offers | Active offers |
| GET | /api/blog | Blog posts |
| GET | /api/blog/:slug | Single post |
| GET | /go/:slug | Affiliate redirect (tracks click) |
| POST | /api/newsletter/subscribe | Newsletter signup |
| POST | /api/auth/register | User registration |
| POST | /api/auth/login | Login → JWT |

### Protected Endpoints (JWT required)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /api/reviews | USER | Submit review |
| GET | /api/analytics/dashboard | ADMIN | Dashboard stats |
| POST | /api/firms | ADMIN | Create firm |
| PUT | /api/firms/:id | ADMIN | Update firm |
| DELETE | /api/firms/:id | ADMIN | Delete firm |
| PATCH | /api/reviews/:id/status | ADMIN | Approve/reject |
| GET | /api/admin/users | SUPER_ADMIN | List users |
| PATCH | /api/admin/users/:id/role | SUPER_ADMIN | Change role |

---

## Key Features

### Affiliate Tracking
Every `Visit Website` click routes through `/go/:slug`:
1. Backend logs the click (source, device, IP, referrer)
2. Increments firm `clickCount` and `engagementScore`
3. Redirects to `affiliateUrl` (or `websiteUrl` if no affiliate link)
4. Admins can update affiliate links anytime from the admin panel

### Trending Algorithm
```
engagementScore = (viewCount × 1) + (clickCount × 2) + (reviewCount × 5)
```
Updated in real-time on every interaction.

### Review System
- Users submit reviews (pending moderation)
- Admins approve/reject from `/admin/reviews`
- On approval, firm's `averageRating` and `reviewCount` auto-recalculate
- Users can upload proof images

### Trust Score
Admin-configurable per firm (`trustScore` field, 0-100). Displayed on cards and firm pages with color coding: green (80+), yellow (60-79), red (<60).

---

## SEO Features
- Dynamic `generateMetadata` per firm page
- Auto-generated sitemap at `/sitemap.xml`
- robots.txt blocks admin + affiliate URLs
- Open Graph + Twitter Card support
- Schema markup field on firms
- Canonical URL per page
- Server-side rendered firm pages (ISR, 5min cache)

---

## Production Checklist

- [ ] Set strong `JWT_SECRET` (32+ chars)
- [ ] Set `POSTGRES_PASSWORD` 
- [ ] Configure `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL`
- [ ] Set up reverse proxy (Nginx/Caddy) with SSL
- [ ] Configure SMTP for email notifications
- [ ] Set up CDN for uploaded images
- [ ] Enable database backups
- [ ] Change default admin password
- [ ] Add Google Analytics / Plausible
- [ ] Configure rate limiting for production load

---

## VPS Deployment (Nginx + SSL)

```nginx
server {
    server_name propfirmhub.com www.propfirmhub.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 10M;
    }
    
    location /go/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Then: `certbot --nginx -d propfirmhub.com -d www.propfirmhub.com`
