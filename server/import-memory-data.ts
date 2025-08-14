import { promises as fs } from 'fs';
import { storage } from './storage';

interface ActivityLogRow {
  timestamp: string;
  activity: string;
  simplifiedActivity: string;
  distance: number;
  speed: number;
  pace: number;
  inProgress: boolean;
}

interface WorkoutDurationRow {
  startTime: string;
  workoutType: string;
  duration: string;
}

function simplifyActivityName(activity: string): string {
  if (activity.toLowerCase().includes('cycling')) return 'Cycling';
  if (activity.toLowerCase().includes('tennis')) return 'Tennis';
  if (activity.toLowerCase().includes('swimming')) return 'Swimming';
  return activity;
}

function estimateDurationForActivity(activity: string): number {
  const simplified = simplifyActivityName(activity);
  if (simplified === 'Cycling') return 45;
  if (simplified === 'Tennis') return 60;
  if (simplified === 'Swimming') return 40;
  return 30; // default
}

function parseDateFromActivityLog(dateStr: string): Date | null {
  try {
    if (dateStr.includes('T')) {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    }
    
    const parts = dateStr.split(', ');
    if (parts.length !== 2) return null;
    
    const [datePart, timePart] = parts;
    const dateComponents = datePart.split('/');
    if (dateComponents.length !== 3) return null;
    
    const [day, month, year] = dateComponents;
    const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}Z`;
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error(`Failed to parse date: ${dateStr}`, error);
    return null;
  }
}

function parseDurationFromWorkout(duration: string): number {
  const match = duration.match(/(\d+)m\s*(\d+)s/);
  if (match) {
    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    return minutes + (seconds / 60);
  }
  return 45; // fallback
}

async function importToMemoryStorage() {
  console.log('Starting memory storage import...');
  
  try {
    // Read CSV files
    const activityLogContent = await fs.readFile('../attached_assets/Workout Tracker - ActivityLog_1755186654215.csv', 'utf-8');
    const workoutDurationsContent = await fs.readFile('../attached_assets/Workout Tracker - WorkoutDurations (1)_1755186654222.csv', 'utf-8');
    
    console.log('Reading ActivityLog CSV...');
    console.log('First few lines:', activityLogContent.split('\n').slice(0, 3));
    
    console.log('Reading WorkoutDurations CSV...');
    console.log('First few lines:', workoutDurationsContent.split('\n').slice(0, 3));
    
    // Get the first user from memory storage
    const users = await storage.getUsers?.() || [];
    if (users.length === 0) {
      console.error('No users found in memory storage.');
      return { activities: 0, workouts: 0 };
    }
    
    const userId = users[0].id;
    console.log('Using user ID:', userId);
    
    // Parse ActivityLog
    const activityLines = activityLogContent.trim().split('\n');
    let activitiesCount = 0;
    
    for (let index = 0; index < activityLines.length; index++) {
      const line = activityLines[index];
      const parts = line.replace(/\r/g, '').split(',');
      const fullDateStr = parts[0]?.replace(/"/g, '') || '';
      const activityName = parts[1]?.replace(/"/g, '') || '';
      
      if (!fullDateStr || !activityName) {
        console.log(`Skipping invalid activity line ${index}: ${line}`);
        continue;
      }
      
      const startTime = parseDateFromActivityLog(fullDateStr);
      if (!startTime) {
        console.log(`Failed to parse date for activity ${index}: ${fullDateStr}`);
        continue;
      }
      
      const duration = estimateDurationForActivity(activityName);
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      const simplifiedName = simplifyActivityName(activityName);
      
      try {
        await storage.createActivity({
          userId: userId,
          type: simplifiedName.toLowerCase(),
          name: simplifiedName,
          duration: duration,
          notes: null,
          startedAt: startTime,
          completedAt: endTime,
          metadata: {}
        });
        activitiesCount++;
      } catch (error) {
        console.error(`Error creating activity ${index}:`, error);
      }
    }
    
    // Parse WorkoutDurations
    const workoutLines = workoutDurationsContent.trim().split('\n');
    let workoutsCount = 0;
    
    for (let index = 0; index < workoutLines.length; index++) {
      const line = workoutLines[index];
      const parts = line.replace(/\r/g, '').split(',');
      const startTimeStr = parts[0]?.replace(/"/g, '') || '';
      const workoutType = parts[1]?.replace(/"/g, '') || '';
      const durationStr = parts[2]?.replace(/"/g, '') || '';
      
      if (!startTimeStr || !workoutType || !durationStr) {
        console.log(`Skipping invalid workout line ${index}: ${line}`);
        continue;
      }
      
      const startTime = new Date(startTimeStr);
      if (isNaN(startTime.getTime())) {
        console.log(`Failed to parse start time for workout ${index}: ${startTimeStr}`);
        continue;
      }
      
      const duration = parseDurationFromWorkout(durationStr);
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      
      try {
        await storage.createWorkout({
          userId: userId,
          category: workoutType,
          startedAt: startTime,
          completedAt: endTime,
          duration: Math.round(duration),
          totalVolume: 0,
          notes: null
        });
        workoutsCount++;
      } catch (error) {
        console.error(`Error creating workout ${index}:`, error);
      }
    }
    
    console.log(`Import complete: { activities: ${activitiesCount}, workouts: ${workoutsCount} }`);
    return { activities: activitiesCount, workouts: workoutsCount };
    
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

importToMemoryStorage().catch(console.error);