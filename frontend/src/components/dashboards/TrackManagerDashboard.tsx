import { useState } from 'react';
import { Button } from '../ui/button.js';
import { LogoutButton } from '../LogoutButton.js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.js';
import { Badge } from '../ui/badge.js';
import { Checkbox } from '../ui/checkbox.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.js';
import { Progress } from '../ui/progress.js';
import { Alert, AlertDescription } from '../ui/alert.js';
import { Map, CheckSquare, AlertTriangle, Camera, Calendar, MapPin, Wrench, Clock, Target, Zap } from 'lucide-react';
import railwayLogo from 'figma:asset/de6da6a664b190e144e4d86f4481b866fee10e67.png';

export function TrackManagerDashboard() {
  type TrackSection = {
    id: string;
    status: string;
    lastInspection: string;
    nextDue: string;
    healthScore: number;
    defects: number;
    speedRestriction: string | null;
  };
  const [selectedSection, setSelectedSection] = useState<TrackSection | null>(null);
  const [taskProgress, setTaskProgress] = useState<Record<string, boolean>>({});
  const [photoCount, setPhotoCount] = useState(0);

  const trackSections = [
    { 
      id: 'KM-45-50', 
      status: 'good', 
      lastInspection: '2025-09-12', 
      nextDue: '2025-09-19',
      healthScore: 85,
      defects: 0,
      speedRestriction: null
    },
    { 
      id: 'KM-50-55', 
      status: 'warning', 
      lastInspection: '2025-09-10', 
      nextDue: '2025-09-17',
      healthScore: 72,
      defects: 2,
      speedRestriction: '60 km/h'
    },
    { 
      id: 'KM-55-60', 
      status: 'critical', 
      lastInspection: '2025-09-08', 
      nextDue: '2025-09-15',
      healthScore: 45,
      defects: 5,
      speedRestriction: '30 km/h'
    },
    { 
      id: 'KM-60-65', 
      status: 'good', 
      lastInspection: '2025-09-14', 
      nextDue: '2025-09-21',
      healthScore: 90,
      defects: 0,
      speedRestriction: null
    },
  ];

  const tasks = [
    {
      id: 1,
      title: 'Visual Inspection - KM 52.5',
      priority: 'High',
      due: 'Today',
      type: 'Inspection',
      estimatedTime: '45 mins',
      location: 'KM 52.5',
      checklist: [
        'Check rail alignment and gauge',
        'Inspect fishplates and bolts',
        'Verify ballast condition and drainage',
        'Check sleeper condition and spacing',
        'Document any irregularities'
      ]
    },
    {
      id: 2,
      title: 'Joint Replacement - KM 58.2',
      priority: 'Critical',
      due: 'Today',
      type: 'Repair',
      estimatedTime: '2 hours',
      location: 'KM 58.2',
      checklist: [
        'Request and confirm engineering block',
        'Remove old fishplates and bolts',
        'Install new fishplates',
        'Torque bolts to specification (250 Nm)',
        'Test joint with bar and restore section'
      ]
    },
    {
      id: 3,
      title: 'Ultrasonic Testing - KM 47.8',
      priority: 'Medium',
      due: 'Tomorrow',
      type: 'Testing',
      estimatedTime: '90 mins',
      location: 'KM 47.8',
      checklist: [
        'Calibrate UT equipment with test block',
        'Test rail head for surface defects',
        'Test rail web for internal flaws',
        'Document all readings and findings',
        'Mark any defects with spray paint'
      ]
    }
  ];

  const blockRequests = [
    {
      id: 'BR001',
      section: 'KM 58.0 - 59.0',
      requestedTime: '14:00-16:00',
      purpose: 'Joint replacement work',
      status: 'Pending',
      urgency: 'Critical'
    },
    {
      id: 'BR002',
      section: 'KM 62.0 - 63.5',
      requestedTime: '10:00-12:00 Tomorrow',
      purpose: 'Ballast cleaning',
      status: 'Approved',
      urgency: 'Medium'
    }
  ];

  const recentDefects = [
    {
      id: 'DEF001',
      location: 'KM 55.8',
      type: 'Rail Crack',
      severity: 'Critical',
      reportedAt: '13:45',
      action: 'Speed restriction imposed'
    },
    {
      id: 'DEF002',
      location: 'KM 51.2',
      type: 'Loose Fishplate',
      severity: 'Medium',
      reportedAt: '12:30',
      action: 'Repair scheduled'
    }
  ];

  const toggleChecklistItem = (taskId: number, itemIndex: number) => {
    setTaskProgress(prev => ({
      ...prev,
      [`${taskId}-${itemIndex}`]: !prev[`${taskId}-${itemIndex}`]
    }));
  };

  const getTaskCompletion = (taskId: number, checklistLength: number): number => {
    let completed = 0;
    for (let i = 0; i < checklistLength; i++) {
      if (taskProgress[`${taskId}-${i}`]) completed++;
    }
    return Math.round((completed / checklistLength) * 100);
  };

  const reportIncident = (type: string) => {
    alert(`${type} reported successfully!\n\nGPS Location: Automatically captured\nPhotos: ${photoCount} attached\nTime: ${new Date().toLocaleTimeString()}\n\nAlert sent to:\n- Control Office\n- Senior PWI\n- Engineering Department`);
  };

  const takePhoto = (): void => {
    setPhotoCount(prev => prev + 1);
    alert(`Photo ${photoCount + 1} captured and attached to current task/report`);
  };

  const requestBlock = (section: string, duration: string): void => {
    alert(`Engineering Block Request Submitted:\n\nSection: ${section}\nDuration: ${duration}\nJustification: Critical repair work\nTraffic Impact: Minimal during requested hours\n\nRequest sent to Section Controller for approval.`);
  };

  const markGPS = (): void => {
    alert(`GPS Location Marked:\nCoordinates: 28.6139° N, 77.2090° E\nKM: 52.5\nTime: ${new Date().toLocaleTimeString()}\n\nLocation saved for incident/inspection record.`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-First Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <img 
              src={railwayLogo}
              alt="Railway Logo" 
              className="w-8 h-8 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold">PWI Field Inspector</h1>
              <p className="text-sm text-muted-foreground">Section: NDLS-GZB (KM 45-65)</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium text-sm">{localStorage.getItem('userName') || 'Track Manager'}</p>
            <p className="text-xs text-muted-foreground">{localStorage.getItem('userGovtId') || 'Unknown'}</p>
          </div>
          <div>
            <LogoutButton label="End Shift" />
          </div>
        </div>
      </div>

      {/* Bottom Tab Navigation */}
      <div className="pb-20"> {/* Add padding for fixed bottom nav */}
        <Tabs defaultValue="map" className="w-full">
          <TabsContent value="map" className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Map className="w-5 h-5" />
                  <span>Geolocated Track Health Map</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {trackSections.map((section) => (
                    <div 
                      key={section.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        section.status === 'good' ? 'border-green-500 bg-green-50' :
                        section.status === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                        'border-red-500 bg-red-50'
                      } ${selectedSection?.id === section.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedSection(section)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">{section.id}</div>
                        <Badge 
                          variant="outline"
                          className={`${
                            section.status === 'good' ? 'border-green-500 text-green-700' :
                            section.status === 'warning' ? 'border-yellow-500 text-yellow-700' :
                            'border-red-500 text-red-700'
                          }`}
                        >
                          {section.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Health Score:</span>
                          <span className={`font-medium ${
                            section.healthScore >= 80 ? 'text-green-600' :
                            section.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{section.healthScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Defects:</span>
                          <span className="font-medium">{section.defects}</span>
                        </div>
                        {section.speedRestriction && (
                          <div className="flex justify-between">
                            <span>Speed Limit:</span>
                            <span className="font-medium text-red-600">{section.speedRestriction}</span>
                          </div>
                        )}
                        <div className="text-muted-foreground">
                          Last: {section.lastInspection}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedSection && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Section {selectedSection.id} Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Health Score:</span>
                            <div className="mt-1">
                              <Progress value={selectedSection.healthScore} className="h-2" />
                              <span className="text-xs">{selectedSection.healthScore}%</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <p className="font-medium">{selectedSection.status}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Active Defects:</span>
                            <p className="font-medium">{selectedSection.defects}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Next Inspection:</span>
                            <p className="font-medium">{selectedSection.nextDue}</p>
                          </div>
                        </div>
                        
                        {selectedSection.speedRestriction && (
                          <Alert className="border-red-300 bg-red-50">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Speed Restriction: {selectedSection.speedRestriction}
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm"
                            className="flex-1"
                            onClick={() => alert(`Started inspection for section ${selectedSection.id}`)}
                          >
                            Start Inspection
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={takePhoto}
                          >
                            📷 Photo
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Defects */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-base">Recent Defects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {recentDefects.map((defect) => (
                        <div key={defect.id} className={`p-3 border rounded-lg ${
                          defect.severity === 'Critical' ? 'border-red-300 bg-red-50' : 'border-yellow-300 bg-yellow-50'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{defect.type}</p>
                              <p className="text-xs text-muted-foreground">{defect.location} | {defect.reportedAt}</p>
                            </div>
                            <Badge variant={defect.severity === 'Critical' ? 'destructive' : 'secondary'}>
                              {defect.severity}
                            </Badge>
                          </div>
                          <p className="text-xs mt-1 text-green-600">{defect.action}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="p-4 space-y-4">
            {tasks.map((task) => {
              const completion = getTaskCompletion(task.id, task.checklist.length);
              return (
                <Card key={task.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{task.title}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {task.due}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{task.estimatedTime}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{task.location}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            task.priority === 'Critical' ? 'destructive' :
                            task.priority === 'High' ? 'default' : 'secondary'
                          }
                          className={
                            task.priority === 'High' ? 'bg-yellow-500' : ''
                          }
                        >
                          {task.priority}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {completion}% Complete
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="mb-3">
                        <Progress value={completion} className="h-2" />
                      </div>
                      
                      <h4 className="font-medium">Digital Checklist:</h4>
                      {task.checklist.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Checkbox
                            id={`task-${task.id}-item-${index}`}
                            checked={taskProgress[`${task.id}-${index}`] || false}
                            onCheckedChange={() => toggleChecklistItem(task.id, index)}
                          />
                          <label 
                            htmlFor={`task-${task.id}-item-${index}`}
                            className={`text-sm cursor-pointer flex-1 ${
                              taskProgress[`${task.id}-${index}`] ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {item}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => alert(`Task ${task.title} started with GPS tracking`)}
                      >
                        Start Task
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={takePhoto}
                      >
                        📷 Photo
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={markGPS}
                      >
                        📍 GPS
                      </Button>
                    </div>
                    
                    {task.type === 'Repair' && (
                      <Button 
                        size="sm" 
                        className="w-full mt-2 bg-orange-600 hover:bg-orange-700"
                        onClick={() => requestBlock(task.location, task.estimatedTime)}
                      >
                        Request Engineering Block
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="report" className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span>Emergency Reporting</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  GPS auto-captured | Photos: {photoCount} ready
                </div>
                
                <Button 
                  size="lg" 
                  variant="destructive"
                  className="w-full py-6 text-lg"
                  onClick={() => reportIncident('RAIL FRACTURE - CRITICAL')}
                >
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  Rail Fracture
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full py-6 text-lg border-red-500 text-red-700 hover:bg-red-50"
                  onClick={() => reportIncident('Track Misalignment')}
                >
                  <Target className="w-6 h-6 mr-2" />
                  Track Misalignment
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full py-6 text-lg border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                  onClick={() => reportIncident('Ballast Deficiency')}
                >
                  <Wrench className="w-6 h-6 mr-2" />
                  Ballast Issue
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full py-6 text-lg border-orange-500 text-orange-700 hover:bg-orange-50"
                  onClick={() => reportIncident('Signal Equipment Fault')}
                >
                  <Zap className="w-6 h-6 mr-2" />
                  Signal Equipment
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full py-6 text-lg border-blue-500 text-blue-700 hover:bg-blue-50"
                  onClick={() => reportIncident('General Observation')}
                >
                  <Camera className="w-6 h-6 mr-2" />
                  General Observation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Field Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={takePhoto}>
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo Evidence ({photoCount} taken)
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={markGPS}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Mark GPS Coordinates
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Complete Daily Log
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Wrench className="w-4 h-4 mr-2" />
                  Request Engineering Block
                </Button>
              </CardContent>
            </Card>

            {/* Engineering Block Status */}
            <Card>
              <CardHeader>
                <CardTitle>Engineering Block Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {blockRequests.map((request) => (
                    <div key={request.id} className={`p-3 border rounded-lg ${
                      request.status === 'Pending' ? 'border-yellow-300 bg-yellow-50' : 'border-green-300 bg-green-50'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{request.section}</p>
                          <p className="text-xs text-muted-foreground">{request.requestedTime}</p>
                          <p className="text-xs">{request.purpose}</p>
                        </div>
                        <Badge variant={request.status === 'Pending' ? 'secondary' : 'default'} 
                               className={request.status === 'Approved' ? 'bg-green-500' : ''}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fixed Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
            <TabsList className="grid w-full grid-cols-3 rounded-none h-16">
              <TabsTrigger value="map" className="flex flex-col space-y-1 h-full">
                <Map className="w-5 h-5" />
                <span className="text-xs">Track Map</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex flex-col space-y-1 h-full">
                <CheckSquare className="w-5 h-5" />
                <span className="text-xs">My Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="report" className="flex flex-col space-y-1 h-full">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-xs">Report</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
    </div>
  );
}