# PropFirmHub — Step-by-Step Implementation Plan

## Phase 1: Local Development Setup (Day 1)

### 1.1 Install Required Software on Your PC

| Software | Download | Purpose |
|----------|----------|---------|
| Node.js 20 LTS | nodejs.org | Run backend + frontend |
| PostgreSQL 16 | postgresql.org | Database |
| pgAdmin 4 | pgadmin.org | Database GUI |
| FileZilla | filezilla-project.org | SFTP file upload |
| VS Code | code.visualstudio.com | Code editor |
| Git Bash | git-scm.com | Terminal (Windows) |

### 1.2 Setup Local Database

1. Open pgAdmin 4
2. Right-click Servers → Create → Server
3. Name: `PropFirmHub Local`
4. Connection: localhost / port 5432
5. Username: postgres / your postgres password
6. Create new database named: `propfirmhub`

### 1.3 Configure Backend (Local)

```bash
# Open Git Bash, navigate to backend folder
cd "C:/Users/Welcome/Desktop/popframj/propfirmhub/backend"

# Create .env from example
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/propfirmhub"
JWT_SECRET="any-random-string-for-local-dev"
PORT=5000
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
```

```bash
# Install packages
npm install

# Setup database
npm run db:generate
npm run db:push
npm run db:seed

# Start backend
npm run dev
```

Open browser: `http://localhost:5000/health` → should show `{"status":"ok"}`

### 1.4 Configure Frontend (Local)

```bash
# New terminal, navigate to frontend
cd "C:/Users/Welcome/Desktop/popframj/propfirmhub/frontend"

# Create .env.local
cp .env.local.example .env.local
```

`.env.local` content:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
# Install packages
npm install

# Start frontend
npm run dev
```

Open browser: `http://localhost:3000` → PropFirmHub homepage

**Admin panel:** `http://localhost:3000/admin` → login: admin@propfirmhub.com / admin123!

---

## Phase 2: Add Your Content (Days 2-3)

### 2.1 Add Prop Firms via Admin Panel

1. Go to `http://localhost:3000/admin/firms`
2. Click **Add Firm**
3. Fill in for each firm:
   - Name, Logo, Description
   - Website URL (their actual site)
   - **Affiliate URL** (your affiliate link for that firm)
   - Funding sizes, profit split, drawdown
   - Platforms (MT4, MT5, etc.)
   - Broker selection
   - Mark as Featured if applicable

**Recommended firms to add first:**
- FTMO
- MyForexFunds  
- TopStep
- Apex Trader Funding
- E8 Funding
- The Funded Trader
- Lark Funding
- FundedNext
- True Forex Funds
- Surge Trader

### 2.2 Add Brokers

1. Go to `http://localhost:3000/admin/brokers`
2. Add each broker:
   - Eightcap, Tradelocker, Match-Trader
   - IC Markets, Blueberry Markets
   - Purple Trading

### 2.3 Add Coupon Codes & Offers

1. Go to `http://localhost:3000/admin/offers`
2. For each firm with a coupon:
   - Title: "10% OFF FTMO Challenge"
   - Discount: 10
   - Coupon Code: YOURCODE
   - Affiliate URL: your affiliate link
   - Link to firm

### 2.4 Write Initial Blog Posts

1. Go to `http://localhost:3000/admin/blog`
2. Add 5-10 initial posts:
   - "Best Prop Firms 2025 — Complete Comparison"
   - "How to Pass the FTMO Challenge"
   - "TopStep vs FTMO — Which is Better?"
   - "Instant Funding Prop Firms — Complete List"
   - "Prop Firm Drawdown Rules Explained"

---

## Phase 3: SEO & Settings (Day 3)

### 3.1 Configure Site Settings

1. Go to `http://localhost:3000/admin/settings`
2. Fill in:
   - Site Name: PropFirmHub
   - Meta Title: "PropFirmHub — Compare Prop Firms & Find Best Deals"
   - Meta Description: "Compare 100+ prop trading firms..."
   - Contact Email
   - Social media URLs

### 3.2 Create CMS Pages

1. Go to `http://localhost:3000/admin/pages`
2. Edit these default pages:
   - **About Us** — write your story
   - **Privacy Policy** — GDPR compliant policy
   - **Terms of Service** — usage terms
   - **Disclaimer** — affiliate disclosure (REQUIRED for affiliate sites)
   - **Contact** — contact form info

### 3.3 Add Reviews to Initial Firms

Reviews improve SEO and trust. You can:
- Register test accounts and leave initial reviews
- Approve them from `/admin/reviews`

---

## Phase 4: Production Build (Day 4)

### 4.1 Update Frontend for Production

Add `output: 'standalone'` to `frontend/next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',   // ← ADD THIS
  images: { ... },
  // ...
};
```

### 4.2 Build for Production

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd ../frontend
npm run build
```

If build succeeds, you're ready for deployment.

---

## Phase 5: Hosting Setup (Day 4-5)

### 5.1 Choose a VPS Provider

| Provider | Monthly Cost | Specs | Recommended |
|----------|-------------|-------|-------------|
| Hetzner Cloud | ~$5-8 | 2 vCPU, 4GB RAM | ✓ Best value |
| DigitalOcean | ~$12 | 2 vCPU, 2GB RAM | ✓ Popular |
| Linode (Akamai) | ~$10 | 2 vCPU, 4GB RAM | ✓ Good |
| Vultr | ~$10 | 2 vCPU, 4GB RAM | ✓ Good |
| AWS Lightsail | ~$10 | 2 vCPU, 1GB RAM | Good |

**Recommended: Hetzner CX22** (€4.35/month, Germany/Finland)

### 5.2 Create VPS

1. Sign up at your chosen provider
2. Create new server:
   - OS: Ubuntu 22.04 LTS
   - Size: 2 vCPU, 4GB RAM minimum
   - Region: closest to your target audience
   - Add your SSH key
3. Note your server's IP address

### 5.3 Point Domain to Server

In your domain registrar's DNS settings:
```
A Record:   @    →  YOUR_SERVER_IP
A Record:   www  →  YOUR_SERVER_IP
```

DNS propagation takes 1-48 hours. Use `https://dnschecker.org` to verify.

---

## Phase 6: Deploy to Server (Day 5)

Follow the full [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed steps.

**Quick Summary:**
1. SSH into server
2. Install PostgreSQL, Node.js
3. Upload files via FileZilla
4. Configure `.env` files
5. Install dependencies + build
6. Configure Nginx
7. Get SSL certificate (free via Let's Encrypt)
8. Start with PM2
9. Seed database

---

## Phase 7: Post-Launch (Days 6-7)

### 7.1 Verification Checklist

- [ ] Homepage loads correctly
- [ ] Firm pages display properly
- [ ] Affiliate redirect `/go/firm-slug` works and tracks
- [ ] Admin panel accessible
- [ ] Reviews can be submitted
- [ ] Compare tool works with 2+ firms
- [ ] Offers/coupons display and copy
- [ ] Blog posts showing
- [ ] Sitemap at `/sitemap.xml`
- [ ] Robots.txt at `/robots.txt`
- [ ] SSL certificate active (padlock in browser)
- [ ] Mobile responsive (test on phone)
- [ ] Dark mode toggle works

### 7.2 SEO Setup

1. **Google Search Console**
   - Add your site at `search.google.com/search-console`
   - Verify ownership via DNS TXT record
   - Submit sitemap: `https://yourdomain.com/sitemap.xml`

2. **Google Analytics** (optional)
   - Create GA4 property
   - Add GA4 ID to admin settings
   - Or use privacy-friendly Plausible/Fathom

3. **Bing Webmaster Tools**
   - Submit your site at `bing.com/webmasters`

### 7.3 Affiliate Tracking Test

Test your affiliate links work:
1. Visit `https://yourdomain.com/go/ftmo`
2. Should redirect to FTMO affiliate URL
3. Check admin analytics shows the click

### 7.4 Performance Check

Test your site speed:
- `pagespeed.web.dev` → Target: 90+ score
- `gtmetrix.com` → Target: A grade
- `tools.pingdom.com` → Target: <2 second load

---

## Database Management

### View Data via pgAdmin (Remote)

1. Open pgAdmin
2. Add Server → Advanced → Host name: YOUR_SERVER_IP
3. Connect with your postgres credentials
4. Browse tables under: Databases → propfirmhub → Schemas → public → Tables

### Useful Database Queries

```sql
-- See all prop firms
SELECT name, slug, average_rating, click_count FROM prop_firms ORDER BY click_count DESC;

-- See all clicks today
SELECT firm_id, source, device, country FROM clicks 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- See pending reviews
SELECT r.id, u.username, p.name, r.rating, r.body 
FROM reviews r
JOIN users u ON r.user_id = u.id
JOIN prop_firms p ON r.firm_id = p.id
WHERE r.status = 'PENDING';

-- Update affiliate URL without touching code
UPDATE prop_firms SET affiliate_url = 'https://new-affiliate-link.com' 
WHERE slug = 'ftmo';

-- Top revenue-generating firms by clicks
SELECT name, click_count, average_rating 
FROM prop_firms 
ORDER BY click_count DESC 
LIMIT 10;
```

---

## Revenue Optimization Tips

1. **Feature High-Commission Firms** — Mark them as `isFeatured = true` in admin
2. **Coupon Codes** — Always add coupon codes as they increase conversions
3. **Update Affiliate URLs** — You can change them anytime from admin without rebuilding
4. **Track Click-Through Rates** — Monitor analytics to see which firms convert best
5. **Blog Content** — Write comparison articles targeting "FTMO vs X" keywords
6. **Review Volume** — More reviews = higher trust = more clicks
7. **Compare Tool** — Users who use compare tool convert at higher rates

---

## File Size Overview

| Component | Size |
|-----------|------|
| Backend dependencies | ~150MB |
| Frontend dependencies | ~400MB |
| Frontend build output | ~50MB |
| Database (initial) | ~5MB |
| Uploads folder | Grows with usage |

---

## Monthly Maintenance Checklist

- [ ] Check server disk usage (`df -h`)
- [ ] Verify SSL certificate auto-renewal (`certbot renew --dry-run`)
- [ ] Review pending reviews in admin panel
- [ ] Update prop firm data (profit splits, fees change frequently)
- [ ] Add new prop firms that launch
- [ ] Check affiliate link validity
- [ ] Review analytics for top-performing pages
- [ ] Backup database
- [ ] Update Node.js if security patch released
