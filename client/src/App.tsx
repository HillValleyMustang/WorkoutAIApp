import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useState } from "react";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Workout from "@/pages/Workout";
import Exercises from "@/pages/Exercises";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";

// Components
import MobileNavigation from "@/components/MobileNavigation";
import DesktopSidebar from "@/components/DesktopSidebar";
import LoadingOverlay from "@/components/LoadingOverlay";

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return <LoadingOverlay isVisible={true} message="Loading FitTracker Pro..." />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <DesktopSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content */}
      <main className="md:ml-64 pb-20 md:pb-0">
        <Switch>
          <Route path="/" component={() => {
            setActiveTab('dashboard');
            return <Dashboard onTabChange={setActiveTab} />;
          }} />
          <Route path="/dashboard" component={() => {
            setActiveTab('dashboard');
            return <Dashboard onTabChange={setActiveTab} />;
          }} />
          <Route path="/workout" component={() => {
            setActiveTab('workout');
            return <Workout />;
          }} />
          <Route path="/exercises" component={() => {
            setActiveTab('exercises');
            return <Exercises />;
          }} />
          <Route path="/progress" component={() => {
            setActiveTab('progress');
            return <Progress />;
          }} />
          <Route path="/profile" component={() => {
            setActiveTab('profile');
            return <Profile />;
          }} />
          <Route component={NotFound} />
        </Switch>
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function Router() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
