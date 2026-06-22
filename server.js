/**
 * PropFirmHub — Combined Server
 * Runs on couponen.com (single domain, single Node.js app)
 *
 * Routes:
 *   /api/*   → Express backend
 *   /go/*    → Affiliate redirect (Express)
 *   /uploads → Static uploads (Express)
 *   /*       → Next.js frontend (including /admin)
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { createServer } = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 3001;
const NEXT_PORT = 3000;

const app = express();

// ── Start Next.js standalone server on internal port 3000 ──────────────────
const nextServer = spawn('node', [path.join(__dirname, 'frontend/.next/standalone/server.js')], {
  env: {
    ...process.env,
    PORT: String(NEXT_PORT),
    HOSTNAME: '127.0.0.1',
    NODE_ENV: 'production',
  },
  stdio: 'inherit',
});

nextServer.on('error', (err) => console.error('Next.js failed to start:', err));
process.on('exit', () => nextServer.kill());

// ── Wait for Next.js to be ready, then start main server ───────────────────
setTimeout(() => {

  // Static uploads from backend
  app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

  // ── API routes → Express backend handlers ────────────────────────────────
  const apiRouter = require('./backend/dist/index').default || require('./backend/dist/index');

  // Mount all backend API routes
  app.use('/api', require('./backend/dist/routes/auth').default);
  app.use('/api/firms', require('./backend/dist/routes/firms').default);
  app.use('/api/brokers', require('./backend/dist/routes/brokers').default);
  app.use('/api/offers', require('./backend/dist/routes/offers').default);
  app.use('/api/reviews', require('./backend/dist/routes/reviews').default);
  app.use('/api/blog', require('./backend/dist/routes/blog').default);
  app.use('/api/compare', require('./backend/dist/routes/compare').default);
  app.use('/api/analytics', require('./backend/dist/routes/analytics').default);
  app.use('/api/admin', require('./backend/dist/routes/admin').default);
  app.use('/api/pages', require('./backend/dist/routes/pages').default);
  app.use('/api/menus', require('./backend/dist/routes/menus').default);
  app.use('/api/settings', require('./backend/dist/routes/settings').default);
  app.use('/api/search', require('./backend/dist/routes/search').default);
  app.use('/api/newsletter', require('./backend/dist/routes/newsletter').default);

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Affiliate redirect
  app.use('/go', require('./backend/dist/routes/redirect').default);

  // ── Everything else → Next.js ─────────────────────────────────────────────
  app.use('/', createProxyMiddleware({
    target: `http://127.0.0.1:${NEXT_PORT}`,
    changeOrigin: true,
    ws: true,
  }));

  createServer(app).listen(PORT, () => {
    console.log(`PropFirmHub running on port ${PORT}`);
    console.log(`  Frontend: http://localhost:${PORT}`);
    console.log(`  API:      http://localhost:${PORT}/api`);
    console.log(`  Admin:    http://localhost:${PORT}/admin`);
  });

}, 5000); // give Next.js 5 seconds to start
