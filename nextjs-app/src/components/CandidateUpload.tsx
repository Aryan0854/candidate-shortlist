'use client';

import React, { useState } from 'react';
import { Upload, FileText, FileSpreadsheet, Play, Download, HelpCircle, Check, Trash2, ArrowRight } from 'lucide-react';

interface CandidateUploadProps {
  onCancel: () => void;
  onProcess: (brFile: File, cvFile: File) => Promise<any>;
}

interface UploadBoxProps {
  title: string;
  accept: string;
  file: File | null;
  setFile: (file: File | null) => void;
  fileTypeHint: string;
}

function UploadBox({ title, accept, file, setFile, fileTypeHint }: UploadBoxProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{title}</span>
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-5 min-h-[140px] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-primary bg-blue-50/50 scale-99'
            : file
            ? 'border-emerald-300 bg-emerald-50/10'
            : 'border-slate-300 bg-slate-50 hover:border-primary hover:bg-blue-50/10'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {file ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="p-2.5 bg-emerald-100/50 text-emerald-800 rounded-xl">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 max-w-[180px] truncate" title={file.name}>
                {file.name}
              </p>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                Selected
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-slate-100 transition-all duration-150 mt-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Upload className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors duration-200" />
            <div>
              <p className="text-xs font-extrabold text-slate-700">Drop {title}</p>
              <span className="inline-block mt-1.5 px-2 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-extrabold rounded-md uppercase tracking-wider">
                {fileTypeHint}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CandidateUpload({ onProcess }: CandidateUploadProps) {
  const [brFile, setBrFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProcessClick = async () => {
    if (!brFile || !cvFile) return;

    setLoading(true);
    try {
      const response = await onProcess(brFile, cvFile);
      setResults(response);
    } catch (err) {
      console.error("Processing failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (type: 'pdf' | 'excel') => {
    if (!results) return;
    try {
      const response = await fetch(`/api/download_${type}_v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(results)
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume_matches_report.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download report.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-xl font-extrabold tracking-tight text-slate-800">Shortlist Processor</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Upload Job Description Excel and Resume ZIP files to start AI matching.
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {results && (
            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadReport('excel')}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-sm"
              >
                Download Excel
              </button>
              <button
                onClick={() => handleDownloadReport('pdf')}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-sm"
              >
                Download PDF
              </button>
            </div>
          )}
          
          <button
            onClick={handleProcessClick}
            disabled={!brFile || !cvFile || loading}
            className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover active:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-colors duration-200"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Process Shortlist</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upload grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <UploadBox
          title="Job Description Excel"
          accept=".xlsx,.xls"
          file={brFile}
          setFile={setBrFile}
          fileTypeHint="Excel format (.xlsx)"
        />
        <UploadBox
          title="Resumes ZIP File"
          accept=".zip"
          file={cvFile}
          setFile={setCvFile}
          fileTypeHint="ZIP file (.zip)"
        />
      </div>

      {/* Results output */}
      {results?.results ? (
        <div className="space-y-6">
          {results.results.map((br: any) => (
            <div key={br.br_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  BR ID Match Results: <span className="text-primary">{br.br_id}</span>
                </h4>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3.5 text-xxs font-extrabold text-slate-500 uppercase tracking-wider w-[10%]">Rank</th>
                      <th className="px-6 py-3.5 text-xxs font-extrabold text-slate-500 uppercase tracking-wider w-[40%]">Resume File ID</th>
                      <th className="px-6 py-3.5 text-xxs font-extrabold text-slate-500 uppercase tracking-wider w-[25%]">Match Score</th>
                      <th className="px-6 py-3.5 text-xxs font-extrabold text-slate-500 uppercase tracking-wider w-[25%]">Primary Skill Accents</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...br.matches]
                      .sort((a, b) => b.final_score - a.final_score)
                      .map((m, index) => (
                        <tr key={m.resume_id} className="hover:bg-slate-50/30 transition-colors duration-150">
                          <td className="px-6 py-4 text-sm font-bold text-slate-500">{index + 1}</td>
                          <td className="px-6 py-4 font-bold text-slate-800 text-sm">{m.resume_id}</td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-3 py-1 bg-blue-50 text-primary border border-blue-100 font-extrabold text-xs rounded-lg shadow-sm">
                              {m.final_score.toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {m.primary_skill && m.primary_skill !== "None" ? (
                              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 text-xxs font-bold rounded-lg shadow-sm">
                                {m.primary_skill}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-semibold text-xs">None</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
            <HelpCircle className="w-12 h-12 text-slate-400 mb-3" />
            <h4 className="text-lg font-bold text-slate-700">Ready for processing</h4>
            <p className="text-sm text-slate-400 max-w-sm mt-1">
              Select your job description Excel and candidate resumes ZIP file above, then click "Process Shortlist".
            </p>
          </div>
        )
      )}
    </div>
  );
}
