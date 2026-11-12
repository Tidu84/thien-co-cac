---
name: thien-co-cac-android-release
description: "Use for Capacitor Android builds, versioning, and Play Store preparation."
---

## Scope
Use for Capacitor Android builds, versioning, and Play Store preparation.

## Guidance
Work with frontend/android, Capacitor config, and xuat-app.bat. Treat v1.0 versionCode 1/versionName 1.0 as the testing baseline; increase versionCode only for a requested later release. Preserve app ID com.thiencocac.app. Never expose signing passwords, keystores, API keys, or env values. Inspect signing configuration and fail safely if secrets are hardcoded or missing. Do not upload/publish unless specifically requested.
