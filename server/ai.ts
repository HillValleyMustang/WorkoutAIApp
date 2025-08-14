import { GoogleGenAI } from "@google/genai";
import type { WorkoutSet, Exercise, User, Workout } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AIProgressionSuggestion {
  sets: Array<{
    weight: number;
    reps?: number;
    repsL?: number;
    repsR?: number;
  }>;
  alternative?: string;
}

export interface AIWeeklyAdvice {
  adviceText: string;
  suggestedExercises: Array<{
    name: string;
    mainMuscle: string;
    description: string;
    tip: string;
  }>;
}

export async function getAIProgression(
  exerciseName: string,
  exerciseHistory: WorkoutSet[],
  isUnilateral: boolean,
  userProfile: User
): Promise<{ status: 'success' | 'error', suggestion?: AIProgressionSuggestion, message?: string }> {
  try {
    const profileString = userProfile ? `The user's profile is: ${JSON.stringify({
      age: userProfile.age,
      weight: userProfile.weight,
      height: userProfile.height,
      fitnessGoal: userProfile.fitnessGoal,
      healthNotes: userProfile.healthNotes,
      experience: userProfile.experience
    })}. Pay close attention to any health notes.` : '';

    const historyString = JSON.stringify(exerciseHistory.slice(-5), null, 2);

    // Common instructions for the AI
    const baseInstruction = `
      You are an expert fitness coach. ${profileString}
      Analyze their performance trend for the exercise "${exerciseName}". Their history is: ${historyString}.
      Return your response as a single, minified JSON object containing one key: "sets". The value must be an array of objects.
      Do not include any other text, explanations, or markdown formatting.
    `;

    let prompt: string;
    if (isUnilateral) {
      prompt = `${baseInstruction} Each set object must have "weight", "repsL", and "repsR" keys. Example: {"sets":[{"weight":16,"repsL":10,"repsR":10}]}`;
    } else {
      prompt = `${baseInstruction} Each set object must have "weight" and "reps" keys. Example: {"sets":[{"weight":55,"reps":8}]}`;
    }

    // Safety check for the user's health notes
    if (userProfile?.healthNotes && userProfile.healthNotes.toLowerCase().includes('back')) {
      if (/(squat|deadlift|row)/i.test(exerciseName)) {
        prompt += ` IMPORTANT: The user has a sore back. Prioritize safety. You may suggest lower weight, fewer reps, or a safer alternative exercise if appropriate. If suggesting an alternative, return it in the JSON under an "alternative" key, like {"alternative": "Suggest doing Leg Press instead to protect the back."}.`;
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Could not find suggestion text in AI response.");
    }

    const suggestionText = responseText.trim().replace(/```json/g, '').replace(/```/g, '');
    const suggestion = JSON.parse(suggestionText);
    return { status: 'success', suggestion };

  } catch (e) {
    console.error('AI Progression Error:', e);
    return { status: 'error', message: 'A critical script error occurred: ' + (e instanceof Error ? e.message : String(e)) };
  }
}

export async function getGeminiAdvice(
  workoutHistory: Workout[],
  exerciseDefinitions: Exercise[],
  userProfile: User
): Promise<{ status: 'success' | 'error', advice?: AIWeeklyAdvice, message?: string }> {
  try {
    const profileContext = userProfile ? `Here is the client's profile:\n${JSON.stringify({
      age: userProfile.age,
      weight: userProfile.weight,
      height: userProfile.height,
      fitnessGoal: userProfile.fitnessGoal,
      healthNotes: userProfile.healthNotes,
      experience: userProfile.experience
    }, null, 2)}\n\n` : '';

    const prompt = `
      You are an expert fitness coach providing a weekly check-in. Your response must be in British English.
      ${profileContext}
      **Instructions:**
      1. **Analyse Performance:** Review the user's workout history.
      2. **Suggest New Exercises:** Based on their goals and any identified weak points, suggest 1-2 new exercises.
      3. **Structure Your Response:** You MUST return a single, minified JSON object with two keys: "adviceText" and "suggestedExercises".
          - "adviceText": A string containing your written analysis, praise, and form cues, formatted with markdown. Address their health notes here.
          - "suggestedExercises": An array of JSON objects for ONLY the NEW exercises you are suggesting. Each object must have the keys: "name", "mainMuscle", "description", "tip". If you suggest no new exercises, this should be an empty array.
       **User's Workout History (JSON):**
      ${JSON.stringify(workoutHistory, null, 2)}

      **Master List of Available Exercises (JSON):**
      ${JSON.stringify(exerciseDefinitions, null, 2)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Invalid response structure from AI.");
    }

    const suggestionText = responseText.trim().replace(/```json/g, '').replace(/```/g, '');
    const structuredResponse = JSON.parse(suggestionText);

    // Validate the structure before returning
    if (structuredResponse.adviceText && Array.isArray(structuredResponse.suggestedExercises)) {
      return { status: 'success', advice: structuredResponse };
    }

    throw new Error("Invalid response structure from AI.");
  } catch (e) {
    console.error('AI Advice Error:', e);
    return { status: 'error', message: 'Critical script error: ' + (e instanceof Error ? e.message : String(e)) };
  }
}

export async function analyzeGymEquipment(
  base64Images: string[]
): Promise<{ status: 'success' | 'error', exercises?: Exercise[], message?: string }> {
  try {
    if (!base64Images || base64Images.length === 0) {
      return { status: 'error', message: 'No images were provided for analysis.' };
    }

    // Construct the parts for the multi-modal prompt
    const promptParts = [
      {
        text: `You are an expert fitness coach creating an exercise library for a user based on photos of their gym. Your response must be in British English.
        Analyse the equipment in the following images. For the key pieces of equipment (e.g., squat rack, dumbbells, cable machine, leg press), generate a list of common and effective exercises.
        For EACH exercise you identify, you MUST return a JSON object with the following exact keys: "name", "mainMuscle", "description", "tip".
        - name: The name of the exercise (e.g., "Barbell Squat").
        - mainMuscle: The primary muscle groups worked (e.g., "Quads, Glutes, Hamstrings").
        - description: A list of the primary and secondary muscles worked, formatted as HTML. Example: "<strong>Primary:</strong> Chest.<br><strong>Secondary:</strong> Shoulders, Triceps."
        - tip: A short, actionable "pro-tip".
        Return your final response as a single, minified JSON array containing all the exercise objects. Do not include any other text, explanations, or markdown formatting.
        Example: [{"name":"Dumbbell Bench Press","mainMuscle":"Chest, Shoulders, Triceps","description":"<strong>Primary:</strong> Chest, Shoulders.<br><strong>Secondary:</strong> Triceps.","tip":"Keep your shoulder blades retracted and pinched together to protect your shoulders and maximise chest activation."}]`
      }
    ];

    const imageContents = base64Images.map(imgData => ({
      inlineData: {
        data: imgData.split(',')[1], // Remove the "data:image/jpeg;base64," prefix
        mimeType: 'image/jpeg'
      }
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [{
        parts: [...promptParts, ...imageContents]
      }]
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Could not find exercise text in AI response.");
    }

    const exerciseText = responseText.trim().replace(/```json/g, '').replace(/```/g, '');
    const newExercises = JSON.parse(exerciseText);

    return { status: 'success', exercises: newExercises };
  } catch (e) {
    console.error('Equipment Analysis Error:', e);
    return { status: 'error', message: 'A critical script error occurred: ' + (e instanceof Error ? e.message : String(e)) };
  }
}