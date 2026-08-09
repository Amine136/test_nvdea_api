import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, AlertCircle, Sparkles } from 'lucide-react';

export default function ImageUploader({
  sourceImage,
  onImageChange,
  onClearImage,
  isRequired = false,
  modelName = ""
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onImageChange({
        file,
        previewUrl: event.target.result,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Sample quick images for testing (synthetic PCB / portrait demo)
  const handleLoadSamplePcb = () => {
    const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <rect width="100%" height="100%" fill="#052010"/>
      <rect x="40" y="40" width="432" height="432" fill="#0b381e" stroke="#10b981" stroke-width="4" rx="16"/>
      <circle cx="120" cy="120" r="24" fill="#fbbf24"/>
      <circle cx="392" cy="120" r="24" fill="#fbbf24"/>
      <circle cx="120" cy="392" r="24" fill="#fbbf24"/>
      <circle cx="392" cy="392" r="24" fill="#fbbf24"/>
      <path d="M 120 120 L 256 256 L 392 120 M 120 392 L 256 256 L 392 392" stroke="#34d399" stroke-width="6" fill="none"/>
      <rect x="216" y="216" width="80" height="80" fill="#1e293b" stroke="#38bdf8" stroke-width="3" rx="8"/>
      <text x="256" y="262" font-family="sans-serif" font-size="14" fill="#38bdf8" text-anchor="middle">PCB IC</text>
      <text x="256" y="460" font-family="sans-serif" font-size="16" fill="#10b981" font-weight="bold" text-anchor="middle">NVIDIA Omniverse Synthetic PCB Sample</text>
    </svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(sampleSvg)}`;
    onImageChange({
      file: null,
      previewUrl: dataUrl,
      name: 'synthetic_pcb_sample.svg'
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
          Source Image {isRequired && <span className="text-cyan-400">* Required for Edit</span>}
        </label>
        <span className="text-[10px] text-slate-400">
          Target for: <span className="text-cyan-300 font-medium">{modelName}</span>
        </span>
      </div>

      {!sourceImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/30'
              : isRequired
              ? 'border-cyan-500/50 bg-cyan-950/10 hover:border-cyan-400'
              : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Drag & Drop Source Image or <span className="text-cyan-400 underline">Browse</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG, or WebP up to 15MB
              </p>
            </div>

            {/* Quick sample button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadSamplePcb();
                }}
                className="px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-[11px] text-cyan-300 hover:bg-cyan-900/80 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Load Sample Synthetic PCB Image
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl border border-cyan-500/40 bg-slate-950 p-3 flex items-center gap-4">
          <img
            src={sourceImage.previewUrl}
            alt="Source Preview"
            className="w-20 h-20 object-cover rounded-lg border border-slate-800"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white truncate">
                {sourceImage.name || 'Uploaded Source Image'}
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30 rounded">
                Active Source
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              This image will be passed to {modelName} for style editing & solder-light conversion.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] text-cyan-400 hover:underline mt-1 font-medium"
            >
              Change Image
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <button
            onClick={onClearImage}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Remove source image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
