import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';

const router = Router();

router.post('/subscribe', [body('email').isEmail()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email } = req.body;
  try {
    await prisma.newsletter.create({ data: { email } });
    res.json({ success: true, message: 'Subscribed successfully' });
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Already subscribed' });
    res.status(500).json({ error: 'Subscription failed' });
  }
});

export default router;
