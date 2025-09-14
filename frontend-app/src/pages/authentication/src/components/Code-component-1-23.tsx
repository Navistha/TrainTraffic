import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CaptchaComponent } from './CaptchaComponent';
import { toast } from 'sonner@2.0.3';

interface User {
  id: string;
  email: string;
  fullName: string;
  governmentId: string;
  password: string;
}

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginCaptchaValid, setLoginCaptchaValid] = useState(false);
  
  // Sign up form state
  const [signupFullName, setSignupFullName] = useState('');
  const [signupGovId, setSignupGovId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupCaptchaValid, setSignupCaptchaValid] = useState(false);

  // Simulated user database (in real app, this would be handled by backend)
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'admin@indianrailways.gov.in',
      fullName: 'Railway Administrator',
      governmentId: 'RAIL001',
      password: 'admin123' // In real app, this would be hashed
    }
  ]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginCaptchaValid) {
      toast.error('Please complete the CAPTCHA verification');
      return;
    }
    
    // Find user by email and password
    const user = users.find(u => 
      u.email === loginEmail && u.password === loginPassword
    );
    
    if (user) {
      toast.success('Login successful!');
      onAuthSuccess(user);
    } else {
      toast.error('Invalid credentials. Please try again.');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupCaptchaValid) {
      toast.error('Please complete the CAPTCHA verification');
      return;
    }
    
    if (signupPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    // Check if email already exists
    const existingUser = users.find(u => u.email === signupEmail);
    if (existingUser) {
      toast.error('Email already registered. Please use a different email.');
      return;
    }
    
    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email: signupEmail,
      fullName: signupFullName,
      governmentId: signupGovId,
      password: signupPassword // In real app, this would be hashed
    };
    
    setUsers([...users, newUser]);
    toast.success('Registration successful! You can now login.');
    
    // Switch to login tab
    setActiveTab('login');
    
    // Clear signup form
    setSignupFullName('');
    setSignupGovId('');
    setSignupEmail('');
    setSignupPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1723357646143-68b17c10ee0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjByYWlsd2F5cyUyMGxvZ28lMjBnb3Zlcm5tZW50JTIwb2ZmaWNpYWx8ZW58MXx8fHwxNzU3NjUxNDM5fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Indian Railways Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-black">Railway Management Portal</h1>
          <p className="text-gray-600 mt-1">Government of India – Ministry of Railways</p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="login" className="data-[state=active]:bg-white">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-white">
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <CardTitle className="text-center text-black">Secure Login</CardTitle>
                <Separator className="my-4" />
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email ID</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <CaptchaComponent onCaptchaChange={setLoginCaptchaValid} />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-black text-white hover:bg-gray-800"
                  >
                    Login
                  </Button>
                  
                  <div className="text-center">
                    <button 
                      type="button" 
                      className="text-sm text-gray-600 hover:text-black"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </form>
                
                <div className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => setActiveTab('signup')}
                    className="text-black hover:underline"
                  >
                    Sign Up
                  </button>
                </div>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <CardTitle className="text-center text-black">Register</CardTitle>
                <Separator className="my-4" />
                
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-govid">Government ID</Label>
                    <Input
                      id="signup-govid"
                      type="text"
                      placeholder="Aadhaar / PAN / Railway Employee ID"
                      value={signupGovId}
                      onChange={(e) => setSignupGovId(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email ID</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <CaptchaComponent onCaptchaChange={setSignupCaptchaValid} />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-black text-white hover:bg-gray-800"
                  >
                    Sign Up
                  </Button>
                </form>
                
                <div className="text-center text-sm text-gray-600">
                  Already registered?{' '}
                  <button 
                    onClick={() => setActiveTab('login')}
                    className="text-black hover:underline"
                  >
                    Login
                  </button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}