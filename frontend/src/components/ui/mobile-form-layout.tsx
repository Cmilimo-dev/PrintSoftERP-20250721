import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MobileFormLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileFormLayout: React.FC<MobileFormLayoutProps> = ({
  children,
  className
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "min-h-screen bg-background",
      isMobile ? "p-2" : "p-6",
      className
    )}>
      <div className={cn(
        "mx-auto",
        isMobile ? "max-w-full px-1" : "max-w-4xl"
      )}>
        {children}
      </div>
    </div>
  );
};

interface MobileFormHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  onBack?: () => void;
  className?: string;
}

export const MobileFormHeader: React.FC<MobileFormHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  onBack,
  className
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "flex flex-col mb-4",
      isMobile ? "gap-2" : "gap-4 mb-6",
      className
    )}>
      {/* Back button for mobile */}
      {isMobile && onBack && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="self-start p-1 h-8"
        >
          ← Back
        </Button>
      )}
      
      <div className={cn(
        "flex justify-between items-start",
        isMobile ? "flex-col gap-2" : "flex-row gap-4"
      )}>
        <div className="flex-1 min-w-0">
          <div className={cn(
            "flex items-center gap-2",
            isMobile ? "flex-col items-start" : "flex-row gap-3"
          )}>
            <h1 className={cn(
              "font-bold text-foreground",
              isMobile ? "text-lg leading-tight" : "text-3xl"
            )}>
              {title}
            </h1>
            {badge && <div className={isMobile ? "self-start" : ""}>{badge}</div>}
          </div>
          {subtitle && (
            <p className={cn(
              "text-muted-foreground mt-1",
              isMobile ? "text-xs" : "text-base"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className={cn(
            "flex gap-1",
            isMobile ? "w-full flex-col" : "flex-row gap-2"
          )}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

interface MobileFormCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export const MobileFormCard: React.FC<MobileFormCardProps> = ({
  title,
  icon,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className
}) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <Card className={cn(
      isMobile ? "mb-4" : "mb-6",
      className
    )}>
      <CardHeader 
        className={cn(
          "pb-3",
          isMobile ? "p-4" : "p-6",
          collapsible && "cursor-pointer"
        )}
        onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <CardTitle className={cn(
          "flex items-center gap-2",
          isMobile ? "text-lg" : "text-xl"
        )}>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className="flex-1">{title}</span>
          {collapsible && (
            <span className="text-muted-foreground">
              {isCollapsed ? '▼' : '▲'}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      {(!collapsible || !isCollapsed) && (
        <CardContent className={cn(
          isMobile ? "p-4 pt-0" : "p-6 pt-0"
        )}>
          {children}
        </CardContent>
      )}
    </Card>
  );
};

interface MobileFormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const MobileFormGrid: React.FC<MobileFormGridProps> = ({
  children,
  columns = 2,
  className
}) => {
  const isMobile = useIsMobile();

  // On mobile, force single column for most cases, max 2 for simple fields
  const gridCols = isMobile 
    ? (columns > 2 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')
    : columns === 4 
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      : columns === 3
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : columns === 2
          ? 'grid-cols-1 md:grid-cols-2'
          : 'grid-cols-1';

  return (
    <div className={cn(
      'grid gap-4',
      gridCols,
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
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "flex gap-2 mt-6",
      isMobile ? "flex-col" : "flex-row justify-end",
      className
    )}>
      {children}
    </div>
  );
};

interface MobileTableContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileTableContainer: React.FC<MobileTableContainerProps> = ({
  children,
  className
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={cn(
        "overflow-x-auto bg-white rounded-lg border",
        className
      )}>
        <div className="min-w-[640px]">
          {children}
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

interface MobileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const MobileSearchBar: React.FC<MobileSearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  icon,
  actions,
  className
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "flex gap-2",
      isMobile ? "flex-col" : "flex-row items-center",
      className
    )}>
      <div className={cn(
        "relative flex-1",
        isMobile ? "min-w-full" : "min-w-[300px]"
      )}>
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full h-10 px-3 border border-input bg-background text-sm rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            icon && "pl-10"
          )}
        />
      </div>
      
      {actions && (
        <div className={cn(
          "flex gap-2",
          isMobile ? "w-full" : "flex-shrink-0"
        )}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default {
  MobileFormLayout,
  MobileFormHeader,
  MobileFormCard,
  MobileFormGrid,
  MobileFormActions,
  MobileTableContainer,
  MobileSearchBar
};
