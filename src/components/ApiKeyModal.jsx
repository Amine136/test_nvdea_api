import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle2, AlertCircle, ExternalLink, Loader2, Server, Globe } from 'lucide-react';
import { testApiKey, getStoredCustomUrl, setStoredCustomUrl } from '../utils/nvidiaApi';

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveKey }) {
  const [keyInput, setKeyInput] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setKeyInput(apiKey || '');
      setCustomUrlInput(getStoredCustomUrl() || '');
      setTestResult(null);
    }
  }, [isOpen, apiKey]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!keyInput.trim()) {
      setTestResult({ success: false, error: 'Please enter a valid API key to test.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const result = await testApiKey(keyInput.trim());
    setTesting(false);
    setTestResult(result);
  };

  const handleSave = () => {
    onSaveKey(keyInput.trim());
    setStoredCustomUrl(customUrlInput.trim());
    onClose();
  };

  const handleClear = () => {
    setKeyInput('');
    setCustomUrlInput('');
    onSaveKey('');
    setStoredCustomUrl('');
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glass-panel">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Key className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">NVIDIA API Configuration</h3>
              <p className="text-xs text-slate-400">Manage your NVIDIA NIM API Credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Instructions Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 font-medium text-emerald-400">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>How to get an NVIDIA API Key:</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              1. Visit <a href="https://build.nvidia.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">build.nvidia.com</a> and log in with your free NVIDIA account.<br/>
              2. Browse to any visual model (e.g. <i>FLUX.1-schnell</i> or <i>Qwen-Image</i>).<br/>
              3. Click <b>"Get API Key"</b> and copy your key starting with <code className="text-slate-200">nvapi-...</code>.
            </p>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              NVIDIA API Key <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="nvapi-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-emerald-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              {keyInput && (
                <button
                  type="button"
                  onClick={() => setKeyInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Optional Base URL Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                Custom Endpoint URL (Optional)
              </label>
              <span className="text-[10px] text-slate-500">Default: ai.api.nvidia.com</span>
            </div>
            <input
              type="text"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="https://ai.api.nvidia.com/v1"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-600"
            />
          </div>

          {/* Test API Key Button */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={testing || !keyInput.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-medium text-slate-200 transition-colors border border-slate-700"
            >
              {testing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Connecting to NVIDIA...</span>
                </>
              ) : (
                <>
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Connection</span>
                </>
              )}
            </button>

            {keyInput && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-rose-400 hover:text-rose-300 underline"
              >
                Remove Saved Key
              </button>
            )}
          </div>

          {/* Test Results Message */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="font-semibold">{testResult.message || testResult.error}</p>
                {testResult.modelsCount > 0 && (
                  <p className="text-[11px] opacity-80">Catalog verified. {testResult.modelsCount} NIM models online.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-nvidia px-5 py-2 rounded-xl text-xs"
          >
            Save Key & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
