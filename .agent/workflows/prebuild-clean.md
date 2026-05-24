---
description: Clean build artifacts, bundler caches, and TS incremental files before a fresh build
---
This workflow runs the pre-build cleanup mode of `cleanup-state.ps1` to ensure no stale caches corrupt the new build.

Targets: `dist/`, `build/`, `out/`, `node_modules/.cache/`, `.vite/`, `.turbo/`, `.next/cache/`, `coverage/`, `*.tsbuildinfo`, `src-tauri/target/debug/`.

1. Run pre-build cleanup
// turbo
Run `powershell -File .\.agent\scripts\cleanup-state.ps1 -Mode prebuild`

2. Verify clean state
// turbo
Run `Get-ChildItem -Path dist, build, out, coverage -ErrorAction SilentlyContinue | Measure-Object | Select-Object Count` — expected: 0
