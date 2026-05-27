'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileSpreadsheet, Eye, Trash2, ArrowRight, MoreHorizontal, AlertCircle, X, Download } from 'lucide-react';
import ViewJobDetails from './ViewJobDetails';

interface BRDataProps {
  jobFiles: any[];
  setJobFiles: React.Dispatch<React.SetStateAction<any[]>>;
  parsedData: any[];
  setParsedData: React.Dispatch<React.SetStateAction<any[]>>;
  goToCandidateUpload: (skills: string, jobDetails: any) => void;
  refetchJobRequirements?: () => void;
}

export default function BRData({
  jobFiles,
  setJobFiles,
  parsedData,
  setParsedData,
  goToCandidateUpload,
  refetchJobRequirements
}: BRDataProps) {
  const [parsing, setParsing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Actions menu state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  // Details Modal state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [brDetails, setBrDetails] = useState<any | null>(null);

  const fetchJobRequirements = useCallback(async () => {
    try {
      const response = await fetch('/api/brdata');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      
      const mappedData = result.map((r: any) => ({
        client: r.clientName || 'N/A',
        brId: r.autoReqId,
        grade: r.grade || '—',
        skills: r.mandatorySkills || '',
        id: r.autoReqId,
        status: r.currentReqStatus || 'Open',
        resources: r.noOfPositions || 0,
      }));
      setParsedData(mappedData);
    } catch (error) {
      console.error("Error fetching job requirements:", error);
    }
  }, [setParsedData]);

  useEffect(() => {
    if (parsedData.length === 0) {
      fetchJobRequirements();
    }
  }, [fetchJobRequirements, parsedData.length]);

  const processFile = async (file: File) => {
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      alert("Please upload .XLSX, .XLS, or .CSV files only.");
      return;
    }

    setSelectedFile(file);
    setParsing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);

      const response = await fetch('/api/brdata', {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'failed') {
        alert(result.message || 'File processing failed');
      } else {
        await fetchJobRequirements();
        if (refetchJobRequirements) refetchJobRequirements();
        // Add to files list
        setJobFiles(prev => [...prev, { name: file.name }]);
      }
    } catch (error) {
      console.error("Error processing file upload:", error);
      alert("Failed to upload job requirements to the server.");
      setSelectedFile(null);
    } finally {
      setParsing(false);
    }
  };

  const handleGenerateReport = () => {
    // Generate CSV locally
    const headers = ["BR ID", "Client", "Grade", "Skills", "Openings", "Status"];
    const csvRows = parsedData.map(row => [
      `"${row.brId}"`,
      `"${row.client}"`,
      `"${row.grade}"`,
      `"${row.skills.replace(/"/g, '""')}"`,
      `"${row.resources}"`,
      `"${row.status}"`
    ].join(","));

    const csvString = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "br_data_export.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleViewDetails = async (row: any) => {
    try {
      const response = await fetch(`/api/brdata/${row.brId}`);
      if (!response.ok) throw new Error("Failed to fetch job details");
      const details = await response.json();
      
      if (details) {
        setBrDetails(details);
        setIsDetailsOpen(true);
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
      alert(`Failed to load details for BR ID ${row.brId}.`);
    }
  };

  const removeRow = async (id: string, brId: string) => {
    if (!confirm(`Are you sure you want to delete BR ID ${brId}?`)) return;
    try {
      const response = await fetch(`/api/job-requirements/${brId}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete BR ID on server");
      
      setParsedData(prev => prev.filter(r => r.id !== id));
      setActiveMenuId(null);
    } catch (error) {
      console.error("Error removing job requirement:", error);
      alert(`Failed to remove BR ID ${brId}.`);
    }
  };

  const handleUploadRow = (row: any) => {
    goToCandidateUpload(row.skills, row);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-emerald-50 text-emerald-800 border-emerald-100';
      case 'Active':
        return 'bg-amber-50 text-amber-800 border-amber-100';
      case 'Closed':
        return 'bg-rose-50 text-rose-800 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-xl font-extrabold tracking-tight text-slate-800">Upload BR Data</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active File:</span>
            <span className="text-sm font-bold text-primary truncate max-w-[200px] sm:max-w-sm">
              {selectedFile ? selectedFile.name : "No file selected"}
            </span>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <input
            id="file-input-br"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processFile(e.target.files[0]);
              }
              e.target.value = '';
            }}
            className="hidden"
          />
          
          <label
            htmlFor="file-input-br"
            className="flex-grow sm:flex-grow-0 cursor-pointer flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-98 transition-all duration-200"
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </label>

          <button
            onClick={handleGenerateReport}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-sm rounded-xl transition-all duration-200 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Parsing Loader */}
      {parsing && (
        <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Processing upload via API...</p>
        </div>
      )}

      {/* Loaded Files chips */}
      {jobFiles.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Loaded Files ({jobFiles.length})</h4>
          <div className="flex flex-wrap gap-2">
            {jobFiles.map((file, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50/70 border border-blue-100 text-primary text-xs font-bold rounded-lg shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{file.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {parsedData.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[12%]">BR ID</th>
                  <th className="px-6 py-4.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[18%]">Client</th>
                  <th className="px-6 py-4.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[12%]">Grade</th>
                  <th className="px-6 py-4.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[35%]">Skills</th>
                  <th className="px-6 py-4.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[10%] text-center">Openings</th>
                  <th className="px-6 py-4.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[10%] text-center">Status</th>
                  <th className="px-6 py-4.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[8%] text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedData.map((row, idx) => (
                  <tr key={row.id} className={`hover:bg-slate-50/80 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    <td className="px-6 py-4 font-bold text-slate-800">{row.brId}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{row.client}</td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{row.grade}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {row.skills.split(',').filter((s: string) => s.trim() !== '').map((skill: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 bg-blue-50 text-primary border border-blue-100 text-xxs font-bold rounded-md shadow-sm"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-800 text-center">{row.resources}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 text-xxs font-bold border rounded-full uppercase tracking-wider ${getStatusColor(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center relative">
                      <button
                        onClick={() => {
                          setActiveMenuId(activeMenuId === row.id ? null : row.id);
                          setSelectedRow(row);
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors duration-200"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === row.id && (
                        <div className="absolute right-6 top-12 z-20 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-2 divide-y divide-slate-50 animate-scaleUp">
                          <button
                            onClick={() => {
                              handleViewDetails(row);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4 text-slate-500" />
                            <span>View Details</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              handleUploadRow(row);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <ArrowRight className="w-4 h-4 text-slate-500" />
                            <span>Shortlist Candidates</span>
                          </button>
                          
                          <button
                            onClick={() => removeRow(row.id, row.brId)}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                            <span>Remove</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mb-3" />
          <h4 className="text-lg font-bold text-slate-700">No requirements loaded</h4>
          <p className="text-sm text-slate-400 max-w-sm mt-1">
            Please upload a CSV or Excel file containing job requirements to get started.
          </p>
        </div>
      )}

      {/* Details Dialog */}
      <ViewJobDetails
        open={isDetailsOpen}
        handleClose={() => {
          setIsDetailsOpen(false);
          setBrDetails(null);
        }}
        details={brDetails}
      />
    </div>
  );
}
