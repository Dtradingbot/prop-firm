import { Router } from 'express';
import { prisma } from '../utils/prisma';

const router = Router();

router.get('/', async (req, res) => {
  const q = (req.query.q as string)?.trim();
  if (!q || q.length < 2) return res.json({ firms: [], brokers: [], offers: [] });

  const [firms, brokers, offers] = await Promise.all([
    prisma.propFirm.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { shortDescription: { contains: q } },
        ],
      },
      select: { id: true, name: true, slug: true, logo: true, averageRating: true },
      take: 5,
    }),
    prisma.broker.findMany({
      where: { isActive: true, name: { contains: q } },
      select: { id: true, name: true, slug: true, logo: true },
      take: 5,
    }),
    prisma.offer.findMany({
      where: { isActive: true, title: { contains: q } },
      include: { firm: { select: { id: true, name: true, slug: true } } },
      take: 5,
    }),
  ]);

  res.json({ firms, brokers, offers });
});

export default router;
