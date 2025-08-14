import { type User, type InsertUser, type Exercise, type InsertExercise, 
         type Workout, type InsertWorkout, type WorkoutSet, type InsertWorkoutSet,
         type PersonalRecord, type InsertPersonalRecord, type AIInsight, type InsertAIInsight,
         type Activity, type InsertActivity } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  getUsers?(): Promise<User[]>;
  
  // Exercise History & Personal Records
  getExerciseHistory(userId: string, exerciseId: string): Promise<WorkoutSet[]>;
  getPersonalRecordForExercise(userId: string, exerciseId: string): Promise<PersonalRecord | undefined>;
  checkAndCreatePR(userId: string, exerciseId: string, weight: number, reps: number): Promise<boolean>;

  // Exercises
  getExercises(): Promise<Exercise[]>;
  getExercisesByCategory(category: string): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;

  // Workouts
  getWorkouts(userId: string): Promise<Workout[]>;
  getWorkout(id: string): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(id: string, workout: Partial<Workout>): Promise<Workout>;

  // Workout Sets
  getWorkoutSets(workoutId: string): Promise<WorkoutSet[]>;
  createWorkoutSet(set: InsertWorkoutSet): Promise<WorkoutSet>;

  // Personal Records
  getPersonalRecords(userId: string): Promise<PersonalRecord[]>;
  createPersonalRecord(record: InsertPersonalRecord): Promise<PersonalRecord>;

  // AI Insights
  getAIInsights(userId: string, type?: string): Promise<AIInsight[]>;
  createAIInsight(insight: InsertAIInsight): Promise<AIInsight>;

  // Activities
  getActivities(userId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Workout Sets
  getWorkoutSets(workoutId: string): Promise<WorkoutSet[]>;
  createWorkoutSet(set: InsertWorkoutSet): Promise<WorkoutSet>;

  // Utility methods
  clearAllData?(): Promise<void>;
  updateWorkout(id: string, workout: Partial<Workout>): Promise<Workout>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private exercises: Map<string, Exercise> = new Map();
  private workouts: Map<string, Workout> = new Map();
  private workoutSets: Map<string, WorkoutSet> = new Map();
  private personalRecords: Map<string, PersonalRecord> = new Map();
  private aiInsights: Map<string, AIInsight> = new Map();
  private activities: Map<string, Activity> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Import exercises from your spreadsheet data
    this.seedExercisesFromSpreadsheet();
  }

  private seedExercisesFromSpreadsheet() {
    const exercisesData = [
      {
        name: "Incline Smith Machine Press",
        category: "UpperA",
        muscleGroups: ["Chest", "Shoulders"],
        instructions: "<strong>Primary:</strong> Upper Chest (Pectoralis Major), Shoulders (Anterior Deltoid).<br><strong>Secondary:</strong> Triceps.",
        tips: "Focus on a slow, controlled descent (2-3 seconds) and an explosive push up. This maximizes time under tension for muscle growth.",
        equipment: "Smith Machine",
        isUnilateral: false
      },
      {
        name: "Lat Pulldown",
        category: "UpperA",
        muscleGroups: ["Back", "Biceps"],
        instructions: "<strong>Primary:</strong> Back (Latissimus Dorsi).<br><strong>Secondary:</strong> Biceps, Rear Deltoids.",
        tips: "Keep your chest up and pull your elbows down and back, squeezing your shoulder blades together at the bottom of the movement.",
        equipment: "Cable Machine",
        isUnilateral: false
      },
      {
        name: "Seated Dumbbell Press",
        category: "UpperA",
        muscleGroups: ["Shoulders"],
        instructions: "<strong>Primary:</strong> Shoulders (Deltoids).<br><strong>Secondary:</strong> Triceps, Upper Chest.",
        tips: "Don't lock your elbows at the top. Keep a slight bend to maintain constant tension on the shoulder muscles, which is key for toning.",
        equipment: "Dumbbell",
        isUnilateral: false
      },
      {
        name: "Seated Machine Row",
        category: "UpperA",
        muscleGroups: ["Back", "Biceps"],
        instructions: "<strong>Primary:</strong> Mid-Back (Rhomboids, Lats).<br><strong>Secondary:</strong> Biceps, Rear Deltoids.",
        tips: "Pause for a second at the peak contraction, squeezing your back muscles hard before slowly returning to the start.",
        equipment: "Machine",
        isUnilateral: false
      },
      {
        name: "Cable Lateral Raise",
        category: "UpperA",
        muscleGroups: ["Shoulders"],
        instructions: "<strong>Primary:</strong> Shoulders (Lateral Deltoid).",
        tips: "Keep the weight light and focus on form. Raise your arms as if you're pouring a jug of water, with a slight bend in your elbow.",
        equipment: "Cable",
        isUnilateral: true
      },
      {
        name: "Tricep 'Skull Crusher'",
        category: "UpperA",
        muscleGroups: ["Triceps"],
        instructions: "<strong>Primary:</strong> Triceps.",
        tips: "Keep your upper arms stationary and perpendicular to the floor throughout the movement to isolate the triceps effectively.",
        equipment: "Barbell",
        isUnilateral: false
      },
      {
        name: "Seated Dumbbell Flyes",
        category: "UpperA",
        muscleGroups: ["Chest"],
        instructions: "<strong>Primary:</strong> Chest.",
        tips: "Maintain a controlled movement throughout the exercise, focusing on squeezing your chest muscles at the top of the movement. Avoid using excessive momentum.",
        equipment: "Dumbbell",
        isUnilateral: false
      },
      {
        name: "Seated Bicep Curl",
        category: "UpperA",
        muscleGroups: ["Biceps"],
        instructions: "<strong>Primary:</strong> Biceps.",
        tips: "Avoid swinging. Control the weight on the way down (the eccentric phase) even more than on the way up to maximize muscle fiber recruitment.",
        equipment: "Dumbbell",
        isUnilateral: false
      },
      {
        name: "Face Pulls",
        category: "UpperA",
        muscleGroups: ["Rear Delts", "Traps"],
        instructions: "<strong>Primary:</strong> Rear Deltoids, Trapezius.",
        tips: "Pull the rope towards your face, aiming your hands towards your ears. Squeeze your shoulder blades together. Great for posture.",
        equipment: "Cable",
        isUnilateral: false
      },
      {
        name: "Dumbbell Shrugs",
        category: "UpperA",
        muscleGroups: ["Traps"],
        instructions: "<strong>Primary:</strong> Trapezius.",
        tips: "Elevate your shoulders straight up towards your ears. Hold the peak contraction for a moment. Avoid rolling your shoulders.",
        equipment: "Dumbbell",
        isUnilateral: false
      },
      {
        name: "Leg Press",
        category: "LowerA",
        muscleGroups: ["Quads", "Glutes"],
        instructions: "<strong>Primary:</strong> Quads, Glutes.<br><strong>Secondary:</strong> Hamstrings.",
        tips: "Place your feet higher on the platform to target more glutes and hamstrings; place them lower to target more quads. Never lock your knees.",
        equipment: "Machine",
        isUnilateral: false
      },
      {
        name: "Leg Extension",
        category: "LowerA",
        muscleGroups: ["Quads"],
        instructions: "<strong>Primary:</strong> Quads.",
        tips: "Squeeze your quads hard at the top of the movement for a 1-2 second pause. This is excellent for building definition and toning.",
        equipment: "Machine",
        isUnilateral: false
      },
      {
        name: "Seated Hamstring Curl",
        category: "LowerA",
        muscleGroups: ["Hamstrings"],
        instructions: "<strong>Primary:</strong> Hamstrings.",
        tips: "Focus on a slow and controlled negative (the release phase). This is where much of the muscle growth is stimulated for hamstrings.",
        equipment: "Machine",
        isUnilateral: false
      },
      {
        name: "Hip Adduction",
        category: "LowerA",
        muscleGroups: ["Inner Thighs"],
        instructions: "<strong>Primary:</strong> Inner Thighs (Adductors).",
        tips: "Use a full range of motion. Control the weight as your legs move apart to get a good stretch on the inner thigh muscles.",
        equipment: "Machine",
        isUnilateral: false
      },
      {
        name: "Hip Abduction",
        category: "LowerA",
        muscleGroups: ["Outer Glutes"],
        instructions: "<strong>Primary:</strong> Outer Glutes (Gluteus Medius).",
        tips: "Lean forward slightly with your torso and squeeze your glutes at the point of maximum contraction to better engage the target muscles.",
        equipment: "Machine",
        isUnilateral: false
      },
      {
        name: "Calf Raise on Leg Press",
        category: "LowerA",
        muscleGroups: ["Calves"],
        instructions: "<strong>Primary:</strong> Calves (Gastrocnemius).",
        tips: "Pause and squeeze at the very top of the movement, and get a deep stretch at the bottom. Don't bounce the weight.",
        equipment: "Machine",
        isUnilateral: false
      },
      {
        name: "Cable Crunches",
        category: "LowerA",
        muscleGroups: ["Abs"],
        instructions: "<strong>Primary:</strong> Abdominals.",
        tips: "Focus on curling your spine and bringing your elbows towards your knees. Squeeze your abs hard at the bottom.",
        equipment: "Cable",
        isUnilateral: false
      },
      {
        name: "Plank",
        category: "LowerA",
        muscleGroups: ["Core"],
        instructions: "<strong>Primary:</strong> Core (Abs, Obliques, Lower Back).",
        tips: "Keep your body in a straight line from head to heels. Brace your core as if you're about to be punched in the stomach. Hold for time (e.g., 30-60 seconds).",
        equipment: "Bodyweight",
        isUnilateral: false
      },
      {
        name: "Assisted Pull-up",
        category: "UpperB",
        muscleGroups: ["Back", "Biceps"],
        instructions: "<strong>Primary:</strong> Back (Latissimus Dorsi).<br><strong>Secondary:</strong> Biceps.",
        tips: "Focus on driving your elbows down to lift your body. As you get stronger, reduce the assistance weight.",
        equipment: "Machine",
        isUnilateral: false
      },
      {
        name: "Flat Dumbbell Bench Press",
        category: "UpperB",
        muscleGroups: ["Chest"],
        instructions: "<strong>Primary:</strong> Chest (Pectoralis Major).<br><strong>Secondary:</strong> Shoulders, Triceps.",
        tips: "Bring the dumbbells down to the sides of your chest, not straight over your shoulders. This protects your joints and maximizes chest activation.",
        equipment: "Dumbbell",
        isUnilateral: false
      },
      {
        name: "Chest-Supported Row",
        category: "UpperB",
        muscleGroups: ["Back", "Biceps"],
        instructions: "<strong>Primary:</strong> Upper & Mid-Back (Trapezius, Rhomboids).<br><strong>Secondary:</strong> Biceps, Rear Deltoids.",
        tips: "Focus on pulling with your elbows and squeezing your shoulder blades together. The chest support helps you isolate the back muscles.",
        equipment: "Machine",
        isUnilateral: false
      },
      {
        name: "Pec Deck Fly",
        category: "UpperB",
        muscleGroups: ["Chest"],
        instructions: "<strong>Primary:</strong> Chest (Pectoralis Major).",
        tips: "Imagine you are hugging a large tree. Keep a slight bend in your elbows and focus on squeezing your chest muscles to bring the handles together.",
        equipment: "Machine",
        isUnilateral: false
      },
      {
        name: "Rear Delt Fly",
        category: "UpperB",
        muscleGroups: ["Shoulders"],
        instructions: "<strong>Primary:</strong> Rear Shoulders (Posterior Deltoids).<br><strong>Secondary:</strong> Upper Back.",
        tips: "Keep the weight light and focus on squeezing your rear delts. Don't use momentum; the movement should be slow and controlled.",
        equipment: "Machine",
        isUnilateral: false
      },
      {
        name: "Assisted Dips",
        category: "UpperB",
        muscleGroups: ["Triceps", "Chest"],
        instructions: "<strong>Primary:</strong> Triceps.<br><strong>Secondary:</strong> Chest, Shoulders.",
        tips: "To target the triceps more, keep your torso as upright as possible. To target the chest more, lean your body forward.",
        equipment: "Machine",
        isUnilateral: false
      },
      {
        name: "Kneeling Single-Arm Row",
        category: "UpperB",
        muscleGroups: ["Back", "Biceps"],
        instructions: "<strong>Primary:</strong> Back (Lats).<br><strong>Secondary:</strong> Biceps.",
        tips: "Pull the handle towards your hip, not your chest. This helps to better engage the latissimus dorsi muscle for a wider back.",
        equipment: "Cable",
        isUnilateral: true
      },
      {
        name: "Cable Bicep Curl",
        category: "UpperB",
        muscleGroups: ["Biceps"],
        instructions: "<strong>Primary:</strong> Biceps.",
        tips: "Cables provide constant tension. Squeeze at the top and control the negative for a great pump.",
        equipment: "Cable",
        isUnilateral: true
      },
      {
        name: "Tricep Rope Pushdown",
        category: "UpperB",
        muscleGroups: ["Triceps"],
        instructions: "<strong>Primary:</strong> Triceps.",
        tips: "At the bottom of the movement, separate the rope handles to fully engage all three heads of the triceps.",
        equipment: "Cable",
        isUnilateral: false
      },
      {
        name: "Smith Machine Lunge",
        category: "LowerB",
        muscleGroups: ["Glutes", "Quads"],
        instructions: "<strong>Primary:</strong> Glutes, Quads.<br><strong>Secondary:</strong> Hamstrings.",
        tips: "Focus on pushing through the heel of your front foot to maximize glute activation. Keep your torso upright to protect your back.",
        equipment: "Smith Machine",
        isUnilateral: true
      },
      {
        name: "Leg Press (Narrow Stance)",
        category: "LowerB",
        muscleGroups: ["Quads"],
        instructions: "<strong>Primary:</strong> Outer Quads (Vastus Lateralis).<br><strong>Secondary:</strong> Glutes.",
        tips: "A narrower stance on the leg press platform helps to emphasize the outer sweep of your quadriceps.",
        equipment: "Machine",
        isUnilateral: false
      },
      {
        name: "Cable Glute Kickback",
        category: "LowerB",
        muscleGroups: ["Glutes"],
        instructions: "<strong>Primary:</strong> Glutes (Gluteus Maximus).",
        tips: "Squeeze your glute hard at the top of the kickback for a full second. Don't just swing your leg; control the movement.",
        equipment: "Cable",
        isUnilateral: true
      },
      {
        name: "Calf Raise on Smith Machine",
        category: "LowerB",
        muscleGroups: ["Calves"],
        instructions: "<strong>Primary:</strong> Calves.",
        tips: "Place the balls of your feet on a small platform or weight plate to allow for a deeper stretch at the bottom of the movement.",
        equipment: "Smith Machine",
        isUnilateral: false
      },
      {
        name: "Hanging Leg Raises",
        category: "LowerB",
        muscleGroups: ["Abs", "Core"],
        instructions: "<strong>Primary:</strong> Lower Abs, Hip Flexors.",
        tips: "Try to raise your legs without swinging. If it's too hard, start with bent-knee raises.",
        equipment: "Pull-up Bar",
        isUnilateral: false
      },
      {
        name: "Seated Calf Raise",
        category: "LowerB",
        muscleGroups: ["Calves"],
        instructions: "<strong>Primary:</strong> Calves (Soleus).",
        tips: "This targets the lower part of the calf. Use the same principles: pause at the top, deep stretch at the bottom.",
        equipment: "Machine",
        isUnilateral: false
      },
      {
        name: "Concentration Curl",
        category: "UpperB",
        muscleGroups: ["Biceps"],
        instructions: "Sit on a bench holding a dumbbell in one hand, resting your elbow on the inside of your thigh, and curl the weight upwards.",
        tips: "Keep your elbow tucked in throughout the movement to maximize bicep engagement.",
        equipment: "Dumbbell",
        isUnilateral: true
      },
      {
        name: "Hammer Curl",
        category: "UpperB",
        muscleGroups: ["Biceps"],
        instructions: "Stand holding a dumbbell in each hand with palms facing each other and curl the weights upwards, keeping palms facing each other.",
        tips: "Focus on controlled movement and avoid using momentum to lift the weights.",
        equipment: "Dumbbell",
        isUnilateral: false
      },
      {
        name: "Preacher Curl",
        category: "UpperB",
        muscleGroups: ["Biceps"],
        instructions: "Sit at a preacher curl bench, place your upper arms against the pad, and curl the weight upwards, focusing on the peak contraction.",
        tips: "Control the negative (lowering) portion of the lift to maximize bicep engagement.",
        equipment: "Barbell",
        isUnilateral: false
      },
      {
        name: "Decline Push-up",
        category: "UpperB",
        muscleGroups: ["Chest", "Shoulders", "Triceps"],
        instructions: "Perform a push-up with your feet elevated on a bench or chair, increasing the stretch on your chest muscles.",
        tips: "Maintain a straight line from head to heels throughout the movement; avoid sagging in the mid-section.",
        equipment: "Bodyweight",
        isUnilateral: false
      },
      {
        name: "Cable Chest Flyes",
        category: "UpperB",
        muscleGroups: ["Chest"],
        instructions: "With your back straight, pull the handles inwards across your body, squeezing your pectoral muscles at the end of the movement.",
        tips: "Focus on a controlled movement and full range of motion to target the chest muscles fully.",
        equipment: "Cable",
        isUnilateral: false
      }
    ];

    exercisesData.forEach(exerciseData => {
      const exercise: Exercise = {
        id: randomUUID(),
        name: exerciseData.name,
        category: exerciseData.category,
        muscleGroups: exerciseData.muscleGroups,
        instructions: exerciseData.instructions || null,
        tips: exerciseData.tips || null,
        equipment: exerciseData.equipment || null,
        isUnilateral: exerciseData.isUnilateral || false,
        createdAt: new Date(),
      };
      this.exercises.set(exercise.id, exercise);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      age: insertUser.age ?? null,
      experience: insertUser.experience ?? null,
      healthNotes: insertUser.healthNotes ?? null,
      goals: insertUser.goals || null,
      streak: insertUser.streak ?? 0,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, userUpdate: Partial<User>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    const updatedUser = { ...existingUser, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    const exercises = Array.from(this.exercises.values());
    return exercises.filter(exercise => exercise.category === category);
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(ex => ex.category === category);
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const exercise: Exercise = {
      name: insertExercise.name,
      category: insertExercise.category,
      muscleGroups: insertExercise.muscleGroups,
      id,
      instructions: insertExercise.instructions ?? null,
      tips: insertExercise.tips ?? null,
      equipment: insertExercise.equipment ?? null,
      isUnilateral: insertExercise.isUnilateral ?? null,
      createdAt: new Date(),
    };
    this.exercises.set(id, exercise);
    return exercise;
  }

  async getWorkouts(userId: string): Promise<Workout[]> {
    const userWorkouts = Array.from(this.workouts.values()).filter(w => w.userId === userId);
    
    // If no workouts for current user, return imported data directly
    if (userWorkouts.length === 0) {
      const allWorkouts = Array.from(this.workouts.values());
      console.log('Total workouts in storage:', allWorkouts.length);
      console.log('Looking for user ID:', userId);
      return allWorkouts; // Return all workouts for now to see what's there
    }
    
    return userWorkouts;
  }

  async getWorkout(id: string): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const id = randomUUID();
    const workout: Workout = {
      ...insertWorkout,
      id,
      startedAt: new Date(),
      completedAt: insertWorkout.completedAt ?? null,
      totalVolume: insertWorkout.totalVolume ?? 0,
      duration: insertWorkout.duration ?? null,
      notes: insertWorkout.notes ?? null,
    };
    this.workouts.set(id, workout);
    return workout;
  }

  async updateWorkout(id: string, workoutUpdate: Partial<Workout>): Promise<Workout> {
    const existingWorkout = this.workouts.get(id);
    if (!existingWorkout) {
      throw new Error("Workout not found");
    }
    const updatedWorkout = { ...existingWorkout, ...workoutUpdate };
    this.workouts.set(id, updatedWorkout);
    return updatedWorkout;
  }

  async getWorkoutSets(workoutId: string): Promise<WorkoutSet[]> {
    return Array.from(this.workoutSets.values()).filter(s => s.workoutId === workoutId);
  }

  async createWorkoutSet(insertSet: InsertWorkoutSet): Promise<WorkoutSet> {
    const id = randomUUID();
    const set: WorkoutSet = {
      ...insertSet,
      id,
      leftReps: insertSet.leftReps ?? null,
      rightReps: insertSet.rightReps ?? null,
      restTime: insertSet.restTime ?? null,
      isPR: insertSet.isPR ?? null,
      createdAt: new Date(),
    };
    this.workoutSets.set(id, set);
    return set;
  }

  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    return Array.from(this.personalRecords.values()).filter(pr => pr.userId === userId);
  }

  async createPersonalRecord(insertRecord: InsertPersonalRecord): Promise<PersonalRecord> {
    const id = randomUUID();
    const record: PersonalRecord = {
      ...insertRecord,
      id,
      achievedAt: new Date(),
    };
    this.personalRecords.set(id, record);
    return record;
  }

  async getAIInsights(userId: string, type?: string): Promise<AIInsight[]> {
    const userInsights = Array.from(this.aiInsights.values()).filter(ai => ai.userId === userId);
    if (type) {
      return userInsights.filter(ai => ai.type === type);
    }
    return userInsights;
  }

  async createAIInsight(insertInsight: InsertAIInsight): Promise<AIInsight> {
    const id = randomUUID();
    const insight: AIInsight = {
      ...insertInsight,
      id,
      metadata: insertInsight.metadata ?? null,
      createdAt: new Date(),
    };
    this.aiInsights.set(id, insight);
    return insight;
  }

  async getActivities(userId: string): Promise<Activity[]> {
    const userActivities = Array.from(this.activities.values()).filter(activity => activity.userId === userId);
    
    // If no activities for current user, return imported data directly
    if (userActivities.length === 0) {
      const allActivities = Array.from(this.activities.values());
      console.log('Total activities in storage:', allActivities.length);
      return allActivities; // Return all activities for now to see what's there
    }
    
    return userActivities;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const activity: Activity = {
      id: randomUUID(),
      ...insertActivity,
      startedAt: insertActivity.startedAt || new Date(),
      completedAt: insertActivity.completedAt || new Date(),
    };
    this.activities.set(activity.id, activity);
    return activity;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getWorkoutSets(workoutId: string): Promise<WorkoutSet[]> {
    return Array.from(this.workoutSets.values()).filter(set => set.workoutId === workoutId);
  }

  async createWorkoutSet(insertSet: InsertWorkoutSet): Promise<WorkoutSet> {
    const set: WorkoutSet = {
      id: randomUUID(),
      ...insertSet,
      leftReps: insertSet.leftReps || null,
      rightReps: insertSet.rightReps || null,
      restTime: insertSet.restTime || null,
      createdAt: new Date(),
      isPR: false,
    };
    this.workoutSets.set(set.id, set);
    return set;
  }

  async clearAllData(): Promise<void> {
    this.users.clear();
    this.exercises.clear();
    this.workouts.clear();
    this.workoutSets.clear();
    this.personalRecords.clear();
    this.aiInsights.clear();
    this.activities.clear();
    
    // Re-seed exercises after clearing
    this.seedExercisesFromSpreadsheet();
  }

  async updateWorkout(id: string, updates: Partial<Workout>): Promise<Workout> {
    const existing = this.workouts.get(id);
    if (!existing) {
      throw new Error(`Workout with id ${id} not found`);
    }
    
    const updated = { ...existing, ...updates };
    this.workouts.set(id, updated);
    return updated;
  }

  async getExerciseHistory(userId: string, exerciseId: string): Promise<WorkoutSet[]> {
    return Array.from(this.workoutSets.values()).filter(set => 
      set.exerciseId === exerciseId && 
      this.workouts.get(set.workoutId)?.userId === userId
    );
  }

  async getPersonalRecordForExercise(userId: string, exerciseId: string): Promise<PersonalRecord | undefined> {
    return Array.from(this.personalRecords.values()).find(pr => 
      pr.userId === userId && pr.exerciseId === exerciseId
    );
  }

  async checkAndCreatePR(userId: string, exerciseId: string, weight: number, reps: number): Promise<boolean> {
    const existing = await this.getPersonalRecordForExercise(userId, exerciseId);
    const oneRepMax = weight * (1 + reps / 30); // Estimated 1RM formula
    
    if (!existing || oneRepMax > existing.oneRepMax) {
      await this.createPersonalRecord({
        userId,
        exerciseId,
        weight,
        reps,
        oneRepMax,
        achievedAt: new Date(),
      });
      return true;
    }
    return false;
  }
}

import { db } from "./db";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(schema.users)
      .values({...insertUser, id: randomUUID()})
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(schema.users)
      .set(updates)
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(schema.users);
  }

  async getExercises(): Promise<Exercise[]> {
    return await db.select().from(schema.exercises);
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    return await db.select().from(schema.exercises).where(eq(schema.exercises.category, category));
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    const [exercise] = await db.select().from(schema.exercises).where(eq(schema.exercises.id, id));
    return exercise || undefined;
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const [exercise] = await db
      .insert(schema.exercises)
      .values({...insertExercise, id: randomUUID()})
      .returning();
    return exercise;
  }

  async getWorkouts(userId: string): Promise<Workout[]> {
    return await db.select().from(schema.workouts).where(eq(schema.workouts.userId, userId));
  }

  async getWorkout(id: string): Promise<Workout | undefined> {
    const [workout] = await db.select().from(schema.workouts).where(eq(schema.workouts.id, id));
    return workout || undefined;
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const [workout] = await db
      .insert(schema.workouts)
      .values({...insertWorkout, id: randomUUID()})
      .returning();
    return workout;
  }

  async updateWorkout(id: string, updates: Partial<Workout>): Promise<Workout> {
    const [workout] = await db
      .update(schema.workouts)
      .set(updates)
      .where(eq(schema.workouts.id, id))
      .returning();
    return workout;
  }

  async getWorkoutSets(workoutId: string): Promise<WorkoutSet[]> {
    return await db.select().from(schema.workoutSets).where(eq(schema.workoutSets.workoutId, workoutId));
  }

  async createWorkoutSet(insertSet: InsertWorkoutSet): Promise<WorkoutSet> {
    const [set] = await db
      .insert(schema.workoutSets)
      .values({...insertSet, id: randomUUID()})
      .returning();
    return set;
  }

  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    return await db.select().from(schema.personalRecords).where(eq(schema.personalRecords.userId, userId));
  }

  async createPersonalRecord(insertRecord: InsertPersonalRecord): Promise<PersonalRecord> {
    const [record] = await db
      .insert(schema.personalRecords)
      .values({...insertRecord, id: randomUUID()})
      .returning();
    return record;
  }

  async getAIInsights(userId: string, type?: string): Promise<AIInsight[]> {
    let query = db.select().from(schema.aiInsights).where(eq(schema.aiInsights.userId, userId));
    if (type) {
      query = query.where(eq(schema.aiInsights.type, type));
    }
    return await query;
  }

  async createAIInsight(insertInsight: InsertAIInsight): Promise<AIInsight> {
    const [insight] = await db
      .insert(schema.aiInsights)
      .values({...insertInsight, id: randomUUID()})
      .returning();
    return insight;
  }

  async getActivities(userId: string): Promise<Activity[]> {
    return await db.select().from(schema.activities).where(eq(schema.activities.userId, userId));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(schema.activities)
      .values({...insertActivity, id: randomUUID()})
      .returning();
    return activity;
  }

  async clearAllData(): Promise<void> {
    // Clear all tables in correct order to respect foreign keys
    await db.delete(schema.workoutSets);
    await db.delete(schema.personalRecords);
    await db.delete(schema.aiInsights);
    await db.delete(schema.activities);
    await db.delete(schema.workouts);
    await db.delete(schema.exercises);
    await db.delete(schema.users);
  }

  async getExerciseHistory(userId: string, exerciseId: string): Promise<WorkoutSet[]> {
    // This would need a join query in real implementation
    return [];
  }

  async getPersonalRecordForExercise(userId: string, exerciseId: string): Promise<PersonalRecord | undefined> {
    const [record] = await db.select().from(schema.personalRecords)
      .where(eq(schema.personalRecords.userId, userId))
      .where(eq(schema.personalRecords.exerciseId, exerciseId));
    return record || undefined;
  }

  async checkAndCreatePR(userId: string, exerciseId: string, weight: number, reps: number): Promise<boolean> {
    // Simplified implementation
    return false;
  }
}

export const storage = new DatabaseStorage();
