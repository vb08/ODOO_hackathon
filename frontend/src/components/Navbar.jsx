import React, { useState } from 'react';
import { 
  Bell, 
  Award, 
  Zap, 
  Sparkles, 
  ChevronDown,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function Navbar({ xp, badgesCount, notifications, clearNotifications }) {
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Calculate next level progress
  const currentLevelXp = xp;
  const levelMinXp = 2000;
  const levelMaxXp = 3000;
  const progressPercent = Math.max(0, Math.min(100, ((currentLevelXp - levelMinXp) / (levelMaxXp - levelMinXp)) * 100));

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-20 fixed top-0 right-0 left-80 bg-zinc-950/60 border-b border-zinc-900/80 flex items-center justify-between px-8 z-10 backdrop-blur-md">
      {/* Welcome / Context */}
      <div>
        <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Welcome back</h2>
        <h3 className="text-zinc-200 text-sm font-medium">Chief Sustainability Officer</h3>
      </div>

      {/* Stats Bar & Interactions */}
      <div className="flex items-center gap-6">
        
        {/* Level & XP Gauge */}
        <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800/80 px-4 py-2 rounded-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Zap className="w-4 h-4 fill-violet-400" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-zinc-400 font-medium">Level</span>
                <span className="text-sm font-bold text-violet-400">4</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-medium">
                {xp} / 3,000 XP
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Badges Indicator */}
        <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800/80 px-4 py-2 rounded-2xl group cursor-help relative">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-4 h-4 fill-amber-400/20" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block font-medium">Earned Badges</span>
            <span className="text-sm font-bold text-amber-400">{badgesCount} Badges</span>
          </div>

          {/* Quick Tooltip */}
          <div className="absolute top-14 right-0 w-48 bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-[11px] text-zinc-400 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 shadow-2xl">
            <p className="font-semibold text-zinc-200 mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Current Badges
            </p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Carbon Auditor Pro</li>
              <li>CSR Activist</li>
              <li>Policy Champion</li>
            </ul>
          </div>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 ${
              showNotifications 
                ? 'bg-zinc-800 border-zinc-700 text-zinc-100' 
                : 'bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
            }`}
          >
            <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-bounce-subtle' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-zinc-950" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-zinc-900/95 border border-zinc-800/90 rounded-2xl shadow-2xl p-4 z-40 backdrop-blur-xl animate-fade-in-up">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-2">
                <h4 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
                  <span>Activity Stream</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </h4>
                {notifications.length > 0 && (
                  <button 
                    onClick={clearNotifications}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-zinc-600 text-xs">
                    No recent notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-2.5 rounded-xl text-xs transition-colors flex items-start gap-2.5 ${
                        n.read ? 'bg-transparent text-zinc-400' : 'bg-zinc-800/40 border border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <div className="mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="leading-relaxed">{n.text}</p>
                        <span className="text-[9px] text-zinc-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {n.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-800" />

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-zinc-950 text-sm shadow-md shadow-violet-500/10 border border-zinc-800/40">
            JD
          </div>
          <div className="hidden xl:block">
            <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1">
              Jane Doe <ChevronDown className="w-3 h-3 text-zinc-500" />
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">Enterprise Admin</span>
          </div>
        </div>

      </div>
    </header>
  );
}
