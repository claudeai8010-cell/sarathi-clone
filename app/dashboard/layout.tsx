import { AppShellLayout } from '@/components/layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShellLayout>{children}</AppShellLayout>;
}
