import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect } from 'react';

interface MobileDashboardOptions {
  forceDesktopLayout?: boolean;
  enableHorizontalScroll?: boolean;
  maintainCardSizing?: boolean;
}

export const useMobileDashboard = (options: MobileDashboardOptions = {}) => {
  const {
    forceDesktopLayout = true,
    enableHorizontalScroll = true,
    maintainCardSizing = true
  } = options;

  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) return;

    const body = document.body;
    const html = document.documentElement;

    // Apply mobile-specific optimizations
    if (forceDesktopLayout) {
      body.classList.add('force-desktop-layout');
    }

    if (enableHorizontalScroll) {
      body.style.overflowX = 'auto';
    }

    if (maintainCardSizing) {
      body.classList.add('mobile-desktop-exact');
    }

    // Cleanup on unmount
    return () => {
      body.classList.remove('force-desktop-layout', 'mobile-desktop-exact');
      body.style.overflowX = '';
    };
  }, [isMobile, forceDesktopLayout, enableHorizontalScroll, maintainCardSizing]);

  // Return mobile-specific utilities
  return {
    isMobile,
    shouldUseDesktopLayout: forceDesktopLayout && isMobile,
    getMobileGridClass: (desktopCols: number) => {
      if (!isMobile) return `lg:grid-cols-${desktopCols} md:grid-cols-2`;
      return 'grid-cols-2'; // Force 2 columns on mobile for optimal visibility
    },
    getMobileTextClass: (desktopSize: string) => {
      if (!isMobile) return desktopSize;
      // Maintain desktop text sizes on mobile for consistency
      return desktopSize;
    },
    getMobilePaddingClass: (desktopPadding: string) => {
      if (!isMobile) return desktopPadding;
      // Maintain desktop padding on mobile
      return desktopPadding;
    }
  };
};

export default useMobileDashboard;
