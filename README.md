# Lich Viet Android

Lich Viet Android is the Capacitor Android wrapper for the Lich Viet v3 web app. It packages the latest web source into an Android APK while keeping the app itself in a Vite + React codebase.

Repository: [jakessteve/lich-viet-android](https://github.com/jakessteve/lich-viet-android)

## What It Contains

- The current Lich Viet v3 web app source
- A Capacitor Android shell under `android/`
- Build and sync scripts for generating APKs from the latest web bundle
- Static data, UI, and engine code for Am Lich, Dung Su, Gieo Que, and related app surfaces

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- JDK 17
- Android Studio and the Android SDK if you want to open or rebuild the native project

## Install

```bash
git clone git@github.com:jakessteve/lich-viet-android.git
cd lich-viet-android
npm install
```

## Run The Web App

```bash
npm run dev
```

The Vite dev server prints the local URL after startup.

## Build The Android App

### Fast path

```bash
npm run full:build
```

This runs the web build, syncs Capacitor assets into Android, and leaves the project ready for Gradle packaging.

### Step by step

```bash
npm run build:web
npm run cap:sync
npm run android:build
```

The debug APK is written to:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

### Release build

```bash
npm run android:release
```

## Useful Scripts

| Command                 | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `npm run dev`           | Start the local Vite dev server                |
| `npm run build:web`     | Build the web app bundle                       |
| `npm run cap:sync`      | Copy the web bundle into the Android project   |
| `npm run cap:open`      | Open the native Android project in Android Studio |
| `npm run android:build` | Build a debug APK with Gradle                  |
| `npm run android:release` | Build a release APK with Gradle              |
| `npm run full:build`    | Build the web app and sync Android in one step |
| `npm test`              | Run the Vitest suite once                      |
| `npm run typecheck`     | Run TypeScript without emitting files          |
| `npm run lint`          | Lint `src`, `packages`, and `test`             |

## Project Layout

```text
src/        Web app UI, services, stores, hooks, and engines
packages/   Shared package exports for core and types
public/     Static assets, fonts, icons, and PWA files
test/       Unit and integration tests
scripts/    Build and sync helpers for web and Android
android/    Capacitor Android project
docs/       Architecture, UX, user flow, and business notes
```

## Build Notes

- `postinstall` patches Swiss Ephemeris and the Android Capacitor build files.
- `cap:sync` runs Capacitor sync and then cleans Android asset output.
- The Android wrapper is designed to track the latest web source from the companion Lich Viet repo without changing the native shell by hand.

## License

MIT
