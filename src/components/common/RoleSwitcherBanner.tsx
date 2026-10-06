import React from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Briefcase, User, RefreshCw, Sparkles, Scale } from 'lucide-react';

export const RoleSwitcherBanner: React.FC = () => {
  const { currentUser, switchRole, users, resetToDefaults } = useApp();

  const adminUser = users.find((u) => u.role === 'admin');
  const lawyerCorporate = users.find((u) => u.id === 'u-lawyer-1');
  const lawyerIP = users.find((u) => u.id === 'u-lawyer-3');
  const clientCorp = users.find((u) => u.id === 'u-client-1');
  const clientIndiv = users.find((u) => u.id === 'u-client-2');

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-amber-900/40 text-xs px-3 sm:px-6 py-2">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Environment badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium border border-amber-500/30">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>LCMS Role Testing Bar</span>
          </div>
          <span className="text-slate-400 hidden sm:inline">
            Active: <strong className="text-white">{currentUser?.name || 'Guest'}</strong> (
            <span className="capitalize text-amber-300 font-semibold">{currentUser?.role || 'Guest'}</span>)
          </span>
        </div>

        {/* Center: Quick Role Switchers */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-slate-400 text-[11px] hidden md:inline">Switch Role:</span>

          <button
            onClick={() => switchRole('admin', adminUser?.id)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 ${
              currentUser?.role === 'admin'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Managing Partner & System Administrator"
          >
            <Shield className="w-3 h-3" />
            <span>Admin (Jonathan)</span>
          </button>

          <button
            onClick={() => switchRole('lawyer', lawyerIP?.id)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 ${
              currentUser?.id === lawyerIP?.id
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Senior IP & Litigation Counsel"
          >
            <Briefcase className="w-3 h-3" />
            <span>Lawyer (Sophia - IP)</span>
          </button>

          <button
            onClick={() => switchRole('lawyer', lawyerCorporate?.id)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 ${
              currentUser?.id === lawyerCorporate?.id
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Senior Corporate Partner"
          >
            <Briefcase className="w-3 h-3" />
            <span>Lawyer (Evelyn - Corp)</span>
          </button>

          <button
            onClick={() => switchRole('client', clientCorp?.id)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 ${
              currentUser?.id === clientCorp?.id
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Corporate Client (Apex Robotics)"
          >
            <User className="w-3 h-3" />
            <span>Client (Alexander)</span>
          </button>

          <button
            onClick={() => switchRole('client', clientIndiv?.id)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 ${
              currentUser?.id === clientIndiv?.id
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Individual Client (Sarah Jenkins)"
          >
            <User className="w-3 h-3" />
            <span>Client (Sarah)</span>
          </button>
        </div>

        {/* Right: Reset Data */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Reset sample cases, applications, and documents to default state?')) {
                resetToDefaults();
              }
            }}
            className="text-slate-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 transition text-[11px]"
            title="Reset localStorage seed state"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
