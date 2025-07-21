import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { StockMovement } from '@/types/enhanced-database';
import { Badge } from '@/components/ui/badge';
import { BadgeCheck, RotateCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { cn } from '@/lib/utils';

// Helper function to format date
const formatDate = (date: string | null) => date ? new Date(date).toLocaleDateString() : '--';

// Label Colors for movement types
const typeColors: Record<string, string> = {
  in: 'green',
  out: 'red',
  transfer: 'blue',
  adjustment: 'yellow',
  return: 'indigo',
  damage: 'gray'
};

export const StockMovementTracker = () => {
  const isMobile = useIsMobile();
  const { data: movements, isLoading } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          part:parts(id, name, part_number),
          from_location:from_location_id(name),
          to_location:to_location_id(name)
        `)
        .order('movement_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as StockMovement[];
    }
  });

  return (
    <div className={cn(
      "space-y-6",
      isMobile ? "p-2" : ""
    )}>
      <div className={cn(
        "flex items-center",
        isMobile ? "flex-col space-y-2 text-center" : "justify-between"
      )}>
        <div className={isMobile ? "text-center" : ""}>
          <h1 className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-2xl"
          )}>Recent Stock Movements</h1>
          <p className={cn(
            "text-gray-600",
            isMobile ? "text-sm" : ""
          )}>Track recent inventory changes</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movement Details</CardTitle>
          <CardDescription>Review the most recent stock movements.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-8">Loading stock movements...</div>
            ) : movements?.length ? (
              movements.map(movement => (
                <div key={movement.id} className={cn(
                  "border rounded-lg hover:bg-gray-50",
                  isMobile ? "p-3" : "p-4"
                )}>
                  <div className={cn(
                    "flex items-start",
                    isMobile ? "flex-col space-y-3" : "justify-between"
                  )}>
                    <div className={isMobile ? "w-full" : ""}>
                      <h3 className={cn(
                        "font-medium flex items-center",
                        isMobile ? "flex-col space-y-2 items-start" : "space-x-2"
                      )}>
                        <span className={isMobile ? "text-sm" : ""}>{movement.movement_number}</span>
                        <Badge className={cn(
                          `bg-${typeColors[movement.movement_type]}-100 text-${typeColors[movement.movement_type]}-800`,
                          isMobile ? "text-xs" : ""
                        )}>{movement.movement_type.toUpperCase()}</Badge>
                      </h3>
                      <p className={cn(
                        "text-gray-600",
                        isMobile ? "text-xs mt-1" : "text-sm"
                      )}>{movement.part?.name} ({movement.part?.part_number})</p>
                      <p className={cn(
                        isMobile ? "text-xs" : "text-sm"
                      )}>Quantity: {movement.quantity.toFixed(2)} | Cost: ${movement.total_cost?.toFixed(2)}</p>
                    </div>

                    <div className={cn(
                      isMobile ? "w-full flex justify-between items-center" : "text-right"
                    )}>
                      <p className={cn(
                        "font-medium",
                        isMobile ? "text-xs" : "text-sm"
                      )}>
                        {formatDate(movement.movement_date)}
                      </p>
                      {movement.requires_approval && !movement.approved_at && (
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded",
                          isMobile ? "text-xs" : "text-xs"
                        )}>
                          <RotateCw className="mr-1 h-3 w-3 inline" /> Pending Approval
                        </span>
                      )}
                    </div>
                  </div>

                  {(movement.from_location || movement.to_location) && (
                    <div className="mt-2 text-sm text-gray-600">
                      From: {movement.from_location?.name || '--'} → To: {movement.to_location?.name || '--'}
                    </div>
                  )}

                  {movement.notes && (
                    <p className="mt-2 text-sm text-gray-600">{movement.notes}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No movements found. Stock data is up-to-date.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockMovementTracker;

