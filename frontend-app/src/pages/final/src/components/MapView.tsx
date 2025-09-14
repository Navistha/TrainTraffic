import { useState, useRef, useEffect } from 'react';
import { TrainData } from './types';
import { TrainMarker } from './TrainMarker';
import { Badge } from './ui/badge';
import { MapPin, Navigation } from 'lucide-react';

interface MapViewProps {
  trains: TrainData[];
  radarEnabled: boolean;
  isDarkMode: boolean;
}

export function MapView({ trains, radarEnabled, isDarkMode }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7589, lng: -73.9851 });
  const [zoomLevel, setZoomLevel] = useState(13);
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);

  // Convert lat/lng to pixel coordinates for display
  const latLngToPixel = (lat: number, lng: number, mapWidth: number, mapHeight: number) => {
    // Simple projection for demo purposes
    const centerLat = mapCenter.lat;
    const centerLng = mapCenter.lng;
    
    const latRange = 0.02 * (14 / zoomLevel); // Adjust range based on zoom
    const lngRange = 0.02 * (14 / zoomLevel);
    
    const x = ((lng - centerLng + lngRange / 2) / lngRange) * mapWidth;
    const y = ((centerLat - lat + latRange / 2) / latRange) * mapHeight;
    
    return { x, y };
  };

  const mapStyles = {
    backgroundImage: isDarkMode 
      ? 'linear-gradient(45deg, #1f2937 25%, transparent 25%), linear-gradient(-45deg, #1f2937 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f2937 75%), linear-gradient(-45deg, transparent 75%, #1f2937 75%)'
      : 'linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f3f4f6 75%), linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)',
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
  };

  return (
    <div className="relative h-full w-full overflow-hidden map-container">
      {/* Mock Map Background */}
      <div 
        ref={mapRef}
        className={`absolute inset-0 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
        style={mapStyles}
      >
        {/* Grid lines to simulate map */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div key={`h-${i}`} className={`absolute w-full h-px ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} style={{ top: `${i * 5}%` }} />
          ))}
          {[...Array(20)].map((_, i) => (
            <div key={`v-${i}`} className={`absolute h-full w-px ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} style={{ left: `${i * 5}%` }} />
          ))}
        </div>

        {/* Railway Lines */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="railway" patternUnits="userSpaceOnUse" width="4" height="4">
              <rect width="4" height="4" fill={isDarkMode ? '#374151' : '#e5e7eb'}/>
              <rect width="2" height="2" fill={isDarkMode ? '#4b5563' : '#d1d5db'}/>
            </pattern>
          </defs>
          {/* Main railway lines */}
          <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="url(#railway)" strokeWidth="3"/>
          <line x1="20%" y1="10%" x2="80%" y2="90%" stroke="url(#railway)" strokeWidth="3"/>
          <line x1="15%" y1="85%" x2="85%" y2="15%" stroke="url(#railway)" strokeWidth="2"/>
        </svg>

        {/* Train Markers */}
        {mapRef.current && trains.map(train => {
          const mapRect = mapRef.current!.getBoundingClientRect();
          const { x, y } = latLngToPixel(
            train.position.lat, 
            train.position.lng, 
            mapRect.width, 
            mapRect.height
          );

          // Check if position is within visible area
          if (x < 0 || x > mapRect.width || y < 0 || y > mapRect.height) {
            return null;
          }

          return (
            <div key={train.id}>
              <TrainMarker
                train={train}
                position={{ x, y }}
                isSelected={selectedTrain === train.id}
                onClick={() => setSelectedTrain(selectedTrain === train.id ? null : train.id)}
              />
              
              {/* Radar circle */}
              {radarEnabled && (
                <div
                  className="radar-circle"
                  style={{
                    left: x,
                    top: y,
                    width: '100px', // Represents 5km radius
                    height: '100px',
                    borderColor: train.status === 'Priority' ? '#ea580c' : 
                                train.status === 'Delayed' ? '#dc2626' : '#3b82f6'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Map Info Panel */}
      <div className="absolute top-4 left-4 flex flex-col space-y-2">
        <Badge variant="secondary" className="bg-card text-card-foreground">
          <MapPin className="h-3 w-3 mr-1" />
          Central Station Area
        </Badge>
        <Badge variant="outline" className="bg-card text-card-foreground">
          Zoom Level: {zoomLevel}
        </Badge>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg p-3 shadow-lg">
        <h4 className="font-medium mb-2">Train Status</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>On-Time</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Delayed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Priority</span>
          </div>
        </div>
      </div>

      {/* Compass */}
      <div className="absolute top-4 right-4">
        <div className="bg-card border border-border rounded-full p-2 shadow-lg">
          <Navigation className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}