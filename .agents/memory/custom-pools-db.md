---
name: Custom pools DB pattern
description: How user-registered pools are stored and surfaced in pool listings.
---

## DB table: custom_pools
Stores pools created by users via the Create Pool page. Schema in `lib/db/src/schema/customPools.ts`.

## Registration flow
1. User calls `factory.create()` on-chain via wagmi
2. Frontend decodes pool address from TX receipt logs (factory emits PoolCreated event)
3. Frontend POSTs to `POST /api/pools/register` with poolAddress
4. Server calls `readPoolState()` on-chain to verify + get token info
5. Server upserts into `custom_pools` table

## Listing
`listSupportedPools()` in poolReader.ts:
1. Fetches Maverick API data + `db.select().from(customPools)` in parallel
2. Hardcoded allowlist pools processed first
3. DB pools (not in allowlist) appended to result
4. Both try Maverick API data first, fall back to on-chain reads

**Why:** Users can deploy pools for arbitrary token pairs — the allowlist cannot enumerate these. DB provides persistence across server restarts.

**How to apply:** Any new pool created via the factory can be registered so it appears in GlidePool's explorer and can be used with agents.
