import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Train, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Zap,
  Leaf,
  Activity,
  BrainCircuit,
  Package
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import TrainManager from './train-management/TrainManager';
import CargoManagement from './train-management/CargoManagement';
import ScheduleTracking from './train-management/ScheduleTracking';
import Analytics from './train-management/Analytics';

export function Dashboard() {
  const currentTime = new Date().toLocaleTimeString();
  
  const trainsInSection = [
    { id: '12951', name: 'Mumbai Rajdhani', status: 'on-time', delay: 0, priority: 'high', nextStation: 'Dadar', eta: '14:25' },
    { id: '12615', name: 'Grand Trunk Express', status: 'delayed', delay: 8, priority: 'medium', nextStation: 'Parel', eta: '14:33' },
    { id: '22926', name: 'Paschim Express', status: 'on-time', delay: 0, priority: 'medium', nextStation: 'Elphinstone', eta: '14:28' },
    { id: 'FREIGHT-401', name: 'Container Freight', status: 'held', delay: 15, priority: 'low', nextStation: 'Lower Parel', eta: 'TBD' },
  ];

  const metrics = {
    totalTrains: 24,
    onTime: 18,
    delayed: 4,
    held: 2,
    sectionCapacity: 85,
    avgDelay: 4.2,
    energySaved: 12.5,
    co2Reduced: 8.3
  };

  const aiRecommendations = [
    {
      type: 'precedence',
      message: 'Give precedence to Train 12951 (Rajdhani) at Junction J-4',
      impact: 'Saves 3 minutes system-wide delay',
      action: 'Accept',
      priority: 'high'
    },
    {
      type: 'routing',
      message: 'Route Freight-401 via Platform 3 to avoid passenger conflict',
      impact: 'Prevents 12-minute delay for Express trains',
      action: 'Review',
      priority: 'medium'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Section Capacity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sectionCapacity}%</div>
            <Progress value={metrics.sectionCapacity} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.totalTrains} trains active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Punctuality</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((metrics.onTime / metrics.totalTrains) * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.onTime} of {metrics.totalTrains} on time
            </p>
            <div className="flex space-x-2 mt-2">
              <Badge variant="outline" className="text-green-600">
                {metrics.onTime} On Time
              </Badge>
              <Badge variant="outline" className="text-orange-600">
                {metrics.delayed} Delayed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trains</CardTitle>
            <Train className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTrains}</div>
            <p className="text-xs text-muted-foreground">In operation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Delay</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgDelay} min</div>
            <p className="text-xs text-green-600">↓ 2.1 min from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Energy Efficiency</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.energySaved}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.co2Reduced} kg CO₂ saved today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BrainCircuit className="h-5 w-5 mr-2" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiRecommendations.map((rec, index) => (
            <Alert key={index} className={rec.priority === 'high' ? 'border-orange-200 bg-orange-50' : ''}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{rec.message}</p>
                  <p className="text-sm text-muted-foreground mt-1">{rec.impact}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    {rec.action}
                  </Button>
                  <Button size="sm" variant="ghost">
                    Dismiss
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Train Status Card */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Train Status</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-3">
              {trainsInSection.map((train) => (
                <div 
                  key={train.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{train.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Next: {train.nextStation} • ETA: {train.eta}
                    </p>
                  </div>
                  {train.status === 'on-time' ? (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
                      On Time
                    </Badge>
                  ) : train.status === 'delayed' ? (
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                      {train.delay} min late
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400">
                      Held
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Freight Management Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-semibold">Freight Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Tabs defaultValue="train-manager" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-9">
                <TabsTrigger value="train-manager" className="text-xs">Train</TabsTrigger>
                <TabsTrigger value="cargo" className="text-xs">Cargo</TabsTrigger>
                <TabsTrigger value="schedule" className="text-xs">Schedule</TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
              </TabsList>
              
              <div className="mt-4 rounded-lg border p-4">
                <TabsContent value="train-manager" className="m-0">
                  <TrainManager />
                </TabsContent>
                
                <TabsContent value="cargo" className="m-0">
                  <CargoManagement />
                </TabsContent>
                
                <TabsContent value="schedule" className="m-0">
                  <ScheduleTracking />
                </TabsContent>
                
                <TabsContent value="analytics" className="m-0">
                  <Analytics />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Section Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Platform 1</span>
                <Badge variant="outline" className="text-green-600">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Platform 2</span>
                <Badge variant="destructive">Occupied - Train 12951</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Platform 3</span>
                <Badge variant="outline" className="text-green-600">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Junction J-4</span>
                <Badge variant="secondary">Pending Decision</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Signal System</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span>AI Engine</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span>Communication</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span>Last Update</span>
                <span className="text-sm text-muted-foreground">{currentTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}