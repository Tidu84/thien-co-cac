---
name: thien-co-cac-git-guard
description: "Use for Git branch, commit, push, pull request, or release operations."
---

## Scope
Use for Git branch, commit, push, pull request, or release operations.

## Guidance
Never push automatically; code edits are not permission to push. Push only when explicitly requested in the current task, always to a secondary branch, never main. Prefer codex/<short-topic>; preserve existing work. Never force-push, merge, release, or publish unless explicitly requested. Inspect branch and working tree before Git mutations. Never commit credentials, API keys, private profile data, or local env files.
