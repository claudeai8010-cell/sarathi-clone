import { AppShellLayout } from '@/components/layout';

export const metadata = {
  title: 'Trips',
};

export default function TripsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShellLayout>{children}</AppShellLayout>;
}
