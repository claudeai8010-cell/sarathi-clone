import { AppShellLayout } from '@/components/layout';

export const metadata = {
  title: 'Ledger',
};

export default function LedgerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShellLayout>{children}</AppShellLayout>;
}
