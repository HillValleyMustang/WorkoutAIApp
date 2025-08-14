import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  age?: number;
  height?: number; // cm
  weight?: number; // kg
  experience: string;
  fitnessGoal?: string;
  targetDate?: string;
  healthNotes?: string;
  goals: string[];
  streak: number;
  createdAt: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const { data: profile, refetch: refetchProfile } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    enabled: !!user,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      
      if (firebaseUser) {
        setUser(firebaseUser);
        // Register/update user in our backend
        try {
          const response = await apiRequest('POST', '/api/auth/register', {
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          });
          console.log('User registered in backend successfully');
          // Invalidate and refetch user data
          queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        } catch (error) {
          console.error('Failed to register user:', error);
        }
      } else {
        setUser(null);
        queryClient.clear();
      }
      setLoading(false);
    });

    // Set a fallback timeout in case Firebase doesn't respond
    const timeout = setTimeout(() => {
      console.log('Firebase auth timeout, showing login screen');
      setLoading(false);
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [queryClient]);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRefetchProfile = async () => {
    await refetchProfile();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, refetchProfile: handleRefetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
