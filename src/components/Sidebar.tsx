import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/constants/routes';
import { BarChart3, CreditCard, ScanLine } from 'lucide-react';

export function Sidebar() {
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
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-lg font-semibold">FinanceScan</h1>
      </div>
      <nav className="flex-1 space-y-1 p-2">
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
    </div>
  );
} 