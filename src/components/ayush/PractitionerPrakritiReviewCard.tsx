import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Edit3, 
  ShieldCheck, 
  FileText, 
  Wind, 
  Flame, 
  Droplets,
  AlertCircle,
  Plus
} from 'lucide-react';
import { PrakritiAssessment, QueueTicket } from '../../types/mednova';
import { SourceBadge } from '../common/SourceBadge';

interface PractitionerPrakritiReviewCardProps {
  ticket: QueueTicket;
  onUpdateAssessment: (updatedAssessment: PrakritiAssessment) => void;
  onStartAssessment?: () => void;
}

export const PractitionerPrakritiReviewCard: React.FC<PractitionerPrakritiReviewCardProps> = ({
  ticket,
  onUpdateAssessment,
  onStartAssessment,
}) => {
  const prakriti = ticket.intake.ayushPrakriti;

  const [isEditing, setIsEditing] = useState(false);
  const [practitionerNotes, setPractitionerNotes] = useState(
    prakriti?.practitionerReview.practitionerNotes || ''
  );
  const [verifiedDosha, setVerifiedDosha] = useState(
    prakriti?.practitionerReview.verifiedPrakriti || prakriti?.dominantPrakriti || 'Vata-Pitta'
  );
  const [reviewStatus, setReviewStatus] = useState(
    prakriti?.practitionerReview.status || 'pending_review'
  );

  if (!prakriti) {
    return (
      <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-emerald-950 uppercase tracking-wider">
              AYUSH Prakriti Assessment Not Yet Recorded
            </h4>
            <p className="text-xs text-emerald-800">
              Collect structured Prakriti characteristics (Vata, Pitta, Kapha) for holistic AYUSH consultation.
            </p>
          </div>
        </div>
        {onStartAssessment && (
          <button
            type="button"
            onClick={onStartAssessment}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Initiate Assessment</span>
          </button>
        )}
      </div>
    );
  }

  const handleSaveReview = (status: 'verified' | 'accepted' | 'modified') => {
    const updated: PrakritiAssessment = {
      ...prakriti,
      practitionerReview: {
        status,
        practitionerNotes: practitionerNotes.trim(),
        verifiedPrakriti: verifiedDosha,
        reviewedBy: 'Dr. AYUSH Physician',
        reviewedAt: new Date().toISOString(),
      },
    };
    onUpdateAssessment(updated);
    setReviewStatus(status);
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-sm text-slate-900">
                AYUSH Prakriti Assessment & Clinical Validation
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                reviewStatus === 'verified' || reviewStatus === 'accepted'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {reviewStatus === 'verified' ? 'Practitioner Verified' : reviewStatus === 'accepted' ? 'Practitioner Accepted' : 'Pending Physician Review'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Confidence / Completeness: <strong className="text-emerald-700">{prakriti.completenessScore}%</strong> • Total Observations: {prakriti.responses.length}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit / Review</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveReview('verified')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify & Accept</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Proportions Breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center space-x-1 text-xs font-bold text-indigo-900 mb-1">
            <Wind className="w-3.5 h-3.5 text-indigo-600" />
            <span>Vata</span>
          </div>
          <div className="text-lg font-black text-indigo-950">{prakriti.vataScore}%</div>
        </div>

        <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center space-x-1 text-xs font-bold text-amber-900 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Pitta</span>
          </div>
          <div className="text-lg font-black text-amber-950">{prakriti.pittaScore}%</div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center space-x-1 text-xs font-bold text-emerald-900 mb-1">
            <Droplets className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kapha</span>
          </div>
          <div className="text-lg font-black text-emerald-950">{prakriti.kaphaScore}%</div>
        </div>
      </div>

      {/* Structured Answer Responses Table */}
      <div>
        <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Structured Assessment Responses ({prakriti.responses.length})
        </h5>
        <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
          {prakriti.responses.map((resp, i) => (
            <div key={resp.questionId || i} className="p-2.5 flex items-start justify-between gap-3 hover:bg-slate-50">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-800 block text-[11px]">
                  {resp.questionText}
                </span>
                <span className="text-slate-600 font-medium text-[11px]">
                  &rarr; {resp.answerLabel}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                <SourceBadge source={resp.source} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practitioner Review Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Physician Clinical Validation
          </span>
          {prakriti.practitionerReview.reviewedAt && (
            <span className="text-[10px] text-slate-400 font-mono">
              Reviewed: {new Date(prakriti.practitionerReview.reviewedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Verified Constitutional Assessment:
              </label>
              <select
                value={verifiedDosha}
                onChange={(e) => setVerifiedDosha(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
              >
                <option value="Vata-Pitta">Vata-Pitta</option>
                <option value="Pitta-Kapha">Pitta-Kapha</option>
                <option value="Vata-Kapha">Vata-Kapha</option>
                <option value="Vata Dominant">Vata Dominant</option>
                <option value="Pitta Dominant">Pitta Dominant</option>
                <option value="Kapha Dominant">Kapha Dominant</option>
                <option value="Tridoshic (Balanced)">Tridoshic (Balanced)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                AYUSH Clinical Notes & Diet Recommendations:
              </label>
              <textarea
                rows={2}
                value={practitionerNotes}
                onChange={(e) => setPractitionerNotes(e.target.value)}
                placeholder="Enter practitioner observations on Agni, Dhatu, lifestyle regimen (Pathya-Apathya)..."
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => handleSaveReview('modified')}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold"
              >
                Save Review Notes
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-700 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-slate-500">Confirmed Prakriti:</span>
              <strong className="text-emerald-800 font-bold">{prakriti.practitionerReview.verifiedPrakriti || prakriti.dominantPrakriti}</strong>
            </div>
            {prakriti.practitionerReview.practitionerNotes ? (
              <p className="italic text-slate-600 bg-white p-2 rounded border border-slate-200">
                "{prakriti.practitionerReview.practitionerNotes}"
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 italic">No physician notes added yet.</p>
            )}
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-400 italic text-center">
        Assessment for practitioner review. MedNova does not autonomously diagnose or prescribe.
      </p>
    </div>
  );
};
