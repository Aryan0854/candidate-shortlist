'use client';

import React from 'react';
import * as XLSX from 'xlsx';
import { Download, Check, AlertCircle } from 'lucide-react';

interface ShortlistDisplayTableProps {
  candidates: any[];
  isDataLoading?: boolean;
  title?: string;
  onSelectionChange: (ids: string[]) => void;
  selectedCandidateIds: Set<string>;
}

export default function ShortlistDisplayTable({
  candidates = [],
  isDataLoading = false,
  title = "Candidates Selected for Analysis",
  onSelectionChange,
  selectedCandidateIds
}: ShortlistDisplayTableProps) {

  const handleCheckboxClick = (candidateName: string) => {
    const newSelected = new Set(selectedCandidateIds);
    if (newSelected.has(candidateName)) {
      newSelected.delete(candidateName);
    } else {
      newSelected.add(candidateName);
    }
    onSelectionChange(Array.from(newSelected));
  };

  const handleSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allNames = candidates.map(c => c.employeeName || c.empName).filter(Boolean);
      onSelectionChange(allNames);
    } else {
      onSelectionChange([]);
    }
  };

  const handleExportExcel = () => {
    if (candidates.length === 0) return;

    const excelData = candidates.map(c => ({
      "Employee Name": c.employeeName || c.empName || "N/A",
      "Grade": c.grade || "N/A",
      "Skill Bucket": c.skillBucket || "N/A",
      "Top 3 Skills": c.top3Skills || "N/A",
      "Detailed Skills / Experience": c.detailedSkills || "N/A",
      "Skill Match %": c.skillMatchPercent 
        ? Object.entries(c.skillMatchPercent)
            .map(([skill, val]: any) => `${skill}: ${val.toFixed(2)}%`)
            .join(", ")
        : "N/A",
      "Match %": c.matchPercentage !== undefined ? `${c.matchPercentage.toFixed(2)}%` : (c['match%'] !== undefined ? `${c['match%'].toFixed(2)}%` : "N/A")
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shortlisted Candidates");
    XLSX.writeFile(workbook, `Shortlist_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const candidateNames = candidates.map(c => c.employeeName || c.empName).filter(Boolean);
  const isAllSelected = candidateNames.length > 0 && selectedCandidateIds.size === candidateNames.length;
  const isIndeterminate = selectedCandidateIds.size > 0 && selectedCandidateIds.size < candidateNames.length;

  return (
    <div className="space-y-4">
      {/* Header section */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <h4 className="text-base font-bold text-slate-800">
          {title} ({candidates.length})
        </h4>

        <button
          onClick={handleExportExcel}
          disabled={candidates.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover active:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition-colors duration-200"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export as Excel</span>
        </button>
      </div>

      {/* Table container */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar max-h-[500px] overflow-y-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5 text-center w-[7%]">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={el => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAllClick}
                    className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary focus:ring-2"
                  />
                </th>
                <th className="px-4 py-3.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[15%]">Name</th>
                <th className="px-4 py-3.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[8%] text-center">Grade</th>
                <th className="px-4 py-3.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[22%]">Skill Bucket</th>
                <th className="px-4 py-3.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[20%]">Top 3 Skills</th>
                <th className="px-4 py-3.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[18%]">Detailed Skills / Exp</th>
                <th className="px-4 py-3.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[10%] text-center">Match %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isDataLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="w-6 h-6 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                    <span className="text-xs font-bold text-slate-400">Loading candidate list...</span>
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm font-semibold">
                    No candidates currently selected for analysis.
                  </td>
                </tr>
              ) : (
                candidates.map((c, idx) => {
                  const id = c.employeeName || c.empName;
                  if (!id) return null;
                  const isChecked = selectedCandidateIds.has(id);
                  const matchVal = c.matchPercentage !== undefined ? c.matchPercentage : (c['match%'] !== undefined ? c['match%'] : null);

                  return (
                    <tr
                      key={id}
                      className={`hover:bg-blue-50/10 transition-all duration-150 border-l-4 ${
                        isChecked ? 'bg-blue-50/20 border-primary' : 'border-transparent'
                      } ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/10'}`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxClick(id)}
                          className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary focus:ring-2"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800 text-sm">{id}</span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-slate-600 text-sm">{c.grade || '—'}</span>
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-600 max-w-xs truncate" title={c.skillBucket}>
                          {c.skillBucket || 'N/A'}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]" title={c.top3Skills}>
                          {(c.top3Skills || '').split(',').map((skill: string, sIdx: number) => {
                            const trimmed = skill.trim();
                            if (!trimmed) return null;
                            return (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 bg-blue-50/80 text-primary border border-blue-100 text-[10px] font-bold rounded-md"
                              >
                                {trimmed}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-500 max-w-[220px] truncate" title={c.detailedSkills}>
                          {c.detailedSkills || 'N/A'}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-primary font-extrabold text-xs rounded-lg shadow-sm">
                          {matchVal !== null ? `${matchVal.toFixed(2)}%` : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
