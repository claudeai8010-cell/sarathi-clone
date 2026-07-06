'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { BottomNavigation } from './bottom-navigation';

interface AppShellLayoutProps {
  children: ReactNode;
}

export function AppShellLayout({ children }: AppShellLayoutProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 pb-24">{children}</main>
      <BottomNavigation />
    </div>
  );
}
