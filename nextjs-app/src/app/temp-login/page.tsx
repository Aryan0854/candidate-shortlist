'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function TempLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Verifying secure access token...');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      router.push('/login?tokenError=Invalid link');
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/temp-login?token=${encodeURIComponent(token)}`);
        
        if (response.ok) {
          const result = await response.json();
          
          // Store session details
          localStorage.setItem('username', result.email);
          localStorage.setItem('email', result.email);
          localStorage.setItem('isTokenUser', 'true');
          
          setStatus('Token verified successfully! Redirecting...');
          setTimeout(() => {
            router.push('/');
          }, 1000);
        } else {
          const errorMsg = await response.text();
          router.push(`/login?tokenError=${encodeURIComponent(errorMsg || 'Invalid or expired link')}`);
        }
      } catch (err) {
        console.error('Verification error:', err);
        router.push('/login?tokenError=Unable to verify link. Please try again.');
      }
    };

    validateToken();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="text-sm font-bold text-slate-600 tracking-tight">{status}</p>
    </div>
  );
}

export default function TempLoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gradient-bg">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-600 tracking-tight">Loading verification page...</p>
        </div>
      }>
        <TempLoginContent />
      </Suspense>
    </main>
  );
}
