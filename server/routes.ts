import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { verifyIdToken } from "./services/firebase-admin";
import { getAIProgression, analyzeGymEquipment } from "./services/gemini";
import { insertUserSchema, insertWorkoutSchema, insertWorkoutSetSchema, insertExerciseSchema } from "@shared/schema";
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

// Middleware to verify Firebase token
async function requireAuth(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header received:', authHeader ? `Bearer ${authHeader.split('Bearer ')[1]?.substring(0, 20)}...` : 'None');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);
    req.user = decodedToken;
    console.log('Token verified for user:', decodedToken.uid);
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByFirebaseUid(userData.firebaseUid);
      if (existingUser) {
        return res.json(existingUser);
      }

      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: 'Invalid user data', error });
    }
  });

  app.get('/api/auth/me', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user', error });
    }
  });

  app.patch('/api/auth/profile', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const updates = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(user.id, updates);
      res.json(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Failed to update profile', error });
    }
  });

  // Exercise routes
  app.get('/api/exercises', async (req, res) => {
    try {
      const category = req.query.category as string;
      const exercises = category 
        ? await storage.getExercisesByCategory(category)
        : await storage.getExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get exercises', error });
    }
  });

  app.get('/api/exercises/:id', async (req, res) => {
    try {
      const exercise = await storage.getExercise(req.params.id);
      if (!exercise) {
        return res.status(404).json({ message: 'Exercise not found' });
      }
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get exercise', error });
    }
  });

  app.post('/api/exercises', requireAuth, async (req: any, res) => {
    try {
      const exerciseData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(exerciseData);
      res.json(exercise);
    } catch (error) {
      res.status(400).json({ message: 'Invalid exercise data', error });
    }
  });

  // Workout routes
  app.get('/api/workouts', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('Getting workouts for user:', user.id);
      const workouts = await storage.getWorkouts(user.id);
      console.log('Returning workouts count:', workouts.length);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get workouts', error });
    }
  });

  app.post('/api/workouts', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('Workout request body:', req.body);
      const workoutData = insertWorkoutSchema.parse(req.body);
      console.log('Parsed workout data:', workoutData);
      
      const workout = await storage.createWorkout({
        ...workoutData,
        userId: user.id,
      });
      res.json(workout);
    } catch (error) {
      console.error('Workout creation error:', error);
      res.status(400).json({ message: 'Invalid workout data', error: error.message || error });
    }
  });

  app.put('/api/workouts/:id', requireAuth, async (req: any, res) => {
    try {
      const workout = await storage.updateWorkout(req.params.id, req.body);
      res.json(workout);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update workout', error });
    }
  });

  // Workout sets routes
  app.get('/api/workouts/:workoutId/sets', async (req, res) => {
    try {
      const sets = await storage.getWorkoutSets(req.params.workoutId);
      res.json(sets);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get workout sets', error });
    }
  });

  app.post('/api/workouts/:workoutId/sets', requireAuth, async (req: any, res) => {
    try {
      const setData = insertWorkoutSetSchema.parse({
        ...req.body,
        workoutId: req.params.workoutId,
      });
      const set = await storage.createWorkoutSet(setData);

      // Check for personal record
      const volume = set.weight * set.reps;
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (user) {
        const existingPRs = await storage.getPersonalRecords(user.id);
        const exercisePRs = existingPRs.filter(pr => pr.exerciseId === set.exerciseId);
        const maxVolume = Math.max(...exercisePRs.map(pr => pr.volume), 0);

        if (volume > maxVolume) {
          await storage.createPersonalRecord({
            userId: user.id,
            exerciseId: set.exerciseId,
            weight: set.weight,
            reps: set.reps,
            volume,
          });
        }
      }

      res.json(set);
    } catch (error) {
      res.status(400).json({ message: 'Invalid set data', error });
    }
  });

  // Personal records routes
  app.get('/api/personal-records', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const records = await storage.getPersonalRecords(user.id);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get personal records', error });
    }
  });

  // AI routes
  app.post('/api/ai/progression', requireAuth, async (req: any, res) => {
    try {
      const { exerciseId, history } = req.body;
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      const exercise = await storage.getExercise(exerciseId);

      if (!user || !exercise) {
        return res.status(404).json({ message: 'User or exercise not found' });
      }

      const suggestion = await getAIProgression(
        exercise.name,
        history,
        exercise.category,
        {
          experience: user.experience || undefined,
          healthNotes: user.healthNotes || undefined,
          goals: user.goals || undefined,
        }
      );

      // Save AI insight
      await storage.createAIInsight({
        userId: user.id,
        type: 'progression',
        content: JSON.stringify(suggestion),
        metadata: { exerciseId: exerciseId, timestamp: Date.now() },
      });

      res.json(suggestion);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get AI progression', error });
    }
  });

  app.post('/api/ai/analyze-equipment', requireAuth, upload.array('images', 5), async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No images provided' });
      }

      const analysis = await analyzeGymEquipment(files);

      // Save AI insight
      await storage.createAIInsight({
        userId: user.id,
        type: 'equipment-analysis',
        content: JSON.stringify(analysis),
        metadata: { imageCount: files.length, timestamp: Date.now() },
      });

      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: 'Failed to analyze equipment', error });
    }
  });

  app.get('/api/ai/insights', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const type = req.query.type as string;
      const insights = await storage.getAIInsights(user.id, type);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get AI insights', error });
    }
  });

  // Activities routes
  app.get('/api/activities', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('Getting activities for user:', user.id);
      const activities = await storage.getActivities(user.id);
      console.log('Returning activities count:', activities.length);
      res.json(activities);
    } catch (error) {
      console.error('Error getting activities:', error);
      res.status(500).json({ message: 'Error getting activities' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
