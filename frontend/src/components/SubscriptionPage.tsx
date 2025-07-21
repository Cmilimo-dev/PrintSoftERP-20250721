import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService, SubscriptionPlan } from '../services/subscriptionService';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SubscriptionPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const { subscription, refreshSubscription } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const fetchedPlans = await subscriptionService.getPlans();
        setPlans(fetchedPlans);
      } catch (err) {
        setError('Failed to load subscription plans.');
        console.error('Plans fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    setError(null);
    
    try {
      const result = await subscriptionService.subscribe(planId);
      if (result.success) {
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else {
          // Subscription successful, refresh and redirect
          await refreshSubscription();
          navigate('/');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Subscription failed. Please try again.');
      console.error('Subscription error:', err);
    } finally {
      setSubscribing(null);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4 text-lg">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Choose Your Plan
        </h1>
        <p className="text-lg text-gray-600">
          Select the perfect plan for your business needs
        </p>
        {subscription && subscription.isActive && (
          <div className="mt-4">
            <Button variant="outline" onClick={handleBackToHome}>
              ← Back to Dashboard
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {subscription && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold capitalize">Plan: {subscription.plan}</p>
                <p className="text-sm text-gray-600">
                  Status: {subscription.isActive ? 'Active' : 'Inactive'}
                </p>
                {subscription.expiresAt && (
                  <p className="text-sm text-gray-600">
                    Expires: {new Date(subscription.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Badge variant={subscription.isActive ? "default" : "destructive"}>
                {subscription.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {plans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-lg">No subscription plans available at the moment.</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlan={subscription?.plan}
              isSubscribing={subscribing === plan.id}
              onSubscribe={() => handleSubscribe(plan.id)}
            />
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-sm text-gray-600 mb-4">
          Need help choosing a plan? Contact our support team.
        </p>
        <Button variant="outline">
          Contact Support
        </Button>
      </div>
    </div>
  );
};

interface PlanCardProps {
  plan: SubscriptionPlan;
  currentPlan?: string;
  isSubscribing: boolean;
  onSubscribe: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, currentPlan, isSubscribing, onSubscribe }) => {
  const isCurrentPlan = currentPlan === plan.id;
  const isPopular = plan.id === 'professional'; // Mark professional as popular

  return (
    <Card className={`relative ${isPopular ? 'ring-2 ring-blue-500' : ''} ${isCurrentPlan ? 'bg-gray-50' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge>Most Popular</Badge>
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {plan.name}
          {isCurrentPlan && <Badge variant="secondary">Current</Badge>}
        </CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold">${plan.price}</span>
          <span className="text-gray-600">/{plan.interval}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-2 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        
        <Button 
          className="w-full" 
          onClick={onSubscribe}
          disabled={isSubscribing || isCurrentPlan}
          variant={isCurrentPlan ? "secondary" : "default"}
        >
          {isSubscribing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isCurrentPlan ? 'Current Plan' : 
           isSubscribing ? 'Processing...' : 
           'Subscribe Now'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPage;
