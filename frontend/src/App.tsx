import { useState, useEffect } from 'react';
import { LoadingPage } from './components/LoadingPage';
import { LoginPage } from './components/LoginPage';
import { StationMasterDashboard } from './components/dashboards/StationMasterDashboard';
import { SectionControllerDashboard } from './components/dashboards/SectionControllerDashboard';
import { FreightOperatorDashboard } from './components/dashboards/FreightOperatorDashboard';
import { TrackManagerDashboard } from './components/dashboards/TrackManagerDashboard';

type AppState = 'loading' | 'login' | 'dashboard';
type UserRole = 'station-master' | 'section-controller' | 'freight-operator' | 'track-manager' | null;

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setAppState('login');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (role: string) => {
    setUserRole(role as UserRole);
    setAppState('dashboard');
  };

  if (appState === 'loading') {
    return <LoadingPage />;
  }

  if (appState === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (appState === 'dashboard') {
    switch (userRole) {
      case 'station-master':
        return <StationMasterDashboard />;
      case 'section-controller':
        return <SectionControllerDashboard />;
      case 'freight-operator':
        return <FreightOperatorDashboard />;
      case 'track-manager':
        return <TrackManagerDashboard />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  }

  return <LoadingPage />;
}