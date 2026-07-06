import { AppShellLayout } from '@/components/layout';

export const metadata = {
  title: 'Profile',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShellLayout>{children}</AppShellLayout>;
}
