import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { ExecutiveOverview } from './pages/ExecutiveOverview';
import { StudentDirectory } from './pages/StudentDirectory';
import { EarlyWarningRadar } from './pages/EarlyWarningRadar';
import { StudentSegmentsPage } from './pages/StudentSegmentsPage';
import { InterventionManager } from './pages/InterventionManager';
import { CopilotChat } from './pages/CopilotChat';
import { DataIntegrationCenter } from './pages/DataIntegrationCenter';
import { ExplainabilityHub } from './pages/ExplainabilityHub';
import { StudentDetailModal } from './components/StudentDetailModal';
import { InterventionModal } from './components/InterventionModal';
import { LoginPage, UserProfile } from './pages/LoginPage';
import { api } from './services/api';
import { GraduationCap, Heart, Terminal, Sparkles, ShieldCheck } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('campusiq_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return {
      name: 'Dr. Sunita Rao',
      email: 'dean.academics@campusiq.edu',
      role: 'Dean of Academics',
      department: 'Academic Affairs',
      avatarSeed: 'SR'
    };
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Student 360 Modal State
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  // Quick Intervention Modal State
  const [interventionStudentId, setInterventionStudentId] = useState<string | null>(null);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);

  // Critical alerts count for badge
  const [criticalCount, setCriticalCount] = useState<number>(0);

  const fetchCriticalCount = async () => {
    try {
      const data = await api.getEarlyWarnings();
      setCriticalCount(data.critical_count);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchCriticalCount();
    }
  }, [currentUser]);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('campusiq_user', JSON.stringify(user));
    if (user.department && user.department !== 'Academic Affairs' && user.department !== 'Training & Placement Cell') {
      setSelectedDept(user.department);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('campusiq_user');
  };

  const handleOpenStudent = (id: string) => {
    setSelectedStudentId(id);
    setIsStudentModalOpen(true);
  };

  const handleAssignIntervention = (id: string) => {
    setInterventionStudentId(id);
    setIsInterventionModalOpen(true);
  };

  // If user is not logged in, render the login page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedDept={selectedDept}
        onDeptChange={setSelectedDept}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        criticalAlertsCount={criticalCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <ExecutiveOverview
            selectedDept={selectedDept}
            selectedYear={selectedYear}
            onSelectStudent={handleOpenStudent}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'directory' && (
          <StudentDirectory
            selectedDept={selectedDept}
            selectedYear={selectedYear}
            onSelectStudent={handleOpenStudent}
          />
        )}

        {activeTab === 'radar' && (
          <EarlyWarningRadar
            selectedDept={selectedDept}
            onSelectStudent={handleOpenStudent}
            onAssignIntervention={handleAssignIntervention}
          />
        )}

        {activeTab === 'segments' && (
          <StudentSegmentsPage onSelectStudent={handleOpenStudent} />
        )}

        {activeTab === 'interventions' && (
          <InterventionManager onSelectStudent={handleOpenStudent} />
        )}

        {activeTab === 'copilot' && (
          <CopilotChat onSelectStudent={handleOpenStudent} />
        )}

        {activeTab === 'data' && <DataIntegrationCenter />}

        {activeTab === 'explainability' && <ExplainabilityHub />}
      </main>

      {/* Modals */}
      <StudentDetailModal
        studentId={selectedStudentId}
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onInterventionUpdated={fetchCriticalCount}
      />

      <InterventionModal
        studentId={interventionStudentId || 'STU-1002'}
        isOpen={isInterventionModalOpen}
        onClose={() => setIsInterventionModalOpen(false)}
        onSaved={fetchCriticalCount}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-white font-mono">CampusIQ</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">AI-Powered Student Success & Campus Intelligence Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Responsible AI Audited
            </span>
            <span>•</span>
            <span>Deterministic Analytics Engine</span>
            <span>•</span>
            <span>24-Hour Hackathon Delivery</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
