import React from 'react';
import { Mic, Touchpad, FileText, UserCheck, Stethoscope, Edit3 } from 'lucide-react';
import { InformationSource } from '../../types/mednova';

interface SourceBadgeProps {
  source?: InformationSource | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ 
  source = 'PATIENT_VOICE', 
  size = 'sm',
  className = '' 
}) => {
  const getSourceConfig = (src: string) => {
    switch (src) {
      case 'PATIENT_VOICE':
        return {
          label: 'Patient Voice',
          icon: Mic,
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        };
      case 'PATIENT_TOUCH':
        return {
          label: 'Patient Touch',
          icon: Touchpad,
          bg: 'bg-teal-50 border-teal-200 text-teal-700',
        };
      case 'PATIENT_TEXT':
        return {
          label: 'Patient Text',
          icon: Edit3,
          bg: 'bg-cyan-50 border-cyan-200 text-cyan-700',
        };
      case 'NURSE_ASSISTED':
        return {
          label: 'Nurse Assisted',
          icon: UserCheck,
          bg: 'bg-amber-50 border-amber-300 text-amber-800 font-semibold',
        };
      case 'DOCUMENT_OCR':
        return {
          label: 'Document OCR',
          icon: FileText,
          bg: 'bg-blue-50 border-blue-200 text-blue-700',
        };
      case 'PRACTITIONER_ENTERED':
        return {
          label: 'Doctor Entered',
          icon: Stethoscope,
          bg: 'bg-purple-50 border-purple-200 text-purple-700',
        };
      default:
        return {
          label: 'Patient Response',
          icon: Touchpad,
          bg: 'bg-slate-50 border-slate-200 text-slate-700',
        };
    }
  };

  const config = getSourceConfig(source);
  const Icon = config.icon;

  const isSmall = size === 'sm';

  return (
    <span
      id={`source-badge-${source.toLowerCase()}`}
      className={`inline-flex items-center space-x-1 border rounded-md font-mono tracking-tight transition-colors ${
        isSmall ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1'
      } ${config.bg} ${className}`}
      title={`Information Source: ${config.label}`}
    >
      <Icon className={isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};
