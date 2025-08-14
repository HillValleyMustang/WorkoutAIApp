import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { activities } from '@shared/schema';
import { db } from '../db';

const router = Router();

// Get all activities for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).userId;
    
    const userActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(activities.startedAt);
    
    res.json(userActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

export default router;