# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start Next.js dev server at http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Required Environment Variables
Create `.env.local` in the root directory:
```
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id
```
Get credentials from [Vapi Dashboard](https://dashboard.vapi.ai/). The `NEXT_PUBLIC_` prefix makes these variables available in the browser.

## Architecture Overview

### Core Tech Stack
- **Framework**: Next.js 16+ with React 19 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + custom CSS variables
- **3D Graphics**: Three.js (browser-only via dynamic import)
- **Voice**: Vapi Web SDK (@vapi-ai/web)

### Application Flow

The app implements a simple state-driven architecture:

1. **Page Component** (`app/page.tsx`): Root component that manages `isSpeaking` state
2. **VapiWidget** (`components/VapiWidget.tsx`): Handles voice interaction, emits `isSpeakingChange` callbacks
3. **ThreeScene** (`components/ThreeScene.tsx`): Renders 3D animated background, responds to `isSpeaking` prop

```
app/page.tsx (state: isSpeaking)
├── ThreeScene (isSpeaking prop) → 3D animation intensity
└── VapiWidget (onSpeakingChange callback) → updates isSpeaking state
```

### Key Design Patterns

**Dynamic Import with SSR Disabled**
ThreeScene uses `dynamic(() => import(...), { ssr: false })` because Three.js requires the DOM and window object, which aren't available during server-side rendering.

**State Synchronization**
- VapiWidget listens to Vapi events (`speech-start`, `speech-end`, etc.) and calls `onSpeakingChange()`
- This updates the parent's `isSpeaking` state
- ThreeScene reads `isSpeaking` and adjusts animation parameters (particle speed, orb scale, emissive intensity)

**Error Handling**
- VapiWidget suppresses harmless browser audio processor warnings by temporarily overriding console methods during `Vapi.start()`
- Errors are displayed in the UI via `errorMessage` state

### Component Details

**VapiWidget** - Voice interaction interface
- Manages call state: `idle` | `connecting` | `active` | `ending`
- Tracks volume level and microphone mute status
- Renders microphone button with dynamic styling
- Handles Vapi initialization, start/stop calls, and event listeners

**ThreeScene** - 3D ambient background
- Creates a particle system and central orb using Three.js
- Modulates animation parameters based on `isSpeaking`:
  - Increases particle speed
  - Scales orb size
  - Intensifies emissive glow
- Handles window resize and cleanup

### Styling & Theme

Color scheme defined in `app/globals.css` via CSS variables:
- `--background`: #0f1419 (dark charcoal)
- `--foreground`: #f1f5f9 (light text)
- `--primary`: #0ea5e9 (blue)
- `--secondary`: #1e293b (slate)
- `--muted`: #334155 (muted slate)
- `--accent`: #3b82f6 (bright blue)

Uses Tailwind's dark mode and custom animation keyframes (e.g., `pulse-ring`).

## Configuration Files

- `tsconfig.json`: Path alias `@/*` maps to root directory
- `eslint.config.mjs`: Next.js recommended rules with TypeScript support
- `next.config.ts`: Default Next.js configuration
- `postcss.config.mjs`: Tailwind CSS integration
- `lib/vapiConfig.ts`: Centralized Vapi credentials management

## Important Notes

- All components are client components (marked with `'use client'`) since they interact with browser APIs (Vapi SDK, Three.js, DOM)
- The app uses `suppressHydrationWarning` on the body element to prevent mismatches between server-rendered layout and client-rendered children
- Vapi initialization happens in a `useEffect` hook in VapiWidget; cleanup removes all event listeners and stops the Vapi instance
- Three.js scene handles window resize to maintain responsiveness
