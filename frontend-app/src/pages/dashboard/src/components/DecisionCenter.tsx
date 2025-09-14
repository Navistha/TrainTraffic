import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BrainCircuit, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Route,
  Users,
  Fuel,
  Timer
} from 'lucide-react';

export function DecisionCenter() {
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);

  const pendingDecisions = [
    {
      id: 'D001',
      type: 'precedence',
      title: 'Junction J-4 Precedence Decision',
      description: 'Choose precedence between Rajdhani Express (12951) and Grand Trunk Express (12615)',
      urgency: 'high',
      timeRemaining: 180, // seconds
      trains: ['12951', '12615'],
      aiRecommendation: {
        action: 'Give precedence to Train 12951 (Rajdhani Express)',
        confidence: 92,
        reasoning: [
          'Higher priority passenger service',
          'Minimizes overall system delay by 3.2 minutes',
          'Maintains connection at New Delhi junction',
          'Lower fuel consumption due to reduced braking'
        ],
        impact: {
          delayReduction: 3.2,
          energySaving: 8.5,
          passengerBenefit: 1200,
          systemThroughput: '+5%'
        }
      }
    },
    {
      id: 'D002',
      type: 'routing',
      title: 'Platform Assignment for Freight-401',
      description: 'Select platform for incoming container freight to avoid passenger train conflicts',
      urgency: 'medium',
      timeRemaining: 420,
      trains: ['FREIGHT-401'],
      aiRecommendation: {
        action: 'Route to Platform 3 via bypass track',
        confidence: 87,
        reasoning: [
          'Avoids platform conflict with passenger trains',
          'Shorter route reduces transit time',
          'Platform 3 has adequate loading facilities',
          'Maintains express train schedule integrity'
        ],
        impact: {
          delayReduction: 12.0,
          energySaving: 6.2,
          passengerBenefit: 0,
          systemThroughput: '+3%'
        }
      }
    },
    {
      id: 'D003',
      type: 'timing',
      title: 'Delay Recovery Strategy',
      description: 'Optimize timing for Grand Trunk Express to recover 8-minute delay',
      urgency: 'medium',
      timeRemaining: 300,
      trains: ['12615'],
      aiRecommendation: {
        action: 'Implement speed optimization between stations',
        confidence: 78,
        reasoning: [
          'Skip non-essential stops as per emergency protocol',
          'Use express track for faster transit',
          'Coordinate with next section for priority passage',
          'Minimize station dwell time'
        ],
        impact: {
          delayReduction: 5.5,
          energySaving: -2.1,
          passengerBenefit: 1800,
          systemThroughput: '+2%'
        }
      }
    }
  ];

  const recentDecisions = [
    {
      id: 'D100',
      title: 'Platform 2 Assignment',
      action: 'Assigned to Shatabdi Express',
      timestamp: '13:47',
      outcome: 'Success - On-time departure',
      impact: 'No delays, passenger satisfaction maintained'
    },
    {
      id: 'D099',
      title: 'Freight Priority Override',
      action: 'Held Freight-398 for Express passage',
      timestamp: '13:30',
      outcome: 'Success - Minimal freight delay',
      impact: '2 minute freight delay vs 8 minute passenger delay avoided'
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 border-red-200 bg-red-50';
      case 'medium': return 'text-orange-600 border-orange-200 bg-orange-50';
      case 'low': return 'text-green-600 border-green-200 bg-green-50';
      default: return 'text-gray-600';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const executeDecision = (decisionId: string, action: string) => {
    // Simulate decision execution
    console.log(`Executing decision ${decisionId}: ${action}`);
    // In real implementation, this would send the decision to the control system
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Decision Center</h2>
          <p className="text-muted-foreground">AI-powered recommendations for optimal train operations</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center space-x-1">
            <BrainCircuit className="h-3 w-3" />
            <span>AI Engine Active</span>
          </Badge>
          <Badge variant="destructive">
            {pendingDecisions.length} Decisions Pending
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Decisions ({pendingDecisions.length})</TabsTrigger>
          <TabsTrigger value="recent">Recent Decisions</TabsTrigger>
          <TabsTrigger value="analytics">Decision Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingDecisions.map((decision) => (
            <Card key={decision.id} className={`border-l-4 ${
              decision.urgency === 'high' ? 'border-l-red-500' : 
              decision.urgency === 'medium' ? 'border-l-orange-500' : 'border-l-green-500'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getUrgencyColor(decision.urgency)}`}>
                      {decision.type === 'precedence' && <Route className="h-4 w-4" />}
                      {decision.type === 'routing' && <Route className="h-4 w-4" />}
                      {decision.type === 'timing' && <Timer className="h-4 w-4" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{decision.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{decision.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={decision.urgency === 'high' ? 'destructive' : 
                                   decision.urgency === 'medium' ? 'secondary' : 'default'}>
                      {decision.urgency} priority
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {formatTime(decision.timeRemaining)} remaining
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-blue-900 flex items-center">
                      <BrainCircuit className="h-4 w-4 mr-2" />
                      AI Recommendation
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-700">Confidence:</span>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {decision.aiRecommendation.confidence}%
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="font-medium text-blue-900 mb-3">
                    {decision.aiRecommendation.action}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-blue-800">Reasoning:</h5>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {decision.aiRecommendation.reasoning.map((reason, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-blue-600" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-blue-800">Expected Impact:</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Delay Reduction
                          </span>
                          <span className="font-medium text-green-600">
                            -{decision.aiRecommendation.impact.delayReduction} min
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center">
                            <Zap className="h-3 w-3 mr-1" />
                            Energy Saving
                          </span>
                          <span className={`font-medium ${
                            decision.aiRecommendation.impact.energySaving > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {decision.aiRecommendation.impact.energySaving > 0 ? '+' : ''}
                            {decision.aiRecommendation.impact.energySaving}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            Passengers Affected
                          </span>
                          <span className="font-medium">
                            {decision.aiRecommendation.impact.passengerBenefit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Throughput
                          </span>
                          <span className="font-medium text-green-600">
                            {decision.aiRecommendation.impact.systemThroughput}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => executeDecision(decision.id, decision.aiRecommendation.action)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Accept Recommendation
                      </Button>
                      <Button variant="outline">
                        Modify
                      </Button>
                      <Button variant="ghost" className="text-red-600">
                        Override
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Trains involved: {decision.trains.join(', ')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Decision History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDecisions.map((decision) => (
                  <div key={decision.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{decision.title}</p>
                      <p className="text-sm text-muted-foreground">{decision.action}</p>
                      <p className="text-xs text-green-600">{decision.impact}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium text-green-600">{decision.outcome}</p>
                      <p className="text-xs text-muted-foreground">{decision.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Decision Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">94.2%</div>
                <Progress value={94.2} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.3s</div>
                <p className="text-xs text-green-600 mt-2">
                  ↓ 0.2s from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Decisions Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">27</div>
                <p className="text-xs text-muted-foreground mt-2">
                  15 automated, 12 manual
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">System Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+18%</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Efficiency improvement
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}