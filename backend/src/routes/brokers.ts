import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';
import { upload } from '../utils/upload';
import slugify from 'slugify';

const router = Router();

router.get('/', async (_req, res) => {
  const brokers = await prisma.broker.findMany({
    where: { isActive: true },
    include: { _count: { select: { firms: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(brokers);
});

router.get('/:slug', async (req, res) => {
  const broker = await prisma.broker.findUnique({
    where: { slug: req.params.slug },
    include: {
      firms: {
        where: { isActive: true },
        select: { id: true, name: true, slug: true, logo: true, averageRating: true, trustScore: true },
      },
    },
  });
  if (!broker) return res.status(404).json({ error: 'Broker not found' });
  res.json(broker);
});

router.post('/', authenticate, requireAdmin, upload.single('logo'), async (req, res) => {
  const { name, ...rest } = req.body;
  const slug = slugify(name, { lower: true, strict: true });
  const broker = await prisma.broker.create({
    data: { name, slug, logo: req.file ? `/uploads/${req.file.filename}` : undefined, ...rest },
  });
  res.status(201).json(broker);
});

router.put('/:id', authenticate, requireAdmin, upload.single('logo'), async (req, res) => {
  const updateData: any = { ...req.body };
  if (req.file) updateData.logo = `/uploads/${req.file.filename}`;
  const broker = await prisma.broker.update({ where: { id: req.params.id }, data: updateData });
  res.json(broker);
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.broker.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
