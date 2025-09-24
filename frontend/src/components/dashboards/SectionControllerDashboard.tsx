import { useState } from 'react';
import { Button } from '../ui/button.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.js';
import { Badge } from '../ui/badge.js';
import { Progress } from '../ui/progress.js';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Users, MapPin, Zap, Activity, Target } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.js';
import { Alert, AlertDescription } from '../ui/alert.js';
import railwayLogo from 'figma:asset/de6da6a664b190e144e4d86f4481b866fee10e67.png';

export function SectionControllerDashboard() {
  type Conflict = {
    id: string;
    location: string;
    trains: string[];
    severity: string;
    timeToConflict: string;
    description: string;
  };

  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  const [draggedTrain, setDraggedTrain] = useState<typeof trainPaths[number] | null>(null);
  
  const kpis = [
    { label: 'Section Punctuality', value: 94, unit: '%', trend: '+2%', color: 'text-green-600' },
    { label: 'Avg. Delay', value: 3.2, unit: 'min', trend: '-0.8min', color: 'text-blue-600' },
    { label: 'Active Trains', value: 12, unit: '', trend: '+2', color: 'text-primary' },
    { label: 'Critical Conflicts', value: 2, unit: '', trend: '-1', color: 'text-red-600' },
  ];

  const trainPaths = [
    { 
      id: '12951', 
      name: 'Rajdhani', 
      from: 'NDLS', 
      to: 'BCT', 
      progress: 65, 
      delay: 0, 
      conflict: false, 
      priority: 'High',
      currentLocation: 'Approaching Mathura',
      speed: 110,
      eta: '16:45'
    },
    { 
      id: '12615', 
      name: 'GT Express', 
      from: 'CSTM', 
      to: 'NZM', 
      progress: 30, 
      delay: 15, 
      conflict: true, 
      priority: 'Medium',
      currentLocation: 'Held at Agra Cantt',
      speed: 0,
      eta: '17:20'
    },
    { 
      id: '12650', 
      name: 'Karnataka Exp', 
      from: 'YPR', 
      to: 'NZM', 
      progress: 85, 
      delay: 5, 
      conflict: false, 
      priority: 'Medium',
      currentLocation: 'Passing Faridabad',
      speed: 95,
      eta: '15:35'
    },
    { 
      id: 'G-4521', 
      name: 'Goods Train', 
      from: 'GZB', 
      to: 'TKD', 
      progress: 20, 
      delay: 0, 
      conflict: true, 
      priority: 'Low',
      currentLocation: 'Aligarh Junction',
      speed: 45,
      eta: '18:15'
    }
  ];

  const aiRecommendations = [
    {
      id: 1,
      type: 'critical',
      title: 'Priority Conflict Resolution',
      description: 'Regulate GT Express 12615 at Agra Cantt for 18 mins. Allow Rajdhani 12951 precedence at Mathura single line section.',
      impact: 'Saves 12 min system-wide delay',
      confidence: 94,
      action: 'Regulate',
      timeToDecide: 8,
      affectedTrains: ['12615', '12951'],
      estimatedSavings: '₹2.4L penalty avoidance'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Engineering Block Optimization',
      description: 'Reschedule PWI block at KM 145-150 from 14:00-16:00 to 02:00-04:00 tomorrow when traffic is minimal.',
      impact: 'Prevents 4 train delays',
      confidence: 87,
      action: 'Reschedule',
      timeToDecide: 25,
      affectedTrains: ['12615', '12650', 'G-4521', 'G-4522'],
      estimatedSavings: '₹1.8L operational cost'
    },
    {
      id: 3,
      type: 'info',
      title: 'Route Optimization Available',
      description: 'Divert Goods G-4521 via alternate route through Bareilly to avoid congestion at Moradabad.',
      impact: 'Reduces section load by 15%',
      confidence: 76,
      action: 'Divert',
      timeToDecide: 45,
      affectedTrains: ['G-4521'],
      estimatedSavings: 'Improved fluidity'
    }
  ];

  const conflicts = [
    {
      id: 'C1',
      location: 'Mathura Single Line',
      trains: ['12951', '12615'],
      severity: 'Critical',
      timeToConflict: '12 mins',
      description: 'Both trains projected to reach single line section simultaneously'
    },
    {
      id: 'C2', 
      location: 'Tundla Junction',
      trains: ['12650', 'G-4521'],
      severity: 'Medium',
      timeToConflict: '45 mins',
      description: 'Platform occupation conflict - both require same platform'
    }
  ];

  const actionLog = [
    { time: '14:32', action: 'Regulated GT Express at Agra', result: 'Conflict avoided', operator: 'System' },
    { time: '14:28', action: 'Granted precedence to Rajdhani', result: 'On schedule', operator: 'P. Sharma' },
    { time: '14:15', action: 'Diverted Goods via alternate route', result: 'Traffic optimized', operator: 'System' },
  ];

  type AIRecommendation = {
    id: number;
    type: string;
    title: string;
    description: string;
    impact: string;
    confidence: number;
    action: string;
    timeToDecide: number;
    affectedTrains: string[];
    estimatedSavings: string;
  };

  const executeRecommendation = (rec: AIRecommendation) => {
    alert(`Executing: ${rec.title}\nAction: ${rec.action}\nEstimated Impact: ${rec.impact}`);
    // In real app, this would dispatch the actual control orders
  };

  const simulateRecommendation = (rec: AIRecommendation) => {
    alert(`Simulation Results:\n- Impact: ${rec.impact}\n- Confidence: ${rec.confidence}%\n- Affected Trains: ${rec.affectedTrains.join(', ')}\n- Savings: ${rec.estimatedSavings}`);
  };

  const handleDragStart = (train: typeof trainPaths[number]) => {
    setDraggedTrain(train);
  };

  const handlePriorityChange = (trainId: string, newPriority: string) => {
    alert(`Priority changed for ${trainId} to ${newPriority}. Re-calculating optimal paths...`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <img 
              src={railwayLogo}
              alt="Railway Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold">Digital Control Board with AI Assist</h1>
              <p className="text-muted-foreground">Northern Railway - Delhi Division | Section: NDLS-GZB</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium">Section Controller: Priya Sharma</p>
              <p className="text-sm text-muted-foreground">ID: SC002 | Shift: Day</p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              End Shift
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Header */}
      <div className="bg-white border-b p-4">
        <div className="grid grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <span className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</span>
                <span className="text-muted-foreground">{kpi.unit}</span>
              </div>
              <p className="font-medium text-sm">{kpi.label}</p>
              <p className="text-xs text-green-600">{kpi.trend}</p>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border-b">
          <TabsTrigger value="timeline">Digital Timeline</TabsTrigger>
          <TabsTrigger value="conflicts">Conflict Monitor</TabsTrigger>
          <TabsTrigger value="blocks">Engineering Blocks</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Main Panel - Digital Control Graph */}
            <div className="col-span-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Dynamic Train Path Timeline (Digital Control Graph)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Time Header */}
                  <div className="grid grid-cols-12 gap-2 mb-4 text-xs text-center border-b pb-2">
                    {Array.from({ length: 12 }, (_, i) => (
                      <div key={i} className="font-medium">
                        {String(14 + i).padStart(2, '0')}:00
                      </div>
                    ))}
                  </div>

                  {/* Train Paths */}
                  <div className="space-y-4">
                    {trainPaths.map((train) => (
                      <div 
                        key={train.id}
                        className={`p-4 border rounded-lg transition-all ${
                          train.conflict ? 'border-red-300 bg-red-50' : 
                          train.priority === 'High' ? 'border-blue-300 bg-blue-50' :
                          'border-gray-200'
                        }`}
                        draggable
                        onDragStart={() => handleDragStart(train)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-lg">{train.id}</span>
                            <span className="text-muted-foreground">{train.name}</span>
                            <Badge variant={
                              train.priority === 'High' ? 'default' :
                              train.priority === 'Medium' ? 'secondary' : 'outline'
                            } className={
                              train.priority === 'High' ? 'bg-blue-500' :
                              train.priority === 'Medium' ? 'bg-yellow-500' : ''
                            }>
                              {train.priority}
                            </Badge>
                            {train.conflict && (
                              <Badge variant="destructive" className="animate-pulse">
                                CONFLICT
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="text-right">
                              <p className="font-medium">{train.currentLocation}</p>
                              <p className="text-muted-foreground">{train.speed} km/h</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">ETA: {train.eta}</p>
                              {train.delay > 0 && (
                                <p className="text-red-600">+{train.delay} min</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Route Progress Bar */}
                        <div className="flex items-center space-x-4 mb-2">
                          <span className="text-sm font-medium min-w-[60px]">{train.from}</span>
                          <div className="flex-1 relative">
                            <Progress 
                              value={train.progress} 
                              className={`h-3 ${train.conflict ? 'bg-red-100' : ''}`}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                              {train.progress}%
                            </div>
                          </div>
                          <span className="text-sm font-medium min-w-[60px] text-right">{train.to}</span>
                        </div>

                        {/* Interactive Timeline */}
                        <div className="grid grid-cols-12 gap-1 mt-3">
                          {Array.from({ length: 12 }, (_, i) => {
                            const hour = 14 + i;
                            const isInPath = train.progress > (i * 8.33) && train.progress < ((i + 1) * 8.33);
                            const isPassed = train.progress > ((i + 1) * 8.33);
                            
                            return (
                              <div 
                                key={i}
                                className={`h-6 rounded text-xs flex items-center justify-center ${
                                  isPassed ? 'bg-green-300' :
                                  isInPath ? (train.conflict ? 'bg-red-400 animate-pulse' : 'bg-blue-400') :
                                  'bg-gray-200'
                                }`}
                                title={`${hour}:00 - ${isInPath ? 'Current Position' : isPassed ? 'Passed' : 'Future'}`}
                              >
                                {isInPath && '●'}
                              </div>
                            );
                          })}
                        </div>

                        {/* Drag to Change Priority */}
                        <div className="mt-2 flex justify-between items-center text-xs text-muted-foreground">
                          <span>Drag to reorder priority</span>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handlePriorityChange(train.id, 'High')}
                            >
                              Prioritize
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handlePriorityChange(train.id, 'Low')}
                            >
                              Regulate
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - AI Recommendations */}
            <div className="col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span>AI Control Assistant</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiRecommendations.map((rec) => (
                    <div 
                      key={rec.id}
                      className={`p-4 border rounded-lg ${
                        rec.type === 'critical' ? 'border-red-300 bg-red-50' :
                        rec.type === 'warning' ? 'border-yellow-300 bg-yellow-50' :
                        'border-blue-300 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {rec.type === 'critical' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                          {rec.type === 'warning' && <Clock className="w-5 h-5 text-yellow-600" />}
                          {rec.type === 'info' && <Target className="w-5 h-5 text-blue-600" />}
                          <h4 className="font-medium text-sm">{rec.title}</h4>
                        </div>
                        <div className="text-right text-xs">
                          <Badge variant="outline" className="mb-1">
                            {rec.confidence}% confidence
                          </Badge>
                          <p className="text-muted-foreground">
                            Decide in {rec.timeToDecide}m
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {rec.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>
                          <span className="font-medium">Impact:</span>
                          <p>{rec.impact}</p>
                        </div>
                        <div>
                          <span className="font-medium">Savings:</span>
                          <p className="text-green-600">{rec.estimatedSavings}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className={`flex-1 ${
                            rec.type === 'critical' ? 'bg-red-600 hover:bg-red-700' :
                            rec.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                            'bg-blue-600 hover:bg-blue-700'
                          }`}
                          onClick={() => executeRecommendation(rec)}
                        >
                          Execute
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => simulateRecommendation(rec)}
                        >
                          Simulate
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => alert('Recommendation dismissed')}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Action Log */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Recent Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {actionLog.map((action, index) => (
                      <div key={index} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{action.action}</p>
                          <p className="text-green-600 text-xs">{action.result}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{action.time}</p>
                          <p>{action.operator}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="conflicts" className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {conflicts.map((conflict) => (
              <Card key={conflict.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className={`w-5 h-5 ${
                      conflict.severity === 'Critical' ? 'text-red-500' : 'text-yellow-500'
                    }`} />
                    <span>Conflict {conflict.id}: {conflict.location}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Severity:</span>
                      <Badge variant={conflict.severity === 'Critical' ? 'destructive' : 'secondary'}>
                        {conflict.severity}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Time to Conflict:</span>
                      <span className="font-medium text-red-600">{conflict.timeToConflict}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Affected Trains:</span>
                      <span className="font-medium">{conflict.trains.join(', ')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{conflict.description}</p>
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={() => setSelectedConflict(conflict)}
                    >
                      Resolve Conflict
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="blocks" className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Engineering Block Planner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">PWI Block Request: KM 145-150</p>
                        <p className="text-sm">Requested: 14:00-16:00 | Duration: 2 hours</p>
                        <p className="text-sm text-muted-foreground">Rail renewal work - Track Manager: S. Yadav</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Simulate Impact
                        </Button>
                        <Button size="sm" className="bg-green-600">
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          Reject
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}