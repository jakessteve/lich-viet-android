# Function & Engine Reference - Lich Viet v3

> **Version:** 3.3.0 | **Updated:** August 2026  
> Source of truth for engine APIs, calculation pipelines, backend controllers, and domain functions.

---

## 1. Active Surfaces & Route Catalog

Lịch Việt is an offline-first SPA packaged for Android via Capacitor, with optional NestJS Fastify backend synchronization.

| Surface | Route | Primary Component | Responsibility |
| --- | --- | --- | --- |
| Landing | `/` | `src/components/pages/LandingPage.tsx` | App intake, feature showcase, and birth data seeding |
| Âm Lịch & Dụng Sự | `/app/am-lich` | `src/components/pages/AmLichPage.tsx` | Solar/lunar conversion, Can Chi, Tiết Khí, Hoàng Đạo/Hắc Đạo, Sổ Đám Giỗ trigger, and personal score |
| Ngày Tốt (Electional) | `/app/ngay-tot` | `src/components/Election/ElectionPage.tsx` | Date range search, activity filtering, and personal chart compatibility |
| Gieo Quẻ & Tam Thức | `/app/gieo-que` | `src/components/GieoQue/GieoQueView.tsx` | Mai Hoa Dịch Số, Kỳ Môn Độn Giáp, Thái Ất, and Đại Lục Nhâm |
| Tử Vi Đẩu Số | `/app/tu-vi` | `src/components/TuVi/TuViPage.tsx` | 12-palace chart generation, true-solar correction, and SVG export |
| Chiêm Tinh Tây Phương | `/app/chiem-tinh/tay-phuong` | `src/components/Astrology/Western/WesternAstrologyPage.tsx` | Western natal chart, Placidus/Whole Sign houses, aspects, wheel renderer |
| Chiêm Tinh Ấn Độ | `/app/chiem-tinh/vedic` | `src/components/Astrology/Vedic/VedicAstrologyPage.tsx` | Vedic Rasi & D9 Navamsha charts, Nakshatras, and square chart renderers |
| Hợp Lá Số (Synastry) | `/app/chiem-tinh/hop-la` | `src/components/Astrology/Synastry/SynastryPage.tsx` | Dual chart cross-aspect comparison and synastry analysis |
| Cài Đặt & Profile | `/app/cai-dat` | `src/components/pages/SettingsPage.tsx` | User preferences, theme, cloud sync trigger & status, data export |
| Authentication | `/app/dang-nhap`, `/app/dang-ky` | `LoginPage.tsx`, `RegisterPage.tsx` | Local demo & remote backend authentication |
| Nâng Cấp | `/app/nang-cap` | `src/components/pages/UpgradePage.tsx` | Feature tier matrix and membership status |

---

## 2. Core Calculation Engine Catalog

All computational engines are pure TypeScript and can run either in-browser or on the NestJS backend:

### A. Calendar & Auspicious Timing Layer (`src/utils/` & `packages/core/src/calendar/`)
- `calendarEngine.ts`: Core solar-to-lunar conversion, lunar month leap rule solvers, Can Chi calculation, and location-aware caching.
- `activityScorer.ts`: 28-mansions (Nhị Thập Bát Tú), 12 Directing Officers (Trực), and Thập Nhị Thần scoring.
- `dungSuEngine.ts`: Day quality classification, activity suitability filtering, and rule aggregation.
- `dungSuSuggester.ts`: Date range scanner for optimal activity dates.

### B. Divination & Metaphysical Engines (`src/utils/` & `packages/core/`)
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

## 3. Backend HTTP API Controllers (`packages/app-backend/src/modules/`)

| Controller | Base Path | Key Endpoints | Description |
| --- | --- | --- | --- |
| `AuthController` | `/v1/auth` | `POST /login`, `POST /register`, `POST /social` | User authentication, token issuance, credential management |
| `UsersController` | `/v1/users` | `GET /me`, `PATCH /me` | User profile retrieval and personal settings update |
| `DamGioController` | `/v1/dam-gio` | `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id` | Ancestral death anniversaries CRUD with lunar date mapping |
| `CalendarController` | `/v1/calendar` | `GET /day`, `GET /dung-su/catalog`, `GET /dung-su/score`, `GET /events`, `POST /events`, `DELETE /events/:id` | Calendar calculations, catalog querying, and personal events |
| `SyncController` | `/v1/sync` | `POST /` | Delta sync protocol with watermark timestamps and mutation ACKs |
| `TuViController` | `/v1/tu-vi` | `POST /chart` | Server-side Tử Vi chart computation and verification |
| `AstrologyController` | `/v1/astrology` | `POST /western`, `POST /vedic`, `POST /synastry` | Western natal, Vedic Kundli, and Synastry calculations |
| `DivinationController` | `/v1/divination` | `POST /mai-hoa`, `POST /tam-thuc` | Hexagram casting and Tam Thức board generation |
| `ElectionController` | `/v1/election` | `POST /scan` | High-performance date range scan for auspicious activities |

---

## 4. State Management & Gateway Layer

| Store / Layer | Module Path | Scope | Persistence / Runtime |
| --- | --- | --- | --- |
| `appStore` | `src/stores/appStore.ts` | Selected date, viewer geolocation, theme, font preferences | `localStorage` |
| `authStore` | `src/stores/authStore.ts` | Authenticated user session, profile metadata, login/register | `RuntimeContext.auth` + `localStorage` |
| `damGioStore` | `src/stores/damGioStore.ts` | Ancestral death anniversaries, lunar reminders, CRUD operations | `RuntimeContext.damGio` + `localStorage` |
| `profileVaultStore` | `src/stores/profileVaultStore.ts` | Vault profiles, charts, and cloud sync trigger (`syncWithCloud`) | `RuntimeContext.sync` + IndexedDB |
| `tuviStore` | `src/stores/tuviStore.ts` | Active Tu Vi input, calculated chart, selected palace, and Hạn timeline | Memory |
| `electionStore` | `src/stores/electionStore.ts` | Electional search filters, target date range, selected activities | Memory |
| `RuntimeContext` | `src/gateways/bootstrap.ts` | Runtime provider switching between `createDemoRuntime` and `createRemoteRuntime` | Configurable (`VITE_APP_RUNTIME`) |
