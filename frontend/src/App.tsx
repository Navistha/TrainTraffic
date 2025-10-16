import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LoadingPage } from './components/LoadingPage.js';
import { LoginPage } from './components/LoginPage.js';
import { StationMasterDashboard } from './components/dashboards/StationMasterDashboard.js';
import { SectionControllerDashboard } from './components/dashboards/SectionControllerDashboard.js';
import { FreightOperatorDashboard } from './components/dashboards/FreightOperatorDashboard.js';
import { TrackManagerDashboard } from './components/dashboards/TrackManagerDashboard.js';
import { PrivateRoute } from './components/ui/PrivateRoute.js';

export default function App() {
  const navigate = useNavigate();
  const [initializing, setInitializing] = useState(true);
  const location = useLocation();
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    // If user is already authenticated, redirect to their dashboard
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('userRole');
    if (token && role) {
      switch (role) {
        case 'station-master':
          navigate('/station-master');
          break;
        case 'section-controller':
          navigate('/section-controller');
          break;
        case 'freight-operator':
          navigate('/freight-operator');
          break;
        case 'track-manager':
          navigate('/track-manager');
          break;
        default:
          break;
      }
    }
    // show the loading animation briefly on first visit
    const t = setTimeout(() => setInitializing(false), 600);
    return () => clearTimeout(t);
  }, [navigate]);

  // Show loading if navigated with state { showLoading: true }
  useEffect(() => {
    if (location && (location as any).state && (location as any).state.showLoading) {
      setShowLoading(true);
      const t = setTimeout(() => setShowLoading(false), 700);
      return () => clearTimeout(t);
    }
  }, [location]);

  // Called from LoginPage after storing tokens; show the login loading state
  // and then navigate to the role-specific route.
  const onLogin = async (frontendRole: string) => {
    // emulate the same delay as the frontend loginCompleteWithDelay helper
    const delay = 800;
    await new Promise((res) => setTimeout(res, delay));
    switch (frontendRole) {
      case 'station-master':
        navigate('/station-master', { replace: true });
        break;
      case 'section-controller':
        navigate('/section-controller', { replace: true });
        break;
      case 'freight-operator':
        navigate('/freight-operator', { replace: true });
        break;
      case 'track-manager':
        navigate('/track-manager', { replace: true });
        break;
      default:
        navigate('/', { replace: true });
        break;
    }
  };

  if (initializing || showLoading) return <LoadingPage />;

  return (
    <Routes>
      <Route path="/" element={<LoginPage onLogin={onLogin} />} />

      <Route path="/station-master" element={<PrivateRoute><StationMasterDashboard /></PrivateRoute>} />
      <Route path="/section-controller" element={<PrivateRoute><SectionControllerDashboard /></PrivateRoute>} />
      <Route path="/freight-operator" element={<PrivateRoute><FreightOperatorDashboard /></PrivateRoute>} />
      <Route path="/track-manager" element={<PrivateRoute><TrackManagerDashboard /></PrivateRoute>} />
    </Routes>
  );
}