# Security Model - Lich Viet v3

## Architecture

Lich Viet v3 is a client-side SPA. There is no backend server in this repository, so all app logic, state, and persistence run in the browser.

## Authentication

> ⚠️ DEMO ONLY - Authentication is implemented with `localStorage` for local testing and product demos. It is not production-grade authentication.

Current behavior:

- User records are stored in `localStorage`
- Passwords are hashed with salted SHA-256
- A seeded demo admin account is created on first load for local testing
- Social login is simulated on the client
- Session state is also persisted in `localStorage`

Not present in v3:

- Production server-side auth
- Real TOTP 2FA
- HttpOnly session cookies
- Backend role enforcement

For production migration, move auth to a real identity provider or server-backed auth system such as Firebase Auth, Supabase Auth, or a custom backend with:

- bcrypt or argon2 password hashing with per-user salts
- Server-stored session tokens
- Real 2FA flows

## Content Security Policy

CSP is configured via `<meta>` tags in `index.html`:

- `script-src 'self'` - only same-origin scripts
- `style-src-elem 'self'` - only same-origin stylesheets
- `style-src-attr 'unsafe-inline'` - required for runtime style attributes
- `frame-src 'none'` and `frame-ancestors 'none'` - anti-clickjacking
- `object-src 'none'` - blocks plugins
- `base-uri 'self'` - prevents base tag hijacking

## External API Calls

| Service       | Purpose                                   | Data Sent                    |
| ------------- | ----------------------------------------- | ---------------------------- |
| ipapi.co      | Geo-IP detection for holiday localization | User IP, via browser request |
| date.nager.at | Public holidays for non-Vietnam locales   | Country code and year        |

No authentication tokens are sent to external services. Holiday lookups are cached locally and default to Vietnam when geo detection fails.

## Reporting Vulnerabilities

If you discover a security issue, please open a private issue on the GitHub repository.
