export interface TrainData {
  id: string;
  name: string;
  number: string;
  status: 'On-Time' | 'Delayed' | 'Priority';
  eta: string;
  position: {
    lat: number;
    lng: number;
  };
  speed: number;
  direction: string;
  route: string;
}

export interface Alert {
  id: string;
  type: 'conflict' | 'delay' | 'priority' | 'maintenance' | 'weather';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  trains: string[];
  status: 'pending' | 'accepted' | 'reviewing' | 'dismissed';
}

export interface Position {
  lat: number;
  lng: number;
}