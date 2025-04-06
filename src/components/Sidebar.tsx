'use client';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  BarChart3,
  CreditCard,
  ScanLine,
  Settings,
  HelpCircle,
  Eye,
  LucideIcon
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTransactionStore } from '@/store/transactionStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { APP_ROUTES } from '@/constants/routes';

type SidebarProps = {
  className?: string;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
};

interface SidebarItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const MAIN_MENU_ITEMS: SidebarItem[] = [
  { title: 'แดชบอร์ด', href: APP_ROUTES.DASHBOARD, icon: BarChart3 },
  { title: 'ธุรกรรม', href: APP_ROUTES.TRANSACTIONS, icon: CreditCard },
  { title: 'สแกนใบเสร็จ', href: APP_ROUTES.SCAN, icon: ScanLine },
];

const SECONDARY_MENU_ITEMS: SidebarItem[] = [
  { title: 'ตั้งค่า', href: APP_ROUTES.SETTINGS || '/settings', icon: Settings },
  { title: 'ช่วยเหลือ', href: APP_ROUTES.HELP || '/help', icon: HelpCircle },
];

export function Sidebar({
  className,
  collapsed,
  setCollapsed,
  isMobile,
  mobileOpen,
  setMobileOpen
}: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: '/' });
    useTransactionStore.getState().resetTransactionState();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [setMobileOpen]);

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        className={cn(
          "fixed top-0 left-0 h-screen bg-gradient-to-b from-card/95 to-card border-r shadow-lg z-50 flex flex-col",
          collapsed ? "w-[78px]" : "w-64",
          isMobile && !mobileOpen && "-translate-x-full",
          isMobile && mobileOpen && "translate-x-0",
          className
        )}
        initial={false}
        animate={{ width: collapsed ? 78 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Subtle scanning line animation that moves down the sidebar */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[1px] bg-primary/30"
          animate={{ 
            y: [0, 800, 0],
            opacity: [0, 0.5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 1
          }}
        />
        
        {/* Logo Area */}
        <motion.div 
          className={cn(
            "h-20 flex items-center relative overflow-hidden", 
            collapsed ? "justify-center" : "px-5"
          )} 
          layout
        >
          <Link href={APP_ROUTES.DASHBOARD} className="group">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                {/* Logo glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-md group-hover:blur-lg transition-all"></div>
                
                {/* Logo container */}
                <motion.div
                  className="relative bg-gradient-to-br from-primary to-accent/80 rounded-full shadow-lg shadow-primary/20 border border-primary/10 w-full h-full flex items-center justify-center overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {/* Eye-shaped logo with dollar sign */}
                  <div className="absolute inset-1 rounded-full bg-card/90 flex items-center justify-center">
                    <div className="relative w-5 h-5 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                      <span className="text-card font-bold text-xs">$</span>
                      {/* Animated scanning line */}
                      <motion.div 
                        className="absolute inset-0 bg-card/20 h-[1px] w-full" 
                        animate={{ 
                          top: ["20%", "80%", "20%"],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ 
                          duration: 2.5, 
                          ease: "easeInOut", 
                          repeat: Infinity 
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              {!collapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -10 }} 
                  className="flex flex-col"
                >
                  <h1 className="text-xl font-bold tracking-tight">
                    Fin<span className="text-accent">$</span>ight
                  </h1>
                  <span className="text-[10px] text-muted-foreground">v2.0 Finance Management</span>
                </motion.div>
              )}
            </div>
          </Link>
          
          {/* Animated notification dot - more subtle */}
          {!collapsed && (
            <motion.div 
              className="absolute top-5 right-4 w-1.5 h-1.5 rounded-full bg-accent" 
              animate={{ 
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>

        {/* Collapse/Expand Button */}
        {!isMobile && (
          <motion.div 
            className="absolute -right-3 top-24" 
            whileHover={{ scale: 1.1 }}
          >
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-full border border-primary/30 shadow-md bg-card hidden md:flex text-primary"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>
          </motion.div>
        )}

        {/* User Profile */}
        <div 
          className={cn(
            "p-4 border-b border-border/40 transition-all", 
            collapsed ? "flex justify-center" : "flex items-center"
          )}
          aria-label="User profile"
        >
          <div className="relative">
            <motion.div 
              className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-sm opacity-0 group-hover:opacity-100"
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0, 0.5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <Avatar className="h-10 w-10 ring-2 ring-primary/30 group">
              <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || 'User'} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {!collapsed && session?.user && isMounted && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -10 }} 
              transition={{ duration: 0.2 }} 
              className="ml-3 overflow-hidden"
            >
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
            </motion.div>
          )}
        </div>

        {/* Menu Items */}
        <div className="p-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-muted/20">
          <SidebarMenu 
            title="เมนูหลัก" 
            items={MAIN_MENU_ITEMS} 
            pathname={pathname} 
            collapsed={collapsed} 
            setMobileOpen={setMobileOpen} 
          />
          <Separator className="my-3 opacity-30" />
          <SidebarMenu 
            title="อื่น ๆ" 
            items={SECONDARY_MENU_ITEMS} 
            pathname={pathname} 
            collapsed={collapsed} 
            setMobileOpen={setMobileOpen} 
          />
        </div>

        {/* Sign Out Button */}
        <div className={cn("p-3 border-t border-border/40", collapsed ? "flex justify-center" : "")}>
          <Button
            variant="outline"
            size={collapsed ? "icon" : "default"}
            className={cn(
              "text-destructive border-destructive/20 hover:bg-destructive/10 transition-all hover:scale-[1.02] duration-300",
              collapsed ? "" : "w-full justify-start"
            )}
            onClick={handleSignOut}
            aria-label="ออกจากระบบ"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!collapsed && "ออกจากระบบ"}
          </Button>
        </div>
      </motion.div>
    </>
  );
}

// Enhanced Menu Items with visual improvements
const SidebarMenu = ({
  title,
  items,
  pathname,
  collapsed,
  setMobileOpen
}: {
  title: string;
  items: SidebarItem[];
  pathname: string;
  collapsed: boolean;
  setMobileOpen: (val: boolean) => void;
}) => {
  return (
    <div className="py-1">
      {!collapsed && (
        <div className="text-xs font-medium px-3 py-2 text-muted-foreground/70 uppercase tracking-wider">
          {title}
        </div>
      )}
      <nav className="space-y-1.5">
        {items.map(({ title, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative overflow-hidden',
                isActive 
                  ? 'bg-gradient-to-r from-primary/10 to-transparent text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? title : undefined}
              aria-label={title}
            >
              {/* Background hover effect */}
              {!isActive && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                  animate={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
              )}
              
              {/* Active indicator */}
              {isActive && (
                <>
                  <motion.div 
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary to-accent rounded-r-full" 
                    layoutId="active-indicator" 
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }} 
                  />
                  
                  {/* Scanning line animation for active item */}
                  <motion.div 
                    className="absolute left-0 inset-y-0 w-full h-[1px] bg-primary/20"
                    animate={{ 
                      left: ['0%', '100%', '0%'],
                      opacity: [0, 0.8, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </>
              )}
              
              {/* Hover indicator */}
              {!isActive && (
                <motion.div 
                  className="absolute left-0 top-[10%] bottom-[10%] w-1 bg-primary/40 rounded-r-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                  initial={{ scaleY: 0 }}
                  whileHover={{ scaleY: 1 }}
                />
              )}
              
              {/* Icon container with eye-inspired glow */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  className={cn(
                    "relative z-10 transition-all duration-300",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                  whileHover={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Icon className="h-4 w-4" />
                </motion.div>
                
                {/* Eye-like glow effect for icons - more prominent for active items */}
                <motion.div 
                  className={cn(
                    "absolute inset-0 rounded-full blur-md transition-all duration-300",
                    isActive ? "bg-primary/30 opacity-100" : "bg-primary/10 opacity-0 group-hover:opacity-100"
                  )}
                  animate={isActive ? { 
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3]
                  } : {}}
                  transition={{ 
                    duration: 3,
                    repeat: isActive ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1.5 }}
                />
              </div>
              
              {/* Menu text with hover animation */}
              {!collapsed && (
                <motion.span
                  initial={false}
                  animate={{ x: 0 }}
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="relative z-10"
                >
                  {title}
                </motion.span>
              )}
              
              {/* Badge-like indicator for scan feature - only for the scan option */}
              {title === 'สแกนใบเสร็จ' && !isActive && !collapsed && (
                <motion.div
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                </motion.div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};