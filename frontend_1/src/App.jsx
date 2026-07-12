import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Leaf, 
  Users, 
  ShieldCheck, 
  Trophy, 
  Globe, 
  Bell, 
  Award, 
  Zap, 
  TrendingUp, 
  ArrowUpRight, 
  Activity, 
  AlertTriangle 
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  
  // Basic State
  const xp = 2450;
  const badgesCount = 3;
  const overallScore = 84;

  // Department scores
  const departments = [
    { name: 'Research & Development (R&D)', score: 92, color: 'bg-indigo-500' },
    { name: 'Human Resources (HR)', score: 81, color: 'bg-teal-500' },
    { name: 'Sales & Marketing', score: 74, color: 'bg-emerald-500' },
    { name: 'Supply Chain & Logistics', score: 65, color: 'bg-amber-500' },
  ];

  // SVG Circular Gauge
  const radius = 55;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-zinc-950 flex text-zinc-100">
      
      {/* 1. Sidebar Panel */}
      <aside className="w-80 h-screen fixed top-0 left-0 bg-zinc-950 border-r border-zinc-900 flex flex-col justify-between p-6 z-20">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center">
              <Globe className="w-5.5 h-5.5 text-zinc-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">EcoSphere</h1>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">ESG Starter</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {[
              { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, color: 'text-teal-400 bg-teal-500/10' },
              { id: 'environmental', label: 'Environmental Module', icon: Leaf, color: 'text-emerald-400 bg-emerald-500/10' },
              { id: 'social', label: 'Social Hub', icon: Users, color: 'text-indigo-400 bg-indigo-500/10' },
              { id: 'governance', label: 'Governance Command', icon: ShieldCheck, color: 'text-amber-400 bg-amber-500/10' },
              { id: 'gamification', label: 'Gamification Arena', icon: Trophy, color: 'text-violet-400 bg-violet-500/10' }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-transparent font-medium text-sm transition-all text-left ${
                    isActive ? item.color : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="text-xs text-zinc-600 px-2">
          v1.0.0-basic • Starter Mode
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 pl-80 flex flex-col min-h-screen">
        
        {/* 2. Top Header Navbar */}
        <header className="h-20 fixed top-0 right-0 left-80 bg-zinc-950/80 border-b border-zinc-900 flex items-center justify-between px-8 z-10 backdrop-blur-sm">
          <div>
            <h2 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Welcome back</h2>
            <h3 className="text-zinc-350 text-sm font-medium">CSO Dashboard</h3>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-xl">
              <Zap className="w-4 h-4 text-violet-400 fill-violet-400" />
              <span className="text-xs text-zinc-400 font-medium">Level 4</span>
              <span className="text-xs font-bold text-violet-400">{xp} XP</span>
            </div>

            <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-xl">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-zinc-450 font-bold">{badgesCount} Badges</span>
            </div>

            <button className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-400 border border-transparent hover:border-zinc-800">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* 3. Render View */}
        <main className="flex-1 mt-20 p-8 max-w-7xl w-full mx-auto pb-16">
          {activeView === 'dashboard' ? (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-extrabold text-white">ESG Control Room</h1>
                <p className="text-sm text-zinc-500 mt-1">First-phase basic dashboard interface.</p>
              </div>

              {/* Gauge and metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Radial Gauge */}
                <div className="lg:col-span-1 glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden">
                  <h3 className="text-zinc-400 text-sm font-semibold tracking-wider uppercase mb-6 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> EcoSphere Index
                  </h3>
                  
                  <div className="relative flex items-center justify-center w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r={radius} className="stroke-zinc-850" strokeWidth={strokeWidth} fill="transparent" />
                      <circle cx="72" cy="72" r={radius} className="stroke-emerald-500" strokeWidth={strokeWidth} fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-extrabold text-white">{overallScore}</span>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Score</span>
                    </div>
                  </div>
                </div>

                {/* Mini cards */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['Environmental', 'Social Hub', 'Governance'].map((item, idx) => (
                    <div key={item} className="glass-card p-6 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-zinc-500 font-bold uppercase">{item}</span>
                        <span className="text-xs text-emerald-400 flex items-center gap-0.5 font-bold">
                          +1.{idx} % <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <div className="mt-8 text-2xl font-extrabold text-white">
                        {idx === 0 ? '84%' : idx === 1 ? '78%' : '91%'}
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Leaderboard and feed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Department progress */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Department ESG Leaderboard</h3>
                  <div className="space-y-4">
                    {departments.map((dept) => (
                      <div key={dept.name} className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-350">{dept.name}</span>
                          <span className="text-zinc-200">{dept.score}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div className={`h-full ${dept.color} rounded-full`} style={{ width: `${dept.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Operations Stream</h3>
                  <div className="space-y-4 text-xs">
                    <div className="flex gap-3 p-3 bg-zinc-900/30 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <p className="font-semibold text-zinc-300">Hazardous Waste Audit - Facility B</p>
                        <p className="text-zinc-550 mt-1">Awaiting compliance review deadline (2026-06-15).</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-zinc-900/30 rounded-xl">
                      <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-zinc-300">Environmental Ledger Updated</p>
                        <p className="text-zinc-550 mt-1">Vite build configuration pushed successfully.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center max-w-2xl mx-auto space-y-4">
              <Globe className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">{activeView} Module</h2>
              <p className="text-sm text-zinc-550 max-w-sm mx-auto leading-relaxed">
                This ESG sub-module is scheduled for the next segment push. The core layout, routing, and style tokens are fully configured.
              </p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
