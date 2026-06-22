import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';
import slugify from 'slugify';

const router = Router();

router.get('/:slug', async (req, res) => {
  const page = await prisma.page.findUnique({ where: { slug: req.params.slug } });
  if (!page || !page.isPublished) return res.status(404).json({ error: 'Page not found' });
  res.json(page);
});

router.get('/', authenticate, requireAdmin, async (_req, res) => {
  const pages = await prisma.page.findMany({ orderBy: { title: 'asc' } });
  res.json(pages);
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { title, ...rest } = req.body;
  const slug = rest.slug || slugify(title, { lower: true, strict: true });
  const page = await prisma.page.create({ data: { title, slug, ...rest } });
  res.status(201).json(page);
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const page = await prisma.page.update({ where: { id: req.params.id }, data: req.body });
  res.json(page);
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.page.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
