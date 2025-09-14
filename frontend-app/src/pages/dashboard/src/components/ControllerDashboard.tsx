import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useTheme } from './ThemeProvider';
import { Dashboard } from './Dashboard';
import { TrainSchedule } from './TrainSchedule';
import { DecisionCenter } from './DecisionCenter';
import { Simulation } from './SimulationNew';
import { Analytics } from './Analytics';
import { Settings } from './Settings';
import { UserData } from './IDEntry';
import { 
  LayoutDashboard, 
  Train, 
  BrainCircuit, 
  PlayCircle, 
  BarChart3, 
  Settings as SettingsIcon,
  Menu,
  Bell,
  Power,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';

interface ControllerDashboardProps {
  userData: UserData;
  onLogout: () => void;
}

export function ControllerDashboard({ userData, onLogout }: ControllerDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule', name: 'Train Schedule', icon: Train },
    { id: 'decisions', name: 'Decision Center', icon: BrainCircuit },
    { id: 'simulation', name: 'Simulation', icon: PlayCircle },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'schedule':
        return <TrainSchedule />;
      case 'decisions':
        return <DecisionCenter />;
      case 'simulation':
        return <Simulation />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-card border-r border-border`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-semibold">RailAI Control</h1>
                <p className="text-sm text-muted-foreground">Section Controller</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className={`w-full justify-start ${!sidebarOpen && 'px-2'}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="h-4 w-4" />
                {sidebarOpen && <span className="ml-2">{item.name}</span>}
              </Button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            {sidebarOpen && (
              <div>
                <p className="text-xs text-muted-foreground">System Status</p>
                <p className="text-xs text-green-600">Online</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-medium">
              {navigation.find(nav => nav.id === activeTab)?.name}
            </h2>
            <Badge variant="secondary" className="text-xs">
              {userData.section || 'Section A-7 (Mumbai Central - Dadar)'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">Controller:</span>
              <span>{userData.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}