import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileDashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
  forceDesktopLayout?: boolean;
}

export const MobileDashboardLayout: React.FC<MobileDashboardLayoutProps> = ({
  children,
  className,
  forceDesktopLayout = true
}) => {
  const isMobile = useIsMobile();

  return (
    <div 
      className={cn(
        "dashboard-container",
        forceDesktopLayout && isMobile && "force-desktop-layout",
        className
      )}
    >
      {children}
    </div>
  );
};

interface DashboardStatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({
  children,
  columns = 4,
  className
}) => {
  const isMobile = useIsMobile();

  // On mobile, force 2 columns for readability, but maintain desktop appearance
  const gridCols = isMobile 
    ? 'grid-cols-2' 
    : columns === 4 
      ? 'lg:grid-cols-4 md:grid-cols-2' 
      : columns === 3 
        ? 'lg:grid-cols-3 md:grid-cols-2' 
        : 'grid-cols-2';

  return (
    <div className={cn(
      'grid gap-4 md:gap-6',
      gridCols,
      'stats-grid',
      className
    )}>
      {children}
    </div>
  );
};

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  children,
  className
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6",
      className
    )}>
      <div>
        <h1 className={cn(
          "font-bold text-gray-900",
          isMobile ? "text-2xl" : "text-3xl"
        )}>
          {title}
        </h1>
        {subtitle && (
          <p className={cn(
            "text-gray-600 mt-1",
            isMobile ? "text-sm" : "text-base"
          )}>
            {subtitle}
          </p>
        )}
      </div>
      
      {children && (
        <div className={cn(
          "flex items-center gap-2",
          isMobile ? "w-full flex-col sm:w-auto sm:flex-row" : "gap-3"
        )}>
          {children}
        </div>
      )}
    </div>
  );
};

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  forceDesktopSpacing?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  className,
  forceDesktopSpacing = true
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      forceDesktopSpacing && isMobile ? "mobile-desktop-exact" : "",
      className
    )}>
      {children}
    </div>
  );
};

interface DashboardCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardCardHeader: React.FC<DashboardCardHeaderProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(
      "dashboard-card-header flex flex-row items-center justify-between space-y-0 pb-2",
      className
    )}>
      {children}
    </div>
  );
};

interface DashboardCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardCardContent: React.FC<DashboardCardContentProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(
      "dashboard-card-content p-6 pt-0",
      className
    )}>
      {children}
    </div>
  );
};

interface MobileTableWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileTableWrapper: React.FC<MobileTableWrapperProps> = ({
  children,
  className
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={cn(
        "overflow-x-auto table-mobile",
        className
      )}>
        <div className="min-w-full">
          {children}
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
};

export default {
  MobileDashboardLayout,
  DashboardStatsGrid,
  DashboardHeader,
  DashboardCard,
  DashboardCardHeader,
  DashboardCardContent,
  MobileTableWrapper
};
