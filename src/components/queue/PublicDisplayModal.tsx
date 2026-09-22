import React, { useState, useEffect } from 'react';
import { Tv, X, Volume2, Clock, ShieldCheck } from 'lucide-react';
import { QueueTicket } from '../../types/mednova';
import { TRIAGE_CONFIGS } from '../../utils/triageEngine';
import { useLanguage } from '../../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../../utils/translations';

interface PublicDisplayModalProps {
  tickets: QueueTicket[];
  onClose: () => void;
}

export const PublicDisplayModal: React.FC<PublicDisplayModalProps> = ({
  tickets,
  onClose,
}) => {
  const { t, speak, speakGuidance, currentLanguage } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calledTickets = tickets.filter((t) => t.status === 'called' || t.status === 'in_consultation');
  const upcomingTickets = tickets.filter((t) => t.status === 'waiting').slice(0, 8);

  const handleTestAnnouncement = (ticket: QueueTicket) => {
    const targetLang = ticket.patient.preferredLanguage || currentLanguage.code;
    const cleanRoom = ticket.roomNumber ? ticket.roomNumber.replace(/[^0-9A-Za-z]/g, '') : '204';
    speakGuidance('queueCalled', {
      roomNumber: cleanRoom,
      tokenNumber: ticket.tokenNumber,
      name: ticket.patient.fullName,
    }, targetLang);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden select-none">
      
      {/* Top Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-black">
            MN
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white font-display">
              {t('app.title')} - {t('queue.openWaitingHall')}
            </h2>
            <p className="text-xs text-teal-400 font-semibold tracking-wide uppercase">
              {t('queue.liveOPD')} • {t('queue.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 font-mono text-lg font-bold text-teal-300">
            <Clock className="h-5 w-5 text-teal-400" />
            <span>{currentTime}</span>
          </div>

          <button
            type="button"
            id="btn-close-public-display"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={t('common.close')}
            aria-label={t('common.close')}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main Grid: Now Calling vs Next In Queue */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left 7 Columns: Now Serving / Active Call */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-teal-400 tracking-wider uppercase flex items-center">
              <span className="h-3 w-3 rounded-full bg-teal-400 animate-ping mr-2"></span>
              {t('queue.nowCalling')}
            </h3>
            <span className="text-xs text-slate-400 font-medium">{t('triage.deptRoom')}</span>
          </div>

          {calledTickets.length === 0 ? (
            <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-3xl flex items-center justify-center p-8 text-center text-slate-400">
              <div>
                <Tv className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                <p className="text-base font-bold">{t('queue.noPatients')}</p>
                <p className="text-xs text-slate-500">{t('queue.noPatientsDesc')}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-max overflow-y-auto">
              {calledTickets.map((ticket) => {
                const triageConfig = TRIAGE_CONFIGS[ticket.triage.level];
                return (
                  <div
                    key={ticket.id}
                    id={`public-called-${ticket.tokenNumber}`}
                    className={`p-6 rounded-3xl border-2 flex flex-col justify-between shadow-xl relative overflow-hidden ${
                      ticket.triage.level === 1
                        ? 'bg-gradient-to-br from-red-950/80 to-slate-900 border-red-500 ring-4 ring-red-500/30'
                        : 'bg-gradient-to-br from-slate-900 to-slate-800/90 border-teal-500/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-teal-500 text-slate-950">
                        {t('triage.deptRoom')}
                      </span>
                      <button
                        type="button"
                        id={`btn-announce-${ticket.tokenNumber}`}
                        onClick={() => handleTestAnnouncement(ticket)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-teal-400 transition-colors cursor-pointer"
                        title={t('triage.listenAnnouncement')}
                        aria-label={t('triage.listenAnnouncement')}
                      >
                        <Volume2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="my-4 text-center">
                      <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-white drop-shadow-md">
                        {ticket.tokenNumber}
                      </div>
                      <p className="text-base font-extrabold text-slate-200 mt-1 truncate">
                        {ticket.patient.fullName}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-700/80">
                      <div className="text-sm font-black text-teal-300 truncate">
                        {ticket.department}
                      </div>
                      <div className="text-xs font-bold text-white/90">
                        {ticket.roomNumber}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 5 Columns: Next In Queue */}
        <div className="lg:col-span-5 flex flex-col space-y-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold text-slate-300 tracking-wider uppercase">
              {t('queue.activeQueueTitle')}
            </h3>
            <span className="text-xs text-teal-400 font-bold">{upcomingTickets.length} {t('queue.totalWaiting')}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {upcomingTickets.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                {t('queue.noPatients')}
              </div>
            ) : (
              upcomingTickets.map((ticket, idx) => {
                const triageConfig = TRIAGE_CONFIGS[ticket.triage.level];
                return (
                  <div
                    key={ticket.id}
                    className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between hover:bg-slate-700/60 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="h-7 w-7 rounded-lg bg-slate-950 font-mono text-xs font-bold flex items-center justify-center text-teal-400 border border-slate-700">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-base font-black font-mono text-white tracking-wide">
                          {ticket.tokenNumber}
                        </div>
                        <p className="text-xs text-slate-400 font-medium truncate max-w-[160px]">
                          {ticket.patient.fullName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase mb-1"
                        style={{
                          backgroundColor: triageConfig.bgLight,
                          color: triageConfig.color,
                        }}
                      >
                        Level {ticket.triage.level}
                      </span>
                      <p className="text-xs font-bold text-slate-300">
                        {ticket.department.split('&')[0]}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Bottom Hospital Ticker */}
      <div className="bg-teal-950 border-t border-teal-800 px-6 py-2.5 flex items-center justify-between text-xs text-teal-200">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-4 w-4 text-teal-400 shrink-0" />
          <span>
            {t('emergency.bannerTitle')}
          </span>
        </div>
        <span className="font-mono text-teal-300 hidden md:inline">
          {t('app.subtitle')}
        </span>
      </div>

    </div>
  );
};
