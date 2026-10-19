# CASA BANKO Journal V2.1 — Backup & Upgrade Record

**Snapshot:** October 19, 2026, 4:40 AM Pacific Daylight Time (PDT)
**Snapshot source:** LIVE GitHub repository `rudiebanko/CASA-BANKO-JOURNALV2`
**Website:** https://rudiebanko.github.io/CASA-BANKO-JOURNALV2/
**Backup branch:** `backup-2026-10-19-0440-PDT-trade-setups-layout`
**Exact live source commit:** `b175563b8e4aac830528d794026c08d5ee318b71`
**Layout:** Black background, gold accents and icons, white labels, compact mobile-first sections and dividers.

## What was upgraded

1. **Trade Setups navigation:** Reorganized into expandable sections in this exact order: Active Trades, Waiting for Trades, Completed Trades. Each section has a count and displays all matching setups, including the featured setup.
2. **Trade classification:** Uses saved trade state; a setup whose current market condition is **Entry triggered** appears under Active Trades, except completed trades, which stay under Completed Trades. Other nonactive/noncompleted setups appear under Waiting for Trades.
3. **Featured setup preview:** Preserved at the top. The latest journal note appears directly below the setup chart as plain white text, without a separate card, gold left border, or “Latest Journal Note” heading. Long note previews are limited to three lines.
4. **View All Setups:** Retained as a complete browsing option under **Additional Tools**, rather than inside the main Trade Setups section.
5. **Additional Tools:** Added a gold list icon to View All Setups. Placed that row in the **same container** as 10 Flip Challenge, Journal Stats, and Missed A Trade, sharing their row padding and dividers for consistent vertical spacing. This was the final user-approved layout.
6. **Journal Market Condition dropdown:** Fixed malformed HTML markup in the custom dropdown wrapper. Preserved the floating dropdown design and option selection; user confirmed it works after the correction. Did not retain the attempted native select or form-expanding alternative.
7. **Existing functionality preserved:** Setup Workflow (Pre-Market Analysis Checklist; Finalize & Save Setup), saved setup details, journal history, TradeLocker integration, and the existing navigation were not intentionally redesigned.

## Prior enhancements retained in the snapshot

- Saved setup detail shows its original date and time on separate lines.
- Overall Result expansion and pending notes are preserved across setup-list rerenders.
- Waiting for Trades and other labels use the approved typography and minimal black/gold styling.

## Protection / restore notes

- This branch is a **source-code snapshot** of the live GitHub site at the commit above. It does **not** separately export browser-local data, Supabase records, TradeLocker account data, or secrets.
- The live default branch was **not** switched or reset by creating this backup.
- To restore, compare the backup branch with the live branch and deliberately restore the desired commit/files; do not overwrite later user data.
- Future edits should inspect the current live source first and be surgical, with no unrelated refactors or patch stacking.

## Relevant implementation files

- `index.html`: styling, Plan page layout, Additional Tools grouping, script cache version.
- `plan-v2.js`: saved setup list, featured preview, trade category grouping, journal update editor, View All Setups interaction.

**Snapshot status:** User approved the final Additional Tools spacing immediately before requesting this backup.
