import { cn } from '@/lib/utils';

interface RootLayoutProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function RootLayout({ children, className }: RootLayoutProps) {
  return (
    <div className={cn('container mx-auto px-4 py-8 md:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
}
