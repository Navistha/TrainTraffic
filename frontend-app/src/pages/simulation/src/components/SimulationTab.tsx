import { useState } from 'react';
import { Card } from './ui/card';
import { MapView } from './MapView';
import { ControlPanel } from './ControlPanel';
import { AlertSidebar } from './AlertSidebar';
import { TrainData, Alert } from './types';

// Mock train data
const mockTrains: TrainData[] = [
  {
    id: 'T001',
    name: 'Express North',
    number: '001',
    status: 'On-Time',
    eta: '14:25',
    position: { lat: 40.7589, lng: -73.9851 },
    speed: 65,
    direction: 'North',
    route: 'Main Line'
  },
  {
    id: 'T002',
    name: 'City Commuter',
    number: '002',
    status: 'Delayed',
    eta: '14:35',
    position: { lat: 40.7505, lng: -73.9934 },
    speed: 45,
    direction: 'South',
    route: 'Urban Loop'
  },
  {
    id: 'T003',
    name: 'Priority Freight',
    number: '003',
    status: 'Priority',
    eta: '15:10',
    position: { lat: 40.7614, lng: -73.9776 },
    speed: 55,
    direction: 'East',
    route: 'Freight Line'
  },
  {
    id: 'T004',
    name: 'Regional Express',
    number: '004',
    status: 'On-Time',
    eta: '14:50',
    position: { lat: 40.7680, lng: -73.9840 },
    speed: 70,
    direction: 'West',
    route: 'Regional Line'
  },
  {
    id: 'T005',
    name: 'Metro Link',
    number: '005',
    status: 'On-Time',
    eta: '14:40',
    position: { lat: 40.7549, lng: -73.9840 },
    speed: 60,
    direction: 'Northwest',
    route: 'Metro Line'
  }
];

// Mock alert data
const mockAlerts: Alert[] = [
  {
    id: 'A001',
    type: 'conflict',
    severity: 'high',
    message: 'Potential conflict detected between Train T001 and T002',
    timestamp: '2025-09-02T14:20:00Z',
    trains: ['T001', 'T002'],
    status: 'pending'
  },
  {
    id: 'A002',
    type: 'delay',
    severity: 'medium',
    message: 'Train T002 delayed by 10 minutes due to signal maintenance',
    timestamp: '2025-09-02T14:15:00Z',
    trains: ['T002'],
    status: 'pending'
  },
  {
    id: 'A003',
    type: 'priority',
    severity: 'high',
    message: 'Priority freight T003 requires clear path on Main Line',
    timestamp: '2025-09-02T14:18:00Z',
    trains: ['T003'],
    status: 'pending'
  }
];

export function SimulationTab() {
  const [trains] = useState<TrainData[]>(mockTrains);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [selectedTrain, setSelectedTrain] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [radarEnabled, setRadarEnabled] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const handleAlertAction = (alertId: string, action: 'accept' | 'review' | 'dismiss') => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: action === 'dismiss' ? 'dismissed' : action === 'accept' ? 'accepted' : 'reviewing' }
        : alert
    ));
  };

  const filteredTrains = trains.filter(train => {
    if (selectedTrain !== 'all' && train.id !== selectedTrain) return false;
    if (selectedSection !== 'all' && train.route !== selectedSection) return false;
    return true;
  });

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
      {/* Control Panel */}
      <div className="col-span-12">
        <ControlPanel
          trains={trains}
          selectedTrain={selectedTrain}
          setSelectedTrain={setSelectedTrain}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          radarEnabled={radarEnabled}
          setRadarEnabled={setRadarEnabled}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
      </div>

      {/* Map View */}
      <div className="col-span-9">
        <Card className="h-full">
          <MapView
            trains={filteredTrains}
            radarEnabled={radarEnabled}
            isDarkMode={isDarkMode}
          />
        </Card>
      </div>

      {/* Alert Sidebar */}
      <div className="col-span-3">
        <AlertSidebar
          alerts={alerts}
          onAlertAction={handleAlertAction}
        />
      </div>
    </div>
  );
}