# Braj Accounting: E2E Quality Checklist

This document outlines the critical test cases and quality gates for the Braj Accounting application. Every item must pass for a "Production Ready" release.

## 1. Global Infrastructure & Environment
- [ ] **App Bootstrapping**: `npm run dev` starts without errors.
- [ ] **Initial State**: User lands on the Dashboard or Company Selection if no company is selected.
- [ ] **3D Experience**: Smooth, interactive background with mouse-tilt refraction.
- [ ] **Noise Overlay**: Subtle paper texture visible on glass panels.
- [ ] **Theme Switching**: Toggle between "Midnight" (Dark) and "Cloud" (Light) without invisible text.

## 2. Company & Tenancy
- [ ] **Select Company**: Switching company via header updates all dashboard data instantly.
- [ ] **Company Info**: Correct GSTIN and State displayed in Dashboard and Print views.

## 3. Dashboard Experience
- [ ] **Live Data**: Stats cards (Revenue, Expenses, Cash) show real API values.
- [ ] **Skeletons**: Shimmering placeholders visible while data is fetching.
- [ ] **Quick Navigation**: Clicking "New Voucher" or "View All" correctly routes the user.
- [ ] **Recent Activity**: Last 10 vouchers visible with status indicators.

## 4. Ledger Management
- [ ] **Ledger List**: Renders all accounts with correct balances.
- [ ] **Drill-down**: Clicking a ledger opens the **Ledger Statement**.
- [ ] **Running Balance**: Statement page correctly calculates cumulative balance per row.

## 5. Voucher Entry (The Core Engine)
- [ ] **Auto-Detect**: System correctly identifies Voucher Type based on ledger selection.
- [ ] **Keyboard Mastery**:
  - [ ] `Alt + L` adds a new line.
  - [ ] Arrow keys and `Enter` navigate between cells.
  - [ ] `Alt + J` focuses the narration field.
  - [ ] `Ctrl + Shift + N` triggers Smart Narration.
  - [ ] `Ctrl + Enter` posts the voucher.
- [ ] **Balance Lock**: "Post" button is disabled and greyed out if Debits ≠ Credits.
- [ ] **Smart Narration**: Professional phrases generated correctly for all types.
- [ ] **Success Flow**: Auto-redirects to Voucher Detail page after saving.

## 6. Audit & History
- [ ] **Activity Sidebar**: `Ctrl + Shift + A` toggles a live timeline of recent additions.
- [ ] **Timeline Sync**: New vouchers appear in the sidebar immediately after posting.

## 7. Premium Print Capability
- [ ] **Print Dialog**: `Ctrl + P` (or Print button) shows a clean, A4-ready invoice.
- [ ] **Styling**: Sidebar and header are hidden; fonts switch to high-contrast Serif.
- [ ] **Ledger Names**: Mapping works; names appear instead of IDs on the printout.

## 8. Keyboard & Command Palette
- [ ] **Command Palette**: `Ctrl + K` opens the search/action menu.
- [ ] **Shortcuts**: All global hotkeys (`Alt+T`, `Ctrl+Shift+A`, `Ctrl+K`) are non-conflicting.

## 9. Performance & Errors
- [ ] **Zero Console Errors**: No Red flags in browser console.
- [ ] **TypeScript**: `npx tsc --noEmit` passes with 0 errors.
- [ ] **Responsiveness**: UI remains usable and beautiful at 768px (Tablet) and 1024px (Laptop).

---
*Last Updated: 2026-05-04*
