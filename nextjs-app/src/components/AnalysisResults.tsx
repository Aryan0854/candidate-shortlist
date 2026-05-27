'use client';

import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface AnalysisResultsProps {
  analysisResults: any[];
  goToPreviousStep: () => void;
  brId?: string;
}

export default function AnalysisResults({
  analysisResults = [],
  goToPreviousStep,
  brId
}: AnalysisResultsProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const handleAccordionToggle = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    if (score >= 30) return 'bg-orange-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
        <button
          onClick={goToPreviousStep}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-lg shadow-sm transition-all duration-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <div>
          <h4 className="text-base font-bold text-slate-800">Analysis Results</h4>
          {brId && (
            <p className="text-xs text-slate-500 font-medium">BR ID: <span className="font-bold">{brId}</span></p>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {analysisResults.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-semibold text-sm">
            No analysis results available.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[10%]">Rank</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[35%]">Candidate</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[15%]">Grade</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[25%]">Overall Match</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[15%] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analysisResults.map((r, idx) => {
                  const isExpanded = expandedRow === idx;
                  const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20';

                  return (
                    <React.Fragment key={idx}>
                      <tr className={`hover:bg-slate-50/50 transition-colors duration-150 ${rowBg}`}>
                        <td className="px-6 py-4.5 font-bold text-slate-600">{idx + 1}</td>
                        <td className="px-6 py-4.5 font-bold text-slate-800">{r.candidateName || '—'}</td>
                        <td className="px-6 py-4.5 font-semibold text-slate-600">{r.rawData?.grade || '—'}</td>
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                              <div
                                style={{ width: `${r.overallMatch}%` }}
                                className={`h-full rounded-full ${getBarColor(r.overallMatch)}`}
                              />
                            </div>
                            <span className="font-extrabold text-slate-700 text-sm">{r.overallMatch}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <button
                            onClick={() => handleAccordionToggle(idx)}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 border border-primary text-primary hover:bg-blue-50 font-bold text-xxs rounded-lg uppercase tracking-wider transition-all duration-200"
                          >
                            {isExpanded ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hide</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Details</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Accordion Details */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="p-0 bg-blue-50/30">
                            <div className="px-8 py-5 border-t border-b border-blue-100/50 space-y-4 text-sm text-slate-700 leading-relaxed font-medium animate-fadeIn">
                              
                              {/* Experience breakdown */}
                              <div>
                                <span className="font-extrabold text-blue-900 block text-xs uppercase tracking-wider mb-1">Experience Match</span>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-primary font-extrabold bg-white border border-blue-100 px-2 py-0.5 rounded-md">
                                    {r.rawData?.experience_match_percent !== undefined 
                                      ? `${r.rawData.experience_match_percent}%`
                                      : "N/A"}
                                  </span>
                                  <span className="text-slate-500 font-semibold text-xs">
                                    (Candidate: {r.rawData?.resume_experience_years || 'N/A'} years, Expected: {r.experience || 'N/A'})
                                  </span>
                                </div>
                              </div>

                              {/* Skills breakdown */}
                              {r.rawData?.individual_skill_match_percent && (
                                <div>
                                  <span className="font-extrabold text-blue-900 block text-xs uppercase tracking-wider mb-1.5">Skill Match Breakdown</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(r.rawData.individual_skill_match_percent).map(([skill, percent]: any) => (
                                      <span
                                        key={skill}
                                        className="px-2.5 py-1 bg-white text-primary border border-blue-100 text-xxs font-bold rounded-lg shadow-sm"
                                      >
                                        {skill}: {percent}%
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Resume Summary */}
                              <div className="bg-white p-4 rounded-xl border border-blue-100/30 shadow-inner">
                                <span className="font-extrabold text-blue-900 block text-xs uppercase tracking-wider mb-1.5">Resume Summary</span>
                                <p className="text-slate-600 font-medium text-xs leading-relaxed">
                                  {r.resumeSummary || "No summary available"}
                                </p>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
