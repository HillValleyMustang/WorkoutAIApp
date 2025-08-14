import { db } from "./db";
import * as schema from "@shared/schema";
import * as fs from "fs";
import { parse } from "csv-parse/sync";

async function importCorrectedTennis() {
  try {
    const USER_ID = 'd0abf2e6-b63d-4993-abd1-813377ba8363';
    
    // Read the corrected tennis CSV
    const csvPath = '../attached_assets/Workout Log CSV - ActivityLogTennis (2)_1755194187431.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, { 
      columns: true, 
      skip_empty_lines: true,
      trim: true 
    });
    
    console.log('Importing corrected tennis data...');
    
    for (const entry of records) {
      console.log('Processing tennis entry:', entry);
      
      const dateTimeStr = entry['Date and Time '].trim();
      const duration = parseInt(entry['Duration (mins)']) || 60;
      
      // Parse the date string (DD/MM/YYYY HH:MM:SS format)
      const [datePart, timePart] = dateTimeStr.split(', ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes, seconds] = timePart.split(':');
      
      const startedAt = new Date(
        parseInt(year), 
        parseInt(month) - 1, // Month is 0-indexed
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds)
      );
      
      const completedAt = new Date(startedAt.getTime() + duration * 60 * 1000);
      
      console.log(`Creating tennis activity for ${startedAt.toISOString()}`);
      
      await db.insert(schema.activities).values({
        userId: USER_ID,
        type: 'tennis',
        name: 'Tennis',
        duration: duration,
        notes: null,
        metadata: {},
        startedAt: startedAt,
        completedAt: completedAt
      });
    }
    
    console.log('Corrected tennis data imported successfully!');
    
  } catch (error) {
    console.error('Import failed:', error);
  }
}

importCorrectedTennis();
