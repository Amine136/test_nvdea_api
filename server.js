import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory server logs array for diagnostic monitoring
const serverLogs = [];

function addLog(level, type, message, details = null) {
  const logItem = {
    id: Date.now() + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toISOString(),
    level, // 'info' | 'warn' | 'error' | 'success'
    type,
    message,
    details
  };
  serverLogs.unshift(logItem);
  if (serverLogs.length > 200) serverLogs.pop(); // Keep last 200 logs
  console.log(`[${logItem.timestamp}] [${level.toUpperCase()}] [${type}] ${message}`);
}

/**
 * Robust Base64 & Data URI image helper
 */
function formatBase64Image(rawStr) {
  if (!rawStr || typeof rawStr !== 'string') return null;
  const str = rawStr.trim();
  if (str.startsWith('data:') || str.startsWith('http://') || str.startsWith('https://')) {
    return str;
  }

  // Detect image MIME format from header magic bytes
  if (str.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${str}`;
  } else if (str.startsWith('iVBORw0KGgo')) {
    return `data:image/png;base64,${str}`;
  } else if (str.startsWith('UklGR')) {
    return `data:image/webp;base64,${str}`;
  } else if (str.startsWith('PHN2Zw') || str.startsWith('%3Csvg')) {
    return `data:image/svg+xml;base64,${str}`;
  }

  return `data:image/png;base64,${str}`;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }
});

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'NVIDIA NIM Image Generation Backend',
    timestamp: new Date().toISOString()
  });
});

/**
 * Endpoint to retrieve server logs for monitoring
 */
app.get('/api/logs', (req, res) => {
  res.json({
    success: true,
    logs: serverLogs
  });
});

/**
 * Endpoint to clear logs
 */
app.post('/api/logs/clear', (req, res) => {
  serverLogs.length = 0;
  addLog('info', 'SYSTEM', 'Logs cleared by user.');
  res.json({ success: true });
});

/**
 * Endpoint to test NVIDIA API Key
 */
app.post('/api/test-key', async (req, res) => {
  const apiKey = req.body.apiKey || req.headers.authorization?.replace('Bearer ', '');

  if (!apiKey) {
    addLog('warn', 'TEST_KEY', 'API key missing in request.');
    return res.status(400).json({ success: false, error: 'API key is required.' });
  }

  addLog('info', 'TEST_KEY', 'Verifying API Key against NVIDIA catalog...');

  const testEndpoints = [
    'https://integrate.api.nvidia.com/v1/models',
    'https://ai.api.nvidia.com/v1/genai/models'
  ];

  for (const url of testEndpoints) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        addLog('success', 'TEST_KEY', `Key successfully validated against ${url}`);
        return res.json({
          success: true,
          message: 'NVIDIA API Key is valid and authenticated!',
          modelsCount: data?.data?.length || 0
        });
      } else {
        const errText = await response.text();
        addLog('warn', 'TEST_KEY', `Verification at ${url} returned HTTP ${response.status}`, errText);
      }
    } catch (err) {
      addLog('error', 'TEST_KEY', `Connection error testing key at ${url}: ${err.message}`);
    }
  }

  return res.status(401).json({
    success: false,
    error: 'NVIDIA API Key verification failed. Ensure your key starts with nvapi- and has active permissions.'
  });
});

/**
 * Known mapping of specific NVIDIA catalog model paths
 */
function getTargetUrlsForModel(modelId, endpointId, customBaseUrl) {
  const urls = [];

  if (customBaseUrl && customBaseUrl.trim()) {
    urls.push(`${customBaseUrl.trim().replace(/\/+$/, '')}/${endpointId || modelId}`);
  }

  const clean = (modelId || '').toLowerCase();

  // Model-specific exact NVIDIA API paths across ai.api.nvidia.com & integrate.api.nvidia.com
  if (clean.includes('nvpcb') || clean.includes('qwen-image-edit-nvpcb')) {
    urls.push('https://ai.api.nvidia.com/v1/genai/nvidia/qwen-image-edit-nvpcb-ovsl2sl');
    urls.push('https://integrate.api.nvidia.com/v1/genai/nvidia/qwen-image-edit-nvpcb-ovsl2sl');
  } else if (clean.includes('qwen-image-edit')) {
    urls.push('https://ai.api.nvidia.com/v1/genai/qwen/qwen-image-edit');
    urls.push('https://integrate.api.nvidia.com/v1/genai/qwen/qwen-image-edit');
    urls.push('https://ai.api.nvidia.com/v1/genai/togetherai/qwen-image-edit');
  } else if (clean.includes('qwen-image')) {
    urls.push('https://ai.api.nvidia.com/v1/genai/qwen/qwen-image');
    urls.push('https://integrate.api.nvidia.com/v1/genai/qwen/qwen-image');
    urls.push('https://ai.api.nvidia.com/v1/genai/togetherai/qwen-image');
    urls.push('https://integrate.api.nvidia.com/v1/genai/togetherai/qwen-image');
  } else if (clean.includes('klein')) {
    urls.push('https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b');
    urls.push('https://integrate.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b');
  } else if (clean.includes('kontext')) {
    urls.push('https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-kontext-dev');
    urls.push('https://integrate.api.nvidia.com/v1/genai/black-forest-labs/flux.1-kontext-dev');
  } else if (clean.includes('schnell')) {
    urls.push('https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell');
    urls.push('https://integrate.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell');
  } else if (clean.includes('flux.1-dev') || clean.includes('flux-1-dev')) {
    urls.push('https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev');
    urls.push('https://integrate.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev');
  } else if (clean.includes('stable-diffusion') || clean.includes('sd3.5') || clean.includes('sd-3.5')) {
    urls.push('https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3.5-large');
    urls.push('https://integrate.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3.5-large');
    urls.push('https://ai.api.nvidia.com/v1/genai/stabilityai/sd3.5-large');
  }

  // Fallback candidates
  if (endpointId && endpointId.includes('/')) {
    urls.push(`https://ai.api.nvidia.com/v1/genai/${endpointId}`);
    urls.push(`https://integrate.api.nvidia.com/v1/genai/${endpointId}`);
  }
  urls.push(`https://integrate.api.nvidia.com/v1/images/generations`);
  urls.push(`https://ai.api.nvidia.com/v1/genai/${modelId}`);

  return [...new Set(urls)];
}

/**
 * Proxy Image Generation request to NVIDIA NIM / Dev Program API
 */
app.post('/api/generate', upload.single('source_image'), async (req, res) => {
  try {
    const {
      prompt,
      negative_prompt,
      model_id,
      endpoint_id,
      aspect_ratio = "1:1",
      width = 1024,
      height = 1024,
      steps = 30,
      cfg_scale = 7,
      seed,
      custom_base_url,
      use_demo_mode = "false"
    } = req.body;

    const apiKey = req.headers.authorization?.replace('Bearer ', '') || req.body.apiKey;

    addLog('info', 'GENERATE_REQUEST', `Initiating generation for model: ${model_id}`, {
      prompt,
      aspect_ratio,
      steps,
      use_demo_mode
    });

    if (!prompt) {
      addLog('warn', 'GENERATE_REQUEST', 'Prompt missing.');
      return res.status(400).json({ success: false, error: 'Prompt is required.' });
    }

    // Demo Mode Simulation
    if (use_demo_mode === "true" || (!apiKey && use_demo_mode !== "false")) {
      addLog('info', 'DEMO_MODE', 'Generating canvas preview image (Demo Mode)...');
      const demoImage = await generateDemoCanvasImage(prompt, model_id, aspect_ratio);
      return res.json({
        success: true,
        isDemo: true,
        message: 'Generated via Demo Mode (Provide an NVIDIA API key for live generation)',
        imageData: demoImage,
        metadata: {
          prompt,
          model_id,
          aspect_ratio,
          steps: parseInt(steps),
          seed: seed || Math.floor(Math.random() * 1000000),
          timestamp: new Date().toISOString()
        }
      });
    }

    if (!apiKey) {
      addLog('error', 'AUTH_ERROR', 'No API key provided.');
      return res.status(401).json({
        success: false,
        error: 'NVIDIA API Key is required. Please set your API key in the top navigation bar.'
      });
    }

    // Convert source image buffer to base64 if uploaded
    let sourceImageBase64 = null;
    if (req.file) {
      sourceImageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else if (req.body.source_image_base64) {
      sourceImageBase64 = req.body.source_image_base64;
    }

    const uniqueUrls = getTargetUrlsForModel(model_id, endpoint_id, custom_base_url);

    let lastErrorDetails = null;
    let successfulResult = null;

    // Create payload variants, ranging from strict minimal (for FLUX Pydantic endpoints) to full
    const payloadVariants = [
      // 1. Strict Minimal Payload (For FLUX/NIM models rejecting extra parameters)
      {
        prompt,
        ...(seed ? { seed: parseInt(seed) } : {}),
        ...(sourceImageBase64 ? { image: sourceImageBase64 } : {})
      },
      // 2. Minimal + Aspect Ratio (NO width/height)
      {
        prompt,
        aspect_ratio,
        ...(seed ? { seed: parseInt(seed) } : {}),
        ...(sourceImageBase64 ? { image: sourceImageBase64 } : {})
      },
      // 3. Full NIM payload with steps
      {
        prompt,
        ...(negative_prompt ? { negative_prompt } : {}),
        aspect_ratio,
        steps: parseInt(steps),
        cfg_scale: parseFloat(cfg_scale),
        ...(seed ? { seed: parseInt(seed) } : {}),
        ...(sourceImageBase64 ? { image: sourceImageBase64 } : {})
      },
      // 4. OpenAI Compatible payload
      {
        model: endpoint_id || model_id,
        prompt,
        n: 1,
        response_format: "b64_json"
      }
    ];

    addLog('info', 'PROXY_EXEC', `Testing ${uniqueUrls.length} NVIDIA API URL endpoints across ${payloadVariants.length} payload schemes...`);

    // Loop through URL candidates and payload variants
    for (const url of uniqueUrls) {
      for (let i = 0; i < payloadVariants.length; i++) {
        const payload = payloadVariants[i];
        try {
          addLog('info', 'HTTP_TRY', `POST ${url} (Variant #${i + 1})`, { payloadKeys: Object.keys(payload) });

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            const data = await response.json();
            
            // Extract raw image string from response payload structures
            let rawImgStr = null;
            if (data?.artifacts?.[0]?.base64) {
              rawImgStr = data.artifacts[0].base64;
            } else if (data?.data?.[0]?.b64_json) {
              rawImgStr = data.data[0].b64_json;
            } else if (data?.data?.[0]?.url) {
              rawImgStr = data.data[0].url;
            } else if (data?.image) {
              rawImgStr = data.image;
            } else if (data?.images?.[0]) {
              rawImgStr = data.images[0];
            } else if (data?.b64_json) {
              rawImgStr = data.b64_json;
            }

            const formattedB64 = formatBase64Image(rawImgStr);

            if (formattedB64) {
              addLog('success', 'NVIDIA_RESPONSE', `HTTP ${response.status} Success from ${url}`, {
                imageFormatDetected: formattedB64.slice(0, 30) + '...'
              });

              successfulResult = {
                imageData: formattedB64,
                rawResponse: data,
                seed: data?.artifacts?.[0]?.seed || payload.seed || seed
              };
              break;
            } else {
              addLog('warn', 'PAYLOAD_PARSE', `HTTP ${response.status} Success from ${url} but no image field found in response JSON`, data);
            }
          } else {
            const errText = await response.text();
            let parsed = errText;
            try { parsed = JSON.parse(errText); } catch (_) {}
            
            lastErrorDetails = {
              status: response.status,
              url,
              payloadKeys: Object.keys(payload),
              errorContent: parsed
            };

            addLog('warn', 'HTTP_FAIL', `HTTP ${response.status} from ${url}`, parsed);
          }
        } catch (err) {
          lastErrorDetails = {
            status: 500,
            url,
            errorContent: err.message
          };
          addLog('error', 'HTTP_EXCEPTION', `Fetch error calling ${url}: ${err.message}`);
        }

        if (successfulResult) break;
      }

      if (successfulResult) break;
    }

    if (successfulResult) {
      return res.json({
        success: true,
        imageData: successfulResult.imageData,
        metadata: {
          prompt,
          model_id,
          aspect_ratio,
          steps: parseInt(steps),
          seed: successfulResult.seed || seed,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Detailed Diagnostic Failure Response
    addLog('error', 'GENERATE_FAILED', `All endpoints and payload variants failed. Last status: ${lastErrorDetails?.status}`);

    return res.status(lastErrorDetails?.status || 500).json({
      success: false,
      error: `NVIDIA API generation returned HTTP ${lastErrorDetails?.status || 500}. Details: ${typeof lastErrorDetails?.errorContent === 'string' ? lastErrorDetails.errorContent : JSON.stringify(lastErrorDetails?.errorContent)}`,
      diagnostic: {
        lastAttemptedUrl: lastErrorDetails?.url,
        status: lastErrorDetails?.status,
        errorContent: lastErrorDetails?.errorContent,
        attemptedEndpoints: uniqueUrls
      }
    });

  } catch (error) {
    addLog('error', 'SERVER_CRASH', `Internal Error: ${error.message}`, error.stack);
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${error.message}`
    });
  }
});

/**
 * SVG Canvas Generator for Demo Mode
 */
async function generateDemoCanvasImage(prompt, modelId, ratio) {
  let w = 1024, h = 1024;
  if (ratio === '16:9') { w = 1280; h = 720; }
  else if (ratio === '9:16') { w = 720; h = 1280; }
  else if (ratio === '4:3') { w = 1024; h = 768; }

  const cleanPrompt = prompt.replace(/[<>&"]/g, '');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#051910" />
          <stop offset="50%" stop-color="#0b2e1a" />
          <stop offset="100%" stop-color="#020905" />
        </linearGradient>
        <linearGradient id="nvidia" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#76B900" />
          <stop offset="100%" stop-color="#00E676" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#76B900" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#76B900" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <circle cx="${w/2}" cy="${h/2}" r="${Math.min(w,h)*0.35}" fill="url(#glow)"/>
      <rect x="40" y="40" width="${w-80}" height="${h-80}" rx="24" fill="none" stroke="url(#nvidia)" stroke-width="2" stroke-dasharray="8 8" opacity="0.4"/>
      
      <g stroke="url(#nvidia)" stroke-width="2" fill="none" opacity="0.6">
        <path d="M 100 ${h/2} H ${w-100}" />
        <path d="M ${w/2} 100 V ${h-100}" />
        <circle cx="${w/2}" cy="${h/2}" r="120" stroke-width="3"/>
        <circle cx="${w/2}" cy="${h/2}" r="160" stroke-dasharray="10 15"/>
      </g>

      <text x="${w/2}" y="${h/2 - 40}" font-family="sans-serif" font-size="28" font-weight="bold" fill="#76B900" text-anchor="middle">
        NVIDIA NIM DEMO PREVIEW
      </text>
      <text x="${w/2}" y="${h/2 + 10}" font-family="sans-serif" font-size="18" fill="#e2e8f0" text-anchor="middle">
        Model: ${modelId}
      </text>
      <text x="${w/2}" y="${h/2 + 60}" font-family="sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">
        Prompt: "${cleanPrompt.slice(0, 60)}${cleanPrompt.length > 60 ? '...' : ''}"
      </text>
      <text x="${w/2}" y="${h - 70}" font-family="sans-serif" font-size="12" fill="#76B900" text-anchor="middle" opacity="0.8">
        Add your NVIDIA API key to render real diffusion outputs!
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

app.listen(PORT, () => {
  addLog('info', 'SYSTEM', `NVIDIA NIM Express Server initialized on http://localhost:${PORT}`);
});
