'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import CandidateUpload from '@/components/CandidateUpload';

export default function CandidateShortlistingSystemPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('username');
    if (!user) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push('/login');
  };

  const handleProcess = async (brFile: File, cvFile: File) => {
    const formData = new FormData();
    formData.append("jd_file", brFile);
    formData.append("resume_zip", cvFile);

    try {
      const response = await fetch('/api/search_resumes_v2', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error("Shortlist processing failed");
      }

      return await response.json();
    } catch (err) {
      console.warn("Backend failed, using fallback data", err);
      alert("Using mock data due to backend processing error.");
      return {
        results: [
          {
            br_id: "33184BR",
            matches: [
              {
                resume_id: "52246737",
                final_score: 67.86,
                primary_skill: "None",
              },
              {
                resume_id: "79541391",
                final_score: 67.25,
                primary_skill: "None",
              },
            ],
          },
          {
            br_id: "35358BR",
            matches: [
              {
                resume_id: "83816738",
                final_score: 78.22,
                primary_skill: "Sql",
              },
              {
                resume_id: "70089206",
                final_score: 62.65,
                primary_skill: "None",
              },
            ],
          },
        ],
      };
    }
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
      <Header
        title="Candidate Shortlisting System"
        showBack
        onBack={() => router.push('/')}
        onLogout={handleLogout}
      />
      <main className="flex-grow max-w-7xl w-full mx-auto p-6 space-y-6">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl">
          <CandidateUpload
            onCancel={() => router.push('/')}
            onProcess={handleProcess}
          />
        </div>
      </main>
    </div>
  );
}
