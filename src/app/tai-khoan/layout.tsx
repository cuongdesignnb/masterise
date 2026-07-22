import type { Metadata } from 'next';
import UserDashboardLayoutClient from './UserDashboardLayoutClient';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserDashboardLayoutClient>{children}</UserDashboardLayoutClient>;
}
