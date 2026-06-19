// Floor plan view

const TableCard = ({ table, selected, onClick, onContextMenu, totals, currency, onShowQR }) => {
  const isTakeaway = table.id === "takeaway";
  
  const currentSplit = table.splits?.[table.activeSplit];
  const isReady = currentSplit?.courseStage === "ready";
  const isPreparing = currentSplit?.courseStage === "preparing" || currentSplit?.courseStage === "cooking";
  
  let statusText = { available: "Available", occupied: "Active", reserved: "Reserved" }[table.status];
  if (table.status === "occupied") {
    if (isReady) statusText = "🍽️ Ready";
    else if (isPreparing) statusText = "🔥 Cooking";
  }

  const cardStyle = {
    ...(isTakeaway ? { borderStyle: "dashed", borderColor: "var(--amber-bright)" } : {}),
    ...(isReady ? {
      borderColor: "var(--green)",
      borderWidth: "2px",
      boxShadow: "0 0 15px rgba(107, 191, 123, 0.4)",
      animation: "pulseGlow 2s infinite alternate"
    } : {})
  };

  React.useEffect(() => {
    let style = document.getElementById("kds-ready-animation");
    if (!style) {
      style = document.createElement("style");
      style.id = "kds-ready-animation";
      style.innerHTML = `
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 8px rgba(107, 191, 123, 0.2); }
          100% { box-shadow: 0 0 18px rgba(107, 191, 123, 0.6); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div
      className={`table-card ${table.status} ${selected ? "selected" : ""} ${isReady ? "ready" : ""}`}
      style={cardStyle}
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
        <div 
          className="table-status"
          style={isReady ? { background: "rgba(107, 191, 123, 0.18)", color: "var(--green)" } : (isPreparing ? { background: "rgba(242, 164, 58, 0.15)", color: "var(--amber-bright)" } : {})}
        >
          {statusText}
        </div>
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
  const currentSplit = table.splits?.[table.activeSplit];
  const isReady = currentSplit?.courseStage === "ready";

  return (
    <div ref={ref} className="ctx-menu" style={{ top: ctx.y, left: ctx.x }}>
      {isReady && (
        <>
          <div className="ctx-item" onClick={() => {
            const updatedSplits = [...table.splits];
            updatedSplits[table.activeSplit] = { ...currentSplit, courseStage: "served" };
            onSetStatus({ ...table, splits: updatedSplits }, "occupied");
            onClose();
          }} style={{ color: 'var(--green)', fontWeight: 600 }}>
            🍽️ Mark Order Served
          </div>
          <div className="divider" style={{margin:'4px 6px'}} />
        </>
      )}
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
