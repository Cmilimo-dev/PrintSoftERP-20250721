import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Loader2, Building, Users, Crown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { subscriptionService, SubscriptionPlan } from '@/services/subscriptionService';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  planId: string;
}

const RegisterWithPlan: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('trial');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: searchParams.get('email') || '',
    password: '',
    confirmPassword: '',
    companyName: '',
    planId: 'trial'
  });

  // Check if user is joining via admin token
  const adminToken = searchParams.get('token');
  const isInvited = !!adminToken;

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const fetchedPlans = await subscriptionService.getPlans();
        setPlans(fetchedPlans);
      } catch (err) {
        setError('Failed to load subscription plans');
      }
    };

    fetchPlans();
  }, []);

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setFormData(prev => ({ ...prev, planId }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (!isInvited && !formData.companyName) {
      setError('Company name is required');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use the auth context register function
      
      const registrationData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        companyName: formData.companyName,
        planId: formData.planId,
        adminToken: isInvited ? adminToken : undefined
      };

      const result = await register(registrationData);

      if (result.success) {
        if (result.adminToken && !isInvited) {
          alert(`Registration successful! Your admin token is: ${result.adminToken}\n\nSave this token - you can share it with team members to join your subscription.`);
        }
        
        // Redirect to app
        navigate('/');
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    if (planId === 'trial') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (planId.includes('enterprise')) return <Crown className="h-5 w-5 text-purple-500" />;
    return <Building className="h-5 w-5 text-blue-500" />;
  };

  const getRecommendedPlan = () => {
    return plans.find(plan => plan.id === 'professional_monthly');
  };

  if (isInvited) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Join the Team</CardTitle>
            <CardDescription>
              You've been invited to join an existing company subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <Input
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
              />
              <Input
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
              />
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              />
            </div>

            <Button 
              onClick={handleRegister} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Join Team
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:underline"
              >
                Sign in
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Get Started with PrintSoft ERP
          </h1>
          <p className="text-lg text-gray-600">
            Choose your plan and create your account
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plan Selection */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Choose Your Plan</h2>
            
            <Tabs defaultValue="monthly" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>

              <TabsContent value="monthly" className="space-y-4">
                {plans.filter(plan => plan.interval === 'trial' || plan.interval === 'monthly').map((plan) => {
                  const isRecommended = plan.id === 'professional_monthly';
                  return (
                    <Card 
                      key={plan.id}
                      className={`cursor-pointer transition-all ${
                        selectedPlan === plan.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      } ${isRecommended ? 'border-blue-500' : ''}`}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      {isRecommended && (
                        <div className="bg-blue-500 text-white px-4 py-1 text-sm font-medium rounded-t-lg">
                          Most Popular
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getPlanIcon(plan.id)}
                            <CardTitle>{plan.name}</CardTitle>
                          </div>
                          {selectedPlan === plan.id && (
                            <CheckCircle className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <CardDescription>
                          <span className="text-3xl font-bold">${plan.price}</span>
                          {plan.interval !== 'trial' && <span className="text-gray-600">/{plan.interval}</span>}
                          {plan.savings && (
                            <Badge variant="secondary" className="ml-2">{plan.savings}</Badge>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="yearly" className="space-y-4">
                {plans.filter(plan => plan.interval === 'trial' || plan.interval === 'yearly').map((plan) => (
                  <Card 
                    key={plan.id}
                    className={`cursor-pointer transition-all ${
                      selectedPlan === plan.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getPlanIcon(plan.id)}
                          <CardTitle>{plan.name}</CardTitle>
                        </div>
                        {selectedPlan === plan.id && (
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <CardDescription>
                        <span className="text-3xl font-bold">${plan.price}</span>
                        {plan.interval !== 'trial' && <span className="text-gray-600">/{plan.interval}</span>}
                        {plan.savings && (
                          <Badge variant="secondary" className="ml-2">{plan.savings}</Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Registration Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Your Account</CardTitle>
                <CardDescription>
                  Fill in your details to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                  <Input
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>

                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />

                <Input
                  placeholder="Company Name"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />

                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />

                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                />

                <Button 
                  onClick={handleRegister} 
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account & Start {selectedPlan === 'trial' ? 'Free Trial' : 'Subscription'}
                </Button>

                <p className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <button 
                    onClick={() => navigate('/login')}
                    className="text-blue-600 hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </CardContent>
            </Card>

            {/* Selected Plan Summary */}
            {selectedPlan && (
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg">Selected Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const plan = plans.find(p => p.id === selectedPlan);
                    if (!plan) return null;
                    
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{plan.name}</span>
                          <span className="font-bold">${plan.price}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Max Users: {plan.maxUsers}</div>
                          <div>Max Companies: {plan.maxCompanies}</div>
                          {plan.trialDays && <div>Trial Period: {plan.trialDays} days</div>}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterWithPlan;
