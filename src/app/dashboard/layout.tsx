'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context';
import Sidebar from '../../components/dashboard/Sidebar';
import MobileNav from '../../components/dashboard/MobileNav';
import Header from '../../components/dashboard/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Temporarily disabled for development
  // useEffect(() => {
  //   if (!loading && !user) router.replace('/login');
  // }, [user, loading, router]);

  // if (loading || !user) return null;

  const sidebarWidth = collapsed ? 60 : 240;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f9fafb',
    }}>
      {!isMobile && <Sidebar onCollapse={setCollapsed} />}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        marginLeft: isMobile ? 0 : sidebarWidth,
        transition: 'margin-left 0.2s ease',
        paddingBottom: isMobile ? 64 : 0,
      }}>
        <Header isMobile={isMobile} />
        <main style={{
          flex: 1,
          padding: isMobile ? '16px' : '28px',
          overflowY: 'auto',
        }}>
          {children}
        </main>
      </div>
      {isMobile && <MobileNav />}
    </div>
  );
}