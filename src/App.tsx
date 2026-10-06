import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RoleSwitcherBanner } from './components/common/RoleSwitcherBanner';
import { Navbar } from './components/common/Navbar';
import { AuthModal } from './components/common/AuthModal';
import { NotificationsModal } from './components/common/NotificationsModal';
import { PublicWebsite } from './components/public/PublicWebsite';
import { ApplyCaseView } from './components/client/ApplyCaseView';
import { ClientDashboard } from './components/client/ClientDashboard';
import { LawyerDashboard } from './components/lawyer/LawyerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Lock, ArrowRight, ShieldCheck, Scale } from 'lucide-react';
import { UserRole } from './types';

const MainLayout: React.FC = () => {
  const { currentUser } = useApp();
  const [activeView, setActiveView] = useState<'public' | 'dashboard' | 'apply'>('public');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<UserRole>('client');
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [targetedCaseId, setTargetedCaseId] = useState<string | null>(null);

  const handleOpenAuth = (mode: 'login' | 'register', role?: UserRole) => {
    setAuthModalMode(mode);
    if (role) setAuthModalRole(role);
    setAuthModalOpen(true);
  };

  const handleSelectCaseFromNotif = (caseId: string) => {
    setTargetedCaseId(caseId);
    setActiveView('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* 1. Instant Role Testing Bar */}
      <RoleSwitcherBanner />

      {/* 2. Top Navigation Bar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAuth={handleOpenAuth}
        onOpenNotifications={() => setNotificationsModalOpen(true)}
      />

      {/* 3. Main Views */}
      <main className="flex-1">
        {activeView === 'public' && (
          <PublicWebsite
            onOpenApply={() => setActiveView('apply')}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeView === 'apply' && (
          <ApplyCaseView
            onSuccessNavigate={() => setActiveView('dashboard')}
          />
        )}

        {activeView === 'dashboard' && (
          <>
            {!currentUser ? (
              <div className="max-w-md mx-auto py-24 px-4 text-center animate-fadeIn">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg border border-slate-800">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Portal Authentication Required</h2>
                <p className="text-xs text-slate-600 mb-6">
                  Please sign in or select a demo role profile above to access confidential case files and attorney workspaces.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs transition"
                  >
                    Sign In to Portal
                  </button>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition"
                  >
                    Register Account
                  </button>
                </div>
              </div>
            ) : currentUser.role === 'admin' ? (
              <AdminDashboard onSelectCase={handleSelectCaseFromNotif} />
            ) : currentUser.role === 'lawyer' ? (
              <LawyerDashboard selectedCaseId={targetedCaseId} />
            ) : (
              <ClientDashboard
                selectedCaseId={targetedCaseId}
                onOpenApply={() => setActiveView('apply')}
              />
            )}
          </>
        )}
      </main>

      {/* 4. Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        defaultRole={authModalRole}
      />

      <NotificationsModal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
        onSelectCase={handleSelectCaseFromNotif}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
