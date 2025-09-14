import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Alert } from './types';
import { AlertTriangle, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

interface AlertSidebarProps {
  alerts: Alert[];
  onAlertAction: (alertId: string, action: 'accept' | 'review' | 'dismiss') => void;
}

export function AlertSidebar({ alerts, onAlertAction }: AlertSidebarProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'conflict': return '⚠️';
      case 'delay': return '🕒';
      case 'priority': return '🔥';
      case 'maintenance': return '🔧';
      case 'weather': return '🌧️';
      default: return '📢';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const pendingAlerts = alerts.filter(alert => alert.status === 'pending');
  const processedAlerts = alerts.filter(alert => alert.status !== 'pending');

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 railway-red" />
            <span>Real-time Alerts</span>
          </CardTitle>
          <Badge variant="destructive">
            {pendingAlerts.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {/* Pending Alerts */}
            {pendingAlerts.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Pending ({pendingAlerts.length})</span>
                </h4>
                {pendingAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(alert.severity)}
                        <span className="text-sm font-medium capitalize">
                          {getTypeIcon(alert.type)} {alert.type}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-3 leading-relaxed">
                      {alert.message}
                    </p>
                    
                    {alert.trains.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {alert.trains.map(trainId => (
                          <Badge key={trainId} variant="outline" className="text-xs">
                            {trainId}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 bg-railway-red hover:bg-railway-red-dark"
                        onClick={() => onAlertAction(alert.id, 'accept')}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAlertAction(alert.id, 'review')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Review
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onAlertAction(alert.id, 'dismiss')}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Processed Alerts */}
            {processedAlerts.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Recent ({processedAlerts.length})
                </h4>
                {processedAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg bg-muted/50 opacity-70"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          {getTypeIcon(alert.type)} {alert.type}
                        </span>
                      </div>
                      <Badge 
                        variant={
                          alert.status === 'accepted' ? 'default' : 
                          alert.status === 'reviewing' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {alert.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* No alerts */}
            {alerts.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No active alerts</p>
                <p className="text-sm text-muted-foreground">All systems operational</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}