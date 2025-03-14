'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/utils/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Wallet, Settings, User, Bell,
  Menu, LogOut, HelpCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { navItems as navConstants} from '@/constants/navitem';
import { formatThaiFullDate } from '@/utils/dateUtils';

export default function MobileNavigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentDateTime] = useState(new Date('2025-03-07 09:57:24'));
  const navItems = useMemo(() => navConstants, []);

  const currentUser = session?.user;

  const userName = currentUser?.name || 'ผู้ใช้';
  const userEmail = currentUser?.email || '';
  const userAvatar = currentUser?.avatar_url || currentUser?.image || '';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 lg:hidden bg-background border-b">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="p-0">
              <SheetHeader>
                <SheetTitle className="sr-only">เมนูมือถือ</SheetTitle>
                <div className="border-b p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary p-1 rounded text-white">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <h2 className="font-bold text-lg">FinScan</h2>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={userAvatar} />
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

                <ScrollArea className="flex-1 p-4">
                  <nav className="space-y-1">
                    {navItems.map((item) =>
                      item.href ? (
                        <Link href={item.href} key={item.name} passHref>
                          <Button
                            variant={pathname === item.href ? 'secondary' : 'ghost'}
                            className={cn(
                              'w-full justify-start',
                              pathname === item.href
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground'
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <item.icon className="h-4 w-4 mr-3" />
                            {item.name}
                          </Button>
                        </Link>
                      ) : null
                    )}
                  </nav>
                </ScrollArea>

                <div className="border-t p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <div>เวอร์ชัน 1.5.2</div>
                      <div>{formatThaiFullDate(currentDateTime)}</div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center ml-4">
            <div className="bg-primary p-1 rounded text-white">
              <Wallet className="h-5 w-5" />
            </div>
            <h2 className="font-bold text-lg ml-2">FinScan</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatar} />
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
              <DropdownMenuItem className="text-red-600">
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
