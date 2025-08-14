import { useLocation } from 'wouter';

interface DesktopSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function DesktopSidebar({ activeTab, onTabChange }: DesktopSidebarProps) {
  const [, setLocation] = useLocation();
  
  const sidebarItems = [
    { id: 'dashboard', icon: 'fas fa-home', label: 'Dashboard', path: '/dashboard' },
    { id: 'workout', icon: 'fas fa-dumbbell', label: 'Start Workout', path: '/workout' },
    { id: 'exercises', icon: 'fas fa-list', label: 'Exercise Library', path: '/exercises' },
    { id: 'progress', icon: 'fas fa-chart-line', label: 'Progress & Analytics', path: '/progress' },
  ];

  const handleNavigation = (item: any) => {
    onTabChange(item.id);
    setLocation(item.path);
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex-col z-30">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-upper-a rounded-lg flex items-center justify-center">
            <i className="fas fa-dumbbell text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">FitTracker Pro</h1>
            <p className="text-sm text-gray-500">AI Fitness Coach</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === item.id
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            onTabChange('profile');
            setLocation('/profile');
          }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'profile'
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <i className="fas fa-user-circle"></i>
          <span>Profile & Settings</span>
        </button>
      </div>
    </aside>
  );
}
