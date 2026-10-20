# CASA BANKO JOURNAL V2.1 — BACKUP & UPGRADE RECORD

## Backup identity
- **Date:** October 19, 2026
- **Time:** 6:49 PM PDT (America/Los_Angeles)
- **Style / version:** CASA BANKO Journal V2.1 — Dark/Gold, Mobile-First, Cloud-Synced P&L
- **Backup branch:** `backup-2026-10-19-1849-PDT-casa-banko-journal-v2-1-cloud-pnl`
- **Source snapshot commit:** `6e5aa9f2d851a5799ee9e94d2c07e45df36613f6`
- **Live source branch:** `main`
- **Live website:** https://rudiebanko.github.io/CASA-BANKO-JOURNALV2/
- **Prior backup branch:** `backup-2026-10-19-0440-PDT-trade-setups-layout`
- **Prior snapshot commit:** `b175563b8e4aac830528d794026c08d5ee318b71`

## Upgrades since prior backup
1. **Trade setup details and pin controls:** Iterated the pin control for individual setups, including an action beside Edit Analysis and layout adjustments. Pin visibility on the user's iPhone was **not confirmed fixed**; this remains unresolved.
2. **Original Analysis details:** Removed the visible Version History section from the setup-detail view while preserving stored version history data. Updated the script URL version to request fresh code.
3. **TradeLocker daily P&L source:** Inspected the original `tradelocker-daily-pnl` Supabase function and verified that the original UI read TradeLocker's reported daily P&L and computed the percentage from current balance minus that amount.
4. **2 PM Pacific trading-day boundary:** Introduced a Pacific trading-day cutoff, including daylight-saving handling, so daily results should roll over at 2:00 PM local Pacific time.
5. **Interim synced-trades calculation:** Briefly switched daily P&L to the sum of synced TradeLocker trade P&L within the trading-day window, with a broker-trade update event. This method was superseded by the balance-based method.
6. **Live balance-based P&L:** Changed daily P&L to `live TradeLocker balance − starting balance for the trading day`. Percentage is calculated from the starting balance; the actual live balance continues to be fetched from TradeLocker. This replaces the interim trade-sum method.
7. **Automatic refresh:** The TradeLocker integration refreshes when the journal is active and on focus/visibility events; the broker connection code has a 30-second visible-page refresh interval. The balance-based daily P&L updates from the refreshed balance.
8. **Cloud-synced daily starting balance:** Created Supabase table `public.tradelocker_daily_balance_baselines` with per-user, per-account, per-trading-day records and authenticated-user row-level security. The journal now loads or creates this baseline through Supabase rather than using device-specific localStorage. Devices signed into the same user/account share the baseline.
9. **Cache/version updates:** Updated script query versions in `index.html` to publish the modified TradeLocker and journal scripts.

## Current calculation
- **Balance:** Actual live TradeLocker account balance from the `tradelocker-account-state` Edge Function.
- **Starting balance:** One cloud-saved baseline for the signed-in user, TradeLocker account, and Pacific trading-day date.
- **Daily P&L:** Current live balance minus the shared baseline.
- **Daily percentage:** Daily P&L divided by starting balance, multiplied by 100 (when baseline is positive).
- **Rollover:** 2 PM Pacific local time.
- **Cross-device:** Supabase baseline shared between devices using the same login and selected TradeLocker account.

## Known limitations / verification notes
- The first successful refresh on a new trading day establishes the baseline. If trades have already occurred since 2 PM, the exact historical 2 PM balance is **not reconstructed**.
- Balance changes caused by deposits, withdrawals, or account adjustments are not separately excluded from the balance-delta P&L.
- Cross-device matching and 2 PM rollover were implemented in code but **not independently verified in the user's browsers** at the time of this backup.
- The setup-detail pin button visibility issue remains unresolved.
- A GitHub backup preserves **source code only**. It does not independently back up Supabase records, TradeLocker records, or device-only browser data.
- Supabase database migration (the daily baseline table and policies) is **external to the GitHub branch**; this document records its existence, but restoring the branch alone does not restore database state.
- The live site's actual GitHub Pages deployment status was not independently verified during this backup.

## Restoration
To restore this source snapshot, use branch `backup-2026-10-19-1849-PDT-casa-banko-journal-v2-1-cloud-pnl` or snapshot commit `6e5aa9f2d851a5799ee9e94d2c07e45df36613f6`. Do not restore without checking live changes made after this backup, and do not overwrite cloud or trading data.
