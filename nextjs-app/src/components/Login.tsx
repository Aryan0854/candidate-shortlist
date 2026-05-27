'use client';

import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginProps {
  handleLoginSuccess: () => void;
  tokenError?: string | null;
}

export default function Login({ handleLoginSuccess, tokenError }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const displayError = tokenError === "Link expired"
    ? "Application Access Denied as the Token has Expired"
    : tokenError === "Invalid link"
    ? "Application Access Denied as the Token is Invalid"
    : tokenError || errorMsg;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (response.ok) {
        // Save user to localStorage
        localStorage.setItem('username', result.username);
        localStorage.setItem('email', result.email);
        localStorage.setItem('userId', result.userId);
        
        handleLoginSuccess();
      } else {
        setErrorMsg(result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Login Error:', error);
      setErrorMsg('Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4">
      {displayError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-100 text-red-800 text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      <div className="glass-card shadow-2xl rounded-3xl overflow-hidden border-t-4 border-primary">
        <div className="p-8 text-center">
          <div className="gradient-primary inline-flex p-3.5 rounded-2xl text-white mb-4 shadow-md">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 mb-1">Welcome</h2>
          <p className="text-sm text-slate-500 font-medium">Sign in to continue to the system.</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={isLoading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-200 focus:outline-none"
              />
              <User className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-11 pr-11 py-3 bg-slate-50/50 border border-slate-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-200 focus:outline-none"
              />
              <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all duration-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover active:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Signing In...</span>
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
