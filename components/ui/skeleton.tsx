import { cn } from '@/lib/utils';

function Skeleton({ className }: { readonly className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-muted', className)}
      aria-busy="true"
      aria-label="Loading"
    />
  );
}

export { Skeleton };
