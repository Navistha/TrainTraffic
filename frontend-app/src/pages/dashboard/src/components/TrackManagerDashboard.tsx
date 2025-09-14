import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { useTheme } from './ThemeProvider';
import { UserData } from './IDEntry';
import { 
  Navigation,
  StopCircle,
  PlayCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Train,
  Activity,
  Moon,
  Sun,
  LogOut,
  Zap,
  MapPin,
  Radio
} from 'lucide-react';

interface TrackManagerDashboardProps {
  userData: UserData;
  onLogout: () => void;
}

export function TrackManagerDashboard({ userData, onLogout }: TrackManagerDashboardProps) {
  const { theme, toggleTheme } = useTheme();
  
  const [signals, setSignals] = useState({
    'TRK-001': { status: 'green', enabled: true, lastChanged: '14:23' },
    'TRK-002': { status: 'red', enabled: true, lastChanged: '14:18' },
    'TRK-003': { status: 'green', enabled: true, lastChanged: '14:25' },
    'TRK-004': { status: 'yellow', enabled: true, lastChanged: '14:20' },
    'JNC-001': { status: 'red', enabled: true, lastChanged: '14:15' },
    'JNC-002': { status: 'green', enabled: true, lastChanged: '14:22' }
  });

  const [emergencyMode, setEmergencyMode] = useState(false);

  const toggleSignal = (trackId: string) => {
    if (emergencyMode) return; // Prevent changes in emergency mode
    
    setSignals(prev => ({
      ...prev,
      [trackId]: {
        ...prev[trackId],
        status: prev[trackId].status === 'green' ? 'red' : 'green',
        lastChanged: new Date().toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
    }));
  };

  const toggleEmergency = () => {
    if (!emergencyMode) {
      // Emergency stop - set all signals to red
      const newSignals = { ...signals };
      Object.keys(newSignals).forEach(trackId => {
        newSignals[trackId] = {
          ...newSignals[trackId],
          status: 'red',
          lastChanged: new Date().toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
      });
      setSignals(newSignals);
    }
    setEmergencyMode(!emergencyMode);
  };

  const getSignalColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-green-500';
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const activeTrains = [
    { id: '12951', name: 'Mumbai Rajdhani', track: 'TRK-001', speed: '85 km/h', status: 'moving' },
    { id: '12615', name: 'Grand Trunk Express', track: 'TRK-002', speed: '0 km/h', status: 'stopped' },
    { id: '22926', name: 'Paschim Express', track: 'JNC-001', speed: '45 km/h', status: 'approaching' },
  ];

  const alerts = [
    { 
      id: 1, 
      type: 'warning', 
      message: 'Level crossing at KM 23.5 has vehicle obstruction',
      time: '2 min ago',
      priority: 'high'
    },
    {
      id: 2,
      type: 'info',
      message: 'Track maintenance scheduled for TRK-003 at 16:00',
      time: '15 min ago',
      priority: 'medium'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Navigation className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">Track Management Control</h1>
              <p className="text-sm text-muted-foreground">{userData.zone}</p>
            </div>
          </div>
          <Badge variant={emergencyMode ? 'destructive' : 'secondary'} className="text-xs">
            {emergencyMode ? 'EMERGENCY MODE' : 'Normal Operation'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground">Track Manager:</span>
            <span>{userData.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Emergency Controls */}
        <Card className={`border-2 ${emergencyMode ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-border'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <StopCircle className="h-5 w-5 mr-2 text-red-600" />
                Emergency Controls
              </span>
              <Button 
                variant={emergencyMode ? 'destructive' : 'outline'}
                onClick={toggleEmergency}
                className="font-semibold"
              >
                {emergencyMode ? (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Resume Operations
                  </>
                ) : (
                  <>
                    <StopCircle className="h-4 w-4 mr-2" />
                    Emergency Stop
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          {emergencyMode && (
            <CardContent>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Emergency mode is active. All signals are set to STOP. Train operations are halted.
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>

        {/* Signal Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Radio className="h-5 w-5 mr-2" />
                Track Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(signals).filter(([id]) => id.startsWith('TRK')).map(([trackId, signal]) => (
                  <div key={trackId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${getSignalColor(signal.status)} ${signal.status === 'green' ? 'animate-pulse' : ''}`} />
                      <div>
                        <p className="font-medium">{trackId}</p>
                        <p className="text-sm text-muted-foreground">Last changed: {signal.lastChanged}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={signal.status === 'green' ? 'default' : signal.status === 'red' ? 'destructive' : 'secondary'}>
                        {signal.status.toUpperCase()}
                      </Badge>
                      <Switch
                        checked={signal.status === 'green'}
                        onCheckedChange={() => toggleSignal(trackId)}
                        disabled={emergencyMode || !signal.enabled}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Junction Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(signals).filter(([id]) => id.startsWith('JNC')).map(([junctionId, signal]) => (
                  <div key={junctionId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${getSignalColor(signal.status)} ${signal.status === 'green' ? 'animate-pulse' : ''}`} />
                      <div>
                        <p className="font-medium">{junctionId}</p>
                        <p className="text-sm text-muted-foreground">Last changed: {signal.lastChanged}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={signal.status === 'green' ? 'default' : signal.status === 'red' ? 'destructive' : 'secondary'}>
                        {signal.status.toUpperCase()}
                      </Badge>
                      <Switch
                        checked={signal.status === 'green'}
                        onCheckedChange={() => toggleSignal(junctionId)}
                        disabled={emergencyMode || !signal.enabled}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Trains */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Train className="h-5 w-5 mr-2" />
              Active Trains in Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeTrains.map((train) => (
                <div key={train.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{train.name}</p>
                      <p className="text-sm text-muted-foreground">#{train.id}</p>
                    </div>
                    <Badge variant="outline">{train.track}</Badge>
                    <Badge variant={
                      train.status === 'moving' ? 'default' :
                      train.status === 'stopped' ? 'destructive' : 'secondary'
                    }>
                      {train.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{train.speed}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Activity className="h-3 w-3 mr-1" />
                      Live
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} variant={alert.priority === 'high' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <div>
                      <p>{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {alert.time}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Acknowledge
                      </Button>
                      <Button size="sm" variant="ghost">
                        Dismiss
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Signal System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Active Tracks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6/8</div>
              <p className="text-xs text-muted-foreground">Tracks in operation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">0.8s</div>
              <p className="text-xs text-muted-foreground">Avg signal response</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}