// ─── qr-orders.js ─────────────────────────────────────────────────────────
// Polls localStorage for orders placed by customers via QR scan.
// Surfaces a notification banner + auto-adds items to the right table.
// Drop this file next to index.html and add:
//   <script type="text/babel" src="qr-orders.js"></script>
// ──────────────────────────────────────────────────────────────────────────

const QR_ORDERS_KEY = "vinay_qr_orders";
const QR_SEEN_KEY   = "vinay_qr_seen";

// ── QR Order Notification Banner ──────────────────────────────────────────
function QROrderBanner({ order, onAccept, onDismiss, currency }) {
  const total = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const preview = order.items.slice(0, 2).map(i => `${i.qty}× ${i.name}`).join(", ");
  const more    = order.items.length > 2 ? ` +${order.items.length - 2} more` : "";
  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 9999,
      background: "var(--bg-2)", border: "2px solid var(--amber)",
      borderRadius: 14, padding: "14px 16px", width: 320,
      boxShadow: "0 8px 32px rgba(0,0,0,.5)",
      animation: "modalIn .25s cubic-bezier(.16,1,.3,1)",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--amber-bright)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
            🔔 QR Order — Table {order.tableNum}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
            {preview}{more}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
            {currency}{total.toFixed(2)} · #{order.id}
          </div>
          {order.note && (
            <div style={{ fontSize: 11, color: "var(--amber)", marginTop: 4, fontStyle: "italic" }}>
              Note: {order.note}
            </div>
          )}
        </div>
        <button onClick={onDismiss} style={{
          background: "var(--bg-3)", border: "1px solid var(--line)",
          borderRadius: 6, color: "var(--text-dim)", padding: "2px 6px",
          cursor: "pointer", fontSize: 12, marginLeft: 8, flexShrink: 0,
        }}>✕</button>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onAccept} style={{
          flex: 1, background: "var(--amber)", color: "#000",
          border: "none", borderRadius: 8, padding: "9px 14px",
          fontWeight: 700, fontSize: 13, cursor: "pointer",
        }}>
          ✅ Add to Table {order.tableNum}
        </button>
        <button onClick={onDismiss} style={{
          background: "var(--bg-3)", border: "1px solid var(--line)",
          borderRadius: 8, padding: "9px 12px", color: "var(--text-dim)",
          fontSize: 12, cursor: "pointer",
        }}>
          Ignore
        </button>
      </div>
    </div>
  );
}

// ── QR Order Watcher Hook ─────────────────────────────────────────────────
function useQROrders({ tables, setTables, showToast, currency, setModal }) {
  const [pendingQROrder, setPendingQROrder] = React.useState(null);

  React.useEffect(() => {
    const seen = () => {
      try { return new Set(JSON.parse(localStorage.getItem(QR_SEEN_KEY) || "[]")); }
      catch { return new Set(); }
    };
    const markSeen = (id) => {
      try {
        const s = seen(); s.add(id);
        localStorage.setItem(QR_SEEN_KEY, JSON.stringify([...s].slice(-200)));
      } catch {}
    };

    const poll = () => {
      if (pendingQROrder) return; // already showing one
      try {
        const raw = localStorage.getItem(QR_ORDERS_KEY);
        if (!raw) return;
        const orders = JSON.parse(raw);
        const s = seen();
        const next = orders.find(o => !s.has(o.id) && o.status === "pending");
        if (next) {
          markSeen(next.id);
          setPendingQROrder(next);
        }
      } catch {}
    };

    const interval = setInterval(poll, 1500);
    return () => clearInterval(interval);
  }, [pendingQROrder]);

  const acceptOrder = () => {
    if (!pendingQROrder) return;
    const o = pendingQROrder;
    const targetTable = tables.find(t => t.num === parseInt(o.tableNum));
    if (!targetTable) {
      showToast(`Table ${o.tableNum} not found — cannot auto-add`);
      setPendingQROrder(null);
      return;
    }

    // Merge items into the table's active split
    const split = targetTable.splits[targetTable.activeSplit];
    let items = [...split.items];
    o.items.forEach(incoming => {
      const idx = items.findIndex(i => i.id === incoming.id && !i.note && !incoming.note);
      if (idx >= 0) {
        items[idx] = { ...items[idx], qty: items[idx].qty + incoming.qty };
      } else {
        items.push({
          id: incoming.id, name: incoming.name, price: incoming.price,
          qty: incoming.qty, note: incoming.note || "", veg: incoming.veg,
          img: incoming.img || "",
        });
      }
    });
    const updatedSplit = { ...split, items, kotSent: false };
    const updatedSplits = [...targetTable.splits];
    updatedSplits[targetTable.activeSplit] = updatedSplit;
    const updatedTable = {
      ...targetTable,
      splits: updatedSplits,
      status: "occupied",
      qrOrderNote: o.note || "",
    };
    setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));

    // Mark order as accepted in QR orders store
    try {
      const raw = localStorage.getItem(QR_ORDERS_KEY);
      const orders = JSON.parse(raw || "[]");
      const updated = orders.map(ord => ord.id === o.id ? { ...ord, status: "accepted" } : ord);
      localStorage.setItem(QR_ORDERS_KEY, JSON.stringify(updated));
    } catch {}

    showToast(`QR Order #${o.id} added to Table ${o.tableNum}`);
    // Auto-open KOT modal for this table
    setModal({ type: "kot", tableId: targetTable.id });
    setPendingQROrder(null);
  };

  const dismissOrder = () => setPendingQROrder(null);

  return { pendingQROrder, acceptOrder, dismissOrder };
}

// ── QR Code Generator Modal ───────────────────────────────────────────────
// Generates a QR code for a given table's ordering URL.
// Requires: https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js
function QRCodeModal({ tableNum, baseUrl, onClose }) {
  const canvasRef = React.useRef(null);
  const [qrLoaded, setQrLoaded] = React.useState(!!window.QRCode);
  const orderUrl = `${baseUrl}customer-order.html?table=${tableNum}`;

  React.useEffect(() => {
    if (qrLoaded) return;
    const interval = setInterval(() => {
      if (window.QRCode) {
        setQrLoaded(true);
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [qrLoaded]);

  React.useEffect(() => {
    if (!qrLoaded || !window.QRCode) return;
    if (!canvasRef.current) return;
    window.QRCode.toCanvas(canvasRef.current, orderUrl, {
      width: 240,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }, (err) => { if (err) console.error(err); });
  }, [tableNum, qrLoaded]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `table-${tableNum}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(orderUrl).then(() => {}).catch(() => {});
  };

  return (
    <Portal>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" style={{ width: 340 }} onClick={e => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <div className="modal-title">QR Code — Table {tableNum}</div>
              <div className="modal-sub">Customer scans to order directly</div>
            </div>
            <button className="modal-close" onClick={onClose}><Icon name="x"/></button>
          </div>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{
              background: "#fff", padding: 16, borderRadius: 12,
              border: "1px solid var(--line)",
              display: "inline-block",
            }}>
              {qrLoaded
                ? <canvas ref={canvasRef}/>
                : <div style={{ width: 240, height: 240, background: "var(--bg-3)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: 12 }}>
                    QRCode library loading…
                  </div>
              }
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5 }}>
              Print & place on the table.<br/>
              Customers scan → browse menu → place order → staff gets notified.
            </div>
            <div style={{
              background: "var(--bg-3)", border: "1px solid var(--line)", borderRadius: 8,
              padding: "8px 12px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
              color: "var(--text-dim)", wordBreak: "break-all", textAlign: "center",
            }}>
              {orderUrl}
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={copyLink}>📋 Copy Link</button>
            <button className="btn btn-primary" onClick={download}>⬇ Download PNG</button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

// ── Export ─────────────────────────────────────────────────────────────────
Object.assign(window, { QROrderBanner, useQROrders, QRCodeModal });
