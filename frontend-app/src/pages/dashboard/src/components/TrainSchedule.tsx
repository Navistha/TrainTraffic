import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  Train, 
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export function TrainSchedule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const upcomingTrains = [
    {
      id: '12951',
      name: 'Mumbai Rajdhani Express',
      type: 'Express',
      priority: 'high',
      scheduled: '14:25',
      expected: '14:25',
      platform: '2',
      status: 'approaching',
      from: 'Mumbai Central',
      to: 'New Delhi',
      delay: 0,
      cars: 18,
      passengers: 1200
    },
    {
      id: '12615',
      name: 'Grand Trunk Express',
      type: 'Mail',
      priority: 'medium',
      scheduled: '14:30',
      expected: '14:38',
      platform: 'TBD',
      status: 'delayed',
      from: 'Chennai Central',
      to: 'New Delhi',
      delay: 8,
      cars: 22,
      passengers: 1800
    },
    {
      id: '22926',
      name: 'Paschim Express',
      type: 'SuperFast',
      priority: 'medium',
      scheduled: '14:35',
      expected: '14:35',
      platform: '1',
      status: 'on-time',
      from: 'Bandra Terminus',
      to: 'Amritsar',
      delay: 0,
      cars: 20,
      passengers: 1500
    },
    {
      id: 'FREIGHT-401',
      name: 'Container Freight',
      type: 'Freight',
      priority: 'low',
      scheduled: '14:40',
      expected: 'Held',
      platform: 'Yard',
      status: 'held',
      from: 'JNPT',
      to: 'Tughlakabad',
      delay: 15,
      cars: 45,
      passengers: 0
    },
    {
      id: '19024',
      name: 'Firozpur Janata Express',
      type: 'Passenger',
      priority: 'medium',
      scheduled: '14:45',
      expected: '14:45',
      platform: '3',
      status: 'scheduled',
      from: 'Mumbai Central',
      to: 'Firozpur',
      delay: 0,
      cars: 16,
      passengers: 900
    }
  ];

  const recentTrains = [
    {
      id: '12009',
      name: 'Shatabdi Express',
      scheduled: '13:45',
      actual: '13:47',
      platform: '2',
      status: 'departed',
      delay: 2
    },
    {
      id: '19216',
      name: 'Saurashtra Express',
      scheduled: '13:30',
      actual: '13:30',
      platform: '1',
      status: 'departed',
      delay: 0
    },
    {
      id: 'FREIGHT-398',
      name: 'Coal Freight',
      scheduled: '13:15',
      actual: '13:28',
      platform: 'Yard',
      status: 'departed',
      delay: 13
    }
  ];

  const filteredTrains = upcomingTrains.filter(train => {
    const matchesSearch = train.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         train.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'delayed' && train.delay > 0) ||
                         (filterType === 'on-time' && train.delay === 0) ||
                         (filterType === 'express' && train.type === 'Express') ||
                         (filterType === 'freight' && train.type === 'Freight');
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string, delay: number) => {
    switch (status) {
      case 'on-time':
      case 'scheduled':
        return <Badge variant="default" className="bg-green-100 text-green-800">On Time</Badge>;
      case 'delayed':
        return <Badge variant="destructive">+{delay}m Delayed</Badge>;
      case 'held':
        return <Badge variant="secondary">Held</Badge>;
      case 'approaching':
        return <Badge variant="outline" className="border-blue-200 text-blue-600">Approaching</Badge>;
      case 'departed':
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">Departed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'border-red-200 text-red-600',
      medium: 'border-orange-200 text-orange-600',
      low: 'border-gray-200 text-gray-600'
    };
    return <Badge variant="outline" className={colors[priority as keyof typeof colors]}>{priority}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Train Schedule</h2>
          <p className="text-muted-foreground">Real-time train movements and scheduling</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trains..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trains</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
              <SelectItem value="on-time">On Time</SelectItem>
              <SelectItem value="express">Express</SelectItem>
              <SelectItem value="freight">Freight</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Schedule Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Trains ({upcomingTrains.length})</TabsTrigger>
          <TabsTrigger value="recent">Recent Departures ({recentTrains.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Train className="h-5 w-5 mr-2" />
                Upcoming Trains
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Train</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrains.map((train) => (
                    <TableRow key={train.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{train.name}</p>
                          <p className="text-sm text-muted-foreground">#{train.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>{train.type}</TableCell>
                      <TableCell>{getPriorityBadge(train.priority)}</TableCell>
                      <TableCell className="font-mono">{train.scheduled}</TableCell>
                      <TableCell className="font-mono">
                        <span className={train.delay > 0 ? 'text-red-600' : 'text-green-600'}>
                          {train.expected}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{train.platform}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(train.status, train.delay)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{train.from}</p>
                          <p className="text-muted-foreground">↓ {train.to}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          {train.status === 'delayed' || train.status === 'held' ? (
                            <Button size="sm" variant="default">
                              Reschedule
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Recent Departures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Train</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTrains.map((train) => (
                    <TableRow key={train.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{train.name}</p>
                          <p className="text-sm text-muted-foreground">#{train.id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{train.scheduled}</TableCell>
                      <TableCell className="font-mono">{train.actual}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{train.platform}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(train.status, train.delay)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {train.delay === 0 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          )}
                          <span className={train.delay === 0 ? 'text-green-600' : 'text-orange-600'}>
                            {train.delay === 0 ? 'Perfect' : `+${train.delay}m`}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Next Critical Decision</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold">Junction J-4</p>
              <p className="text-sm text-muted-foreground">
                Rajdhani Express vs Grand Trunk Express precedence
              </p>
              <Badge variant="destructive" className="text-xs">
                Decision needed in 3 minutes
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Platform Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Platform 1</span>
                <span className="text-green-600">Available</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Platform 2</span>
                <span className="text-red-600">Occupied (2 min)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Platform 3</span>
                <span className="text-green-600">Available</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Section Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">On-time Performance</span>
                <span className="text-green-600 font-semibold">87%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Delay</span>
                <span className="text-orange-600 font-semibold">4.2 min</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">Improving</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}