import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';

const router = Router();

// /go/:slug — affiliate click tracking + redirect
router.get('/:slug', async (req: Request, res: Response) => {
  const firm = await prisma.propFirm.findUnique({
    where: { slug: req.params.slug },
    select: { id: true, affiliateUrl: true, websiteUrl: true },
  });

  if (!firm) return res.status(404).json({ error: 'Firm not found' });

  const redirectUrl = firm.affiliateUrl || firm.websiteUrl;
  if (!redirectUrl) return res.status(404).json({ error: 'No redirect URL configured' });

  const source = (req.query.source as string) || 'OTHER';
  const userAgent = req.headers['user-agent'] || '';
  const device = /mobile/i.test(userAgent) ? 'mobile' : 'desktop';

  // Log click asynchronously (don't block redirect)
  prisma.click.create({
    data: {
      firmId: firm.id,
      source: source as any,
      ipAddress: req.ip,
      userAgent,
      referer: req.headers.referer || null,
      device,
    },
  }).then(() =>
    prisma.propFirm.update({
      where: { id: firm.id },
      data: { clickCount: { increment: 1 }, engagementScore: { increment: 2 } },
    })
  ).catch(console.error);

  res.redirect(302, redirectUrl);
});

export default router;
