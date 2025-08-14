import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export function usePersonalRecords() {
  const { user } = useAuth();

  const { data: personalRecords = [] } = useQuery({
    queryKey: ['/api/personal-records'],
    enabled: !!user,
  });

  const checkIfPR = (exerciseId: string, weight: number, reps: number): boolean => {
    const volume = weight * reps;
    const existingPR = personalRecords.find(pr => pr.exerciseId === exerciseId);
    return !existingPR || volume > existingPR.volume;
  };

  const getPersonalRecord = (exerciseId: string) => {
    return personalRecords.find(pr => pr.exerciseId === exerciseId);
  };

  return { checkIfPR, getPersonalRecord, personalRecords };
}