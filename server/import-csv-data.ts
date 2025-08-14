import { promises as fs } from 'fs';
import { db } from './db';
import { workouts, activities, users } from '@shared/schema';

interface ActivityLogRow {
  [key: string]: string; // Flexible to handle different CSV formats
}

interface WorkoutDurationRow {
  [key: string]: string; // Flexible to handle different CSV formats
}

function parseCSV<T>(csvContent: string): T[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row as T;
  });
}

function convertDurationToMinutes(duration: string): number {
  // Handle formats like "45:00:00", "1:30:00", "30m", etc.
  if (duration.includes(':')) {
    const parts = duration.split(':');
    const hours = parseInt(parts[0] || '0');
    const minutes = parseInt(parts[1] || '0');
    return hours * 60 + minutes;
  }
  
  if (duration.includes('m')) {
    return parseInt(duration.replace('m', '')) || 0;
  }
  
  return parseInt(duration) || 0;
}

function simplifyActivityName(activity: string): string {
  // Simplify "Cycling/Sprint" to "Cycling" as requested
  if (activity.toLowerCase().includes('cycling')) return 'Cycling';
  if (activity.toLowerCase().includes('tennis')) return 'Tennis';
  if (activity.toLowerCase().includes('swimming')) return 'Swimming';
  return activity;
}

function parseDateFromActivityLog(dateStr: string): Date | null {
  try {
    // Handle formats like "31/07/2025, 13:08:53" or "2025-08-09T16:38:33.605Z"
    if (dateStr.includes('T')) {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Parse format like "31/07/2025, 13:08:53"
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
  // Handle formats like "65m 7s", "28m 32s", etc.
  const match = duration.match(/(\d+)m\s*(\d+)s/);
  if (match) {
    return parseInt(match[1]) + parseInt(match[2]) / 60;
  }
  
  const minutesMatch = duration.match(/(\d+)m/);
  if (minutesMatch) {
    return parseInt(minutesMatch[1]);
  }
  
  return 0;
}

function estimateDurationForActivity(activity: string): number {
  // Estimate durations based on typical activity lengths
  const activityLower = activity.toLowerCase();
  if (activityLower.includes('cycling')) return 45; // 45 minutes typical
  if (activityLower.includes('tennis')) return 60;  // 1 hour typical
  if (activityLower.includes('swimming')) return 40; // 40 minutes typical
  return 30; // Default
}

export async function importCSVData() {
  try {
    console.log('Starting CSV data import...');
    
    // Read CSV files
    const activityLogPath = '../attached_assets/Workout Tracker - ActivityLog_1755186654215.csv';
    const workoutDurationsPath = '../attached_assets/Workout Tracker - WorkoutDurations (1)_1755186654222.csv';
    
    const [activityLogContent, workoutDurationsContent] = await Promise.all([
      fs.readFile(activityLogPath, 'utf-8'),
      fs.readFile(workoutDurationsPath, 'utf-8')
    ]);
    
    console.log('Reading ActivityLog CSV...');
    console.log('First few lines:', activityLogContent.split('\n').slice(0, 3));
    
    console.log('Reading WorkoutDurations CSV...');
    console.log('First few lines:', workoutDurationsContent.split('\n').slice(0, 3));
    
    // Clear existing data
    await db.delete(activities);
    await db.delete(workouts);
    console.log('Cleared existing data');
    
    // Get existing user ID (use the authenticated user)
    const existingUsers = await db.select({ id: users.id }).from(users).limit(1);
    const userId = existingUsers[0]?.id;
    
    if (!userId) {
      console.error('No users found in database. Please sign in first.');
      return { activities: 0, workouts: 0 };
    }
    
    console.log('Using user ID:', userId);
    
    // Parse ActivityLog (simplified approach)
    const activityLines = activityLogContent.trim().split('\n');
    const activitiesData = activityLines.map((line, index) => {
      const parts = line.replace(/\r/g, '').split(',');
      const fullDateStr = parts[0]?.replace(/"/g, '') || '';
      const activityName = parts[1]?.replace(/"/g, '') || '';
      
      // Extract just the date part from formats like "31/07/2025, 13:08:53"
      const dateStr = fullDateStr.includes(',') ? fullDateStr : fullDateStr;
      
      if (!dateStr || !activityName) {
        console.log(`Skipping invalid activity line ${index}: ${line}`);
        return null;
      }
      
      const startTime = parseDateFromActivityLog(dateStr);
      if (!startTime) {
        console.log(`Failed to parse date for activity ${index}: ${dateStr}`);
        return null;
      }
      
      const duration = estimateDurationForActivity(activityName);
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      const simplifiedName = simplifyActivityName(activityName);
      
      return {
        id: `activity-${index + 1}`,
        userId: userId,
        type: simplifiedName.toLowerCase(),
        name: simplifiedName,
        startedAt: startTime,
        completedAt: endTime,
        duration: duration,
        notes: null
      };
    }).filter(Boolean);
    
    if (activitiesData.length > 0) {
      await db.insert(activities).values(activitiesData);
      console.log(`Inserted ${activitiesData.length} activities`);
    }
    
    // Parse WorkoutDurations (simplified approach)
    const workoutLines = workoutDurationsContent.trim().split('\n');
    const workoutsData = workoutLines.map((line, index) => {
      const parts = line.replace(/\r/g, '').split(',');
      const startTimeStr = parts[0]?.replace(/"/g, '') || '';
      const workoutType = parts[1]?.replace(/"/g, '') || '';
      const durationStr = parts[2]?.replace(/"/g, '') || '';
      
      if (!startTimeStr || !workoutType || !durationStr) {
        console.log(`Skipping invalid workout line ${index}: ${line}`);
        return null;
      }
      
      const startTime = new Date(startTimeStr);
      if (isNaN(startTime.getTime())) {
        console.log(`Failed to parse start time for workout ${index}: ${startTimeStr}`);
        return null;
      }
      
      const duration = parseDurationFromWorkout(durationStr);
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      
      return {
        id: `workout-${index + 1}`,
        userId: userId,
        category: workoutType,
        startedAt: startTime,
        completedAt: endTime,
        duration: Math.round(duration),
        totalVolume: 0, // Will be calculated from sets data later
      };
    }).filter(Boolean);
    
    if (workoutsData.length > 0) {
      await db.insert(workouts).values(workoutsData);
      console.log(`Inserted ${workoutsData.length} workouts`);
    }
    
    console.log('CSV import completed successfully');
    return { activities: activitiesData.length, workouts: workoutsData.length };
    
  } catch (error) {
    console.error('Error importing CSV data:', error);
    throw error;
  }
}

// Run import if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importCSVData()
    .then(result => {
      console.log('Import complete:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}