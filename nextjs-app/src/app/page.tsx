'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Welcome from '@/components/Welcome';

export default function DashboardPortal() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTokenUser, setIsTokenUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('username');
    if (!user) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      setIsTokenUser(localStorage.getItem('isTokenUser') === 'true');
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push('/login');
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header title="Recruiter Dashboard" onLogout={handleLogout} />
      <main className="flex-grow flex items-center justify-center p-6">
        <Welcome isTokenUser={isTokenUser} />
      </main>
    </div>
  );
}
