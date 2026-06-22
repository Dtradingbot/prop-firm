# PropFirmHub — Hostinger Upload Checklist
# Follow this step by step. Tick each box as you finish it.

## ON YOUR PC FIRST

[ ] 1. Open Git Bash → go to backend folder:
       cd "C:\Users\Welcome\Desktop\popframj\propfirmhub\backend"
       npm install
       npm run build
       → Creates: backend/dist/ folder ✓

[ ] 2. Open Git Bash → go to frontend folder:
       cd "C:\Users\Welcome\Desktop\popframj\propfirmhub\frontend"
       npm install
       npm run build
       → Creates: frontend/.next/standalone/ folder ✓

[ ] 3. Copy static files into standalone (Git Bash):
       cd "C:\Users\Welcome\Desktop\popframj\propfirmhub\frontend"
       cp -r public .next/standalone/public
       cp -r .next/static .next/standalone/.next/static
       ✓

[ ] 4. Generate JWT Secret (Git Bash):
       node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
       → COPY AND SAVE THIS STRING

## IN HOSTINGER hPANEL

[ ] 5. Create MySQL Database
       hPanel → Databases → MySQL Databases → Create
       → Note down: DB name, username, password

[ ] 6. Create subdomain: api.yourdomain.com
       hPanel → Domains → Subdomains → Create

[ ] 7. Create Node.js App (BACKEND)
       hPanel → Advanced → Node.js → Create Application
       - Root: api.yourdomain.com
       - Startup file: dist/index.js
       - URL: api.yourdomain.com
       - Port: 3001

[ ] 8. Create Node.js App (FRONTEND)
       hPanel → Advanced → Node.js → Create Application
       - Root: public_html
       - Startup file: .next/standalone/server.js
       - URL: yourdomain.com
       - Port: 3000

## UPLOAD FILES (FileZilla or File Manager)

[ ] 9. Upload BACKEND to /api.yourdomain.com/
       Upload these from your backend/ folder:
       ✓ dist/           (the compiled code)
       ✓ prisma/         (schema + seed)
       ✓ package.json
       (skip node_modules — will install via SSH)

[ ] 10. Upload FRONTEND to /public_html/
        Upload everything from frontend/.next/standalone/:
        ✓ server.js
        ✓ package.json
        ✓ .next/          (from .next/standalone/.next/)
        ✓ public/         (from .next/standalone/public/)
        ✓ node_modules/   (from .next/standalone/node_modules/)

## CREATE CONFIG FILES

[ ] 11. Create .env in /api.yourdomain.com/
        Use template: hostinger-files/backend-.env-template
        Fill in YOUR MySQL credentials and JWT_SECRET
        Rename file to just: .env

[ ] 12. Create .env.local in /public_html/
        Use template: hostinger-files/frontend-.env.local-template
        Fill in YOUR domain name
        Rename file to just: .env.local

[ ] 13. Upload .htaccess files
        → frontend-.htaccess → rename to .htaccess → upload to /public_html/
        → backend-.htaccess  → rename to .htaccess → upload to /api.yourdomain.com/

## VIA SSH

[ ] 14. SSH into your server:
        ssh u123456789@yourdomain.com

[ ] 15. Install backend packages:
        cd ~/api.yourdomain.com
        npm install --omit=dev

[ ] 16. Setup database:
        npx prisma generate
        npx prisma db push
        npx tsx prisma/seed.ts

[ ] 17. Create uploads folder:
        mkdir -p ~/api.yourdomain.com/uploads
        chmod 755 ~/api.yourdomain.com/uploads

## FINAL STEPS IN hPANEL

[ ] 18. Install SSL
        hPanel → Security → SSL/TLS
        Install for: yourdomain.com AND api.yourdomain.com

[ ] 19. Start both apps
        hPanel → Advanced → Node.js
        → Click RESTART on backend app (api.yourdomain.com)
        → Click RESTART on frontend app (yourdomain.com)

## TEST

[ ] 20. Open https://yourdomain.com → Homepage shows ✓
[ ] 21. Open https://api.yourdomain.com/health → {"status":"ok"} ✓
[ ] 22. Open https://yourdomain.com/admin → Login page shows ✓
[ ] 23. Login: admin@propfirmhub.com / admin123! → Dashboard shows ✓
[ ] 24. Change admin password! ← IMPORTANT

## DONE! 🎉 Start adding your prop firms in the admin panel.
