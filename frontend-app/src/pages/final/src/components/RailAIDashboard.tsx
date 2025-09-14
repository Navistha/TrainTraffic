import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { SimulationTab } from './SimulationTab';
import { RailwayMap } from './RailwayMap';
import { RailwaySearch } from './RailwaySearch';
import { Train, MapIcon, Settings, AlertTriangle } from 'lucide-react';
import { RailwayFacility } from '../services/openRailwayMapApi';

export function RailAIDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<RailwayFacility | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]); // Default to London

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFacilitySelect = (facility: RailwayFacility) => {
    setSelectedFacility(facility);
    setMapCenter([facility.latitude, facility.longitude]);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Train className="h-8 w-8 railway-red" />
                <h1 className="text-2xl font-bold railway-blue">RailAI Control Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <MapIcon className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="simulation" className="flex items-center space-x-2">
              <Train className="h-4 w-4" />
              <span>Simulation</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Railway Network Map</span>
                    <div className="flex-1 max-w-md ml-4">
                      <RailwaySearch 
                        onSearch={handleSearch}
                        onFacilitySelect={handleFacilitySelect}
                      />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 w-full">
                    <RailwayMap
                      center={mapCenter}
                      zoom={selectedFacility ? 15 : 10}
                      searchQuery={searchQuery}
                      height="100%"
                      className="border rounded-lg"
                    />
                  </div>
                </CardContent>
              </Card>
              
              {selectedFacility && (
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Facility Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedFacility.name}</h3>
                        <p className="text-sm text-gray-600 capitalize mb-2">{selectedFacility.railway}</p>
                        <div className="space-y-1 text-sm">
                          <p><strong>Coordinates:</strong> {selectedFacility.latitude.toFixed(6)}, {selectedFacility.longitude.toFixed(6)}</p>
                          {selectedFacility.operator && <p><strong>Operator:</strong> {selectedFacility.operator}</p>}
                          {selectedFacility.ref && <p><strong>Reference:</strong> {selectedFacility.ref}</p>}
                          {selectedFacility.uic_ref && <p><strong>UIC Reference:</strong> {selectedFacility.uic_ref}</p>}
                        </div>
                      </div>
                      <div>
                        {selectedFacility.platforms && <p className="text-sm"><strong>Platforms:</strong> {selectedFacility.platforms}</p>}
                        {selectedFacility.wheelchair && <p className="text-sm"><strong>Wheelchair Access:</strong> {selectedFacility.wheelchair}</p>}
                        {selectedFacility.website && (
                          <p className="text-sm">
                            <strong>Website:</strong>{' '}
                            <a 
                              href={selectedFacility.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Visit
                            </a>
                          </p>
                        )}
                        <p className="text-sm"><strong>Importance Rank:</strong> {selectedFacility.rank}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="simulation">
            <SimulationTab />
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Alert Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Alert management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p>System configuration coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}