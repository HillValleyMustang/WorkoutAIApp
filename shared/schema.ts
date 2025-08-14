import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  age: integer("age"),
  height: real("height"), // in cm
  weight: real("weight"), // in kg
  experience: text("experience").default("beginner"),
  fitnessGoal: text("fitness_goal"), // e.g., "Get Toned & Muscular"
  targetDate: timestamp("target_date"),
  healthNotes: text("health_notes"),
  goals: jsonb("goals").$type<string[]>().default([]),
  streak: integer("streak").default(0),
  weekStartDay: integer("week_start_day").default(1), // 0=Sunday, 1=Monday, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // "workout", "cycling", "swimming", "tennis", etc.
  name: text("name").notNull(), // "UpperA", "Cycling", "Swimming", "Tennis"
  duration: integer("duration"), // in minutes
  notes: text("notes"),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // "UpperA", "LowerA", "UpperB", "LowerB"
  muscleGroups: jsonb("muscle_groups").$type<string[]>().notNull(),
  instructions: text("instructions"),
  tips: text("tips"),
  isUnilateral: boolean("is_unilateral").default(false),
  equipment: text("equipment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workouts = pgTable("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  category: text("category").notNull(), // "UpperA", "LowerA", "UpperB", "LowerB"
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  totalVolume: real("total_volume").default(0),
  duration: integer("duration"), // in minutes
  notes: text("notes"),
});

export const workoutSets = pgTable("workout_sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutId: varchar("workout_id").references(() => workouts.id).notNull(),
  exerciseId: varchar("exercise_id").references(() => exercises.id).notNull(),
  setNumber: integer("set_number").notNull(),
  weight: real("weight").notNull(),
  reps: integer("reps").notNull(),
  leftReps: integer("left_reps"), // for unilateral exercises
  rightReps: integer("right_reps"), // for unilateral exercises
  restTime: integer("rest_time"), // in seconds
  isPR: boolean("is_pr").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const personalRecords = pgTable("personal_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  exerciseId: varchar("exercise_id").references(() => exercises.id).notNull(),
  weight: real("weight").notNull(),
  reps: integer("reps").notNull(),
  volume: real("volume").notNull(), // weight * reps
  achievedAt: timestamp("achieved_at").defaultNow(),
});

export const aiInsights = pgTable("ai_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // "progression", "form", "general"
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  startedAt: true,
  userId: true,
});

export const insertWorkoutSetSchema = createInsertSchema(workoutSets).omit({
  id: true,
  createdAt: true,
});

export const insertPersonalRecordSchema = createInsertSchema(personalRecords).omit({
  id: true,
  achievedAt: true,
});

export const insertAIInsightSchema = createInsertSchema(aiInsights).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  startedAt: true,
  userId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workouts.$inferSelect;

export type InsertWorkoutSet = z.infer<typeof insertWorkoutSetSchema>;
export type WorkoutSet = typeof workoutSets.$inferSelect;

export type InsertPersonalRecord = z.infer<typeof insertPersonalRecordSchema>;
export type PersonalRecord = typeof personalRecords.$inferSelect;

export type InsertAIInsight = z.infer<typeof insertAIInsightSchema>;
export type AIInsight = typeof aiInsights.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
