import { MemStorage } from './storage.js';

const exercisesData = [
  {
    name: "Incline Smith Machine Press",
    category: "UpperA",
    muscleGroups: ["Chest", "Shoulders"],
    description: "<strong>Primary:</strong> Upper Chest (Pectoralis Major), Shoulders (Anterior Deltoid).<br><strong>Secondary:</strong> Triceps.",
    tips: "Focus on a slow, controlled descent (2-3 seconds) and an explosive push up. This maximizes time under tension for muscle growth.",
    equipment: "Smith Machine",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/tLB1XtM21Fk",
    isBonus: false
  },
  {
    name: "Lat Pulldown",
    category: "UpperA",
    muscleGroups: ["Back", "Biceps"],
    description: "<strong>Primary:</strong> Back (Latissimus Dorsi).<br><strong>Secondary:</strong> Biceps, Rear Deltoids.",
    tips: "Keep your chest up and pull your elbows down and back, squeezing your shoulder blades together at the bottom of the movement.",
    equipment: "Cable Machine",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/JGeRYIZdojU",
    isBonus: false
  },
  {
    name: "Seated Dumbbell Press",
    category: "UpperA",
    muscleGroups: ["Shoulders"],
    description: "<strong>Primary:</strong> Shoulders (Deltoids).<br><strong>Secondary:</strong> Triceps, Upper Chest.",
    tips: "Don't lock your elbows at the top. Keep a slight bend to maintain constant tension on the shoulder muscles, which is key for toning.",
    equipment: "Dumbbell",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/3GFZpOYu0pQ",
    isBonus: false
  },
  {
    name: "Seated Machine Row",
    category: "UpperA",
    muscleGroups: ["Back", "Biceps"],
    description: "<strong>Primary:</strong> Mid-Back (Rhomboids, Lats).<br><strong>Secondary:</strong> Biceps, Rear Deltoids.",
    tips: "Pause for a second at the peak contraction, squeezing your back muscles hard before slowly returning to the start.",
    equipment: "Machine",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/TeFo51Q_Nsc",
    isBonus: false
  },
  {
    name: "Cable Lateral Raise",
    category: "UpperA",
    muscleGroups: ["Shoulders"],
    description: "<strong>Primary:</strong> Shoulders (Lateral Deltoid).",
    tips: "Keep the weight light and focus on form. Raise your arms as if you're pouring a jug of water, with a slight bend in your elbow.",
    equipment: "Cable",
    isUnilateral: true,
    videoUrl: "https://www.youtube.com/embed/Z5FA9aq3L6A",
    isBonus: false
  },
  {
    name: "Tricep 'Skull Crusher'",
    category: "UpperA",
    muscleGroups: ["Triceps"],
    description: "<strong>Primary:</strong> Triceps.",
    tips: "Keep your upper arms stationary and perpendicular to the floor throughout the movement to isolate the triceps effectively.",
    equipment: "Barbell",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/d_KZxkY_0cM",
    isBonus: false
  },
  {
    name: "Seated Dumbbell Flyes",
    category: "UpperA",
    muscleGroups: ["Chest"],
    description: "<strong>Primary:</strong> Chest.",
    tips: "Maintain a controlled movement throughout the exercise, focusing on squeezing your chest muscles at the top of the movement. Avoid using excessive momentum.",
    equipment: "Dumbbell",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/eozdVDA78K0",
    isBonus: false
  },
  {
    name: "Seated Bicep Curl",
    category: "UpperA",
    muscleGroups: ["Biceps"],
    description: "<strong>Primary:</strong> Biceps.",
    tips: "Avoid swinging. Control the weight on the way down (the eccentric phase) even more than on the way up to maximize muscle fiber recruitment.",
    equipment: "Dumbbell",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/BsULGO70tcU",
    isBonus: false
  },
  {
    name: "Face Pulls",
    category: "UpperA",
    muscleGroups: ["Rear Delts", "Traps"],
    description: "<strong>Primary:</strong> Rear Deltoids, Trapezius.",
    tips: "Pull the rope towards your face, aiming your hands towards your ears. Squeeze your shoulder blades together. Great for posture.",
    equipment: "Cable",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/rep-qVOkqgk",
    isBonus: true
  },
  {
    name: "Dumbbell Shrugs",
    category: "UpperA",
    muscleGroups: ["Traps"],
    description: "<strong>Primary:</strong> Trapezius.",
    tips: "Elevate your shoulders straight up towards your ears. Hold the peak contraction for a moment. Avoid rolling your shoulders.",
    equipment: "Dumbbell",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/8lP_eJvClSA",
    isBonus: true
  },
  {
    name: "Leg Press",
    category: "LowerA",
    muscleGroups: ["Quads", "Glutes"],
    description: "<strong>Primary:</strong> Quads, Glutes.<br><strong>Secondary:</strong> Hamstrings.",
    tips: "Place your feet higher on the platform to target more glutes and hamstrings; place them lower to target more quads. Never lock your knees.",
    equipment: "Machine",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/p5dCqF7wWUw",
    isBonus: false
  },
  {
    name: "Leg Extension",
    category: "LowerA",
    muscleGroups: ["Quads"],
    description: "<strong>Primary:</strong> Quads.",
    tips: "Squeeze your quads hard at the top of the movement for a 1-2 second pause. This is excellent for building definition and toning.",
    equipment: "Machine",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/4ZDm5EbiFI8",
    isBonus: false
  },
  {
    name: "Seated Hamstring Curl",
    category: "LowerA",
    muscleGroups: ["Hamstrings"],
    description: "<strong>Primary:</strong> Hamstrings.",
    tips: "Focus on a slow and controlled negative (the release phase). This is where much of the muscle growth is stimulated for hamstrings.",
    equipment: "Machine",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/ELOCsoDSmrg",
    isBonus: false
  },
  {
    name: "Hip Adduction",
    category: "LowerA",
    muscleGroups: ["Inner Thighs"],
    description: "<strong>Primary:</strong> Inner Thighs (Adductors).",
    tips: "Use a full range of motion. Control the weight as your legs move apart to get a good stretch on the inner thigh muscles.",
    equipment: "Machine",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/CjAVezAggkI",
    isBonus: false
  },
  {
    name: "Hip Abduction",
    category: "LowerA",
    muscleGroups: ["Outer Glutes"],
    description: "<strong>Primary:</strong> Outer Glutes (Gluteus Medius).",
    tips: "Lean forward slightly with your torso and squeeze your glutes at the point of maximum contraction to better engage the target muscles.",
    equipment: "Machine",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/G_8LItOiZ0Q",
    isBonus: false
  },
  {
    name: "Calf Raise on Leg Press",
    category: "LowerA",
    muscleGroups: ["Calves"],
    description: "<strong>Primary:</strong> Calves (Gastrocnemius).",
    tips: "Pause and squeeze at the very top of the movement, and get a deep stretch at the bottom. Don't bounce the weight.",
    equipment: "Machine",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/dhRz1Ns60Zg",
    isBonus: false
  },
  {
    name: "Cable Crunches",
    category: "LowerA",
    muscleGroups: ["Abs"],
    description: "<strong>Primary:</strong> Abdominals.",
    tips: "Focus on curling your spine and bringing your elbows towards your knees. Squeeze your abs hard at the bottom.",
    equipment: "Cable",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/3qjoXDTuyOE",
    isBonus: true
  },
  {
    name: "Plank",
    category: "LowerA",
    muscleGroups: ["Core"],
    description: "<strong>Primary:</strong> Core (Abs, Obliques, Lower Back).",
    tips: "Keep your body in a straight line from head to heels. Brace your core as if you're about to be punched in the stomach. Hold for time (e.g., 30-60 seconds).",
    equipment: "Bodyweight",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw",
    isBonus: true,
    type: "timed"
  },
  {
    name: "Assisted Pull-up",
    category: "UpperB",
    muscleGroups: ["Back", "Biceps"],
    description: "<strong>Primary:</strong> Back (Latissimus Dorsi).<br><strong>Secondary:</strong> Biceps.",
    tips: "Focus on driving your elbows down to lift your body. As you get stronger, reduce the assistance weight.",
    equipment: "Machine",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/wFj808u2HWU",
    isBonus: false
  },
  {
    name: "Flat Dumbbell Bench Press",
    category: "UpperB",
    muscleGroups: ["Chest"],
    description: "<strong>Primary:</strong> Chest (Pectoralis Major).<br><strong>Secondary:</strong> Shoulders, Triceps.",
    tips: "Bring the dumbbells down to the sides of your chest, not straight over your shoulders. This protects your joints and maximizes chest activation.",
    equipment: "Dumbbell",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/YwrzZaNqJWU",
    isBonus: false
  },
  {
    name: "Chest-Supported Row",
    category: "UpperB",
    muscleGroups: ["Back", "Biceps"],
    description: "<strong>Primary:</strong> Upper & Mid-Back (Trapezius, Rhomboids).<br><strong>Secondary:</strong> Biceps, Rear Deltoids.",
    tips: "Focus on pulling with your elbows and squeezing your shoulder blades together. The chest support helps you isolate the back muscles.",
    equipment: "Machine",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/LuWGKt8B_7o",
    isBonus: false
  },
  {
    name: "Pec Deck Fly",
    category: "UpperB",
    muscleGroups: ["Chest"],
    description: "<strong>Primary:</strong> Chest (Pectoralis Major).",
    tips: "Imagine you are hugging a large tree. Keep a slight bend in your elbows and focus on squeezing your chest muscles to bring the handles together.",
    equipment: "Machine",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/jiitI2ma3J4",
    isBonus: false
  },
  {
    name: "Rear Delt Fly",
    category: "UpperB",
    muscleGroups: ["Shoulders"],
    description: "<strong>Primary:</strong> Rear Shoulders (Posterior Deltoids).<br><strong>Secondary:</strong> Upper Back.",
    tips: "Keep the weight light and focus on squeezing your rear delts. Don't use momentum; the movement should be slow and controlled.",
    equipment: "Machine",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/1jpBatm8RYw",
    isBonus: false
  },
  {
    name: "Assisted Dips",
    category: "UpperB",
    muscleGroups: ["Triceps", "Chest"],
    description: "<strong>Primary:</strong> Triceps.<br><strong>Secondary:</strong> Chest, Shoulders.",
    tips: "To target the triceps more, keep your torso as upright as possible. To target the chest more, lean your body forward.",
    equipment: "Machine",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/kbmVlw-i0Vs",
    isBonus: false
  },
  {
    name: "Kneeling Single-Arm Row",
    category: "UpperB",
    muscleGroups: ["Back", "Biceps"],
    description: "<strong>Primary:</strong> Back (Lats).<br><strong>Secondary:</strong> Biceps.",
    tips: "Pull the handle towards your hip, not your chest. This helps to better engage the latissimus dorsi muscle for a wider back.",
    equipment: "Cable",
    isUnilateral: true,
    videoUrl: "https://www.youtube.com/embed/pYcpY20QaE8",
    isBonus: false
  },
  {
    name: "Cable Bicep Curl",
    category: "UpperB",
    muscleGroups: ["Biceps"],
    description: "<strong>Primary:</strong> Biceps.",
    tips: "Cables provide constant tension. Squeeze at the top and control the negative for a great pump.",
    equipment: "Cable",
    isUnilateral: true,
    videoUrl: "https://www.youtube.com/embed/NFzTWp2qpiE",
    isBonus: true
  },
  {
    name: "Tricep Rope Pushdown",
    category: "UpperB",
    muscleGroups: ["Triceps"],
    description: "<strong>Primary:</strong> Triceps.",
    tips: "At the bottom of the movement, separate the rope handles to fully engage all three heads of the triceps.",
    equipment: "Cable",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/2-LAMcpzODU",
    isBonus: true
  },
  {
    name: "Smith Machine Lunge",
    category: "LowerB",
    muscleGroups: ["Glutes", "Quads"],
    description: "<strong>Primary:</strong> Glutes, Quads.<br><strong>Secondary:</strong> Hamstrings.",
    tips: "Focus on pushing through the heel of your front foot to maximize glute activation. Keep your torso upright to protect your back.",
    equipment: "Smith Machine",
    isUnilateral: true,
    videoUrl: "https://www.youtube.com/embed/qY7Yo0x5mhE",
    isBonus: false
  },
  {
    name: "Leg Press (Narrow Stance)",
    category: "LowerB",
    muscleGroups: ["Quads"],
    description: "<strong>Primary:</strong> Outer Quads (Vastus Lateralis).<br><strong>Secondary:</strong> Glutes.",
    tips: "A narrower stance on the leg press platform helps to emphasize the outer sweep of your quadriceps.",
    equipment: "Machine",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/IZxyjW7MPJQ",
    isBonus: false
  },
  {
    name: "Cable Glute Kickback",
    category: "LowerB",
    muscleGroups: ["Glutes"],
    description: "<strong>Primary:</strong> Glutes (Gluteus Maximus).",
    tips: "Squeeze your glute hard at the top of the kickback for a full second. Don't just swing your leg; control the movement.",
    equipment: "Cable",
    isUnilateral: true,
    videoUrl: "https://www.youtube.com/embed/SqO-VUEak2M",
    isBonus: false
  },
  {
    name: "Calf Raise on Smith Machine",
    category: "LowerB",
    muscleGroups: ["Calves"],
    description: "<strong>Primary:</strong> Calves.",
    tips: "Place the balls of your feet on a small platform or weight plate to allow for a deeper stretch at the bottom of the movement.",
    equipment: "Smith Machine",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/FNdI5TynYxs",
    isBonus: false
  },
  {
    name: "Hanging Leg Raises",
    category: "LowerB",
    muscleGroups: ["Abs", "Core"],
    description: "<strong>Primary:</strong> Lower Abs, Hip Flexors.",
    tips: "Try to raise your legs without swinging. If it's too hard, start with bent-knee raises.",
    equipment: "Pull-up Bar",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/Pr1ieGZ5atk",
    isBonus: true
  },
  {
    name: "Seated Calf Raise",
    category: "LowerB",
    muscleGroups: ["Calves"],
    description: "<strong>Primary:</strong> Calves (Soleus).",
    tips: "This targets the lower part of the calf. Use the same principles: pause at the top, deep stretch at the bottom.",
    equipment: "Machine",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/YMmgqO8Jo-k",
    isBonus: true
  },
  {
    name: "Concentration Curl",
    category: "UpperB",
    muscleGroups: ["Biceps"],
    description: "Sit on a bench holding a dumbbell in one hand, resting your elbow on the inside of your thigh, and curl the weight upwards.",
    tips: "Keep your elbow tucked in throughout the movement to maximize bicep engagement.",
    equipment: "Dumbbell",
    isUnilateral: true,
    videoUrl: "https://www.youtube.com/embed/VMbDQ8PZazY",
    isBonus: false
  },
  {
    name: "Hammer Curl",
    category: "UpperB",
    muscleGroups: ["Biceps"],
    description: "Stand holding a dumbbell in each hand with palms facing each other and curl the weights upwards, keeping palms facing each other.",
    tips: "Focus on controlled movement and avoid using momentum to lift the weights.",
    equipment: "Dumbbell",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/zC3nLlEvin4",
    isBonus: false
  },
  {
    name: "Preacher Curl",
    category: "UpperB",
    muscleGroups: ["Biceps"],
    description: "Sit at a preacher curl bench, place your upper arms against the pad, and curl the weight upwards, focusing on the peak contraction.",
    tips: "Control the negative (lowering) portion of the lift to maximize bicep engagement.",
    equipment: "Barbell",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/fIWP-FRFNU0",
    isBonus: false
  },
  {
    name: "Decline Push-up",
    category: "UpperB",
    muscleGroups: ["Chest", "Shoulders", "Triceps"],
    description: "Perform a push-up with your feet elevated on a bench or chair, increasing the stretch on your chest muscles.",
    tips: "Maintain a straight line from head to heels throughout the movement; avoid sagging in the mid-section.",
    equipment: "Bodyweight",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/QBlYp-EwHlo",
    isBonus: false
  },
  {
    name: "Cable Chest Flyes",
    category: "UpperB",
    muscleGroups: ["Chest"],
    description: "With your back straight, pull the handles inwards across your body, squeezing your pectoral muscles at the end of the movement.",
    tips: "Focus on a controlled movement and full range of motion to target the chest muscles fully.",
    equipment: "Cable",
    isUnilateral: false,
    videoUrl: "https://www.youtube.com/embed/T7unVbaT7bM",
    isBonus: false
  }
];

export async function importExercisesFromSpreadsheet() {
  const storage = new MemStorage();
  
  console.log(`Importing ${exercisesData.length} exercises from spreadsheet...`);
  
  let imported = 0;
  for (const exerciseData of exercisesData) {
    try {
      const exercise = {
        name: exerciseData.name,
        category: exerciseData.category,
        muscleGroups: exerciseData.muscleGroups,
        instructions: exerciseData.description || null,
        tips: exerciseData.tips || null,
        equipment: exerciseData.equipment || null,
        isUnilateral: exerciseData.isUnilateral || false,
      };
      
      await storage.createExercise(exercise);
      imported++;
      console.log(`✓ Imported: ${exercise.name} (${exercise.category})`);
    } catch (error) {
      console.error(`✗ Failed to import ${exerciseData.name}:`, error);
    }
  }
  
  console.log(`Import complete: ${imported}/${exercisesData.length} exercises imported successfully.`);
  return imported;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  importExercisesFromSpreadsheet().catch(console.error);
}