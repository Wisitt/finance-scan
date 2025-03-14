'use client';

import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { cn } from '@/utils/utils';
import {
  Wallet, Settings, User,
  Menu, ChevronRight, LogOut, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { navItems as navConstants } from '@/constants/navitem';
import { useMemo } from 'react';


export default function Sidebar({
  isSidebarCollapsed,
  setSidebarCollapsed,
}: {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const navItems = useMemo(() => navConstants, []);

  if (status === 'loading' || !session?.user) {
    return null;
  }

  const userName = session.user.name || 'ผู้ใช้';
  const userEmail = session.user.email || '';
  const userImage = session.user.image || session.user.avatar_url;
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 hidden h-screen lg:flex flex-col border-r bg-background transition-all duration-300',
        isSidebarCollapsed ? 'w-[70px]' : 'w-[250px]'
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1 rounded text-white">
            <Wallet className="h-5 w-5" />
          </div>
          {!isSidebarCollapsed && <h2 className="font-bold text-lg">FinScan</h2>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="px-3 space-y-1">
          {navItems.map((item) => (
            <TooltipProvider key={item.name} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={item.href} passHref>
                    <Button
                      variant={pathname === item.href ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start',
                        pathname === item.href
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground',
                        isSidebarCollapsed && 'px-2 justify-center'
                      )}
                    >
                      <item.icon className={cn('h-5 w-5', !isSidebarCollapsed && 'mr-3')} />
                      {!isSidebarCollapsed && <span>{item.name}</span>}
                    </Button>
                  </Link>
                </TooltipTrigger>
                {isSidebarCollapsed && <TooltipContent side="right">{item.name}</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </ScrollArea>

      <div className={cn('border-t p-3', isSidebarCollapsed ? 'flex justify-center py-4' : '')}>
        {isSidebarCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={userImage || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div>{userName}</div>
                <div className="text-xs text-muted-foreground">{userEmail}</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-2">
                <div className="flex items-center flex-1">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={userImage || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-sm truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
              <DropdownMenuItem><User className="h-4 w-4 mr-2" />โปรไฟล์</DropdownMenuItem>
              <DropdownMenuItem><Settings className="h-4 w-4 mr-2" />ตั้งค่า</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />ออกจากระบบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </aside>
  );
}
