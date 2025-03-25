import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/constants/routes';
import { BarChart3, CreditCard, LogOut, ScanLine, User } from 'lucide-react';
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

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name || '';
  const userImage = session?.user?.image || '';
  const userEmail = session?.user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const menuItems = [
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

  return (
    <div className="fixed top-0 left-0 h-screen w-64 flex flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-semibold">FinanceTrack</h1>
      </div>
      
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      
      {/* User profile section */}
      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start px-2 py-1.5">
              <div className="flex items-center w-full">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden text-left">
                  <p className="text-sm font-medium truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              โปรไฟล์
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 