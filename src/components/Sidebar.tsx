import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useMemo, memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/constants/routes';
import { BarChart3, CreditCard, LogOut, ScanLine, User, Settings, HelpCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useTransactionStore } from '@/store/transactionStore';

// Memoized menu items to prevent recreation on each render
const MENU_ITEMS = [
  {
    title: 'แดชบอร์ด',
    href: APP_ROUTES.DASHBOARD,
    icon: BarChart3,
  },
  {
    title: 'ธุรกรรม',
    href: APP_ROUTES.TRANSACTIONS,
    icon: CreditCard,
  },
  {
    title: 'สแกนใบเสร็จ',
    href: APP_ROUTES.SCAN,
    icon: ScanLine,
  },
];

// Memoized menu item component for better performance
const MenuItem = memo(({ 
  item, 
  isActive 
}: { 
  item: { title: string; href: string; icon: React.ElementType }; 
  isActive: boolean 
}) => {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
        isActive 
          ? 'bg-primary/10 text-primary relative' 
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <div className={cn(
        "flex items-center justify-center h-6 w-6 rounded-md",
        isActive 
          ? "bg-primary/20 text-primary" 
          : "text-muted-foreground"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      {item.title}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
      )}
    </Link>
  );
});
MenuItem.displayName = 'MenuItem';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Memozied user data to prevent recalculation on each render
  const userData = useMemo(() => {
    const userName = session?.user?.name || '';
    const userImage = session?.user?.image || '';
    const userEmail = session?.user?.email || '';
    const userInitial = userName.charAt(0).toUpperCase();
    
    return { userName, userImage, userEmail, userInitial };
  }, [session?.user]);

  // Memoized signOut handler
  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: '/' });
    useTransactionStore.getState().resetTransactionState();

  }, []);

  // Memoized menu rendering
  const menuItems = useMemo(() => {
    return MENU_ITEMS.map(item => (
      <MenuItem
        key={item.href}
        item={item}
        isActive={pathname === item.href}
      />
    ));
  }, [pathname]);

  return (
    <div className="fixed top-0 left-0 h-screen w-64 flex flex-col bg-card border-r shadow-sm">
      {/* Logo area with gradient background */}
      <div className="h-16 px-4 flex items-center bg-gradient-to-r from-primary/90 to-primary-dark text-white">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 rounded-full p-1.5">
            <BarChart3 className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold tracking-wide">FinanceTrack</h1>
        </div>
      </div>
      
      {/* User profile section at the top */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={userData.userImage} alt={userData.userName} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {userData.userInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{userData.userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userData.userEmail}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation menu section */}
      <div className="p-2 flex-1 overflow-y-auto">
        <div className="text-xs text-muted-foreground font-medium px-3 py-2">เมนูหลัก</div>
        <nav className="space-y-1">
          {menuItems}
        </nav>
        
        <Separator className="my-3 opacity-50" />
        
        <div className="text-xs text-muted-foreground font-medium px-3 py-2">อื่น ๆ</div>
        <nav className="space-y-1">
          <Link
            href="#settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <div className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground">
              <Settings className="h-4 w-4" />
            </div>
            ตั้งค่า
          </Link>
          <Link
            href="#help"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <div className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
            </div>
            ช่วยเหลือ
          </Link>
        </nav>
      </div>
      
      {/* Logout button at the bottom */}
      <div className="p-3 border-t">
        <Button 
          variant="outline" 
          className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          ออกจากระบบ
        </Button>
      </div>
    </div>
  );
} 