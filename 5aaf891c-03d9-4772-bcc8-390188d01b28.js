// Modals: KOT, Checkout, Receipt, Waiter assign

const KOT_ADDONS = [
  { id:"xs",  label:"Extra Spicy",   icon:"🌶️" },
  { id:"ms",  label:"Medium Spicy",  icon:"🌶" },
  { id:"ns",  label:"No Spice",      icon:"❄️" },
  { id:"lg",  label:"Less Gravy",    icon:"💧" },
  { id:"eg",  label:"Extra Gravy",   icon:"🫙" },
  { id:"no",  label:"No Onion",      icon:"🚫" },
  { id:"ng",  label:"No Garlic",     icon:"🧄" },
  { id:"xc",  label:"Extra Crispy",  icon:"🔥" },
  { id:"lc",  label:"Less Oil",      icon:"🫒" },
  { id:"vs",  label:"No Salt",       icon:"🧂" },
];

const KOTModal = ({ table, split, onClose, onSendKOT }) => {
  const now = new Date();
  // itemAddons: { [itemIdx]: Set of addon ids }
  const [itemAddons, setItemAddons] = React.useState(() => {
    const init = {};
    split.items.forEach((_, i) => { init[i] = new Set(); });
    return init;
  });
  const kotRef = React.useRef(null);

  const toggleAddon = (itemIdx, addonId) => {
    setItemAddons(prev => {
      const next = { ...prev };
      const s = new Set(next[itemIdx]);
      if (s.has(addonId)) s.delete(addonId); else s.add(addonId);
      next[itemIdx] = s;
      return next;
    });
  };

  const printKot = () => {
    if (kotRef.current) kotRef.current.classList.add("print-target");
    window.print();
    setTimeout(() => { if (kotRef.current) kotRef.current.classList.remove("print-target"); }, 500);
    
    if (onSendKOT) {
      const decrements = {};
      const updatedItems = split.items.map(item => {
        const unsent = item.qty - (item.sentQty || 0);
        if (unsent > 0) {
          decrements[item.id] = (decrements[item.id] || 0) + unsent;
        }
        return { ...item, sentQty: item.qty };
      });
      onSendKOT(updatedItems, decrements);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{width: 460}} onClick={(e)=>e.stopPropagation()}>
        <div className="modal-head no-print">
          <div>
            <div className="modal-title">Kitchen Order Ticket</div>
            <div className="modal-sub">Add addons per item, then print to kitchen</div>
          </div>
          <button className="modal-close" onClick={onClose}><Icon name="x"/></button>
        </div>
        <div className="modal-body" style={{background:'#2a2f36', display:'grid', placeItems:'center', gap:12, padding:'16px'}}>
          {/* Addon editor — screen only */}
          <div className="no-print" style={{width:'100%', background:'#1e2329', borderRadius:8, padding:12}}>
            <div style={{fontSize:11, color:'var(--text-dim)', marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Item Addons / Special Instructions</div>
            {split.items.map((item, idx) => (
              <div key={idx} style={{marginBottom:10, paddingBottom:10, borderBottom:'1px solid #2e3440'}}>
                <div style={{fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:6}}>
                  {item.qty}× {item.name}
                </div>
                <div style={{display:'flex', flexWrap:'wrap', gap:4}}>
                  {KOT_ADDONS.map(a => {
                    const active = itemAddons[idx]?.has(a.id);
                    return (
                      <button key={a.id} onClick={() => toggleAddon(idx, a.id)}
                        style={{
                          padding:'3px 8px', borderRadius:20, fontSize:11, cursor:'pointer', border:'1px solid',
                          borderColor: active ? 'var(--accent)' : '#3a4050',
                          background: active ? 'rgba(249,168,37,0.15)' : 'transparent',
                          color: active ? 'var(--accent)' : 'var(--text-dim)',
                          transition:'all .15s'
                        }}>
                        {a.icon} {a.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {/* KOT print preview */}
          <div ref={kotRef} className="kot">
            <div className="kot-head">
              <div className="kot-title">KOT</div>
              <div style={{fontSize:11, marginTop:2}}>KITCHEN ORDER TICKET</div>
            </div>
            <div className="kot-meta"><span>TABLE</span><span style={{fontWeight:700}}>T{table.num}</span></div>
            <div className="kot-meta"><span>WAITER</span><span>{table.waiter || "—"}</span></div>
            <div className="kot-meta"><span>TIME</span><span>{formatTime(now)}</span></div>
            <div className="kot-meta"><span>DATE</span><span>{now.toLocaleDateString()}</span></div>
            <div className="kot-meta"><span>SPLIT</span><span>{split.label}</span></div>
            <div style={{borderTop:'2px dashed #000', margin:'8px 0'}}/>
            {split.items.map((item, idx) => {
              const addons = [...(itemAddons[idx] || [])].map(id => KOT_ADDONS.find(a=>a.id===id)?.label).filter(Boolean);
              return (
                <div key={idx} className="kot-item">
                  <div className="kot-item-row">
                    <span>{item.name}</span>
                    <span>× {item.qty}</span>
                  </div>
                  {addons.length > 0 && <div className="kot-note">🔧 {addons.join(", ")}</div>}
                  {item.note && <div className="kot-note">» {item.note}</div>}
                </div>
              );
            })}
            <div className="kot-foot">— END OF TICKET —</div>
          </div>
        </div>
        <div className="modal-foot no-print">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={printKot}>
            <Icon name="print" size={14}/> Print & Send to Kitchen
          </button>
        </div>
      </div>
    </div>
  );
};


const CheckoutModal = ({ table, split, totals, settings, onClose, onConfirm }) => {
  const [method, setMethod] = React.useState("cash");
  const [cashGiven, setCashGiven] = React.useState(Math.ceil(totals.grand));
  const [splits, setSplits] = React.useState([
    { method: "cash", amount: totals.grand / 2 },
    { method: "card", amount: totals.grand / 2 },
  ]);
  const [extraTip, setExtraTip] = React.useState(0);

  const finalTotal = totals.grand + extraTip;

  const change = cashGiven - finalTotal;
  const splitSum = splits.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
  const splitRemaining = finalTotal - splitSum;

  const canConfirm = method === "cash" ? cashGiven >= finalTotal
    : method === "split" ? Math.abs(splitRemaining) < 0.01
    : true;

  const confirm = () => {
    let record = { method, amount: finalTotal, extraTip };
    if (method === "cash") record.cashGiven = cashGiven;
    if (method === "split") record.splits = splits.filter(s => s.amount > 0);
    onConfirm(record);
  };

  const addSplitRow = () => setSplits([...splits, { method: "cash", amount: Math.max(0, splitRemaining) }]);
  const updSplit = (i, p) => { const n = [...splits]; n[i] = { ...n[i], ...p }; setSplits(n); };
  const delSplit = (i) => setSplits(splits.filter((_, idx) => idx !== i));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{width: 520}} onClick={(e)=>e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Checkout · Table {table.num}</div>
            <div className="modal-sub">{split.items.length} items · {split.label}</div>
          </div>
          <button className="modal-close" onClick={onClose}><Icon name="x"/></button>
        </div>
        <div className="modal-body">
          <div style={{padding:'14px 16px', background:'var(--bg-2)', borderRadius:10, marginBottom:18, display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
            <div style={{fontSize:12, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.06em'}}>Amount Due</div>
            <div style={{fontSize:28, fontWeight:700, color:'var(--amber-bright)', fontFamily:'JetBrains Mono, monospace'}}>
              {settings.currency}{finalTotal.toFixed(2)}
            </div>
          </div>

          <div className="pay-methods">
            {[
              { id: "cash", label: "Cash", icon: "cash" },
              { id: "card", label: "Card", icon: "card" },
              { id: "upi", label: "UPI", icon: "phone" },
              { id: "split", label: "Split", icon: "split" },
            ].map(m => (
              <button key={m.id} className={`pay-method ${method === m.id ? "active" : ""}`} onClick={() => setMethod(m.id)}>
                <Icon name={m.icon} size={20}/>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {settings.tipEnabled && (
            <div style={{marginBottom:16}}>
              <label style={{fontSize:11, color:'var(--text-dim)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Additional Tip</label>
              <div style={{display:'flex', gap:6, marginTop:6}}>
                {[0, totals.afterDiscount * 0.15, totals.afterDiscount * 0.18, totals.afterDiscount * 0.20].map((v, i) => (
                  <button key={i}
                    className="btn btn-secondary"
                    style={{flex:1, fontSize:12, padding:'8px', background: Math.abs(extraTip - v) < 0.01 ? 'var(--amber-soft)' : 'var(--bg-2)', borderColor: Math.abs(extraTip - v) < 0.01 ? 'var(--amber)' : 'var(--line)', color: Math.abs(extraTip - v) < 0.01 ? 'var(--amber-bright)' : 'var(--text)'}}
                    onClick={() => setExtraTip(parseFloat(v.toFixed(2)))}>
                    {i === 0 ? "No tip" : `${[15,18,20][i-1]}%`}
                    {i > 0 && <span style={{opacity:0.6, marginLeft:4}}>{settings.currency}{v.toFixed(2)}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {method === "cash" && (
            <div className="cash-pad">
              <div>
                <label style={{fontSize:11, color:'var(--text-dim)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Cash Received</label>
                <input className="cash-input" type="number" value={cashGiven} onChange={(e) => setCashGiven(parseFloat(e.target.value) || 0)} style={{marginTop:6}}/>
              </div>
              <div className="quick-cash">
                {[finalTotal, Math.ceil(finalTotal / 5) * 5, Math.ceil(finalTotal / 10) * 10, Math.ceil(finalTotal / 20) * 20].map((v, i) => (
                  <button key={i} onClick={() => setCashGiven(v)}>{settings.currency}{v.toFixed(0)}</button>
                ))}
              </div>
              <div className="change-box">
                <span className="change-label">{change >= 0 ? "Change Due" : "Short By"}</span>
                <span className={`change-val ${change < 0 ? "short" : ""}`}>
                  {settings.currency}{Math.abs(change).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {method === "card" && (
            <div style={{padding:'30px 20px', textAlign:'center', background:'var(--bg-2)', borderRadius:10}}>
              <Icon name="card" size={36} stroke={1.5}/>
              <div style={{marginTop:12, fontSize:14, fontWeight:600}}>Insert, tap, or swipe card</div>
              <div style={{marginTop:6, fontSize:12, color:'var(--text-dim)'}}>Waiting for terminal confirmation…</div>
            </div>
          )}

          {method === "upi" && (
            <div style={{padding:'30px 20px', textAlign:'center', background:'var(--bg-2)', borderRadius:10}}>
              <div style={{width:120, height:120, background:'#fff', borderRadius:8, margin:'0 auto', display:'grid', placeItems:'center', color:'#000', fontFamily:'monospace', fontSize:11}}>
                <div style={{background:`repeating-linear-gradient(45deg, #000 0 3px, transparent 3px 6px), repeating-linear-gradient(-45deg, #000 0 3px, transparent 3px 6px)`, width:100, height:100, borderRadius:4}}/>
              </div>
              <div style={{marginTop:12, fontSize:13, fontWeight:600}}>Scan QR to pay</div>
              <div style={{marginTop:4, fontSize:11, color:'var(--text-dim)'}}>ember@upi · {settings.currency}{finalTotal.toFixed(2)}</div>
            </div>
          )}

          {method === "split" && (
            <div>
              {splits.map((s, i) => (
                <div key={i} className="split-row">
                  <select value={s.method} onChange={(e) => updSplit(i, { method: e.target.value })}>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                  </select>
                  <input type="number" step="0.01" value={s.amount} onChange={(e) => updSplit(i, { amount: parseFloat(e.target.value) || 0 })}/>
                  <button className="btn-ghost" onClick={() => delSplit(i)} style={{padding:0}}><Icon name="x" size={14}/></button>
                </div>
              ))}
              <button className="btn btn-secondary" onClick={addSplitRow} style={{width:'100%', marginTop:6}}>
                <Icon name="plus" size={12}/> Add payment
              </button>
              <div className="change-box" style={{marginTop:12}}>
                <span className="change-label">{Math.abs(splitRemaining) < 0.01 ? "Balanced" : splitRemaining > 0 ? "Remaining" : "Over by"}</span>
                <span className={`change-val ${splitRemaining > 0.01 ? "short" : ""}`}>
                  {settings.currency}{Math.abs(splitRemaining).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!canConfirm} onClick={confirm}>
            <Icon name="check" size={14}/> Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
};

const ReceiptModal = ({ order, settings, onClose }) => {
  const receiptRef = React.useRef(null);
  const doPrint = () => {
    if (receiptRef.current) receiptRef.current.classList.add("print-target");
    window.print();
    setTimeout(() => { if (receiptRef.current) receiptRef.current.classList.remove("print-target"); }, 600);
  };
  const split = order.split;
  const totals = order.totals;
  const methodLabel = {
    cash: "Cash", card: "Card", upi: "UPI", split: "Split Payment",
  }[order.payment.method];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{width: 420}} onClick={(e)=>e.stopPropagation()}>
        <div className="modal-head no-print">
          <div>
            <div className="modal-title">Receipt</div>
            <div className="modal-sub">Order #{order.id.slice(-6).toUpperCase()}</div>
          </div>
          <button className="modal-close" onClick={onClose}><Icon name="x"/></button>
        </div>
        <div className="modal-body" style={{background:'#2a2f36', display:'grid', placeItems:'center'}}>
          <div ref={receiptRef} className="receipt">
            <div className="receipt-head">
              <div className="receipt-name">{settings.restaurantName}</div>
              {settings.receiptHeader && <div style={{fontSize:11, fontWeight:600, marginBottom:4}}>{settings.receiptHeader}</div>}
              <div className="receipt-addr">
                {settings.address.split("\n").map((l, i) => <div key={i}>{l}</div>)}
              </div>
              <div style={{fontSize:10, marginTop:4}}>{settings.taxId}</div>
            </div>
            <div className="receipt-meta"><span>ORDER #</span><span>{order.id.slice(-6).toUpperCase()}</span></div>
            <div className="receipt-meta"><span>TABLE</span><span>T{order.tableNum} · {order.splitLabel}</span></div>
            <div className="receipt-meta"><span>WAITER</span><span>{order.waiter || "—"}</span></div>
            <div className="receipt-meta"><span>CASHIER</span><span>{settings.cashierName}</span></div>
            <div className="receipt-meta"><span>DATE</span><span>{new Date(order.ts).toLocaleString()}</span></div>
            <div style={{borderTop:'2px dashed #000', margin:'8px 0 6px'}}/>
            <div className="receipt-items">
              {split.items.map((it, i) => (
                <div key={i}>
                  <div className="receipt-item">
                    <span>{it.name}</span>
                    <span>{settings.currency}{(it.price * it.qty).toFixed(2)}</span>
                  </div>
                  <div className="receipt-item-qty">  {it.qty} × {settings.currency}{it.price.toFixed(2)}{it.note ? ` · ${it.note}` : ""}</div>
                </div>
              ))}
            </div>
            <div className="receipt-total-row"><span>Subtotal</span><span>{settings.currency}{totals.subtotal.toFixed(2)}</span></div>
            {totals.discountAmt > 0 && <div className="receipt-total-row"><span>Discount</span><span>−{settings.currency}{totals.discountAmt.toFixed(2)}</span></div>}
            <div className="receipt-total-row"><span>Tax ({totals.taxRate}%)</span><span>{settings.currency}{totals.tax.toFixed(2)}</span></div>
            {totals.service > 0 && <div className="receipt-total-row"><span>Service ({settings.serviceChargeRate}%)</span><span>{settings.currency}{totals.service.toFixed(2)}</span></div>}
            {totals.tip > 0 && <div className="receipt-total-row"><span>Tip</span><span>{settings.currency}{totals.tip.toFixed(2)}</span></div>}
            {order.payment.extraTip > 0 && <div className="receipt-total-row"><span>Add'l Tip</span><span>{settings.currency}{order.payment.extraTip.toFixed(2)}</span></div>}
            <div className="receipt-total-row grand"><span>TOTAL</span><span>{settings.currency}{order.payment.amount.toFixed(2)}</span></div>
            <div style={{borderTop:'1px dashed #000', marginTop:8, paddingTop:6}}>
              <div className="receipt-total-row"><span>Paid by</span><span>{methodLabel}</span></div>
              {order.payment.method === "cash" && (
                <>
                  <div className="receipt-total-row"><span>Cash</span><span>{settings.currency}{order.payment.cashGiven.toFixed(2)}</span></div>
                  <div className="receipt-total-row"><span>Change</span><span>{settings.currency}{(order.payment.cashGiven - order.payment.amount).toFixed(2)}</span></div>
                </>
              )}
              {order.payment.method === "split" && order.payment.splits && order.payment.splits.map((s, i) => (
                <div key={i} className="receipt-total-row"><span>  {s.method.toUpperCase()}</span><span>{settings.currency}{s.amount.toFixed(2)}</span></div>
              ))}
            </div>
            <div className="receipt-foot">
              {settings.receiptFooter ? (
                <div>{settings.receiptFooter}</div>
              ) : (
                <>Thank you for dining with us!<br/>{settings.restaurantName}</>
              )}
              <div style={{fontSize:10, marginTop:4, opacity:0.8}}>· {new Date(order.ts).toLocaleTimeString()} ·</div>
            </div>
          </div>
        </div>
        <div className="modal-foot no-print">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={doPrint}>
            <Icon name="print" size={14}/> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

const WaiterModal = ({ table, staff, onClose, onAssign }) => {
  const [value, setValue] = React.useState(table.waiter || "");
  const waitersList = staff 
    ? staff.filter(s => s.role === "Waitstaff" || s.role === "Waiter").map(s => s.name)
    : (window.WAITERS || []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{width: 360}} onClick={(e)=>e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Assign Waiter</div>
            <div className="modal-sub">Table T{table.num}</div>
          </div>
          <button className="modal-close" onClick={onClose}><Icon name="x"/></button>
        </div>
        <div className="modal-body">
          <input
            className="order-waiter-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Waiter name"
            autoFocus
            style={{width:'100%', padding:'10px 12px', fontSize:14}}
          />
          <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:12}}>
            {waitersList.map(w => (
              <button key={w} className="filter-chip" onClick={() => setValue(w)}>{w}</button>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onAssign(value); onClose(); }}>Assign</button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { KOTModal, CheckoutModal, ReceiptModal, WaiterModal });
