import React, { useState } from 'react';
import { UserCheck, Shield, KeyRound, X, Check, HeartHandshake } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface NurseLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (nurse: { nurseId: string; nurseName: string; department: string }) => void;
}

export const NurseLoginModal: React.FC<NurseLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { t } = useLanguage();
  const [nurseId, setNurseId] = useState('RN-402');
  const [pin, setPin] = useState('1234');
  const [nurseName, setNurseName] = useState('Sister Priya Sharma, RN');
  const [department, setDepartment] = useState('Emergency & Triage OPD');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nurseId.trim()) {
      setErrorMsg('Please enter Nurse / Staff ID.');
      return;
    }
    if (!pin.trim()) {
      setErrorMsg('Please enter security PIN.');
      return;
    }

    onLoginSuccess({
      nurseId: nurseId.trim(),
      nurseName: nurseName.trim() || 'Sister Priya Sharma, RN',
      department,
    });
    onClose();
  };

  const handleQuickDemoNurse = (id: string, name: string, dept: string) => {
    setNurseId(id);
    setNurseName(name);
    setDepartment(dept);
    setPin('1234');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        id="nurse-login-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-cyan-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Caregiving Mode Authentication</h3>
              <p className="text-xs text-teal-100">Authorized Nurse & Triage Staff Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-900">
            <span className="font-bold block mb-1">Assisted Patient Operations</span>
            Allows certified staff to assist elderly, low-literacy, pediatric, or mobility-impaired patients with full source tracking.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Certified Nurse Profile
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleQuickDemoNurse('RN-402', 'Sister Priya Sharma, RN', 'Emergency & Triage OPD')}
                className={`p-2.5 text-left rounded-xl border transition-all text-xs ${
                  nurseId === 'RN-402'
                    ? 'border-teal-600 bg-teal-50/70 text-teal-900 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="font-bold text-slate-800">Priya Sharma</div>
                <div className="text-[11px] text-slate-500">RN-402 • Triage</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoNurse('RN-518', 'Staff Nurse Ananya Roy, RN', 'AYUSH & General OPD')}
                className={`p-2.5 text-left rounded-xl border transition-all text-xs ${
                  nurseId === 'RN-518'
                    ? 'border-teal-600 bg-teal-50/70 text-teal-900 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="font-bold text-slate-800">Ananya Roy</div>
                <div className="text-[11px] text-slate-500">RN-518 • AYUSH OPD</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nurse Staff ID
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                id="input-nurse-id"
                value={nurseId}
                onChange={(e) => setNurseId(e.target.value)}
                placeholder="e.g. RN-402"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Security PIN
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                id="input-nurse-pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="4-digit PIN (default 1234)"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2 font-medium">
              {errorMsg}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-confirm-nurse-login"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>Activate Caregiving Mode</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
