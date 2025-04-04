import { Home, ArrowRightLeft, ScanLine, User, Settings } from "lucide-react";
import { APP_ROUTES } from "./routes";

export interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    pattern?: RegExp;
    /**
     * @default true
     */
    showInNav?: boolean;
}

/**
 * Main navigation items for the application
 */
export const navItems: NavItem[] = [
    { 
        name: 'หน้าแรก', 
        href: APP_ROUTES.DASHBOARD, 
        icon: Home,
        pattern: /^\/dashboard(\/.*)?$/
    },
    { 
        name: 'ธุรกรรม', 
        href: APP_ROUTES.TRANSACTIONS, 
        icon: ArrowRightLeft,
        pattern: /^\/transactions(\/.*)?$/
    },
    { 
        name: 'สแกนใบเสร็จ', 
        href: APP_ROUTES.SCAN, 
        icon: ScanLine,
        pattern: /^\/scan(\/.*)?$/
    },
    {
        name: 'โปรไฟล์',
        href: APP_ROUTES.PROFILE,
        icon: User,
        pattern: /^\/profile(\/.*)?$/,
        showInNav: false
    },
    {
        name: 'ตั้งค่า',
        href: APP_ROUTES.SETTINGS,
        icon: Settings,
        pattern: /^\/settings(\/.*)?$/,
        showInNav: false
    }
];

/**
 * Navigation items that should appear in the UI
 */
export const visibleNavItems = navItems.filter(item => item.showInNav !== false);