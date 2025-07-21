import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
  mobileHide?: boolean; // Hide this column on mobile
}

interface ResponsiveTableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  onRowClick?: (row: any) => void;
  className?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  data,
  columns,
  loading = false,
  onRowClick,
  className
}) => {
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (isMobile) {
    // Mobile view: Show as cards
    return (
      <div className="space-y-3">
        {data.map((row, index) => (
          <Card 
            key={index} 
            className={cn(
              "cursor-pointer hover:shadow-md transition-shadow",
              onRowClick && "hover:bg-gray-50"
            )}
            onClick={() => onRowClick?.(row)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                {columns
                  .filter(col => !col.mobileHide)
                  .map((column) => {
                    const value = row[column.key];
                    const renderedValue = column.render ? column.render(value, row) : value;
                    
                    return (
                      <div key={column.key} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          {column.header}:
                        </span>
                        <span className={cn("text-sm", column.className)}>
                          {renderedValue}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop view: Traditional table
  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  "hover:bg-gray-50 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => {
                  const value = row[column.key];
                  const renderedValue = column.render ? column.render(value, row) : value;
                  
                  return (
                    <td
                      key={column.key}
                      className={cn("px-6 py-4 whitespace-nowrap text-sm", column.className)}
                    >
                      {renderedValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No data available</p>
        </div>
      )}
    </div>
  );
};

// Helper component for status badges
export const StatusBadge: React.FC<{ status: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' }> = ({ 
  status, 
  variant = 'default' 
}) => {
  const getVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'paid':
        return 'default';
      case 'pending':
      case 'draft':
        return 'secondary';
      case 'cancelled':
      case 'overdue':
        return 'destructive';
      default:
        return variant;
    }
  };

  return (
    <Badge variant={getVariant(status)} className="text-xs">
      {status}
    </Badge>
  );
};

export default ResponsiveTable;
