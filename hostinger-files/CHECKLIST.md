# PropFirmHub — Hostinger Upload Checklist (Single Domain)
# Domain: couponen.com
# Everything runs on ONE domain, ONE Node.js app

## ✅ ALREADY DONE
[x] MySQL Database created: u886546027_propfirm
[x] GitHub repo pushed: github.com/Dtradingbot/prop-firm

## STEP 1 — BUILD ON YOUR PC

[ ] Open Git Bash on your PC:

    cd "C:\Users\Welcome\Desktop\popframj\propfirmhub"

    # Install root dependencies
    npm install

    # Build backend
    cd backend
    npm install
    npm run build

    # Build frontend
    cd ../frontend
    npm install
    npm run build

    # Copy static files into standalone
    cp -r public .next/standalone/public
    cp -r .next/static .next/standalone/.next/static

## STEP 2 — CREATE NODE.JS APP IN HOSTINGER

[ ] hPanel → Advanced → Node.js → Create Application:

    Node.js version:   20.x  (or highest)
    Application mode:  Production
    Application root:  public_html
    Application URL:   couponen.com
    Startup file:      server.js

## STEP 3 — UPLOAD FILES via FileZilla or File Manager

Upload ALL of these to /public_html/ on Hostinger:

FROM: C:\Users\Welcome\Desktop\popframj\propfirmhub\

[ ] server.js                         ← combined server entry point
[ ] package.json                      ← root package.json
[ ] node_modules/                     ← from root (after npm install)
[ ] backend/
    └── dist/                         ← built backend code
    └── prisma/                       ← schema + seed
    └── package.json
    └── node_modules/                 ← backend dependencies
[ ] frontend/
    └── .next/
        └── standalone/               ← built Next.js
    └── public/
[ ] .env                              ← rename backend-.env-READY to .env
[ ] uploads/                          ← empty folder (create it)

## STEP 4 — CREATE .env FILE

[ ] Take file: hostinger-files/backend-.env-READY
[ ] Rename it to: .env
[ ] Upload to: /public_html/

Contents (already filled with your credentials):
DATABASE_URL="mysql://u886546027_propfirm:2C|2dj!hdma!@127.0.0.1:3306/u886546027_propfirm"
JWT_SECRET="2494125c17092..."
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://couponen.com"

## STEP 5 — CREATE .env.local FILE

[ ] Take file: hostinger-files/frontend-.env.local-READY
[ ] Rename it to: .env.local
[ ] Upload to: /public_html/frontend/

Contents:
NEXT_PUBLIC_API_URL=https://couponen.com/api
NEXT_PUBLIC_SITE_URL=https://couponen.com

## STEP 6 — CREATE .htaccess FILE

[ ] Take file: hostinger-files/public_html-.htaccess
[ ] Rename it to: .htaccess
[ ] Upload to: /public_html/

## STEP 7 — SSH SETUP (database tables)

[ ] hPanel → Advanced → SSH Access → Enable SSH

[ ] Open Git Bash on your PC:
    ssh u886546027@couponen.com

[ ] Run these commands on server:
    cd ~/public_html
    cd backend
    npx prisma generate
    npx prisma db push
    npx tsx prisma/seed.ts

[ ] Create uploads folder:
    mkdir -p ~/public_html/uploads
    chmod 755 ~/public_html/uploads

## STEP 8 — START APP

[ ] hPanel → Advanced → Node.js
[ ] Find couponen.com app → click RESTART

## STEP 9 — INSTALL SSL

[ ] hPanel → Security → SSL/TLS
[ ] Install SSL for: couponen.com
[ ] Install SSL for: www.couponen.com

## TEST THESE URLS

[ ] https://couponen.com              → Homepage ✓
[ ] https://couponen.com/firms        → Firm list ✓
[ ] https://couponen.com/admin        → Admin login ✓
[ ] https://couponen.com/api/health   → {"status":"ok"} ✓
[ ] https://couponen.com/go/ftmo      → Redirects to FTMO ✓

## LOGIN TO ADMIN PANEL

URL:      https://couponen.com/admin
Email:    admin@couponen.com
Password: admin123!

⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!

## DONE! Start adding prop firms at couponen.com/admin
