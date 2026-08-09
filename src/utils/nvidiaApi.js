const STORAGE_KEY = 'nvidia_api_key';
const CUSTOM_URL_KEY = 'nvidia_custom_base_url';

export const getStoredApiKey = () => {
  return localStorage.getItem(STORAGE_KEY) || '';
};

export const setStoredApiKey = (key) => {
  if (key) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const getStoredCustomUrl = () => {
  return localStorage.getItem(CUSTOM_URL_KEY) || '';
};

export const setStoredCustomUrl = (url) => {
  if (url) {
    localStorage.setItem(CUSTOM_URL_KEY, url.trim());
  } else {
    localStorage.removeItem(CUSTOM_URL_KEY);
  }
};

/**
 * Validate API Key against backend endpoint
 */
export const testApiKey = async (key) => {
  try {
    const res = await fetch('/api/test-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, error: err.message || 'Failed to test key' };
  }
};

/**
 * Trigger Image Generation
 */
export const generateImageApi = async (params) => {
  const apiKey = getStoredApiKey();
  const customUrl = getStoredCustomUrl();

  const formData = new FormData();
  formData.append('prompt', params.prompt || '');
  if (params.negativePrompt) formData.append('negative_prompt', params.negativePrompt);
  formData.append('model_id', params.modelId);
  formData.append('endpoint_id', params.endpointId || params.modelId);
  formData.append('aspect_ratio', params.aspectRatio || '1:1');
  formData.append('width', params.width || 1024);
  formData.append('height', params.height || 1024);
  formData.append('steps', params.steps || 30);
  formData.append('cfg_scale', params.cfgScale || 7);
  if (params.seed) formData.append('seed', params.seed);
  if (customUrl) formData.append('custom_base_url', customUrl);
  if (params.useDemoMode) formData.append('use_demo_mode', 'true');

  if (params.sourceImageFile) {
    formData.append('source_image', params.sourceImageFile);
  } else if (params.sourceImageBase64) {
    formData.append('source_image_base64', params.sourceImageBase64);
  }

  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
    },
    body: formData
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Image generation failed');
  }

  return data;
};
