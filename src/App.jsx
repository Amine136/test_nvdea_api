import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ApiKeyModal from './components/ApiKeyModal';
import ModelSelector from './components/ModelSelector';
import ImageUploader from './components/ImageUploader';
import GenerationControls from './components/GenerationControls';
import OutputGallery from './components/OutputGallery';
import LogsDrawer from './components/LogsDrawer';
import { NVIDIA_MODELS } from './constants/models';
import { getStoredApiKey, setStoredApiKey, generateImageApi } from './utils/nvidiaApi';
import { AlertCircle, Terminal, Sparkles, RefreshCw } from 'lucide-react';

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [selectedModelId, setSelectedModelId] = useState('qwen-image-edit-nvpcb-ovsl2sl');
  const [customModelId, setCustomModelId] = useState('');

  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [steps, setSteps] = useState(30);
  const [cfgScale, setCfgScale] = useState(7.0);
  const [seed, setSeed] = useState('');

  const [sourceImage, setSourceImage] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [errorBanner, setErrorBanner] = useState(null);

  // Initialize key from localStorage
  useEffect(() => {
    const savedKey = getStoredApiKey();
    if (savedKey) {
      setApiKey(savedKey);
      setIsDemoMode(false);
    } else {
      setIsDemoMode(true); // default to demo canvas mode if key not provided yet
    }
  }, []);

  // Get active model metadata object
  const selectedModel = NVIDIA_MODELS.find(m => m.id === selectedModelId) || {
    id: 'custom',
    displayName: customModelId || 'Custom Model',
    vendor: 'Custom',
    requiresSourceImage: false,
    description: 'Custom model endpoint specified by user'
  };

  // Update default steps when model changes
  const handleSelectModel = (id) => {
    setSelectedModelId(id);
    const modelObj = NVIDIA_MODELS.find(m => m.id === id);
    if (modelObj?.defaultSteps) {
      setSteps(modelObj.defaultSteps);
    }
    setErrorBanner(null);
  };

  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    setStoredApiKey(newKey);
    if (newKey) {
      setIsDemoMode(false);
    }
  };

  const handleResetWorkspace = () => {
    setPrompt('');
    setNegativePrompt('');
    setAspectRatio('1:1');
    setSteps(selectedModel.defaultSteps || 30);
    setCfgScale(7.0);
    setSeed('');
    setSourceImage(null);
    setErrorBanner(null);
  };

  // Check if button should be disabled with explanation
  let disabledReason = null;
  if (selectedModel.requiresSourceImage && !sourceImage) {
    disabledReason = `This model (${selectedModel.displayName}) requires a source image input. Upload an image above.`;
  } else if (!isDemoMode && !apiKey.trim()) {
    disabledReason = 'NVIDIA API Key missing. Click "Set NVIDIA Key" in top header or enable Demo Mode.';
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorBanner('Please enter a text prompt to generate.');
      return;
    }

    if (selectedModel.requiresSourceImage && !sourceImage) {
      setErrorBanner(`The selected model "${selectedModel.displayName}" requires a source image to edit.`);
      return;
    }

    setIsGenerating(true);
    setErrorBanner(null);

    const activeModelId = selectedModelId === 'custom' ? customModelId : selectedModelId;
    const endpointId = selectedModel?.endpointId || activeModelId;

    try {
      const data = await generateImageApi({
        prompt,
        negativePrompt,
        modelId: activeModelId,
        endpointId,
        aspectRatio,
        steps,
        cfgScale,
        seed,
        sourceImageFile: sourceImage?.file,
        sourceImageBase64: sourceImage?.previewUrl,
        useDemoMode: isDemoMode
      });

      setCurrentResult(data);
      setHistory(prev => [data, ...prev.slice(0, 15)]);

    } catch (err) {
      console.error('Generation Failed:', err);
      setErrorBanner(err.message || 'Image generation failed. Check NVIDIA API key permissions or try Demo mode.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        apiKey={apiKey}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
        selectedModel={selectedModel}
        onReset={handleResetWorkspace}
        onOpenLogs={() => setIsLogsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* Diagnostic Error Alert Banner */}
        {errorBanner && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn shadow-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="font-bold text-sm block text-white">NVIDIA API Endpoint Error</strong>
                <p className="text-slate-300 leading-relaxed max-w-2xl">{errorBanner}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                onClick={() => setIsLogsOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 hover:bg-slate-800 font-mono text-[11px] flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>View Network Logs</span>
              </button>
              
              <button
                onClick={() => setIsDemoMode(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-[11px] flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Switch to Demo</span>
              </button>

              <button
                onClick={() => setErrorBanner(null)}
                className="px-2.5 py-1.5 bg-rose-900/50 hover:bg-rose-900 rounded-xl text-white font-medium text-[11px]"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Studio Layout: Left Controls / Right Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Model Selection & Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Model Selector */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 shadow-xl">
              <ModelSelector
                selectedModelId={selectedModelId}
                onSelectModel={handleSelectModel}
                customModelId={customModelId}
                onCustomModelChange={setCustomModelId}
              />
            </div>

            {/* Source Image Uploader (Shown for edit / in-context models) */}
            {(selectedModel.requiresSourceImage || selectedModel.allowSourceImage) && (
              <div className="p-5 rounded-2xl glass-panel border border-cyan-900/40 shadow-xl animate-fadeIn">
                <ImageUploader
                  sourceImage={sourceImage}
                  onImageChange={setSourceImage}
                  onClearImage={() => setSourceImage(null)}
                  isRequired={selectedModel.requiresSourceImage}
                  modelName={selectedModel.displayName}
                />
              </div>
            )}

            {/* 2 & 3. Prompt & Generation Parameters */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-800 shadow-xl">
              <GenerationControls
                prompt={prompt}
                onPromptChange={setPrompt}
                negativePrompt={negativePrompt}
                onNegativePromptChange={setNegativePrompt}
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                steps={steps}
                onStepsChange={setSteps}
                cfgScale={cfgScale}
                onCfgScaleChange={setCfgScale}
                seed={seed}
                onSeedChange={setSeed}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                disabledReason={disabledReason}
                selectedModel={selectedModel}
              />
            </div>
          </div>

          {/* Right Column: Output Viewport & History */}
          <div className="lg:col-span-7">
            <div className="sticky top-20">
              <OutputGallery
                currentResult={currentResult}
                isGenerating={isGenerating}
                history={history}
                onSelectFromHistory={(item) => setCurrentResult(item)}
                onClearHistory={() => setHistory([])}
                onToggleFavorite={() => {}}
                sourceImagePreview={sourceImage?.previewUrl}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        <p>Powered by NVIDIA NIM (Inference Microservices) & NVIDIA Developer Program APIs • Localhost Web Application</p>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />

      {/* Live Server & Diagnostics Logs Drawer */}
      <LogsDrawer
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
      />
    </div>
  );
}
