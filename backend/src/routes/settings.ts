import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', async (_req, res) => {
  const settings = await prisma.setting.findMany();
  const map = Object.fromEntries(settings.map(s => [s.key, s.value]));
  res.json(map);
});

router.put('/', authenticate, requireAdmin, async (req, res) => {
  const entries = Object.entries(req.body as Record<string, string>);
  await Promise.all(entries.map(([key, value]) =>
    prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    })
  ));
  res.json({ success: true });
});

export default router;
