import { TrainData } from './types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Train, Clock, MapPin } from 'lucide-react';

interface TrainMarkerProps {
  train: TrainData;
  position: { x: number; y: number };
  isSelected: boolean;
  onClick: () => void;
}

export function TrainMarker({ train, position, isSelected, onClick }: TrainMarkerProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On-Time': return 'bg-green-500';
      case 'Delayed': return 'bg-red-500';
      case 'Priority': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'On-Time': return 'status-on-time';
      case 'Delayed': return 'status-delayed';
      case 'Priority': return 'status-priority';
      default: return 'text-gray-500';
    }
  };

  return (
    <div
      className="train-marker cursor-pointer"
      style={{ left: position.x, top: position.y }}
      onClick={onClick}
    >
      {/* Train Icon */}
      <div 
        className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg ${getStatusColor(train.status)} hover:scale-110 transition-transform`}
      >
        <Train className="h-4 w-4 text-white" />
        
        {/* Pulse effect for priority trains */}
        {train.status === 'Priority' && (
          <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-75"></div>
        )}
      </div>

      {/* Train Info Tooltip */}
      {isSelected && (
        <Card className="absolute z-20 mt-2 w-64 shadow-xl" style={{ left: '-120px' }}>
          <CardContent className="p-3">
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Train className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{train.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  #{train.number}
                </Badge>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusTextColor(train.status)}`}
                >
                  {train.status}
                </Badge>
              </div>

              {/* ETA */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">ETA:</span>
                </div>
                <span className="text-sm font-medium">{train.eta}</span>
              </div>

              {/* Route */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Route:</span>
                </div>
                <span className="text-sm">{train.route}</span>
              </div>

              {/* Speed & Direction */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t">
                <div className="text-center">
                  <div className="text-lg font-medium">{train.speed}</div>
                  <div className="text-xs text-muted-foreground">mph</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">{train.direction}</div>
                  <div className="text-xs text-muted-foreground">Direction</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Train Number Label */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-card border border-border rounded px-1 py-0.5 text-xs font-medium shadow-sm whitespace-nowrap">
          {train.number}
        </div>
      </div>
    </div>
  );
}