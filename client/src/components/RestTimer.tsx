import { Button } from '@/components/ui/button';

interface RestTimerProps {
  timeLeft: number;
  isActive: boolean;
  onStart: (seconds?: number) => void;
  onSkip: () => void;
  formatTime: (seconds: number) => string;
}

export default function RestTimer({ timeLeft, isActive, onStart, onSkip, formatTime }: RestTimerProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="text-center">
        <h3 className="font-semibold text-gray-900 mb-2">Rest Timer</h3>
        <div className={`text-4xl font-bold mb-4 ${isActive ? 'text-orange-500' : 'text-upper-a'}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="flex justify-center space-x-4">
          {!isActive ? (
            <Button
              onClick={() => onStart(150)}
              className="bg-upper-a hover:bg-blue-600"
            >
              <i className="fas fa-play mr-2"></i>
              Start Rest
            </Button>
          ) : (
            <Button
              onClick={onSkip}
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              <i className="fas fa-forward mr-2"></i>
              Skip Rest
            </Button>
          )}
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStart(60)}
              disabled={isActive}
            >
              1:00
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStart(90)}
              disabled={isActive}
            >
              1:30
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStart(180)}
              disabled={isActive}
            >
              3:00
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
