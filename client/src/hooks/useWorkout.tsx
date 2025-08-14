import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiRequest } from '@/lib/queryClient';

interface WorkoutSet {
  exerciseId: string;
  weight: number;
  reps: number;
  leftReps?: number;
  rightReps?: number;
  setNumber: number;
}

interface ActiveWorkout {
  id: string;
  category: string;
  startedAt: Date;
  sets: WorkoutSet[];
  currentExerciseIndex: number;
}

export function useWorkout() {
  const { user } = useAuth();
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);

  // Load active workout from API on mount
  const { data: workouts = [], refetch: refetchWorkouts } = useQuery({
    queryKey: ['/api/workouts'],
    enabled: !!user,
  }) as { data: any[], refetch: () => void };

  useEffect(() => {
    if (workouts.length > 0) {
      // Find the most recent active workout (not completed)
      const activeWorkoutFromAPI = workouts.find((w: any) => !w.completedAt);
      if (activeWorkoutFromAPI) {
        console.log('Found active workout from API:', activeWorkoutFromAPI);
        setActiveWorkout({
          id: activeWorkoutFromAPI.id,
          category: activeWorkoutFromAPI.category,
          startedAt: new Date(activeWorkoutFromAPI.startedAt),
          sets: [],
          currentExerciseIndex: 0,
        });
      }
    }
  }, [workouts]);

  const startWorkout = useCallback(async (category: string) => {
    if (!user) return;

    try {
      console.log('Starting workout for user:', user.uid);
      const response = await apiRequest('POST', '/api/workouts', { category });
      
      if (!response.ok) {
        throw new Error(`Failed to create workout: ${response.statusText}`);
      }
      
      const workout = await response.json();
      console.log('Workout created:', workout);
      
      const newActiveWorkout = {
        id: workout.id,
        category: workout.category,
        startedAt: workout.startedAt ? new Date(workout.startedAt) : new Date(),
        sets: [],
        currentExerciseIndex: 0,
      };
      
      setActiveWorkout(newActiveWorkout);
      console.log('Active workout set:', newActiveWorkout);
      
      // Refetch workouts to ensure the latest data is loaded
      await refetchWorkouts();
      
      return workout;
    } catch (error) {
      console.error('Failed to start workout:', error);
      throw error;
    }
  }, [user]);

  const addSet = useCallback(async (set: Omit<WorkoutSet, 'setNumber'>) => {
    if (!activeWorkout || !user) return;

    try {
      const setNumber = activeWorkout.sets.filter(s => s.exerciseId === set.exerciseId).length + 1;
      const newSet = { ...set, setNumber };
      
      const response = await apiRequest('POST', `/api/workouts/${activeWorkout.id}/sets`, newSet);
      const savedSet = await response.json();
      
      setActiveWorkout(prev => prev ? {
        ...prev,
        sets: [...prev.sets, newSet],
      } : null);

      // Start rest timer
      setRestTimer(150); // 2:30 default
      setIsResting(true);

      return savedSet;
    } catch (error) {
      console.error('Failed to add set:', error);
      throw new Error('Failed to save set');
    }
  }, [activeWorkout, user]);

  const finishWorkout = useCallback(async () => {
    if (!activeWorkout || !user) return;

    try {
      const duration = Math.floor((Date.now() - activeWorkout.startedAt.getTime()) / 60000);
      const totalVolume = activeWorkout.sets.reduce((sum, set) => 
        sum + (set.weight * set.reps), 0
      );

      await apiRequest('PUT', `/api/workouts/${activeWorkout.id}`, {
        completedAt: new Date().toISOString(),
        duration,
        totalVolume,
      });

      setActiveWorkout(null);
      setIsResting(false);
      setRestTimer(0);
    } catch (error) {
      console.error('Failed to finish workout:', error);
      throw new Error('Failed to finish workout');
    }
  }, [activeWorkout, user]);

  const startRestTimer = useCallback((seconds: number = 150) => {
    setRestTimer(seconds);
    setIsResting(true);
  }, []);

  const skipRest = useCallback(() => {
    setRestTimer(0);
    setIsResting(false);
  }, []);

  // Rest timer countdown
  useEffect(() => {
    if (restTimer > 0 && isResting) {
      const interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [restTimer, isResting]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const workoutDuration = activeWorkout 
    ? Math.floor((Date.now() - activeWorkout.startedAt.getTime()) / 1000)
    : 0;

  return {
    activeWorkout,
    startWorkout,
    addSet,
    finishWorkout,
    restTimer,
    isResting,
    startRestTimer,
    skipRest,
    formatTime,
    workoutDuration: formatTime(workoutDuration),
  };
}
