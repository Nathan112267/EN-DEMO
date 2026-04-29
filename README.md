# N2 Demo Workspace

This workspace contains multiple browser demos built with Vite, including the Huawei Pura X `AI 觉醒` external-screen demo.

## Key routes

- Root app: `/`
- Data collection: `/data-collection/`
- Voice order demo: `/voice-order-demo/`
- Pura X AI Awakening: `/pura-x-ai-awakening/`
- AI Taskbar: `/ai-taskbar/`
- Healthcare skin scan demo: `/healthcare/`

## Deploy to Vercel

This project is ready to deploy on Vercel as a Vite app.

### Recommended Vercel settings

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

These settings are also captured in [vercel.json](/Users/bytedance/Desktop/N2/vercel.json).

### Deploy flow

1. Push this project to GitHub, GitLab, or Bitbucket.
2. Import the repository into Vercel.
3. Confirm the Vite build settings above.
4. Deploy.

After deploy, the Pura X page will be available at:

- `/pura-x-ai-awakening/`
- `/ai-taskbar/`
- `/healthcare/`

The old path is also supported and will redirect automatically:

- `/pura-x-ai-awakening.html`

## Mobile testing notes

- Camera access requires a secure origin. Vercel provides HTTPS by default.
- Test the experience first in the phone's system browser.
- Some in-app browsers or WebViews may still block `getUserMedia()` even over HTTPS.

## Local development

```bash
npm install
npm run dev
```

Open the Pura X page locally at:

```text
http://127.0.0.1:5173/pura-x-ai-awakening/
```
