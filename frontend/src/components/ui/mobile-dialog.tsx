import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { VisuallyHidden } from './visually-hidden';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const MobileDialog: React.FC<MobileDialogProps> = ({
  open,
  onOpenChange,
  title,
  children,
  className
}) => {
  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          // Desktop styles
          "max-w-6xl max-h-[95vh] overflow-y-auto",
          // Mobile styles - almost full screen with better sizing for document viewing
          isMobile && "max-sm:inset-2 max-sm:w-[calc(100vw-1rem)] max-sm:h-[calc(100vh-1rem)] max-sm:left-2 max-sm:top-2 max-sm:max-w-none max-sm:p-2 max-sm:gap-2",
          className
        )}
      >
        <DialogHeader className={isMobile ? "pb-2" : ""}>
          {title ? (
            <DialogTitle className={cn(
              "text-lg font-semibold",
              isMobile ? "text-base pr-8" : ""
            )}>
              {title}
            </DialogTitle>
          ) : (
            <VisuallyHidden asChild>
              <DialogTitle>Dialog</DialogTitle>
            </VisuallyHidden>
          )}
        </DialogHeader>
        
        <div className={cn(
          "flex-1 overflow-y-auto",
          isMobile ? "min-h-0" : ""
        )}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileDialog;
