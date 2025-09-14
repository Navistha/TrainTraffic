import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { useTheme } from './ThemeProvider';
import { Train, Moon, Sun, AlertTriangle, User } from 'lucide-react';

// Mock Database
const mockDatabase = {
  // Controllers
  'CTRL001': { role: 'controller', name: 'Rajesh Sharma', section: 'Mumbai Central - Dadar' },
  'CTRL002': { role: 'controller', name: 'Priya Patel', section: 'Delhi - Gurgaon' },
  'CTRL003': { role: 'controller', name: 'Amit Kumar', section: 'Chennai - Tambaram' },
  
  // Track Managers
  'TM001': { role: 'track_manager', name: 'Suresh Singh', zone: 'Western Railway' },
  'TM002': { role: 'track_manager', name: 'Kavita Reddy', zone: 'Southern Railway' },
  'TM003': { role: 'track_manager', name: 'Ravi Gupta', zone: 'Northern Railway' },
  
  // Passengers (simplified IDs)
  'PASS001': { role: 'passenger', name: 'Arjun Mehta', mobile: '+91 98765 43210' },
  'PASS002': { role: 'passenger', name: 'Sneha Joshi', mobile: '+91 98765 43211' },
  'PASS003': { role: 'passenger', name: 'Vikram Agrawal', mobile: '+91 98765 43212' },
};

export type UserRole = 'controller' | 'track_manager' | 'passenger';

export interface UserData {
  role: UserRole;
  name: string;
  section?: string;
  zone?: string;
  mobile?: string;
}

interface IDEntryProps {
  onLogin: (userData: UserData) => void;
}

export function IDEntry({ onLogin }: IDEntryProps) {
  const [railwayId, setRailwayId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!railwayId.trim()) {
      setError('Please enter your Railway ID');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API delay
    setTimeout(() => {
      const userData = mockDatabase[railwayId.toUpperCase() as keyof typeof mockDatabase];
      
      if (userData) {
        onLogin(userData);
      } else {
        setError('Invalid Railway ID. Please check and try again.');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const demoIds = [
    { id: 'CTRL001', role: 'Controller', color: 'bg-blue-100 text-blue-800' },
    { id: 'TM001', role: 'Track Manager', color: 'bg-green-100 text-green-800' },
    { id: 'PASS001', role: 'Passenger', color: 'bg-purple-100 text-purple-800' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-10"
      >
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <pattern id="railway-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#railway-pattern)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center"
          >
            <Train className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Railway Management System
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Enter your Railway ID to continue
          </p>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Authentication</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Enter Railway ID (e.g., CTRL001)"
                  value={railwayId}
                  onChange={(e) => setRailwayId(e.target.value)}
                  className="text-center text-lg"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Validating...</span>
                  </div>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>

            {/* Demo IDs */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Demo IDs for testing:</p>
              <div className="space-y-2">
                {demoIds.map((demo) => (
                  <div key={demo.id} className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className={`cursor-pointer hover:opacity-80 ${demo.color}`}
                      onClick={() => setRailwayId(demo.id)}
                    >
                      {demo.id}
                    </Badge>
                    <span className="text-xs text-gray-500">{demo.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Indian Railways • Connecting Lives, Empowering India
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}