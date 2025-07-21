import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import SystemSettingsManager from '@/components/settings/SystemSettingsManager';
import UserManagement from '@/components/settings/UserManagement';
import DocumentServiceSettings from '@/components/settings/DocumentServiceSettings';
import { SettingsTest } from '@/components/test/SettingsTest';
import { PermissionTest } from '@/components/test/PermissionTest';
import { auth } from '@/lib/api';
import { 
  Settings as SettingsIcon, 
  Users, 
  FileText, 
  Shield, 
  Download,
  Building2,
  Hash,
  CreditCard,
  PenTool,
  Globe,
  HelpCircle,
  ArrowLeft,
  File,
  FileSpreadsheet,
  Archive,
  Brush
} from 'lucide-react';
import { 
  MobileDashboardLayout,
  DashboardHeader
} from '@/components/ui/mobile-dashboard-layout';


interface ClickableLinkProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const ClickableLink: React.FC<ClickableLinkProps> = ({ icon, title, description, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className="py-3 px-3 hover:bg-muted/30 active:bg-muted/50 cursor-pointer rounded transition-all group touch-manipulation"
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className="text-primary group-hover:text-primary/80 transition-colors flex-shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors block">
                {title}
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>Click to configure {title.toLowerCase()} settings</p>
      </TooltipContent>
    </Tooltip>
  );
};

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('primary');
  const [activeSubTab, setActiveSubTab] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSettingClick = (setting: string) => {
    // Ensure we're on the primary tab and set the specific sub-tab
    setActiveTab('primary');
    setActiveSubTab(setting);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  const handleBackToSettings = () => {
    setActiveSubTab(null);
  };

  // Handle keyboard navigation for back button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC key for back navigation on both mobile and desktop
      // Alt+Left Arrow for back navigation on mobile
      if (activeSubTab && (e.key === 'Escape' || (isMobile && e.altKey && e.key === 'ArrowLeft'))) {
        e.preventDefault();
        handleBackToSettings();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, activeSubTab]);

  const settingsOptions = [
    {
      key: 'company',
      icon: <Building2 className="h-4 w-4" />,
      title: 'Company',
      description: 'Company info and display settings'
    },
    {
      key: 'tax',
      icon: <Hash className="h-4 w-4" />,
      title: 'Tax',
      description: 'Tax rates and configurations'
    },
    {
      key: 'layout',
      icon: <FileText className="h-4 w-4" />,
      title: 'Layout',
      description: 'Documents, auto-numbering, design, SKU'
    },
    {
      key: 'payments',
      icon: <CreditCard className="h-4 w-4" />,
      title: 'Payments',
      description: 'Payment processing and methods'
    },
    {
      key: 'signatures',
      icon: <PenTool className="h-4 w-4" />,
      title: 'Signatures',
      description: 'Digital and handwritten signatures'
    },
    {
      key: 'integrations',
      icon: <Globe className="h-4 w-4" />,
      title: 'Integrations',
      description: 'Third-party APIs and services'
    },
    {
      key: 'documents',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      title: 'Documents',
      description: 'Document generation, export, and management'
    },
    {
      key: 'customization',
      icon: <Brush className="h-4 w-4" />,
      title: 'Customization',
      description: 'Document themes, colors, fonts, and layout'
    }
  ];

  return (
    <TooltipProvider>
      <MobileDashboardLayout>
        <DashboardHeader 
          title="System Settings" 
          icon={<SettingsIcon className="h-8 w-8" />}
        >
          {/* Mobile and Desktop Back Button and Breadcrumb */}
          {activeSubTab && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToSettings}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors rounded-md hover:bg-primary/10 ${
                  isMobile ? 'touch-manipulation' : ''
                }`}
                aria-label="Go back to settings menu"
                title={`Return to settings menu${isMobile ? ' (ESC or Alt+←)' : ''}`}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Settings</span>
              </button>
              <span className="text-muted-foreground text-sm">•</span>
              <span className="text-sm font-medium text-foreground">
                {settingsOptions.find(opt => opt.key === activeSubTab)?.title || activeSubTab}
              </span>
            </div>
          )}
        </DashboardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Mobile Settings Menu */}
            {isMobile && activeTab === 'primary' && !activeSubTab && (
              <Card className="sm:hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Primary Settings
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Choose a configuration option</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {settingsOptions.map((option) => (
                    <ClickableLink
                      key={option.key}
                      icon={option.icon}
                      title={option.title}
                      description={option.description}
                      onClick={() => handleSettingClick(option.key)}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Desktop/Tablet Navigation - Hidden on mobile when viewing sub-settings */}
            <div className={`relative overflow-hidden ${
              isMobile && activeSubTab ? 'hidden' : 'block'
            }`}>
              <TabsList className="inline-flex w-auto min-w-full justify-start overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide gap-1 p-1">
                <div className="relative">
                  <TabsTrigger value="primary" className="flex items-center gap-1 px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Primary Settings</span>
                    <span className="sm:hidden">Settings</span>
                  </TabsTrigger>
                  {/* Desktop Hover Card */}
                  {!isMobile && (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <button
                          className="absolute top-0 right-1 h-full w-6 flex items-center justify-center hover:bg-muted/30 rounded-r transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5" />
                            Primary Settings
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">Core business configuration options</p>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-1">
                          {settingsOptions.map((option) => (
                            <ClickableLink
                              key={option.key}
                              icon={option.icon}
                              title={option.title}
                              description={option.description}
                              onClick={() => handleSettingClick(option.key)}
                            />
                          ))}
                        </CardContent>
                      </HoverCardContent>
                    </HoverCard>
                  )}
                </div>
                <TabsTrigger value="users" className="flex items-center gap-1 px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">User Management</span>
                  <span className="sm:hidden">Users</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-1 px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="hidden sm:inline">Document Service</span>
                  <span className="sm:hidden">Docs</span>
                </TabsTrigger>
                <TabsTrigger value="debug" className="flex items-center gap-1 px-3 py-2 text-sm whitespace-nowrap flex-shrink-0">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Debug</span>
                  <span className="sm:hidden">Debug</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="primary" className="space-y-4">
            {activeSubTab ? (
              <SystemSettingsManager activeSubTab={activeSubTab} onSubTabChange={setActiveSubTab} />
            ) : (
              <div className="text-center py-12 hidden sm:block">
                <div className="max-w-2xl mx-auto">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Primary Settings</h3>
                  <p className="text-muted-foreground mb-6">
                    Choose a configuration option below to get started, or hover over the help icon (?) next to "Primary Settings" tab above for quick access.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {settingsOptions.map((option) => (
                      <button
                        key={option.key}
                        onClick={() => handleSettingClick(option.key)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSettingClick(option.key);
                          }
                        }}
                        className="flex items-center gap-3 p-4 bg-muted/30 hover:bg-muted/50 active:bg-muted/70 rounded-lg transition-all group text-left cursor-pointer border border-transparent hover:border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        aria-label={`Configure ${option.title.toLowerCase()} - ${option.description}`}
                      >
                        <div className="text-primary group-hover:text-primary/80 transition-colors flex-shrink-0">
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors block">
                            {option.title}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <DocumentServiceSettings 
              onSave={(documentSettings) => {
                // Handle document settings save
                console.log('Document settings saved:', documentSettings);
                // You can add additional save logic here
              }}
              onReset={() => {
                // Handle document settings reset
                console.log('Document settings reset');
                // You can add additional reset logic here
              }}
            />
          </TabsContent>
          
          <TabsContent value="debug" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-semibold mb-2">Auth Debug Info</h3>
                <p className="text-sm">User: {JSON.stringify(auth.getUser())}</p>
                <p className="text-sm">Token: {localStorage.getItem('access_token') ? 'Present' : 'Missing'}</p>
                <button 
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
                  onClick={() => {
                    auth.login('test@printsoft.com', 'password123')
                      .then(() => window.location.reload())
                      .catch(err => console.error('Login failed:', err));
                  }}
                >
                  Login as Test User
                </button>
              </div>
              <PermissionTest />
              <SettingsTest />
            </div>
          </TabsContent>
        </Tabs>
      </MobileDashboardLayout>
    </TooltipProvider>
  );
};

export default SystemSettings;
