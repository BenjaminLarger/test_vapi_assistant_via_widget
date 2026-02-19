# Vapi Voice Assistant Tester

A dark-themed, voice-first web interface for testing Vapi voice assistants. Features a reactive 3D ambient background animation that responds to assistant speech activity.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key
   NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id
   ```
   Get your credentials from the [Vapi Dashboard](https://dashboard.vapi.ai/)

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser

## ✨ Features

- **Voice-First Interface**: Click-to-talk voice interaction powered by Vapi
- **3D Ambient Animation**: Three.js-based background that reacts to speech activity
- **Dark Theme**: Minimalist dark UI with blue accents
- **Real-Time Response**: Animation intensifies when the assistant speaks
- **Mobile Responsive**: Works seamlessly on mobile, tablet, and desktop
- **No Authentication**: Public shareable link for clients

## 🏗️ Architecture

- **Frontend**: Next.js 16+ with React 19
- **Styling**: Tailwind CSS v4
- **3D Graphics**: Three.js
- **Voice**: Vapi Web SDK
- **Language**: TypeScript

### Project Structure

```
/app
  /page.tsx              # Main page with state management
  /layout.tsx            # Root layout
  /globals.css           # Global styles and animations

/components
  /VapiWidget.tsx        # Voice interaction widget
  /ThreeScene.tsx        # 3D ambient background

/lib
  /vapiConfig.ts         # Vapi configuration

/public                  # Static assets
```

## 🎨 Design

- **Background**: Dark charcoal (#0f1419)
- **Primary**: Blue (#0ea5e9)
- **Secondary**: Slate (#1e293b)
- **Text**: Light slate (#f1f5f9)

## 📦 Build & Deploy

### Build
```bash
npm run build
```

### Deploy on Vercel
The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📚 Resources

- [Vapi Documentation](https://docs.vapi.ai/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Three.js Documentation](https://threejs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
