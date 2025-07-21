import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileFormLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileFormLayout: React.FC<MobileFormLayoutProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  );
};

interface MobileFormCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const MobileFormCard: React.FC<MobileFormCardProps> = ({ 
  title, 
  children, 
  className 
}) => {
  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        {children}
      </CardContent>
    </Card>
  );
};

interface MobileFormGridProps {
  cols?: number;
  children: React.ReactNode;
  className?: string;
}

export const MobileFormGrid: React.FC<MobileFormGridProps> = ({ 
  cols = 1, 
  children, 
  className 
}) => {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2", 
    3: "grid-cols-3",
    4: "grid-cols-4"
  };

  return (
    <div className={cn(
      "grid gap-4",
      gridClasses[cols as keyof typeof gridClasses] || "grid-cols-1",
      className
    )}>
      {children}
    </div>
  );
};

interface MobileFormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileFormActions: React.FC<MobileFormActionsProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn("flex gap-2 pt-4", className)}>
      {children}
    </div>
  );
};
