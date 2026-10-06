import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Scale,
  Bell,
  User,
  Shield,
  Briefcase,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  FilePlus,
  Compass,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  activeView: 'public' | 'dashboard' | 'apply';
  setActiveView: (view: 'public' | 'dashboard' | 'apply') => void;
  onOpenAuth: (mode: 'login' | 'register', role?: UserRole) => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  onOpenAuth,
  onOpenNotifications,
}) => {
  const { currentUser, logout, getUnreadNotificationsCount, switchRole } = useApp();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = getUnreadNotificationsCount();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Shield className="w-3 h-3" />
            ADMIN
          </span>
        );
      case 'lawyer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Briefcase className="w-3 h-3" />
            LEAD COUNSEL
          </span>
        );
      case 'client':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <User className="w-3 h-3" />
            CLIENT
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('public')}>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
            <Scale className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black tracking-wider text-xl text-white">LCMS</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Law System
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">Sterling Vance &amp; Thorne, LLP</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setActiveView('public')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5 ${
              activeView === 'public'
                ? 'text-amber-400 bg-slate-900 border border-amber-500/20 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Firm Website</span>
          </button>

          {currentUser && (
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5 ${
                activeView === 'dashboard'
                  ? 'text-amber-400 bg-slate-900 border border-amber-500/20 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>
                {currentUser.role === 'admin'
                  ? 'Admin Command Center'
                  : currentUser.role === 'lawyer'
                  ? 'Attorney Workspace'
                  : 'Client Case Portal'}
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveView('apply')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5 ${
              activeView === 'apply'
                ? 'text-amber-400 bg-slate-900 border border-amber-500/20 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <FilePlus className="w-4 h-4 text-amber-400" />
            <span>Apply For Case</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <>
              {/* Notifications Trigger */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                >
                  <img
                    src={
                      currentUser.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
                    }
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover border border-amber-500/40"
                  />
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-white truncate max-w-[130px] leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="mt-0.5">{getRoleBadge(currentUser.role)}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 text-xs animate-fadeIn">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="font-bold text-white text-sm truncate">{currentUser.name}</p>
                      <p className="text-slate-400 text-xs truncate mt-0.5">{currentUser.email}</p>
                      <div className="mt-2 flex items-center justify-between">
                        {getRoleBadge(currentUser.role)}
                        <span className="text-[10px] text-emerald-400 font-semibold uppercase">● Active Session</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveView('dashboard');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-amber-400" />
                        <span>Open Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveView('apply');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                      >
                        <FilePlus className="w-4 h-4 text-amber-400" />
                        <span>Submit New Case Application</span>
                      </button>
                    </div>

                    {/* Switch role within menu */}
                    <div className="border-t border-slate-800 px-4 py-2">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                        Test Another Perspective
                      </p>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => {
                            switchRole('admin');
                            setProfileDropdownOpen(false);
                          }}
                          className={`py-1 rounded text-center text-[10px] font-semibold ${
                            currentUser.role === 'admin'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          Admin
                        </button>
                        <button
                          onClick={() => {
                            switchRole('lawyer', 'u-lawyer-3');
                            setProfileDropdownOpen(false);
                          }}
                          className={`py-1 rounded text-center text-[10px] font-semibold ${
                            currentUser.role === 'lawyer'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          Lawyer
                        </button>
                        <button
                          onClick={() => {
                            switchRole('client', 'u-client-1');
                            setProfileDropdownOpen(false);
                          }}
                          className={`py-1 rounded text-center text-[10px] font-semibold ${
                            currentUser.role === 'client'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          Client
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                          setActiveView('public');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-400 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out of LCMS</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md transition"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 p-4 space-y-2 animate-fadeIn">
          <button
            onClick={() => {
              setActiveView('public');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Firm Public Website</span>
          </button>

          {currentUser && (
            <button
              onClick={() => {
                setActiveView('dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>Portal Dashboard</span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveView('apply');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2"
          >
            <FilePlus className="w-4 h-4 text-amber-400" />
            <span>Apply For a Legal Case</span>
          </button>
        </div>
      )}
    </header>
  );
};
