'use client';

import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

interface AppProvidersProps {
  readonly children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
