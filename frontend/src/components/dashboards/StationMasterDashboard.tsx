import { useState } from 'react';
import { Button } from '../ui/button.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.js';
import { Badge } from '../ui/badge.js';
import { Clock, Train, MapPin, AlertTriangle, Phone, FileText, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.js';
import { Alert, AlertDescription } from '../ui/alert.js';
import railwayLogo from 'figma:asset/de6da6a664b190e144e4d86f4481b866fee10e67.png';

export function StationMasterDashboard() {
  const [selectedTrain, setSelectedTrain] = useState<typeof upcomingTrains[number] | null>(null);
  const [routeSet, setRouteSet] = useState<Record<string, string>>({});
  const [controlOrders, setControlOrders] = useState([
    {
      id: 1,
      time: '14:25',
      message: 'Take 12951 Rajdhani on Platform 1. Dispatch immediately after halt.',
      acknowledged: false,
      train: '12951'
    },
    {
      id: 2,
      time: '14:30',
      message: 'Give precedence to 12615 over goods train G-4521 at outer signal.',
      acknowledged: false,
      train: '12615'
    }
  ]);
  
  const upcomingTrains = [
    { 
      id: '12951', 
      name: 'Rajdhani Express', 
      platform: 'Platform 1', 
      eta: '14:30', 
      scheduled: '14:30',
      status: 'Approaching - 2km out', 
      type: 'Arrival',
      locoPilot: 'Ramesh Kumar',
      guard: 'Sunil Yadav',
      load: '18 coaches',
      origin: 'NDLS',
      destination: 'BCT'
    },
    { 
      id: '12952', 
      name: 'Shatabdi Express', 
      platform: 'Platform 2', 
      eta: '15:25', 
      scheduled: '15:15',
      status: 'Delayed 10 min', 
      type: 'Departure',
      locoPilot: 'Amit Singh',
      guard: 'Raj Kumar',
      load: '16 coaches',
      origin: 'NDLS',
      destination: 'BCT'
    },
    { 
      id: '12615', 
      name: 'Grand Trunk Express', 
      platform: 'Platform 3', 
      eta: '16:45', 
      scheduled: '16:45',
      status: 'On Time', 
      type: 'Arrival',
      locoPilot: 'Pradeep Mishra',
      guard: 'Vinod Sharma',
      load: '22 coaches',
      origin: 'CSTM',
      destination: 'NZM'
    }
  ];

  const trackLayout = [
    { id: 'P1', name: 'Platform 1', status: 'clear', train: null, signal: 'red' },
    { id: 'P2', name: 'Platform 2', status: 'occupied', train: '12952', signal: 'green' },
    { id: 'P3', name: 'Platform 3', status: 'clear', train: null, signal: 'red' },
    { id: 'P4', name: 'Platform 4', status: 'clear', train: null, signal: 'red' },
    { id: 'L1', name: 'Loop Line 1', status: 'clear', train: null, signal: 'red' },
    { id: 'L2', name: 'Loop Line 2', status: 'maintenance', train: null, signal: 'red' },
  ];

  const acknowledgeOrder = (orderId: number) => {
    setControlOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, acknowledged: true } : order
    ));
    alert('Order acknowledged and repeated back to Control');
  };

  const setRoute = (trainId: string, platform: string) => {
    setRouteSet(prev => ({ ...prev, [trainId]: platform }));
    alert(`Route set for ${trainId} to ${platform} - Signals aligned automatically`);
  };

  const reportArrival = (train: typeof upcomingTrains[number]) => {
    alert(`Arrival reported to Control: ${train.id} arrived at ${new Date().toLocaleTimeString()}`);
  };

  const reportDeparture = (train: typeof upcomingTrains[number]) => {
    alert(`Departure reported to Control: ${train.id} departed at ${new Date().toLocaleTimeString()}`);
  };

  const grantLineClear = (train: typeof upcomingTrains[number]) => {
    alert(`Line Clear granted to next station for ${train.id}`);
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
              <h1 className="text-xl font-bold">Station Operations Terminal</h1>
              <p className="text-muted-foreground">New Delhi Railway Station (NDLS)</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium">Station Master: Rajesh Kumar</p>
              <p className="text-sm text-muted-foreground">ID: SM001 | Shift: Day</p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              End Shift
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="operations" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border-b">
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="control-orders">Control Orders</TabsTrigger>
          <TabsTrigger value="incidents">Incident Report</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Upcoming Movements */}
            <div className="col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Upcoming Movements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingTrains.map((train) => (
                    <div 
                      key={train.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                        selectedTrain?.id === train.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedTrain(train)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">{train.id}</span>
                        <Badge variant={train.type === 'Arrival' ? 'default' : 'secondary'}>
                          {train.type}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm">{train.name}</p>
                      <p className="text-sm text-muted-foreground">{train.platform}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <span className="text-sm font-medium">ETA: {train.eta}</span>
                          {train.scheduled !== train.eta && (
                            <p className="text-xs text-muted-foreground">Sch: {train.scheduled}</p>
                          )}
                        </div>
                        <Badge 
                          variant={train.status.includes('On Time') ? 'default' : train.status.includes('Delayed') ? 'destructive' : 'secondary'}
                          className={train.status.includes('On Time') ? 'bg-green-500' : ''}
                        >
                          {train.status.includes('Delayed') ? 'Delayed' : 
                           train.status.includes('On Time') ? 'On Time' : 'Approaching'}
                        </Badge>
                      </div>
                      
                      {routeSet[train.id] && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                          ✓ Route Set - Signals Aligned
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Center Column - Digital Station Mimic */}
            <div className="col-span-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Train className="w-5 h-5" />
                    <span>Digital Station Mimic & Control</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {trackLayout.map((track) => (
                      <div 
                        key={track.id}
                        className={`p-4 border-2 rounded-lg text-center transition-all relative ${
                          track.status === 'occupied' ? 'border-red-500 bg-red-50' :
                          track.status === 'maintenance' ? 'border-yellow-500 bg-yellow-50' :
                          selectedTrain && routeSet[selectedTrain.id] === track.name ? 'border-blue-500 bg-blue-50' :
                          'border-green-500 bg-green-50'
                        }`}
                      >
                        <div className="font-medium">{track.name}</div>
                        <div className={`text-sm mt-1 ${
                          track.status === 'occupied' ? 'text-red-600' :
                          track.status === 'maintenance' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {track.status === 'occupied' ? `Train ${track.train}` :
                           track.status === 'maintenance' ? 'Under Maintenance' :
                           selectedTrain && routeSet[selectedTrain.id] === track.name ? 'Route Set' :
                           'Available'}
                        </div>
                        
                        {/* Signal Indicator */}
                        <div className="mt-2 flex justify-center">
                          <div className={`w-4 h-4 rounded-full ${
                            track.signal === 'green' ? 'bg-green-500' :
                            track.signal === 'yellow' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`} title={`Signal: ${track.signal}`}></div>
                        </div>
                        
                        {track.status === 'occupied' && (
                          <div className="w-full h-2 bg-red-500 rounded-full mt-2"></div>
                        )}
                        {track.status === 'clear' && (!selectedTrain || !routeSet[selectedTrain.id]) && (
                          <div className="w-full h-2 bg-green-500 rounded-full mt-2"></div>
                        )}
                        {selectedTrain && routeSet[selectedTrain.id] === track.name && (
                          <div className="w-full h-2 bg-blue-500 rounded-full mt-2"></div>
                        )}
                        {track.status === 'maintenance' && (
                          <div className="w-full h-2 bg-yellow-500 rounded-full mt-2"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Route Visualization */}
                  {selectedTrain && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium mb-2">Proposed Route for {selectedTrain.id}</h4>
                      <p className="text-sm text-muted-foreground">
                        Entry Signal → {selectedTrain.platform} → Departure Signal
                      </p>
                      {!routeSet[selectedTrain.id] && (
                        <Button 
                          onClick={() => setRoute(selectedTrain.id, selectedTrain.platform)}
                          className="mt-2 bg-green-600 hover:bg-green-700"
                        >
                          Set Route & Align Signals
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Train in Focus & Actions */}
            <div className="col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Train in Focus</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTrain ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-lg">{selectedTrain.id}</h3>
                        <p className="text-muted-foreground">{selectedTrain.name}</p>
                        <p className="text-sm">{selectedTrain.origin} → {selectedTrain.destination}</p>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Platform:</span>
                          <span className="font-medium">{selectedTrain.platform}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ETA:</span>
                          <span className="font-medium">{selectedTrain.eta}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="font-medium">{selectedTrain.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Loco Pilot:</span>
                          <span className="font-medium">{selectedTrain.locoPilot}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Guard:</span>
                          <span className="font-medium">{selectedTrain.guard}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Load:</span>
                          <span className="font-medium">{selectedTrain.load}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {selectedTrain.type === 'Arrival' && !routeSet[selectedTrain.id] && (
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => setRoute(selectedTrain.id, selectedTrain.platform)}
                          >
                            Set Route for Arrival
                          </Button>
                        )}
                        
                        {selectedTrain.type === 'Arrival' && routeSet[selectedTrain.id] && (
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => reportArrival(selectedTrain)}
                          >
                            Report Arrival to Control
                          </Button>
                        )}
                        
                        {selectedTrain.type === 'Departure' && (
                          <>
                            <Button 
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => grantLineClear(selectedTrain)}
                            >
                              Grant Line Clear
                            </Button>
                            <Button 
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => reportDeparture(selectedTrain)}
                            >
                              Report Departure
                            </Button>
                          </>
                        )}
                        
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => alert('Detention logged with reason')}
                        >
                          Log Detention
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Train className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Select a train from the movements list</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="control-orders" className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Control Order Register</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {controlOrders.map((order) => (
                <Alert key={order.id} className={!order.acknowledged ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">Control Order #{order.id} - {order.time}</p>
                        <p className="mt-1">{order.message}</p>
                        <p className="text-sm text-muted-foreground mt-1">Train: {order.train}</p>
                      </div>
                      {!order.acknowledged ? (
                        <Button 
                          size="sm"
                          onClick={() => acknowledgeOrder(order.id)}
                          className="ml-4"
                        >
                          Acknowledge & Repeat Back
                        </Button>
                      ) : (
                        <div className="flex items-center ml-4 text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">Acknowledged</span>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
              
              {controlOrders.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No pending control orders</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span>Emergency Reporting</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  size="lg" 
                  variant="destructive"
                  className="w-full py-6 text-lg"
                  onClick={() => alert('ACCIDENT REPORTED - Emergency services notified')}
                >
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  Report Accident
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full py-6 text-lg border-red-500 text-red-700 hover:bg-red-50"
                  onClick={() => alert('Signal failure reported to Control & Engineering')}
                >
                  Signal Failure
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full py-6 text-lg border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                  onClick={() => alert('Track defect reported to PWI & Control')}
                >
                  Track Defect
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full py-6 text-lg border-blue-500 text-blue-700 hover:bg-blue-50"
                  onClick={() => alert('Medical emergency - Ambulance requested')}
                >
                  Medical Emergency
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="font-medium">14:15 - Platform 2 cleaning in progress</p>
                    <p className="text-muted-foreground">Housekeeping team notified</p>
                  </div>
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="font-medium">13:45 - Signal fault at Junction A2</p>
                    <p className="text-muted-foreground">Engineering team dispatched</p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="font-medium">12:30 - Medical emergency resolved</p>
                    <p className="text-muted-foreground">Passenger assisted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}