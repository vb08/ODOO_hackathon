import React from 'react';
import { 
  LayoutDashboard, 
  Leaf, 
  Users, 
  ShieldCheck, 
  Trophy, 
  Globe 
} from 'lucide-react';

export default function Sidebar({ activeView, setActiveView }) {
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Executive Dashboard', 
      icon: LayoutDashboard,
      activeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/40 hover:bg-teal-500/20'
    },
    { 
      id: 'environmental', 
      label: 'Environmental Module', 
      icon: Leaf,
      activeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/20'
    },
    { 
      id: 'social', 
      label: 'Social Hub', 
      icon: Users,
      activeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/40 hover:bg-indigo-500/20'
    },
    { 
      id: 'governance', 
      label: 'Governance Command', 
      icon: ShieldCheck,
      activeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/20'
    },
    { 
      id: 'gamification', 
      label: 'Gamification Arena', 
      icon: Trophy,
      activeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/40 hover:bg-violet-500/20'
    },
  ];

  return (
    <aside className="w-80 h-screen fixed top-0 left-0 bg-zinc-950/70 border-r border-zinc-800/60 flex flex-col justify-between p-6 z-20 backdrop-blur-xl">
      <div className="flex flex-col gap-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Globe className="w-5.5 h-5.5 text-zinc-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              EcoSphere
            </h1>
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
              ESG Enterprise Platform
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-transparent font-medium text-sm transition-all duration-200 group text-left ${
                  isActive 
                    ? item.activeColor 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 hover:border-zinc-800/40'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-105 ${
                  isActive ? '' : 'text-zinc-500 group-hover:text-zinc-300'
                }`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className={`w-1.5 h-1.5 rounded-full ml-auto ${
                    item.id === 'environmental' ? 'bg-emerald-400' :
                    item.id === 'social' ? 'bg-indigo-400' :
                    item.id === 'governance' ? 'bg-amber-400' :
                    item.id === 'gamification' ? 'bg-violet-400' : 'bg-teal-400'
                  }`} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding Info */}
      <div className="bg-gradient-to-b from-transparent to-zinc-900/10 rounded-2xl p-4 border border-zinc-900/40">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Enterprise Mode</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <div className="mt-1 text-[11px] text-zinc-600">
          v1.4.2 • Secured Encryption
        </div>
      </div>
    </aside>
  );
}
