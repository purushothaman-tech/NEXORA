import React from 'react';
import { Printer, X, ShieldCheck, Heart, FileText } from 'lucide-react';
import { QueueTicket } from '../../types/mednova';
import { TRIAGE_CONFIGS } from '../../utils/triageEngine';
import { formatStructuredRegions } from '../../utils/bodyMapHelpers';

interface CaseSummaryPrintModalProps {
  ticket: QueueTicket;
  onClose: () => void;
}

export const CaseSummaryPrintModal: React.FC<CaseSummaryPrintModalProps> = ({
  ticket,
  onClose,
}) => {
  const triageConfig = TRIAGE_CONFIGS[ticket.triage.level];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden my-8">
        
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Official OPD Clinical Case Record • Print Preview
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document */}
        <div className="p-8 space-y-6 text-slate-900 bg-white" id="printable-case-sheet">
          
          {/* Hospital Letterhead Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xl">
                MN
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 font-display">
                  MEDNOVA MULTI-SPECIALTY HOSPITAL
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  National Health Mission • Ayushman Bharat Digital Mission (ABDM) Partner
                </p>
                <p className="text-[11px] text-slate-500">
                  Sector 14, Institutional Area, New Delhi - 110001 • OPD Registry No: {ticket.id}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 block">Token Number</span>
              <span className="text-2xl font-black font-mono text-slate-900">{ticket.tokenNumber}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Patient Demographics Table */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs grid grid-cols-3 gap-3">
            <div>
              <span className="text-slate-500 block font-semibold">Patient Name:</span>
              <strong className="text-sm text-slate-900">{ticket.patient.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Age / Gender:</span>
              <strong className="text-slate-900">{ticket.patient.age} Years / {ticket.patient.gender.toUpperCase()}</strong>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">ABHA ID:</span>
              <strong className="font-mono text-slate-900">{ticket.patient.abhaId || 'Not Linked'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Department:</span>
              <strong className="text-teal-800">{ticket.department}</strong>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Consultation Room:</span>
              <strong className="text-slate-900">{ticket.roomNumber}</strong>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">Triage Priority:</span>
              <span
                className="inline-block px-2 py-0.5 rounded text-[11px] font-black uppercase"
                style={{ backgroundColor: triageConfig.bgLight, color: triageConfig.color }}
              >
                Level {ticket.triage.level} ({triageConfig.title})
              </span>
            </div>
          </div>

          {/* Chief Complaint & HPI */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              Chief Clinical Complaint & History of Present Illness
            </h3>
            <p className="text-sm font-semibold text-slate-900 pt-1">
              "{ticket.intake.chiefComplaint}"
            </p>
            {ticket.intake.chiefComplaintOriginal && (
              <p className="text-xs text-slate-500 italic">
                Original native intake ({ticket.patient.preferredLanguage}): "{ticket.intake.chiefComplaintOriginal}"
              </p>
            )}
            <div className="text-xs text-slate-600 flex flex-wrap gap-4 pt-1">
              <span><strong>Duration:</strong> {ticket.intake.duration}</span>
              <span><strong>Onset:</strong> {ticket.intake.onset}</span>
              <span><strong>Pain Score:</strong> {ticket.intake.vitals.painScore} / 10</span>
              <span><strong>Body Regions:</strong> {ticket.intake.structuredBodyRegions?.length ? formatStructuredRegions(ticket.intake.structuredBodyRegions) : ticket.intake.bodyRegions.join(', ')}</span>
            </div>
          </div>

          {/* Vitals Recorded */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              Triage Kiosk Recorded Vitals
            </h3>
            <div className="grid grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block text-[10px]">Blood Pressure</span>
                <strong className="font-mono">{ticket.intake.vitals.bloodPressureSystolic || '--'}/{ticket.intake.vitals.bloodPressureDiastolic || '--'} mmHg</strong>
              </div>
              <div className="p-2 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block text-[10px]">Heart Rate</span>
                <strong className="font-mono">{ticket.intake.vitals.heartRate || '--'} bpm</strong>
              </div>
              <div className="p-2 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block text-[10px]">SpO2 Saturation</span>
                <strong className="font-mono">{ticket.intake.vitals.spO2 || '--'}%</strong>
              </div>
              <div className="p-2 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block text-[10px]">Temperature</span>
                <strong className="font-mono">{ticket.intake.vitals.temperature || '--'}°F</strong>
              </div>
            </div>
          </div>

          {/* Clinical Decision Support (CDS) & Differential */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>MedNova AI Triage & Clinical Decision Support</span>
              <span className="text-[10px] text-slate-500 font-normal">Strictly Clinical Decision Support (Not autonomous)</span>
            </div>
            <div>
              <strong className="text-slate-700">Differential Considerations:</strong>{' '}
              <span className="text-slate-600">{ticket.triage.differentialConsiderations.join(', ')}</span>
            </div>
            <div>
              <strong className="text-slate-700">Recommended Diagnostic Investigations:</strong>{' '}
              <span className="text-slate-600">
                {(ticket.orderedInvestigations || ticket.triage.suggestedInvestigations).join(', ')}
              </span>
            </div>
          </div>

          {/* Doctor's Examination & Advice */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              Physician's Clinical Assessment & Prescribed Therapy
            </h3>
            <div className="min-h-[80px] p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 whitespace-pre-wrap">
              {ticket.doctorNotes || 'Routine clinical assessment performed. Medications & instructions communicated to patient.'}
            </div>
          </div>

          {/* Doctor Signature Block */}
          <div className="border-t border-slate-300 pt-6 flex justify-between items-end text-xs">
            <div className="text-slate-500">
              <p>Generated by MedNova Intelligent Clinical Intake Platform</p>
              <p className="text-[10px] italic">Verified in accordance with Indian Medical Council Regulations</p>
            </div>
            <div className="text-right space-y-1">
              <div className="h-10 border-b border-slate-400 w-48 mb-1"></div>
              <span className="font-bold text-slate-900 block">Attending Medical Officer</span>
              <span className="text-slate-500 text-[10px]">Registration No: MCI-784920</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
