import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import EnvironmentalView from './components/EnvironmentalView';
import SocialHubView from './components/SocialHubView';
import GovernanceView from './components/GovernanceView';
import GamificationView from './components/GamificationView';
import { Sparkles, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeView, setActiveView] = useState('dashboard');

  // Global Gamification User State
  const [xp, setXp] = useState(2450);
  
  // Custom Toast State
  const [toasts, setToasts] = useState([]);

  const triggerToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Activity stream & Notification Bell logs
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Alert: "Hazardous Waste Audit - Facility B" is past its due date (2026-06-15). Immediate action required.', time: '2 hours ago', read: false },
    { id: 2, text: 'Congratulations! You unlocked the "Policy Champion" Badge.', time: '1 day ago', read: false },
    { id: 3, text: 'Carbon calculations updated: London Office emissions recalculated automatically.', time: '2 days ago', read: true },
    { id: 4, text: 'You completed the "Local Vendor Sustainability Evaluation" CSR Quest and earned +300 XP.', time: '3 days ago', read: true },
  ]);

  const addNotification = (text) => {
    const newNotif = {
      id: Date.now(),
      text,
      time: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
    triggerToast('Activity stream cleared', 'info');
  };

  // ENVIRONMENTAL MODULE MODELS
  const [emissionFactors, setEmissionFactors] = useState([
    { id: 1, scope: 'Scope 2', source: 'Grid Electricity (US East)', factor: 0.385, unit: 'kg CO2e / kWh' },
    { id: 2, scope: 'Scope 1', source: 'Natural Gas Heating', factor: 2.021, unit: 'kg CO2e / m3' },
    { id: 3, scope: 'Scope 3', source: 'Business Travel (Air)', factor: 0.180, unit: 'kg CO2e / passenger-km' },
    { id: 4, scope: 'Scope 1', source: 'Corporate Fleet (Diesel)', factor: 2.680, unit: 'kg CO2e / liter' },
  ]);

  const [ledgerEntries, setLedgerEntries] = useState([
    { id: 1, timestamp: '2026-07-10 14:32', name: 'Boston HQ Electricity Consumption', consumption: '45,000 kWh', emissions: 17.3, status: 'Auto-Calculated' },
    { id: 2, timestamp: '2026-07-08 09:15', name: 'London Office Gas Heating', consumption: '2,500 m3', emissions: 5.0, status: 'Auto-Calculated' },
    { id: 3, timestamp: '2026-07-06 17:00', name: 'NYC to London Executive Flights', consumption: '3 Passengers', emissions: 6.2, status: 'Manual Input' },
    { id: 4, timestamp: '2026-07-02 11:20', name: 'Warehouse B Freight Shipping', consumption: '15,000 km', emissions: 18.5, status: 'Auto-Calculated' },
  ]);

  const [goals, setGoals] = useState([
    { id: 1, category: 'Scope 1 Emissions', name: 'Reduce Scope 1 Carbon Footprint by 40%', progress: 65 },
    { id: 2, category: 'Electricity Sources', name: 'Transition Corporate Offices to 100% Renewable', progress: 75 },
    { id: 3, category: 'Logistics Fleet', name: 'Deploy Electric Vehicles for Last-Mile Logistics', progress: 40 },
    { id: 4, category: 'Waste Circularity', name: 'Establish Zero Waste to Landfill Policy at Facilities', progress: 52 },
  ]);

  // SOCIAL HUB MODELS
  const [quests, setQuests] = useState([
    { id: 1, department: 'Environmental Hub', title: 'Tree Planting Initiative 2026', description: 'Join our team in planting 500 saplings in the local community forest.', xpReward: 250, status: 'Active' },
    { id: 2, department: 'Diversity & Inclusion', title: 'D&I Leadership Certification Workshop', description: 'Participate in a 2-day interactive workshop on inclusive leadership patterns.', xpReward: 150, status: 'Active' },
    { id: 3, department: 'Wellness & Logistics', title: 'Biking Commute Challenge', description: 'Log at least 5 commutes via bicycle rather than fossil-fuel vehicles.', xpReward: 200, status: 'Active' },
    { id: 4, department: 'Supply Chain', title: 'Local Vendor Sustainability Evaluation', description: 'Review and score local vendors against corporate ESG standards.', xpReward: 300, status: 'Completed' },
  ]);

  // GOVERNANCE COMMAND MODELS
  const [policies, setPolicies] = useState([
    { id: 1, ref: 'ESG-2026-01', name: 'Code of Business Conduct & Ethics', percent: 95, signed: true },
    { id: 2, ref: 'ESG-2026-02', name: 'Supplier Sustainability Code of Practice', percent: 88, signed: false },
    { id: 3, ref: 'ESG-2026-03', name: 'Fair Labour & Human Rights Policy', percent: 79, signed: false },
    { id: 4, ref: 'ESG-2026-04', name: 'Corporate Whistleblower Protection Standards', percent: 92, signed: true },
  ]);

  const [audits, setAudits] = useState([
    { id: 1, title: 'Hazardous Waste Audit - Facility B', category: 'Environmental', risk: 'Critical', dueDate: '2026-06-15', status: 'Open' },
    { id: 2, title: 'GDPR Compliance and Data Privacy Review', category: 'Governance', risk: 'Medium', dueDate: '2026-08-30', status: 'Open' },
    { id: 3, title: 'Vendor Carbon Disclosure Audit', category: 'Supply Chain', risk: 'High', dueDate: '2026-07-05', status: 'Open' },
    { id: 4, title: 'Occupational Safety Standard Audit', category: 'Social / HR', risk: 'Medium', dueDate: '2026-05-01', status: 'Resolved' },
  ]);

  // GAMIFICATION ARENA MODELS
  const [challenges, setChallenges] = useState([
    { id: 1, type: 'Carbon Savings', duration: 'Jul 1 - Jul 31', title: 'Cut HQ peak energy usage by 15%', status: 'Active', xpReward: 400 },
    { id: 2, type: 'Audit Compliance', duration: 'Aug 1 - Aug 20', title: 'Complete zero-waste inspection checks', status: 'Draft', xpReward: 300 },
    { id: 3, type: 'Diversity', duration: 'Jun 15 - Jul 15', title: 'Publish D&I hiring statistics transparency report', status: 'Under Review', xpReward: 350 },
    { id: 4, type: 'CSR Action', duration: 'May 1 - May 30', title: 'Company-wide clothing drive & reuse program', status: 'Completed', xpReward: 500 },
  ]);

  const [leaderboard, setLeaderboard] = useState([
    { name: 'Marcus Vance', department: 'R&D', xp: 3200 },
    { name: 'Sarah Jenkins', department: 'Logistics', xp: 2950 },
    { name: 'Jane Doe', department: 'Sustainability Operations', xp: 2450, isCurrentUser: true },
    { name: 'David Chen', department: 'Sales', xp: 2100 },
    { name: 'Elena Rostova', department: 'HR', xp: 1950 },
  ]);

  const [rewards, setRewards] = useState([
    { id: 1, name: 'Eco-Friendly Cork Coffee Mug', cost: 200, stock: 15 },
    { id: 2, name: '10 Trees Planted in Your Name', cost: 500, stock: 42 },
    { id: 3, name: 'Organic Cotton Canvas Tote Bag', cost: 150, stock: 0 },
    { id: 4, name: 'Stainless Steel Sustainable Bento Lunch Box', cost: 400, stock: 8 },
    { id: 5, name: '1 Extra Paid Time Off (PTO) Day', cost: 1200, stock: 3 },
  ]);

  const [badges, setBadges] = useState([
    { id: 1, abbr: 'CA', name: 'Carbon Auditor Pro', unlocked: true },
    { id: 2, abbr: 'CS', name: 'CSR Activist', unlocked: true },
    { id: 3, abbr: 'PC', name: 'Policy Champion', unlocked: true },
    { id: 4, abbr: 'NZ', name: 'Net Zero Hero', unlocked: false },
    { id: 5, abbr: 'GS', name: 'Governance Sentinel', unlocked: false },
    { id: 6, abbr: 'BG', name: 'Biodiversity Guardian', unlocked: false },
  ]);

  // Synchronize leaderboard XP when user XP updates
  useEffect(() => {
    setLeaderboard((prev) =>
      prev.map((user) => (user.isCurrentUser ? { ...user, xp: xp } : user))
    );
  }, [xp]);

  // Dynamically recalculate active badges count
  const badgesCount = badges.filter((b) => b.unlocked).length;

  // View routing handler
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            envScore={Math.round(goals.reduce((acc, curr) => acc + curr.progress, 0) / goals.length)}
            socScore={78}
            govScore={Math.round((policies.reduce((acc, curr) => acc + curr.percent, 0) / policies.length))}
            notifications={notifications}
          />
        );
      case 'environmental':
        return (
          <EnvironmentalView
            emissionFactors={emissionFactors}
            setEmissionFactors={setEmissionFactors}
            ledgerEntries={ledgerEntries}
            setLedgerEntries={setLedgerEntries}
            goals={goals}
            setGoals={setGoals}
            addNotification={addNotification}
          />
        );
      case 'social':
        return (
          <SocialHubView
            quests={quests}
            setQuests={setQuests}
            xp={xp}
            setXp={setXp}
            addNotification={addNotification}
          />
        );
      case 'governance':
        return (
          <GovernanceView
            policies={policies}
            setPolicies={setPolicies}
            audits={audits}
            setAudits={setAudits}
            addNotification={addNotification}
          />
        );
      case 'gamification':
        return (
          <GamificationView
            xp={xp}
            setXp={setXp}
            badges={badges}
            rewards={rewards}
            setRewards={setRewards}
            challenges={challenges}
            leaderboard={leaderboard}
            addNotification={addNotification}
            triggerToast={triggerToast}
          />
        );
      default:
        return <div className="text-zinc-400 py-12">View Not Found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex relative">
      {/* Background radial highlight */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-30%] left-[-10%] w-[80%] h-[80%] bg-indigo-500/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/3 rounded-full blur-[140px]" />
      </div>

      {/* Sidebar navigation */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main panel */}
      <div className="flex-1 pl-80 relative z-10 flex flex-col min-h-screen">
        <Navbar
          xp={xp}
          badgesCount={badgesCount}
          notifications={notifications}
          clearNotifications={clearNotifications}
        />
        
        {/* Main Content Area */}
        <main className="flex-1 mt-20 p-8 max-w-7xl w-full mx-auto pb-16">
          {renderActiveView()}
        </main>
      </div>

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-2xl shadow-2xl border text-sm font-semibold flex items-start gap-3 backdrop-blur-xl animate-fade-in-up transition-all ${
              t.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-250'
                : t.type === 'error'
                ? 'bg-red-950/90 border-red-500/30 text-red-250'
                : 'bg-zinc-900/95 border-zinc-800 text-zinc-200'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {t.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : t.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : (
                <Info className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="leading-snug">{t.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
