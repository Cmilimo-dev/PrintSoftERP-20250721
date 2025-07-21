import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { UserSettings } from './UserSettings';
import { cn } from '@/lib/utils';

interface UserSettingsButtonProps {
  variant?: "default" | "outline" | "ghost" | "button";
  className?: string;
  children?: React.ReactNode;
}

export const UserSettingsButton: React.FC<UserSettingsButtonProps> = ({ 
  variant = "outline", 
  className,
  children 
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <Button 
        variant={variant === "button" ? "outline" : variant}
        onClick={() => setIsSettingsOpen(true)}
        className={cn("flex items-center gap-2", className)}
      >
        <Settings className="h-4 w-4" />
        {children || "Settings"}
      </Button>
      
      <UserSettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default UserSettingsButton;
