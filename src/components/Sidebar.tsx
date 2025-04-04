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
  HelpCircle
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

const MAIN_MENU_ITEMS = [
  { title: 'แดชบอร์ด', href: APP_ROUTES.DASHBOARD, icon: BarChart3 },
  { title: 'ธุรกรรม', href: APP_ROUTES.TRANSACTIONS, icon: CreditCard },
  { title: 'สแกนใบเสร็จ', href: APP_ROUTES.SCAN, icon: ScanLine },
];

const SECONDARY_MENU_ITEMS = [
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
          "fixed top-0 left-0 h-screen bg-gradient-to-b from-card to-card/95 border-r shadow-lg z-50 flex flex-col",
          collapsed ? "w-[78px]" : "w-64",
          isMobile && !mobileOpen && "-translate-x-full",
          isMobile && mobileOpen && "translate-x-0",
          className
        )}
        initial={false}
        animate={{ width: collapsed ? 78 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <motion.div className={cn("h-20 flex items-center relative overflow-hidden", collapsed ? "justify-center" : "px-5")} layout>
          <Link href={APP_ROUTES.DASHBOARD} className="group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all"></div>
                <motion.div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-full p-2.5 shadow-lg shadow-primary/20 border border-primary/10" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </motion.div>
              </div>
              {!collapsed && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col">
                  <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                    FinanceTrack
                  </span>
                  <span className="text-[10px] text-muted-foreground">v2.0 Finance Management</span>
                </motion.div>
              )}
            </div>
          </Link>
          <div className="absolute top-5 right-4 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ display: collapsed ? 'none' : 'block' }} />
        </motion.div>

        {!isMobile && (
          <motion.div className="absolute -right-3 top-24" whileHover={{ scale: 1.1 }}>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-full border shadow-md bg-background hidden md:flex"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>
          </motion.div>
        )}

        <div className={cn("p-4 border-b border-border/40 transition-all", collapsed ? "flex justify-center" : "flex items-center")}
             aria-label="User profile">
          <Avatar className="h-10 w-10 ring-2 ring-primary/30">
            <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || 'User'} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && session?.user && isMounted && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
            </motion.div>
          )}
        </div>

        <div className="p-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted/30">
          <SidebarMenu title="เมนูหลัก" items={MAIN_MENU_ITEMS} pathname={pathname} collapsed={collapsed} setMobileOpen={setMobileOpen} />
          <Separator className="my-3 opacity-30" />
          <SidebarMenu title="อื่น ๆ" items={SECONDARY_MENU_ITEMS} pathname={pathname} collapsed={collapsed} setMobileOpen={setMobileOpen} />
        </div>

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

const SidebarMenu = ({
  title,
  items,
  pathname,
  collapsed,
  setMobileOpen
}: {
  title: string;
  items: { title: string; href: string; icon: any }[];
  pathname: string;
  collapsed: boolean;
  setMobileOpen: (val: boolean) => void;
}) => {
  return (
    <div className="py-1">
      {!collapsed && (
        <div className="text-xs font-medium px-3 py-2 text-muted-foreground/70 uppercase tracking-wider">{title}</div>
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
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? title : undefined}
              aria-label={title}
            >
              {/* Background hover effect */}
              {!isActive && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                  animate={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
              )}
              
              {/* Active indicator */}
              {isActive && (
                <motion.div 
                  className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" 
                  layoutId="active-indicator" 
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }} 
                />
              )}
              
              {/* Hover indicator */}
              {!isActive && (
                <motion.div 
                  className="absolute left-0 top-[10%] bottom-[10%] w-1 bg-primary/40 rounded-r-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                  initial={{ scaleY: 0 }}
                  whileHover={{ scaleY: 1 }}
                />
              )}
              
              {/* Icon container */}
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
                
                {/* Icon glow effect on hover */}
                <motion.div 
                  className="absolute inset-0 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-all duration-300"
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1.5 }}
                />
              </div>
              
              {/* Menu text */}
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
            </Link>
          );
        })}
      </nav>
    </div>
  );
};