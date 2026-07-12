import React from 'react';
import { 
  TrendingUp, 
  Leaf, 
  Users, 
  ShieldCheck, 
  Activity, 
  ArrowUpRight, 
  Award,
  AlertTriangle
} from 'lucide-react';

export default function DashboardView({ 
  envScore = 84, 
  socScore = 78, 
  govScore = 91, 
  notifications = [] 
}) {
  // Calculate weighted overall ESG score
  const overallScore = Math.round((envScore * 0.40) + (socScore * 0.30) + (govScore * 0.30));

  // Circular gauge properties
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  // Department scores
  const departments = [
    { name: 'Research & Development (R&D)', score: 92, color: 'bg-indigo-500' },
    { name: 'Human Resources (HR)', score: 81, color: 'bg-teal-500' },
    { name: 'Sales & Marketing', score: 74, color: 'bg-emerald-500' },
    { name: 'Supply Chain & Logistics', score: 65, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Top Welcome Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            ESG Performance Control Room
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time analytics, environmental ledgers, corporate audits, and engagement tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800/80 px-4 py-2.5 rounded-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs text-zinc-300 font-medium">Enterprise Stream Live</span>
        </div>
      </div>

      {/* Main Grid: Overall Score + Mini Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overall Score Circle Card */}
        <div className="lg:col-span-1 glass-card-no-hover p-6 flex flex-col items-center justify-center relative overflow-hidden glow-emerald">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-zinc-400 text-sm font-semibold tracking-wider uppercase mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> EcoSphere ESG Index
          </h3>
          
          {/* Circular Progress SVG */}
          <div className="relative flex items-center justify-center w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background Ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-zinc-800"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Foreground Ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-emerald-500"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold text-white">{overallScore}</span>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Indexed</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-zinc-400 max-w-[240px] leading-relaxed">
              Weighted ESG index score: 40% Environmental, 30% Social, and 30% Governance.
            </p>
          </div>
        </div>

        {/* Mini breakdowns for Env, Soc, Gov */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Environmental Card */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Environmental</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Leaf className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{envScore}%</span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center">
                  +1.4% <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">Net-zero track active</span>
            </div>
            
            {/* Custom Mini SVG Sparkline */}
            <div className="h-12 w-full mt-6">
              <svg className="w-full h-full overflow-visible">
                <path
                  d="M 0 35 L 20 28 L 40 32 L 60 15 L 80 20 L 100 8 L 120 18 L 140 5 L 160 10 L 180 5"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Social Card */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Social Hub</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{socScore}%</span>
                <span className="text-xs font-semibold text-indigo-400 flex items-center">
                  +2.8% <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">Volunteer rates surging</span>
            </div>

            {/* Custom Mini SVG Sparkline */}
            <div className="h-12 w-full mt-6">
              <svg className="w-full h-full overflow-visible">
                <path
                  d="M 0 35 L 20 40 L 40 25 L 60 30 L 80 15 L 100 22 L 120 12 L 140 18 L 160 5 L 180 8"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Governance Card */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Governance</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{govScore}%</span>
                <span className="text-xs font-semibold text-amber-400 flex items-center">
                  +0.5% <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-0.5 block">98% policy confirmation</span>
            </div>

            {/* Custom Mini SVG Sparkline */}
            <div className="h-12 w-full mt-6">
              <svg className="w-full h-full overflow-visible">
                <path
                  d="M 0 20 L 20 15 L 40 10 L 60 12 L 80 5 L 100 15 L 120 8 L 140 12 L 160 10 L 180 5"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

        </div>
      </div>

      {/* Department Leaderboard & Live Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Leaderboard */}
        <div className="glass-card-no-hover p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Department ESG Leaderboard</h3>
            <p className="text-xs text-zinc-400 mb-6">Cross-department ESG compliance score rankings.</p>
            
            <div className="space-y-5">
              {departments.map((dept, index) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-zinc-300">{dept.name}</span>
                    </div>
                    <span className="font-bold text-zinc-200">{dept.score}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-850 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${dept.color} rounded-full transition-all duration-700`}
                      style={{ width: `${dept.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity & Audit Stream */}
        <div className="glass-card-no-hover p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">EcoSphere Live Operations</h3>
              <p className="text-xs text-zinc-400">Continuous auditing & action validation feed.</p>
            </div>
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="flex-1 space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {notifications.slice(0, 7).map((n) => {
              // Custom tags for different notifications
              const isAlert = n.text.toLowerCase().includes('overdue') || n.text.toLowerCase().includes('alert');
              const isBadge = n.text.toLowerCase().includes('badge') || n.text.toLowerCase().includes('unlocked');
              
              return (
                <div 
                  key={n.id} 
                  className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl text-xs flex items-start gap-3 hover:bg-zinc-900/70 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 shrink-0 ${
                    isAlert ? 'bg-red-500/10 text-red-400' :
                    isBadge ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {isAlert ? <AlertTriangle className="w-4 h-4" /> :
                     isBadge ? <Award className="w-4 h-4" /> : <Leaf className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-300">
                        {isAlert ? 'Operations Security' : isBadge ? 'Gamification Bureau' : 'Environmental Ledger'}
                      </span>
                      <span className="text-[10px] text-zinc-500">{n.time}</span>
                    </div>
                    <p className="text-zinc-400 mt-1 leading-relaxed">{n.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
