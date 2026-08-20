# [01] PROJECT TOPOLOGY & ARCHITECTURE MANIFEST

## 1.1 Tech Stack Architecture
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5+ (Strict Mode)
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss";` in `app/globals.css`)
- **Animation & Transitions**: `motion/react`
- **Iconography**: `lucide-react`
- **Audio & Speech**: Web Speech API (`speechSynthesis`, `SpeechSynthesisUtterance`) with browser fallback handlers
- **AI Backend**: Server-Side `@google/genai` (SDK via `process.env.GEMINI_API_KEY`)
- **State Management**: LocalStorage synchronization, React State hooks, and custom persistence adapters

## 1.2 File System Topology
```
├── .env.example
├── .eslintrc.json
├── .gitignore
├── app/
│   ├── api/
│   │   └── gemini/
│   │       ├── math-coach/route.ts
│   │       ├── parent-insights/route.ts
│   │       ├── phonics-tutor/route.ts
│   │       └── story-weave/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CompanionWidget.tsx
│   ├── DailyMissionHub.tsx
│   ├── MathQuest.tsx
│   ├── Navbar.tsx
│   ├── ParentPortal.tsx
│   ├── PhonicsLab.tsx
│   ├── StoryStudio.tsx
│   └── TrophyRoom.tsx
├── hooks/
├── lib/
│   ├── audio.ts
│   └── utils.ts
├── metadata.json
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## 1.3 Active Endpoints & Routes
1. `POST /app/api/gemini/math-coach/route.ts` - Step-by-step encouraging arithmetic and manipulative coaching.
2. `POST /app/api/gemini/phonics-tutor/route.ts` - Sound matching verification, word breakdown, and pronunciation hints.
3. `POST /app/api/gemini/story-weave/route.ts` - Creative co-authoring story expansion and age-appropriate grammar coaching.
4. `POST /app/api/gemini/parent-insights/route.ts` - Diagnostic analysis of learning metrics with printable practice recommendations.

---

# [02] STRICT GOOGLE AI STUDIO PLATFORM RULES

1. **Port 3000 Networking**:
   - All server processes, development servers, and proxy routes must strictly communicate through Port 3000 behind the platform reverse proxy.
   - Never reconfigure ports or attempt to read custom port overrides.

2. **Tailwind CSS Architectural Boundary**:
   - All styling must strictly utilize Tailwind CSS utility classes configured through PostCSS and `@import "tailwindcss";` in `./app/globals.css`.
   - Never import external `.css` files or use inline `style={{ ... }}` objects.

3. **TypeScript Top-Level Named Import Discipline**:
   - All `import` statements must reside at the module top level.
   - Use named imports. Never use object destructuring on type imports.
   - Never apply `import type` to TypeScript `enum` declarations.
   - `const enum` is strictly prohibited; use standard `enum`.

4. **Server-Side API Key & Secrets Isolation**:
   - API keys (including `process.env.GEMINI_API_KEY`) are server-only secrets.
   - Never prefix sensitive keys with `NEXT_PUBLIC_`.
   - Never expose UI input fields, forms, or prompts asking users to provide API keys. Declare all required environment variables in `.env.example`.

---

# [03] GAP REMEDIATION & IMPLEMENTATION ROADMAP

1. **Audio Synthesis Resilience**:
   - Ensure `lib/audio.ts` gracefully degrades in environments where the Web Speech API voice synthesis list is initially empty or asynchronously loaded.
   - Implement voice selection listeners (`speechSynthesis.onvoiceschanged`).

2. **Offline Local Persistence Fallback**:
   - Keep mission progress, stars, pet unlocks, and storybook entries synchronized in `localStorage` with JSON validation and corrupted-state recovery.

3. **Graceful Server Error Recovery**:
   - All client-side fetch calls to `/api/gemini/*` must have fallback offline responses (e.g., pre-cached hints, standard encouragement phrases) if network or rate limits occur.

4. **Accessible Touch Targets**:
   - Ensure all interactive buttons, letter tiles, and manipulatives maintain a minimum 44px touch area with tactile visual feedback (`border-b-4`, `active:translate-y-0.5`).

---

# [04] THE ZERO-TOLERANCE "FULL LEAF FILE" CODE MANDATE

All future code outputs must be Full Leaf Files—100% complete, fully functional, production-ready, compile-able syntax containing every import statement, function body, and error handler. 

**STRICTLY PROHIBITED**:
- Truncation, condensation, abbreviation, or ellipsis comments (e.g., `// ... rest of code`).
- Mock data substitutes, pseudo-code, stubbed functions, or `// TODO` items.
- Incomplete file replacements or partial edits that leave the application in an unbuildable state.

---

# [05] STATE MANAGEMENT, DATA FLOW & MUTATION PROTOCOLS

1. **Local-First State Architecture**:
   - Primary user progress (stars, completed missions, badges, companion accessories) lives in React state and immediately persists to `localStorage`.
   - State updates must be immutable and deterministic.

2. **Server-Side AI Communication**:
   - Client components initiate asynchronous `fetch` requests with JSON payloads containing user context, current difficulty level, and recent prompt inputs.
   - Handlers validate response integrity and handle non-200 responses with localized, friendly fallback feedback.

3. **Optimistic UI Updates**:
   - Star awards, mission completion toggles, and badge unlock animations trigger instantly on the client, with rollback protection if dependent operations fail.

---

# [06] ENTERPRISE SECURITY, TYPE SAFETY & ERROR HANDLING

1. **Strict TypeScript Types**:
   - All state models, API request/response contracts, and component props must be explicitly typed with TypeScript interfaces or standard enums.
   - The `any` type is disallowed across the entire codebase.

2. **Input Sanitization & Safe Display**:
   - User-generated story inputs must be trimmed and length-bounded before dispatching to server routes.
   - AI responses must be rendered safely through React elements or sanitized markdown wrappers without `dangerouslySetInnerHTML`.

3. **React Error Boundaries**:
   - Component modules must fail gracefully without crashing the root layout, displaying clear retry controls and friendly child-appropriate status messages.
