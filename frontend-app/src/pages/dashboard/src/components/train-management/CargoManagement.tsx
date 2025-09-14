import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Progress } from '../ui/progress';

type CargoItem = {
  id: string;
  type: string;
  weight: number;
  status: 'loading' | 'in-transit' | 'delivered';
  origin: string;
  destination: string;
  eta: string;
};

const CargoManagement: React.FC = () => {
  const cargoItems: CargoItem[] = [
    {
      id: 'CRG-1001',
      type: 'Containers',
      weight: 42.5,
      status: 'in-transit',
      origin: 'Mumbai Port',
      destination: 'Delhi ICD',
      eta: '2023-06-15T14:30:00Z'
    },
    {
      id: 'CRG-1002',
      type: 'Bulk Coal',
      weight: 1250.75,
      status: 'loading',
      origin: 'Jharkhand Mines',
      destination: 'Tata Power Plant',
      eta: '2023-06-16T09:15:00Z'
    },
    {
      id: 'CRG-1003',
      type: 'Automobiles',
      weight: 320.0,
      status: 'in-transit',
      origin: 'Chennai Plant',
      destination: 'Ahmedabad Showroom',
      eta: '2023-06-14T18:45:00Z'
    },
    {
      id: 'CRG-1004',
      type: 'Perishables',
      weight: 85.2,
      status: 'delivered',
      origin: 'Pune Cold Storage',
      destination: 'Mumbai Market',
      eta: '2023-06-13T11:20:00Z'
    },
  ];

  const totalWeight = cargoItems.reduce((sum, item) => sum + item.weight, 0);
  const inTransitWeight = cargoItems
    .filter(item => item.status === 'in-transit')
    .reduce((sum, item) => sum + item.weight, 0);
  const loadingWeight = cargoItems
    .filter(item => item.status === 'loading')
    .reduce((sum, item) => sum + item.weight, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      'loading': 'bg-amber-100 text-amber-800',
      'in-transit': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cargo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWeight.toFixed(1)} tons</div>
            <div className="text-xs text-muted-foreground">Across {cargoItems.length} shipments</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inTransitWeight.toFixed(1)} tons</div>
            <div className="text-xs text-muted-foreground">
              {((inTransitWeight / totalWeight) * 100).toFixed(0)}% of total cargo
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Loading</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingWeight.toFixed(1)} tons</div>
            <div className="text-xs text-muted-foreground">
              {((loadingWeight / totalWeight) * 100).toFixed(0)}% of total cargo
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cargo Manifest</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Weight (tons)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>ETA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargoItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.weight.toFixed(1)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">{item.origin}</div>
                    <div className="text-xs text-muted-foreground">to {item.destination}</div>
                  </TableCell>
                  <TableCell>{formatDate(item.eta)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cargo Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(new Set(cargoItems.map(item => item.type))).map((type) => {
                const typeItems = cargoItems.filter(item => item.type === type);
                const totalTypeWeight = typeItems.reduce((sum, item) => sum + item.weight, 0);
                const percentage = (totalTypeWeight / totalWeight) * 100;
                
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{type}</span>
                      <span className="font-medium">{totalTypeWeight.toFixed(1)} tons</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...cargoItems]
                .filter(item => item.status !== 'delivered')
                .sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime())
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.id}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.type} • {item.weight} tons
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatDate(item.eta).split(',')[0]}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(item.eta).split(',')[1].trim()}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CargoManagement;
