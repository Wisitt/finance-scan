import { Home, ArrowRightLeft, ScanLine } from "lucide-react";

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
}

export const navItems: NavItem[] = [
    { name: 'หน้าแรก', href: '/', icon: Home },
    { name: 'ธุรกรรม', href: '/transactions', icon: ArrowRightLeft },
    { name: 'สแกนใบเสร็จ', href: '/scan', icon: ScanLine },
];