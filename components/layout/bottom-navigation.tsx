'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  MessageSquare,
  Wallet,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trips', label: 'Trips', icon: TrendingUp },
  { href: '/ai-input', label: 'AI', icon: MessageSquare },
  { href: '/ledger', label: 'Ledger', icon: Wallet },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background">
      <div className="flex justify-around">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-3 px-2 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
              aria-label={item.label}
              title={item.label}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
