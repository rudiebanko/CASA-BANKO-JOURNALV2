# CASA BANKO V2 — Code Backup and Upgrade Summary

**Date:** October 18, 2026  
**Backup label time:** 4:04 PM PDT (California)  
**Style:** Obsidian Black + Brushed Gold  
**Repository:** `rudiebanko/CASA-BANKO-JOURNALV2`  
**Source:** `main` at commit `021e0161f67acf35d1c2242e0a7b780d23f04a0e`  
**Backup branch:** `CASA-BANKO-V2-Obsidian-Black-Brushed-Gold-2026-10-18-1604-PDT-BACKUP`

## Purpose
Preserve the live CASA BANKO V2 code before the approved Option 3 / Focus Mode mobile redesign is implemented. The backup branch is intended as a frozen restoration point. The original V1 journal and personal Checkpoint repositories are not modified.

## Existing application and functionality preserved
- PLAN workflow with Planned Setups, saved chart screenshots, notes, analysis updates, market stages, conditions, and setup checklists.
- In-Trade Reset (FEAR → FACTS → DECISION), saved reset history and links to original saved setups.
- Pre-Market Analysis Checklist and Finalize & Save Setup.
- Urge Reset and Missed A Trade reset/history.
- 10 Flip Challenge, Journal Stats, and journal trade/history screens.
- Existing TradeLocker balance/history integrations and per-device broker connection settings.
- Obsidian Black + Brushed Gold visual style and mobile navigation.

## October 18 upgrades included in this backup
### CASA BANKO Cloud
- Introduced `v2-cloud.js` and a Settings cloud sign-in / sign-up / manual sync / restore-merge / sign-out interface.
- Reused the existing CASA BANKO Supabase project and user authentication; V1 cloud code and data tables were left untouched.
- Added a separate `public.v2_cloud_documents` table with per-user Row Level Security policies.
- Expanded sync to Planned Setups and screenshots, In-Trade Reset history, Missed A Trade history, Urge Reset history, local journal trades/history, and Flip Challenge state.
- Implemented merge behavior, local safety snapshots in IndexedDB, and pagination for cloud document retrieval.
- Wired local-change notifications and cloud-refresh events into relevant V2 components.
- Left TradeLocker account connections, broker data, live balance/P&L and reconciliation device-specific rather than syncing those settings.

### Previous upgrades still present
- Planned Setup storage and status handling; manual IN TRADE / TRADE COMPLETED independent of setup waiting status.
- Saved checklist and original-analysis presentation improvements.
- Original Analysis ↔ In-Trade Reset navigation with in-memory reset-progress preservation.
- Plan page layout and horizontal mobile overflow fixes.
- Journal Stats and challenge tools.

## Upcoming mobile redesign — approved, NOT included in this backup
1. Option 3 Focus Mode mobile layout as the design direction.
2. Remember scroll position in Original Analysis.
3. Pin one Planned Setup at the top of the existing list using a small gold pin icon, without altering its trade status.
4. Optional Distraction-Free Focus Mode that hides secondary tools but keeps In-Trade Reset and essential actions available.

**Important:** The mobile redesign above has only been explored through separate HTML previews. It has NOT been applied to the live website in this backup.

## Backup scope and limitations
- This is a **GitHub source-code snapshot**, not a copy of users' browser IndexedDB/localStorage, Supabase cloud database rows, screenshots stored in user accounts, or TradeLocker data.
- The Supabase database migration is an external backend change and is not rolled back by restoring this Git branch.
- Source code is captured at the specified commit. A GitHub branch is not an independent copy of external services or live browser state.
- Cloud-sync features have been user-tested at a basic level; this document is not a claim of exhaustive regression or concurrency testing.

## Restore reference
To return the V2 repository's source code to the backup state, use the branch's source commit `021e0161f67acf35d1c2242e0a7b780d23f04a0e` (not the later documentation-only commit). Review any changes after this backup before restoring. Do not modify this backup branch.

**Live site:** https://rudiebanko.github.io/CASA-BANKO-JOURNALV2/
