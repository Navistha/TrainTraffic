import React, { useState } from 'react';
import { Button } from '../ui/button.js';
import { LogoutButton } from '../LogoutButton.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.js';
import { Badge } from '../ui/badge.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.js';
import { Progress } from '../ui/progress.js';
import { Alert, AlertDescription } from '../ui/alert.js';
import { showToast } from '../ui/toast.js';
import ConfirmModal from '../ui/confirm.js';
import { Truck, Package, MapPin, Calendar, Clock, TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react';
import railwayLogo from 'figma:asset/de6da6a664b190e144e4d86f4481b866fee10e67.png';

type Indent = {
  id: string;
  commodity: string;
  quantity: number;
  origin: string;
  destination: string;
  priority: string;
  days: number;
  requester: string;
  wagonType: string;
  wagonRequired: number;
  urgencyScore: number;
  penaltyRisk: string;
};

type WagonSource = {
  location: string;
  type: string;
  count: number;
  capacity: number;
  distance: string;
  emptyRunCost: string;
  availability: string;
  matchScore: number;
};

export function FreightOperatorDashboard() {
  const [selectedIndent, setSelectedIndent] = useState<Indent | null>(null);
  const [selectedWagonSource, setSelectedWagonSource] = useState<WagonSource | null>(null);

  const kpis = [
    { label: 'Total Wagons', value: 2847, unit: '', trend: '+45', color: 'text-primary' },
    { label: 'Empty Wagons', value: 1205, unit: '', trend: '+12', color: 'text-green-600' },
    { label: 'Pending Indents', value: 28, unit: '', trend: '-5', color: 'text-yellow-600' },
    { label: 'Loading Efficiency', value: 87, unit: '%', trend: '+3%', color: 'text-blue-600' },
  ];

  const pendingIndents = [
    { 
      id: 'IN001', 
      commodity: 'Coal', 
      quantity: 500, 
      origin: 'Jharia', 
      destination: 'Mumbai', 
      priority: 'High', 
      days: 5,
      requester: 'NTPC Ltd',
      wagonType: 'BOXN',
      wagonRequired: 9,
      urgencyScore: 95,
      penaltyRisk: '₹4.2L'
    },
    { 
      id: 'IN002', 
      commodity: 'Steel', 
      quantity: 200, 
      origin: 'Jamshedpur', 
      destination: 'Chennai', 
      priority: 'Medium', 
      days: 3,
      requester: 'Tata Steel',
      wagonType: 'BCNA',
      wagonRequired: 4,
      urgencyScore: 72,
      penaltyRisk: '₹1.8L'
    },
    { 
      id: 'IN003', 
      commodity: 'Cement', 
      quantity: 150, 
      origin: 'Satna', 
      destination: 'Delhi', 
      priority: 'Low', 
      days: 1,
      requester: 'UltraTech',
      wagonType: 'BCNA',
      wagonRequired: 3,
      urgencyScore: 45,
      penaltyRisk: '₹0.8L'
    },
    { 
      id: 'IN004', 
      commodity: 'Iron Ore', 
      quantity: 800, 
      origin: 'Goa', 
      destination: 'Vizag', 
      priority: 'High', 
      days: 7,
      requester: 'SAIL',
      wagonType: 'BOXN',
      wagonRequired: 14,
      urgencyScore: 98,
      penaltyRisk: '₹6.5L'
    },
  ];

  const availableWagons = [
    { 
      location: 'Kalyan Yard', 
      type: 'BOXN', 
      count: 45, 
      capacity: 58.8, 
      distance: '1240 km',
      emptyRunCost: '₹2.1L',
      availability: 'Immediate',
      matchScore: 85
    },
    { 
      location: 'Tughlakabad', 
      type: 'BCNA', 
      count: 32, 
      capacity: 60.0, 
      distance: '28 km',
      emptyRunCost: '₹0.4L',
      availability: 'Immediate',
      matchScore: 92
    },
    { 
      location: 'Whitefield', 
      type: 'BOXN', 
      count: 28, 
      capacity: 58.8, 
      distance: '2100 km',
      emptyRunCost: '₹3.8L',
      availability: 'Tomorrow',
      matchScore: 65
    },
    { 
      location: 'Vadodara', 
      type: 'BOBR', 
      count: 15, 
      capacity: 59.0, 
      distance: '950 km',
      emptyRunCost: '₹1.7L',
      availability: 'Immediate',
      matchScore: 78
    },
    { 
      location: 'Sonpur', 
      type: 'BCFC', 
      count: 22, 
      capacity: 55.0, 
      distance: '980 km',
      emptyRunCost: '₹1.8L',
      availability: '2 days',
      matchScore: 58
    },
  ];

  const activeOrders = [
    { 
      id: 'SO001', 
      train: 'FG-4521', 
      commodity: 'Coal', 
      wagons: 45, 
      route: 'Jharia-Mumbai', 
      status: 'In Transit', 
      completion: 65,
      eta: '18:30',
      currentLocation: 'Passing Nagpur'
    },
    { 
      id: 'SO002', 
      train: 'FG-4522', 
      commodity: 'Steel', 
      wagons: 25, 
      route: 'Jamshedpur-Chennai', 
      status: 'Loading', 
      completion: 15,
      eta: 'TBD',
      currentLocation: 'At Origin'
    },
    { 
      id: 'SO003', 
      train: 'FG-4523', 
      commodity: 'Cement', 
      wagons: 18, 
      route: 'Satna-Delhi', 
      status: 'Ready', 
      completion: 100,
      eta: 'Dispatched',
      currentLocation: 'Departed Satna'
    },
  ];

  const smartMatches: WagonSource[] = selectedIndent ? availableWagons
    .filter((wagon: WagonSource) => wagon.type === selectedIndent.wagonType || 
                   (selectedIndent.wagonType === 'BOXN' && ['BOBR', 'BCNA'].includes(wagon.type)))
    .sort((a: WagonSource, b: WagonSource) => b.matchScore - a.matchScore)
    .slice(0, 3) : [];

  const handleSmartMatch = (indent: Indent, wagons: WagonSource) => {
    showToast(`SMART ALLOTMENT CREATED\n\nIndent: ${indent.id} - ${indent.commodity}\nWagons: ${wagons.count} x ${wagons.type} from ${wagons.location}\nEmpty Run Cost: ${wagons.emptyRunCost}\nMatch Score: ${wagons.matchScore}%\n\nSupply order dispatched to Section Controller.`);
  };

  const handleManualAllot = (indent: Indent, wagons: WagonSource) => {
    showToast(`Manual allotment created for ${indent.commodity} using ${wagons.count} wagons from ${wagons.location}`);
  };

  // Action log + confirmation state for anchored popovers
  const [actionLog, setActionLog] = useState<any[]>([{ time: new Date().toLocaleTimeString(), action: 'Freight Operator opened dashboard', result: 'Ready', operator: 'User' }]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState<string | undefined>(undefined);
  const [confirmMessage, setConfirmMessage] = useState<string | undefined>(undefined);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmAnchor, setConfirmAnchor] = useState<DOMRect | null>(null);

  const showConfirm = (title: string, message: string, onConfirm: () => void, anchorRect?: DOMRect | null) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
    setConfirmAnchor(anchorRect ?? null);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmAction(null);
    setConfirmTitle(undefined);
    setConfirmMessage(undefined);
    setConfirmAnchor(null);
  };

  // Wrapped handlers that use confirmation before performing actions
  const confirmSmartMatch = (indent: Indent, wagons: WagonSource, anchorRect?: DOMRect | null) => {
    showConfirm(
      'Confirm Smart Allotment',
      `Create allotment for ${indent.id} - ${indent.commodity} using ${wagons.count} x ${wagons.type} from ${wagons.location}?`,
      () => {
        const msg = `SMART ALLOTMENT CREATED - ${indent.id} assigned ${wagons.count} ${wagons.type} from ${wagons.location}`;
        showToast(msg);
        setActionLog(prev => [{ time: new Date().toLocaleTimeString(), action: `Smart Allot ${indent.id}`, result: msg, operator: localStorage.getItem('userName') || 'User' }, ...prev]);
      },
      anchorRect
    );
  };

  const confirmManualAllot = (indent: Indent, wagons: WagonSource, anchorRect?: DOMRect | null) => {
    showConfirm(
      'Confirm Manual Allotment',
      `Manually allot ${wagons.count} x ${wagons.type} from ${wagons.location} to ${indent.id}?`,
      () => {
        const msg = `Manual allotment created for ${indent.id} using ${wagons.count} wagons from ${wagons.location}`;
        showToast(msg);
        setActionLog(prev => [{ time: new Date().toLocaleTimeString(), action: `Manual Allot ${indent.id}`, result: msg, operator: localStorage.getItem('userName') || 'User' }, ...prev]);
      },
      anchorRect
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <ConfirmModal
        open={confirmOpen}
        title={confirmTitle ?? ''}
        message={confirmMessage ?? ''}
        anchorRect={confirmAnchor ?? null}
        onConfirm={() => { if (confirmAction) { confirmAction(); } closeConfirm(); }}
        onCancel={closeConfirm}
      />
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
              <h1 className="text-xl font-bold">Freight Allotment & Logistics Hub</h1>
              <p className="text-muted-foreground">Northern Railway Freight Division | Smart Wagon Management</p>
            </div>
          </div>
            <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium">Freight Operator: {localStorage.getItem('userName') || 'Operator'}</p>
              <p className="text-sm text-muted-foreground">ID: {localStorage.getItem('userGovtId') || 'Unknown'} | Shift: Day</p>
            </div>
            <LogoutButton label="End Shift" />
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

      <Tabs defaultValue="allotment" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border-b">
          <TabsTrigger value="allotment">Smart Allotment</TabsTrigger>
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Hub</TabsTrigger>
        </TabsList>

        <TabsContent value="allotment" className="p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Panel - Demand (Pending Indents) */}
            <div className="col-span-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-red-500" />
                    <span>Demand Queue - Pending Indents</span>
                    <Badge variant="destructive">{pendingIndents.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingIndents.map((indent) => (
                      <div 
                        key={indent.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          indent.days >= 5 ? 'border-red-300 bg-red-50 animate-pulse' : 
                          indent.days >= 3 ? 'border-yellow-300 bg-yellow-50' :
                          'border-gray-200 hover:bg-accent'
                        } ${
                          selectedIndent?.id === indent.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedIndent(indent)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold">{indent.id}</span>
                            <Badge variant={
                              indent.priority === 'High' ? 'destructive' :
                              indent.priority === 'Medium' ? 'default' : 'secondary'
                            } className={
                              indent.priority === 'High' ? 'bg-red-500' :
                              indent.priority === 'Medium' ? 'bg-yellow-500' : ''
                            }>
                              {indent.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Score: {indent.urgencyScore}
                            </Badge>
                          </div>
                          <div className="text-right">
                            {indent.days >= 5 && (
                              <Badge variant="destructive" className="mb-1">
                                CRITICAL
                              </Badge>
                            )}
                            <p className={`text-sm font-medium ${
                              indent.days >= 5 ? 'text-red-600' : 
                              indent.days >= 3 ? 'text-yellow-600' : ''
                            }`}>
                              {indent.days} days pending
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <p className="font-medium">{indent.commodity}</p>
                            <p className="text-muted-foreground">{indent.quantity} MT</p>
                          </div>
                          <div>
                            <p className="font-medium">{indent.wagonRequired} x {indent.wagonType}</p>
                            <p className="text-muted-foreground">{indent.requester}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">
                            {indent.origin} → {indent.destination}
                          </span>
                          <span className="font-medium text-red-600">
                            Risk: {indent.penaltyRisk}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Supply (Available Wagons) */}
            <div className="col-span-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-green-500" />
                    <span>Supply Sources - Available Wagons</span>
                    {selectedIndent && (
                      <Badge variant="outline">
                        Filtered for {selectedIndent.wagonType}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Smart Matches Section */}
                  {selectedIndent && smartMatches.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <h4 className="font-medium">AI Smart Matches for {selectedIndent.id}</h4>
                      </div>
                      <div className="space-y-3">
                        {smartMatches.map((wagon, index) => (
                          <Alert key={index} className="border-green-300 bg-green-50">
                            <Target className="h-4 w-4" />
                            <AlertDescription>
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">
                                    #{index + 1} Match: {wagon.count} x {wagon.type} at {wagon.location}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Distance: {wagon.distance} | Cost: {wagon.emptyRunCost} | Available: {wagon.availability}
                                  </p>
                                  <Badge variant="outline" className="mt-1">
                                    Match Score: {wagon.matchScore}%
                                  </Badge>
                                </div>
                                <Button 
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={(e: React.MouseEvent<HTMLElement>) => {
                                    e.stopPropagation();
                                    confirmSmartMatch(selectedIndent, wagon, (e.currentTarget as HTMLElement).getBoundingClientRect());
                                  }}
                                >
                                  Smart Allot
                                </Button>
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Available Wagons */}
                  <div className="space-y-3">
                    <h4 className="font-medium">All Available Wagon Sources</h4>
                    {availableWagons.map((wagon, index) => (
                      <div 
                        key={index}
                        className={`p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer ${
                          selectedIndent && !wagon.type.includes(selectedIndent.wagonType) && 
                          selectedIndent.wagonType !== 'BOXN' ? 'opacity-50' : ''
                        }`}
                        onClick={() => setSelectedWagonSource(wagon)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{wagon.location}</span>
                            <Badge variant="outline">
                              {wagon.type}
                            </Badge>
                            {selectedIndent && smartMatches.find(m => m.location === wagon.location) && (
                              <Badge variant="default" className="bg-green-500">
                                Smart Match
                              </Badge>
                            )}
                          </div>
                          <Badge variant={
                            wagon.availability === 'Immediate' ? 'default' :
                            wagon.availability === 'Tomorrow' ? 'secondary' : 'outline'
                          } className={
                            wagon.availability === 'Immediate' ? 'bg-green-500' : ''
                          }>
                            {wagon.availability}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Available:</span>
                            <p className="font-medium">{wagon.count} wagons</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Capacity:</span>
                            <p className="font-medium">{wagon.capacity}T each</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Distance:</span>
                            <p className="font-medium">{wagon.distance}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Empty Run Cost: {wagon.emptyRunCost}
                          </span>
                          {selectedIndent && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                confirmManualAllot(selectedIndent, wagon, (e.currentTarget as HTMLElement).getBoundingClientRect());
                              }}
                            >
                              Manual Allot
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Selected Pairing Summary */}
          {selectedIndent && selectedWagonSource && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Allotment Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                    <div className="grid grid-cols-3 gap-6 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-medium mb-2">Demand Details</h4>
                    <p><strong>{selectedIndent.id}</strong> - {selectedIndent.commodity}</p>
                    <p>{selectedIndent.quantity} MT requiring {selectedIndent.wagonRequired} wagons</p>
                    <p className="text-sm text-muted-foreground">{selectedIndent.origin} → {selectedIndent.destination}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Supply Details</h4>
                    <p><strong>{selectedWagonSource.location}</strong></p>
                    <p>{selectedWagonSource.count} x {selectedWagonSource.type} available</p>
                    <p className="text-sm text-muted-foreground">Empty run: {selectedWagonSource.distance}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Economic Impact</h4>
                    <p>Empty Run Cost: {selectedWagonSource.emptyRunCost}</p>
                    <p>Penalty Savings: {selectedIndent.penaltyRisk}</p>
                    <Button 
                      className="mt-2 w-full bg-green-600 hover:bg-green-700"
                      onClick={(e: React.MouseEvent<HTMLElement>) => confirmSmartMatch(selectedIndent, selectedWagonSource, (e.currentTarget as HTMLElement).getBoundingClientRect())}
                    >
                      Confirm Allotment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tracking" className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Active Supply Orders - Real-time Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                {activeOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{order.id}</h3>
                        <p className="text-muted-foreground">{order.commodity} - {order.wagons} wagons</p>
                      </div>
                      <Badge 
                        variant={
                          order.status === 'In Transit' ? 'default' :
                          order.status === 'Loading' ? 'secondary' : 'default'
                        }
                        className={
                          order.status === 'In Transit' ? 'bg-blue-500' :
                          order.status === 'Loading' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-muted-foreground">Train:</span>
                        <p className="font-medium">{order.train}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Route:</span>
                        <p className="font-medium">{order.route}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Current Location:</span>
                        <p className="font-medium">{order.currentLocation}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ETA:</span>
                        <p className="font-medium">{order.eta}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Journey Progress</span>
                        <span>{order.completion}%</span>
                      </div>
                      <Progress value={order.completion} className="h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Divisional Stock Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'BOXN', total: 1250, empty: 520, loading: 180, loaded: 550 },
                    { type: 'BCNA', total: 890, empty: 345, loading: 120, loaded: 425 },
                    { type: 'BOBR', total: 420, empty: 180, loading: 60, loaded: 180 },
                    { type: 'BCFC', total: 287, empty: 160, loading: 40, loaded: 87 }
                  ].map((wagon) => (
                    <div key={wagon.type} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{wagon.type}</span>
                        <span className="text-sm text-muted-foreground">Total: {wagon.total}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="bg-green-100 p-2 rounded">
                            <p className="font-medium">{wagon.empty}</p>
                            <p className="text-muted-foreground">Empty</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="bg-yellow-100 p-2 rounded">
                            <p className="font-medium">{wagon.loading}</p>
                            <p className="text-muted-foreground">Loading</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="bg-blue-100 p-2 rounded">
                            <p className="font-medium">{wagon.loaded}</p>
                            <p className="text-muted-foreground">Loaded</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Indent Fulfillment Rate</span>
                      <span className="font-medium">94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Average Allotment Time</span>
                      <span className="font-medium">2.3 hours</span>
                    </div>
                    <Progress value={77} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Empty Run Optimization</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Today's Targets</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Indents to Clear:</span>
                        <span className="font-medium">18/28</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Critical Priority:</span>
                        <span className="font-medium text-red-600">4 pending</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Revenue at Risk:</span>
                        <span className="font-medium text-red-600">₹12.3L</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      {/* Recent Actions */}
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {actionLog.length === 0 && <div className="text-muted-foreground">No recent actions</div>}
              {actionLog.map((a, idx) => (
                <div key={idx} className="p-2 border rounded bg-white">
                  <div className="font-medium">{a.action}</div>
                  <div className="text-muted-foreground text-xs">{a.time} — {a.result}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}