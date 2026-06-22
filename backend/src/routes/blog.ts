import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { upload } from '../utils/upload';
import slugify from 'slugify';

const router = Router();

router.get('/', async (req, res) => {
  const { page = '1', limit = '10', category } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where: any = { isPublished: true };
  if (category) where.category = { slug: category };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        category: true,
        tags: true,
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.blogPost.count({ where }),
  ]);

  res.json({ posts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

router.get('/:slug', async (req, res) => {
  const post = await prisma.blogPost.findUnique({
    where: { slug: req.params.slug },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      category: true,
      tags: true,
    },
  });
  if (!post || !post.isPublished) return res.status(404).json({ error: 'Post not found' });
  await prisma.blogPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
  res.json(post);
});

router.post('/', authenticate, requireAdmin, upload.single('featuredImage'), async (req: AuthRequest, res) => {
  const { title, tagIds, ...rest } = req.body;
  const slug = slugify(title, { lower: true, strict: true });
  const post = await prisma.blogPost.create({
    data: {
      title, slug,
      featuredImage: req.file ? `/uploads/${req.file.filename}` : undefined,
      authorId: req.user!.id,
      publishedAt: rest.isPublished === 'true' ? new Date() : null,
      tags: tagIds ? { connect: JSON.parse(tagIds).map((id: string) => ({ id })) } : undefined,
      ...rest,
      isPublished: rest.isPublished === 'true',
    },
  });
  res.status(201).json(post);
});

router.put('/:id', authenticate, requireAdmin, upload.single('featuredImage'), async (req, res) => {
  const updateData: any = { ...req.body };
  if (req.file) updateData.featuredImage = `/uploads/${req.file.filename}`;
  if (updateData.isPublished === 'true' && !updateData.publishedAt) updateData.publishedAt = new Date();
  const { tagIds, ...data } = updateData;
  const post = await prisma.blogPost.update({
    where: { id: req.params.id },
    data: {
      ...data,
      isPublished: data.isPublished === 'true',
      tags: tagIds ? { set: JSON.parse(tagIds).map((id: string) => ({ id })) } : undefined,
    },
  });
  res.json(post);
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await prisma.blogPost.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// Categories
router.get('/categories/all', async (_req, res) => {
  const categories = await prisma.category.findMany({ include: { _count: { select: { posts: true } } } });
  res.json(categories);
});

export default router;
