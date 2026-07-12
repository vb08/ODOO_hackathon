import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  Database,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function EnvironmentalView({ 
  emissionFactors, 
  setEmissionFactors,
  ledgerEntries,
  setLedgerEntries,
  goals,
  setGoals,
  addNotification
}) {
  // Local state for add/edit form
  const [scope, setScope] = useState('Scope 2');
  const [source, setSource] = useState('');
  const [factor, setFactor] = useState('');
  const [unit, setUnit] = useState('kg CO2e / kWh');
  
  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editSource, setEditSource] = useState('');
  const [editFactor, setEditFactor] = useState('');

  // Add factor
  const handleAddFactor = (e) => {
    e.preventDefault();
    if (!source || !factor) return;
    
    const newFactor = {
      id: Date.now(),
      scope,
      source,
      factor: parseFloat(factor),
      unit
    };

    setEmissionFactors([...emissionFactors, newFactor]);
    addNotification(`Added new emission factor: ${source} (${factor} ${unit})`);
    
    // Reset form
    setSource('');
    setFactor('');
  };

  // Delete factor
  const handleDeleteFactor = (id, name) => {
    setEmissionFactors(emissionFactors.filter(f => f.id !== id));
    addNotification(`Deleted emission factor: ${name}`);
  };

  // Start Editing
  const startEdit = (f) => {
    setEditingId(f.id);
    setEditSource(f.source);
    setEditFactor(f.factor.toString());
  };

  // Save Edit
  const saveEdit = (id) => {
    if (!editSource || !editFactor) return;
    
    setEmissionFactors(emissionFactors.map(f => {
      if (f.id === id) {
        return {
          ...f,
          source: editSource,
          factor: parseFloat(editFactor)
        };
      }
      return f;
    }));

    addNotification(`Updated emission factor: ${editSource} to ${editFactor}`);
    setEditingId(null);
  };

  // Interactive Goal Progress Incrementor
  const incrementGoal = (goalId, name) => {
    setGoals(goals.map(g => {
      if (g.id === goalId) {
        const nextProgress = Math.min(100, g.progress + 5);
        if (nextProgress === 100 && g.progress < 100) {
          addNotification(`Sustainability target achieved: ${name}!`);
        } else {
          addNotification(`Progress updated for target: ${name} (+5%)`);
        }
        return { ...g, progress: nextProgress };
      }
      return g;
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="w-2.5 h-8 bg-emerald-500 rounded-full"></span>
          Environmental Operations Center
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Configure scope emission factors, track calculations on the carbon ledger, and advance green metrics.
        </p>
      </div>

      {/* Grid: Config Panel & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Emission Factor Configuration Panel */}
        <div className="lg:col-span-1 glass-card-no-hover p-6">
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" /> Emission Factors
          </h3>
          <p className="text-xs text-zinc-400 mb-6">Quick add or modify coefficients for Scope emissions.</p>

          <form onSubmit={handleAddFactor} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Scope Category</label>
              <select 
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full glass-input"
              >
                <option value="Scope 1">Scope 1 (Direct Emissions)</option>
                <option value="Scope 2">Scope 2 (Indirect - Purchased)</option>
                <option value="Scope 3">Scope 3 (Supply Chain / Travel)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Source Activity / Fuel</label>
              <input 
                type="text" 
                placeholder="e.g. Natural Gas, Grid Electricity" 
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full glass-input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Factor Value</label>
                <input 
                  type="number" 
                  step="0.0001"
                  placeholder="e.g. 0.405" 
                  value={factor}
                  onChange={(e) => setFactor(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Unit</label>
                <input 
                  type="text" 
                  placeholder="kg CO2e / unit" 
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full glass-input"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full glass-button-primary bg-emerald-500/90 text-zinc-950 hover:bg-emerald-400 flex items-center justify-center gap-2 mt-4 font-bold border border-emerald-400/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add Factor Coefficient
            </button>
          </form>
        </div>

        {/* Sustainability Goals section */}
        <div className="lg:col-span-2 glass-card-no-hover p-6 flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" /> Active Sustainability Targets
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
              Q3 Targets
            </span>
          </div>
          <p className="text-xs text-zinc-400 mb-6">Interactive tracking of corporate-wide green milestones.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {goals.map((g) => (
              <div 
                key={g.id} 
                className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex flex-col justify-between hover:border-zinc-800/80 transition-all duration-300 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase">{g.category}</span>
                    <span className="text-xs font-bold text-emerald-400">{g.progress}%</span>
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-200 pr-4">{g.name}</h4>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                  <button 
                    onClick={() => incrementGoal(g.id, g.name)}
                    disabled={g.progress >= 100}
                    className="w-full py-1.5 px-3 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700/80 text-[10px] font-semibold text-zinc-300 hover:text-zinc-100 flex items-center justify-center gap-1 transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    {g.progress >= 100 ? 'Goal Completed' : (
                      <>
                        <span>Increment Progress</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Emission Factor Coefficient List Table */}
      <div className="glass-card-no-hover p-6">
        <h3 className="text-lg font-bold text-white mb-1">Configuration Directory</h3>
        <p className="text-xs text-zinc-400 mb-6">List of factors currently in active calculations context.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-500 font-bold uppercase tracking-wider">
                <th className="pb-3 px-4">Scope</th>
                <th className="pb-3 px-4">Activity Source</th>
                <th className="pb-3 px-4">Factor Coefficient</th>
                <th className="pb-3 px-4">Unit</th>
                <th className="pb-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {emissionFactors.map((f) => (
                <tr key={f.id} className="border-b border-zinc-900 hover:bg-zinc-900/20 text-zinc-300 transition-colors">
                  <td className="py-3.5 px-4 font-semibold">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.scope === 'Scope 1' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      f.scope === 'Scope 2' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {f.scope}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {editingId === f.id ? (
                      <input 
                        type="text" 
                        value={editSource} 
                        onChange={(e) => setEditSource(e.target.value)} 
                        className="glass-input text-xs py-1"
                      />
                    ) : f.source}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    {editingId === f.id ? (
                      <input 
                        type="number" 
                        step="0.0001" 
                        value={editFactor} 
                        onChange={(e) => setEditFactor(e.target.value)} 
                        className="glass-input text-xs py-1 w-24"
                      />
                    ) : f.factor}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-500">{f.unit}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === f.id ? (
                        <button 
                          onClick={() => saveEdit(f.id)}
                          className="p-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => startEdit(f)}
                          className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteFactor(f.id, f.source)}
                        className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-red-900/50 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Carbon Ledger Table */}
      <div className="glass-card-no-hover p-6">
        <h3 className="text-lg font-bold text-white mb-1">Carbon Ledger Book</h3>
        <p className="text-xs text-zinc-400 mb-6">Carbon audit history ledger. Verified calculations by internal engine.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-500 font-bold uppercase tracking-wider">
                <th className="pb-3 px-4">Timestamp</th>
                <th className="pb-3 px-4">Facility / Activity</th>
                <th className="pb-3 px-4">Consumption</th>
                <th className="pb-3 px-4">Calculated Emissions</th>
                <th className="pb-3 px-4">Computation Status</th>
              </tr>
            </thead>
            <tbody>
              {ledgerEntries.map((entry) => (
                <tr key={entry.id} className="border-b border-zinc-900 hover:bg-zinc-900/20 text-zinc-300 transition-colors">
                  <td className="py-3.5 px-4 text-zinc-500 font-mono">{entry.timestamp}</td>
                  <td className="py-3.5 px-4 font-semibold">{entry.name}</td>
                  <td className="py-3.5 px-4">{entry.consumption}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{entry.emissions} tCO2e</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      entry.status === 'Auto-Calculated' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
