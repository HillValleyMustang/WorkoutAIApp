import { db } from "./db";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";

async function fixUserAssociation() {
  try {
    const IMPORTED_USER_ID = '83b2d075-e2ed-4754-8446-3bd83d88f7f3';
    const AUTHENTICATED_USER_ID = '14423edd-634f-44fd-8e94-624ef6bf75d4';
    const FIREBASE_UID = 'Cv30mcpRnyew8HByGXq8Chx5N612';
    
    // First, create a new user with the correct ID
    const [newUser] = await db.insert(schema.users).values({
      id: AUTHENTICATED_USER_ID,
      firebaseUid: FIREBASE_UID,
      email: 'athlete@example.com',
      name: 'Athlete CD',
      age: 30,
      height: 180,
      weight: 75,
      experience: 'intermediate',
      fitnessGoal: 'Get Toned & Muscular',
      targetDate: new Date('2025-12-31'),
      healthNotes: null,
      goals: ['build muscle', 'lose fat'],
      streak: 12,
      weekStartDay: 1,
      createdAt: new Date()
    }).returning();
    
    console.log('Created new user:', newUser);
    
    // Update all workouts to the new user ID
    const workoutUpdates = await db.update(schema.workouts)
      .set({ userId: AUTHENTICATED_USER_ID })
      .where(eq(schema.workouts.userId, IMPORTED_USER_ID))
      .returning();
      
    console.log(`Updated ${workoutUpdates.length} workouts`);
    
    // Update all activities to the new user ID
    const activityUpdates = await db.update(schema.activities)
      .set({ userId: AUTHENTICATED_USER_ID })
      .where(eq(schema.activities.userId, IMPORTED_USER_ID))
      .returning();
      
    console.log(`Updated ${activityUpdates.length} activities`);
    
    // Delete the old user
    await db.delete(schema.users).where(eq(schema.users.id, IMPORTED_USER_ID));
    console.log('Deleted old user');
    
    console.log('User association fixed successfully!');
    
  } catch (error) {
    console.error('Fix failed:', error);
  }
}

fixUserAssociation();
