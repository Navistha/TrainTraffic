import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import { LoadingScreen } from './components/LoadingScreen';
import { IDEntry, UserData, UserRole } from './components/IDEntry';
import { ControllerDashboard } from './components/ControllerDashboard';
import { TrackManagerDashboard } from './components/TrackManagerDashboard';
import { PassengerDashboard } from './components/PassengerDashboard';

type AppState = 'loading' | 'login' | 'dashboard';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [userData, setUserData] = useState<UserData | null>(null);

  // Handle loading screen completion
  const handleLoadingComplete = () => {
    setAppState('login');
  };

  // Handle successful login
  const handleLogin = (user: UserData) => {
    setUserData(user);
    setAppState('dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    setUserData(null);
    setAppState('login');
  };

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    if (!userData) return null;

    switch (userData.role) {
      case 'controller':
        return <ControllerDashboard userData={userData} onLogout={handleLogout} />;
      case 'track_manager':
        return <TrackManagerDashboard userData={userData} onLogout={handleLogout} />;
      case 'passenger':
        return <PassengerDashboard userData={userData} onLogout={handleLogout} />;
      default:
        return <IDEntry onLogin={handleLogin} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen">
        {appState === 'loading' && (
          <LoadingScreen onComplete={handleLoadingComplete} />
        )}
        
        {appState === 'login' && (
          <IDEntry onLogin={handleLogin} />
        )}
        
        {appState === 'dashboard' && renderDashboard()}
      </div>
    </ThemeProvider>
  );
}