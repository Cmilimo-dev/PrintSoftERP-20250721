import React from 'react';
import { useInventoryMonitoring } from '@/hooks/useInventoryMonitoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, X, Bell, BellOff } from 'lucide-react';

interface InventoryAlertsProps {
  className?: string;
}

const InventoryAlerts: React.FC<InventoryAlertsProps> = ({ className }) => {
  const {
    alerts,
    clearAlert,
    clearAllAlerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  } = useInventoryMonitoring();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'out_of_stock':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'low_stock':
        return <Package className="h-4 w-4 text-yellow-500" />;
      case 'reorder_point':
        return <Package className="h-4 w-4 text-orange-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getAlertBadgeVariant = (type: string) => {
    switch (type) {
      case 'out_of_stock':
        return 'destructive';
      case 'low_stock':
        return 'secondary';
      case 'reorder_point':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'out_of_stock':
        return 'Out of Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'reorder_point':
        return 'Reorder Point';
      default:
        return 'Alert';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Alerts
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
            >
              {isMonitoring ? (
                <>
                  <BellOff className="h-4 w-4 mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-1" />
                  Start
                </>
              )}
            </Button>
            {alerts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllAlerts}
              >
                Clear All
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isMonitoring && (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Inventory monitoring is stopped</p>
            <p className="text-xs mt-1">Click "Start" to begin monitoring inventory levels</p>
          </div>
        )}

        {isMonitoring && alerts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No inventory alerts</p>
            <p className="text-xs mt-1">All inventory levels are within normal ranges</p>
          </div>
        )}

        {alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start justify-between p-3 border rounded-lg bg-card"
              >
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{alert.productName}</p>
                      <Badge variant={getAlertBadgeVariant(alert.type) as any} className="text-xs">
                        {getAlertTypeLabel(alert.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Current: {alert.currentStock}</span>
                      <span>Threshold: {alert.threshold}</span>
                      <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearAlert(alert.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryAlerts;
