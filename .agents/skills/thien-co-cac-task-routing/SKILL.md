---
name: thien-co-cac-task-routing
description: "Use to assign Thiên Cơ Các work to the right assistant workflow, especially separating interface and audio work from complex coding and functionality."
---

## Scope
Choose the right workflow before starting a Thiên Cơ Các task.

## Routing
- Handle interface, layout, responsive behavior, visual styling, accessibility, audio, voice playback, and sound controls directly. Use `thien-co-cac-ui` or `thien-co-cac-audio` for the detailed guidance.
- Route substantial engineering work to Codex's coding workflow: business logic, divination calculations, backend/API behavior, data models or migrations, architecture, security, native Android/Capacitor builds, and broad code changes.
- For a mixed task, keep the interface/audio portion here and identify the code/functionality portion for Codex. Preserve a clear handoff note with the goal, relevant files, constraints, and current state.
- Do not create a new chat or claim to have delegated unless an available tool actually performs that action and the user has authorized it. If the Codex workflow is unavailable, explain that briefly and ask before taking on a substantial task outside the interface/audio scope.
- Small supporting code edits needed to complete an interface or audio task may be handled directly when they do not change core product behavior.

## Project constraints
Follow `AGENTS.md`: preserve the v1.0 baseline, check and protect existing user changes, keep user-facing explanations in plain Vietnamese, and never push unless explicitly asked; any requested push must target a secondary branch.
