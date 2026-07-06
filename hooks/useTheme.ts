'use client';

import { useTheme as useNextTheme } from 'next-themes';

interface UseThemeReturn {
  theme: string | undefined;
  resolvedTheme: string | undefined;
  systemTheme: 'light' | 'dark' | undefined;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
}

export function useTheme(): UseThemeReturn {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return {
    theme,
    resolvedTheme,
    systemTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
  };
}
