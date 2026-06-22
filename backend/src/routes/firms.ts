import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { upload } from '../utils/upload';
import slugify from 'slugify';

const router = Router();

const firmSelect = {
  id: true, name: true, slug: true, logo: true, shortDescription: true,
  country: true, evaluationType: true, instantFunding: true,
  minFundingSize: true, maxFundingSize: true, profitSplit: true,
  maxAllocation: true, platforms: true, trustScore: true,
  averageRating: true, reviewCount: true, clickCount: true,
  isFeatured: true, isActive: true, createdAt: true,
  broker: { select: { id: true, name: true, slug: true, logo: true } },
  offers: { where: { isActive: true }, take: 1 },
};

// List / filter firms
router.get('/', async (req, res) => {
  const {
    search, broker, platform, evaluationType, instantFunding,
    country, minFunding, maxFunding, sort = 'averageRating',
    page = '1', limit = '20',
  } = req.query as Record<string, string>;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where: any = { isActive: true };

  if (search) where.OR = [
    { name: { contains: search } },
    { shortDescription: { contains: search } },
  ];
  if (broker) where.broker = { slug: broker };
  // MySQL JSON doesn't support has — filter platform in-memory after query if needed
  if (evaluationType) where.evaluationType = evaluationType;
  if (instantFunding === 'true') where.instantFunding = true;
  if (country) where.country = { contains: country };
  if (minFunding) where.maxFundingSize = { gte: parseFloat(minFunding) };
  if (maxFunding) where.minFundingSize = { lte: parseFloat(maxFunding) };

  const orderBy: any = {
    averageRating: { averageRating: 'desc' },
    trending: { engagementScore: 'desc' },
    reviews: { reviewCount: 'desc' },
    newest: { createdAt: 'desc' },
    funding: { maxFundingSize: 'desc' },
  }[sort] || { averageRating: 'desc' };

  const [firms, total] = await Promise.all([
    prisma.propFirm.findMany({ where, select: firmSelect, orderBy, skip, take: parseInt(limit) }),
    prisma.propFirm.count({ where }),
  ]);

  res.json({ firms, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

// Featured firms
router.get('/featured', async (_req, res) => {
  const firms = await prisma.propFirm.findMany({
    where: { isFeatured: true, isActive: true },
    select: firmSelect,
    take: 8,
    orderBy: { averageRating: 'desc' },
  });
  res.json(firms);
});

// Top rated
router.get('/top-rated', async (_req, res) => {
  const firms = await prisma.propFirm.findMany({
    where: { isActive: true, reviewCount: { gte: 1 } },
    select: firmSelect,
    orderBy: [{ averageRating: 'desc' }, { reviewCount: 'desc' }],
    take: 20,
  });
  res.json(firms);
});

// Trending
router.get('/trending', async (_req, res) => {
  const firms = await prisma.propFirm.findMany({
    where: { isActive: true },
    select: firmSelect,
    orderBy: { engagementScore: 'desc' },
    take: 20,
  });
  res.json(firms);
});

// Single firm by slug
router.get('/:slug', async (req, res) => {
  const firm = await prisma.propFirm.findUnique({
    where: { slug: req.params.slug },
    include: {
      broker: true,
      offers: { where: { isActive: true } },
      reviews: {
        where: { status: 'APPROVED' },
        include: { user: { select: { id: true, username: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      faqs: { orderBy: { order: 'asc' } },
      fundingPrograms: true,
    },
  });
  if (!firm) return res.status(404).json({ error: 'Firm not found' });

  // increment view count
  await prisma.propFirm.update({ where: { id: firm.id }, data: { viewCount: { increment: 1 } } });

  res.json(firm);
});

// Admin: Create firm
router.post('/', authenticate, requireAdmin, upload.single('logo'), async (req: AuthRequest, res) => {
  const { name, ...rest } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  try {
    const firm = await prisma.propFirm.create({
      data: {
        name,
        slug,
        logo: req.file ? `/uploads/${req.file.filename}` : undefined,
        ...rest,
        platforms: rest.platforms ? JSON.parse(rest.platforms) : [],
        // platforms stored as JSON in MySQL
        rules: rest.rules ? JSON.parse(rest.rules) : undefined,
      },
    });
    res.status(201).json(firm);
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Slug already exists' });
    res.status(500).json({ error: 'Failed to create firm' });
  }
});

// Admin: Update firm
router.put('/:id', authenticate, requireAdmin, upload.single('logo'), async (req: AuthRequest, res) => {
  const { name, ...rest } = req.body;
  const updateData: any = { ...rest };
  if (name) {
    updateData.name = name;
    updateData.slug = slugify(name, { lower: true, strict: true });
  }
  if (req.file) updateData.logo = `/uploads/${req.file.filename}`;
  if (rest.platforms) updateData.platforms = JSON.parse(rest.platforms);
  if (rest.rules) updateData.rules = JSON.parse(rest.rules);

  const firm = await prisma.propFirm.update({ where: { id: req.params.id }, data: updateData });
  res.json(firm);
});

// Admin: Delete firm
router.delete('/:id', authenticate, requireAdmin, async (_req, res) => {
  await prisma.propFirm.delete({ where: { id: _req.params.id } });
  res.json({ success: true });
});

export default router;
