import { promises as fs } from 'fs';
import { storage } from './storage';

interface WorkoutLogEntry {
  dateTime: string;
  exercise: string;
  primaryMuscle: string;
  trainingRecord: string;
}

interface ActivityEntry {
  dateTime: string;
  activity: string;
  [key: string]: any; // For varying activity-specific fields
}

interface WorkoutDurationEntry {
  dateTime: string;
  workoutType: string;
  duration: string;
}

function parseDate(dateStr: string): Date {
  if (!dateStr) {
    console.log('Warning: Empty date string');
    return new Date();
  }
  
  // Handle format: "31/07/2025, 13:08:53"
  const cleanedStr = dateStr.replace(/"/g, '').trim();
  const [datePart, timePart] = cleanedStr.split(', ');
  if (!datePart || !timePart) {
    console.log('Warning: Invalid date format:', dateStr);
    return new Date();
  }
  
  const [day, month, year] = datePart.split('/');
  const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}Z`;
  return new Date(isoString);
}

function parseDuration(durationStr: string): number {
  if (!durationStr) return 45;
  const cleanStr = durationStr.trim();
  const match = cleanStr.match(/(\d+)m\s*(\d+)s/);
  if (match) {
    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    return minutes + (seconds / 60);
  }
  return 45; // fallback
}

function parseTrainingRecord(recordStr: string): any[] {
  try {
    if (!recordStr || recordStr.trim() === '') return [];
    
    // Clean up the JSON string - the CSV has the JSON without proper quotes
    let cleanedJson = recordStr
      .replace(/"""/g, '"')
      .replace(/""/g, '"')
      .replace(/([{,])(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1$2"$3":')  // Add quotes around property names
      .replace(/:([^,}\]]+)([,}\]])/g, (match, value, ending) => {
        const trimmedValue = value.trim();
        if (trimmedValue === '' || trimmedValue === '""') {
          return `:null${ending}`;  // Handle empty values
        }
        return `:"${trimmedValue}"${ending}`;
      })
      .replace(/:"(\d+\.?\d*)"([,}\]])/g, ':$1$2')  // Remove quotes from numbers
      .replace(/:"(true|false|null)"([,}\]])/g, ':$1$2');  // Remove quotes from booleans/null
    
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.log('Failed to parse training record:', recordStr, 'Error:', error.message);
    return [];
  }
}

function mapWorkoutCategory(category: string): string {
  switch (category) {
    case 'Upper Body A': return 'UpperA';
    case 'Lower Body A': return 'LowerA';
    case 'Upper Body B': return 'UpperB';
    case 'Lower Body B': return 'LowerB';
    default: return category;
  }
}

async function parseCsvContent(content: string): Promise<any[]> {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Parse CSV line (handle quoted fields)
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const entry: any = {};
    headers.forEach((header, index) => {
      entry[header.trim()] = values[index] || '';
    });
    
    data.push(entry);
  }
  
  return data;
}

async function importCompleteData() {
  console.log('Starting complete CSV data import...');
  
  try {
    // Clear existing storage data first
    console.log('Clearing existing data...');
    await storage.clearAllData?.();
    
    // Create a sample user for the data
    const user = await storage.createUser({
      firebaseUid: 'imported-user-123',
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
    });
    
    console.log('Created user:', user.id);
    
    // 1. Import workout durations first (to establish workout sessions)
    console.log('Importing workout durations...');
    const durationsContent = await fs.readFile('../attached_assets/Workout Log CSV - WorkoutDurations_1755192457888.csv', 'utf-8');
    const durationsData = await parseCsvContent(durationsContent);
    
    const workoutSessions = new Map();
    
    for (const entry of durationsData) {
      console.log('Processing duration entry:', entry);
      const startTime = parseDate(entry['Workout Saved Date and Time']);
      const workoutType = entry['Workout Completed'];
      const durationStr = entry['Duration '] || entry['Duration'] || '';
      console.log('Duration string:', durationStr);
      const duration = parseDuration(durationStr);
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      
      const workout = await storage.createWorkout({
        userId: user.id,
        category: workoutType,
        startedAt: startTime,
        completedAt: endTime,
        duration: Math.round(duration),
        totalVolume: 0, // Will calculate from sets
        notes: null,
      });
      
      // Store by date key for linking exercises
      const dateKey = startTime.toISOString().split('T')[0];
      if (!workoutSessions.has(dateKey)) {
        workoutSessions.set(dateKey, []);
      }
      workoutSessions.get(dateKey).push(workout);
    }
    
    console.log(`Created ${workoutSessions.size} workout sessions`);
    
    // 2. Import workout exercises
    const workoutFiles = [
      { file: 'UpperA_1755192457880.csv', category: 'UpperA' },
      { file: 'LowerA_1755192457886.csv', category: 'LowerA' },
      { file: 'UpperB_1755192457886.csv', category: 'UpperB' },
      { file: 'LowerB_1755192457886.csv', category: 'LowerB' },
    ];
    
    let totalSets = 0;
    
    for (const { file, category } of workoutFiles) {
      console.log(`Importing ${category} exercises...`);
      const content = await fs.readFile(`../attached_assets/Workout Log CSV - ${file}`, 'utf-8');
      const exerciseData = await parseCsvContent(content);
      
      for (const entry of exerciseData) {
        const exerciseTime = parseDate(entry['Date and Time of saved exercise']);
        const exerciseName = entry['Exercise'];
        const primaryMuscle = entry['Primary Muscle Worked'];
        const trainingRecord = parseTrainingRecord(entry['Training Entry Record']);
        
        // Find the corresponding workout session
        const dateKey = exerciseTime.toISOString().split('T')[0];
        const dayWorkouts = workoutSessions.get(dateKey) || [];
        const matchingWorkout = dayWorkouts.find(w => w.category === mapWorkoutCategory(category));
        
        if (matchingWorkout && trainingRecord.length > 0) {
          // Create sets for this exercise
          for (let setIndex = 0; setIndex < trainingRecord.length; setIndex++) {
            const setData = trainingRecord[setIndex];
            
            // Handle different set formats
            let reps = 0;
            let weight = 0;
            let duration = null;
            
            if (setData.reps) reps = parseInt(setData.reps) || 0;
            if (setData.repsL) reps = parseInt(setData.repsL) || 0; // For unilateral exercises
            if (setData.weight) weight = parseFloat(setData.weight) || 0;
            if (setData.time) duration = parseInt(setData.time) || 0; // For time-based exercises like plank
            
            if (reps > 0 || duration > 0) {
              await storage.createWorkoutSet({
                workoutId: matchingWorkout.id,
                exerciseId: 'temp-exercise-id', // We'll need to create exercise entries or use a placeholder
                setNumber: setIndex + 1,
                reps: reps,
                weight: weight,
                leftReps: setData.repsL ? parseInt(setData.repsL) : null,
                rightReps: setData.repsR ? parseInt(setData.repsR) : null,
                restTime: null,
              });
              totalSets++;
            }
          }
          
          // Update workout total volume (sum of weight * reps)
          const workoutSets = await storage.getWorkoutSets(matchingWorkout.id);
          const totalVolume = workoutSets.reduce((sum, set) => 
            sum + (set.weight * set.reps), 0
          );
          
          await storage.updateWorkout(matchingWorkout.id, { totalVolume: Math.round(totalVolume) });
        }
      }
    }
    
    console.log(`Created ${totalSets} workout sets`);
    
    // 3. Import activities
    const activityFiles = [
      { file: 'ActivityLogCycling_1755192457887.csv', type: 'cycling' },
      { file: 'ActivityLogSwimming_1755192457887.csv', type: 'swimming' },
      { file: 'ActivityLogTennis_1755192457887.csv', type: 'tennis' },
    ];
    
    let totalActivities = 0;
    
    for (const { file, type } of activityFiles) {
      console.log(`Importing ${type} activities...`);
      const content = await fs.readFile(`../attached_assets/Workout Log CSV - ${file}`, 'utf-8');
      const activityData = await parseCsvContent(content);
      
      for (const entry of activityData) {
        const dateTimeField = entry['Date and Time '] || entry['Date and Time'] || '';
        console.log('Activity entry:', entry);
        console.log('DateTime field:', dateTimeField);
        const startTime = parseDate(dateTimeField);
        
        // Determine duration based on activity type and data
        let duration = 30; // default
        let metadata: any = {};
        
        switch (type) {
          case 'cycling':
            duration = Math.round(parseFloat(entry['Time']) || 30);
            metadata = {
              distance: parseFloat(entry['Distance']) || 0,
              averagePace: parseFloat(entry['Average Time per Km']) || 0,
            };
            break;
          case 'tennis':
            duration = parseInt(entry['Duration (mins)']) || 60;
            break;
          case 'swimming':
            duration = 40; // Estimate for swimming
            metadata = {
              distance: entry['Total Distance'] || '400m',
              lengths: parseInt(entry['Number of Lengths']) || 20,
              poolSize: entry['Size of Pool'] || '20m pool',
            };
            break;
        }
        
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
        
        await storage.createActivity({
          userId: user.id,
          type: type,
          name: type.charAt(0).toUpperCase() + type.slice(1),
          duration: duration,
          notes: null,
          metadata: metadata,
          startedAt: startTime,
          completedAt: endTime,
        });
        
        totalActivities++;
      }
    }
    
    console.log(`Created ${totalActivities} activities`);
    
    console.log(`Import complete! Created: ${workoutSessions.size} workouts, ${totalSets} sets, ${totalActivities} activities`);
    
    return {
      workouts: workoutSessions.size,
      sets: totalSets,
      activities: totalActivities,
    };
    
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

// Run the import
importCompleteData().then(result => {
  console.log('Final import result:', result);
}).catch(console.error);