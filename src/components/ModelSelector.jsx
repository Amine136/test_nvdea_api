import React, { useState } from 'react';
import { NVIDIA_MODELS } from '../constants/models';
import { Layers, Image as ImageIcon, Sparkles, Search, PlusCircle, Check, Info } from 'lucide-react';

export default function ModelSelector({
  selectedModelId,
  onSelectModel,
  customModelId,
  onCustomModelChange
}) {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'TXT2IMG' | 'EDIT'
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(selectedModelId === 'custom');

  const filteredModels = NVIDIA_MODELS.filter((m) => {
    const matchesSearch =
      m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'TXT2IMG') return !m.requiresSourceImage;
    if (activeTab === 'EDIT') return m.requiresSourceImage || m.allowSourceImage;
    return true;
  });

  const handleSelect = (model) => {
    setIsCustomMode(false);
    onSelectModel(model.id);
  };

  const handleToggleCustom = () => {
    setIsCustomMode(true);
    onSelectModel('custom');
  };

  return (
    <div className="space-y-4">
      {/* Header & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
            1. Select NVIDIA Model
          </h2>
          <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded-md border border-slate-700">
            {NVIDIA_MODELS.length} catalog models
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              activeTab === 'ALL'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Models
          </button>
          <button
            onClick={() => setActiveTab('TXT2IMG')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              activeTab === 'TXT2IMG'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Text-to-Image
          </button>
          <button
            onClick={() => setActiveTab('EDIT')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              activeTab === 'EDIT'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Image Editing
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search models (e.g., flux, qwen, sd3.5, nvpcb)..."
          className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
        {filteredModels.map((model) => {
          const isSelected = !isCustomMode && selectedModelId === model.id;

          return (
            <div
              key={model.id}
              onClick={() => handleSelect(model)}
              className={`group relative p-3.5 rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? 'glass-card active border-emerald-500 ring-1 ring-emerald-500/50'
                  : 'glass-card hover:border-slate-700'
              }`}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white group-hover:text-emerald-400 transition-colors">
                      {model.displayName}
                    </span>
                    {model.requiresSourceImage && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30 rounded">
                        Edit Mode
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {model.vendor}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 text-[10px] bg-slate-950/80 text-slate-400 border border-slate-800 rounded-md">
                    {model.badge}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-400 text-black'
                        : 'border-slate-700 bg-slate-900 group-hover:border-slate-500'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-300 line-clamp-2 mb-2.5 leading-relaxed">
                {model.description}
              </p>

              {/* Tag Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {model.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-[9px] font-medium bg-slate-950/60 text-slate-400 border border-slate-800/80 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
                {model.usageCount && (
                  <span className="text-[10px] text-emerald-400/80 ml-auto font-mono">
                    🔥 {model.usageCount}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Option for Custom Model ID */}
        <div
          onClick={handleToggleCustom}
          className={`p-3.5 rounded-xl cursor-pointer transition-all border border-dashed flex flex-col justify-center ${
            isCustomMode
              ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300'
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white">Specify Custom Model Endpoint</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Enter any custom NVIDIA NIM or OpenAI compatible model identifier string.
          </p>
        </div>
      </div>

      {/* Custom Model Input Box */}
      {isCustomMode && (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2 animate-fadeIn">
          <label className="block text-xs font-medium text-emerald-300 flex items-center justify-between">
            <span>Enter NVIDIA Model ID / Path:</span>
            <span className="text-[10px] text-slate-400 font-mono">e.g. nvidia/sana or provider/model-name</span>
          </label>
          <input
            type="text"
            value={customModelId}
            onChange={(e) => onCustomModelChange(e.target.value)}
            placeholder="e.g. nvidia/sana or stabilityai/sdxl-turbo"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />
        </div>
      )}
    </div>
  );
}
