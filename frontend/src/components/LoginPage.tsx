import { useState } from 'react';
import { Button } from './ui/button.js';
import { Input } from './ui/input.js';
import { Label } from './ui/label.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs.js';
import { Card, CardContent, CardHeader } from './ui/card.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.js';
import railwayLogo from '../assets/de6da6a664b190e144e4d86f4481b866fee10e67.png';
import Captcha from '../components/ui/genCaptcha.js';

interface LoginPageProps {
  onLogin: (role: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [govtId, setGovtId] = useState('');
  const [fullName, setFullName] = useState('');
  // For this app the role is used as the 'password' per user request
  const [role, setRole] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [loading, setLoading] = useState(false);

  // Map frontend role values to backend-stored role keys used in models (snake_case)
  const normalizeRoleForBackend = (r: string) => {
    if (!r) return r;
    // accept either hyphenated or snake_case
    return r.replace(/-/g, '_').toLowerCase();
  };

  const normalizeBackendToFrontend = (backendRole: string) => {
    if (!backendRole) return backendRole;
    return backendRole.replace(/_/g, '-').toLowerCase();
  };

  const handleLogin = async () => {
    if (!govtId || !fullName || !role) {
      alert('Please fill all fields');
      return;
    }
    if (captchaInput !== generatedCaptcha) {
      alert('CAPTCHA does not match');
      return;
    }

    const backendRole = normalizeRoleForBackend(role);

    // The user asked that the "password" be the Role of the employee. We'll send the role
    // as the password field to the backend token endpoint. Adjust the endpoint as needed.
    const payload = {
      govt_id: govtId,
      name: fullName,
      role: backendRole,
    };

    try {
      setLoading(true);
      // Adjust URL if backend runs on different host/port. Using relative path assumes proxy setup.
      const tokenRes = await fetch('http://127.0.0.1:8000/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!tokenRes.ok) {
        // Read raw text first (avoids consuming the body twice). Then try
        // to parse JSON from that text for better UX.
        let errMsg = 'Login failed';
        const bodyText = await tokenRes.text();
        try {
          const errJson = JSON.parse(bodyText);
          if (errJson.errors) {
            const parts: string[] = [];
            for (const k of Object.keys(errJson.errors)) {
              const v = errJson.errors[k];
              if (Array.isArray(v)) parts.push(`${k}: ${v.join('; ')}`);
              else parts.push(`${k}: ${String(v)}`);
            }
            errMsg = parts.join('\n');
          } else if (errJson.detail) {
            errMsg = errJson.detail;
          } else {
            errMsg = JSON.stringify(errJson);
          }
        } catch (e) {
          // Not JSON — use raw text
          errMsg = bodyText || errMsg;
        }
        throw new Error(errMsg);
      }

      const data = await tokenRes.json();
  // expected shape: { access, refresh, user }
  localStorage.setItem('accessToken', data.access);
  localStorage.setItem('refreshToken', data.refresh);
  localStorage.setItem('userGovtId', data.user.govt_id || govtId);
  localStorage.setItem('userName', data.user.name || fullName);
  // store frontend role (the one used by the UI) so routing works
  localStorage.setItem('userRole', role);

  // determine frontend role for routing
  const frontendRole = normalizeBackendToFrontend(backendRole);
  localStorage.setItem('userRole', frontendRole);

  // Call onLogin with frontend role string so App routes correctly
  // await it so the Login loading animation remains visible during navigation
  await onLogin(frontendRole);
    } catch (err: any) {
      console.error('Login error', err);
      alert('Login failed: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
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
                <Label htmlFor="govt_id">Govt ID</Label>
                <Input
                  id="govt_id"
                  type="text"
                  value={govtId}
                  onChange={(e) => setGovtId(e.target.value)}
                  placeholder="Enter your Govt ID"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role (enter role as password)</Label>
                <Input
                  id="role"
                  type="password"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Enter your role (e.g. station_master or station-master)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="captcha">Enter CAPTCHA</Label>
                <Captcha onChange={(text: string) => setGeneratedCaptcha(text)} />
                <Input
                  id="captcha"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter CAPTCHA"
                />
              </div>
              
              <Button onClick={handleLogin} className="w-full bg-black hover:bg-gray-800" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              
              
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
