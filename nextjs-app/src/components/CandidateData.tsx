'use client';

import React, { useState, useEffect } from 'react';
import { Upload, HelpCircle, FileSpreadsheet, Search, Check } from 'lucide-react';

interface CandidateShortlistingProps {
  updateCandidateFile: (file: File) => void;
  updateCandidateFileName: (name: string) => void;
  candidateFileName: string;
  filteredRawData: any[];
  refetchAllCandidates: () => Promise<void>;
  loading: boolean;
  selectedShortlistIds: Set<string>;
  toggleShortlistSelection: (id: string) => void;
}

export default function CandidateShortlisting({
  updateCandidateFile,
  updateCandidateFileName,
  candidateFileName,
  filteredRawData = [],
  refetchAllCandidates,
  loading: isAppLoading,
  selectedShortlistIds,
  toggleShortlistSelection
}: CandidateShortlistingProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCandidates, setFilteredCandidates] = useState<any[]>([]);

  const handleUploadCandidateData = async (file: File, fileName: string) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);

      const response = await fetch('/api/employee', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload candidate data to server.');
      }

      const result = await response.json();
      await refetchAllCandidates();
      alert(result.message || `Candidate data uploaded successfully!`);
    } catch (error: any) {
      console.error("Error during candidate upload:", error);
      alert(`Candidate file upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateCandidateFileName(file.name);
      updateCandidateFile(file);
      handleUploadCandidateData(file, file.name);
    }
    e.target.value = '';
  };

  // Filter logic
  useEffect(() => {
    if (!filteredRawData || filteredRawData.length === 0) {
      setFilteredCandidates([]);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredCandidates(filteredRawData);
      return;
    }

    const matched = filteredRawData.filter(candidate => {
      const skills = candidate.skillsBucket ? String(candidate.skillsBucket).toLowerCase() : '';
      const name = candidate.empName ? String(candidate.empName).toLowerCase() : '';
      const top3 = candidate.top3Skills ? String(candidate.top3Skills).toLowerCase() : '';
      return skills.includes(term) || name.includes(term) || top3.includes(term);
    });

    setFilteredCandidates(matched);
  }, [filteredRawData, searchTerm]);

  return (
    <div className="space-y-6">
      {/* File Upload Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex-grow">
          <h3 className="text-xl font-extrabold tracking-tight text-slate-800">Candidate Data</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">File Name:</span>
            <span className={`text-sm font-bold truncate max-w-[200px] sm:max-w-sm ${candidateFileName ? 'text-emerald-600' : 'text-rose-500'}`}>
              {candidateFileName || "No file selected"}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search skills/name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-200 focus:outline-none w-full sm:w-60 text-sm font-medium"
            />
            <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400" />
          </div>

          <input
            id="file-input-candidate"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <label
            htmlFor="file-input-candidate"
            className="cursor-pointer flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/10 active:scale-98 transition-all duration-200 whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Processing...' : 'Upload Candidate Data'}</span>
          </label>
        </div>
      </div>

      {/* Grid List */}
      {(isAppLoading || filteredCandidates.length > 0 || isUploading) ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[18%]">Employee Name</th>
                  <th className="px-6 py-4.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[8%] text-center">Grade</th>
                  <th className="px-6 py-4.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[18%]">Skill Category</th>
                  <th className="px-6 py-4.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[24%]">Top 3 Skills</th>
                  <th className="px-6 py-4.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[24%]">Detailed Skills</th>
                  <th className="px-6 py-4.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[8%] text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isAppLoading || isUploading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                      <span className="text-sm font-semibold text-slate-400">Loading candidate list...</span>
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((c, idx) => {
                    const isSelected = selectedShortlistIds.has(c.empNo);
                    return (
                      <tr
                        key={c.empNo}
                        onClick={() => toggleShortlistSelection(c.empNo)}
                        className={`cursor-pointer hover:bg-blue-50/20 transition-all duration-150 relative ${
                          isSelected ? 'bg-blue-50/40 border-l-4 border-primary' : 'border-l-4 border-transparent'
                        } ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}
                      >
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <span className="p-0.5 bg-primary text-white rounded-full">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <span className="font-bold text-slate-800">{c.empName || c.employeeName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4.5 text-center font-bold text-slate-600">{c.grade}</td>
                        <td className="px-6 py-4.5 font-medium text-slate-700">{c.skillsCategory}</td>
                        <td className="px-6 py-4.5">
                          <div className="text-sm font-medium text-slate-700 truncate max-w-xs" title={c.top3Skills}>
                            {c.top3Skills}
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="text-sm font-normal text-slate-500 truncate max-w-xs" title={c.detailedSkills}>
                            {c.detailedSkills}
                          </div>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <span className={`inline-block px-3 py-1 text-xxs font-bold rounded-full uppercase tracking-wider ${
                            c.status === 'Available' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'
                          }`}>
                            {c.status || 'Active'}
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
      ) : (
        <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
          <HelpCircle className="w-12 h-12 text-slate-400 mb-3" />
          <h4 className="text-lg font-bold text-slate-700">No candidate data available</h4>
          <p className="text-sm text-slate-400 max-w-sm mt-1">
            Please upload a candidate roster file (.xlsx or .csv) to populate the browser pool.
          </p>
        </div>
      )}
    </div>
  );
}
