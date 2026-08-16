# Changelog

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [3.2.0] - 2026-08-16

### Added
- **High-Precision Calculation-Grounded Western Astrology Synthesis Engine (`westernSynthesisEngine.ts`)**:
  - Diurnal vs. Nocturnal sect classification (Mặt Trời trên/dưới chân trời), sect lights, and sect comfort modifiers.
  - Essential dignity evaluation (*Cư Miếu, Đắc Vượng, Hãm Địa, Tuyệt Địa, Tự Do*).
  - Dynamic House Rulership synthesis (linking ruling planets to houses governed vs. houses occupied).
  - Ascendant Chart Ruler deep life vector synthesis.
  - Solilunar aspects & birth Moon phase contextual readings.
  - Aspect pattern syntheses (Grand Trine, T-Square, Stellium, etc.) and element/modality balance.
- **Vedic Jyotish Holistic Synthesis Engine (`vedicSynthesisEngine.ts`)**:
  - Janma Nakshatra (27 constellations) & Pada (4 quarters) with ruling deities and *Purusharthas* (*Dharma, Artha, Kama, Moksha*).
  - Atmakaraka (soul planet) calculation & *Purva Punya* soul growth lessons.
  - Detected Vedic Yogas & Doshas integration (*Gajakesari, Pancha Mahapurusha, Raja Yogas, Budhaditya*).
  - Active Vimshottari Dasha 10-year planetary timeline calculation.
  - Bhava distribution matrix (Kendra power vs Trikona grace vs Dusthana transformation).
- **Tử Vi Foundational Matrix Palace Enhancements (`palaceInterpretation.ts`)**:
  - Dynamic integration of Âm Dương Thuận/Nghịch lý, Bản Mệnh Nạp Âm vs Ngũ Hành Cục, and Thân Cư post-30 transition priorities into palace actionable guidance.
- **Dialectical Tri-System Cross-Synthesizer (`dialecticalSynthesis.ts`)**:
  - Unified multi-layered synthesis connecting Western Social Persona + Tử Vi Circumstantial Reality + Vedic Soul Core into an empowering "Thân - Tâm - Trí" life strategy.
- Comprehensive Unit Test Coverage: 80 test files / 563 tests passing (100% green).
- Clean production bundle & fresh Android APK build.

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
