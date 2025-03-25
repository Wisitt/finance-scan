'use client';

import { Bell, Settings } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

/**
 * Header component for app navigation
 */
export default function Header() {
  const { data: session } = useSession();
  
  const userName = session?.user?.name || '';
  const userImage = session?.user?.image || '';
  const userInitial = userName.charAt(0).toUpperCase();
  
  return (
    <div className="flex-1 flex items-center justify-between">
      <div className="md:block hidden">
        <h1 className="text-lg font-semibold">FinanceScan</h1>
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
        
        <Avatar className="h-8 w-8">
          <AvatarImage src={userImage} alt={userName} />
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
} 