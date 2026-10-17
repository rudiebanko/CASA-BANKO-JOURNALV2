# TradeLocker integration plan — Journal V2

Status: **not connected**. This document records the integration boundary before implementation.

## Verified reference in existing project
The existing `rudiebanko/casa-banko-journal` frontend:
- Authenticates users with Supabase and calls the `tradelocker-sync` and `tradelocker-account-state` Edge Functions.
- Uses `tradelocker-daily-pnl` for broker-derived daily P&L.
- Reads account connections from the `tradelocker_connections` table.
- Performs periodic sync approximately every five minutes and refreshes on reconnection.
- Reconciles trade identifiers to avoid duplicates and keeps separate accounts isolated.

The backend Edge Function implementations and database policies have **not** been audited for V2 access.

## Required implementation sequence
1. Confirm whether V2 should use the existing Supabase project or a new isolated Supabase project. No credentials should be copied into GitHub.
2. Inspect backend function request/response schemas, authenticated access, row-level security, and origin handling. Do not assume existing frontend endpoints are safe to reuse in V2.
3. Add a login/session UI and explicit TradeLocker connection status. Never accept broker passwords or tokens in the static frontend.
4. Fetch connected accounts and their broker balance/state via authenticated backend calls. Show clear stale/offline timestamps.
5. Sync open and closed trades using stable broker trade IDs scoped to account ID; keep broker-reported realized P&L, fees, and timestamps authoritative.
6. Attach journal screenshot and notes to a stable broker trade ID without modifying broker data. Preserve manual entries as separate records.
7. Test reconnect, token expiration, account switching, partial fills, duplicate syncs, and historical reconciliation.
8. Only then enable live P&L/balance cards and replace manual trade entry in production.

## Safety and data integrity
- The current HTML is a **local Phase 1 prototype**, not a secure multi-device journal.
- IndexedDB data is device/browser-specific and can be cleared; do not treat it as backed up.
- Do not commit secrets or service-role keys. A Supabase public publishable key alone is not authentication.
- Do not present estimated P&L as broker-confirmed.
- Do not change either existing CASA BANKO repository to implement V2.
