import React from 'react';
import { AlertOctagon, ArrowRight, PhoneCall } from 'lucide-react';
import { QueueTicket } from '../../types/mednova';
import { useLanguage } from '../../context/LanguageContext';

interface EmergencyBannerProps {
  emergencyTickets: QueueTicket[];
  onReviewTicket: (ticket: QueueTicket) => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  emergencyTickets,
  onReviewTicket,
}) => {
  const { t } = useLanguage();

  if (emergencyTickets.length === 0) return null;

  const topEmergency = emergencyTickets[0];

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg border-b border-red-800 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0 animate-bounce">
              <AlertOctagon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm tracking-wide uppercase bg-black/20 px-2 py-0.5 rounded-sm">
                  {t('emergency.title')}
                </span>
                <span className="text-xs bg-white/25 text-white px-2 py-0.5 rounded-full font-semibold">
                  #{topEmergency.tokenNumber}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-red-50 mt-0.5 line-clamp-1">
                <span className="font-bold">{topEmergency.patient.fullName}</span> ({topEmergency.patient.age}y/{topEmergency.patient.gender}) — {topEmergency.triage.priorityRationale}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
            <span className="hidden md:flex items-center text-xs font-semibold bg-red-800/60 px-2.5 py-1 rounded-md border border-red-500/50">
              <PhoneCall className="h-3.5 w-3.5 mr-1.5" />
              {t('emergency.callER')}: 108 / Ext 444
            </span>
            <button
              id="btn-review-emergency-ticket"
              onClick={() => onReviewTicket(topEmergency)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white text-red-700 hover:bg-red-50 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <span>{t('emergency.reviewStat')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
