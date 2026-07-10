import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldCheck, 
  ChevronRight,
  Bot,
  Server
} from 'lucide-react';

/**
 * Navbar Component: The sidebar navigation for the platform.
 * It remains persistent across all routes.
 */
const Navbar = ({ isOpen, toggle, insuranceType }) => {
  const location = useLocation();

  const baseUrl = insuranceType ? `/${insuranceType}` : '';

  const mainNavItems = [
    { path: `${baseUrl}/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
    { path: `${baseUrl}/submit`, icon: FileText, label: 'Submit Claim' },
    { path: `${baseUrl}/analysis`, icon: ShieldCheck, label: 'Truth Engine' },
  ];



  const systemNavItems = insuranceType ? [
    { path: `${baseUrl}/assistant`, icon: Bot, label: 'AI Assistant' },
    { path: `${baseUrl}/architecture`, icon: Server, label: 'Architecture' },
  ] : [];

  // Filter items if no insurance type is selected
  const filteredMainNav = insuranceType ? mainNavItems : [{ path: '/', icon: LayoutDashboard, label: 'Home' }];

  return (
    <aside className={`fixed left-0 top-0 h-full bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-800/50 transition-all duration-500 z-50 
      ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'}
    `}>
      <div className="flex flex-col h-full p-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 mb-8 px-2 pt-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 min-w-[40px] shrink-0">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          {isOpen && (
            <span className="font-bold text-xl tracking-tight premium-gradient-text whitespace-nowrap overflow-hidden">AI Insurance</span>
          )}
        </div>

        {/* Main Navigation Links */}
        <div className="mb-6">
          {isOpen && <p className="px-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Core Workflow</p>}
          <nav className="space-y-2">
            {filteredMainNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path}
                  className={`nav-link grow ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (window.innerWidth <= 768) toggle();
                  }}
                >
                  <Icon className={`w-5 h-5 min-w-[20px] ${isActive ? 'text-primary-light' : ''}`} />
                  {isOpen && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* System Navigation Links - Only show if insurance type selected */}
        {insuranceType && (
          <div className="mb-6">
            {isOpen && <p className="px-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Intelligence & System</p>}
            <nav className="space-y-2">
              {systemNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    className={`nav-link grow ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      if (window.innerWidth <= 768) toggle();
                    }}
                  >
                    <Icon className={`w-5 h-5 min-w-[20px] ${isActive ? 'text-primary-light' : ''}`} />
                    {isOpen && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Brand Label */}
        {isOpen && (
          <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 mb-4 mt-auto">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">AI Insurance</p>
            <p className="text-xs text-zinc-400 leading-tight italic">
              "Contextual Relationship Intelligence"
            </p>
          </div>
        )}
      </div>
      
      {/* Toggle Sidebar Button - Hidden on mobile, only visible on desktop */}
      <button 
        onClick={toggle}
        className="hidden md:flex absolute -right-3 top-20 bg-primary w-6 h-6 rounded-full items-center justify-center border-2 border-background hover:scale-110 transition-transform shadow-lg shadow-primary/20"
      >
        <ChevronRight className={`w-4 h-4 text-white transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </aside>
  );
};

export default Navbar;
