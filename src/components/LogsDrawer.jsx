import React, { useState, useEffect } from 'react';
import { Terminal, RefreshCw, X, Trash2, AlertCircle, CheckCircle2, Info, ChevronRight } from 'lucide-react';

export default function LogsDrawer({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      let interval = null;
      if (autoRefresh) {
        interval = setInterval(fetchLogs, 2000);
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [isOpen, autoRefresh]);

  const handleClearLogs = async () => {
    try {
      await fetch('/api/logs/clear', { method: 'POST' });
      fetchLogs();
      setSelectedLog(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-mono">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <span>NVIDIA API Live Diagnostics & Server Logs</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded-md">
                  {logs.length} entries
                </span>
              </h3>
              <p className="text-xs text-slate-400">Real-time HTTP requests, endpoint tracebacks, and status codes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors flex items-center gap-1.5 ${
                autoRefresh
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span>{autoRefresh ? 'Polling Live' : 'Paused'}</span>
            </button>
            
            <button
              onClick={handleClearLogs}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400"
              title="Clear Logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No server log events recorded yet. Trigger a generation or test key to inspect network logs.
            </div>
          ) : (
            logs.map((log) => {
              const isSelected = selectedLog?.id === log.id;
              
              let levelBadge = 'bg-slate-800 text-slate-300 border-slate-700';
              if (log.level === 'success') levelBadge = 'bg-emerald-950 text-emerald-300 border-emerald-500/40';
              if (log.level === 'warn') levelBadge = 'bg-amber-950 text-amber-300 border-amber-500/40';
              if (log.level === 'error') levelBadge = 'bg-rose-950 text-rose-300 border-rose-500/40';

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(isSelected ? null : log)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/60 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950/80 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${levelBadge}`}>
                        {log.level}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px]">
                        {log.type}
                      </span>
                      <span className="text-slate-200 truncate font-semibold">
                        {log.message}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {log.details && (
                    <div className="mt-2 pt-2 border-t border-slate-800/60">
                      <pre className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-48 leading-relaxed">
                        {typeof log.details === 'object'
                          ? JSON.stringify(log.details, null, 2)
                          : String(log.details)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Backend logs captured via server.js logger buffer</span>
          <button
            onClick={fetchLogs}
            className="text-emerald-400 underline font-semibold"
          >
            Refresh Now
          </button>
        </div>
      </div>
    </div>
  );
}
