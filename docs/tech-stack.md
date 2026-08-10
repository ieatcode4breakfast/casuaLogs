# casualogs Tech Stack

## Principle

casualogs is a **local-first PWA**. The browser is the primary database. The cloud is cold backup. Every architectural decision defers to this constraint: a user offline should have zero feature degradation.

**When adding any future service, the #1 priority is: free tier with generous limits.** No service that requires a credit card for production-level usage is acceptable without explicit discussion.

---

## Client

| Concern | Choice | Version | Why |
|---|---|---|---|
| Framework | React | 19 | Already scaffolded. Component model maps to form blocks directly. |
| Language | TypeScript | 6 | Type integrity per AGENTS.md. No `any`. |
| Build tool | Vite | 8 | Native ESM dev server, fast HMR, `tsc -b` integration. |
| Test runner | Vitest | 4 | Vite-native. Shares `vite.config.ts`. No separate config. |
| DOM environment | jsdom | latest | Simulated browser DOM in Node for component tests. |
| Component tests | Testing Library | latest | Renders components, queries by accessible roles. No browser automation. |
| Linter | oxlint | latest | Scaffolded default. Zero-config for TSX. |
| Client storage | idb-keyval | latest | 500-byte IndexedDB wrapper. Async. Same author as the IndexedDB spec. |
| PWA | Service Worker API | — | Offline caching, sync triggers. Not yet implemented. |

### Testing script reference

```
npm test         # vitest run (single pass)
npx vitest       # vitest in watch mode
npm run build    # tsc -b + vite build
npm run lint     # oxlint
```

---

## Cloud

| Concern | Product | Free tier ceiling | Why |
|---|---|---|---|
| Static hosting | Cloudflare Pages | Unlimited bandwidth, 500 builds/month | Serves the Vite PWA bundle. |
| API gateway | Cloudflare Workers | 100K requests/day, 10ms CPU/request | Lightweight request validation + forwarding. |
| Cloud storage | Cloudflare R2 | 10 GB storage, 1M writes/month, 10M reads/month | 33× more daily writes than KV. Same `put(key, blob)` model. |
| Authentication | Clerk | 10K monthly active users, JWT + OAuth | Passwordless auth. JWT verified in Worker. |
| DDoS mitigation | Cloudflare edge | Unmetered L3/L4 | Absorbs volumetric attacks before they reach the Worker. |

