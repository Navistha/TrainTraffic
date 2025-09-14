import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LogOut, Train, Users, Calendar, Settings, BarChart } from 'lucide-react';

interface User {
  id: string;
  email: string;
  fullName: string;
  governmentId: string;
  password: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1723357646143-68b17c10ee0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjByYWlsd2F5cyUyMGxvZ28lMjBnb3Zlcm5tZW50JTIwb2ZmaWNpYWx8ZW58MXx8fHwxNzU3NjUxNDM5fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Indian Railways Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-black">Railway Management Portal</h1>
                <p className="text-sm text-gray-600">Government of India – Ministry of Railways</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-black">{user.fullName}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-black mb-2">Welcome, {user.fullName}</h2>
          <p className="text-gray-600">
            Access and manage railway operations, scheduling, and administrative functions.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-gray-600">Train Operations</CardTitle>
              <Train className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-black mb-1">245</div>
              <p className="text-xs text-gray-600">Active trains today</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-gray-600">Passenger Management</CardTitle>
              <Users className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-black mb-1">12,847</div>
              <p className="text-xs text-gray-600">Passengers today</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-gray-600">Schedule Management</CardTitle>
              <Calendar className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-black mb-1">98.2%</div>
              <p className="text-xs text-gray-600">On-time performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart className="h-5 w-5" />
                <span>System Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Network Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    Operational
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Signal Systems</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    Normal
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Maintenance</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                    Scheduled
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-3 flex flex-col space-y-1">
                  <Train className="h-4 w-4" />
                  <span className="text-xs">Manage Trains</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col space-y-1">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">View Passengers</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col space-y-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">Schedules</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col space-y-1">
                  <BarChart className="h-4 w-4" />
                  <span className="text-xs">Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="text-black">{user.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="text-black">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Government ID</p>
                <p className="text-black">{user.governmentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                  Active
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}