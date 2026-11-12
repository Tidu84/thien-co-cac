---
name: thien-co-cac-audio
description: "Use for speech, voice playback, sound effects, or audio controls in Thiên Cơ Các."
---

## Scope
Handle audio and voice experience work directly, including playback, sound effects, and user-facing audio controls.

## Guidance
Inspect current voice controls and relevant components such as AnimeGuide.tsx. Preserve the visible sound on/off choice; mute must suppress app audio. On phones, play audio after a clear user action and handle autoplay restrictions gracefully. Keep controls accessible. Reuse existing pipelines; do not add providers, collect voice data, or introduce recurring costs without an explicit request. Keep substantial backend, data, or core functionality changes in Codex's coding workflow. Explain how to preview the sound change.
