# 🚀 NVIDIA NIM Studio — Visual Generative AI Application

A full-stack local web application designed to run locally, allowing you to generate and edit images using the **NVIDIA Developer Program API** and **NVIDIA NIM (Inference Microservices)** visual generative AI catalog.

---

## 🌟 Features

- **Dynamic NVIDIA API Key Configuration**: Enter, test, and manage your NVIDIA API key (`nvapi-...`) directly from the UI header. Keys are saved securely in browser local storage.
- **Support for 8 NVIDIA Hosted Visual Models**:
  1. `qwen-image-edit-nvpcb-ovsl2sl` (NVIDIA Omniverse Synthetic PCB Inspection Solder-Light Edit)
  2. `qwen-image` (Qwen Foundation Multilingual Text-to-Image)
  3. `qwen-image-edit` (Qwen Multilingual Subject Consistency Image Editing)
  4. `flux.2-klein-4b` (Black Forest Labs Ultra-fast Distilled Generation & Editing)
  5. `stable-diffusion-3.5-large` (Stability AI Text-to-Image)
  6. `FLUX.1-Kontext-dev` (Black Forest Labs In-Context Generation & Editing)
  7. `FLUX.1-schnell` (Black Forest Labs Real-time High-speed Generation)
  8. `FLUX.1-dev` (Black Forest Labs State-of-the-Art Visual Model)
  - *Plus Custom Model ID option to specify any NVIDIA catalog endpoint!*
- **Source Image Upload & Edit Engine**: Drag-and-drop source images or load sample synthetic PCB renders for image editing models.
- **Before / After Split View**: Compare original input and NVIDIA edited output side-by-side.
- **Advanced Generation Controls**: Aspect ratio selector (1:1, 16:9, 9:16, 4:3, 3:4, 21:9), prompt enhancer, negative prompts, inference steps, CFG guidance scale, and seed randomizer.
- **Demo Mode**: Test all UI workflows instantly with interactive canvas previews without consuming API tokens.
- **History & Gallery**: Save generations, download high-resolution outputs (PNG), copy base64 data, and view execution metadata.

---

## 🛠️ Quick Start

### 1. Launch the Backend Server (Port 3001)
```bash
node server.js
```

### 2. Launch the Frontend Application (Port 5173)
```bash
npm run dev
```

Or run both concurrently:
```bash
npm start
```

### 3. Open in Browser
Navigate to **`http://localhost:5173`** in your browser.

---

## 🗝️ How to Add Your NVIDIA API Key

1. Go to [build.nvidia.com](https://build.nvidia.com) and log in with your free NVIDIA Developer account.
2. Select any visual model (e.g. `FLUX.1-schnell` or `qwen-image`) and click **"Get API Key"**.
3. Copy your key (starts with `nvapi-...`).
4. In the app top header, click **"Set NVIDIA Key"**, paste your key, click **"Test Connection"**, and save.
