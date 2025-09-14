import { useState } from 'react';
import { LoadingPage } from './components/LoadingPage';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { Toaster } from './components/ui/sonner';

interface User {
  id: string;
  email: string;
  fullName: string;
  governmentId: string;
  password: string;
}

type AppState = 'loading' | 'auth' | 'dashboard';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLoadingComplete = () => {
    setAppState('auth');
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setAppState('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAppState('auth');
  };

  return (
    <div className="min-h-screen">
      {appState === 'loading' && (
        <LoadingPage onLoadingComplete={handleLoadingComplete} />
      )}
      
      {appState === 'auth' && (
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      )}
      
      {appState === 'dashboard' && currentUser && (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      )}
      
      <Toaster />
    </div>
  );
}