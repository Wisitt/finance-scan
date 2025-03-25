'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/utils/utils';
import {
  Settings, User, Bell, Menu, 
  LogOut, HelpCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { navItems as navConstants, visibleNavItems } from '@/constants/navitem';
import { formatThaiFullDate } from '@/utils/dateUtils';
import { useActiveMenu } from '@/hooks';
import { AppLogo } from '@/components/shared/AppLogo';
import { APP_VERSION } from '@/constants/app';

/**
 * Mobile navigation for small screens with drawer menu
 */
export default function MobileNavigation() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentDateTime] = useState(new Date());
  const navItems = useMemo(() => visibleNavItems, []);
  const { isMenuActive } = useActiveMenu(navItems);

  // User data
  const currentUser = session?.user;
  const userName = currentUser?.name || 'ผู้ใช้';
  const userEmail = currentUser?.email || '';
  const userAvatar = currentUser?.avatar_url || currentUser?.image || '';
  const userInitial = userName.charAt(0).toUpperCase();

  // Logout handler
  const handleLogout = useCallback(async () => {
    await signOut({ callbackUrl: '/login' });
  }, []);

  // Toggle mobile menu drawer
  const toggleMobileMenu = useCallback((value: boolean) => {
    setIsMobileMenuOpen(value);
  }, []);

  // Close menu when clicking a menu item
  const handleMenuItemClick = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <header className="h-16 bg-background border-b">
      <div className="container flex items-center justify-between h-full px-4">
        {/* Left section with menu button and logo */}
        <div className="flex items-center">
          <Sheet open={isMobileMenuOpen} onOpenChange={toggleMobileMenu}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="เปิดเมนู">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="p-0 w-[280px]">
              <SheetHeader className="border-b p-4">
                <SheetTitle className="sr-only">เมนูมือถือ</SheetTitle>
                <AppLogo />
              </SheetHeader>

              {/* Mobile menu content */}
              <div className="flex flex-col h-[calc(100vh-65px)]">
                {/* User profile */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={userAvatar} alt={userName} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground">{userEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation links */}
                <ScrollArea className="flex-1 p-4">
                  <nav className="space-y-1">
                    {navItems.map((item) => (
                      <Link 
                        href={item.href} 
                        key={item.name}
                        className="block w-full"
                        onClick={handleMenuItemClick}
                      >
                        <div 
                          className={cn(
                            "flex items-center w-full rounded-md px-3 py-2",
                            isMenuActive(item.href, item.pattern)
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                          )}
                        >
                          <item.icon className="h-4 w-4 mr-3" />
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    ))}
                  </nav>
                </ScrollArea>

                {/* Footer */}
                <div className="border-t p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <div>เวอร์ชัน {APP_VERSION}</div>
                      <div>{formatThaiFullDate(currentDateTime)}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      aria-label="ความช่วยเหลือ"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center ml-4">
            <AppLogo />
          </div>
        </div>

        {/* Right section with notification and user menu */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="การแจ้งเตือน">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="เมนูผู้ใช้">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                โปรไฟล์
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                ตั้งค่า
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                ออกจากระบบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 