import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/:name', async (req, res) => {
  const menu = await prisma.menu.findUnique({
    where: { name: req.params.name },
    include: { items: { orderBy: { order: 'asc' } } },
  });
  res.json(menu);
});

router.put('/:name', authenticate, requireAdmin, async (req, res) => {
  const { items } = req.body;
  const menu = await prisma.menu.upsert({
    where: { name: req.params.name },
    create: { name: req.params.name, items: { create: items } },
    update: {
      items: {
        deleteMany: {},
        create: items,
      },
    },
    include: { items: { orderBy: { order: 'asc' } } },
  });
  res.json(menu);
});

export default router;
