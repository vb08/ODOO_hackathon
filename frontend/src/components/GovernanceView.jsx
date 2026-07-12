import React from 'react';
import { 
  ShieldAlert, 
  CheckSquare, 
  Calendar, 
  AlertOctagon, 
  UserCheck, 
  Sparkles,
  FileCheck2
} from 'lucide-react';

export default function GovernanceView({ 
  policies, 
  setPolicies, 
  audits, 
  setAudits, 
  addNotification 
}) {
  
  // Current Date for Overdue Calculations (Mocked to the session time: July 12, 2026)
  const CURRENT_DATE = new Date('2026-07-12');

  // Toggle Policy Acknowledgment
  const handleAcknowledge = (id, name, alreadySigned) => {
    setPolicies(policies.map(p => {
      if (p.id === id) {
        const nextSigned = !p.signed;
        const diff = nextSigned ? 1 : -1;
        const newPercent = Math.min(100, Math.max(0, p.percent + diff));
        
        if (nextSigned) {
          addNotification(`Acknowledged policy: ${name}. Status updated.`);
        } else {
          addNotification(`Revoked acknowledgement for: ${name}.`);
        }
        
        return {
          ...p,
          signed: nextSigned,
          percent: newPercent
        };
      }
      return p;
    }));
  };

  // Helper to check if an audit is overdue
  const isAuditOverdue = (dueDateStr, status) => {
    if (status === 'Resolved') return false;
    const dueDate = new Date(dueDateStr);
    return dueDate < CURRENT_DATE;
  };

  // Resolve audit issue (interactive action)
  const resolveAudit = (id, name) => {
    setAudits(audits.map(a => {
      if (a.id === id) {
        addNotification(`Resolved audit issue: "${name}"`);
        return { ...a, status: 'Resolved' };
      }
      return a;
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <span className="w-2.5 h-8 bg-amber-500 rounded-full"></span>
          Governance & Compliance Control
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Review policy compliance sign-offs, manage corporate oversight, and resolve audit warning triggers.
        </p>
      </div>

      {/* Grid: Policies & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Policies Directory */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-amber-400" /> Corporate ESG Policies
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map((p) => (
              <div 
                key={p.id} 
                className={`glass-card p-5 flex flex-col justify-between border ${
                  p.signed 
                    ? 'border-amber-500/20 bg-amber-500/5 glow-amber' 
                    : 'border-zinc-800/60'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-semibold text-zinc-500 font-mono">
                      Ref: {p.ref}
                    </span>
                    {p.signed && (
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold uppercase">
                        Acknowledged
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-zinc-200">{p.name}</h4>
                  
                  {/* Progress bar */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Employee Acknowledgment</span>
                      <span className="font-bold text-zinc-300">{p.percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-850 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${p.percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => handleAcknowledge(p.id, p.name, p.signed)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      p.signed 
                        ? 'bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-750' 
                        : 'bg-amber-500/90 text-zinc-950 hover:bg-amber-400 shadow-md shadow-amber-500/10'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    {p.signed ? 'Revoke Sign-off' : 'Sign & Acknowledge'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Stats Info Card */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-amber-400" /> Compliance Status
          </h3>

          <div className="glass-card-no-hover p-6 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-3">
                <span className="text-zinc-400 font-semibold">Active Audits</span>
                <span className="text-zinc-200 font-bold">{audits.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-3">
                <span className="text-zinc-400 font-semibold">Unresolved Overdue</span>
                <span className="text-red-400 font-bold">
                  {audits.filter(a => isAuditOverdue(a.dueDate, a.status)).length} Issues
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-3">
                <span className="text-zinc-400 font-semibold">Audit Health Index</span>
                <span className="text-emerald-400 font-bold">88 / 100</span>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-zinc-200">System Priority Notice</h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">
                  Overdue issues are automatically reported to governance oversight boards. Immediate resolution is requested.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Compliance Issue Board Table */}
      <div className="glass-card-no-hover p-6">
        <h3 className="text-lg font-bold text-white mb-1">Compliance Issue Board</h3>
        <p className="text-xs text-zinc-400 mb-6">Continuous tracking of external regulatory reviews and internal audits.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-500 font-bold uppercase tracking-wider">
                <th className="pb-3 px-4">Audit Issue</th>
                <th className="pb-3 px-4">Category</th>
                <th className="pb-3 px-4">Risk Level</th>
                <th className="pb-3 px-4">Due Date</th>
                <th className="pb-3 px-4">Audit Status</th>
                <th className="pb-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((a) => {
                const overdue = isAuditOverdue(a.dueDate, a.status);
                
                return (
                  <tr 
                    key={a.id} 
                    className={`border-b border-zinc-900 transition-colors ${
                      overdue ? 'bg-red-500/[0.02] hover:bg-red-500/[0.04]' : 'hover:bg-zinc-900/20'
                    }`}
                  >
                    <td className="py-4 px-4 font-semibold text-zinc-200">
                      <div className="flex items-center gap-2">
                        {overdue && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
                        <span>{a.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-zinc-400">{a.category}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        a.risk === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        a.risk === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                      }`}>
                        {a.risk}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-zinc-500 font-mono">{a.dueDate}</td>
                    <td className="py-4 px-4">
                      {a.status === 'Resolved' ? (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold">
                          Resolved
                        </span>
                      ) : overdue ? (
                        <span className="px-2.5 py-1 rounded text-[10px] font-extrabold uppercase overdue-glow bg-red-600 text-white tracking-wide shrink-0">
                          OVERDUE ALERT
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded text-[9px] font-bold">
                          Open
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {a.status !== 'Resolved' && (
                        <button 
                          onClick={() => resolveAudit(a.id, a.title)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                            overdue 
                              ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-zinc-950 hover:border-transparent' 
                              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'
                          }`}
                        >
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
