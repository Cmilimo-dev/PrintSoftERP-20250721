import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const HomePage: React.FC = () => {
  const { subscription, isLoading, isFeatureAvailable } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if subscription is explicitly inactive (not loading)
    if (!isLoading && subscription && !subscription.isActive) {
      navigate('/subscription');
    }
  }, [isLoading, subscription, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Unable to Load Subscription</CardTitle>
            <CardDescription>
              Please check your connection and try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome to PrintSoftERP
        </h1>
        <p className="text-lg text-gray-600">
          Your comprehensive business management solution
        </p>
      </div>

      {/* Subscription Status Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Subscription Status
            <Badge variant={subscription.isActive ? "default" : "destructive"}>
              {subscription.isActive ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Current Plan</p>
              <p className="font-semibold capitalize">{subscription.plan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expires</p>
              <p className="font-semibold">
                {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/subscription')}
              >
                Manage Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          title="Basic Invoicing"
          description="Create and manage invoices"
          available={isFeatureAvailable('basic_invoicing')}
          onClick={() => navigate('/invoices')}
        />
        
        <FeatureCard
          title="Inventory Management"
          description="Track your inventory and stock"
          available={isFeatureAvailable('inventory_management')}
          onClick={() => navigate('/inventory')}
        />
        
        <FeatureCard
          title="Advanced Reports"
          description="Detailed analytics and insights"
          available={isFeatureAvailable('advanced_reports')}
          onClick={() => navigate('/reports')}
        />
        
        <FeatureCard
          title="Multi-User Access"
          description="Collaborate with your team"
          available={isFeatureAvailable('multi_user')}
          onClick={() => navigate('/users')}
        />
        
        <FeatureCard
          title="API Access"
          description="Integrate with other systems"
          available={isFeatureAvailable('api_access')}
          onClick={() => navigate('/api')}
        />
        
        <FeatureCard
          title="Custom Fields"
          description="Customize forms and data"
          available={isFeatureAvailable('custom_fields')}
          onClick={() => navigate('/settings/fields')}
        />
      </div>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  available: boolean;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, available, onClick }) => {
  return (
    <Card className={`cursor-pointer transition-all ${available ? 'hover:shadow-lg' : 'opacity-50'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          {!available && <Badge variant="secondary">Upgrade Required</Badge>}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant={available ? "default" : "outline"} 
          onClick={onClick}
          disabled={!available}
          className="w-full"
        >
          {available ? "Access Feature" : "Upgrade to Access"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default HomePage;
