import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import authRoutes from './routes/auth';
import firmRoutes from './routes/firms';
import brokerRoutes from './routes/brokers';
import offerRoutes from './routes/offers';
import reviewRoutes from './routes/reviews';
import blogRoutes from './routes/blog';
import compareRoutes from './routes/compare';
import analyticsRoutes from './routes/analytics';
import adminRoutes from './routes/admin';
import pageRoutes from './routes/pages';
import menuRoutes from './routes/menus';
import settingsRoutes from './routes/settings';
import searchRoutes from './routes/search';
import redirectRoutes from './routes/redirect';
import newsletterRoutes from './routes/newsletter';

const app = express();
const PORT = process.env.PORT || 3001;
const STANDALONE = process.env.STANDALONE === 'true';

// Security & performance
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(morgan('combined'));

// CORS — allow same domain in production
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://couponen.com',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/firms', firmRoutes);
app.use('/api/brokers', brokerRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/go', redirectRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Only start standalone server if run directly (not imported by combined server)
if (STANDALONE) {
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
}

export default app;
