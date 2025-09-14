import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { 
  MapPin, 
  Radar, 
  ZoomIn, 
  ZoomOut, 
  Navigation,
  AlertTriangle,
  CheckCircle,
  Clock,
  Train,
  Eye,
  EyeOff,
  Sun,
  Moon,
  X,
  Bell,
  Play,
  Pause
} from 'lucide-react';

// Train data interface
interface TrainData {
  id: string;
  name: string;
  type: 'Express' | 'Mail' | 'SuperFast' | 'Freight' | 'Local';
  status: 'On-Time' | 'Delayed' | 'High Priority';
  position: { lat: number; lng: number };
  destination: string;
  eta: string;
  delay: number;
  speed: number;
}

// Alert data interface
interface AlertData {
  id: string;
  type: 'collision' | 'delay' | 'maintenance' | 'weather';
  message: string;
  trains: string[];
  location: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

export function Simulation() {
  const mapRef = useRef<HTMLDivElement>(null);
  
  const [selectedTrain, setSelectedTrain] = useState('12951');
  const [showRadar, setShowRadar] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [trains, setTrains] = useState<TrainData[]>([
    {
      id: '12951',
      name: 'Mumbai Rajdhani Express',
      type: 'Express',
      status: 'On-Time',
      position: { lat: 19.0760, lng: 72.8777 },
      destination: 'New Delhi',
      eta: '14:30',
      delay: 0,
      speed: 85
    },
    {
      id: '12615',
      name: 'Grand Trunk Express',
      type: 'Mail',
      status: 'Delayed',
      position: { lat: 19.0330, lng: 72.8570 },
      destination: 'Chennai Central',
      eta: '15:45',
      delay: 12,
      speed: 65
    },
    {
      id: '22926',
      name: 'Paschim Express',
      type: 'SuperFast',
      status: 'High Priority',
      position: { lat: 19.0544, lng: 72.8426 },
      destination: 'Amritsar',
      eta: '16:20',
      delay: 0,
      speed: 95
    },
    {
      id: 'FREIGHT-401',
      name: 'Container Freight',
      type: 'Freight',
      status: 'On-Time',
      position: { lat: 18.9750, lng: 72.8258 },
      destination: 'JNPT Port',
      eta: '17:00',
      delay: 0,
      speed: 45
    }
  ]);

  const [alerts, setAlerts] = useState<AlertData[]>([
    {
      id: 'alert-1',
      type: 'collision',
      message: 'Potential collision risk between Train 12951 & Train 12615 near Junction J-4',
      trains: ['12951', '12615'],
      location: 'Junction J-4 (Dadar)',
      timestamp: new Date().toLocaleTimeString(),
      priority: 'high'
    },
    {
      id: 'alert-2',
      type: 'delay',
      message: 'Signal failure causing delays on Track 3',
      trains: ['22926'],
      location: 'Bandra Station',
      timestamp: new Date().toLocaleTimeString(),
      priority: 'medium'
    }
  ]);

  // Simulate train movement
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      setTrains(prevTrains => 
        prevTrains.map(train => ({
          ...train,
          position: {
            lat: train.position.lat + (Math.random() - 0.5) * 0.001,
            lng: train.position.lng + (Math.random() - 0.5) * 0.001
          }
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulationRunning]);

  // Helper functions
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'On-Time': return 'default';
      case 'Delayed': return 'destructive';
      case 'High Priority': return 'secondary';
      default: return 'outline';
    }
  };

  const getAlertPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getTrainIconColor = (status: string) => {
    switch (status) {
      case 'On-Time': return 'bg-green-500';
      case 'Delayed': return 'bg-red-500';
      case 'High Priority': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAlertAction = (alertId: string, action: 'accept' | 'review' | 'dismiss') => {
    setAlerts(prevAlerts => 
      prevAlerts.filter(alert => alert.id !== alertId)
    );
  };

  const selectedTrainData = trains.find(t => t.id === selectedTrain);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Live Train Simulation</h2>
          <p className="text-muted-foreground">Real-time train tracking with AI-powered conflict detection</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>Mumbai Section</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Map Panel */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Navigation className="h-5 w-5 mr-2" />
                  Live Train Map
                </CardTitle>
                
                {/* Map Controls */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="train-select" className="text-sm">Focus Train:</Label>
                    <Select value={selectedTrain} onValueChange={setSelectedTrain}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {trains.map(train => (
                          <SelectItem key={train.id} value={train.id}>
                            {train.name} ({train.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Radar className="h-4 w-4" />
                    <Switch 
                      checked={showRadar} 
                      onCheckedChange={setShowRadar}
                      id="radar-toggle"
                    />
                    <Label htmlFor="radar-toggle" className="text-sm">Radar</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <Switch 
                      checked={isDarkMode} 
                      onCheckedChange={setIsDarkMode}
                      id="theme-toggle"
                    />
                  </div>
                  
                  <Button
                    onClick={() => setIsSimulationRunning(!isSimulationRunning)}
                    variant={isSimulationRunning ? "destructive" : "default"}
                    size="sm"
                  >
                    {isSimulationRunning ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Mock Map Display */}
              <div 
                ref={mapRef}
                className={`relative w-full h-96 rounded-lg border-2 border-dashed border-gray-300 ${
                  isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
                } flex items-center justify-center overflow-hidden`}
              >
                {/* Map Background */}
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100"></div>
                </div>
                
                {/* Train Markers */}
                {trains.map((train, index) => (
                  <div
                    key={train.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                      train.id === selectedTrain ? 'z-20' : 'z-10'
                    }`}
                    style={{
                      left: `${20 + (index * 15)}%`,
                      top: `${30 + (index * 10)}%`
                    }}
                  >
                    {/* Radar Circle for Selected Train */}
                    {showRadar && train.id === selectedTrain && (
                      <div className="absolute inset-0 w-24 h-24 border-2 border-red-500 border-opacity-30 rounded-full animate-pulse -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"></div>
                    )}
                    
                    {/* Train Icon */}
                    <div className={`w-8 h-8 rounded-full ${getTrainIconColor(train.status)} border-2 border-white shadow-lg flex items-center justify-center`}>
                      <Train className="h-4 w-4 text-white" />
                    </div>
                    
                    {/* Train Info Popup */}
                    <div className="absolute left-10 top-0 bg-white rounded-lg shadow-lg p-2 min-w-48 border">
                      <div className="text-sm font-medium">{train.name}</div>
                      <div className="text-xs text-gray-600">#{train.id}</div>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant={getStatusBadgeVariant(train.status)} className="text-xs">
                          {train.status}
                        </Badge>
                        <div className="text-xs text-gray-600">ETA: {train.eta}</div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        → {train.destination}
                      </div>
                      {train.delay > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          Delayed by {train.delay} min
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Map Controls */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                  <Button variant="outline" size="sm">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Map Center Text */}
                <div className="text-gray-400 text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-lg font-medium">Mumbai Railway Network</p>
                  <p className="text-sm">Google Maps integration will display here</p>
                  <p className="text-xs mt-2">Add your Google Maps API key to enable live map</p>
                </div>
              </div>
              
              {/* Selected Train Info */}
              {selectedTrainData && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{selectedTrainData.name}</h4>
                      <p className="text-sm text-muted-foreground">Train #{selectedTrainData.id}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(selectedTrainData.status)}>
                      {selectedTrainData.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Destination:</span>
                      <p className="font-medium">{selectedTrainData.destination}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ETA:</span>
                      <p className="font-medium">{selectedTrainData.eta}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Speed:</span>
                      <p className="font-medium">{selectedTrainData.speed} km/h</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alerts Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Live Alerts
                {alerts.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {alerts.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No active alerts</p>
                  <p className="text-sm">All systems operational</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <Alert key={alert.id} className="relative">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="pr-6">
                        <div className={`text-sm font-medium ${getAlertPriorityColor(alert.priority)}`}>
                          {alert.type.toUpperCase()} ALERT
                        </div>
                        <p className="text-sm mt-1">{alert.message}</p>
                        <div className="text-xs text-muted-foreground mt-2">
                          <div>📍 {alert.location}</div>
                          <div>🕒 {alert.timestamp}</div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleAlertAction(alert.id, 'accept')}
                          >
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAlertAction(alert.id, 'review')}
                          >
                            Review
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleAlertAction(alert.id, 'dismiss')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </CardContent>
          </Card>

          {/* Train Status Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Train className="h-5 w-5 mr-2" />
                Train Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trains.map((train) => (
                  <div 
                    key={train.id} 
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      train.id === selectedTrain ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedTrain(train.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getTrainIconColor(train.status)}`}></div>
                      <div>
                        <div className="text-sm font-medium">{train.id}</div>
                        <div className="text-xs text-muted-foreground">{train.type}</div>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(train.status)} className="text-xs">
                      {train.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
