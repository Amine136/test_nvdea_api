import React from 'react';
import { SAMPLE_PROMPTS, ASPECT_RATIOS } from '../constants/models';
import { Sparkles, Sliders, Play, RefreshCw, Wand2, Maximize2, ShieldAlert } from 'lucide-react';

export default function GenerationControls({
  prompt,
  onPromptChange,
  negativePrompt,
  onNegativePromptChange,
  aspectRatio,
  onAspectRatioChange,
  steps,
  onStepsChange,
  cfgScale,
  onCfgScaleChange,
  seed,
  onSeedChange,
  onGenerate,
  isGenerating,
  disabledReason,
  selectedModel
}) {

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) return;
    const enhancements = "hyperdetailed 8k render, octane render, RTX raytracing, realistic lighting, highly detailed texture, masterpiece";
    if (prompt.includes(enhancements)) return;
    onPromptChange(`${prompt.trim()}, ${enhancements}`);
  };

  const handleRandomSeed = () => {
    onSeedChange(Math.floor(Math.random() * 10000000).toString());
  };

  return (
    <div className="space-y-5">
      {/* 2. Main Prompt Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-heading">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            2. Text Prompt
          </label>
          <button
            onClick={handleEnhancePrompt}
            disabled={!prompt.trim()}
            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 disabled:opacity-40 flex items-center gap-1 transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Enhance Prompt
          </button>
        </div>

        <div className="relative">
          <textarea
            rows={4}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder={
              selectedModel?.requiresSourceImage
                ? "Describe how to edit the source image (e.g., 'Convert synthetic Omniverse PCB render into photographic solder-light inspection captured at NVIDIA stations')..."
                : "Describe the image you want to generate in detail..."
            }
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 leading-relaxed resize-none font-sans"
          />
          {prompt && (
            <button
              onClick={() => onPromptChange('')}
              className="absolute right-3 bottom-3 text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sample Prompt Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Prompt Ideas:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {SAMPLE_PROMPTS.map((sample, i) => (
              <button
                key={i}
                onClick={() => onPromptChange(sample)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-slate-700 whitespace-nowrap shrink-0 transition-colors"
              >
                {sample.slice(0, 32)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Negative Prompt */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Negative Prompt (Optional)
        </label>
        <input
          type="text"
          value={negativePrompt}
          onChange={(e) => onNegativePromptChange(e.target.value)}
          placeholder="blurry, distorted, low quality, noise, overexposed"
          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-700"
        />
      </div>

      {/* 3. Aspect Ratio Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between font-heading">
          <span className="flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
            3. Aspect Ratio
          </span>
          <span className="text-[11px] font-mono text-emerald-400">{aspectRatio}</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {ASPECT_RATIOS.map((ratio) => {
            const isSelected = aspectRatio === ratio.value;
            return (
              <button
                key={ratio.value}
                onClick={() => onAspectRatioChange(ratio.value)}
                className={`py-2 px-1 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-mono">{ratio.label}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">{ratio.width}x{ratio.height}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Fine-Tuning Sliders */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-heading">
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>4. Fine-Tuning Controls</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Steps */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Steps</span>
              <span className="font-mono text-emerald-400 font-bold">{steps}</span>
            </div>
            <input
              type="range"
              min={4}
              max={50}
              step={1}
              value={steps}
              onChange={(e) => onStepsChange(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* CFG Scale */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">CFG Guidance</span>
              <span className="font-mono text-emerald-400 font-bold">{cfgScale}</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={20.0}
              step={0.5}
              value={cfgScale}
              onChange={(e) => onCfgScaleChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Seed */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Seed</span>
              <button
                onClick={handleRandomSeed}
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-mono"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Random
              </button>
            </div>
            <input
              type="text"
              value={seed}
              onChange={(e) => onSeedChange(e.target.value)}
              placeholder="Random (e.g. 42)"
              className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Disabled Warning Reason if any */}
      {disabledReason && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{disabledReason}</span>
        </div>
      )}

      {/* Main Generate Action Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || Boolean(disabledReason)}
        className="w-full py-4 rounded-xl btn-nvidia flex items-center justify-center gap-3 text-base font-extrabold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin text-black" />
            <span>NVIDIA NIM Generating...</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-black stroke-black" />
            <span>Generate Image with NVIDIA NIM</span>
          </>
        )}
      </button>
    </div>
  );
}
