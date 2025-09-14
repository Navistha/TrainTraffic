import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { 
  BarElement, 
  CategoryScale, 
  Chart as ChartJS, 
  Legend, 
  LinearScale, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics: React.FC = () => {
  // Fuel Efficiency Data
  const fuelEfficiencyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Fuel Efficiency (km/l)',
        data: [4.2, 4.0, 4.3, 4.5, 4.4, 4.6],
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Cargo Volume by Type
  const cargoByTypeData = {
    labels: ['Containers', 'Bulk Coal', 'Automobiles', 'Perishables', 'Other'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          'rgba(79, 70, 229, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(156, 163, 175, 0.7)',
        ],
        borderColor: [
          'rgba(79, 70, 229, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // On-time Performance
  const performanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'On-time Performance (%)',
        data: [92, 88, 90, 89, 91, 95],
        fill: false,
        borderColor: 'rgba(16, 185, 129, 1)',
        tension: 0.3,
      },
      {
        label: 'Average Delay (min)',
        data: [12, 15, 14, 13, 11, 8],
        fill: false,
        borderColor: 'rgba(239, 68, 68, 1)',
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };

  // Maintenance Alerts
  const maintenanceAlerts = [
    { id: 1, component: 'Brake System', status: 'Warning', daysLeft: 5 },
    { id: 2, component: 'Engine Oil', status: 'Due Soon', daysLeft: 15 },
    { id: 3, component: 'Coolant Level', status: 'Normal', daysLeft: 30 },
    { id: 4, component: 'Tire Wear', status: 'Good', daysLeft: 45 },
  ];

  // Recent Activities
  const recentActivities = [
    { id: 1, activity: 'Scheduled maintenance completed', time: '2 hours ago', status: 'completed' },
    { id: 2, activity: 'New cargo loaded', time: '5 hours ago', status: 'completed' },
    { id: 3, activity: 'Route optimization applied', time: '1 day ago', status: 'completed' },
    { id: 4, activity: 'Delay reported on route', time: '2 days ago', status: 'warning' },
  ];

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cargo (MT)</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248.5</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-time Performance</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Efficiency</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M3 6 2 7v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7l-1-1M3 6h18M16 6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2" />
              <path d="M12 3v2m-2 7 2 2 2-2m-2 2v6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.4 km/l</div>
            <p className="text-xs text-muted-foreground">+0.2 km/l from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 critical, 1 warning</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fuel Efficiency Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Line data={fuelEfficiencyData} options={chartOptions} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cargo Volume by Type</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Pie data={cargoByTypeData} options={pieOptions} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <Line data={performanceData} options={chartOptions} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-3 w-3 rounded-full ${
                      alert.status === 'Warning' ? 'bg-red-500' : 
                      alert.status === 'Due Soon' ? 'bg-amber-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <p className="font-medium">{alert.component}</p>
                      <p className="text-sm text-muted-foreground">{alert.status}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {alert.daysLeft} days
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`h-2 w-2 mt-2 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'
                  }`}></div>
                  <div>
                    <p className="font-medium">{activity.activity}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Operational Efficiency</h3>
              <div className="h-2.5 w-full bg-gray-200 rounded-full">
                <div className="h-2.5 rounded-full bg-blue-600" style={{ width: '87%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">87% - Above target (85%)</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Fuel Consumption</h3>
              <div className="h-2.5 w-full bg-gray-200 rounded-full">
                <div className="h-2.5 rounded-full bg-green-600" style={{ width: '92%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">4.4 km/l - 5% improvement</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Cargo Safety</h3>
              <div className="h-2.5 w-full bg-gray-200 rounded-full">
                <div className="h-2.5 rounded-full bg-green-600" style={{ width: '98%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">98% - No damage incidents</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
