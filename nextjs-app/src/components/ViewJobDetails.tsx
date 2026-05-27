'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ViewJobDetailsProps {
  open: boolean;
  handleClose: () => void;
  details: any;
}

export default function ViewJobDetails({ open, handleClose, details }: ViewJobDetailsProps) {
  const jobDetails = Array.isArray(details) && details.length > 0 ? details[0] : details;

  if (!open || !jobDetails) return null;

  const allFields = [
    { label: "Designation", value: jobDetails.designation, colSpan: 'col-span-12 sm:col-span-6 md:col-span-3' },
    { label: "Grade", value: jobDetails.grade, colSpan: 'col-span-12 sm:col-span-6 md:col-span-3' },
    { label: "Client Name", value: jobDetails.clientName, colSpan: 'col-span-12 sm:col-span-6 md:col-span-3' },
    { label: "Project", value: jobDetails.project, colSpan: 'col-span-12 sm:col-span-6 md:col-span-3' },

    { label: "Billing Type", value: jobDetails.billingType, colSpan: 'col-span-12 sm:col-span-6 md:col-span-3' },
    { label: "No. of Openings", value: jobDetails.noOfPositions, colSpan: 'col-span-12 sm:col-span-6 md:col-span-3' },
    { label: "Sourcing Type", value: jobDetails.sourcingType, colSpan: 'col-span-12 sm:col-span-6 md:col-span-3' },
    { label: "Requirement Type", value: jobDetails.requirementType, colSpan: 'col-span-12 sm:col-span-6 md:col-span-3' },

    { label: "Joining Location", value: jobDetails.joiningLocation, colSpan: 'col-span-12 sm:col-span-6 md:col-span-3' },
    { label: "Date Approved", value: jobDetails.dateApproved, colSpan: 'col-span-12 sm:col-span-6 md:col-span-3' },
    { label: "Current Status", value: jobDetails.currentReqStatus, colSpan: 'col-span-12 sm:col-span-6 md:col-span-3' },
    { label: "Entity", value: jobDetails.entity, colSpan: 'col-span-12 sm:col-span-6 md:col-span-3' },

    { label: "Client Interview", value: jobDetails.clientInterview, colSpan: 'col-span-12 sm:col-span-6 md:col-span-3' },
    { label: "RM Name", value: jobDetails.rmName, colSpan: 'col-span-12 sm:col-span-6 md:col-span-3' },
    { label: "Requester ID", value: jobDetails.requesterId, colSpan: 'col-span-12 sm:col-span-6 md:col-span-3' },
    { label: "Mandatory Skills", value: jobDetails.mandatorySkills, colSpan: 'col-span-12 sm:col-span-6 md:col-span-3' },
    
    { label: "Job Description", value: jobDetails.jobDescription, colSpan: 'col-span-12' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Backdrop overlay */}
        <div 
          onClick={handleClose} 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300" 
          aria-hidden="true"
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle max-w-4xl w-full border border-slate-100 animate-scaleUp">
          
          {/* Header */}
          <div className="gradient-primary px-6 py-5 flex items-center justify-between text-white border-b-4 border-blue-700">
            <div>
              <h3 className="text-xl font-extrabold tracking-tight" id="modal-title">
                Job Requirement Overview
              </h3>
              <p className="text-xs text-blue-100 font-medium mt-1">
                BR ID: <span className="font-bold bg-blue-800/40 px-2 py-0.5 rounded-md">{jobDetails.autoReqId || 'N/A'}</span>
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-white/20 rounded-xl text-white hover:scale-105 transition-all duration-200 focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 bg-slate-50/50">
            <div className="grid grid-cols-12 gap-5">
              {allFields.map((field, idx) => (
                <div key={idx} className={field.colSpan}>
                  <label className="block text-xxs font-extrabold text-blue-900 uppercase tracking-wider mb-1.5">
                    {field.label}
                  </label>
                  <div className="bg-slate-100 border border-slate-200 text-sm text-slate-700 font-medium px-4 py-3 rounded-xl min-h-[48px] flex items-center shadow-inner">
                    {field.value === null || field.value === undefined ? 'N/A' : String(field.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
