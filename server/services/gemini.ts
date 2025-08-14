import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || ""
});

interface WorkoutProgression {
  status: string;
  suggestion: {
    sets: Array<{
      weight: number;
      reps: number;
    }>;
    tips?: string;
    reasoning?: string;
  };
}

interface EquipmentAnalysis {
  status: string;
  exercises: Array<{
    name: string;
    muscle: string;
    equipment: string;
    difficulty: string;
  }>;
  recommendations?: string;
}

export async function getAIProgression(
  exerciseName: string,
  history: any[],
  category: string,
  userProfile: {
    experience?: string;
    healthNotes?: string;
    goals?: string[];
  }
): Promise<WorkoutProgression> {
  try {
    const systemPrompt = `You are an expert fitness coach providing workout progression advice.
    
User Profile:
- Experience Level: ${userProfile.experience || 'intermediate'}
- Health Notes: ${userProfile.healthNotes || 'None'}
- Goals: ${userProfile.goals?.join(', ') || 'General fitness'}

Exercise: ${exerciseName}
Category: ${category}
Previous Performance: ${JSON.stringify(history)}

Provide progression advice with specific weight and rep recommendations for the next 3 sets.
Consider the user's experience level, any health limitations, and progressive overload principles.

Respond in JSON format:
{
  "status": "success",
  "suggestion": {
    "sets": [
      {"weight": number, "reps": number},
      {"weight": number, "reps": number},
      {"weight": number, "reps": number}
    ],
    "tips": "specific coaching tip",
    "reasoning": "explanation for the progression"
  }
}`;

    const prompt = `Based on the exercise history and user profile, suggest the next workout progression for ${exerciseName}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            status: { type: "string" },
            suggestion: {
              type: "object",
              properties: {
                sets: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      weight: { type: "number" },
                      reps: { type: "number" }
                    },
                    required: ["weight", "reps"]
                  }
                },
                tips: { type: "string" },
                reasoning: { type: "string" }
              },
              required: ["sets"]
            }
          },
          required: ["status", "suggestion"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("AI progression error:", error);
    return {
      status: "error",
      suggestion: {
        sets: [
          { weight: 0, reps: 8 },
          { weight: 0, reps: 8 },
          { weight: 0, reps: 8 }
        ],
        tips: "Unable to generate AI suggestion. Please consult with a fitness professional.",
        reasoning: "AI service unavailable"
      }
    };
  }
}

export async function analyzeGymEquipment(files: Express.Multer.File[]): Promise<EquipmentAnalysis> {
  try {
    const systemPrompt = `You are an expert fitness equipment analyst. 
    Analyze the gym equipment shown in these images and identify exercises that can be performed.
    
    For each piece of equipment identified, suggest 2-3 exercises with:
    - Exercise name
    - Primary muscle group targeted
    - Equipment name
    - Difficulty level (Beginner/Intermediate/Advanced)
    
    Respond in JSON format:
    {
      "status": "success",
      "exercises": [
        {
          "name": "exercise name",
          "muscle": "primary muscle group",
          "equipment": "equipment name",
          "difficulty": "difficulty level"
        }
      ],
      "recommendations": "general recommendations for using this equipment"
    }`;

    const contents = files.map(file => ({
      inlineData: {
        data: file.buffer.toString("base64"),
        mimeType: file.mimetype,
      },
    }));

    // Add text instruction as a separate content item
    const textContent = { text: "Analyze all the gym equipment shown in these images and suggest exercises that can be performed with this equipment." };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            status: { type: "string" },
            exercises: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  muscle: { type: "string" },
                  equipment: { type: "string" },
                  difficulty: { type: "string" }
                },
                required: ["name", "muscle", "equipment", "difficulty"]
              }
            },
            recommendations: { type: "string" }
          },
          required: ["status", "exercises"]
        }
      },
      contents: [...contents, textContent],
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Equipment analysis error:", error);
    return {
      status: "error",
      exercises: [],
      recommendations: "Unable to analyze equipment. Please try again or consult with a fitness professional."
    };
  }
}

export async function generateWorkoutInsight(
  userId: string,
  recentWorkouts: any[],
  userProfile: any
): Promise<string> {
  try {
    const systemPrompt = `You are an AI fitness coach providing personalized insights.
    
User Profile: ${JSON.stringify(userProfile)}
Recent Workouts: ${JSON.stringify(recentWorkouts)}

Provide a brief, encouraging insight about the user's progress, form tips, or suggestions for improvement.
Keep it under 150 characters and make it actionable.`;

    const prompt = "Generate a personalized fitness insight for this user based on their recent activity.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return response.text || "Keep up the great work with your fitness journey!";
  } catch (error) {
    console.error("Insight generation error:", error);
    return "Stay consistent with your workouts and focus on proper form!";
  }
}
