// Floor plan view

const TableCard = ({ table, selected, onClick, onContextMenu, totals, currency, onShowQR }) => {
  const statusLabel = { available: "Available", occupied: "Active", reserved: "Reserved" }[table.status];
  const isTakeaway = table.id === "takeaway";
  return (
    <div
      className={`table-card ${table.status} ${selected ? "selected" : ""}`}
      style={isTakeaway ? { borderStyle: "dashed", borderColor: "var(--amber-bright)" } : {}}
      onClick={() => onClick(table)}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, table); }}
    >
      <div className="table-top">
        <div>
          <div className="table-num">{isTakeaway ? "🛍️ Takeaway" : `T${table.num}`}</div>
          {!isTakeaway && (
            <div className="table-cap">
              <Icon name="users" size={10} /> Seats {table.capacity}
            </div>
          )}
        </div>
        <div className="table-status">{isTakeaway ? (table.status === "occupied" ? "Active" : "New Order") : statusLabel}</div>
      </div>
      <div>
        {isTakeaway ? (
          <div className="table-meta" style={{color: 'var(--amber-bright)', fontWeight: 600}}>Self-Pickup</div>
        ) : table.waiter ? (
          <div className="table-waiter">{table.waiter}</div>
        ) : (
          <div className="table-meta">Unassigned</div>
        )}
        {totals != null && totals > 0 && (
          <div className="table-total">{currency}{totals.toFixed(2)}</div>
        )}
      </div>
      {table.splits.length > 1 && (
        <div className="table-splits">{table.splits.length} SPLITS</div>
      )}
      {!isTakeaway && (
        <button
          title="Show QR code"
          onClick={(e) => { e.stopPropagation(); onShowQR && onShowQR(table); }}
          style={{
            position: "absolute", top: 8, right: 8,
            background: "rgba(242,164,58,.15)", border: "1px solid rgba(242,164,58,.3)",
            borderRadius: 6, padding: "2px 5px", cursor: "pointer",
            fontSize: 13, lineHeight: 1, color: "var(--amber-bright)",
          }}
        >📲</button>
      )}
    </div>
  );
};

const FloorPlan = ({ tables, selectedId, onSelect, onContext, settings, getTableTotal, onShowQR }) => {
  return (
    <div>
      <div className="section-head">
        <div>
          <div className="section-title">Floor Plan</div>
          <div className="section-sub">Tap a table to load its order · Right-click to change status</div>
        </div>
        <div className="legend">
          <span><span className="legend-dot" style={{background:'var(--green)'}}/>Available</span>
          <span><span className="legend-dot" style={{background:'var(--amber)'}}/>Occupied</span>
          <span><span className="legend-dot" style={{background:'var(--blue)'}}/>Reserved</span>
        </div>
      </div>
      <div className="floor-grid">
        {tables.map(t => (
          <TableCard
            key={t.id}
            table={t}
            selected={selectedId === t.id}
            onClick={onSelect}
            onContextMenu={onContext}
            totals={getTableTotal(t)}
            currency={settings.currency}
            onShowQR={onShowQR}
          />
        ))}
      </div>
    </div>
  );
};

const TableContextMenu = ({ ctx, onClose, onSetStatus, onAssignWaiter }) => {
  const ref = React.useRef();
  React.useEffect(() => {
    const close = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
    document.addEventListener("click", close);
    document.addEventListener("contextmenu", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("contextmenu", close);
    };
  }, []);
  if (!ctx) return null;
  const table = ctx.table;
  return (
    <div ref={ref} className="ctx-menu" style={{ top: ctx.y, left: ctx.x }}>
      <div className="ctx-item" onClick={() => { onSetStatus(table, "available"); onClose(); }}>
        <span className="legend-dot" style={{background:'var(--green)'}}/>Mark Available
      </div>
      <div className="ctx-item" onClick={() => { onSetStatus(table, "reserved"); onClose(); }}>
        <span className="legend-dot" style={{background:'var(--blue)'}}/>Mark Reserved
      </div>
      <div className="ctx-item" onClick={() => { onSetStatus(table, "occupied"); onClose(); }}>
        <span className="legend-dot" style={{background:'var(--amber)'}}/>Mark Occupied
      </div>
      <div className="divider" style={{margin:'4px 6px'}} />
      <div className="ctx-item" onClick={() => { onAssignWaiter(table); onClose(); }}>
        <Icon name="user" size={12} /> Assign Waiter
      </div>
      <div className="divider" style={{margin:'4px 6px'}} />
      <div className="ctx-item" onClick={() => { if (ctx.onShowQR) ctx.onShowQR(table); onClose(); }}>
        📲 Show QR Code
      </div>
    </div>
  );
};

Object.assign(window, { FloorPlan, TableContextMenu });
