# Lich Viet Android

Lich Viet Android is the Capacitor Android application and monorepo workspace for Lịch Việt v3. It packages the latest web source into an Android APK while providing an optional NestJS Fastify backend microservice for cloud synchronization, identity, and server-side calculation verification.

Repository: [jakessteve/lich-viet-android](https://github.com/jakessteve/lich-viet-android)

---

## 🌟 What It Contains

- **Frontend Application (`src/`)**: React 19 + TypeScript + Tailwind CSS v4 SPA with offline-first local state and PWA service worker.
- **Backend Microservice (`packages/app-backend/`)**: High-throughput NestJS 11 + Fastify API providing Auth, Users, Đám Giỗ, Calendar events, and delta synchronization.
- **Client SDK (`packages/api-client/`)**: Type-safe HTTP client (`LichVietApiClient`) for seamless API communication.
- **Shared Contracts (`packages/contracts/`)**: Zero-dependency TypeScript interfaces, DTOs, and sync models.
- **Capacitor Android Shell (`android/`)**: Native Android WebView packaging with filesystem and clipboard plugins.
- **Calculation Engines (`packages/core/`, `packages/core-logic/`)**: Swiss Ephemeris WASM, Can Chi, Tiết Khí, Tử Vi, Western & Vedic Astrology, Mai Hoa Dịch Số, and Tam Thức (Kỳ Môn, Thái Ất, Lục Nhâm).

---

## 📋 Requirements

- Node.js 20 or newer
- npm 10 or newer
- JDK 17
- Android Studio and Android SDK (for native building / emulation)

---

## 🚀 Installation & Getting Started

```bash
git clone git@github.com:jakessteve/lich-viet-android.git
cd lich-viet-android
npm install
```

### Run The Web Frontend

```bash
npm run dev
```

### Run The Backend Microservice

```bash
npm run start:backend
# or with file watching:
npm run start:backend:dev
```

---

## 📱 Build The Android APK

### Quick One-Step Build & Sync:

```bash
npm run full:build
```

### Step by Step:

```bash
# 1. Compile web bundle
npm run build:web

# 2. Sync into Android project
npm run cap:sync

# 3. Build debug APK
npm run android:build
```

The debug APK is generated at:
```text
android/app/build/outputs/apk/debug/app-debug.apk
```

### Build Unsigned Release APK:

```bash
npm run android:release
```

Output:
```text
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 🧪 Testing & Validation

| Command | Purpose |
| --- | --- |
| `npm test` | Run full test suite (100 Vitest suites + Fastify backend E2E suites) |
| `npm run test:fe` | Run frontend & unit Vitest suites only |
| `npm run test:backend` | Run Fastify backend E2E suites with tsx experimental decorators |
| `npm run typecheck` | Run strict TypeScript compiler checks (`tsc --noEmit`) |
| `npm run lint` | Lint `src`, `packages`, and `test` |
| `npm run format:check` | Check Prettier code formatting |

---

## 📂 Project Layout

```text
src/          Web app UI, components, services, stores, hooks, and gateways
packages/
  api-client/  Type-safe TypeScript HTTP client SDK
  app-backend/ NestJS Fastify backend application
  contracts/   Shared DTOs, API models, and sync interfaces
  core/        Public facades for calculation engines
  core-logic/  Metaphysical calculation logic and ephemeris adapters
  swisseph-wasm/ Swiss Ephemeris WASM engine
public/       Static assets, fonts, icons, and PWA files
test/         Unit, component, engine, gateway, and live backend integration tests
scripts/      Build and sync helpers for web and Android
android/      Capacitor Android native project
docs/         Architecture, STATUS SOT, UX, user flows, and sprint logs
```

---

## 📄 License

MIT
