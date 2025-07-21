import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Lock, Key } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoginFormData {
  email: string;
  password: string;
  adminToken?: string;
}

const LoginWithToken: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginType, setLoginType] = useState<'regular' | 'token'>('regular');
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    adminToken: ''
  });

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (loginType === 'regular') {
      if (!formData.email || !formData.password) {
        setError('Please enter your email and password');
        return false;
      }
    } else {
      if (!formData.email || !formData.password || !formData.adminToken) {
        setError('Please enter your email, password, and admin token');
        return false;
      }
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await login(
        formData.email,
        formData.password,
        loginType === 'token' ? formData.adminToken : undefined
      );

      if (result.success) {
        // Redirect to app
        navigate('/');
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h1>
          <p className="text-gray-600 mt-2">
            Sign in to your PrintSoft ERP account
          </p>
        </div>

        <Card>
          <CardHeader>
            <Tabs value={loginType} onValueChange={(value) => setLoginType(value as 'regular' | 'token')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="regular">Regular Login</TabsTrigger>
                <TabsTrigger value="token">With Token</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10"
                />
              </div>

              {loginType === 'token' && (
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Admin Token"
                    value={formData.adminToken}
                    onChange={(e) => handleInputChange('adminToken', e.target.value)}
                    className="pl-10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the admin token provided by your team administrator
                  </p>
                </div>
              )}
            </div>

            <Button 
              onClick={handleLogin} 
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>

            <div className="text-center space-y-2">
              <button 
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot your password?
              </button>
              
              <div className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button 
                  onClick={() => navigate('/register')}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Start your free trial
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {loginType === 'token' && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Key className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Joining a team?</p>
                  <p className="text-blue-700">
                    Use the admin token provided by your team administrator to join their subscription.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LoginWithToken;
