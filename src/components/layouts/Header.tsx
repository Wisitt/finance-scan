'use client';

import { ThemeToggle } from '@/components/theme/mode-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTransactionStore } from '@/store/transactionStore';
import { Bell, LogOut, Menu, Settings, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

interface HeaderProps {
  isMobile?: boolean;
  onMenuClick?: () => void;
}

/**
 * Header component for app navigation
 */
export default function Header({ isMobile, onMenuClick }: HeaderProps) {
  const { data: session } = useSession();

  const userName = session?.user?.name || '';
  const userEmail = session?.user?.email || '';
  const userImage = session?.user?.image || '';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
    useTransactionStore.getState().resetTransactionState();
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-background/80 backdrop-blur-md border-b shadow-sm flex items-center px-4">
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-3 md:gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full hover:bg-primary/10 transition-all"
              aria-label="การแจ้งเตือน"
            >
              <Bell className="h-5 w-5" />
              <Badge
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-primary text-[10px]"
              >
                2
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>การแจ้งเตือน</span>
              <Badge variant="outline" className="text-xs">ใหม่ 2 รายการ</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto py-1">
              {/* Notification Items */}
              <div className="px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors rounded-md mx-1 my-1 border-l-2 border-primary">
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">พบรายจ่ายผิดปกติ</p>
                    <p className="text-xs text-muted-foreground">รายจ่ายล่าสุดของคุณสูงกว่าค่าเฉลี่ย 35%</p>
                    <p className="text-xs text-muted-foreground mt-1">1 ชั่วโมง</p>
                  </div>
                </div>
              </div>

              <div className="px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors rounded-md mx-1 my-1 border-l-2 border-primary">
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">อัพเดทความปลอดภัย</p>
                    <p className="text-xs text-muted-foreground">เราได้อัพเดทระบบความปลอดภัยของบัญชีคุณ</p>
                    <p className="text-xs text-muted-foreground mt-1">1 วัน</p>
                  </div>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="outline" size="sm" className="w-full">ดูทั้งหมด</Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full overflow-hidden p-0 hover:ring-2 hover:ring-primary/30 transition-all">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex flex-col p-2 space-y-1">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>บัญชีของฉัน</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>ตั้งค่า</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>ออกจากระบบ</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}