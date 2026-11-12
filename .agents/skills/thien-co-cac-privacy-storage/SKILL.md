---
name: thien-co-cac-privacy-storage
description: "Use for local profiles, captured images, storage, import, or deletion."
---

## Scope
Use for local profiles, captured images, storage, import, or deletion.

## Guidance
Work with dossierService.ts, localStorage, image capture, import/export, and deletion. Dossiers are intended to remain on-device: do not add cloud sync, analytics transmission, or remote profiles without an explicit request. Trace data reads, writes, and network paths. Never log profiles, birth data, readings, or images. Consider localStorage limits, preserve existing data, and avoid silent destructive migrations.
