import { Router } from 'express';
import { prisma } from '../utils/prisma';

const router = Router();

router.post('/', async (req, res) => {
  const { slugs } = req.body as { slugs: string[] };
  if (!Array.isArray(slugs) || slugs.length < 2 || slugs.length > 4) {
    return res.status(400).json({ error: 'Provide 2-4 firm slugs to compare' });
  }

  const firms = await prisma.propFirm.findMany({
    where: { slug: { in: slugs }, isActive: true },
    include: { broker: true, fundingPrograms: true, offers: { where: { isActive: true } } },
  });

  const ordered = slugs.map(s => firms.find(f => f.slug === s)).filter(Boolean);
  res.json(ordered);
});

export default router;
