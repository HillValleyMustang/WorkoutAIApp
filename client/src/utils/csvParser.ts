// CSV Parser utility for workout and activity data

export interface ActivityEntry {
  date: string;
  type: 'cycling' | 'tennis' | 'swimming';
  name: string;
}

export interface WorkoutEntry {
  date: string;
  category: 'UpperA' | 'LowerA' | 'UpperB' | 'LowerB';
  name: string;
  duration?: string;
}

export function parseActivityDate(dateStr: string): string {
  // Handle two formats: "31/07/2025, 13:08:53" and "2025-08-09T16:38:33.605Z"
  if (dateStr.includes('T')) {
    return new Date(dateStr).toISOString().split('T')[0];
  } else {
    // Parse "31/07/2025, 13:08:53" format
    const [datePart] = dateStr.split(', ');
    const [day, month, year] = datePart.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
}

export function parseWorkoutCategory(workoutName: string): 'UpperA' | 'LowerA' | 'UpperB' | 'LowerB' {
  switch (workoutName) {
    case "Upper Body A": return "UpperA";
    case "Lower Body A": return "LowerA";
    case "Upper Body B": return "UpperB";
    case "Lower Body B": return "LowerB";
    default: return "UpperA";
  }
}

// Real CSV data from your files
export const ACTIVITY_LOG_DATA = [
  ["31/07/2025, 13:08:53", "Cycling/Sprints"],
  ["01/08/2025, 15:07:30", "Cycling/Sprints"],
  ["06/08/2025, 15:17:02", "Cycling/Sprints"],
  ["07/08/2025, 12:13:13", "Cycling/Sprints"],
  ["02/08/2025, 14:36:04", "Tennis"],
  ["04/08/2025, 14:36:04", "Tennis"],
  ["08/08/2025, 12:57:48", "Cycling/Sprints"],
  ["2025-08-09T16:38:33.605Z", "Cycling/Sprints"],
  ["09/08/2025, 19:14:18", "Swimming"],
  ["11/08/2025, 09:19:11", "Tennis"],
  ["2025-08-12T10:14:30.879Z", "Cycling/Sprints"],
  ["2025-08-12T12:05:46.085Z", "Swimming"],
  ["2025-08-14T10:46:29.537Z", "Cycling/Sprints"]
];

export const WORKOUT_DURATION_DATA = [
  ["2025-07-31T10:27:30.655Z", "Upper Body A", "65m 7s"],
  ["2025-08-01T14:39:19.303Z", "Lower Body A", "28m 32s"],
  ["2025-08-06T15:13:28.147Z", "Upper Body B", "52m 17s"],
  ["2025-08-07T12:05:30.051Z", "Lower Body B", "47m 49s"],
  ["2025-08-08T12:50:06.000Z", "Upper Body A", "47m 25s"],
  ["2025-08-09T17:25:59.290Z", "Lower Body A", "31m 2s"],
  ["2025-08-12T11:29:49.161Z", "Upper Body A", "69m 0s"],
  ["2025-08-14T11:25:34.594Z", "Lower Body A", "31m 23s"]
];

export function parseActivities(): ActivityEntry[] {
  return ACTIVITY_LOG_DATA.map(([dateStr, activityName]) => {
    const date = parseActivityDate(dateStr);
    const type = activityName.includes("Cycling") ? "cycling" : 
                 activityName === "Tennis" ? "tennis" : 
                 activityName === "Swimming" ? "swimming" : "cycling";
    const name = activityName.includes("Cycling") ? "Cycling" : activityName;
    return { date, type, name };
  });
}

export function parseWorkouts(): WorkoutEntry[] {
  return WORKOUT_DURATION_DATA.map(([dateStr, workoutName, duration]) => {
    const date = new Date(dateStr).toISOString().split('T')[0];
    const category = parseWorkoutCategory(workoutName);
    return { date, category, name: workoutName, duration };
  });
}