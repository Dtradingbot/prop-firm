import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authenticate, requireSuperAdmin } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();

// List all users (super admin)
router.get('/users', authenticate, requireSuperAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

// Update user role
router.patch('/users/:id/role', authenticate, requireSuperAdmin, async (req, res) => {
  const { role } = req.body;
  if (!['USER', 'EDITOR', 'SUPER_ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { role } });
  res.json({ id: user.id, role: user.role });
});

// Create admin user
router.post('/users', authenticate, requireSuperAdmin, async (req, res) => {
  const { email, username, password, role } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, username, passwordHash, role: role || 'EDITOR' },
    select: { id: true, email: true, username: true, role: true },
  });
  res.status(201).json(user);
});

export default router;
