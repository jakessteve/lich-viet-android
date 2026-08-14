# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.0] - 2026-08-14

### Architecture & Quality Modernization
- **Wave 1 Stabilization Complete**: 100% green test suite across 59 test files and 463 test assertions.
- **Tử Vi Engine & UI**: Restored Thiên Lương / Nam Phái star placement routines, 14 major stars, auxiliary rings, and Hạn calculations. Implemented full dynamic Dark Mode theme support for the 4×4 chart table with theme-aware Ngũ Hành star colors.
- **Historical Time Normalization**: Restored historical Vietnam timezone periods (1906–present) with North/South split and civil date resolution.
- **Location-Aware Ephemeris**: Restored `@swisseph/browser` WASM astronomical layer with true-solar civil time correction for birthplace and viewer location.
- **Western & Vedic Astrology**: Restored SVG wheel geometry, Placidus/Whole Sign house cusps, aspect matrices, Vedic Lahiri ayanamsha, and D9 Navamsha.
- **Personalized Day Scoring & Synastry**: Restored Can-Chi interaction scoring with Tam Hợp, Lục Hợp, Lục Xung, Lục Hại, Tương Hình, and Tương Phá. Auto-seeded Person A birth profile across Synastry comparisons.
- **Landing Page Performance**: Eliminated rapid scrolling flicker via isolated count-up state, accurate `useInView` bounds detection, React `useId()`-scoped SVG gradient def IDs, and GPU-backed glass card styling.
- **Authentication State Integration**: Updated Astrology sidebar hints to dynamically reflect linked user profile status instead of a static login prompt.
- **SVG Exporting**: Updated chart image export to high-resolution vector SVG via `html-to-image`.
- **Static Analysis & Build**: Configured ESLint flat config with package environment overrides (0 errors) and validated clean Vite production build. Produced fresh Android APK (`v3.1.0`).

## [3.0.0] - 2026-05-10

### Major Changes
- **Refactored** from 9-engine monolith to modular SPA with dedicated `@lich-viet/core` facades.
- **Created** `packages/core` barrel exports for `@lich-viet/core/*` aliases.
- **Streamlined** global state management using lightweight Zustand stores.
- **Updated** feature flags and navigation hierarchy.

## [2.3.0] - 2026-03-14

### Added
- **Feature:** Currency conversion with automatic rate refresh.
- **Feature:** Tử Vi temporal overlays with Đại Hạn and Lưu Niên analysis.
- **Feature:** Tam Thức suite with Thái Ất, QMDJ, and Lục Nhâm board construction.
- **Testing:** Comprehensive test suite with Vitest and Playwright.
