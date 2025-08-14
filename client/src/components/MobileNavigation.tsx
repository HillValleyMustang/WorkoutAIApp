import { useLocation } from 'wouter';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  const [, setLocation] = useLocation();
  
  const navItems = [
    { id: 'dashboard', icon: 'fas fa-home', label: 'Home', path: '/dashboard' },
    { id: 'workout', icon: 'fas fa-dumbbell', label: 'Workout', path: '/workout' },
    { id: 'exercises', icon: 'fas fa-list', label: 'Exercises', path: '/exercises' },
    { id: 'progress', icon: 'fas fa-chart-line', label: 'Progress', path: '/progress' },
    { id: 'profile', icon: 'fas fa-user', label: 'Profile', path: '/profile' },
  ];

  const handleNavigation = (item: any) => {
    onTabChange(item.id);
    setLocation(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item)}
            className={`flex flex-col items-center p-3 transition-colors ${
              activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <i className={`${item.icon} text-xl mb-1`}></i>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
