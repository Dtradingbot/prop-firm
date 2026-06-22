import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = Router();

// Get reviews for a firm
router.get('/firm/:firmId', async (req, res) => {
  const { page = '1', limit = '10' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { firmId: req.params.firmId, status: 'APPROVED' },
      include: { user: { select: { id: true, username: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.review.count({ where: { firmId: req.params.firmId, status: 'APPROVED' } }),
  ]);

  res.json({ reviews, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

// Create review
router.post('/', authenticate, upload.single('proofImage'), async (req: AuthRequest, res) => {
  const { firmId, rating, title, body } = req.body;

  const existing = await prisma.review.findUnique({
    where: { firmId_userId: { firmId, userId: req.user!.id } },
  });
  if (existing) return res.status(409).json({ error: 'You already reviewed this firm' });

  const review = await prisma.review.create({
    data: {
      firmId, userId: req.user!.id,
      rating: parseInt(rating), title, body,
      proofImage: req.file ? `/uploads/${req.file.filename}` : undefined,
    },
  });

  res.status(201).json(review);
});

// Edit review
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) return res.status(404).json({ error: 'Review not found' });
  if (review.userId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

  const updated = await prisma.review.update({
    where: { id: req.params.id },
    data: { rating: parseInt(req.body.rating), title: req.body.title, body: req.body.body, status: 'PENDING' },
  });
  res.json(updated);
});

// Admin: list pending reviews
router.get('/admin/pending', authenticate, requireAdmin, async (_req, res) => {
  const reviews = await prisma.review.findMany({
    where: { status: 'PENDING' },
    include: {
      user: { select: { id: true, username: true, email: true } },
      firm: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(reviews);
});

// Admin: approve / reject
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const review = await prisma.review.update({ where: { id: req.params.id }, data: { status } });

  // Recalculate firm average rating
  if (status === 'APPROVED') {
    const agg = await prisma.review.aggregate({
      where: { firmId: review.firmId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.propFirm.update({
      where: { id: review.firmId },
      data: {
        averageRating: agg._avg.rating || 0,
        reviewCount: agg._count.rating,
        engagementScore: { increment: 5 },
      },
    });
  }

  res.json(review);
});

// Admin: delete review
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.review.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
