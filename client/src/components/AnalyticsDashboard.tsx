import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Target, Zap, Trophy, Activity } from 'lucide-react';

export default function AnalyticsDashboard() {
  const { user } = useAuth();

  const { data: workouts = [] } = useQuery({
    queryKey: ['/api/workouts'],
    enabled: !!user,
  });

  const { data: personalRecords = [] } = useQuery({
    queryKey: ['/api/personal-records'],
    enabled: !!user,
  });

  // Calculate analytics
  const totalWorkouts = workouts.length;
  const currentStreak = calculateStreak(workouts);
  const averageWorkoutDuration = calculateAverageDuration(workouts);
  const totalVolume = calculateTotalVolume(workouts);
  const recentPRs = personalRecords.slice(-3);

  function calculateStreak(workouts: any[]): number {
    // Mock calculation - would implement real streak logic
    return Math.min(workouts.length, 7);
  }

  function calculateAverageDuration(workouts: any[]): number {
    if (!workouts.length) return 0;
    const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 45), 0);
    return Math.round(totalMinutes / workouts.length);
  }

  function calculateTotalVolume(workouts: any[]): number {
    // Mock calculation - would sum all sets * reps * weight
    return workouts.length * 2500; // Mock volume
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workouts */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Workouts</p>
                <p className="text-2xl font-bold text-blue-900">{totalWorkouts}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Current Streak</p>
                <p className="text-2xl font-bold text-orange-900">{currentStreak} days</p>
              </div>
              <Zap className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        {/* Avg Duration */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Avg Duration</p>
                <p className="text-2xl font-bold text-green-900">{averageWorkoutDuration}min</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Total Volume */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Total Volume</p>
                <p className="text-2xl font-bold text-purple-900">{totalVolume.toLocaleString()}kg</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Personal Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
            Recent Personal Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPRs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No personal records yet. Keep pushing!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPRs.map((pr: any, index: number) => (
                <div
                  key={pr.id || index}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                >
                  <div className="flex items-center">
                    <Trophy className="w-4 h-4 text-yellow-600 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900">{pr.exerciseName || 'Exercise'}</p>
                      <p className="text-sm text-gray-600">
                        {pr.weight}kg × {pr.reps} reps = {pr.volume}kg volume
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    PR
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workout Progress Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Progress Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 text-blue-400" />
              <p className="text-gray-600">Progress chart would display here</p>
              <p className="text-sm text-gray-500">Showing volume trends over time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}