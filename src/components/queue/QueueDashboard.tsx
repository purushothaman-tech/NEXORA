import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Volume2, 
  Clock, 
  AlertCircle, 
  Stethoscope, 
  Tv, 
  ChevronRight,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import { QueueTicket } from '../../types/mednova';
import { TRIAGE_CONFIGS, DEPARTMENT_LIST } from '../../utils/triageEngine';
import { useLanguage } from '../../context/LanguageContext';

interface QueueDashboardProps {
  tickets: QueueTicket[];
  onUpdateTicketStatus: (ticketId: string, newStatus: QueueTicket['status']) => void;
  onSelectTicketForDoctor: (ticket: QueueTicket) => void;
  onOpenPublicDisplay: () => void;
  onOpenLinkAbha?: (ticket: QueueTicket) => void;
  onOpenReTriage?: (ticket: QueueTicket) => void;
}

export const QueueDashboard: React.FC<QueueDashboardProps> = ({
  tickets,
  onUpdateTicketStatus,
  onSelectTicketForDoctor,
  onOpenPublicDisplay,
  onOpenLinkAbha,
  onOpenReTriage,
}) => {
  const { t, speak, speakGuidance, currentLanguage } = useLanguage();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedTriageLevel, setSelectedTriageLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'time'>('priority');

  // Filter and sort tickets
  const filteredTickets = tickets.filter((ticket) => {
    if (selectedDepartment !== 'all' && ticket.department !== selectedDepartment) {
      return false;
    }
    if (selectedTriageLevel !== 'all' && ticket.triage.level !== parseInt(selectedTriageLevel)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ticket.patient.fullName.toLowerCase().includes(q);
      const matchToken = ticket.tokenNumber.toLowerCase().includes(q);
      const matchAbha = (ticket.patient.abhaId || '').toLowerCase().includes(q);
      const matchComplaint = ticket.intake.chiefComplaint.toLowerCase().includes(q);
      return matchName || matchToken || matchAbha || matchComplaint;
    }
    return true;
  });

  // Sorting
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortBy === 'priority') {
      // Level 1 always first, then highest priorityRank
      if (a.triage.level !== b.triage.level) {
        return a.triage.level - b.triage.level;
      }
      return b.priorityRank - a.priorityRank;
    } else {
      // By wait time (creation time)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });

  // Quick stats
  const waitingTickets = tickets.filter((t) => t.status === 'waiting' || t.status === 'called');
  const emergencyCount = tickets.filter((t) => t.triage.level === 1 && t.status !== 'completed').length;
  const urgentCount = tickets.filter((t) => t.triage.level === 2 && t.status !== 'completed').length;

  const handleCallPatient = (ticket: QueueTicket) => {
    onUpdateTicketStatus(ticket.id, 'called');
    // Speaks announcement in patient's selected language
    // e.g. Tamil: "உங்கள் முறை வந்துவிட்டது. தயவுசெய்து அறை எண் 204க்கு செல்லவும்."
    // e.g. English: "Your turn is now. Please proceed to Room 204."
    const cleanRoom = ticket.roomNumber ? ticket.roomNumber.replace(/[^0-9A-Za-z]/g, '') : '204';
    speakGuidance('queueCalled', {
      roomNumber: cleanRoom,
      tokenNumber: ticket.tokenNumber,
      name: ticket.patient.fullName,
    }, ticket.patient.preferredLanguage);
  };

  const getWaitMinutes = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return Math.max(1, Math.floor(diff / 60000));
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Header & Public Screen Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
              {t('nav.queue')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
              {t('queue.liveOPD')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('queue.subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            id="btn-open-public-display"
            onClick={onOpenPublicDisplay}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer whitespace-nowrap"
            title={t('queue.openWaitingHall')}
            aria-label={t('queue.openWaitingHall')}
          >
            <Tv className="h-4 w-4 text-teal-400 shrink-0" />
            <span>{t('queue.openWaitingHall')}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {t('queue.totalWaiting')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{waitingTickets.length}</div>
          <span className="text-[11px] text-teal-600 font-semibold mt-1 block">
            {t('queue.activeOPDs')}
          </span>
        </div>

        <div className="bg-red-50/40 p-4 sm:p-5 rounded-2xl border border-red-200 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider block flex items-center">
            <ShieldAlert className="h-3.5 w-3.5 mr-1 shrink-0" /> {t('queue.p1Emergency')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-red-600 mt-2">{emergencyCount}</div>
          <span className="text-[11px] text-red-500 font-semibold mt-1 block">
            {t('queue.immediateBedside')}
          </span>
        </div>

        <div className="bg-amber-50/40 p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
            {t('queue.p2Urgent')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-2">{urgentCount}</div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
            {t('queue.urgentWindow')}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {t('queue.avgWaitTime')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            18 <span className="text-sm font-normal text-slate-500">{t('triage.mins')}</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {t('queue.optimalFlow')}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              id="input-search-queue"
              placeholder={t('queue.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none"
            />
          </div>

          {/* Department Filter, Triage Level Filter & Sort */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
            <select
              id="select-department-filter"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="h-10 text-xs sm:text-sm font-semibold px-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 cursor-pointer flex-1 sm:flex-none"
              aria-label={t('queue.allDepartments')}
            >
              <option value="all">{t('queue.allDepartments')} ({tickets.length})</option>
              {DEPARTMENT_LIST.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Triage Level Filter */}
            <select
              id="select-triage-filter"
              value={selectedTriageLevel}
              onChange={(e) => setSelectedTriageLevel(e.target.value)}
              className="h-10 text-xs sm:text-sm font-semibold px-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 cursor-pointer flex-1 sm:flex-none"
              aria-label={t('queue.allTriageLevels')}
            >
              <option value="all">{t('queue.allTriageLevels')}</option>
              <option value="1">Priority 1 ({t('triage.levels.l1Title')})</option>
              <option value="2">Priority 2 ({t('triage.levels.l2Title')})</option>
              <option value="3">Priority 3 ({t('triage.levels.l3Title')})</option>
              <option value="4">Priority 4 ({t('triage.levels.l4Title')})</option>
            </select>

            {/* Sort Toggle */}
            <button
              type="button"
              id="btn-sort-queue"
              onClick={() => setSortBy(sortBy === 'priority' ? 'time' : 'priority')}
              className="h-10 flex items-center justify-center space-x-1.5 px-3.5 text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0 whitespace-nowrap cursor-pointer border border-slate-200"
              title={sortBy === 'priority' ? t('queue.sortByPriority') : t('queue.sortByWait')}
              aria-label={sortBy === 'priority' ? t('queue.sortByPriority') : t('queue.sortByWait')}
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
              <span>{sortBy === 'priority' ? t('queue.sortByPriority') : t('queue.sortByWait')}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Queue Table / Card List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-teal-600 shrink-0" />
            <h3 className="font-bold text-sm text-slate-900">
              {t('queue.activeQueueTitle')} ({sortedTickets.length} {t('queue.patients')})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {t('queue.queueDisclaimer')}
          </span>
        </div>

        {sortedTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Users className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-sm">{t('queue.noPatients')}</p>
            <p className="text-xs text-slate-400">{t('queue.noPatientsDesc')}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedTickets.map((ticket, index) => {
              const triageConfig = TRIAGE_CONFIGS[ticket.triage.level];
              const waitMins = getWaitMinutes(ticket.createdAt);

              return (
                <div
                  key={ticket.id}
                  id={`queue-row-${ticket.tokenNumber}`}
                  className={`p-4 sm:p-5 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                    ticket.triage.level === 1
                      ? 'bg-red-50/40 hover:bg-red-50/70 border-l-4 border-l-red-600'
                      : ticket.status === 'called'
                      ? 'bg-teal-50/40 hover:bg-teal-50/70 border-l-4 border-l-teal-600'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Left Column: Token Badge & Patient Info */}
                  <div className="flex items-start space-x-3 sm:space-x-4 min-w-0 flex-1 w-full lg:w-auto">
                    
                    {/* Token Pill - prevents awkward line wrapping */}
                    <div className="flex flex-col items-center justify-center h-14 min-w-[4.75rem] sm:min-w-[5.5rem] px-2.5 py-1 rounded-2xl bg-slate-900 text-white shrink-0 shadow-xs">
                      <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">
                        #{index + 1}
                      </span>
                      <span className={`font-black font-mono tracking-tight whitespace-nowrap ${
                        ticket.tokenNumber.length > 7 ? 'text-xs sm:text-sm' : 'text-base sm:text-lg'
                      }`}>
                        {ticket.tokenNumber}
                      </span>
                    </div>

                    {/* Patient Core Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                          {ticket.patient.fullName}
                        </h4>
                        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                          ({ticket.patient.age}y / {ticket.patient.gender})
                        </span>

                        {/* Triage Priority Badge */}
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold whitespace-nowrap"
                          style={{
                            backgroundColor: triageConfig.bgLight,
                            color: triageConfig.color,
                          }}
                        >
                          Level {ticket.triage.level} • {triageConfig.code}
                        </span>

                        {/* Status Pill */}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                          ticket.status === 'called'
                            ? 'bg-sky-100 text-sky-800 animate-pulse'
                            : ticket.status === 'in_consultation'
                            ? 'bg-indigo-100 text-indigo-800'
                            : ticket.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {ticket.status === 'called'
                            ? t('queue.nowCalling')
                            : ticket.status === 'waiting'
                            ? t('queue.waitedLabel')
                            : ticket.status === 'in_consultation'
                            ? t('triage.evaluating')
                            : ticket.status.toUpperCase()}
                        </span>

                        {/* Guest / Temporary Status Badge */}
                        {ticket.patient.isGuest && (
                          <span className="inline-flex items-center bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-2xs whitespace-nowrap">
                            GUEST / TEMPORARY
                          </span>
                        )}

                        {/* Nurse Assisted Tag */}
                        {(ticket.nurseAssisted || ticket.intake.nurseAssisted) && (
                          <span className="inline-flex items-center bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                            Nurse Assisted
                          </span>
                        )}

                        {/* AYUSH Prakriti Tag */}
                        {ticket.intake.ayushPrakriti && (
                          <span className="inline-flex items-center bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                            AYUSH: {ticket.intake.ayushPrakriti.dominantPrakriti}
                          </span>
                        )}

                        {/* Re-Triage Alert */}
                        {ticket.reTriageHistory && ticket.reTriageHistory.length > 0 && (
                          <span 
                            title={`Re-triaged by ${ticket.reTriageHistory[ticket.reTriageHistory.length - 1].nurseName}: ${ticket.reTriageHistory[ticket.reTriageHistory.length - 1].reason}`}
                            className="inline-flex items-center bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap"
                          >
                            Re-Triaged (L{ticket.reTriageHistory[ticket.reTriageHistory.length - 1].previousLevel} → L{ticket.reTriageHistory[ticket.reTriageHistory.length - 1].newLevel})
                          </span>
                        )}
                      </div>

                      {/* Complaint & Symptoms */}
                      <p className="text-xs text-slate-700 font-medium line-clamp-1 sm:line-clamp-2 mt-0.5">
                        <span className="text-slate-400 font-semibold">{t('queue.complaintLabel')}:</span> "{ticket.intake.chiefComplaint}"
                      </p>

                      {/* Department, Room & Wait Time Badges */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-[11px] text-slate-500">
                        <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 whitespace-nowrap">
                          {ticket.department} ({ticket.roomNumber})
                        </span>
                        <span className="flex items-center text-slate-500 whitespace-nowrap">
                          <Clock className="h-3.5 w-3.5 mr-1 text-slate-400 shrink-0" />
                          {t('queue.waitedLabel')}: {waitMins} {t('triage.mins')}
                        </span>
                        {ticket.patient.abhaId ? (
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                            ABHA: {ticket.patient.abhaId}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenLinkAbha && onOpenLinkAbha(ticket)}
                            className="text-[10px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-300 px-2 py-0.5 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                          >
                            + Link ABHA
                          </button>
                        )}
                        {ticket.patient.temporaryId && (
                          <span className="font-mono text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded whitespace-nowrap">
                            Temp ID: {ticket.patient.temporaryId}
                          </span>
                        )}
                        {ticket.triage.redFlags && ticket.triage.redFlags.length > 0 && (
                          <span className="text-red-600 font-bold flex items-center whitespace-nowrap">
                            <AlertCircle className="h-3.5 w-3.5 mr-1 shrink-0" />
                            {ticket.triage.redFlags[0]}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Action Buttons */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 self-stretch lg:self-center justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 w-full lg:w-auto">
                    {onOpenReTriage && (
                      <button
                        type="button"
                        id={`btn-retriage-${ticket.tokenNumber}`}
                        onClick={() => onOpenReTriage(ticket)}
                        className="h-9 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap cursor-pointer"
                        title="Re-Triage"
                        aria-label="Re-Triage"
                      >
                        Re-Triage
                      </button>
                    )}
                    
                    {/* Voice Announcement Button */}
                    <button
                      id={`btn-call-voice-${ticket.tokenNumber}`}
                      type="button"
                      onClick={() => handleCallPatient(ticket)}
                      className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 hover:border-teal-300 transition-colors shrink-0 cursor-pointer"
                      title={`${t('triage.listenAnnouncement')} (${currentLanguage.nativeName})`}
                      aria-label={`${t('triage.listenAnnouncement')} (${currentLanguage.nativeName})`}
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>

                    {/* Start Consultation / Mark Done / Call */}
                    {ticket.status === 'waiting' && (
                      <button
                        type="button"
                        id={`btn-call-patient-${ticket.tokenNumber}`}
                        onClick={() => handleCallPatient(ticket)}
                        className="h-9 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                        title={t('queue.callPatient')}
                        aria-label={t('queue.callPatient')}
                      >
                        {t('queue.callPatient')}
                      </button>
                    )}

                    {ticket.status === 'called' && (
                      <button
                        type="button"
                        id={`btn-start-consult-${ticket.tokenNumber}`}
                        onClick={() => onUpdateTicketStatus(ticket.id, 'in_consultation')}
                        className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                        title={t('queue.startConsult')}
                        aria-label={t('queue.startConsult')}
                      >
                        {t('queue.startConsult')}
                      </button>
                    )}

                    {ticket.status === 'in_consultation' && (
                      <button
                        type="button"
                        id={`btn-complete-visit-${ticket.tokenNumber}`}
                        onClick={() => onUpdateTicketStatus(ticket.id, 'completed')}
                        className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                        title={t('queue.completeVisit')}
                        aria-label={t('queue.completeVisit')}
                      >
                        {t('queue.completeVisit')}
                      </button>
                    )}

                    {/* Open in Doctor Workstation - Queue Review */}
                    <button
                      type="button"
                      id={`btn-review-doctor-${ticket.tokenNumber}`}
                      onClick={() => onSelectTicketForDoctor(ticket)}
                      className="h-9 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0 whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                      title={t('queue.review')}
                      aria-label={t('queue.review')}
                    >
                      <Stethoscope className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                      <span>{t('queue.review')}</span>
                      <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
