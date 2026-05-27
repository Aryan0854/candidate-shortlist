'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BRData from '@/components/BRData';
import CandidateShortlisting from '@/components/CandidateData';
import ResumeAnalysis from '@/components/ResumeAnalysis';

export default function EmployeeShortlistingSystemPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Employee System Internal Tabs (0: BR Data, 1: Candidate Data, 2: Resume/Results) ---
  const [employeeSystemTab, setEmployeeSystemTab] = useState(0);

  // --- Data States ---
  const [jobFiles, setJobFiles] = useState<any[]>([]);
  const [jobRequirements, setJobRequirements] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [candidateFile, setCandidateFile] = useState<File | null>(null);
  const [candidateFileName, setCandidateFileName] = useState('');
  const [requiredLanguages, setRequiredLanguages] = useState('');
  const [shortlistedCandidates, setShortlistedCandidates] = useState<any[]>([]);
  const [filteredRawData, setFilteredRawData] = useState<any[]>([]);
  const [selectedShortlistIds, setSelectedShortlistIds] = useState<Set<string>>(new Set());
  const [selectedJobDetail, setSelectedJobDetail] = useState<any | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});

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

  const fetchInitialData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const [candidatesResponse, brResponse] = await Promise.all([
        fetch('/api/employee'),
        fetch('/api/brdata')
      ]);

      if (candidatesResponse.ok) {
        const candidateResult = await candidatesResponse.json();
        setFilteredRawData(candidateResult);

        // Initialize selection to all candidate IDs
        const initialIds = new Set(
          candidateResult
            .map((c: any) => c.empNo)
            .filter((empNo: string) => empNo !== undefined)
        );
        setSelectedShortlistIds(initialIds as Set<string>);
      }

      if (brResponse.ok) {
        const brResult = await brResponse.json();
        const mappedData = brResult.map((r: any) => ({
          client: r.clientName || 'N/A',
          brId: r.autoReqId,
          grade: r.grade || '—',
          skills: r.mandatorySkills || '',
          id: r.autoReqId,
          fileName: "Brdata.csv",
          status: r.currentReqStatus || 'Open',
          resources: r.noOfPositions || 0,
        }));
        setJobRequirements(mappedData);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData();
    }
  }, [isAuthenticated, fetchInitialData]);

  // Handler to shortlist based on Job selection (Step 0 -> Step 2)
  const handleJobUploadAndTransition = async (skills: string, jobDetails: any) => {
    const safeSkills = typeof skills === 'string' ? skills : '';
    setRequiredLanguages(safeSkills);
    setSelectedJobDetail(jobDetails);
    setActionLoading(true);

    try {
      const formData = new FormData();
      formData.append("autoReqId", String(jobDetails.brId));

      const response = await fetch('/api/match-skills', {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to match skills on server.");
      }

      const data = await response.json();
      const matchingCandidates = data.results || [];
      const matchingIds = new Set(matchingCandidates.map((c: any) => c.empNo || c.employeeName));

      setShortlistedCandidates(matchingCandidates);
      setSelectedShortlistIds(matchingIds as Set<string>);
      setEmployeeSystemTab(2); // Jump to analysis
      alert(`Job details mapped! AI matched ${matchingCandidates.length} internal candidates.`);
    } catch (err: any) {
      console.error(err);
      alert('Could not match candidates: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSkills = async (newSkills: string) => {
    if (!selectedJobDetail) return false;
    setActionLoading(true);

    try {
      const formData = new FormData();
      formData.append("auto_req_id", String(selectedJobDetail.brId));
      formData.append("client_name", String(selectedJobDetail.client));
      formData.append("grade", String(selectedJobDetail.grade));
      formData.append("skills", String(newSkills));

      const response = await fetch('/api/match-skills/edit', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update skills');

      const result = await response.json();
      setShortlistedCandidates(result.results || []);
      setRequiredLanguages(newSkills);
      const newIds = new Set((result.results || []).map((c: any) => c.empNo || c.employeeName));
      setSelectedShortlistIds(newIds as Set<string>);

      alert("Skills updated and shortlist refreshed.");
      return true;
    } catch (err: any) {
      console.error(err);
      alert("Failed to update skills: " + err.message);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleTabChange = (newTab: number) => {
    setEmployeeSystemTab(newTab);
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = ['BR Data', 'Candidate Data', 'Analysis'];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header
        title="Employee Shortlisting System"
        showBack
        onBack={() => router.push('/')}
        onLogout={handleLogout}
      />

      {/* Tabs navigation bar */}
      <div className="glass-panel sticky top-[72px] z-40 border-b border-border/80 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-stretch">
          {tabs.map((tab, idx) => {
            const isActive = idx === employeeSystemTab;
            return (
              <button
                key={idx}
                onClick={() => handleTabChange(idx)}
                className={`px-8 py-4 font-bold text-xs uppercase tracking-wider relative transition-all duration-200 border-b-2 hover:bg-slate-100/50 ${
                  isActive 
                    ? 'text-primary border-primary bg-primary-light/10' 
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-grow max-w-7xl w-full mx-auto p-6 space-y-6">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl min-h-[500px] relative">
          
          {actionLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-3xl">
              <div className="flex flex-col items-center gap-2 text-sm text-primary font-bold">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <span>Syncing matched shortlist...</span>
              </div>
            </div>
          )}

          {isDataLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
            </div>
          ) : (
            <>
              {/* Tab 0: BR Data list */}
              {employeeSystemTab === 0 && (
                <BRData
                  jobFiles={jobFiles}
                  setJobFiles={setJobFiles}
                  parsedData={jobRequirements}
                  setParsedData={setJobRequirements}
                  goToCandidateUpload={handleJobUploadAndTransition}
                  refetchJobRequirements={fetchInitialData}
                />
              )}

              {/* Tab 1: Candidates Roster */}
              {employeeSystemTab === 1 && (
                <CandidateShortlisting
                  updateCandidateFile={setCandidateFile}
                  updateCandidateFileName={setCandidateFileName}
                  candidateFileName={candidateFileName}
                  filteredRawData={filteredRawData}
                  refetchAllCandidates={fetchInitialData}
                  loading={isDataLoading}
                  selectedShortlistIds={selectedShortlistIds}
                  toggleShortlistSelection={(id) => {
                    setSelectedShortlistIds(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(id)) newSet.delete(id);
                      else newSet.add(id);
                      return newSet;
                    });
                  }}
                />
              )}

              {/* Tab 2: Resume screening stepper */}
              {employeeSystemTab === 2 && (
                <ResumeAnalysis
                  goToAnalysisResults={() => {}}
                  goToShortlist={() => setEmployeeSystemTab(1)}
                  shortlistedData={shortlistedCandidates}
                  requiredSkills={requiredLanguages}
                  brId={selectedJobDetail?.brId}
                  selectedJobDetail={selectedJobDetail}
                  selectedFiles={selectedFiles}
                  setSelectedFiles={setSelectedFiles}
                  onUpdateSkills={handleUpdateSkills}
                />
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}
