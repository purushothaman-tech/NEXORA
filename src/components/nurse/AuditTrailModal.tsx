import React, { useState } from 'react';
import { History, X, Search, ShieldCheck, Filter, ArrowRight } from 'lucide-react';
import { AuditLogEntry } from '../../types/mednova';
import { SourceBadge } from '../common/SourceBadge';

interface AuditTrailModalProps {
  logs: AuditLogEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  logs,
  isOpen,
  onClose,
}) => {
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (filterRole !== 'all' && log.userRole !== filterRole) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.patientName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.patientId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        id="audit-trail-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <History className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Clinical Intake & Triage Audit Trail</h3>
              <p className="text-xs text-slate-400">
                Tamper-evident record of all patient data modifications, re-triages, and ABHA linkings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by patient, nurse, doctor or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-600 font-semibold">Role:</span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-white border border-slate-300 text-xs rounded-lg px-2.5 py-1.5 font-medium outline-none"
            >
              <option value="all">All Roles</option>
              <option value="nurse">Nurse / Caregiver</option>
              <option value="doctor">Doctor / AYUSH</option>
              <option value="patient">Patient Self-Entry</option>
              <option value="admin">Hospital Admin</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              No audit entries matching filter criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-slate-300 transition-shadow shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="font-bold text-xs text-slate-900">{log.action}</span>
                      <SourceBadge source={log.source} size="sm" />
                    </div>

                    <div className="text-xs text-slate-600 flex items-center space-x-2">
                      <span className="font-semibold text-slate-800">{log.patientName}</span>
                      <span className="text-slate-400 font-mono text-[11px]">({log.patientId})</span>
                      <span>•</span>
                      <span className="text-slate-700">Modified by: <strong className="text-teal-800">{log.userName}</strong> ({log.userRole.toUpperCase()})</span>
                    </div>

                    {(log.previousValue || log.newValue) && (
                      <div className="mt-1.5 flex items-center space-x-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200">
                        {log.previousValue && (
                          <span className="text-rose-700 line-through">
                            {log.previousValue}
                          </span>
                        )}
                        {log.previousValue && log.newValue && (
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        )}
                        {log.newValue && (
                          <span className="text-emerald-700 font-semibold">
                            {log.newValue}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="inline-flex items-center space-x-1 text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      <span>ABDM Compliant</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between text-xs text-slate-500">
          <div>
            Total Logged Events: <span className="font-bold text-slate-800">{logs.length}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
