import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SetInputProps {
  setNumber: number;
  exerciseName: string;
  isUnilateral?: boolean;
  lastPerformance?: {
    weight: number;
    reps: number;
    leftReps?: number;
    rightReps?: number;
  };
  onComplete: (set: {
    weight: number;
    reps: number;
    leftReps?: number;
    rightReps?: number;
  }) => void;
  isCompleted?: boolean;
  completedData?: any;
}

export default function SetInput({ 
  setNumber, 
  exerciseName, 
  isUnilateral, 
  lastPerformance, 
  onComplete, 
  isCompleted,
  completedData 
}: SetInputProps) {
  const [weight, setWeight] = useState(lastPerformance?.weight?.toString() || '');
  const [reps, setReps] = useState(lastPerformance?.reps?.toString() || '');
  const [leftReps, setLeftReps] = useState(lastPerformance?.leftReps?.toString() || '');
  const [rightReps, setRightReps] = useState(lastPerformance?.rightReps?.toString() || '');

  const handleComplete = () => {
    const setData = {
      weight: parseFloat(weight),
      reps: isUnilateral ? 0 : parseInt(reps),
      ...(isUnilateral && {
        leftReps: parseInt(leftReps),
        rightReps: parseInt(rightReps),
      }),
    };

    onComplete(setData);
  };

  const isValid = weight && (isUnilateral ? (leftReps && rightReps) : reps);

  if (isCompleted && completedData) {
    return (
      <div className="flex items-center space-x-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <span className="w-12 text-center font-medium text-green-700">Set {setNumber}</span>
        <div className="flex items-center space-x-2">
          <span className="font-medium text-green-800">{completedData.weight}kg</span>
          <span className="text-green-600">×</span>
          {isUnilateral ? (
            <span className="font-medium text-green-800">
              {completedData.leftReps}/{completedData.rightReps}
            </span>
          ) : (
            <span className="font-medium text-green-800">{completedData.reps}</span>
          )}
          <span className="text-green-600">reps</span>
        </div>
        <div className="flex-1"></div>
        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <i className="fas fa-check mr-1"></i>
          Complete
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 p-3 border-2 border-dashed border-gray-200 rounded-lg">
      <span className="w-12 text-center font-medium text-gray-700">Set {setNumber}</span>
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          placeholder="Weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-20 text-center"
          step="0.5"
        />
        <span className="text-gray-500">kg ×</span>
        
        {isUnilateral ? (
          <div className="flex items-center space-x-1">
            <Input
              type="number"
              placeholder="L"
              value={leftReps}
              onChange={(e) => setLeftReps(e.target.value)}
              className="w-12 text-center text-xs"
            />
            <span className="text-gray-400">/</span>
            <Input
              type="number"
              placeholder="R"
              value={rightReps}
              onChange={(e) => setRightReps(e.target.value)}
              className="w-12 text-center text-xs"
            />
          </div>
        ) : (
          <Input
            type="number"
            placeholder="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-16 text-center"
          />
        )}
        <span className="text-gray-500">reps</span>
      </div>
      
      <Button
        onClick={handleComplete}
        disabled={!isValid}
        className={isValid ? "bg-green-500 hover:bg-green-600" : ""}
      >
        <i className="fas fa-check mr-1"></i>
        Complete
      </Button>
    </div>
  );
}
