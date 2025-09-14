import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useTheme } from './ThemeProvider';
import { UserData } from './IDEntry';
import { 
  Search,
  Train,
  Clock,
  MapPin,
  Navigation,
  Moon,
  Sun,
  LogOut,
  Route,
  Info,
  AlertCircle,
  CheckCircle,
  Calendar,
  User
} from 'lucide-react';

interface PassengerDashboardProps {
  userData: UserData;
  onLogout: () => void;
}

export function PassengerDashboard({ userData, onLogout }: PassengerDashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrain, setSelectedTrain] = useState<any>(null);

  // Mock train data
  const trains = [
    {
      number: '12951',
      name: 'Mumbai Rajdhani Express',
      from: 'Mumbai Central',
      to: 'New Delhi',
      departure: '17:05',
      arrival: '08:35+1',
      platform: '1',
      status: 'On Time',
      delay: 0,
      currentLocation: 'Vadodara Junction',
      nextStation: 'Ratlam Junction',
      distance: '847 km',
      duration: '15h 30m',
      type: 'Rajdhani',
      coaches: 18
    },
    {
      number: '12615',
      name: 'Grand Trunk Express',
      from: 'Chennai Central',
      to: 'New Delhi',
      departure: '19:15',
      arrival: '05:30+2',
      platform: '2',
      status: 'Delayed',
      delay: 25,
      currentLocation: 'Bhopal Junction',
      nextStation: 'Jhansi Junction',
      distance: '2194 km',
      duration: '34h 15m',
      type: 'Mail/Express',
      coaches: 24
    },
    {
      number: '22926',
      name: 'Paschim Express',
      from: 'Bandra Terminus',
      to: 'Amritsar',
      departure: '22:05',
      arrival: '23:55+1',
      platform: '3',
      status: 'On Time',
      delay: 0,
      currentLocation: 'Ahmedabad Junction',
      nextStation: 'Abu Road',
      distance: '1928 km',
      duration: '25h 50m',
      type: 'Superfast',
      coaches: 22
    }
  ];

  const popularRoutes = [
    { from: 'Mumbai', to: 'Delhi', trains: 15, duration: '15-17h' },
    { from: 'Delhi', to: 'Kolkata', trains: 12, duration: '17-20h' },
    { from: 'Chennai', to: 'Bangalore', trains: 8, duration: '5-7h' },
    { from: 'Mumbai', to: 'Pune', trains: 20, duration: '3-4h' }
  ];

  const filteredTrains = trains.filter(train => 
    train.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    train.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    train.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    train.to.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string, delay: number) => {
    if (status === 'On Time' && delay === 0) return 'text-green-600';
    if (delay > 0 && delay <= 15) return 'text-orange-600';
    if (delay > 15) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusBadge = (status: string, delay: number) => {
    if (status === 'On Time' && delay === 0) {
      return <Badge variant="default" className="bg-green-100 text-green-800">On Time</Badge>;
    }
    if (delay > 0) {
      return <Badge variant="destructive">Delayed by {delay}m</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <Train className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Indian Railways</h1>
              <p className="text-sm text-muted-foreground">Live Train Information</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4" />
              <span>{userData.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search Trains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter train number, name, or station..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-lg h-12"
                />
              </div>
              <Button size="lg" className="px-8">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Search Suggestions */}
        {!searchQuery && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Route className="h-5 w-5 mr-2" />
                Popular Routes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularRoutes.map((route, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{route.from}</span>
                      <Navigation className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{route.to}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{route.trains} trains available</p>
                      <p>{route.duration} journey time</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Train Results */}
        <div className="space-y-4">
          {filteredTrains.map((train) => (
            <Card key={train.number} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTrain(train)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{train.name}</h3>
                        <p className="text-sm text-muted-foreground">#{train.number} • {train.type}</p>
                      </div>
                      {getStatusBadge(train.status, train.delay)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{train.from}</p>
                          <p className="text-sm text-muted-foreground">{train.departure}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="flex items-center space-x-2">
                            <div className="h-px bg-border flex-1"></div>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div className="h-px bg-border flex-1"></div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{train.duration}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 justify-end">
                        <div className="text-right">
                          <p className="font-medium">{train.to}</p>
                          <p className="text-sm text-muted-foreground">{train.arrival}</p>
                        </div>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span>Platform {train.platform}</span>
                      <span>{train.coaches} coaches</span>
                      <span className={getStatusColor(train.status, train.delay)}>
                        Current: {train.currentLocation}
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Info className="h-3 w-3 mr-1" />
                      More Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">On-time Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600">94%</div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground">Today's performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Average Delay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">8 min</div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Across all trains</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Service Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm">Normal Service</div>
                <AlertCircle className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground">No major disruptions</p>
            </CardContent>
          </Card>
        </div>

        {/* Important Information */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Travel Information</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Please arrive at the station at least 30 minutes before departure</li>
                  <li>• Carry valid ID proof during travel</li>
                  <li>• Check platform information before boarding</li>
                  <li>• For cancellations and refunds, visit the reservation counter</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}