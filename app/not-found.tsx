import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page Not Found',
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          404
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Go home
      </Link>
    </div>
  );
}
