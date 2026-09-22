import React from 'react';
import { 
  Activity, 
  Users, 
  Stethoscope, 
  BarChart3, 
  Languages, 
  Volume2, 
  VolumeX, 
  ShieldAlert,
  Hospital,
  HeartHandshake,
  FileSpreadsheet,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { SupportedLanguage } from '../../types/mednova';

interface HeaderProps {
  currentTab: 'intake' | 'queue' | 'doctor' | 'analytics';
  onTabChange: (tab: 'intake' | 'queue' | 'doctor' | 'analytics') => void;
  waitingCount: number;
  emergencyCount: number;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  cloudSyncStatus?: 'connected' | 'reconnecting' | 'synced';
  isNurseActive?: boolean;
  nurseName?: string;
  onOpenNurseModal?: () => void;
  onOpenAuditTrail?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  waitingCount,
  emergencyCount,
  audioEnabled,
  onToggleAudio,
  cloudSyncStatus = 'connected',
  isNurseActive = false,
  nurseName,
  onOpenNurseModal,
  onOpenAuditTrail,
}) => {
  const { language, setLanguage, supportedLanguages, currentLanguage, t, openLanguageModal, autoVoiceGuidance, toggleAutoVoiceGuidance } = useLanguage();
  const { user, staffProfile, signInWithGoogle, signOutUser, loading: authLoading } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer min-w-0 shrink" onClick={() => onTabChange('intake')}>
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 shrink-0">
              <Activity className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display truncate">
                  Med<span className="text-teal-600">Nova</span>
                </span>
                <span className="inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 truncate">
                  ABDM Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                {t('app.tagline')}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80">
            <button
              type="button"
              id="nav-tab-intake"
              onClick={() => onTabChange('intake')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                currentTab === 'intake'
                  ? 'bg-white text-teal-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Hospital className="h-4 w-4 text-teal-600" />
              <span>{t('nav.intake')}</span>
            </button>

            <button
              type="button"
              id="nav-tab-queue"
              onClick={() => onTabChange('queue')}
              className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                currentTab === 'queue'
                  ? 'bg-white text-teal-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="h-4 w-4 text-sky-600" />
              <span>{t('nav.queue')}</span>
              {waitingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-teal-100 text-teal-800 font-bold">
                  {waitingCount}
                </span>
              )}
            </button>

            <button
              type="button"
              id="nav-tab-doctor"
              onClick={() => onTabChange('doctor')}
              className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                currentTab === 'doctor'
                  ? 'bg-white text-teal-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Stethoscope className="h-4 w-4 text-indigo-600" />
              <span>{t('nav.doctor')}</span>
              {emergencyCount > 0 && (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </button>

            <button
              type="button"
              id="nav-tab-analytics"
              onClick={() => onTabChange('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                currentTab === 'analytics'
                  ? 'bg-white text-teal-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              <span>{t('nav.analytics')}</span>
            </button>
          </nav>

          {/* Right Controls: Emergency Counter, Sound Toggle, Language Dropdown & Change Language Button */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 ml-2">
            
            {/* Red Alert Pill if Emergency Present */}
            {emergencyCount > 0 && (
              <div 
                onClick={() => onTabChange('queue')} 
                className="cursor-pointer flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 animate-pulse text-xs font-bold"
                title="Patients requiring immediate resuscitation"
              >
                <ShieldAlert className="h-4 w-4 text-red-600" />
                <span>{emergencyCount} {t('common.critical')}</span>
              </div>
            )}

            {/* Cloud Sync Status Indicator */}
            {cloudSyncStatus === 'reconnecting' ? (
              <div 
                className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium"
                title="Preserving local clinical queue. Attempting background Firestore reconnect..."
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                <span>Sync Reconnecting...</span>
              </div>
            ) : (
              <div 
                className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200 text-xs font-medium"
                title="Real-time Firestore clinical queue synchronized"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Cloud Synced</span>
              </div>
            )}

            {/* Audio Toggle (Voice Guidance TTS) */}
            <button
              type="button"
              id="btn-toggle-audio"
              onClick={toggleAutoVoiceGuidance}
              className={`p-2 rounded-lg border transition-colors cursor-pointer hidden md:flex ${
                autoVoiceGuidance 
                  ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100' 
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
              }`}
              title={autoVoiceGuidance ? 'Voice Guidance: ON (TTS announcements). Microphone is independent.' : 'Voice Guidance: OFF (TTS announcements muted). Microphone remains active.'}
              aria-label={autoVoiceGuidance ? 'Voice Guidance: ON (TTS announcements)' : 'Voice Guidance: OFF (TTS announcements muted)'}
            >
              {autoVoiceGuidance ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Caregiving Mode Button */}
            {onOpenNurseModal && (
              <button
                type="button"
                id="btn-caregiving-mode"
                onClick={onOpenNurseModal}
                className={`hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  isNurseActive
                    ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/30'
                    : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border-slate-200 hover:border-amber-300'
                }`}
                title="Nurse / Caregiver Mode"
                aria-label="Nurse / Caregiver Mode"
              >
                <HeartHandshake className={`h-4 w-4 ${isNurseActive ? 'text-amber-700' : 'text-slate-500'}`} />
                <span>{isNurseActive ? (nurseName ? nurseName.split(',')[0] : 'Nurse Active') : 'Caregiver Mode'}</span>
              </button>
            )}

            {/* Audit Trail Button */}
            {onOpenAuditTrail && (
              <button
                type="button"
                id="btn-audit-trail"
                onClick={onOpenAuditTrail}
                className="hidden xl:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                title="ABDM Clinical Audit Trail"
                aria-label="ABDM Clinical Audit Trail"
              >
                <FileSpreadsheet className="h-4 w-4 text-slate-500" />
                <span>Audit Log</span>
              </button>
            )}

            {/* Firebase Auth Staff Profile / Google Sign-In */}
            {user ? (
              <div className="flex items-center space-x-2 pl-1 border-l border-slate-200">
                <div 
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold"
                  title={`Logged in as ${staffProfile?.displayName || user.displayName || user.email} (${staffProfile?.role || 'Staff'})`}
                >
                  <div className="h-6 w-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="hidden xl:block text-left leading-tight">
                    <p className="font-bold text-[11px] truncate max-w-[120px]">
                      {staffProfile?.displayName || user.displayName || 'Staff'}
                    </p>
                    <p className="text-[9px] text-teal-600 uppercase font-black tracking-wider">
                      {staffProfile?.isAdmin ? 'Chief Medical Officer' : (staffProfile?.role || 'Doctor')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-sign-out"
                  onClick={signOutUser}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                  title="Sign out of hospital account"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="btn-google-sign-in"
                onClick={signInWithGoogle}
                disabled={authLoading}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                title="Sign in with Google to access doctor workstation and medical verification"
              >
                <LogIn className="h-3.5 w-3.5 text-teal-400" />
                <span>Staff Sign In</span>
              </button>
            )}

            {/* Multilingual Selector with Quick Dropdown + Modal Opener */}
            <div className="flex items-center space-x-1.5">
              <div className="relative flex items-center bg-white border border-slate-300 rounded-lg px-2.5 py-1 shadow-xs hover:border-teal-500 transition-colors shrink-0">
                <Languages className="h-4 w-4 text-teal-600 mr-1.5 shrink-0" />
                <select
                  id="language-select-dropdown"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-hidden cursor-pointer w-24 sm:w-auto truncate"
                  aria-label="Select Language"
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Accessible "Change Language" Button */}
              <button
                type="button"
                id="btn-open-language-modal"
                onClick={openLanguageModal}
                className="hidden lg:inline-flex items-center px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                title="Open accessible language selector"
                aria-label="Open accessible language selector"
              >
                <span className="mr-1">🌐</span>
                {t('nav.changeLanguage')}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-start sm:justify-around gap-2 px-2 py-2 border-t border-slate-100 overflow-x-auto no-scrollbar w-full">
          <button
            type="button"
            id="mobile-nav-tab-intake"
            onClick={() => onTabChange('intake')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer ${
              currentTab === 'intake' ? 'bg-teal-600 text-white' : 'text-slate-600'
            }`}
          >
            {t('nav.intake')}
          </button>
          <button
            type="button"
            id="mobile-nav-tab-queue"
            onClick={() => onTabChange('queue')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer ${
              currentTab === 'queue' ? 'bg-teal-600 text-white' : 'text-slate-600'
            }`}
          >
            {t('nav.queue')} ({waitingCount})
          </button>
          <button
            type="button"
            id="mobile-nav-tab-doctor"
            onClick={() => onTabChange('doctor')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer ${
              currentTab === 'doctor' ? 'bg-teal-600 text-white' : 'text-slate-600'
            }`}
          >
            {t('nav.doctor')}
          </button>
          <button
            type="button"
            id="mobile-nav-tab-analytics"
            onClick={() => onTabChange('analytics')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer ${
              currentTab === 'analytics' ? 'bg-teal-600 text-white' : 'text-slate-600'
            }`}
          >
            {t('nav.analytics')}
          </button>
        </div>

      </div>
    </header>
  );
};
