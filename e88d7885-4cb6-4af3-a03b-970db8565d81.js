// Order panel

const OrderPanel = ({
  selectedTable, onUpdateTable, settings, onOpenCheckout, onOpenKOT, onSaveDraft, staff,
}) => {
  if (!selectedTable) {
    return (
      <div className="order-panel">
        <div className="order-empty" style={{margin:'auto', padding:'60px 24px'}}>
          <div className="order-empty-icon">◍</div>
          <div style={{fontSize:15, fontWeight:600, color:'var(--text)', marginBottom:6}}>No table selected</div>
          <div>Pick a table from the floor plan to start or edit an order.</div>
        </div>
      </div>
    );
  }

  const table = selectedTable;
  const split = table.splits[table.activeSplit] || table.splits[0];
  const totals = computeSplitTotals(split, settings);
  const currency = settings.currency;

  const updateSplit = (patch) => {
    const splits = [...table.splits];
    splits[table.activeSplit] = { ...split, ...patch };
    onUpdateTable({ ...table, splits });
  };

  const updateItem = (idx, patch) => {
    const items = [...split.items];
    items[idx] = { ...items[idx], ...patch };
    updateSplit({ items });
  };

  const removeItem = (idx) => {
    const items = split.items.filter((_, i) => i !== idx);
    updateSplit({ items });
  };

  const addSplit = () => {
    const splits = [...table.splits, createSplit(`Guest ${table.splits.length + 1}`)];
    onUpdateTable({ ...table, splits, activeSplit: splits.length - 1 });
  };

  const removeSplit = (idx) => {
    if (table.splits.length <= 1) return;
    const splits = table.splits.filter((_, i) => i !== idx);
    const activeSplit = Math.min(table.activeSplit, splits.length - 1);
    onUpdateTable({ ...table, splits, activeSplit });
  };

  const setActiveSplit = (idx) => onUpdateTable({ ...table, activeSplit: idx });

  const hasItems = split.items.length > 0;

  const waitersList = staff
    ? staff.filter(s => s.role === "Waitstaff" || s.role === "Waiter").map(s => s.name)
    : (window.WAITERS || []);

  const itemsEndRef = React.useRef(null);
  React.useEffect(() => {
    if (itemsEndRef.current) {
      itemsEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [split.items.length]);

  return (
    <div className="order-panel">
      <div className="order-head">
        <div className="order-head-row">
          <div>
            <div className="order-table-label">Table</div>
            <div className="order-table-num">T{table.num} <span style={{fontSize:12, color:'var(--text-dim)', fontWeight:500}}>· {table.capacity} seats</span></div>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="order-table-label">Items</div>
            <div style={{fontSize:18, fontWeight:700, fontFamily:'JetBrains Mono, monospace'}}>
              {split.items.reduce((s, i) => s + i.qty, 0)}
            </div>
          </div>
        </div>
        <div className="order-waiter-row">
          <Icon name="user" size={13} />
          <input
            className="order-waiter-input"
            value={table.waiter}
            onChange={(e) => onUpdateTable({ ...table, waiter: e.target.value })}
            placeholder="Waiter name"
            list="waiter-list"
          />
          <datalist id="waiter-list">
            {waitersList.map(w => <option key={w} value={w} />)}
          </datalist>
        </div>
        <div className="split-tabs">
          {table.splits.map((s, idx) => (
            <div key={s.id} className={`split-tab ${idx === table.activeSplit ? "active" : ""}`} onClick={() => setActiveSplit(idx)}>
              <span>{s.label}</span>
              {table.splits.length > 1 && (
                <span className="x" onClick={(e) => { e.stopPropagation(); removeSplit(idx); }}>×</span>
              )}
            </div>
          ))}
          <button className="split-add" onClick={addSplit}>
            <Icon name="split" size={10} style={{marginRight:4}}/> Split bill
          </button>
        </div>
        {split.courseStage === "ready" && (
          <div className="order-ready-banner" style={{
            margin: '10px 16px 4px 16px',
            padding: '10px 14px',
            background: 'rgba(107, 191, 123, 0.12)',
            border: '1px solid var(--green)',
            borderRadius: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 0 10px rgba(107, 191, 123, 0.15)'
          }}>
            <span style={{ color: 'var(--green)', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              🍽️ Order is Ready!
            </span>
            <button 
              onClick={() => {
                const splits = [...table.splits];
                splits[table.activeSplit] = { ...split, courseStage: "served" };
                onUpdateTable({ ...table, splits });
              }}
              style={{
                background: 'var(--green)',
                color: '#1a0f00',
                border: 'none',
                padding: '5px 10px',
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Mark Served
            </button>
          </div>
        )}
      </div>

      <div className="order-items">
        {!hasItems ? (
          <div className="order-empty">
            <div className="order-empty-icon">🍽</div>
            <div>No items yet. Tap menu items to add.</div>
          </div>
        ) : (
          split.items.map((item, idx) => (
            <div key={idx} className="order-item">
              <div className="order-item-top">
                <div className="order-item-name">{item.name}</div>
                <div className="order-item-price">{currency}{(item.price * item.qty).toFixed(2)}</div>
              </div>
              <div className="order-item-row">
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => item.qty > 1 ? updateItem(idx, { qty: item.qty - 1 }) : removeItem(idx)}>−</button>
                  <div className="qty-val">{item.qty}</div>
                  <button className="qty-btn" onClick={() => updateItem(idx, { qty: item.qty + 1 })}>+</button>
                </div>
                <button className="remove-btn" onClick={() => removeItem(idx)}>
                  <Icon name="trash" size={11}/> Remove
                </button>
              </div>
              <input
                className="note-input"
                value={item.note || ""}
                onChange={(e) => updateItem(idx, { note: e.target.value })}
                placeholder="Add a note (e.g. no onions, well done)"
              />
            </div>
          ))
        )}
        <div ref={itemsEndRef} />
      </div>

      <div className="totals">
        <div className="total-row">
          <span>Subtotal</span>
          <span className="total-val">{currency}{totals.subtotal.toFixed(2)}</span>
        </div>
        <div className="total-row">
          <span style={{display:'flex', alignItems:'center', gap:4}}>
            Discount
            <div className="discount-toggle">
              <button className={split.discount.type === "flat" ? "active" : ""} onClick={() => updateSplit({ discount: { ...split.discount, type: "flat" } })}>{currency}</button>
              <button className={split.discount.type === "pct" ? "active" : ""} onClick={() => updateSplit({ discount: { ...split.discount, type: "pct" } })}>%</button>
            </div>
            <input
              className="small-input"
              type="number" min="0" step="0.01"
              value={split.discount.value || ""}
              onChange={(e) => updateSplit({ discount: { ...split.discount, value: parseFloat(e.target.value) || 0 } })}
            />
          </span>
          <span className="total-val" style={{color: totals.discountAmt > 0 ? 'var(--red)' : undefined}}>
            {totals.discountAmt > 0 ? "−" : ""}{currency}{totals.discountAmt.toFixed(2)}
          </span>
        </div>
        <div className="total-row">
          <span style={{display:'flex', alignItems:'center', gap:4}}>
            Tax
            <input
              className="tax-input"
              type="number" min="0" step="0.1"
              value={split.taxRate != null ? split.taxRate : settings.taxRate}
              onChange={(e) => updateSplit({ taxRate: parseFloat(e.target.value) || 0 })}
            />
            <span style={{fontSize:10}}>%</span>
          </span>
          <span className="total-val">{currency}{totals.tax.toFixed(2)}</span>
        </div>
        {settings.serviceChargeEnabled && (
          <div className="total-row">
            <span style={{display:'flex', alignItems:'center', gap:6}}>
              Service ({settings.serviceChargeRate}%)
              <div className={`toggle-switch ${split.includeService ? "on" : ""}`} onClick={() => updateSplit({ includeService: !split.includeService })} style={{cursor:'pointer'}}/>
            </span>
            <span className="total-val">{currency}{totals.service.toFixed(2)}</span>
          </div>
        )}
        {settings.tipEnabled && (
          <div className="total-row">
            <span style={{display:'flex', alignItems:'center', gap:4}}>
              Tip
              <input
                className="small-input"
                type="number" min="0" step="0.5"
                value={split.tip || ""}
                onChange={(e) => updateSplit({ tip: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </span>
            <span className="total-val">{currency}{totals.tip.toFixed(2)}</span>
          </div>
        )}
        <div className="total-row grand">
          <span>Grand Total</span>
          <span className="val">{currency}{totals.grand.toFixed(2)}</span>
        </div>
      </div>

      <div className="order-actions">
        <button className="btn btn-primary" disabled={!hasItems} onClick={onOpenCheckout}>
          <Icon name="dollar" size={14}/> Checkout · {currency}{totals.grand.toFixed(2)}
        </button>
        <button className="btn btn-secondary" disabled={!hasItems} onClick={onOpenKOT}>
          <Icon name="chef" size={14}/> Send KOT
        </button>
        <button className="btn btn-secondary" disabled={!hasItems} onClick={onSaveDraft}>
          <Icon name="save" size={14}/> Save Draft
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { OrderPanel });
