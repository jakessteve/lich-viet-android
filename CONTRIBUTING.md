# Contributing to Lịch Việt

Thank you for your interest in contributing! This document outlines the conventions and process for submitting changes.

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/jakessteve/lich-viet-v2.git
cd lich-viet-v2

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📋 Development Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following the code standards below.

3. **Run quality checks** before committing:
   ```bash
   npm run lint          # ESLint (0 errors, <100 warnings)
   npx tsc --noEmit      # TypeScript compilation
   npm run test          # Vitest unit tests
   npm run build         # Production build
   ```

4. **Submit a Pull Request** against `main`.

## 📝 Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Description |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code change that neither fixes a bug nor adds a feature |
| `docs:` | Documentation only |
| `style:` | Formatting, semicolons, etc. |
| `test:` | Adding or updating tests |
| `chore:` | Tooling, CI, dependency updates |
| `perf:` | Performance improvement |

**Examples:**
```
feat: add lunar phase SVG to landing page
fix: correct solar term boundary calculation
refactor: extract star meanings to JSON data files
docs: add JSDoc to calendarEngine functions
```

## 🏗️ Code Standards

### TypeScript
- `strict: true` is enabled — do not weaken it
- Never use `any` (enforced by ESLint `error` rule)
- Use explicit types for function signatures

### React
- Use functional components with hooks
- Lazy-load heavy modules with `React.lazy()`
- Use `useCallback` and `useMemo` for expensive computations
- Follow the existing component file structure

### CSS
- Use Tailwind CSS v4 utility classes
- Use design tokens from `index.css` custom properties
- Support dark mode via `dark:` variant
- Mobile-first responsive design

### File Structure
```
src/
├── components/     # React UI components (grouped by feature)
├── config/         # Application configuration constants
├── data/           # Static data and interpretation files
├── hooks/          # Custom React hooks
├── i18n/           # Internationalization / Vietnamese translations
├── router/         # React Router route definitions
├── schemas/        # Zod validation schemas
├── services/       # External service integrations
├── stores/         # Zustand state management
├── styles/         # Feature CSS + self-hosted fonts
├── types/          # TypeScript type definitions
├── utils/          # Calculation engines and utilities
└── workers/        # Web Workers for heavy computation
```

## 🧪 Testing

```bash
npm run test              # Run all tests
npm run test:coverage     # Run with coverage report
```

- Tests go in the `test/` directory
- Use Vitest with the existing setup in `test/setup.ts`
- Name test files: `*.test.ts` or `*.test.tsx`

## 🔐 Security

- Never commit secrets, API keys, or credentials
- All user input must be sanitized before processing
- See `SECURITY.md` for the full security policy

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
