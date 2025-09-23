import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RefreshCw } from 'lucide-react';
import railwayLogo from 'figma:asset/de6da6a664b190e144e4d86f4481b866fee10e67.png';

interface LoginPageProps {
  onLogin: (role: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaCode] = useState('AB3K7');

  const handleLogin = () => {
    if (email && password && role && captcha === captchaCode) {
      onLogin(role);
    } else {
      alert('Please fill all fields correctly');
    }
  };

  const generateNewCaptcha = () => {
    // In a real app, this would generate a new captcha
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <img 
            src={railwayLogo}
            alt="Indian Railways Logo" 
            className="w-16 h-16 mx-auto object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Railway Management Portal</h1>
            <p className="text-muted-foreground">Government of India – Ministry of Railways</p>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email ID</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Select Your Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="station-master">Station Master</SelectItem>
                    <SelectItem value="section-controller">Section Controller</SelectItem>
                    <SelectItem value="freight-operator">Freight Operator</SelectItem>
                    <SelectItem value="track-manager">Track Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="captcha">Enter CAPTCHA</Label>
                <div className="flex space-x-2">
                  <div className="bg-gray-100 border rounded p-3 flex items-center justify-center min-w-[100px]">
                    <span className="font-mono text-lg tracking-wider select-none">
                      {captchaCode}
                    </span>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={generateNewCaptcha}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  id="captcha"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  placeholder="Enter CAPTCHA"
                />
              </div>
              
              <Button onClick={handleLogin} className="w-full bg-black hover:bg-gray-800">
                Login
              </Button>
              
              <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Dummy Credentials</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>smaster@rail.gov.in</p>
                  <p>scontroller@rail.gov.in</p>
                  <p>foperator@rail.gov.in</p>
                  <p>tmanager@rail.gov.in</p>
                  <p className="font-medium">Password for all: sih@2025</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <p className="text-center text-muted-foreground">
                Registration is handled by Railway Administration.
                <br />
                Please contact your system administrator.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}