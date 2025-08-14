import { db } from "./db";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";

async function fixFirebaseUid() {
  try {
    const IMPORTED_USER_ID = '83b2d075-e2ed-4754-8446-3bd83d88f7f3';
    const FIREBASE_UID = 'Cv30mcpRnyew8HByGXq8Chx5N612';
    
    // Just update the Firebase UID for the existing user
    const [updatedUser] = await db.update(schema.users)
      .set({ firebaseUid: FIREBASE_UID })
      .where(eq(schema.users.id, IMPORTED_USER_ID))
      .returning();
    
    console.log('Updated user Firebase UID:', updatedUser);
    console.log('Fix completed successfully!');
    
  } catch (error) {
    console.error('Fix failed:', error);
  }
}

fixFirebaseUid();
