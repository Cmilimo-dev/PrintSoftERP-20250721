import React from 'react';
import { Button } from './button';
import { Calendar, CalendarDays } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export interface DateRange {
  from?: Date;
  to?: Date;
}

interface DatePickerWithRangeProps {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  className?: string;
}

export const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({
  date,
  onDateChange,
  className
}) => {
  const isMobile = useIsMobile();
  
  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return isMobile ? "Date range" : "Select date range";
    if (!range.to) return range.from.toLocaleDateString();
    return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`;
  };

  const handlePresetRange = (preset: 'week' | 'month' | 'quarter' | 'year') => {
    const to = new Date();
    const from = new Date();
    
    switch (preset) {
      case 'week':
        from.setDate(to.getDate() - 7);
        break;
      case 'month':
        from.setDate(to.getDate() - 30);
        break;
      case 'quarter':
        from.setDate(to.getDate() - 90);
        break;
      case 'year':
        from.setFullYear(to.getFullYear() - 1);
        break;
    }
    
    onDateChange({ from, to });
  };

  return (
    <div className={cn(
      "flex items-center gap-2",
      isMobile ? "flex-col w-full" : "flex-row",
      className
    )}>
      <Button
        variant="outline"
        className={cn(
          "justify-start text-left font-normal",
          isMobile ? "w-full h-12" : "w-[240px]"
        )}
      >
        <CalendarDays className="mr-2 h-4 w-4" />
        {formatDateRange(date)}
      </Button>
      
      <div className={cn(
        "flex gap-1",
        isMobile ? "w-full" : "flex-shrink-0"
      )}>
        <Button
          variant="outline"
          size={isMobile ? "default" : "sm"}
          onClick={() => handlePresetRange('week')}
          className={isMobile ? "flex-1 h-10" : ""}
        >
          7D
        </Button>
        <Button
          variant="outline"
          size={isMobile ? "default" : "sm"}
          onClick={() => handlePresetRange('month')}
          className={isMobile ? "flex-1 h-10" : ""}
        >
          30D
        </Button>
        <Button
          variant="outline"
          size={isMobile ? "default" : "sm"}
          onClick={() => handlePresetRange('quarter')}
          className={isMobile ? "flex-1 h-10" : ""}
        >
          90D
        </Button>
        <Button
          variant="outline"
          size={isMobile ? "default" : "sm"}
          onClick={() => handlePresetRange('year')}
          className={isMobile ? "flex-1 h-10" : ""}
        >
          1Y
        </Button>
      </div>
    </div>
  );
};
