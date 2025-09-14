import React, { useEffect, useState } from 'react';
import { OpenRailwayMapAPI, RailwayFacility, RAILWAY_MAP_STYLES, RailwayMapStyle } from '../services/openRailwayMapApi';
import { MapPin, Train, Loader } from 'lucide-react';

interface RailwayMapProps {
  center?: [number, number];
  zoom?: number;
  style?: RailwayMapStyle;
  searchQuery?: string;
  height?: string;
  className?: string;
}

// Simplified map component without Leaflet dependencies
const SimpleMapView: React.FC<{ facilities: RailwayFacility[]; loading: boolean }> = ({ facilities, loading }) => {
  return (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Interactive Railway Map</p>
          <p className="text-sm text-gray-500">Installing map dependencies...</p>
        </div>
      </div>
      
      {loading && (
        <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded shadow-lg flex items-center gap-2">
          <Loader className="w-4 h-4 animate-spin" />
          <span className="text-sm">Searching...</span>
        </div>
      )}
      
      {facilities.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow-lg max-w-xs">
          <h4 className="font-semibold text-sm mb-2">Found {facilities.length} facilities:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {facilities.slice(0, 5).map((facility) => (
              <div key={facility.osm_id} className="flex items-center gap-2 text-xs">
                <Train className="w-3 h-3 text-blue-600" />
                <span className="truncate">{facility.name}</span>
              </div>
            ))}
            {facilities.length > 5 && (
              <p className="text-xs text-gray-500">...and {facilities.length - 5} more</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const RailwayMap: React.FC<RailwayMapProps> = ({
  center = [51.505, -0.09], // Default to London
  zoom = 10,
  style = 'standard',
  searchQuery,
  height = '400px',
  className = ''
}) => {
  const [facilities, setFacilities] = useState<RailwayFacility[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      setLoading(true);
      const searchFacilities = async () => {
        try {
          const foundFacilities = await OpenRailwayMapAPI.searchByQuery(searchQuery, 20);
          setFacilities(foundFacilities);
        } catch (error) {
          console.error('Error searching facilities:', error);
          setFacilities([]);
        } finally {
          setLoading(false);
        }
      };
      searchFacilities();
    }
  }, [searchQuery]);

  return (
    <div className={`railway-map ${className}`} style={{ height }}>
      <SimpleMapView facilities={facilities} loading={loading} />
    </div>
  );
};

export default RailwayMap;
