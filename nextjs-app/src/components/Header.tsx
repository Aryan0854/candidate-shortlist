'use client';

import React from 'react';
import { ArrowLeft, LogOut, Briefcase } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  onLogout?: () => void;
}

export default function Header({ title, showBack = false, onBack, onLogout }: HeaderProps) {
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') || 'Admin' : 'Admin';

  return (
    <header className="glass-panel sticky top-0 z-50 w-full border-b border-border/80 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-lg text-secondary transition-colors duration-200"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          <div className="flex items-center gap-2">
            <div className="gradient-primary p-2 rounded-lg text-white">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">{title || "PMO Recruitment Portal"}</h1>
              <p className="text-xs text-slate-500 font-medium">Candidate Shortlist Platform</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">{username}</span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 active:bg-red-100 border border-red-200 hover:border-red-300 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
