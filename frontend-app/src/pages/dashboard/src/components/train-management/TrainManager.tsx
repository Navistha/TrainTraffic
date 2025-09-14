import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

type CheckItem = {
  id: string;
  name: string;
  status: 'completed' | 'pending' | 'failed';
};

const TrainManager: React.FC = () => {
  const preDepartureChecks: CheckItem[] = [
    { id: '1', name: 'Brake System Test', status: 'completed' },
    { id: '2', name: 'Communication Systems', status: 'completed' },
    { id: '3', name: 'Emergency Equipment', status: 'pending' },
    { id: '4', name: 'Engine Diagnostics', status: 'completed' },
    { id: '5', name: 'Coupling Systems', status: 'pending' },
  ];

  const completedChecks = preDepartureChecks.filter(
    (check) => check.status === 'completed'
  ).length;
  const completionPercentage = (completedChecks / preDepartureChecks.length) * 100;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Train Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Operational</div>
            <p className="text-xs text-muted-foreground">All systems nominal</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pre-Departure</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedChecks}/{preDepartureChecks.length}
            </div>
            <p className="text-xs text-muted-foreground">Checks completed</p>
            <Progress value={completionPercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crew Onboard</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3/3</div>
            <p className="text-xs text-muted-foreground">All crew present</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pre-Departure Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {preDepartureChecks.map((check) => (
                <div key={check.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {check.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : check.status === 'failed' ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                    <span>{check.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Crew Communication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Engineer', status: 'Online', lastActive: 'Now' },
                { name: 'Conductor', status: 'Online', lastActive: '2m ago' },
                { name: 'Security', status: 'Away', lastActive: '5m ago' },
              ].map((member, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${
                      member.status === 'Online' ? 'bg-green-500' : 'bg-amber-500'
                    }`}></div>
                    <span>{member.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {member.status} • {member.lastActive}
                  </span>
                </div>
              ))}
              
              <div className="mt-6 space-y-2">
                <div className="text-sm font-medium">Quick Actions</div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                    Emergency Stop
                  </button>
                  <button className="px-3 py-1.5 text-xs border rounded-md hover:bg-accent">
                    Call Crew
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainManager;
