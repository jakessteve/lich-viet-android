# Function & Engine Reference - Lich Viet v3

> **Version:** 3.1.0 | **Updated:** August 2026  
> Source of truth for engine APIs, calculation pipelines, and domain functions.

---

## 1. Active Surfaces & Route Catalog

Lịch Việt is a browser-only SPA packaged for Android via Capacitor. All computation runs locally in client-side TypeScript.

| Surface | Route | Primary Component | Responsibility |
| --- | --- | --- | --- |
| Landing | `/` | `src/components/pages/LandingPage.tsx` | App intake, feature showcase, and birth data seeding |
| Âm Lịch & Dụng Sự | `/app/am-lich` | `src/components/pages/AmLichPage.tsx` | Solar/lunar conversion, Can Chi, Tiết Khí, Hoàng Đạo/Hắc Đạo, and personal score |
| Ngày Tốt (Electional) | `/app/ngay-tot` | `src/components/Election/ElectionPage.tsx` | Date range search, activity filtering, and personal chart compatibility |
| Gieo Quẻ & Tam Thức | `/app/gieo-que` | `src/components/GieoQue/GieoQueView.tsx` | Mai Hoa Dịch Số, Kỳ Môn Độn Giáp, Thái Ất, and Đại Lục Nhâm |
| Tử Vi Đẩu Số | `/app/tu-vi` | `src/components/TuVi/TuViPage.tsx` | 12-palace chart generation, true-solar correction, and SVG export |
| Chiêm Tinh Tây Phương | `/app/chiem-tinh/tay-phuong` | `src/components/Astrology/Western/WesternAstrologyPage.tsx` | Western natal chart, Placidus/Whole Sign houses, aspects, wheel renderer |
| Chiêm Tinh Ấn Độ | `/app/chiem-tinh/vedic` | `src/components/Astrology/Vedic/VedicAstrologyPage.tsx` | Vedic Rasi & D9 Navamsha charts, Nakshatras, and square chart renderers |
| Hợp Lá Số (Synastry) | `/app/chiem-tinh/hop-la` | `src/components/Astrology/Synastry/SynastryPage.tsx` | Dual chart cross-aspect comparison and synastry analysis |
| Cài Đặt & Profile | `/app/cai-dat` | `src/components/pages/SettingsPage.tsx` | User preferences, theme, data storage, and export management |
| Authentication | `/app/dang-nhap`, `/app/dang-ky` | `LoginPage.tsx`, `RegisterPage.tsx` | Demo-mode local profile management |
| Nâng Cấp | `/app/nang-cap` | `src/components/pages/UpgradePage.tsx` | Feature tier matrix and membership status |

---

## 2. Core Calculation Engine Catalog

All computational engines are pure TypeScript with zero external network dependencies:

### A. Calendar & Auspicious Timing Layer (`src/utils/`)
- `calendarEngine.ts`: Core solar-to-lunar conversion, lunar month leap rule solvers, Can Chi calculation, and location-aware caching.
- `activityScorer.ts`: 28-mansions (Nhị Thập Bát Tú), 12 Directing Officers (Trực), and Thập Nhị Thần scoring.
- `dungSuEngine.ts`: Day quality classification, activity suitability filtering, and rule aggregation.
- `dungSuSuggester.ts`: Date range scanner for optimal activity dates.

### B. Divination & Metaphysical Engines (`src/utils/`)
- `maiHoaEngine.ts`: Mai Hoa Dịch Số calculation (Upper/Lower trigrams, Changing lines, Initial/Mutual/Transformed hexagrams).
- `maiHoaInterpreter.ts`: Hexagram name mapping, elemental dynamics, and fortune interpretations.
- `tamThucSynthesis.ts`: Unified synthesis of Tam Thức (Kỳ Môn Độn Giáp + Thái Ất + Đại Lục Nhâm).
- `qmdjEngine.ts`: Kỳ Môn Độn Giáp 9-palace board, 8 Doors (Bát Môn), 9 Stars (Cửu Tinh), and 8 Deities (Bát Thần).
- `thaiAtEngine.ts`: Thái Ất Thần Kinh cyclical counters, hosts/guests (Chủ/Khách) calculations.
- `lucNhamEngine.ts`: Đại Lục Nhâm Heaven/Earth plates, 4 Lessons (Tứ Khóa), and 3 Transmissions (Tam Truyền).

### C. Astronomical & Astrological Services (`src/services/`)
- `services/astronomy/swissEphemeris.ts`: WebAssembly Swiss Ephemeris bridge, high-precision planetary positions, and true solar time.
- `services/tuvi/birthContext.ts`: Birthplace geolocation normalization, leap month policies (`split-15`), and civil date resolution.
- `services/tuvi/starPlacement.ts`: Complete Thiên Lương / Nam Phái star placement, 14 major stars, auxiliary rings, and Hạn contexts.
- `services/tuvi/timeNormalization.ts`: Historical Vietnam timezone resolution (1906–present) and Can Chi hour formatting.
- `services/tuvi/centerMetadata.ts`: Mệnh/Thân chủ calculation, Nạp Âm ngũ hành, and Lai Nhân cung.
- `services/tuvi/combinationDetection.ts`: Classical Cách Cục detection across Tam Hợp and Đối Cung.
- `services/astrology/`: Western natal calculations, house cusp resolvers (Placidus, Koch, Whole Sign, Equal), aspect matrices, and Vedic Lahiri ayanamsha calculations.
- `services/personalization/personalDayScore.ts`: Personal birth Can Chi vs daily Can Chi harmony/conflict scoring (Tam Hợp, Lục Hợp, Lục Xung, Lục Hại, Tương Hình, Tương Phá).

---

## 3. Package Architecture & Facades

Public library abstractions under `packages/core/src/`:

| Package Import | Functionality |
| --- | --- |
| `@lich-viet/core` | Core library facade and shared constants |
| `@lich-viet/core/calendar` | Solar-lunar conversions and Can Chi math |
| `@lich-viet/core/dungsu` | Activity scoring and day quality evaluation |
| `@lich-viet/core/maihoa` | Mai Hoa hexagram casting and analysis |
| `@lich-viet/core/tamThuc` | Unified Tam Thức divination synthesis |
| `@lich-viet/core/qmdj` | Kỳ Môn Độn Giáp calculation engine |
| `@lich-viet/core/thaiAt` | Thái Ất astrological forecast engine |
| `@lich-viet/core/lucNham` | Đại Lục Nhâm divination engine |
| `@lich-viet/types` | Unified TypeScript type definitions |

---

## 4. State Management Layer

| Store (`src/stores/`) | State Scope | Persistence |
| --- | --- | --- |
| `appStore.ts` | Selected date, viewer geolocation, theme, font preferences | `localStorage` |
| `authStore.ts` | Local demo profile, user birthday, and session metadata | `localStorage` |
| `tuviStore.ts` | Active Tu Vi input, calculated chart, selected palace, and Hạn timeline | Memory |
| `electionStore.ts` | Electional search filters, target date range, selected activities | Memory |

---

## 5. Validation & Quality Baseline

| Verification Step | Command | Status |
| --- | --- | --- |
| Type Safety | `npm run typecheck` | **Passed (0 errors)** |
| Engine & Unit Tests | `npm test` | **Passed (59/59 suites, 463/463 tests)** |
| Static Analysis | `npm run lint` | **Passed (0 errors)** |
| Production Build | `npm run build` | **Passed (Clean Vite + PWA build)** |
