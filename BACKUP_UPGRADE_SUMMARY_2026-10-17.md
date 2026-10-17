# CASA BANKO Journal V2 — Upgrade Summary

**Checkpoint:** October 17, 2026, 3:52 PM PDT reference time
**Design:** Obsidian Black + Brushed Gold
**Live site:** https://rudiebanko.github.io/CASA-BANKO-JOURNALV2/
**Backup branch:** CASA-BANKO-V2-Obsidian-Black-Brushed-Gold-2026-10-17-1552-PDT-BACKUP

## Upgrades completed

### Planned Setup trade state
- Added manual MARK AS IN TRADE and MARK TRADE COMPLETED.
- Added REMOVE ACTIVE STATUS so accidental activation does not mark a completed trade.
- Kept planned setup monitoring, screenshots, and history intact.

### Linked In-Trade Reset
- Main shortcut asks which saved setup is being managed.
- Active setups include a direct In-Trade Reset shortcut.
- Reset retains FEAR, FACTS, and DECISION.
- Selected setup appears in a compact card under the reset heading with CHANGE and VIEW ORIGINAL ANALYSIS controls.
- Completed reset logs are associated with the selected setup.

### Return from Original Analysis
- Added RETURN TO IN-TRADE RESET in saved setup detail.
- Returning restores the selected setup, step, and answers while the page remains open.
- In-progress reset restoration across refresh or closing Safari is not implemented.

### Unified checklist and save workflow
- Preserved the 14-question Pre-Market Analysis Checklist and its four sections.
- Added CONTINUE TO SAVE SETUP and FINALIZE & SAVE SETUP.
- Planned direction and setup type carry over from checklist selections.
- Current stage and market condition remain separately selectable.
- Chart screenshot upload and optional personal analysis remain part of saving.

### Original analysis and preview correction
- Checklist answers remain in the saved checklist dropdown, separate from personal analysis.
- New setup notes store only what the user types.
- The main Planned Setups preview shows personal notes, not the generated checklist summary.
- Added non-destructive display handling for previously saved setups with mixed notes, including the October 17 BUY XAUUSD example.

### Mobile width
- Constrained PLAN and checklist widths to reduce side-to-side movement on iPhone Safari.

## Systems preserved
TradeLocker integration, journal stats, trade history, Flip Challenge, saved setup monitoring and images, Missed Trade and Urge Reset, and the existing black-and-gold styling. V1 and personal Checkpoint repositories were not modified.

## Backup scope
This branch captures website source code, **not** Safari IndexedDB/localStorage, personal saved setup data stored on a device, or TradeLocker account data. Back up browser data separately.

## Restore caution
Treat the current live main branch as the source of truth. Do not overwrite it with this branch without explicit approval.
