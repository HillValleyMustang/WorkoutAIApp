import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp } from 'lucide-react';

interface AIProgressionSuggestionProps {
  exerciseId: string;
  exerciseName: string;
  onSuggestionApplied: (sets: any[]) => void;
}

export default function AIProgressionSuggestion({ 
  exerciseId, 
  exerciseName, 
  onSuggestionApplied 
}: AIProgressionSuggestionProps) {
  const [suggestion, setSuggestion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getSuggestion = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ai/progression/${exerciseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await (await fetch('/api/auth/token')).text()}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setSuggestion(data.suggestion);
        }
      }
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = () => {
    if (suggestion?.sets) {
      onSuggestionApplied(suggestion.sets);
      setSuggestion(null);
    }
  };

  return (
    <div className="space-y-2">
      {!suggestion ? (
        <Button
          variant="outline"
          size="sm"
          onClick={getSuggestion}
          disabled={isLoading}
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? 'Getting AI suggestion...' : 'Get AI suggestion'}
        </Button>
      ) : (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">AI Suggestion</span>
              <Badge variant="secondary" className="ml-2">Progression</Badge>
            </div>
            <Button
              size="sm"
              onClick={applySuggestion}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Apply
            </Button>
          </div>
          
          <div className="space-y-1">
            {suggestion.sets.map((set: any, index: number) => (
              <div key={index} className="text-sm text-gray-700">
                Set {index + 1}: {set.weight}kg × {set.reps} reps
              </div>
            ))}
          </div>
          
          {suggestion.alternative && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <strong>Safety Note:</strong> {suggestion.alternative}
            </div>
          )}
        </div>
      )}
    </div>
  );
}