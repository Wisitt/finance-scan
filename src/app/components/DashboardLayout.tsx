'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { 
  Home, 
  Wallet,
  ScanLine,
  Settings,
  User,
  Bell,
  Menu,
  ChevronRight,
  LogOut,
  ChevronDown,
  ArrowRightLeft,
  HelpCircle,
  UserPlus,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

import Header from './header';
import { useDialogStore } from '@/store/dialogStore'; // Import the dialog store
import AddUserDialog from './AddUserDialog';
import { useUserStore } from '@/store/userStore';

interface LayoutProps {
  children: React.ReactNode;
}

// Modified navigation items - removed href for the 'Add User' item
const navItems = [
  { name: 'หน้าแรก', href: '/', icon: Home },
  { name: 'ธุรกรรม', href: '/transactions', icon: ArrowRightLeft },
  { name: 'สแกนใบเสร็จ', href: '/scan', icon: ScanLine },
  { name: 'เพิ่มบัญชี', icon: UserPlus, isDialog: true }, // Modified to indicate this opens a dialog
  // { name: 'บัญชี', href: '/accounts', icon: Wallet },
  // { name: 'งบประมาณ', href: '/budget', icon: PieChart },
];

// const quickActions = [
//   { name: 'เพิ่มรายรับ', icon: Plus, color: 'text-green-500' },
//   { name: 'เพิ่มรายจ่าย', icon: Plus, color: 'text-red-500' },
//   { name: 'สแกนใบเสร็จ', icon: ScanLine, color: 'text-blue-500' },
// ];

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  // อัพเดทเวลาปัจจุบันตามที่ระบุ
  const [currentDateTime, setCurrentDateTime] = useState(new Date('2025-03-06 08:39:46'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { openDialog } = useDialogStore(); // Get the openDialog function from the store
  const { currentUser } = useUserStore();

  // ข้อมูลผู้ใช้ปัจจุบัน - ระบุชื่อ Wisitt ตามที่ต้องการ
  const userInitial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  // Handle navigation item click
  const handleNavItemClick = (item: { isDialog?: boolean }) => {
    if (item.isDialog) {
      openDialog(); // Open the dialog if this is a dialog item
      setIsMobileMenuOpen(false); // Close mobile menu if open
    }
  };

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentDateTime(prev => {
        const newDate = new Date(prev);
        newDate.setMinutes(newDate.getMinutes() + 1);
        return newDate;
      });
    }, 60000);
    
    // Close mobile menu on navigation
    setIsMobileMenuOpen(false);
    
    return () => clearInterval(timer);
  }, [pathname]);
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('th-TH', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Include the AddUserDialog component */}
      <AddUserDialog />
      
      {/* Mobile Navbar */}
      <header className="sticky top-0 z-40 lg:hidden bg-background border-b">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <div className="flex flex-col h-full">
                  <div className="border-b p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary p-1 rounded text-white">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <h2 className="font-bold text-lg">FinTrack</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    </Button>
                  </div>
                  
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar>
                        <AvatarImage src={currentUser?.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{currentUser?.name}</p>
                        <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                      </div>
                    </div>
                    
                    {/* <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-3.5 w-3.5 mr-1" />
                        โปรไฟล์
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <LogOut className="h-3.5 w-3.5 mr-1" />
                        ออกจากระบบ
                      </Button>
                    </div> */}
                  </div>
                  
                  <ScrollArea className="flex-1 p-4">
                    <nav className="space-y-1">
                      {navItems.map((item) => (
                        item.isDialog ? (
                          // If it's a dialog item, render a button instead of a link
                          <Button
                            key={item.name}
                            variant="ghost"
                            className="w-full justify-start text-muted-foreground"
                            onClick={() => handleNavItemClick(item)}
                          >
                            <item.icon className="h-4 w-4 mr-3" />
                            {item.name}
                          </Button>
                        ) : (
                          // Otherwise render a normal link
                          <Link href={item.href} key={item.name} passHref>
                            <Button
                              variant={pathname === item.href ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-start",
                                pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
                              )}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <item.icon className="h-4 w-4 mr-3" />
                              {item.name}
                            </Button>
                          </Link>
                        )
                      ))}
                    </nav>
                    
                    <div className="mt-6">
                      <p className="text-xs font-medium text-muted-foreground mb-3">การดำเนินการด่วน</p>
                      <div className="grid grid-cols-1 gap-2">
                        {/* {quickActions.map((action, i) => (
                          <Button variant="outline" key={i} className="justify-start" size="sm">
                            <action.icon className={cn("h-3.5 w-3.5 mr-2", action.color)} />
                            {action.name}
                          </Button>
                        ))} */}
                      </div>
                    </div>
                  </ScrollArea>
                  
                  <div className="border-t p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        <p>เวอร์ชัน 1.5.2</p>
                        <p>{formatDate(currentDateTime)}</p>
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
              <h2 className="font-bold text-lg ml-2">FinTrack</h2>
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
                    <AvatarImage src={currentUser?.avatar} />
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
      
      {/* Desktop Layout with Sidebar */}
      <div className="grid lg:grid-cols-[auto_1fr]">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "fixed left-0 top-0 z-30 hidden h-screen lg:flex flex-col border-r bg-background transition-all duration-300",
          isSidebarCollapsed ? "w-[70px]" : "w-[250px]"
        )}>
          {/* Sidebar header */}
          <div className="flex h-14 items-center border-b px-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1 rounded text-white">
                <Wallet className="h-5 w-5" />
              </div>
              {!isSidebarCollapsed && (
                <h2 className="font-bold text-lg">FinTrack</h2>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="ml-auto"
              onClick={() => setSidebarCollapsed(prev => !prev)}
            >
              {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <div className="px-3 space-y-1">
              {navItems.map((item) => (
                <TooltipProvider key={item.name} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {item.isDialog ? (
                        // If it's a dialog item, render a button instead of a link
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-muted-foreground",
                            isSidebarCollapsed && "px-2 justify-center"
                          )}
                          onClick={() => handleNavItemClick(item)}
                        >
                          <item.icon className={cn("h-5 w-5", !isSidebarCollapsed && "mr-3")} />
                          {!isSidebarCollapsed && (
                            <span>{item.name}</span>
                          )}
                        </Button>
                      ) : (
                        // Otherwise render a normal link
                        <Link href={item.href} passHref>
                          <Button
                            variant={pathname === item.href ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start",
                              pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground",
                              isSidebarCollapsed && "px-2 justify-center"
                            )}
                          >
                            <item.icon className={cn("h-5 w-5", !isSidebarCollapsed && "mr-3")} />
                            {!isSidebarCollapsed && (
                              <span>{item.name}</span>
                            )}
                          </Button>
                        </Link>
                      )}
                    </TooltipTrigger>
                    {isSidebarCollapsed && (
                      <TooltipContent side="right">
                        {item.name}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            
            {!isSidebarCollapsed && (
              <div className="mt-6 px-3">
                {/* <p className="text-xs font-medium text-muted-foreground mb-3 px-3">การดำเนินการด่วน</p> */}
                <div className="space-y-1">
                  {/* {quickActions.map((action, i) => (
                    <Button variant="outline" key={i} className="w-full justify-start" size="sm">
                      <action.icon className={cn("h-3.5 w-3.5 mr-2", action.color)} />
                      {action.name}
                    </Button>
                  ))} */}
                </div>
              </div>
            )}
          </ScrollArea>
          
          {/* User profile */}
          <div className={cn(
            "border-t p-3",
            isSidebarCollapsed ? "flex justify-center py-4" : ""
          )}>
            {isSidebarCollapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={currentUser?.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{currentUser?.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start px-2">
                    <div className="flex items-center flex-1">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={currentUser?.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">{userInitial}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium text-sm truncate">{currentUser?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
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
            )}
          </div>
        </aside>

      {/* Main Content */}
      <main className={cn(
        "flex min-h-screen flex-col transition-all duration-300",
        isSidebarCollapsed ? "lg:ml-[70px]" : "lg:ml-[250px]"
      )}>
        {/* Desktop top bar */}
        <Header />
        
        {/* Page content with conditional padding */}
        <div className={cn(
          "flex-1",
          // Apply padding conditionally by checking the current path
          pathname !== '/scan' ? "p-4 md:p-6" : ""
        )}>
          {children}
        </div>
      </main>
      </div>
    </div>
  );
}