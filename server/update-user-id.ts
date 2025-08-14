import { db } from "./db";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";

async function updateUserIds() {
  try {
    // Get the imported user
    const importedUsers = await db.select().from(schema.users);
    const importedUser = importedUsers.find(u => u.email === 'imported@user.com');
    
    if (!importedUser) {
      console.log('No imported user found');
      return;
    }
    
    console.log('Found imported user:', importedUser.id);
    
    // Get the real authenticated user
    const realUsers = await db.select().from(schema.users).where(eq(schema.users.email, 'real@user.com'));
    let realUser = realUsers[0];
    
    if (!realUser) {
      // Create the real user if not exists
      console.log('Creating real user...');
      const [newUser] = await db.insert(schema.users).values({
        id: '14423edd-634f-44fd-8e94-624ef6bf75d4', // The authenticated user ID
        firebaseUid: 'Cv30mcpRnyew8HByGXq8Chx5N612',
        email: 'real@user.com',
        name: 'User',
        createdAt: new Date()
      }).returning();
      realUser = newUser;
    }
    
    console.log('Target user:', realUser.id);
    
    // Update all data to point to the real user
    const workoutUpdates = await db.update(schema.workouts)
      .set({ userId: realUser.id })
      .where(eq(schema.workouts.userId, importedUser.id))
      .returning();
      
    const activityUpdates = await db.update(schema.activities)
      .set({ userId: realUser.id })
      .where(eq(schema.activities.userId, importedUser.id))
      .returning();
    
    console.log(`Updated ${workoutUpdates.length} workouts and ${activityUpdates.length} activities`);
    
    // Delete the imported user
    await db.delete(schema.users).where(eq(schema.users.id, importedUser.id));
    
    console.log('Data migration complete!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

updateUserIds();
