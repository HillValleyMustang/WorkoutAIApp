import { useWorkout } from '@/hooks/useWorkout';
import { useLocation } from 'wouter';

interface WorkoutTypeCardProps {
  type: 'UpperA' | 'LowerA' | 'UpperB' | 'LowerB';
  name: string;
  muscles: string;
  lastWorkout: string;
  onStart: (type: string) => void;
  onTabChange: (tab: string) => void;
}

const workoutTypeConfig = {
  'UpperA': {
    color: 'upper-a',
    gradient: 'workout-gradient-upper-a',
    icon: 'fas fa-dumbbell'
  },
  'LowerA': {
    color: 'lower-a',
    gradient: 'workout-gradient-lower-a',
    icon: 'fas fa-running'
  },
  'UpperB': {
    color: 'upper-b',
    gradient: 'workout-gradient-upper-b',
    icon: 'fas fa-fist-raised'
  },
  'LowerB': {
    color: 'lower-b',
    gradient: 'workout-gradient-lower-b',
    icon: 'fas fa-fire'
  }
};

export default function WorkoutTypeCard({ type, name, muscles, lastWorkout, onStart, onTabChange }: WorkoutTypeCardProps) {
  const config = workoutTypeConfig[type];
  const { startWorkout, activeWorkout } = useWorkout();
  const [, setLocation] = useLocation();

  const handleStartWorkout = async () => {
    try {
      console.log('Starting workout with category:', type);
      const workout = await startWorkout(type);
      
      if (workout) {
        console.log('Workout started successfully, navigating to workout page');
        onTabChange('workout');
        setLocation('/workout');
        onStart(type);
      } else {
        console.error('No workout returned from startWorkout');
      }
    } catch (error) {
      console.error('Failed to start workout:', error);
      alert('Failed to start workout. Please try again.');
    }
  };

  return (
    <button
      onClick={handleStartWorkout}
      className={`workout-type-card group relative bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
    >
      <div className={`absolute top-4 right-4 w-3 h-3 bg-${config.color} rounded-full`}></div>
      <div className="flex items-center space-x-4 mb-4">
        <div className={`w-12 h-12 ${config.gradient} rounded-lg flex items-center justify-center`}>
          <i className={`${config.icon} text-white text-lg`}></i>
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">{muscles}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Last: {lastWorkout}</span>
        <span className={`text-${config.color} font-medium`}>
          Start Workout
        </span>
      </div>
    </button>
  );
}
