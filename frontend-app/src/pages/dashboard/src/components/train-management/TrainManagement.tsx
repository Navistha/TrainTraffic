import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import TrainManager from './TrainManager';
import CargoManagement from './CargoManagement';
import ScheduleTracking from './ScheduleTracking';
import Analytics from './Analytics';

const TrainManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('train-manager');

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Freight Train Management</h2>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="train-manager">Train Manager</TabsTrigger>
          <TabsTrigger value="cargo">Cargo Management</TabsTrigger>
          <TabsTrigger value="schedule">Schedule & Route</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="train-manager">
          <TrainManager />
        </TabsContent>
        
        <TabsContent value="cargo">
          <CargoManagement />
        </TabsContent>
        
        <TabsContent value="schedule">
          <ScheduleTracking />
        </TabsContent>
        
        <TabsContent value="analytics">
          <Analytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainManagement;
