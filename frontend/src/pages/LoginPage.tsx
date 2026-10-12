import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  Building2,
  Briefcase,
  Compass,
  Layers
} from 'lucide-react';

export interface UserProfile {
  name: string;
  email: string;
  role: 'Faculty Advisor' | 'Head of Department' | 'Dean of Academics' | 'Placement Officer';
  department: string;
  avatarSeed: string;
}

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

const DEMO_PERSONAS: UserProfile[] = [
  {
    name: 'Dr. Sunita Rao',
    email: 'dean.academics@campusiq.edu',
    role: 'Dean of Academics',
    department: 'Academic Affairs',
    avatarSeed: 'SR'
  },
  {
    name: 'Prof. K. R. Sharma',
    email: 'sharma.ece@campusiq.edu',
    role: 'Faculty Advisor',
    department: 'Electronics & Communication',
    avatarSeed: 'KS'
  },
  {
    name: 'Dr. Amit Deshmukh',
    email: 'hod.cse@campusiq.edu',
    role: 'Head of Department',
    department: 'Computer Science & Engineering',
    avatarSeed: 'AD'
  },
  {
    name: 'Prof. Vikram Malhotra',
    email: 'tpo.placement@campusiq.edu',
    role: 'Placement Officer',
    department: 'Training & Placement Cell',
    avatarSeed: 'VM'
  }
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('dean.academics@campusiq.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState<UserProfile['role']>('Dean of Academics');
  const [department, setDepartment] = useState('Academic Affairs');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin({
        name: email.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()),
        email,
        role,
        department,
        avatarSeed: email.slice(0, 2).toUpperCase()
      });
      setLoading(false);
    }, 400);
  };

  const handleSelectPersona = (persona: UserProfile) => {
    setEmail(persona.email);
    setRole(persona.role);
    setDepartment(persona.department);
    setLoading(true);
    setTimeout(() => {
      onLogin(persona);
      setLoading(false);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Dynamic Background Mesh Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* Left Column: Visual Brand Showcase & Pillars */}
          <div className="lg:col-span-5 p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between text-white relative">
            <div className="space-y-6">
              {/* Brand Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-white/20">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tight text-white font-mono">
                      Campus<span className="text-blue-400">IQ</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      v1.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Higher Education Decision Support
                  </p>
                </div>
              </div>

              {/* Mission & Value Proposition */}
              <div className="space-y-2 pt-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                  Predict Early. <br />
                  Intervene Smartly. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300">
                    Empower Every Student.
                  </span>
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Transforming fragmented academic marks, lecture attendance, LMS digital footprint, and placement assessments into proactive, explainable student success pathways.
                </p>
              </div>

              {/* 4 Pillars Mini-Badges */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Unified Intelligence Pillars:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-slate-200 font-medium">Academic Rigor</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal-400" />
                    <span className="text-slate-200 font-medium">Biometric Attendance</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="text-slate-200 font-medium">LMS Engagement</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-slate-200 font-medium">Placement Readiness</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Trust Badge */}
            <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" /> Responsible AI Audited
              </span>
              <span>24-Hour Hackathon Delivery</span>
            </div>
          </div>

          {/* Right Column: Login Form & 1-Click Demo Personas */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6 bg-slate-900/60">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Institutional Sign In</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Access the decision support cockpit with your authorized university credentials.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live SQLite Ready
                </div>
              </div>

              {/* 1-Click Hackathon Persona Quick-Select */}
              <div className="mb-6 p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    1-Click Hackathon Demo Personas
                  </span>
                  <span className="text-[10px] text-slate-400">Instant Access</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEMO_PERSONAS.map((p) => {
                    const isSelected = email === p.email;
                    return (
                      <button
                        key={p.email}
                        type="button"
                        onClick={() => handleSelectPersona(p)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500/60 ring-1 ring-blue-500/40 text-white'
                            : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 text-slate-200'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <div className="text-xs font-bold truncate group-hover:text-blue-300 transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {p.role} • {p.department.replace('Engineering', 'Engg')}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white shrink-0 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Form */}
              <form onSubmit={handleCustomLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Institutional Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="faculty@campusiq.edu"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Security Password
                    </label>
                    <a
                      href="#forgot"
                      onClick={(e) => { e.preventDefault(); alert('Demo environment: Simply select any of the 1-Click Demo Personas above to sign in instantly.'); }}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      Default: any password
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Assigned Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Dean of Academics">Dean of Academics</option>
                      <option value="Head of Department">Head of Department (HOD)</option>
                      <option value="Faculty Advisor">Faculty Advisor / Mentor</option>
                      <option value="Placement Officer">Placement Officer (TPO)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Academic Affairs">Academic Affairs</option>
                      <option value="Computer Science & Engineering">Computer Science & Engg</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Data Science & AI">Data Science & AI</option>
                      <option value="Electronics & Communication">Electronics & Comm</option>
                      <option value="Electrical & Electronics">Electrical & Electronics</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Training & Placement Cell">Training & Placement Cell</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Remember institutional session</span>
                  </label>
                  <span className="text-[11px] text-slate-500">AES-256 Encrypted Session</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Decision Cockpit</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* University SSO Simulation Footer */}
            <div className="pt-4 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-500">
                Authorized for institutional faculty, mentors, and administrators. CampusIQ follows strict FERPA/GDPR compliance standards.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
