import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Admin: dashboard stats
router.get('/dashboard', authenticate, requireAdmin, async (_req, res) => {
  const [
    totalFirms, totalReviews, totalOffers, totalClicks,
    pendingReviews, recentClicks,
  ] = await Promise.all([
    prisma.propFirm.count({ where: { isActive: true } }),
    prisma.review.count(),
    prisma.offer.count({ where: { isActive: true } }),
    prisma.click.count(),
    prisma.review.count({ where: { status: 'PENDING' } }),
    prisma.click.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { firm: { select: { name: true, slug: true } } },
    }),
  ]);

  // Clicks per day (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const clicksByDay = await prisma.click.groupBy({
    by: ['createdAt'],
    where: { createdAt: { gte: thirtyDaysAgo } },
    _count: true,
  });

  res.json({
    totalFirms, totalReviews, totalOffers, totalClicks,
    pendingReviews, recentClicks, clicksByDay,
  });
});

// Admin: top performing firms by clicks
router.get('/top-firms', authenticate, requireAdmin, async (_req, res) => {
  const firms = await prisma.propFirm.findMany({
    orderBy: { clickCount: 'desc' },
    take: 10,
    select: { id: true, name: true, slug: true, clickCount: true, viewCount: true, averageRating: true },
  });
  res.json(firms);
});

// Track page view (public)
router.post('/pageview', async (req, res) => {
  const { pageSlug, pageType } = req.body;
  const userAgent = req.headers['user-agent'] || '';
  await prisma.analytics.create({
    data: {
      pageSlug, pageType,
      ipAddress: req.ip,
      userAgent,
      referer: req.headers.referer || null,
      device: /mobile/i.test(userAgent) ? 'mobile' : 'desktop',
    },
  });
  res.json({ success: true });
});

export default router;
