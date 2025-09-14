import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Slider } from './ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Progress } from './ui/progress';
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
  Pause,
  PauseCircle,
  RotateCcw,
  BarChart3,
  Settings,
  PlayCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

// Train data with positions and status
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
  direction: number;
}

interface AlertData {
  id: string;
  type: 'collision' | 'delay' | 'maintenance' | 'weather';
  message: string;
  trains: string[];
  location: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

interface SimulationResults {
  baseline: {
    onTimePerformance: number;
    avgDelay: number;
    throughput: number;
    energyEfficiency: number;
    passengerSatisfaction: number;
  };
  simulated: {
    onTimePerformance: number;
    avgDelay: number;
    throughput: number;
    energyEfficiency: number;
    passengerSatisfaction: number;
  };
  affectedTrains: {
    id: string;
    name: string;
    originalDelay: number;
    newDelay: number;
    impact: 'high' | 'medium' | 'low';
  }[];
}

// Simple Google Maps types for demo
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function Simulation() {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const trainMarkersRef = useRef<Map<string, any>>(new Map());
  const radarCircleRef = useRef<any>(null);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState('12951');
  const [showRadar, setShowRadar] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [trains, setTrains] = useState<TrainData[]>([]);
  const [scenarioType, setScenarioType] = useState('delay');
  const [delayMinutes, setDelayMinutes] = useState([15]);
  const [weatherCondition, setWeatherCondition] = useState('normal');
  const [isRunning, setIsRunning] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationResults, setSimulationResults] = useState<SimulationResults | null>(null);

  // Scenario definitions
  const scenarios = [
    {
      id: 'delay',
      name: 'Train Delay',
      description: 'Simulate train delays and their impact on the network'
    },
    {
      id: 'weather',
      name: 'Weather Impact',
      description: 'Test how weather conditions affect train operations'
    }
  ];

  // Initialize train data with Mumbai railway network positions
  const initializeTrains = useCallback((): TrainData[] => [
    {
      id: '12951',
      name: 'Mumbai Rajdhani Express',
      type: 'Express',
      status: 'On-Time',
      position: { lat: 19.0760, lng: 72.8777 }, // Mumbai Central
      destination: 'New Delhi',
      eta: '14:30',
      delay: 0,
      speed: 85,
      direction: 45
    },
    {
      id: '12615',
      name: 'Grand Trunk Express',
      type: 'Mail',
      status: 'Delayed',
      position: { lat: 19.0330, lng: 72.8570 }, // Dadar
      destination: 'Chennai Central',
      eta: '15:45',
      delay: 12,
      speed: 65,
      direction: 180
    },
    {
      id: '22926',
      name: 'Paschim Express',
      type: 'SuperFast',
      status: 'High Priority',
      position: { lat: 19.0544, lng: 72.8426 }, // Bandra
      destination: 'Amritsar',
      eta: '16:20',
      delay: 0,
      speed: 95,
      direction: 315
    },
    {
      id: 'FREIGHT-401',
      name: 'Container Freight',
      type: 'Freight',
      status: 'On-Time',
      position: { lat: 18.9750, lng: 72.8258 }, // Kurla
      destination: 'JNPT Port',
      eta: '17:00',
      delay: 0,
      speed: 45,
      direction: 225
    },
    {
      id: '19024',
      name: 'Firozpur Janata',
      type: 'Mail',
      status: 'On-Time',
      position: { lat: 19.1136, lng: 72.8697 }, // Andheri
      destination: 'Firozpur',
      eta: '18:15',
      delay: 0,
      speed: 70,
      direction: 90
    }
  ], []);

  // Initialize alerts
  const initializeAlerts = useCallback((): AlertData[] => [
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
  ], []);

  // Initialize component state
  useEffect(() => {
    setTrains(initializeTrains());
    setAlerts(initializeAlerts());
  }, [initializeTrains, initializeAlerts]);

  // Mock Google Maps for demo (replace with actual Google Maps API)
  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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

  // Handle train selection
  const handleTrainSelect = (trainId: string) => {
    setSelectedTrain(trainId);
  };

  // Handle alert actions
  const handleAlertAction = (alertId: string, action: 'accept' | 'review' | 'dismiss') => {
    setAlerts(prevAlerts => 
      prevAlerts.filter(alert => alert.id !== alertId)
    );
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'On-Time': return 'default';
      case 'Delayed': return 'destructive';
      case 'High Priority': return 'secondary';
      default: return 'outline';
    }
  };

  // Get alert priority color
  const getAlertPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  // Get train icon color
  const getTrainIconColor = (status: string) => {
    switch (status) {
      case 'On-Time': return 'bg-green-500';
      case 'Delayed': return 'bg-red-500';
      case 'High Priority': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  // Helper functions for simulation results
  const getImpactIcon = (simulated: number, baseline: number, higherIsBetter: boolean = true) => {
    const isImprovement = higherIsBetter ? simulated > baseline : simulated < baseline;
    return isImprovement ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getImpactColor = (simulated: number, baseline: number, higherIsBetter: boolean = true) => {
    const isImprovement = higherIsBetter ? simulated > baseline : simulated < baseline;
    return isImprovement ? 'text-green-600' : 'text-red-600';
  };

  // Simulation control functions
  const runSimulation = () => {
    setIsRunning(true);
    setSimulationProgress(0);
    
    // Simulate progress over 3 seconds
    const progressInterval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsRunning(false);
          
          // Generate mock simulation results
          const mockResults = {
            baseline: {
              onTimePerformance: 87,
              avgDelay: 4.2,
              throughput: 24,
              energyEfficiency: 85,
              passengerSatisfaction: 82
            },
            simulated: {
              onTimePerformance: scenarioType === 'delay' ? 72 : 79,
              avgDelay: scenarioType === 'delay' ? 8.5 : 6.1,
              throughput: scenarioType === 'delay' ? 21 : 22,
              energyEfficiency: scenarioType === 'weather' ? 78 : 83,
              passengerSatisfaction: scenarioType === 'delay' ? 68 : 75
            },
            affectedTrains: [
              {
                id: selectedTrain,
                name: trains.find(t => t.id === selectedTrain)?.name || 'Unknown Train',
                originalDelay: 0,
                newDelay: scenarioType === 'delay' ? delayMinutes[0] : 8,
                impact: 'high' as const
              },
              {
                id: '12615',
                name: 'Grand Trunk Express',
                originalDelay: 12,
                newDelay: scenarioType === 'delay' ? 25 : 18,
                impact: 'medium' as const
              }
            ]
          };
          
          setSimulationResults(mockResults);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setSimulationProgress(0);
    setSimulationResults(null);
    // Reset any simulation effects
    setTrains(initializeTrains());
    setAlerts([]);
  };

  const renderScenarioConfig = () => {
    switch (scenarioType) {
      case 'delay':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="train-select">Select Train</Label>
              <Select value={selectedTrain} onValueChange={setSelectedTrain}>
                <SelectTrigger>
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
            <div>
              <Label>Delay Duration: {delayMinutes[0]} minutes</Label>
              <Slider
                value={delayMinutes}
                onValueChange={setDelayMinutes}
                max={60}
                min={5}
                step={5}
                className="mt-2"
              />
            </div>
          </div>
        );
      case 'weather':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="weather-select">Weather Condition</Label>
              <Select value={weatherCondition} onValueChange={setWeatherCondition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="heavy-rain">Heavy Rain</SelectItem>
                  <SelectItem value="fog">Dense Fog</SelectItem>
                  <SelectItem value="storm">Storm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-sm text-muted-foreground">
            Scenario-specific configuration will appear here
          </div>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Scenario Simulation</h2>
          <p className="text-muted-foreground">Test and analyze "what-if" scenarios for better decision making</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <BarChart3 className="h-3 w-3" />
            <span>Digital Twin Active</span>
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList>
          <TabsTrigger value="setup">Scenario Setup</TabsTrigger>
          <TabsTrigger value="results" disabled={simulationProgress === 0}>
            Results & Analysis
          </TabsTrigger>
          <TabsTrigger value="comparison">Historical Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scenario Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Scenario Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="scenario-type">Scenario Type</Label>
                  <Select value={scenarioType} onValueChange={setScenarioType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scenarios.map(scenario => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                          {scenario.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    {scenarios.find(s => s.id === scenarioType)?.description}
                  </p>
                </div>

                {renderScenarioConfig()}

                <div className="pt-4">
                  <div className="flex space-x-2">
                    <Button 
                      onClick={runSimulation} 
                      disabled={isRunning}
                      className="flex-1"
                    >
                      {isRunning ? (
                        <>
                          <PauseCircle className="h-4 w-4 mr-2" />
                          Simulating...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Run Simulation
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={resetSimulation}
                      disabled={isRunning}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {isRunning && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Simulation Progress</span>
                        <span>{simulationProgress}%</span>
                      </div>
                      <Progress value={simulationProgress} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Section Status */}
            <Card>
              <CardHeader>
                <CardTitle>Current Section Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Active Trains</span>
                    <Badge>24</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>On-time Performance</span>
                    <span className="text-green-600 font-medium">87%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average Delay</span>
                    <span className="text-orange-600 font-medium">4.2 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Section Capacity</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Energy Efficiency</span>
                    <span className="text-green-600 font-medium">85%</span>
                  </div>
                </div>

                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    The simulation will use current real-time data as the baseline for scenario analysis.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {simulationProgress === 100 && simulationResults ? (
            <>
              {/* Impact Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">On-time Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {simulationResults.simulated.onTimePerformance}%
                      </div>
                      {getImpactIcon(simulationResults.simulated.onTimePerformance, simulationResults.baseline.onTimePerformance)}
                    </div>
                    <p className={`text-sm ${getImpactColor(simulationResults.simulated.onTimePerformance, simulationResults.baseline.onTimePerformance)}`}>
                      {simulationResults.simulated.onTimePerformance - simulationResults.baseline.onTimePerformance}% from baseline
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Average Delay</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {simulationResults.simulated.avgDelay} min
                      </div>
                      {getImpactIcon(simulationResults.simulated.avgDelay, simulationResults.baseline.avgDelay, false)}
                    </div>
                    <p className={`text-sm ${getImpactColor(simulationResults.simulated.avgDelay, simulationResults.baseline.avgDelay, false)}`}>
                      +{(simulationResults.simulated.avgDelay - simulationResults.baseline.avgDelay).toFixed(1)} min from baseline
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Throughput</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {simulationResults.simulated.throughput}
                      </div>
                      {getImpactIcon(simulationResults.simulated.throughput, simulationResults.baseline.throughput)}
                    </div>
                    <p className={`text-sm ${getImpactColor(simulationResults.simulated.throughput, simulationResults.baseline.throughput)}`}>
                      {simulationResults.simulated.throughput - simulationResults.baseline.throughput} trains/hour
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Energy Efficiency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {simulationResults.simulated.energyEfficiency}%
                      </div>
                      {getImpactIcon(simulationResults.simulated.energyEfficiency, simulationResults.baseline.energyEfficiency)}
                    </div>
                    <p className={`text-sm ${getImpactColor(simulationResults.simulated.energyEfficiency, simulationResults.baseline.energyEfficiency)}`}>
                      {simulationResults.simulated.energyEfficiency - simulationResults.baseline.energyEfficiency}% from baseline
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Passenger Satisfaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {simulationResults.simulated.passengerSatisfaction}%
                      </div>
                      {getImpactIcon(simulationResults.simulated.passengerSatisfaction, simulationResults.baseline.passengerSatisfaction)}
                    </div>
                    <p className={`text-sm ${getImpactColor(simulationResults.simulated.passengerSatisfaction, simulationResults.baseline.passengerSatisfaction)}`}>
                      {simulationResults.simulated.passengerSatisfaction - simulationResults.baseline.passengerSatisfaction}% from baseline
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Affected Trains */}
              <Card>
                <CardHeader>
                  <CardTitle>Affected Trains Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {simulationResults.affectedTrains.map((train) => (
                      <div key={train.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{train.name}</p>
                          <p className="text-sm text-muted-foreground">#{train.id}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Original Delay</p>
                            <p className="font-medium">{train.originalDelay} min</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Simulated Delay</p>
                            <p className="font-medium text-red-600">{train.newDelay} min</p>
                          </div>
                          <Badge variant={
                            train.impact === 'high' ? 'destructive' :
                            train.impact === 'medium' ? 'secondary' : 'outline'
                          }>
                            {train.impact} impact
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mitigation Strategies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Recommended Mitigation Strategies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Immediate Action:</strong> Route following trains via bypass track to minimize cascade delays.
                        <br />
                        <span className="text-sm text-muted-foreground">Estimated impact: Reduce delays by 40%</span>
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Medium-term:</strong> Implement speed optimization for Express trains to recover time.
                        <br />
                        <span className="text-sm text-muted-foreground">Estimated impact: Recover 5-7 minutes per train</span>
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Communication:</strong> Proactive passenger information about delays and alternative options.
                        <br />
                        <span className="text-sm text-muted-foreground">Estimated impact: Maintain 80%+ satisfaction despite delays</span>
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4" />
              <p>Run a simulation to see detailed results and analysis.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Historical Scenario Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Historical simulation data and comparison charts will be displayed here.</p>
                <p className="text-sm">Run more simulations to build up historical data for comparison.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}