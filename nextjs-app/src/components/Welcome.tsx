'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserCheck, ArrowRight, Mail, CheckCircle } from 'lucide-react';

interface WelcomeProps {
  isTokenUser?: boolean;
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Welcome({ isTokenUser = false }: WelcomeProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [magicLink, setMagicLink] = useState('');

  const handleGenerateToken = async () => {
    if (!email || !isValidEmail(email)) {
      setEmailError(true);
      return;
    }

    try {
      setLoading(true);
      const redirectPath = '/';

      const response = await fetch(
        `/api/auth/create-temp-url?email=${encodeURIComponent(
          email
        )}&redirectPath=${encodeURIComponent(redirectPath)}`,
        { method: 'POST' }
      );

      if (response.ok) {
        setSuccess(true);
        // Extract link from dev header if provided
        const generatedLink = response.headers.get('X-Magic-Link') || '';
        setMagicLink(generatedLink);
        setEmail('');
        setEmailError(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      id: 'external',
      title: 'Candidate Shortlisting System',
      description:
        'Screen and shortlist applicants from external job boards using our AI-driven matching engine.',
      icon: <Users className="w-8 h-8 text-primary" />,
      buttonText: 'Launch Candidate Portal',
      path: '/CandidateShortlistingSystem',
    },
    {
      id: 'internal',
      title: 'Employee Shortlisting System',
      description:
        'Evaluate current employees for promotions and internal roles based on performance data and skills.',
      icon: <UserCheck className="w-8 h-8 text-primary" />,
      buttonText: 'Launch Employee Portal',
      path: '/EmployeeShortlistingSystem',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-4">
          Welcome back, Recruiter
        </h2>
        <p className="text-lg text-slate-500">
          Select a module below to manage your candidates or internal employees.
        </p>
      </div>

      {/* MODULE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {modules.map((module) => (
          <div
            key={module.id}
            onClick={() => router.push(module.path)}
            className="glass-card hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 p-8 rounded-2xl cursor-pointer flex flex-col items-center text-center group"
          >
            <div className="bg-primary-light p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
              {module.icon}
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-3">{module.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-grow">
              {module.description}
            </p>

            <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover active:bg-blue-800 text-white font-bold rounded-full transition-colors duration-200 shadow-sm w-full sm:w-auto">
              <span>{module.buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* TEMPORARY LOGIN ACCESS */}
      {!isTokenUser && (
        <div className="glass-card hover:-translate-y-1 hover:shadow-md transition-all duration-300 p-8 rounded-2xl flex flex-col items-center">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Temporary Login Access</h3>
          <p className="text-sm text-slate-500 text-center mb-6">
            Enter an email ID to generate and send a secure access token.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch w-full max-w-lg">
            <div className="flex-grow">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email ID"
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEmail(val);
                    setEmailError(val !== '' && !isValidEmail(val));
                  }}
                  className={`w-full px-4 py-3 bg-white border ${
                    emailError ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-100'
                  } rounded-xl shadow-inner focus:outline-none focus:ring-4 transition-all duration-200`}
                />
                <Mail className="absolute right-3.5 top-3.5 w-5 h-5 text-slate-400" />
              </div>
              {emailError && (
                <p className="text-xs text-red-500 font-semibold mt-1">Please enter a valid email address</p>
              )}
            </div>

            <button
              onClick={handleGenerateToken}
              disabled={loading || !email || emailError}
              className="px-6 py-3 bg-primary hover:bg-primary-hover active:bg-blue-800 text-white font-bold rounded-xl disabled:opacity-50 transition-colors duration-200 shadow-sm"
            >
              {loading ? 'Generating…' : 'Generate Token'}
            </button>
          </div>

          {success && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm font-semibold rounded-xl flex items-start gap-2 max-w-lg w-full animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-grow">
                <p className="mb-1">Token generated successfully!</p>
                {magicLink && (
                  <p className="text-xs font-mono text-emerald-700 bg-white p-2 rounded-lg border border-emerald-100/50 break-all select-all select-text">
                    {magicLink}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
