import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  age: z.number().min(13).max(120).optional(),
  height: z.number().min(100).max(250).optional(), // cm
  weight: z.number().min(30).max(300).optional(), // kg
  experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  fitnessGoal: z.string().optional(),
  targetDate: z.string().optional(),
  healthNotes: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstTime?: boolean;
}

export default function ProfileModal({ isOpen, onClose, isFirstTime = false }: ProfileModalProps) {
  const { user, profile, refetchProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Calculate default target date (3 months from now)
  const defaultTargetDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split('T')[0];
  };

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      age: profile?.age || undefined,
      height: profile?.height || 175, // Default height
      weight: profile?.weight || 70, // Default weight
      experience: profile?.experience || 'beginner',
      fitnessGoal: profile?.fitnessGoal || 'Get Toned & Muscular',
      targetDate: profile?.targetDate ? new Date(profile.targetDate).toISOString().split('T')[0] : defaultTargetDate(),
      healthNotes: profile?.healthNotes || '',
    },
  });

  // Reset form when profile changes
  useEffect(() => {
    if (profile) {
      form.reset({
        age: profile.age || undefined,
        height: profile.height || 175,
        weight: profile.weight || 70,
        experience: profile.experience || 'beginner',
        fitnessGoal: profile.fitnessGoal || 'Get Toned & Muscular',
        targetDate: profile.targetDate ? new Date(profile.targetDate).toISOString().split('T')[0] : defaultTargetDate(),
        healthNotes: profile.healthNotes || '',
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const payload = {
        ...data,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
      };

      const response = await apiRequest('PATCH', '/api/auth/profile', payload);
      
      if (response.ok) {
        await refetchProfile();
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been successfully updated.',
        });
        onClose();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isFirstTime ? 'Welcome! Let\'s set up your profile to personalise your coaching.' : 'Update Your Profile'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="25" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="175" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="70" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fitnessGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Fitness Goal</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Get Toned & Muscular" 
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="healthNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Health Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any injuries, limitations, or health considerations (e.g., 'sore lower back')" 
                      {...field}
                      value={field.value || ''}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              {!isFirstTime && (
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (isFirstTime ? 'Complete Setup' : 'Update Profile')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}