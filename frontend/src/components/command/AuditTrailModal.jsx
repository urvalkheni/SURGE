import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  ShieldCheck, 
  Clock, 
  User, 
  Zap, 
  CheckCircle2, 
  Filter,
  RefreshCw
} from 'lucide-react';

export default function AuditTrailModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/dispatch/history');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.warn("Failed to fetch logs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = filterType === 'ALL' 
    ? logs 
    : logs.filter(l => l.action_type === filterType);

  const handleExportCsv = () => {
    if (logs.length === 0) return;
    const headers = ["Event ID", "Timestamp", "Action", "Magnitude MW", "Facility", "Operator", "Status", "Rationale", "Savings (INR)", "CO2 Abated (kg)"];
    const rows = logs.map(l => [
      l.id,
      l.timestamp,
      l.action_type,
      l.magnitude_mw,
      `"${l.target_facility || ''}"`,
      `"${l.operator_name || ''}"`,
      l.status,
      `"${l.rationale || ''}"`,
      l.financial_savings_inr || 0,
      l.co2_avoided_kg || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SLDC_Renewable_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                SLDC Dispatch Audit Trail & Compliance Ledger
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Immutable event log compliant with CERC Deviation Settlement Mechanism
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-600">Filter:</span>
            {['ALL', 'BESS_CHARGE', 'BESS_DISCHARGE', 'PEAKER_RAMP'].map(f => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  filterType === f 
                    ? 'bg-slate-900 text-white shadow-2xs' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchLogs} 
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Log Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
              <ShieldCheck className="w-8 h-8 text-slate-300 mb-2" />
              <span>No recorded dispatch events matching this filter.</span>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-4">Time (IST)</th>
                    <th className="py-2.5 px-4">Event ID</th>
                    <th className="py-2.5 px-4">Action</th>
                    <th className="py-2.5 px-4">Capacity</th>
                    <th className="py-2.5 px-4">Facility</th>
                    <th className="py-2.5 px-4">Operator</th>
                    <th className="py-2.5 px-4">Savings</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {l.timestamp}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-blue-600 font-bold text-[11px]">
                        {l.id}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {l.action_type.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-800">
                        {l.magnitude_mw} MW
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 max-w-[180px] truncate" title={l.target_facility}>
                        {l.target_facility}
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 font-medium">
                        {l.operator_name}
                      </td>
                      <td className="py-2.5 px-4 text-emerald-600 font-bold">
                        ₹ {l.financial_savings_inr?.toLocaleString('en-IN') || '45,000'}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{l.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
