# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [3.1.1] - 2026-08-15

### Added
- **Personalized Tử Vi Palace Interpretation Engine (SCTE)**:
  - Deep, individualized **Tam Phương Tứ Chính & Hội Chiếu** analysis extracting exact projecting major stars (with brightness), classic star synergies (*Sát Phá Tham*, *Tử Phủ Vũ Tướng*, *Cơ Nguyệt Đồng Lương*, *Cự Nhật*), Tứ Hóa transformations, and auxiliary/malefic balance.
  - Contextual **Cung Vô Chính Diệu** interpretation analyzing borrowed forces from opposing palaces and trine support.
  - Empathetic, human-oriented **Định hướng & Lời Khuyên Hành động** with star-specific leadership/strategy guidance, Tứ Hóa catalysts, risk mitigation for specific malefic stars, and Tuần/Triệt timing advice.
- Extended unit test suite: 68 test files / 501 tests passing (100% green).
- Rebuilt fresh Android APK (`app-debug.apk`, 10.9MB).

### Changed
- Integrated Tam Phương Tứ Chính analysis into both normal card view and Mobile Zoom Drawer reading sheet.

## [3.1.0] - 2026-08-14

### Added
- Comprehensive test suite stabilization: 59 test suites / 463 tests passing (100% green).
- Full historical Vietnam timezone period resolution (1906–present).
- Swiss Ephemeris WASM true-solar time correction layer.
- Restored Western wheel SVG geometry and Vedic D9 Navamsha calculations.
- Clean production Vite build and service worker precaching.
- Complete dark mode theme support for the 4×4 Tử Vi chart table (`--tuvi-paper`, `--tuvi-ink`, `--tuvi-muted`, theme-aware Ngũ Hành star colors, and overlay popups).
- Contextual profile link in Astrology sidebar when logged in.

### Fixed
- Landing page rapid scroll flicker & element dropout resolved via isolated count-up state, accurate `useInView` viewport detection, React `useId()`-scoped SVG def IDs, and GPU-backed glass card styling.
- Astrology sidebar login banner persistence fixed to dynamically reflect user authentication state.

### Changed
- ESLint flat configuration optimized for mixed TypeScript and module environments (0 errors).
- Architecture, UI/UX, and Function reference documents synchronized to 3.1.0 standards.
