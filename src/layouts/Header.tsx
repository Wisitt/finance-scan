'use client';

import { Bell, LogOut, Settings } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
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

/**
 * Header component for app navigation
 */
export default function Header() {
  const { data: session } = useSession();
  
  const userName = session?.user?.name || '';
  const userImage = session?.user?.image || '';
  const userInitial = userName.charAt(0).toUpperCase();
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };
  
  return (
    <div className="fixed top-0 right-0 left-64 h-14 flex items-center justify-between px-4 border-b bg-background z-10">
      <div className="md:block hidden">
        <h1 className="text-lg font-semibold">FinanceTrack</h1>
      </div>

      {/* Right side - User and settings */}
      <div className="flex items-center gap-2 ml-auto">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground"
          aria-label="การแจ้งเตือน"
        >
          <Bell className="h-5 w-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userImage} alt={userName} />
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>ตั้งค่า</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>ออกจากระบบ</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 