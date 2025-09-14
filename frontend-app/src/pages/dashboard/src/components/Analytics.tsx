import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity, 
  Zap, 
  Users, 
  Clock,
  Leaf,
  Award,
  Target
} from 'lucide-react';

export function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [metricType, setMetricType] = useState('performance');

  // Sample data for charts
  const performanceData = [
    { date: 'Mon', onTime: 89, delayed: 8, cancelled: 3, throughput: 142 },
    { date: 'Tue', onTime: 91, delayed: 6, cancelled: 3, throughput: 138 },
    { date: 'Wed', onTime: 85, delayed: 12, cancelled: 3, throughput: 145 },
    { date: 'Thu', onTime: 93, delayed: 5, cancelled: 2, throughput: 149 },
    { date: 'Fri', onTime: 87, delayed: 10, cancelled: 3, throughput: 144 },
    { date: 'Sat', onTime: 94, delayed: 4, cancelled: 2, throughput: 152 },
    { date: 'Sun', onTime: 92, delayed: 6, cancelled: 2, throughput: 148 }
  ];

  const delayAnalysisData = [
    { time: '06:00', avgDelay: 2.1, trainCount: 8 },
    { time: '08:00', avgDelay: 5.3, trainCount: 15 },
    { time: '10:00', avgDelay: 3.7, trainCount: 12 },
    { time: '12:00', avgDelay: 6.2, trainCount: 18 },
    { time: '14:00', avgDelay: 4.8, trainCount: 16 },
    { time: '16:00', avgDelay: 7.1, trainCount: 20 },
    { time: '18:00', avgDelay: 8.5, trainCount: 22 },
    { time: '20:00', avgDelay: 5.9, trainCount: 14 },
    { time: '22:00', avgDelay: 3.2, trainCount: 10 }
  ];

  const energyData = [
    { date: 'Mon', consumption: 1240, savings: 8.2, co2Reduced: 6.5 },
    { date: 'Tue', consumption: 1180, savings: 12.1, co2Reduced: 9.8 },
    { date: 'Wed', consumption: 1320, savings: 5.7, co2Reduced: 4.2 },
    { date: 'Thu', consumption: 1150, savings: 15.3, co2Reduced: 12.1 },
    { date: 'Fri', consumption: 1280, savings: 9.4, co2Reduced: 7.6 },
    { date: 'Sat', consumption: 1100, savings: 18.2, co2Reduced: 14.5 },
    { date: 'Sun', consumption: 1200, savings: 13.8, co2Reduced: 11.2 }
  ];

  const trainTypeData = [
    { name: 'Express', value: 35, count: 42, color: '#3b82f6' },
    { name: 'Mail/SF', value: 28, count: 34, color: '#10b981' },
    { name: 'Passenger', value: 22, count: 26, color: '#f59e0b' },
    { name: 'Freight', value: 15, count: 18, color: '#6b7280' }
  ];

  const kpiMetrics = {
    punctuality: { value: 89.3, trend: 2.1, target: 92 },
    throughput: { value: 145, trend: 5.2, target: 150 },
    efficiency: { value: 91.7, trend: 3.8, target: 95 },
    satisfaction: { value: 87.2, trend: 1.4, target: 90 },
    energySavings: { value: 12.6, trend: 8.3, target: 15 },
    avgDelay: { value: 5.1, trend: -1.2, target: 3.5 }
  };

  const getKPIColor = (value: number, target: number, lowerIsBetter: boolean = false) => {
    const percentage = lowerIsBetter ? (target / value) * 100 : (value / target) * 100;
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 80) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Analytics & Performance</h2>
          <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Punctuality</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${getKPIColor(kpiMetrics.punctuality.value, kpiMetrics.punctuality.target)}`}>
                {kpiMetrics.punctuality.value}%
              </div>
              {getTrendIcon(kpiMetrics.punctuality.trend)}
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {kpiMetrics.punctuality.target}% • +{kpiMetrics.punctuality.trend}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Throughput</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${getKPIColor(kpiMetrics.throughput.value, kpiMetrics.throughput.target)}`}>
                {kpiMetrics.throughput.value}
              </div>
              {getTrendIcon(kpiMetrics.throughput.trend)}
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {kpiMetrics.throughput.target} • +{kpiMetrics.throughput.trend}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Efficiency</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${getKPIColor(kpiMetrics.efficiency.value, kpiMetrics.efficiency.target)}`}>
                {kpiMetrics.efficiency.value}%
              </div>
              {getTrendIcon(kpiMetrics.efficiency.trend)}
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {kpiMetrics.efficiency.target}% • +{kpiMetrics.efficiency.trend}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Satisfaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${getKPIColor(kpiMetrics.satisfaction.value, kpiMetrics.satisfaction.target)}`}>
                {kpiMetrics.satisfaction.value}%
              </div>
              {getTrendIcon(kpiMetrics.satisfaction.trend)}
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {kpiMetrics.satisfaction.target}% • +{kpiMetrics.satisfaction.trend}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Energy Savings</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${getKPIColor(kpiMetrics.energySavings.value, kpiMetrics.energySavings.target)}`}>
                {kpiMetrics.energySavings.value}%
              </div>
              {getTrendIcon(kpiMetrics.energySavings.trend)}
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {kpiMetrics.energySavings.target}% • +{kpiMetrics.energySavings.trend}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Delay</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${getKPIColor(kpiMetrics.avgDelay.value, kpiMetrics.avgDelay.target, true)}`}>
                {kpiMetrics.avgDelay.value}m
              </div>
              {getTrendIcon(kpiMetrics.avgDelay.trend)}
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {kpiMetrics.avgDelay.target}m • {kpiMetrics.avgDelay.trend}m
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance Trends</TabsTrigger>
          <TabsTrigger value="delays">Delay Analysis</TabsTrigger>
          <TabsTrigger value="energy">Energy & Sustainability</TabsTrigger>
          <TabsTrigger value="composition">Traffic Composition</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="onTime" fill="#10b981" name="On Time" />
                    <Bar dataKey="delayed" fill="#f59e0b" name="Delayed" />
                    <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Throughput Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="throughput" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Trains per Day"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="delays" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Delay Pattern Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={delayAnalysisData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="avgDelay" 
                    stackId="1"
                    stroke="#ef4444" 
                    fill="#ef4444"
                    fillOpacity={0.3}
                    name="Average Delay (minutes)"
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="trainCount" 
                    fill="#3b82f6"
                    name="Train Count"
                    opacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="energy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Energy Consumption & Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={energyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="consumption" 
                      fill="#64748b"
                      name="Consumption (kWh)"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="savings" 
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Savings (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CO₂ Reduction Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={energyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="co2Reduced" 
                      stroke="#10b981" 
                      fill="#10b981"
                      fillOpacity={0.4}
                      name="CO₂ Reduced (kg)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Energy Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">2,847 kWh</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">CO₂ Emissions Reduced</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">65.4 kg</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cost Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹42,705</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="composition">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Train Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={trainTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {trainTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Composition Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainTypeData.map((type) => (
                    <div key={type.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="font-medium">{type.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{type.count} trains</p>
                        <p className="text-sm text-muted-foreground">{type.value}%</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">120</p>
                      <p className="text-sm text-muted-foreground">Total Trains</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">89.3%</p>
                      <p className="text-sm text-muted-foreground">Avg Utilization</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}