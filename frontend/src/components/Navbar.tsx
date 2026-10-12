import React from 'react';
import {
  LayoutDashboard,
  Users,
  AlertOctagon,
  Layers,
  ClipboardList,
  Sparkles,
  Database,
  Sliders,
  GraduationCap,
  Activity
} from 'lucide-react';

import { UserProfile } from '../pages/LoginPage';
import { LogOut } from 'lucide-react';

export type ActiveTab =
  | 'overview'
  | 'directory'
  | 'radar'
  | 'segments'
  | 'interventions'
  | 'copilot'
  | 'data'
  | 'explainability';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  selectedDept: string;
  onDeptChange: (dept: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  criticalAlertsCount?: number;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

const DEPARTMENTS = [
  'All Departments',
  'Computer Science & Engineering',
  'Information Technology',
  'Data Science & AI',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering'
];

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: any;
  badge?: number | null;
  highlight?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  selectedDept,
  onDeptChange,
  selectedYear,
  onYearChange,
  criticalAlertsCount = 0,
  currentUser,
  onLogout
}) => {
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'directory', label: 'Student Directory', icon: Users },
    {
      id: 'radar',
      label: 'Early Warning Radar',
      icon: AlertOctagon,
      badge: criticalAlertsCount > 0 ? criticalAlertsCount : null
    },
    { id: 'segments', label: 'Student Segments', icon: Layers },
    { id: 'interventions', label: 'Interventions', icon: ClipboardList },
    { id: 'copilot', label: 'CampusIQ Copilot', icon: Sparkles, highlight: true },
    { id: 'explainability', label: 'AI Explainability Hub', icon: Sliders },
    { id: 'data', label: 'Data Integration', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white font-mono">Campus<span className="text-blue-400">IQ</span></span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live SQLite
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                Predict Early. Intervene Smartly. Empower Every Student.
              </p>
            </div>
          </div>

          {/* Global Institutional Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="dept-filter" className="text-xs text-slate-400 font-medium hidden lg:inline">Department:</label>
              <select
                id="dept-filter"
                value={selectedDept}
                onChange={(e) => onDeptChange(e.target.value)}
                className="bg-slate-800 text-slate-200 text-xs rounded-lg border border-slate-700 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept === 'All Departments' ? '' : dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="year-filter" className="text-xs text-slate-400 font-medium hidden lg:inline">Year:</label>
              <select
                id="year-filter"
                value={selectedYear}
                onChange={(e) => onYearChange(e.target.value)}
                className="bg-slate-800 text-slate-200 text-xs rounded-lg border border-slate-700 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Batches</option>
                <option value="1">Year 1 (Freshmen)</option>
                <option value="2">Year 2 (Sophomores)</option>
                <option value="3">Year 3 (Pre-final)</option>
                <option value="4">Year 4 (Final Year)</option>
              </select>
            </div>

            {/* Current Logged-in User Chip & Logout */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 font-bold text-xs flex items-center justify-center font-mono">
                  {currentUser.avatarSeed || 'U'}
                </div>
                <div className="hidden xl:block text-left leading-tight">
                  <span className="text-xs font-bold text-white block truncate max-w-[130px]">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[130px]">{currentUser.role}</span>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Switch Persona / Sign Out"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-1.5 min-w-max" aria-label="Tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id as ActiveTab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 relative ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : item.highlight
                      ? 'text-indigo-300 hover:text-white hover:bg-slate-800/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white leading-none">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping absolute top-2 right-1.5" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
