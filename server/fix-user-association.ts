import { db } from "./db";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";

async function fixUserAssociation() {
  try {
    const IMPORTED_USER_ID = '83b2d075-e2ed-4754-8446-3bd83d88f7f3';
    const AUTHENTICATED_USER_ID = '14423edd-634f-44fd-8e94-624ef6bf75d4';
    const FIREBASE_UID = 'Cv30mcpRnyew8HByGXq8Chx5N612';
    
    // Update the imported user to have the correct IDs
    const [updatedUser] = await db.update(schema.users)
      .set({ 
        id: AUTHENTICATED_USER_ID,
        firebaseUid: FIREBASE_UID 
      })
      .where(eq(schema.users.id, IMPORTED_USER_ID))
      .returning();
    
    console.log('Updated user:', updatedUser);
    
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
    
    console.log('User association fixed successfully!');
    
  } catch (error) {
    console.error('Fix failed:', error);
  }
}

fixUserAssociation();
