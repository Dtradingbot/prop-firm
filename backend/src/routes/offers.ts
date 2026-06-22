import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', async (_req, res) => {
  const offers = await prisma.offer.findMany({
    where: { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
    include: { firm: { select: { id: true, name: true, slug: true, logo: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(offers);
});

router.get('/firm/:firmId', async (req, res) => {
  const offers = await prisma.offer.findMany({
    where: { firmId: req.params.firmId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(offers);
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const offer = await prisma.offer.create({ data: req.body });
  res.status(201).json(offer);
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const offer = await prisma.offer.update({ where: { id: req.params.id }, data: req.body });
  res.json(offer);
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.offer.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
