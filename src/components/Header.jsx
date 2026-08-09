import React from 'react';
import { Key, Cpu, Sparkles, ShieldCheck, AlertCircle, RefreshCw, Terminal, Layers } from 'lucide-react';

export default function Header({
  apiKey,
  onOpenKeyModal,
  isDemoMode,
  onToggleDemoMode,
  selectedModel,
  onReset,
  onOpenLogs
}) {
  const hasKey = Boolean(apiKey && apiKey.trim().length > 0);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 glass-panel px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-lime-500 to-emerald-700 p-[2px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-heading">
                NVIDIA <span className="text-emerald-400">NIM</span> Studio
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Localhost v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Visual Generative AI Catalog</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-mono text-[11px]">8 Models Ready</span>
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3 flex-wrap justify-end w-full sm:w-auto">
          {/* Live Logs Button */}
          <button
            onClick={onOpenLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
            title="View Live Network Logs & Server Diagnostics"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Logs</span>
          </button>

          {/* Demo Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5">
            <Sparkles className={`w-4 h-4 ${isDemoMode ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
            <span className="text-xs font-medium text-slate-300">Demo Canvas:</span>
            <button
              onClick={onToggleDemoMode}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDemoMode ? 'bg-amber-500' : 'bg-slate-700'
              }`}
              title="Toggle preview canvas mode when testing without using API quota"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isDemoMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* API Key Status / Config Button */}
          <button
            onClick={onOpenKeyModal}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              hasKey
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-500'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50 hover:border-amber-500 animate-pulse'
            }`}
          >
            {hasKey ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>NVIDIA Key Active</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Set NVIDIA Key</span>
              </>
            )}
            <Key className="w-3.5 h-3.5 opacity-60 ml-1" />
          </button>

          {/* Reset Workspace */}
          <button
            onClick={onReset}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset active prompt & settings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
