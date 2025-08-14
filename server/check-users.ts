import { db } from "./db";
import * as schema from "@shared/schema";

async function checkUsers() {
  try {
    const users = await db.select().from(schema.users);
    console.log('All users:', users);
    
    const workouts = await db.select().from(schema.workouts);
    console.log('All workouts:', workouts);
    
    const activities = await db.select().from(schema.activities);
    console.log('All activities:', activities);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();
