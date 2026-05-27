'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Trash2, ShieldAlert, BarChart3, ChevronLeft, Edit2, Check, X, FileText } from 'lucide-react';
import ShortlistDisplayTable from './ShortlistDisplayTable';
import AnalysisResults from './AnalysisResults';

const STEPS = ['Review Shortlist', 'Upload Resumes', 'View Analysis Results'];

interface ResumeAnalysisProps {
  goToAnalysisResults: (results: any[]) => void;
  goToShortlist: () => void;
  shortlistedData: any[];
  requiredSkills: string;
  brId?: string;
  selectedJobDetail: any;
  selectedFiles: Record<string, File>;
  setSelectedFiles: React.Dispatch<React.SetStateAction<Record<string, File>>>;
  onUpdateSkills: (newSkills: string) => Promise<boolean>;
}

export default function ResumeAnalysis({
  goToAnalysisResults,
  goToShortlist,
  shortlistedData,
  requiredSkills,
  selectedJobDetail,
  selectedFiles,
  setSelectedFiles,
  onUpdateSkills
}: ResumeAnalysisProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [candidatesToAnalyzeIds, setCandidatesToAnalyzeIds] = useState<Set<string>>(new Set());
  const [candidatesToAnalyzeData, setCandidatesToAnalyzeData] = useState<any[]>([]);

  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [editingSkillsText, setEditingSkillsText] = useState(requiredSkills || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    setEditingSkillsText(requiredSkills);
  }, [requiredSkills]);

  useEffect(() => {
    const ids = new Set(shortlistedData.map(c => c.employeeName || c.empName || c.id));
    setCandidatesToAnalyzeIds(ids);
  }, [shortlistedData]);

  const handleApplySkillChange = async () => {
    if (editingSkillsText.trim() === requiredSkills.trim()) {
      setIsEditingSkills(false);
      return;
    }
    const success = await onUpdateSkills(editingSkillsText.trim());
    if (success) setIsEditingSkills(false);
  };

  const handleCancelEdit = () => {
    setEditingSkillsText(requiredSkills);
    setIsEditingSkills(false);
  };

  const job = {
    brId: selectedJobDetail?.brId || 'N/A',
    client: selectedJobDetail?.client || 'N/A',
    grade: selectedJobDetail?.grade || 'N/A',
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, candidate: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const candidateId = candidate.employeeName || candidate.empName || candidate.id;
    
    // Call DB upload route
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("empNo", candidate.empNo || candidate.id || '1039680');
      formData.append("uploadedBy", "admin");

      const response = await fetch('/api/candidate/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      const result = await response.json();
      
      setSelectedFiles(prev => ({ ...prev, [candidateId]: file }));
      alert(result.message || `File uploaded for ${candidateId}.`);
    } catch (err) {
      console.error(err);
      alert(`Error uploading resume for ${candidateId}.`);
    }
    e.target.value = '';
  };

  const clearFile = async (candidate: any) => {
    const candidateId = candidate.employeeName || candidate.empName || candidate.id;
    const empNo = candidate.empNo || candidate.id;
    
    try {
      const response = await fetch(`/api/candidate/documents/delete/${empNo}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Delete failed');
      
      setSelectedFiles(prev => {
        const updated = { ...prev };
        delete updated[candidateId];
        return updated;
      });
    } catch (err) {
      console.error(err);
      alert("Error deleting resume.");
    }
  };

  const handleAnalyzeAll = async () => {
    const uploadedCandidates = shortlistedData.filter(c => selectedFiles[c.employeeName || c.empName || c.id]);
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/analysis/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brId: job.brId, candidatesForAnalysis: uploadedCandidates, requiredSkills })
      });

      if (!response.ok) throw new Error('Failed to trigger analysis');
      const result = await response.json();
      
      const rawCandidates = result.resultsReady?.candidates || [];
      const formattedResults = rawCandidates
        .filter((c: any) => c && c.employee_name)
        .map((c: any) => {
          const skillMatches = c.individual_skill_match_percent ? Object.values(c.individual_skill_match_percent) : [];
          const averageSkillMatch = skillMatches.length > 0
            ? skillMatches.reduce((sum: number, val: any) => sum + val, 0) / skillMatches.length
            : 0;
          const experienceMatch = c.experience_match_percent || 0;
          const overallMatchScore = Math.round((experienceMatch * 0.6) + (averageSkillMatch * 0.4));

          return {
            candidateName: c.employee_name,
            overallMatch: overallMatchScore,
            experience: c.expected_experience || `${c.resume_experience_years || 'N/A'} years`,
            resumeSummary: c.resume_summary || "No summary available",
            rawData: c
          };
        });
      
      const sorted = formattedResults.sort((a: any, b: any) => b.overallMatch - a.overallMatch);
      setAnalysisResults(sorted);
      setActiveStep(2);
    } catch (error: any) {
      alert(`Analysis Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const goToPreviousStep = () => {
    if (activeStep === 2) setActiveStep(1);
    else if (activeStep === 1) setActiveStep(0);
    else goToShortlist();
  };

  const uploadedCount = Object.keys(selectedFiles).length;

  return (
    <div className="space-y-6">
      {/* Stepper Headers */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {STEPS.map((label, idx) => {
            const isCompleted = idx < activeStep;
            const isActive = idx === activeStep;
            return (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center space-y-1.5 z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-primary border-primary text-white'
                        : isActive
                        ? 'bg-blue-50 border-primary text-primary scale-110 shadow-md shadow-blue-500/10'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isActive ? 'text-primary' : 'text-slate-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-grow h-0.5 max-w-[120px] mx-2 rounded-full transition-all duration-500 ${
                      idx < activeStep ? 'bg-primary' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Info Header Banner */}
      <div className="bg-blue-50/70 border border-blue-100 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-700 font-bold">
          <div>
            <span className="text-xxs font-extrabold text-blue-900 uppercase tracking-wider block mb-0.5">BR ID</span>
            <span className="text-slate-800 font-semibold">{job.brId}</span>
          </div>
          <div>
            <span className="text-xxs font-extrabold text-blue-900 uppercase tracking-wider block mb-0.5">Client Name</span>
            <span className="text-slate-800 font-semibold">{job.client}</span>
          </div>
          <div>
            <span className="text-xxs font-extrabold text-blue-900 uppercase tracking-wider block mb-0.5">Grade</span>
            <span className="text-slate-800 font-semibold">{job.grade}</span>
          </div>
        </div>

        {/* Required Skills Editor */}
        <div className="flex-grow max-w-md flex items-center gap-2">
          <span className="text-xs font-extrabold text-blue-950 uppercase tracking-wider whitespace-nowrap">Required Skills:</span>
          <div className="relative flex-grow flex items-center gap-1.5">
            <input
              type="text"
              readOnly={!isEditingSkills}
              value={isEditingSkills ? editingSkillsText : requiredSkills}
              onChange={(e) => setEditingSkillsText(e.target.value)}
              className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 ${
                isEditingSkills 
                  ? 'bg-white border-primary focus:ring-4 focus:ring-blue-100 focus:outline-none' 
                  : 'bg-slate-100 border-slate-200 text-slate-500 shadow-inner'
              }`}
            />
            {isEditingSkills ? (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={handleApplySkillChange}
                  className="p-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-lg transition-all duration-200"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1.5 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-lg transition-all duration-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingSkills(true)}
                disabled={activeStep !== 0}
                className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-colors duration-200 flex-shrink-0 disabled:opacity-30"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main stepper views */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        
        {activeStep === 0 && (
          <div className="space-y-6">
            <ShortlistDisplayTable
              candidates={shortlistedData}
              selectedCandidateIds={candidatesToAnalyzeIds}
              onSelectionChange={(ids) => setCandidatesToAnalyzeIds(new Set(ids))}
            />
            <div className="flex justify-end pr-2">
              <button
                onClick={() => {
                  const filtered = shortlistedData.filter(c => candidatesToAnalyzeIds.has(c.employeeName || c.empName || c.id));
                  setCandidatesToAnalyzeData(filtered);
                  setActiveStep(1);
                }}
                disabled={candidatesToAnalyzeIds.size === 0}
                className="px-6 py-3 bg-primary hover:bg-primary-hover active:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-colors duration-200"
              >
                {`Proceed to Upload (${candidatesToAnalyzeIds.size} selected)`}
              </button>
            </div>
          </div>
        )}

        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <button
                onClick={goToPreviousStep}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200 font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleAnalyzeAll}
                disabled={isAnalyzing || uploadedCount === 0}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary-hover active:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-colors duration-200"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Analyze All ({uploadedCount} Resumes)</span>
                  </>
                )}
              </button>
            </div>

            {/* Candidate resume upload rows */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[25%]">Name</th>
                    <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[12%]">Grade</th>
                    <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[38%]">Skill Match</th>
                    <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[25%] text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidatesToAnalyzeData.map((c, idx) => {
                    const cId = c.employeeName || c.empName || c.id;
                    const file = selectedFiles[cId];

                    return (
                      <tr key={cId} className={`hover:bg-slate-50/50 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">{c.employeeName || c.empName}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-500">{c.grade || '—'}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {c['skillMatch%'] && Object.entries(c['skillMatch%']).map(([skill, val]: any) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-xxs font-bold rounded-md"
                              >
                                {skill}: {typeof val === 'number' ? val.toFixed(1) : val}%
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            ref={el => {
                              fileInputRefs.current[cId] = el;
                            }}
                            onChange={(e) => handleFileChange(e, c)}
                            className="hidden"
                          />
                          {!file ? (
                            <button
                              onClick={() => fileInputRefs.current[cId]?.click()}
                              className="inline-flex items-center gap-1 px-4 py-2 border border-dashed border-primary/40 text-primary hover:bg-blue-50/50 hover:border-primary text-xs font-bold rounded-xl transition-all duration-200"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Resume</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-lg shadow-sm">
                                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="max-w-[120px] truncate" title={file.name}>{file.name}</span>
                              </span>
                              <button
                                onClick={() => clearFile(c)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg hover:scale-105 active:scale-95 transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <AnalysisResults
            analysisResults={analysisResults}
            goToPreviousStep={goToPreviousStep}
            brId={job.brId}
          />
        )}

      </div>
    </div>
  );
}
