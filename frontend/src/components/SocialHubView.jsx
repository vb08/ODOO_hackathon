import React, { useState } from 'react';
import { 
  Users, 
  Upload, 
  CheckCircle2, 
  X, 
  FileText, 
  Sparkles,
  PieChart
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SocialHubView({ 
  quests, 
  setQuests, 
  xp, 
  setXp, 
  addNotification 
}) {
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Donut chart measurements
  const radius = 50;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  
  // Diversity statistics: 48% Women (Indigo), 45% Men (Teal), 7% Non-binary (Amber)
  const womenOffset = circumference;
  const menOffset = circumference - (48 / 100) * circumference;
  const nbOffset = circumference - (93 / 100) * circumference; // 48 + 45 = 93

  // Open modal
  const openProofModal = (quest) => {
    setSelectedQuest(quest);
    setUploadedFile(null);
  };

  // Close modal
  const closeModal = () => {
    setSelectedQuest(null);
    setUploadedFile(null);
  };

  // Drag & drop logic
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  // Submit proof
  const handleSubmitProof = (e) => {
    e.preventDefault();
    if (!uploadedFile || !selectedQuest) return;

    // Update quest status
    setQuests(quests.map(q => {
      if (q.id === selectedQuest.id) {
        return { ...q, status: 'Completed', proofFile: uploadedFile.name };
      }
      return q;
    }));

    // Reward user with XP
    const rewardXp = selectedQuest.xpReward;
    setXp(prev => prev + rewardXp);
    addNotification(`Proof submitted for "${selectedQuest.title}". Earned +${rewardXp} XP!`);
    
    // Confetti effect
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#a78bfa', '#10b981']
    });

    closeModal();
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="w-2.5 h-8 bg-indigo-500 rounded-full"></span>
          Social Hub & CSR Workspace
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Participate in corporate social responsibility quests, log employee engagement, and review community impact metrics.
        </p>
      </div>

      {/* Grid: Quests & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CSR Quests Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" /> Active CSR Quests
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quests.map((q) => (
              <div 
                key={q.id} 
                className={`glass-card p-5 flex flex-col justify-between border ${
                  q.status === 'Completed' 
                    ? 'border-indigo-500/20 bg-indigo-500/5 glow-indigo' 
                    : 'border-zinc-800/60'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                      {q.department}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      q.status === 'Completed' 
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                    }`}>
                      {q.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-zinc-200">{q.title}</h4>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{q.description}</p>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> +{q.xpReward} XP
                  </div>

                  {q.status === 'Completed' ? (
                    <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 fill-indigo-500/10" /> Proof Verified
                    </span>
                  ) : (
                    <button 
                      onClick={() => openProofModal(q)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-indigo-500/10"
                    >
                      Join & Submit Proof
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Column */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-400" /> Demographics & Volunteerism
          </h3>

          <div className="glass-card-no-hover p-6 space-y-8">
            
            {/* Donut Chart: Diversity */}
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Outer circle background */}
                  <circle cx="56" cy="56" r={radius} className="stroke-zinc-800" strokeWidth={strokeWidth} fill="transparent" />
                  
                  {/* Arc 1: Women 48% (Indigo) */}
                  <circle 
                    cx="56" 
                    cy="56" 
                    r={radius} 
                    className="stroke-indigo-500" 
                    strokeWidth={strokeWidth} 
                    fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={womenOffset - (48 / 100) * circumference}
                  />

                  {/* Arc 2: Men 45% (Teal) */}
                  <circle 
                    cx="56" 
                    cy="56" 
                    r={radius} 
                    className="stroke-teal-400" 
                    strokeWidth={strokeWidth} 
                    fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={menOffset - (45 / 100) * circumference}
                  />

                  {/* Arc 3: Non-binary 7% (Amber) */}
                  <circle 
                    cx="56" 
                    cy="56" 
                    r={radius} 
                    className="stroke-amber-400" 
                    strokeWidth={strokeWidth} 
                    fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={nbOffset - (7 / 100) * circumference}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Staff</span>
                  <span className="text-sm font-bold text-white">Diversity</span>
                </div>
              </div>

              {/* Diversity Legend */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-zinc-300 font-semibold">Women (48%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                  <span className="text-zinc-300 font-semibold">Men (45%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-zinc-300 font-semibold">Non-binary (7%)</span>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-zinc-800/60" />

            {/* Donut Chart: Engagement */}
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r={radius} className="stroke-zinc-800" strokeWidth={strokeWidth} fill="transparent" />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r={radius} 
                    className="stroke-indigo-400" 
                    strokeWidth={strokeWidth} 
                    fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (72 / 100) * circumference}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Rate</span>
                  <span className="text-base font-extrabold text-white">72%</span>
                </div>
              </div>

              {/* Engagement Legend */}
              <div className="text-xs">
                <h4 className="font-bold text-zinc-200">Active Volunteers</h4>
                <p className="text-zinc-400 mt-1 leading-relaxed">
                  Percentage of active employees participating in CSR initiatives quarterly.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Mock Proof Submitter Modal */}
      {selectedQuest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl animate-fade-in-up relative overflow-hidden"
            onDragEnter={handleDrag}
          >
            {/* Background flourish */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Submit Completion Proof</h3>
                <p className="text-xs text-zinc-400 mt-1">Submit visual / document evidence to claim XP.</p>
              </div>
              <button 
                onClick={closeModal}
                className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitProof} className="space-y-6">
              
              {/* Quest detail box */}
              <div className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="text-[9px] font-bold text-indigo-400 block uppercase">Selected Activity</span>
                  <span className="font-semibold text-zinc-300">{selectedQuest.title}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-zinc-500 block uppercase">Reward</span>
                  <span className="font-bold text-indigo-400">+{selectedQuest.xpReward} XP</span>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div 
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                  dragActive 
                    ? 'border-indigo-500 bg-indigo-500/5' 
                    : uploadedFile 
                    ? 'border-emerald-500/50 bg-emerald-500/5' 
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950'
                }`}
              >
                <input 
                  type="file" 
                  id="proof-uploader" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf,.docx"
                />
                
                <label htmlFor="proof-uploader" className="w-full flex flex-col items-center cursor-pointer">
                  {uploadedFile ? (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-zinc-200 text-center max-w-[200px] truncate">
                        {uploadedFile.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 mt-1">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-zinc-300">
                        Drag and drop proof file, or <span className="text-indigo-400 underline">browse</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 mt-1">
                        Supports PDF, PNG, JPG, or DOCX (max 10MB)
                      </span>
                    </>
                  )}
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-2 border-t border-zinc-800/60">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!uploadedFile}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-zinc-950 disabled:opacity-50 disabled:pointer-events-none text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/10"
                >
                  Submit & Verify Proof
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
