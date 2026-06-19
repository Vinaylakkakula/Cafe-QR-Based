// ============================================================
// MOBILE RESPONSIVE FIX v3 — Complete mobile layout fix
// ============================================================

(function injectMobileStyles() {
  const css = `
/* ── Reset ───────────────────────────────────────────────────── */
* { box-sizing: border-box; }

@media (max-width: 768px) {

  /* ── Root: full-height column, bottom nav at foot ─────────── */
  #root:has(.main-col) {
    display: flex !important;
    flex-direction: column !important;
    height: 100dvh !important;
    overflow: hidden !important;
    grid-template-columns: none !important;
    grid-template-rows: none !important;
  }

  /* ── Sidebar: hidden, replaced by bottom nav ──────────────── */
  .sidebar { display: none !important; }

  /* ── Main column: fills space above bottom nav ────────────── */
  .main-col {
    flex: 1 1 0 !important;
    width: 100% !important;
    min-height: 0 !important;
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    padding-bottom: 0 !important;
    grid-row: unset !important;
  }

  /* ── Topbar ───────────────────────────────────────────────── */
  .topbar {
    height: auto !important;
    min-height: 52px !important;
    padding: 8px 12px !important;
    gap: 8px !important;
    flex-wrap: nowrap !important;
    flex-shrink: 0 !important;
  }
  .page-title-main { font-size: 16px !important; }
  .page-title-sub  { display: none !important; }
  .search-box      { display: none !important; }
  .cashier-chip    { display: none !important; }
  .shift-badge     { display: none !important; }
  .clock-date      { display: none !important; }
  .clock-time      { font-size: 13px !important; }
  .topbar-right    { gap: 8px !important; }

  /* ── Stats strip: 2×2 grid ────────────────────────────────── */
  .stats-strip {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 1px !important;
    padding: 0 !important;
    background: var(--line) !important;
    flex-shrink: 0 !important;
  }
  .stat-tile        { padding: 10px 12px !important; background: var(--bg-1) !important; }
  .stat-tile-value  { font-size: 17px !important; }
  .stat-tile-label  { font-size: 9px !important; }
  .stat-tile-delta  { font-size: 10px !important; }

  /* ── Dashboard body: single scrollable column ─────────────── */
  .dash-body {
    flex: 1 1 0 !important;
    display: flex !important;
    flex-direction: column !important;
    grid-template-columns: none !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    min-height: 0 !important;
    gap: 0 !important;
    background: var(--bg) !important;
    padding-bottom: 64px !important;
  }
  .dash-center {
    width: 100% !important;
    padding: 10px 12px !important;
    flex-shrink: 0 !important;
    overflow: visible !important;
  }
  .dash-right {
    width: 100% !important;
    flex-shrink: 0 !important;
    border-left: none !important;
    border-top: 1px solid var(--line) !important;
    background: var(--bg-1) !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: visible !important;
    min-height: 0 !important;
    position: static !important;
  }

  /* ── Order panel: let it flow naturally ───────────────────── */
  .order-panel {
    width: 100% !important;
    border-left: none !important;
    border-radius: 0 !important;
    overflow: visible !important;
    display: flex !important;
    flex-direction: column !important;
  }
  .order-head   { padding: 10px 14px !important; flex-shrink: 0 !important; }
  .order-items  { overflow: visible !important; max-height: none !important; flex: none !important; }
  .order-item   { padding: 8px 14px !important; }
  .totals       { padding: 10px 14px !important; flex-shrink: 0 !important; }
  .total-row    { font-size: 12px !important; }
  .grand .val   { font-size: 18px !important; }
  .order-actions {
    padding: 10px 14px 14px !important;
    flex-shrink: 0 !important;
  }
  .order-actions .btn { font-size: 12px !important; padding: 10px !important; }
  .small-input  { width: 50px !important; font-size: 11px !important; }
  .tax-input    { width: 50px !important; font-size: 11px !important; }
  .order-table-num { font-size: 18px !important; }

  /* ── Ticker: live activity ────────────────────────────────── */
  .ticker {
    padding: 10px 12px !important;
    max-height: 120px !important;
    overflow-y: auto !important;
    flex-shrink: 0 !important;
  }

  /* ── Floor grid ───────────────────────────────────────────── */
  .floor-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(95px, 1fr)) !important;
    gap: 8px !important;
  }
  .table-card   { padding: 8px !important; aspect-ratio: 1.05 !important; }
  .table-num    { font-size: 16px !important; }
  .table-cap, .table-waiter, .table-meta { font-size: 9px !important; }
  .table-total  { font-size: 10px !important; }
  .table-status { display: none !important; }
  .table-card.preparing .table-status,
  .table-card.ready .table-status {
    display: inline-block !important;
    font-size: 8px !important;
    padding: 1px 4px !important;
    border-radius: 6px !important;
    white-space: nowrap !important;
    margin-left: 2px !important;
  }
  .table-card button[title="Show QR code"] {
    top: 6px !important;
    right: 6px !important;
    padding: 1px 4px !important;
    font-size: 11px !important;
  }

  /* ── Category tabs ────────────────────────────────────────── */
  .cat-tabs {
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 4px !important;
    gap: 4px !important;
  }
  .cat-tabs::-webkit-scrollbar { display: none; }
  .cat-tab {
    padding: 6px 10px !important;
    font-size: 11px !important;
    flex-shrink: 0 !important;
  }

  /* ── Menu grid ────────────────────────────────────────────── */
  .menu-area    { margin-top: 12px !important; }
  .menu-grid    { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important; gap: 8px !important; }
  .menu-card-body { padding: 8px !important; }
  .menu-name    { font-size: 12px !important; }
  .menu-desc    { font-size: 10px !important; }
  .menu-img     { aspect-ratio: 1.3 !important; }
  .menu-price   { font-size: 13px !important; }

  /* ── Workspace (Reservations / Customers / Orders / Admin) ── */
  .workspace { flex: 1 1 0 !important; overflow: hidden !important; display: flex !important; flex-direction: column !important; min-height: 0 !important; }
  .workspace-inner {
    flex: 1 1 0 !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    padding: 12px !important;
    padding-bottom: 72px !important;
    min-height: 0 !important;
  }
  .section-head { padding: 0 0 10px 0 !important; flex-wrap: wrap !important; gap: 8px !important; }
  .section-title { font-size: 16px !important; }

  /* ── Reservation cards ────────────────────────────────────── */
  .resv-card { grid-template-columns: 60px 1fr !important; gap: 10px !important; padding: 10px !important; }
  .resv-actions { grid-column: 1 / -1 !important; justify-content: flex-end !important; padding-top: 6px !important; border-top: 1px solid var(--line) !important; margin-top: 4px !important; }

  /* ── Customer grid ────────────────────────────────────────── */
  .cust-grid { grid-template-columns: 1fr !important; gap: 8px !important; }

  /* ── History ──────────────────────────────────────────────── */
  .history-row { grid-template-columns: 1fr 1fr !important; gap: 6px !important; padding: 10px 12px !important; font-size: 12px !important; }
  .history-filters { flex-wrap: wrap !important; gap: 6px !important; }

  /* ── Summary / Analytics ──────────────────────────────────── */
  .summary-grid {
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
  }
  .stat-card {
    padding: 14px 14px !important;
    border-radius: 10px !important;
  }
  .stat-value {
    font-size: 22px !important;
  }
  .stat-label {
    font-size: 9px !important;
  }
  .stat-sub {
    font-size: 10px !important;
  }

  /* Analytics payment method bar */
  .method-split-bar {
    height: 10px !important;
    border-radius: 5px !important;
  }
  .method-legend {
    flex-wrap: wrap !important;
    gap: 10px !important;
    font-size: 11px !important;
  }

  /* Hourly sales chart */
  .workspace-inner .stat-card + div[style],
  .workspace-inner > div > div[style*="grid"] {
    grid-template-columns: 1fr !important;
  }

  /* Daily billing & top items side-by-side -> stacked on mobile */
  .workspace-inner > div > div > div[style*="grid-template-columns: repeat(auto-fit"] {
    grid-template-columns: 1fr !important;
    gap: 14px !important;
  }

  /* ── Admin ────────────────────────────────────────────────── */
  .workspace-inner > div > div:first-child {
    overflow-x: auto !important;
    flex-wrap: nowrap !important;
    -webkit-overflow-scrolling: touch;
  }
  table  { display: block !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch; }
  thead  { display: none !important; }
  tbody  { display: block !important; }
  tbody tr  { display: flex !important; flex-wrap: wrap !important; padding: 12px !important; border-bottom: 1px solid var(--line) !important; gap: 8px !important; align-items: center !important; }
  tbody td  { padding: 0 !important; border: none !important; }
  tbody td:first-child { flex: 1 1 100% !important; }
  tbody td:nth-child(4), tbody td:nth-child(5) { flex: 1 !important; }
  tbody td:last-child { flex: 1 1 100% !important; display: flex !important; justify-content: flex-end !important; }

  /* ══════════════════════════════════════════════════════════
     MODALS — Bottom sheet, fully scrollable with sticky footer
     ══════════════════════════════════════════════════════════ */
  /* ── Modal backdrop: anchor sheet to bottom ── */
  .modal-backdrop {
    padding: 0 !important;
    align-items: flex-end !important;
    place-items: unset !important;
    z-index: 1000 !important;
  }

  /* ── Modal: bottom sheet, sized to content up to 88dvh ── */
  .modal {
    width: 100% !important;
    max-width: 100% !important;
    border-radius: 20px 20px 0 0 !important;
    /* KEY: height:auto so short forms (Add Category) don't show blank space */
    height: auto !important;
    max-height: 88dvh !important;
    /* KEY: overflow:hidden so flex children control their own scroll */
    overflow: hidden !important;
    /* Flex column: head + scrollable-body + sticky-foot */
    display: flex !important;
    flex-direction: column !important;
    margin: 0 !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: none !important;
    animation: mobileSheetIn .28s cubic-bezier(.16,1,.3,1) !important;
  }

  @keyframes mobileSheetIn {
    from { transform: translateY(100%); opacity: 0.8; }
    to   { transform: translateY(0);    opacity: 1;   }
  }

  /* ── Modal head: fixed height, never shrinks ── */
  .modal-head {
    padding: 16px 18px 14px !important;
    flex: 0 0 auto !important;
    background: var(--bg-1) !important;
    z-index: 2 !important;
    border-bottom: 1px solid var(--line) !important;
    border-top: 3px solid transparent !important;
    background-clip: padding-box !important;
  }
  .modal-head::before {
    content: '' !important;
    display: block !important;
    width: 36px !important;
    height: 4px !important;
    background: var(--line-2, #3a3f48) !important;
    border-radius: 2px !important;
    margin: 0 auto 12px auto !important;
  }

  .modal-title { font-size: 17px !important; }
  .modal-sub   { font-size: 12px !important; }

  /* ── Modal body: THE KEY FIX ──
     - flex: 1 1 0  → fills available space between head & foot
     - min-height: 0 → allows shrinking below content size (required for flex scroll)
     - overflow-y: auto → scroll when content is taller than allocated space
     Short forms: body content is small, modal shrinks to fit (height:auto on .modal)
     Long forms: body fills up to 88dvh minus head+foot (~130px), then scrolls
  ── */
  .modal-body {
    flex: 1 1 0 !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    overscroll-behavior: contain !important;
    padding: 16px 18px !important;
  }

  /* ── Modal foot: sticky at bottom, never grows ── */
  .modal-foot {
    flex: 0 0 auto !important;
    display: flex !important;
    gap: 10px !important;
    padding: 12px 18px !important;
    padding-bottom: max(18px, env(safe-area-inset-bottom)) !important;
    border-top: 1px solid var(--line) !important;
    background: var(--bg-1) !important;
    z-index: 2 !important;
    justify-content: stretch !important;
  }
  .modal-foot .btn {
    flex: 1 !important;
    padding: 13px !important;
    font-size: 14px !important;
    justify-content: center !important;
  }

  /* Form fields: single column, large touch targets, no iOS zoom */
  .settings-grid {
    grid-template-columns: 1fr !important;
    gap: 14px !important;
  }
  .setting-field { grid-column: auto !important; }
  .setting-field.full { grid-column: 1 / -1 !important; }
  .setting-field input,
  .setting-field select,
  .setting-field textarea {
    font-size: 16px !important;   /* prevents iOS auto-zoom */
    padding: 13px 12px !important;
    width: 100% !important;
  }
  .setting-field label { font-size: 11px !important; }

  /* ── Checkout modal pay methods ───────────────────────────── */
  .pay-methods { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
  .pay-method  { padding: 12px 8px !important; font-size: 12px !important; }
  .quick-cash  { grid-template-columns: repeat(2, 1fr) !important; }

  /* ── Context menu ─────────────────────────────────────────── */
  .ctx-menu {
    position: fixed !important;
    bottom: 72px !important;
    left: 12px !important; right: 12px !important;
    top: auto !important; width: auto !important;
    border-radius: 12px !important;
    z-index: 500 !important;
  }
  .ctx-item { padding: 12px 16px !important; font-size: 14px !important; }

  /* ── Notification panel ───────────────────────────────────── */
  .notif-panel {
    position: fixed !important;
    top: auto !important; bottom: 72px !important;
    left: 8px !important; right: 8px !important;
    width: auto !important; max-height: 60vh !important;
    border-radius: 14px !important;
    z-index: 400 !important;
  }

  /* ── Toast: above bottom nav ──────────────────────────────── */
  .toast {
    bottom: 76px !important;
    max-width: calc(100vw - 32px) !important;
    font-size: 12px !important;
  }

  /* ── Bottom nav: only show when logged in ─────────────────── */
  body:has(.main-col) .mobile-bottom-nav { display: flex !important; }
  body:has(.main-col) .mobile-table-back-btn { display: flex !important; }

  /* ── Thin scrollbars ──────────────────────────────────────── */
  ::-webkit-scrollbar { width: 2px !important; height: 2px !important; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--line); border-radius: 2px; }
}

/* ════════════════════════════════════════════════════════════
   BOTTOM NAV — base styles (hidden on desktop, shown on mobile)
   ════════════════════════════════════════════════════════════ */
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 300;
  background: var(--bg-2, #1a1d22);
  border-top: 1px solid var(--line, #2a2e35);
  height: 64px;
  padding: 0 8px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.mobile-bottom-nav::-webkit-scrollbar {
  display: none;
}
.mobile-bottom-nav button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  flex: 0 0 72px;
  height: 52px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 4px;
  border-radius: 10px;
  color: var(--text-dim, #6b7280);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  position: relative;
  transition: color 0.15s, background 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.mobile-bottom-nav button.active {
  color: var(--amber, #f59e0b);
  background: var(--amber-soft, rgba(245,158,11,0.1));
}
.mobile-bottom-nav button svg { width: 22px; height: 22px; }
.mobile-bottom-nav .pulse {
  position: absolute; top: 8px; right: calc(50% - 14px);
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--amber, #f59e0b);
  animation: pulse-anim 1.4s infinite;
}
@keyframes pulse-anim {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(1.4); }
}

/* Mobile back button */
.mobile-table-back-btn {
  display: none;
  align-items: center; gap: 6px;
  padding: 6px 12px; border-radius: 8px;
  font-size: 12px; font-weight: 600;
  color: var(--text-dim); background: var(--bg-2);
  border: 1px solid var(--line); cursor: pointer;
  transition: all .15s;
  position: absolute; top: 12px; right: 12px; z-index: 5;
}
.mobile-table-back-btn:hover { color: var(--text); background: var(--bg-3); }
`;

  const style = document.createElement('style');
  style.id = 'mobile-responsive-fix';
  // Remove any previous injection
  const prev = document.getElementById('mobile-responsive-fix');
  if (prev) prev.remove();
  style.textContent = css;
  document.head.appendChild(style);

  // ── Bottom navigation ─────────────────────────────────────────
  function injectBottomNav() {
    if (document.getElementById('mobile-bottom-nav')) return;

    const ALL_NAV = [
      { id: 'floor',        icon: 'grid',    label: 'Floor'   },
      { id: 'reservations', icon: 'clock',   label: 'Reserve' },
      { id: 'customers',    icon: 'users',   label: 'Guests'  },
      { id: 'history',      icon: 'history', label: 'Orders'  },
      { id: 'summary',      icon: 'chart',   label: 'Analytics' },
      { id: 'kitchen',      icon: 'chef',    label: 'Kitchen' },
      { id: 'staff',        icon: 'users',   label: 'Staff'   },
      { id: 'admin',        icon: 'chef',    label: 'Admin'   },
      { id: 'settings',     icon: 'settings', label: 'Settings' },
    ];
    // Filter by role perms
    const _auth = window._authUtils;
    const _session = (() => { try { const r = sessionStorage.getItem('vinay_pos_auth'); return r ? JSON.parse(r) : null; } catch { return null; } })();
    const _perms = (_auth && _session) ? _auth.ROLE_PERMS?.[_session.role] : null;
    const NAV = _perms
      ? ALL_NAV.filter(item => _perms[item.id] !== false)
      : ALL_NAV;

    const ICONS = {
      grid:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
      clock:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      users:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 1 .5 4M3 17V11h6"/></svg>',
      chart:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
      chef:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>',
      settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    };

    const nav = document.createElement('div');
    nav.id = 'mobile-bottom-nav';
    nav.className = 'mobile-bottom-nav no-print';

    NAV.forEach(item => {
      const btn = document.createElement('button');
      btn.dataset.view = item.id;
      btn.innerHTML = (ICONS[item.icon] || '') + `<span>${item.label}</span>`;
      btn.addEventListener('click', () => {
        const labelMap = {
          floor: "Floor",
          reservations: "Reservations",
          customers: "Customers",
          history: "Orders",
          summary: "Analytics",
          kitchen: "Kitchen",
          staff: "Staff",
          admin: "Admin",
          settings: "Settings"
        };
        const targetLabel = labelMap[item.id];
        const sidebarBtn = Array.from(document.querySelectorAll('.sidebar-nav .sidebar-btn')).find(sBtn => {
          const labelEl = sBtn.querySelector('.sidebar-label');
          return (labelEl && labelEl.textContent.trim() === targetLabel) || sBtn.title === targetLabel;
        });
        if (sidebarBtn) sidebarBtn.click();
        updateActive(item.id);
        
        // Scroll button into center view smoothly
        try {
          btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } catch(e) {}
      });
      nav.appendChild(btn);
    });

    document.body.appendChild(nav);

    function updateActive(viewId) {
      nav.querySelectorAll('button').forEach(b => {
        b.classList.toggle('active', b.dataset.view === viewId);
      });
    }

    // Sync with sidebar active state
    const observer = new MutationObserver(() => {
      const activeSidebar = document.querySelector('.sidebar-btn.active');
      if (activeSidebar) {
        const labelEl = activeSidebar.querySelector('.sidebar-label');
        const activeLabel = labelEl ? labelEl.textContent.trim() : activeSidebar.title;
        
        const reverseLabelMap = {
          "Floor": "floor",
          "Reservations": "reservations",
          "Customers": "customers",
          "Orders": "history",
          "Analytics": "summary",
          "Kitchen": "kitchen",
          "Staff": "staff",
          "Admin": "admin",
          "Settings": "settings"
        };
        const currentView = reverseLabelMap[activeLabel];
        if (currentView) {
          updateActive(currentView);
          try {
            const activeBtn = nav.querySelector(`button[data-view="${currentView}"]`);
            if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          } catch(e) {}
        }
      }
    });
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });

    updateActive('floor');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(injectBottomNav, 600));
  } else {
    setTimeout(injectBottomNav, 600);
  }
})();
