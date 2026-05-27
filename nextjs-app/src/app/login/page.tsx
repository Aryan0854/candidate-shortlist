'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Login from '@/components/Login';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('username');
    if (user) {
      router.push('/');
    }

    // Parse tokenError from search params
    const err = searchParams.get('tokenError');
    if (err) {
      setTokenError(err);
    }
  }, [router, searchParams]);

  const handleLoginSuccess = () => {
    router.push('/');
  };

  return (
    <Login handleLoginSuccess={handleLoginSuccess} tokenError={tokenError} />
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center gradient-bg py-12">
      <Suspense fallback={
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      }>
        <LoginContent />
      </Suspense>
    </main>
  );
}
