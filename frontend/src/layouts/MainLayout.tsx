import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Cloud,
  Radio,
  BarChart3,
  Map as MapIcon,
  ShieldCheck,
  Bell,
  FileText,
  Settings,
  MapPin,
  ChevronDown,
  Clock,
  User as UserIcon,
  Sun,
  Moon
} from 'lucide-react';
import AerisLogo from '../components/common/AerisLogo';
import { useTheme } from '../context/ThemeContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Overview', path: '/overview', icon: <Home className="w-4 h-4" /> },
  { name: 'Forecast', path: '/forecast', icon: <Cloud className="w-4 h-4" /> },
  { name: 'Live Intelligence', path: '/intelligence', icon: <Radio className="w-4 h-4" /> },
  { name: 'Model Comparison', path: '/comparison', icon: <BarChart3 className="w-4 h-4" /> },
  { name: 'Spatial Analysis', path: '/spatial', icon: <MapIcon className="w-4 h-4" /> },
  { name: 'Accuracy & Validation', path: '/accuracy', icon: <ShieldCheck className="w-4 h-4" /> },
  { name: 'Alerts', path: '/alerts', icon: <Bell className="w-4 h-4" />, badge: 2 },
  { name: 'Reports', path: '/reports', icon: <FileText className="w-4 h-4" /> },
];

export default function MainLayout() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`relative flex h-screen w-screen overflow-hidden font-sans transition-colors duration-300 ${
      theme === 'light' ? 'bg-[#dbeafe] text-slate-900' : 'bg-[#070e1c] text-slate-100'
    }`}>
      {/* ── ATMOSPHERIC CLOUDY SKY BACKGROUND LAYER (VISIBLE CLOUDS) ─────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {theme === 'light' ? (
          <>
            {/* Soft, Volumetric White Cumulus Cloud Shapes in the Sky */}
            <div className="absolute -top-16 -left-16 w-96 h-96 rounded-full bg-white/70 blur-3xl" />
            <div className="absolute top-12 left-1/4 w-[500px] h-64 rounded-full bg-white/60 blur-3xl" />
            <div className="absolute top-0 right-10 w-[600px] h-80 rounded-full bg-white/75 blur-3xl" />
            <div className="absolute bottom-10 left-1/3 w-[700px] h-72 rounded-full bg-white/50 blur-3xl" />
            <div className="absolute -bottom-20 right-1/4 w-96 h-96 rounded-full bg-sky-200/60 blur-3xl" />

            {/* Subtle Realistic Vector Cloud Silhouette Layer */}
            <svg
              className="absolute inset-0 w-full h-full opacity-35"
              viewBox="0 0 1440 900"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M-50,220 C120,180 220,240 380,210 C540,180 620,130 800,160 C980,190 1100,140 1260,180 C1400,210 1480,190 1550,230 L1550,950 L-50,950 Z"
                fill="url(#cloud-layer-1)"
              />
              <path
                d="M-50,450 C180,410 320,470 520,430 C720,390 840,460 1060,420 C1280,380 1380,440 1550,410 L1550,950 L-50,950 Z"
                fill="url(#cloud-layer-2)"
              />
              <defs>
                <linearGradient id="cloud-layer-1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="cloud-layer-2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>
          </>
        ) : (
          <>
            {/* Storm Cloud Moody Backdrop */}
            <div className="absolute top-0 left-1/4 w-[600px] h-72 rounded-full bg-sky-950/20 blur-3xl" />
            <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-blue-950/20 blur-3xl" />
          </>
        )}
      </div>

      {/* ── LEFT SIDEBAR (LIGHT CLOUDY FROSTED GLASS) ───────────────────── */}
      <aside className={`w-60 flex-shrink-0 flex flex-col justify-between border-r relative z-20 transition-colors duration-300 backdrop-blur-2xl ${
        theme === 'light'
          ? 'bg-white/80 border-sky-200/80 shadow-[4px_0_24px_rgba(2,132,199,0.06)]'
          : 'bg-[#0a1426]/90 border-slate-800/70'
      }`}>
        {/* Top: Logo & Nav items */}
        <div className="p-4 flex flex-col">
          {/* Brand Logo */}
          <div className="mb-5 px-1">
            <AerisLogo />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === '/overview' && location.pathname === '/');

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'nav-active-weather text-white shadow-md'
                      : theme === 'light'
                      ? 'text-slate-700 hover:text-sky-900 hover:bg-sky-100/70'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : theme === 'light' ? 'text-sky-600' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Misty Overcast Horizon Graphic + Telemetry + Settings + User */}
        <div className={`relative pt-5 pb-3.5 px-4 overflow-hidden border-t ${
          theme === 'light' ? 'border-sky-200/80' : 'border-slate-800/60'
        }`}>
          {/* Atmospheric Cloud Horizon Silhouette */}
          <div className={`absolute inset-0 pointer-events-none ${theme === 'light' ? 'opacity-25' : 'opacity-20'}`}>
            <svg viewBox="0 0 300 200" preserveAspectRatio="none" className="w-full h-full">
              <path
                d="M 0 130 C 50 110, 100 140, 160 105 C 220 70, 260 120, 300 100 L 300 200 L 0 200 Z"
                fill={theme === 'light' ? '#38bdf8' : '#0284c7'}
              />
              <path
                d="M 0 155 C 60 135, 120 160, 190 130 C 240 110, 270 145, 300 135 L 300 200 L 0 200 Z"
                fill={theme === 'light' ? '#0284c7' : '#1e3a8a'}
              />
            </svg>
          </div>

          <div className="relative z-10 space-y-3">
            {/* System Status */}
            <div className="flex items-center gap-2.5 px-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <div className="flex flex-col">
                <span className={`text-[11px] font-bold leading-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  System Status
                </span>
                <span className={`text-[10px] font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  All systems operational
                </span>
              </div>
            </div>

            {/* Settings Link */}
            <button className={`w-full flex items-center gap-2.5 px-1.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              theme === 'light'
                ? 'text-slate-700 hover:text-sky-900 hover:bg-sky-100/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}>
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>

            {/* User Profile Card */}
            <div className={`pt-2 border-t flex items-center justify-between px-1 cursor-pointer group ${
              theme === 'light' ? 'border-sky-200/80' : 'border-slate-800/70'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-xs">
                  T
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold transition-colors ${
                    theme === 'light' ? 'text-slate-900 group-hover:text-sky-700' : 'text-white group-hover:text-sky-300'
                  }`}>
                    Tushar R. Talekar
                  </span>
                  <span className={`text-[10px] font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Meteorological Analyst
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
          </div>
        </div>
      </aside>

      {/* ── RIGHT MAIN VIEWPORT ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Top Header Bar */}
        <header className={`h-13 flex-shrink-0 backdrop-blur-2xl border-b px-5 flex items-center justify-between z-10 transition-colors duration-300 ${
          theme === 'light'
            ? 'bg-white/80 border-sky-200/80 shadow-[0_2px_12px_rgba(2,132,199,0.06)]'
            : 'bg-[#091222]/90 border-slate-800/70'
        }`}>
          {/* Left: Section Title */}
          <div className="flex items-center gap-3">
            <span className={`text-sm font-extrabold tracking-wide ${theme === 'light' ? 'text-sky-950' : 'text-white'}`}>
              Forecast Intelligence
            </span>
            <span className={`hidden md:inline text-xs font-medium border-l pl-3 ${
              theme === 'light' ? 'text-slate-600 border-sky-300/80' : 'text-slate-400 border-slate-700/60'
            }`}>
              Hybrid AI-NWP Multi-Model Forecasting
            </span>
          </div>

          {/* Right: Operational Controls */}
          <div className="flex items-center gap-2.5 text-xs font-medium">
            {/* Location Selector */}
            <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
              theme === 'light'
                ? 'bg-white/90 border-sky-200 text-slate-800 hover:bg-sky-50 shadow-sm'
                : 'bg-[#0f1d35] border-slate-700/60 text-slate-200 hover:text-white hover:border-slate-500'
            }`}>
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-semibold">New Delhi, India</span>
              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            {/* Last Updated */}
            <div className={`hidden lg:flex items-center gap-1.5 text-xs ${
              theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400'
            }`}>
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>Last updated 2 min ago</span>
            </div>

            {/* Operational Pill */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold text-[11px] ${
              theme === 'light'
                ? 'bg-emerald-50/90 border border-emerald-300 text-emerald-800 shadow-sm'
                : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Systems Operational</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-xl border transition-all ${
                theme === 'light'
                  ? 'bg-sky-100/90 border-sky-200 text-sky-800 hover:bg-sky-200/80 shadow-sm'
                  : 'bg-[#122340] border-slate-700/60 text-amber-300 hover:bg-[#1a3158]'
              }`}
              title={`Switch to ${theme === 'light' ? 'Dark Stormy' : 'Light Sky Blue'} Mode`}
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-sky-700" /> : <Sun className="w-3.5 h-3.5" />}
            </button>

            {/* Notification Bell */}
            <button className={`relative w-8 h-8 rounded-xl border flex items-center justify-center transition-colors ${
              theme === 'light'
                ? 'bg-white/90 border-sky-200 text-slate-700 hover:bg-sky-50 shadow-sm'
                : 'bg-[#122340] border-slate-700/60 text-slate-300 hover:text-white'
            }`}>
              <Bell className="w-3.5 h-3.5 text-sky-700" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
            </button>

            {/* User Avatar */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white cursor-pointer shadow-sm text-xs font-bold">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
          </div>
        </header>

        {/* Content Viewport - Strict 100vh Workstation Layout */}
        <main className={`flex-1 min-h-0 flex flex-col ${
          location.pathname === '/forecast' ||
          location.pathname === '/' ||
          location.pathname === '/overview' ||
          location.pathname === '/comparison'
            ? 'overflow-hidden px-4 py-2.5'
            : 'overflow-y-auto px-6 py-4'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
