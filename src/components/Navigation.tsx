import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Home, Mic, Users, FileText, Clock, Calendar, Menu, LogOut, Settings, LogIn, Crown, Library } from 'lucide-react';
import { useState } from 'react';
import { useCurrentUser, auth } from "app/auth";
import { LanguageSwitcher } from 'components/LanguageSwitcher';
import { Translate } from "components/Translate";

export interface Props {}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Assistant', path: '/assistant-page', icon: Mic },
  { label: 'Clients', path: '/clients-page', icon: Users },
  { label: 'Invoices', path: '/invoices-page', icon: FileText },
  { label: 'Invoice Items', path: '/invoice-items-page', icon: Library },
  { label: 'Time Tracking', path: '/time-tracking-page', icon: Clock },
  { label: 'Calendar', path: '/calendar-page', icon: Calendar },
  { label: 'Pricing', path: '/pricing-page', icon: Crown },
  { label: 'Settings', path: '/settings-page', icon: Settings },
];

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useCurrentUser();

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await auth.signOut();
    navigate("/");
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Navigation */}
      <div className="flex items-center gap-2 lg:hidden">
        <Button 
          size="sm" 
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 hover:from-amber-600 hover:to-orange-700"
          onClick={() => handleNavigate('/pricing-page')}
        >
          <Crown className="h-4 w-4 mr-1" />
          <Translate>Upgrade</Translate>
        </Button>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 flex flex-col justify-between">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Main navigation menu for accessing application features
            </SheetDescription>
            <div className="flex flex-col gap-2 mt-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? 'default' : 'ghost'}
                    className={`justify-start ${
                      isActive
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => handleNavigate(item.path)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <Translate>{item.label}</Translate>
                  </Button>
                );
              })}
            </div>
            
            <div className="border-t pt-4 pb-4">
               <div className="px-4 mb-4">
                 <LanguageSwitcher />
               </div>
               {user ? (
                 <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
                    onClick={handleSignOut}
                 >
                   <LogOut className="h-4 w-4 mr-3" />
                   <Translate>Sign Out</Translate>
                 </Button>
               ) : (
                 <Button 
                    variant="ghost" 
                    className="w-full justify-start text-primary hover:text-primary/80 hover:bg-primary/10"
                    onClick={handleSignOut}
                 >
                   <LogIn className="h-4 w-4 mr-3" />
                   <Translate>Sign In</Translate>
                 </Button>
               )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isPricing = item.label === 'Pricing';
          
          return (
            <Button
              key={item.path}
              variant={isActive ? 'default' : 'ghost'}
              className={`${
                isActive
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : isPricing 
                    ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-500 dark:hover:bg-amber-900/10 font-medium'
                    : 'text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => handleNavigate(item.path)}
            >
              <Icon className="h-4 w-4 mr-2" />
              <Translate>{item.label}</Translate>
            </Button>
          );
        })}
        <div className="ml-2 flex items-center">
          <LanguageSwitcher />
        </div>
        {user ? (
          <Button 
             variant="ghost" 
             className="ml-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
             onClick={handleSignOut}
          >
             <LogOut className="h-4 w-4 mr-2" />
             <Translate>Sign Out</Translate>
          </Button>
        ) : (
          <Button 
             variant="ghost" 
             className="ml-2 text-gray-500 hover:text-primary hover:bg-primary/10"
             onClick={handleSignOut}
          >
             <LogIn className="h-4 w-4 mr-2" />
             <Translate>Sign In</Translate>
          </Button>
        )}
      </nav>
    </>
  );
}
