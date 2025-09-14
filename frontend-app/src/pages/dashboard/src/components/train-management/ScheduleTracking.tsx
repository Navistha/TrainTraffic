import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { MapPin, Clock, AlertTriangle, CheckCircle, Train } from 'lucide-react';

type ScheduleItem = {
  id: string;
  station: string;
  scheduledArrival: string;
  actualArrival: string | null;
  scheduledDeparture: string;
  actualDeparture: string | null;
  status: 'on-time' | 'delayed' | 'completed' | 'upcoming';
  delay: number;
  platform: string;
  distance: number;
};

const ScheduleTracking: React.FC = () => {
  const schedule: ScheduleItem[] = [
    {
      id: 'STN-001',
      station: 'Mumbai Central',
      scheduledArrival: '2023-06-14T10:00:00',
      actualArrival: '2023-06-14T10:00:00',
      scheduledDeparture: '2023-06-14T10:15:00',
      actualDeparture: '2023-06-14T10:15:00',
      status: 'completed',
      delay: 0,
      platform: '5A',
      distance: 0
    },
    {
      id: 'STN-002',
      station: 'Vadodara Jn',
      scheduledArrival: '2023-06-14T14:30:00',
      actualArrival: '2023-06-14T14:45:00',
      scheduledDeparture: '2023-06-14T14:45:00',
      actualDeparture: '2023-06-14T15:00:00',
      status: 'delayed',
      delay: 15,
      platform: '3',
      distance: 392
    },
    {
      id: 'STN-003',
      station: 'Surat',
      scheduledArrival: '2023-06-14T17:15:00',
      actualArrival: null,
      scheduledDeparture: '2023-06-14T17:20:00',
      actualDeparture: null,
      status: 'on-time',
      delay: 0,
      platform: '2',
      distance: 263
    },
    {
      id: 'STN-004',
      station: 'Ahmedabad Jn',
      scheduledArrival: '2023-06-14T21:30:00',
      actualArrival: null,
      scheduledDeparture: '2023-06-14T21:45:00',
      actualDeparture: null,
      status: 'upcoming',
      delay: 0,
      platform: '1',
      distance: 525
    }
  ];

  const currentStation = schedule.find(station => 
    station.actualArrival && !station.actualDeparture
  ) || schedule.find(station => station.status === 'on-time');

  const nextStations = schedule.filter(station => 
    station.status === 'on-time' || station.status === 'upcoming'
  );

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusBadge = (status: string, delay: number) => {
    const statusConfig = {
      'completed': { text: 'Completed', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      'on-time': { text: 'On Time', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      'delayed': { text: `Delayed by ${delay}m`, icon: AlertTriangle, className: 'bg-amber-100 text-amber-800' },
      'upcoming': { text: 'Upcoming', icon: Clock, className: 'bg-blue-100 text-blue-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { text: status, icon: Clock, className: 'bg-gray-100 text-gray-800' };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getProgressPercentage = () => {
    if (!currentStation) return 0;
    const currentIndex = schedule.findIndex(s => s.id === currentStation.id);
    return (currentIndex / (schedule.length - 1)) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-blue-500" />
              Current Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentStation ? currentStation.station : 'En Route'}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentStation ? `Platform ${currentStation.platform}` : 'Between stations'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-amber-500" />
              Next Stop
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nextStations[0]?.station || 'Terminus'}
            </div>
            <div className="text-sm text-muted-foreground">
              {nextStations[0] 
                ? `ETA: ${formatDateTime(nextStations[0].scheduledArrival)}` 
                : 'Journey Complete'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
              Current Delay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentStation?.delay || 0} min
            </div>
            <div className="text-sm text-muted-foreground">
              {currentStation?.status === 'delayed' 
                ? 'Delayed in route' 
                : currentStation?.status === 'on-time'
                ? 'On schedule'
                : 'No delays'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Route Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pt-8 pb-4">
            <div className="absolute top-0 left-0 right-0 flex justify-between">
              {schedule.map((station, index) => (
                <div key={station.id} className="relative">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center z-10 ${
                    station.status === 'completed' 
                      ? 'bg-green-500' 
                      : station.status === 'on-time' 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300'
                  }`}>
                    {station.status === 'completed' && <CheckCircle className="h-4 w-4 text-white" />}
                    {station.status === 'on-time' && <Train className="h-3 w-3 text-white" />}
                    {station.status === 'upcoming' && <div className="h-2 w-2 bg-white rounded-full"></div>}
                  </div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-xs text-center w-24">
                    <div className="font-medium">{station.station.split(' ')[0]}</div>
                    <div className="text-muted-foreground">
                      {formatDateTime(station.actualArrival || station.scheduledArrival)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-1 bg-gray-200 rounded-full mt-3">
              <div 
                className="h-1 bg-blue-500 rounded-full" 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Station</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map((station) => (
                <TableRow 
                  key={station.id}
                  className={station.status === 'on-time' ? 'bg-blue-50' : ''}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {station.status === 'on-time' && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                      )}
                      {station.station}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={station.actualArrival && station.actualArrival > station.scheduledArrival ? 'text-red-500' : ''}>
                        {formatDateTime(station.actualArrival || station.scheduledArrival)}
                      </span>
                      {station.actualArrival && station.actualArrival !== station.scheduledArrival && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatDateTime(station.scheduledArrival)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={station.actualDeparture && station.actualDeparture > station.scheduledDeparture ? 'text-red-500' : ''}>
                        {formatDateTime(station.actualDeparture || station.scheduledDeparture)}
                      </span>
                      {station.actualDeparture && station.actualDeparture !== station.scheduledDeparture && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatDateTime(station.scheduledDeparture)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>Platform {station.platform}</TableCell>
                  <TableCell>{station.distance} km</TableCell>
                  <TableCell className="text-right">
                    {getStatusBadge(station.status, station.delay)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-amber-500">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Delay at Vadodara Jn</p>
                  <p className="text-sm text-muted-foreground">
                    15-minute delay due to signal failure. Expected to make up time en route.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-blue-500">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">On Schedule</p>
                  <p className="text-sm text-muted-foreground">
                    Next stop: Surat at {formatDateTime('2023-06-14T17:15:00')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Stations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nextStations.map((station, index) => (
                <div key={station.id} className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{station.station}</p>
                      <span className="text-sm text-muted-foreground">
                        {formatDateTime(station.scheduledArrival)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        Platform {station.platform}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{station.distance} km from origin</span>
                    </div>
                    {station.status === 'delayed' && (
                      <div className="mt-1 text-sm text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
                        Expected delay: {station.delay} minutes
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScheduleTracking;
