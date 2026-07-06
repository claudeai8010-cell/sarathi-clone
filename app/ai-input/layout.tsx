import { AppShellLayout } from '@/components/layout';

export const metadata = {
  title: 'AI Input',
};

export default function AIInputLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShellLayout>{children}</AppShellLayout>;
}
