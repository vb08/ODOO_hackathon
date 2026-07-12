import React, { useState } from 'react';
import { 
  Trophy, 
  Gift, 
  Award, 
  Lock, 
  Coins, 
  Layers, 
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GamificationView({
  xp,
  setXp,
  badges,
  rewards,
  setRewards,
  challenges,
  leaderboard,
  addNotification,
  triggerToast
}) {
  const [activeTab, setActiveTab] = useState('Active');

  // Filter challenges based on lifecycle tab
  const filteredChallenges = challenges.filter(c => c.status === activeTab);

  // Handle rewards redemption
  const handleRedeem = (rewardId, name, cost, currentStock) => {
    if (xp < cost) {
      triggerToast('Insufficient XP balance for this reward!', 'error');
      return;
    }
    if (currentStock <= 0) {
      triggerToast('This reward is currently out of stock!', 'error');
      return;
    }

    // Deduct XP
    setXp(prev => prev - cost);

    // Decrement stock
    setRewards(rewards.map(r => {
      if (r.id === rewardId) {
        return { ...r, stock: r.stock - 1 };
      }
      return r;
    }));

    // Trigger feedback and notifications
    triggerToast(`Successfully redeemed ${name}!`, 'success');
    addNotification(`Redeemed prize: "${name}" for ${cost} XP.`);

    // Confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#fbbf24', '#f59e0b', '#10b981']
    });
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="w-2.5 h-8 bg-violet-600 rounded-full"></span>
          Gamification Arena
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Redeem rewards using earned XP, view employee competition standings, and complete carbon reduction challenges.
        </p>
      </div>

      {/* Grid: Challenges & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Challenge Workspace */}
        <div className="lg:col-span-2 glass-card-no-hover p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-400" /> Challenge Lifecycle Workspace
            </h3>
            <p className="text-xs text-zinc-400 mb-6">Filter and advance team challenges through operations stages.</p>

            {/* Lifecycle Tabs */}
            <div className="flex border-b border-zinc-800 mb-6">
              {['Active', 'Draft', 'Under Review', 'Completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-bold -mb-px border-b-2 transition-all ${
                    activeTab === tab 
                      ? 'border-violet-500 text-violet-400 font-semibold' 
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Challenges List */}
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
              {filteredChallenges.length === 0 ? (
                <div className="py-12 text-center text-zinc-600 text-xs">
                  No challenges in this lifecycle stage.
                </div>
              ) : (
                filteredChallenges.map((c) => (
                  <div 
                    key={c.id} 
                    className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex items-center justify-between hover:border-zinc-800/80 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 uppercase tracking-wider">
                          {c.type}
                        </span>
                        <span className="text-[10px] text-zinc-500">{c.duration}</span>
                      </div>
                      <h4 className="font-semibold text-sm text-zinc-200">{c.title}</h4>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-zinc-500 block uppercase">Reward</span>
                      <span className="text-xs font-bold text-violet-400 flex items-center gap-0.5 justify-end">
                        <Sparkles className="w-3.5 h-3.5" /> +{c.xpReward} XP
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Achievement Grid (Badges) */}
        <div className="lg:col-span-1 glass-card-no-hover p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-violet-400" /> EcoSphere Badges
            </h3>
            <p className="text-xs text-zinc-400 mb-6">Earned recognitions and locked milestones.</p>

            <div className="grid grid-cols-3 gap-4">
              {badges.map((b) => (
                <div 
                  key={b.id} 
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    b.unlocked 
                      ? 'bg-violet-600/5 border-violet-500/20 badge-glow-unlocked hover:bg-violet-600/10 group' 
                      : 'bg-zinc-950 border-zinc-900 opacity-40'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-2.5 relative ${
                    b.unlocked 
                      ? 'bg-gradient-to-tr from-violet-500 to-indigo-500 text-zinc-950 shadow-md group-hover:scale-105 transition-transform' 
                      : 'bg-zinc-900 text-zinc-600'
                  }`}>
                    {b.unlocked ? (
                      <span className="font-extrabold text-sm uppercase">{b.abbr}</span>
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-zinc-300 text-center tracking-tight leading-tight line-clamp-2">
                    {b.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Rewards & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Rewards Catalog Bazaar */}
        <div className="lg:col-span-2 glass-card-no-hover p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-violet-400" /> Rewards Catalog Bazaar
            </h3>
            <div className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-xl text-xs text-violet-400 font-bold">
              <Coins className="w-4 h-4 fill-violet-400/20" /> Balance: {xp} XP
            </div>
          </div>
          <p className="text-xs text-zinc-400 mb-6">Redeem points for high-quality sustainable products and workplace privileges.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((r) => {
              const cannotAfford = xp < r.cost;
              const outOfStock = r.stock <= 0;
              
              return (
                <div 
                  key={r.id} 
                  className={`p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex flex-col justify-between hover:border-zinc-800/80 transition-all ${
                    outOfStock ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Item</span>
                      <h4 className="font-bold text-sm text-zinc-200">{r.name}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 block uppercase">Stock</span>
                      <span className={`text-xs font-bold ${outOfStock ? 'text-red-400' : 'text-zinc-300'}`}>
                        {outOfStock ? 'Out of Stock' : `${r.stock} left`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4">
                    <div className="text-xs">
                      <span className="text-zinc-500 block">Cost</span>
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 fill-amber-400/20" /> {r.cost} XP
                      </span>
                    </div>

                    <button
                      onClick={() => handleRedeem(r.id, r.name, r.cost, r.stock)}
                      disabled={cannotAfford || outOfStock}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        outOfStock 
                          ? 'bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed' 
                          : cannotAfford 
                          ? 'bg-zinc-850 border border-zinc-800 text-zinc-500 cursor-not-allowed' 
                          : 'bg-violet-600 hover:bg-violet-500 text-zinc-950 shadow-md shadow-violet-500/10'
                      }`}
                    >
                      {outOfStock ? 'Disabled' : cannotAfford ? 'Need More XP' : 'Redeem Item'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* XP Leaderboard */}
        <div className="lg:col-span-1 glass-card-no-hover p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-400" /> Leaderboard Standings
            </h3>
            <p className="text-xs text-zinc-400 mb-6">Top performing employees ranked by historical ESG XP.</p>

            <div className="space-y-3.5">
              {leaderboard.map((user, idx) => (
                <div 
                  key={user.name} 
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    user.isCurrentUser 
                      ? 'bg-violet-600/5 border-violet-500/30' 
                      : 'bg-zinc-900/10 border-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-md border text-xs font-extrabold flex items-center justify-center ${
                      idx === 0 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                      idx === 1 ? 'bg-zinc-400/10 border-zinc-400/30 text-zinc-300' :
                      idx === 2 ? 'bg-amber-600/10 border-amber-650/30 text-amber-550' :
                      'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-xs text-zinc-200">
                        {user.name} {user.isCurrentUser && <span className="text-[9px] bg-violet-500/15 text-violet-400 px-1.5 py-0.5 rounded ml-1">You</span>}
                      </h4>
                      <span className="text-[10px] text-zinc-500 block">{user.department}</span>
                    </div>
                  </div>
                  <span className="font-bold text-zinc-300 text-xs">{user.xp.toLocaleString()} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
