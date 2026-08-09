import React, { useState } from 'react';
import { Download, ZoomIn, Copy, Check, Sparkles, Clock, HardDrive, Bookmark, Trash2, Split, Eye, Layers, AlertTriangle } from 'lucide-react';

export default function OutputGallery({
  currentResult,
  isGenerating,
  history,
  onSelectFromHistory,
  onClearHistory,
  onToggleFavorite,
  sourceImagePreview
}) {
  const [copied, setCopied] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (isGenerating) {
    return (
      <div className="w-full h-full min-h-[500px] rounded-2xl glass-panel border border-slate-800 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <div className="absolute inset-3 rounded-full border-4 border-emerald-500/40 border-b-lime-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white font-heading">NVIDIA NIM Processing</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Synthesizing tensor diffusion calculations on NVIDIA acceleration infrastructure...
          </p>
        </div>
      </div>
    );
  }

  if (!currentResult) {
    return (
      <div className="w-full h-full min-h-[500px] rounded-2xl glass-panel border border-slate-800/80 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
          <Layers className="w-10 h-10" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-base font-bold text-slate-300 font-heading">Canvas Workspace Ready</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Select a model from the 8 NVIDIA hosted models on the left, enter your prompt, and click Generate to see live diffusion outputs here!
          </p>
        </div>
      </div>
    );
  }

  const { imageData, metadata, isDemo } = currentResult;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `nvidia_nim_${metadata?.model_id || 'generation'}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(imageData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Active Image Viewport Container */}
      <div className="relative rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl group">
        
        {/* Demo Mode Badge */}
        {isDemo && (
          <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-black font-extrabold text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo Mode Preview</span>
          </div>
        )}

        {/* Action Overlay Toolbar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-xl opacity-90 group-hover:opacity-100 transition-opacity">
          {sourceImagePreview && (
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                compareMode ? 'bg-cyan-500 text-black font-bold' : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Toggle Before / After Split View"
            >
              <Split className="w-4 h-4" />
              <span className="hidden sm:inline">Split View</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Copy Image Data URI"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setZoomOpen(true)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Full Screen Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>

        {/* Display Canvas */}
        <div className="w-full min-h-[420px] max-h-[600px] bg-slate-950/90 flex items-center justify-center p-4">
          {imgError ? (
            <div className="p-8 text-center space-y-3 max-w-md">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Image Render Format Error</h4>
              <p className="text-xs text-slate-400">
                The image data string returned by the API could not be parsed by your browser image decoder.
              </p>
              <button
                onClick={() => setImgError(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 font-mono"
              >
                Retry Render
              </button>
            </div>
          ) : compareMode && sourceImagePreview ? (
            <div className="grid grid-cols-2 gap-4 w-full h-full max-h-[550px] items-center">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/30">
                  Original Source
                </span>
                <img
                  src={sourceImagePreview}
                  alt="Original Source"
                  className="max-h-[480px] w-auto object-contain rounded-xl border border-slate-800"
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
                  NVIDIA Edited Output
                </span>
                <img
                  src={imageData}
                  alt="NVIDIA Edited Result"
                  onError={() => setImgError(true)}
                  className="max-h-[480px] w-auto object-contain rounded-xl border border-emerald-500/40 shadow-2xl"
                />
              </div>
            </div>
          ) : (
            <img
              src={imageData}
              alt="Generated Output"
              onError={() => setImgError(true)}
              className="max-h-[550px] w-auto object-contain rounded-xl shadow-2xl border border-slate-800/80 cursor-pointer"
              onClick={() => setZoomOpen(true)}
            />
          )}
        </div>

        {/* Metadata Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-300 font-semibold font-heading">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{metadata?.model_id || 'NVIDIA NIM Model'}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span>Ratio: <strong className="text-slate-200">{metadata?.aspect_ratio}</strong></span>
              <span>Steps: <strong className="text-slate-200">{metadata?.steps}</strong></span>
              {metadata?.seed && <span>Seed: <strong className="text-slate-200">{metadata.seed}</strong></span>}
            </div>
          </div>
          <p className="text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 text-[11px]">
            "{metadata?.prompt}"
          </p>
        </div>
      </div>

      {/* History Strip */}
      {history && history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-heading">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Recent Generations ({history.length})
            </h4>
            <button
              onClick={onClearHistory}
              className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear History
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {history.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectFromHistory(item)}
                className="group relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden cursor-pointer hover:border-emerald-500 transition-all aspect-square"
              >
                <img
                  src={item.imageData}
                  alt={item.metadata?.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-emerald-400 truncate">
                    {item.metadata?.model_id}
                  </span>
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(item);
                      }}
                      className="p-1 rounded-md bg-slate-900/80 text-amber-400"
                    >
                      <Bookmark className="w-3 h-3 fill-amber-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Zoom Lightbox Modal */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img
              src={imageData}
              alt="Zoomed Output"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-slate-800"
            />
            <p className="text-xs text-slate-400 mt-3 font-mono">
              Click anywhere to close preview
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
