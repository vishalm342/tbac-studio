# TBAC Studio // Forward Deployed Engineer Prototype

A minimal, highly-resilient generative media workstation built for The Bombay AI Company FDE evaluation.

## 🚀 Live Deployment
[Insert your Vercel Link Here]

## 🧠 Architectural Decisions (The FDE Mindset)

**1. Ruthless Prioritization (Why a Single Page App?)**
Following the directive to "keep the surface small and the foundation solid," I intentionally omitted bloated features (auth, routing, marketing pages) to focus 100% of my time on core state orchestration. The app uses a single, highly-dense control matrix to manage complex asynchronous state between the prompt terminal, the canvas stage, and the history ledger.

**2. The API Pivot (Pragmatism)**
Initial integration with Fal.ai/Hugging Face yielded rigid paywalls and model routing constraints. Because the objective was to prove end-to-end generation, I bypassed these gates by pivoting the engine to **Pollinations.ai**—a keyless, RESTful inference node. This guaranteed a working, zero-friction pipeline for the reviewers.

**3. Defending the Unhappy Path**
* **Timeouts:** The Next.js API route implements an `AbortController` with a strict 15-second cutoff to prevent infinite network hangs if the AI node goes down.
* **Visual Feedback:** All API exceptions (timeouts, 503s) are caught and surfaced to the UI via a stateful error toast, ensuring the user is never left looking at a frozen screen.
* **Memory Management:** The HTML5 Canvas `useEffect` utilizes cleanup booleans to prevent memory leaks and stale draws if the user rapidly clicks through their generation ledger.

## ✨ Features Completed
* [x] **Generate:** Full prompt-to-image pipeline.
* [x] **Gallery Ledger:** Session history stored with exact configurations.
* [x] **Tweak:** Clicking a historical asset instantly reloads its parameters into the control matrix.
* [x] **Bonus (Canvas):** Real-time text overlay baked directly into the image via HTML5 Canvas with export capabilities.