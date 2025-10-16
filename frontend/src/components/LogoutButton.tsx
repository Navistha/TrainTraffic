import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button.js';
import { logoutWithDelay } from '../lib/auth.js';
import { LoadingPage } from './LoadingPage.js';

export function LogoutButton({label = 'End Shift'}: {label?: string}){
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogout(){
    setLoading(true);
    // show the central loading animation while logout runs
      // Clear tokens immediately so app treats user as logged out
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userGovtId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');

      // Navigate to login and ask App to show the full-page loading animation
      navigate('/', { replace: true, state: { showLoading: true } });
    setLoading(false);
  }

  if (loading) return <LoadingPage />;
  return (
    <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700" disabled={loading}>
      {label}
    </Button>
  );
}
