import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database, 
  Zap, 
  Users, 
  MessageSquare,
  Save,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Mic,
  Volume2
} from 'lucide-react';

export function Settings() {
  const [aiSettings, setAiSettings] = useState({
    autoDecisions: true,
    confidenceThreshold: [85],
    energyOptimization: true,
    delayPrediction: true,
    voiceAlerts: false,
    realTimeUpdates: true
  });

  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    delayWarnings: true,
    systemUpdates: false,
    performanceReports: true,
    emailNotifications: true,
    smsAlerts: false
  });

  const [systemConfig, setSystemConfig] = useState({
    sectionId: 'A-7',
    maxTrainsPerHour: '25',
    defaultPlatformTime: '2',
    emergencyProtocol: 'auto',
    dataRetention: '90',
    backupFrequency: 'hourly'
  });

  const handleSave = () => {
    // Simulate saving settings
    console.log('Settings saved:', { aiSettings, notifications, systemConfig });
    // Show success message
  };

  const handleReset = () => {
    // Reset to defaults
    setAiSettings({
      autoDecisions: true,
      confidenceThreshold: [85],
      energyOptimization: true,
      delayPrediction: true,
      voiceAlerts: false,
      realTimeUpdates: true
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">System Settings</h2>
          <p className="text-muted-foreground">Configure AI parameters, notifications, and system preferences</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ai" className="space-y-6">
        <TabsList>
          <TabsTrigger value="ai">AI Configuration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="security">Security & Access</TabsTrigger>
          <TabsTrigger value="voice">Voice Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  AI Engine Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-decisions">Automatic Decision Making</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow AI to make decisions automatically when confidence is high
                    </p>
                  </div>
                  <Switch 
                    id="auto-decisions"
                    checked={aiSettings.autoDecisions}
                    onCheckedChange={(checked) => 
                      setAiSettings(prev => ({ ...prev, autoDecisions: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Decision Confidence Threshold: {aiSettings.confidenceThreshold[0]}%</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimum confidence required for automatic decisions
                  </p>
                  <Slider
                    value={aiSettings.confidenceThreshold}
                    onValueChange={(value) => 
                      setAiSettings(prev => ({ ...prev, confidenceThreshold: value }))
                    }
                    max={100}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Conservative (50%)</span>
                    <span>Aggressive (100%)</span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="energy-opt">Energy Optimization</Label>
                    <p className="text-sm text-muted-foreground">
                      Include energy efficiency in decision algorithms
                    </p>
                  </div>
                  <Switch 
                    id="energy-opt"
                    checked={aiSettings.energyOptimization}
                    onCheckedChange={(checked) => 
                      setAiSettings(prev => ({ ...prev, energyOptimization: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="delay-prediction">Predictive Delay Analysis</Label>
                    <p className="text-sm text-muted-foreground">
                      Use ML to predict and prevent delays
                    </p>
                  </div>
                  <Switch 
                    id="delay-prediction"
                    checked={aiSettings.delayPrediction}
                    onCheckedChange={(checked) => 
                      setAiSettings(prev => ({ ...prev, delayPrediction: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="real-time">Real-time Data Processing</Label>
                    <p className="text-sm text-muted-foreground">
                      Continuously update decisions with latest data
                    </p>
                  </div>
                  <Switch 
                    id="real-time"
                    checked={aiSettings.realTimeUpdates}
                    onCheckedChange={(checked) => 
                      setAiSettings(prev => ({ ...prev, realTimeUpdates: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Performance Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Engine Status</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Model Version</span>
                  <span className="text-sm">v2.3.1</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Last Training</span>
                  <span className="text-sm">2 days ago</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Accuracy Rate</span>
                  <span className="text-sm text-green-600">94.2%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Response Time</span>
                  <span className="text-sm">1.3s avg</span>
                </div>

                <Separator />

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    AI system is operating optimally. Next scheduled maintenance: March 15, 2025
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Alert Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="critical-alerts">Critical Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Safety and emergency notifications
                    </p>
                  </div>
                  <Switch 
                    id="critical-alerts"
                    checked={notifications.criticalAlerts}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, criticalAlerts: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="delay-warnings">Delay Warnings</Label>
                    <p className="text-sm text-muted-foreground">
                      Advance warning of potential delays
                    </p>
                  </div>
                  <Switch 
                    id="delay-warnings"
                    checked={notifications.delayWarnings}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, delayWarnings: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="system-updates">System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Software and maintenance notifications
                    </p>
                  </div>
                  <Switch 
                    id="system-updates"
                    checked={notifications.systemUpdates}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, systemUpdates: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="performance-reports">Performance Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Daily and weekly performance summaries
                    </p>
                  </div>
                  <Switch 
                    id="performance-reports"
                    checked={notifications.performanceReports}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, performanceReports: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send alerts to registered email
                    </p>
                  </div>
                  <Switch 
                    id="email-notifications"
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-alerts">SMS Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Critical alerts via SMS
                    </p>
                  </div>
                  <Switch 
                    id="sms-alerts"
                    checked={notifications.smsAlerts}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, smsAlerts: checked }))
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="controller@railway.gov.in"
                    defaultValue="rajesh.sharma@railway.gov.in"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+91 98765 43210"
                    defaultValue="+91 98765 43210"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="section-id">Section ID</Label>
                  <Input 
                    id="section-id" 
                    value={systemConfig.sectionId}
                    onChange={(e) => 
                      setSystemConfig(prev => ({ ...prev, sectionId: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-trains">Maximum Trains per Hour</Label>
                  <Input 
                    id="max-trains" 
                    type="number"
                    value={systemConfig.maxTrainsPerHour}
                    onChange={(e) => 
                      setSystemConfig(prev => ({ ...prev, maxTrainsPerHour: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform-time">Default Platform Time (minutes)</Label>
                  <Input 
                    id="platform-time" 
                    type="number"
                    value={systemConfig.defaultPlatformTime}
                    onChange={(e) => 
                      setSystemConfig(prev => ({ ...prev, defaultPlatformTime: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency-protocol">Emergency Protocol</Label>
                  <Select 
                    value={systemConfig.emergencyProtocol}
                    onValueChange={(value) => 
                      setSystemConfig(prev => ({ ...prev, emergencyProtocol: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automatic</SelectItem>
                      <SelectItem value="manual">Manual Override Required</SelectItem>
                      <SelectItem value="hybrid">Hybrid (Auto + Manual Confirmation)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="data-retention">Data Retention (days)</Label>
                  <Input 
                    id="data-retention" 
                    type="number"
                    value={systemConfig.dataRetention}
                    onChange={(e) => 
                      setSystemConfig(prev => ({ ...prev, dataRetention: e.target.value }))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Historical data retention period
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select 
                    value={systemConfig.backupFrequency}
                    onValueChange={(value) => 
                      setSystemConfig(prev => ({ ...prev, backupFrequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Storage Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Database Size</span>
                      <span>2.4 GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Available Space</span>
                      <span>47.6 GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Backup</span>
                      <span>2 hours ago</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security & Access Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Security settings require supervisor approval to modify. Contact system administrator for changes.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Current Access Level</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>User Role</span>
                      <Badge>Section Controller</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Permissions</span>
                      <Badge variant="outline">Standard</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Override Authority</span>
                      <Badge variant="outline">Level 2</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Session Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Login Time</span>
                      <span>08:30 AM</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Session Duration</span>
                      <span>5h 42m</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>IP Address</span>
                      <span>192.168.1.42</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Audit Trail</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Last Decision Override</span>
                    <span>2 hours ago - Junction J-4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Settings Modified</span>
                    <span>Yesterday - Notification preferences</span>
                  </div>
                  <div className="flex justify-between">
                    <span>System Access</span>
                    <span>Today 08:30 - Normal login</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic className="h-5 w-5 mr-2" />
                  Voice Assistant Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="voice-alerts">Voice Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable spoken notifications for critical events
                    </p>
                  </div>
                  <Switch 
                    id="voice-alerts"
                    checked={aiSettings.voiceAlerts}
                    onCheckedChange={(checked) => 
                      setAiSettings(prev => ({ ...prev, voiceAlerts: checked }))
                    }
                  />
                </div>

                <div className="space-y-3">
                  <Label>Language Preference</Label>
                  <Select defaultValue="en-IN">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-IN">English (India)</SelectItem>
                      <SelectItem value="hi-IN">Hindi</SelectItem>
                      <SelectItem value="mr-IN">Marathi</SelectItem>
                      <SelectItem value="gu-IN">Gujarati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Voice Speed</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Wake Word</Label>
                  <Select defaultValue="railai">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="railai">Hey RailAI</SelectItem>
                      <SelectItem value="control">Hey Control</SelectItem>
                      <SelectItem value="system">Hey System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Volume2 className="h-5 w-5 mr-2" />
                  Voice Commands
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Supported Commands</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>"Show train status"</span>
                      <span className="text-muted-foreground">Display current trains</span>
                    </div>
                    <div className="flex justify-between">
                      <span>"Accept recommendation"</span>
                      <span className="text-muted-foreground">Accept AI suggestion</span>
                    </div>
                    <div className="flex justify-between">
                      <span>"Hold all trains"</span>
                      <span className="text-muted-foreground">Emergency stop</span>
                    </div>
                    <div className="flex justify-between">
                      <span>"Platform status"</span>
                      <span className="text-muted-foreground">Show platform info</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Voice Training</h4>
                  <p className="text-sm text-muted-foreground">
                    Train the system to recognize your voice for better accuracy.
                  </p>
                  <Button variant="outline" size="sm">
                    <Mic className="h-4 w-4 mr-2" />
                    Start Voice Training
                  </Button>
                </div>

                <Alert>
                  <MessageSquare className="h-4 w-4" />
                  <AlertDescription>
                    Voice commands are currently in beta. Always confirm critical actions visually.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}