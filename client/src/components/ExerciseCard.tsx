import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type Exercise } from '@shared/schema';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  completedSets: any[];
  onSetComplete: (setData: any) => void;
  isBonus?: boolean;
}

interface SetInputs {
  weight: string;
  reps: string;
  leftReps?: string;
  rightReps?: string;
}

export default function ExerciseCard({ 
  exercise, 
  index, 
  completedSets, 
  onSetComplete, 
  isBonus = false 
}: ExerciseCardProps) {
  const [sets, setSets] = useState<SetInputs[]>([
    { weight: '', reps: '', leftReps: '', rightReps: '' },
    { weight: '', reps: '', leftReps: '', rightReps: '' },
    { weight: '', reps: '', leftReps: '', rightReps: '' },
    { weight: '', reps: '', leftReps: '', rightReps: '' }
  ]);

  const [activeTab, setActiveTab] = useState('history');

  const handleSetChange = (setIndex: number, field: keyof SetInputs, value: string) => {
    setSets(prev => prev.map((set, i) => 
      i === setIndex ? { ...set, [field]: value } : set
    ));
  };

  const handleAddSet = () => {
    setSets(prev => [...prev, { weight: '', reps: '', leftReps: '', rightReps: '' }]);
  };

  const handleSuggest = (suggestedSets: any[]) => {
    // Apply AI suggestions to the current sets
    const newSets = [...sets];
    suggestedSets.forEach((suggestion, index) => {
      if (index < newSets.length) {
        newSets[index] = {
          ...newSets[index],
          weight: suggestion.weight.toString(),
          reps: suggestion.reps ? suggestion.reps.toString() : '',
          leftReps: suggestion.repsL ? suggestion.repsL.toString() : '',
          rightReps: suggestion.repsR ? suggestion.repsR.toString() : '',
        };
      }
    });
    setSets(newSets);
  };

  const handleSave = () => {
    // Save all sets for this exercise with animation and haptic feedback
    let hasPR = false;
    const completedSets: any[] = [];
    
    sets.forEach((set, index) => {
      if (set.weight && (set.reps || (set.leftReps && set.rightReps))) {
        const weight = parseFloat(set.weight) || 0;
        const reps = exercise.isUnilateral ? 0 : (parseInt(set.reps) || 0);
        const leftReps = exercise.isUnilateral ? (parseInt(set.leftReps) || 0) : undefined;
        const rightReps = exercise.isUnilateral ? (parseInt(set.rightReps) || 0) : undefined;
        
        const setData = {
          setNumber: index + 1,
          weight,
          reps,
          leftReps,
          rightReps,
        };
        
        completedSets.push(setData);
        onSetComplete(setData);
        
        // Check for PR (volume-based for now)
        const volume = weight * (reps || Math.min(leftReps || 0, rightReps || 0));
        // This would normally check against real PR data
        if (volume > 100) { // Mock PR threshold
          hasPR = true;
        }
      }
    });
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    // Visual feedback - flash green and show PR if applicable
    const cardElement = document.querySelector(`[data-exercise-id="${exercise.id}"]`);
    if (cardElement) {
      cardElement.classList.add('flash-save');
      setTimeout(() => {
        cardElement.classList.remove('flash-save');
      }, 1000);
    }
    
    // Clear the sets after saving
    setSets([
      { weight: '', reps: '', leftReps: '', rightReps: '' },
      { weight: '', reps: '', leftReps: '', rightReps: '' },
      { weight: '', reps: '', leftReps: '', rightReps: '' },
      { weight: '', reps: '', leftReps: '', rightReps: '' }
    ]);
  };

  const getLastSetData = (setIndex: number) => {
    // This would be replaced with real data from useLastWorkout hook
    // For now showing example of how the hint should look
    const mockLastSets = [
      { weight: 30, reps: 12 },
      { weight: 35, reps: 9 },
      { weight: 35, reps: 10 },
      { weight: 35, reps: 6 }
    ];
    const lastSet = mockLastSets[setIndex];
    return lastSet ? `Last: ${lastSet.weight}kg x ${lastSet.reps}` : '';
  };

  return (
    <Card 
      className={`${isBonus ? 'border-gray-300' : 'border-gray-200'} shadow-sm transition-all duration-300`}
      data-exercise-id={exercise.id}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {isBonus && 'Bonus: '}{index}. {exercise.name.replace('Bonus: ', '')}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {exercise.muscleGroups?.join(', ')}
            </p>
          </div>
          {!isBonus && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              Manage Exercises
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mt-4">
          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            size="sm"
            className="text-blue-600"
            onClick={() => setActiveTab('history')}
          >
            History
          </Button>
          <Button
            variant={activeTab === 'info' ? 'default' : 'outline'}
            size="sm"
            className="text-blue-600"
            onClick={() => setActiveTab('info')}
          >
            Info
          </Button>
          <Button
            variant={activeTab === 'swap' ? 'default' : 'outline'}
            size="sm"
            className="text-blue-600"
            onClick={() => setActiveTab('swap')}
          >
            Swap
          </Button>
          <Button
            variant={activeTab === 'timer' ? 'default' : 'outline'}
            size="sm"
            className="text-blue-600"
            onClick={() => setActiveTab('timer')}
          >
            Timer
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {(activeTab === 'workout' || activeTab === 'history') && (
          <div className="space-y-4">
            {/* Sets */}
            {sets.map((set, setIndex) => (
              <div key={setIndex} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Set {setIndex + 1}</span>
                  <div className="flex items-center space-x-2">
                    {exercise.isUnilateral ? (
                      <>
                        <Input
                          type="number"
                          placeholder="kg"
                          value={set.weight}
                          onChange={(e) => handleSetChange(setIndex, 'weight', e.target.value)}
                          className="w-20 text-center"
                        />
                        <span>x</span>
                        <Input
                          type="number"
                          placeholder="L reps"
                          value={set.leftReps}
                          onChange={(e) => handleSetChange(setIndex, 'leftReps', e.target.value)}
                          className="w-20 text-center"
                        />
                        <span>/</span>
                        <Input
                          type="number"
                          placeholder="R reps"
                          value={set.rightReps}
                          onChange={(e) => handleSetChange(setIndex, 'rightReps', e.target.value)}
                          className="w-20 text-center"
                        />
                      </>
                    ) : (
                      <>
                        <Input
                          type="number"
                          placeholder="kg"
                          value={set.weight}
                          onChange={(e) => handleSetChange(setIndex, 'weight', e.target.value)}
                          className="w-20 text-center"
                        />
                        <span>x</span>
                        <Input
                          type="number"
                          placeholder="reps"
                          value={set.reps}
                          onChange={(e) => handleSetChange(setIndex, 'reps', e.target.value)}
                          className="w-20 text-center"
                        />
                      </>
                    )}
                  </div>
                </div>
                {getLastSetData(setIndex) && (
                  <p className="text-sm text-gray-500 text-right italic">
                    Last: {getLastSetData(setIndex)}
                  </p>
                )}
              </div>
            ))}

            {/* Controls */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Controls</h4>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSuggest}
                    className="text-blue-600 border-blue-600"
                  >
                    <i className="fas fa-lightbulb mr-2"></i>
                    Suggest
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddSet}
                    className="text-blue-600"
                  >
                    Add Set
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={handleSave}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Save
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-4">
            <div 
              className="text-sm text-gray-700" 
              dangerouslySetInnerHTML={{ __html: exercise.instructions }}
            />
            {exercise.tips && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> {exercise.tips}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Previous workout data will appear here</p>
          </div>
        )}

        {activeTab === 'swap' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Exercise alternatives will appear here</p>
          </div>
        )}

        {activeTab === 'timer' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Rest timer will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}