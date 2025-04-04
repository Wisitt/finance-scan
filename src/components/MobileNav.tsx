'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BarChart3, CreditCard, Menu, ScanLine, X } from 'lucide-react';
import { APP_ROUTES } from '@/constants/routes';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

/**
 * Mobile navigation component - shows as a slide-out drawer
 * Appears only on mobile devices
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">เปิดเมนู</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] sm:w-[280px]">
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
} 