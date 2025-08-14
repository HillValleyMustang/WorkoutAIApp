import { db } from "./db";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";

async function transferData() {
  try {
    // Get all users to see the current state
    const users = await db.select().from(schema.users);
    console.log('Current users:', users.map(u => ({ id: u.id, firebaseUid: u.firebaseUid, email: u.email })));
    
    const IMPORTED_USER_ID = '83b2d075-e2ed-4754-8446-3bd83d88f7f3';
    const NEW_USER_ID = 'd0abf2e6-b63d-4993-abd1-813377ba8363'; // The newly created user from API
    
    // Update all workouts to the new user ID
    const workoutUpdates = await db.update(schema.workouts)
      .set({ userId: NEW_USER_ID })
      .where(eq(schema.workouts.userId, IMPORTED_USER_ID))
      .returning();
      
    console.log(`Updated ${workoutUpdates.length} workouts to new user`);
    
    // Update all activities to the new user ID
    const activityUpdates = await db.update(schema.activities)
      .set({ userId: NEW_USER_ID })
      .where(eq(schema.activities.userId, IMPORTED_USER_ID))
      .returning();
      
    console.log(`Updated ${activityUpdates.length} activities to new user`);
    
    console.log('Data transfer completed successfully!');
    
  } catch (error) {
    console.error('Transfer failed:', error);
  }
}

transferData();
