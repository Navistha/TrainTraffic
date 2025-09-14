import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { TrainData } from './types';
import { Radar, Sun, Moon, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ControlPanelProps {
  trains: TrainData[];
  selectedTrain: string;
  setSelectedTrain: (value: string) => void;
  selectedSection: string;
  setSelectedSection: (value: string) => void;
  radarEnabled: boolean;
  setRadarEnabled: (value: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

export function ControlPanel({
  trains,
  selectedTrain,
  setSelectedTrain,
  selectedSection,
  setSelectedSection,
  radarEnabled,
  setRadarEnabled,
  isDarkMode,
  setIsDarkMode
}: ControlPanelProps) {
  const sections = ['all', 'Main Line', 'Urban Loop', 'Freight Line', 'Regional Line', 'Metro Line'];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Train Selection */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="train-select">Train:</Label>
            <Select value={selectedTrain} onValueChange={setSelectedTrain}>
              <SelectTrigger id="train-select" className="w-40">
                <SelectValue placeholder="Select train" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trains</SelectItem>
                {trains.map(train => (
                  <SelectItem key={train.id} value={train.id}>
                    {train.name} ({train.number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Section Selection */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="section-select">Section:</Label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger id="section-select" className="w-40">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map(section => (
                  <SelectItem key={section} value={section}>
                    {section === 'all' ? 'All Sections' : section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Radar Toggle */}
          <div className="flex items-center space-x-2">
            <Radar className={`h-4 w-4 ${radarEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
            <Label htmlFor="radar-toggle">5km Radar</Label>
            <Switch
              id="radar-toggle"
              checked={radarEnabled}
              onCheckedChange={setRadarEnabled}
            />
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center space-x-2">
            {isDarkMode ? (
              <Moon className="h-4 w-4 text-blue-500" />
            ) : (
              <Sun className="h-4 w-4 text-yellow-500" />
            )}
            <Label htmlFor="theme-toggle">Dark Mode</Label>
            <Switch
              id="theme-toggle"
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
            />
          </div>

          {/* Map Controls */}
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Move className="h-4 w-4" />
            </Button>
          </div>

          {/* Status Summary */}
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="status-on-time">
              {trains.filter(t => t.status === 'On-Time').length} On-Time
            </Badge>
            <Badge variant="outline" className="status-delayed">
              {trains.filter(t => t.status === 'Delayed').length} Delayed
            </Badge>
            <Badge variant="outline" className="status-priority">
              {trains.filter(t => t.status === 'Priority').length} Priority
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}