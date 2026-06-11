// History view, Summary view, Settings view

const HistoryView = ({ orders, settings, onReprint }) => {
  const [filter, setFilter] = React.useState("all");
  const filtered = filter === "all" ? orders : orders.filter(o => o.payment.method === filter);
  const methods = [
    { id: "all", label: "All" },
    { id: "cash", label: "Cash" },
    { id: "card", label: "Card" },
    { id: "upi", label: "UPI" },
    { id: "split", label: "Split" },
  ];
  return (
    <div>
      <div className="section-head">
        <div>
          <div className="section-title">Order History</div>
          <div className="section-sub">{orders.length} orders this session</div>
        </div>
      </div>
      <div className="history-filters">
        {methods.map(m => (
          <button key={m.id} className={`filter-chip ${filter === m.id ? "active" : ""}`} onClick={() => setFilter(m.id)}>
            {m.label}
            <span style={{opacity:0.6, marginLeft:6, fontFamily:'JetBrains Mono, monospace'}}>
              {m.id === "all" ? orders.length : orders.filter(o => o.payment.method === m.id).length}
            </span>
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{padding:'60px 20px', textAlign:'center', color:'var(--text-muted)', background:'var(--bg-1)', borderRadius:10, border:'1px dashed var(--line)'}}>
          <div style={{fontSize:32, marginBottom:8, opacity:0.4}}>📋</div>
          No orders yet. Completed orders will appear here.
        </div>
      ) : (
        <div className="history-list">
          {filtered.slice().reverse().map(o => (
            <div key={o.id} className="history-row">
              <div className="history-time">{formatTime(new Date(o.ts))}</div>
              <div>
                <div className="history-tbl">T{o.tableNum} · {o.splitLabel} <span style={{color:'var(--text-dim)', fontWeight:400, fontSize:12, marginLeft:6}}>{o.split.items.length} items · {o.waiter || "—"}</span></div>
                <div style={{fontSize:11, color:'var(--text-muted)', marginTop:2}}>#{o.id.slice(-6).toUpperCase()}</div>
              </div>
              <div>
                <span className={`history-method method-${o.payment.method}`}>{o.payment.method}</span>
              </div>
              <div className="history-total">{settings.currency}{o.payment.amount.toFixed(2)}</div>
              <button className="btn btn-secondary" style={{padding:'6px 10px', fontSize:11}} onClick={() => onReprint(o)}>
                <Icon name="print" size={11}/> Reprint
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SummaryView = ({ orders, settings }) => {
  const totalRevenue = orders.reduce((s, o) => s + o.payment.amount, 0);
  const count = orders.length;
  const avg = count > 0 ? totalRevenue / count : 0;

  const byMethod = {};
  orders.forEach(o => {
    if (o.payment.method === "split") {
      (o.payment.splits || []).forEach(s => {
        byMethod[s.method] = (byMethod[s.method] || 0) + s.amount;
      });
    } else {
      byMethod[o.payment.method] = (byMethod[o.payment.method] || 0) + o.payment.amount;
    }
  });
  const methodColors = { cash: 'var(--green)', card: 'var(--blue)', upi: 'var(--violet)' };
  const total = Object.values(byMethod).reduce((s, v) => s + v, 0);

  return (
    <div>
      <div className="section-head">
        <div>
          <div className="section-title">Daily Summary</div>
          <div className="section-sub">{formatDate(new Date())} · {getShift(new Date())} shift</div>
        </div>
      </div>
      <div className="summary-grid">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value stat-accent">{settings.currency}{totalRevenue.toFixed(2)}</div>
          <div className="stat-sub">Gross sales including tax</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Orders</div>
          <div className="stat-value">{count}</div>
          <div className="stat-sub">Completed this session</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Order Value</div>
          <div className="stat-value">{settings.currency}{avg.toFixed(2)}</div>
          <div className="stat-sub">Per transaction</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Items Sold</div>
          <div className="stat-value">{orders.reduce((s, o) => s + o.split.items.reduce((a, i) => a + i.qty, 0), 0)}</div>
          <div className="stat-sub">Across all orders</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Revenue by Payment Method</div>
        {total > 0 ? (
          <>
            <div className="method-split-bar">
              {Object.entries(byMethod).map(([m, v]) => (
                <div key={m} style={{ width: `${(v / total) * 100}%`, background: methodColors[m] || 'var(--amber)' }} title={`${m}: ${settings.currency}${v.toFixed(2)}`}/>
              ))}
            </div>
            <div className="method-legend">
              {Object.entries(byMethod).map(([m, v]) => (
                <span key={m} style={{display:'flex', alignItems:'center', gap:6}}>
                  <span className="legend-dot" style={{background: methodColors[m] || 'var(--amber)'}}/>
                  <span style={{textTransform:'uppercase', fontSize:11, fontWeight:600}}>{m}</span>
                  <span style={{fontFamily:'JetBrains Mono, monospace', color:'var(--text)'}}>{settings.currency}{v.toFixed(2)}</span>
                  <span style={{color:'var(--text-muted)'}}>({((v / total) * 100).toFixed(0)}%)</span>
                </span>
              ))}
            </div>
          </>
        ) : (
          <div style={{padding:'24px 0', color:'var(--text-muted)', fontSize:13}}>No completed orders yet.</div>
        )}
      </div>

      <div style={{marginTop:24}}>
        <div className="section-title" style={{fontSize:15, marginBottom:10}}>Top Items</div>
        <TopItemsTable orders={orders} settings={settings}/>
      </div>
    </div>
  );
};

const TopItemsTable = ({ orders, settings }) => {
  const tally = {};
  orders.forEach(o => o.split.items.forEach(it => {
    if (!tally[it.name]) tally[it.name] = { qty: 0, rev: 0 };
    tally[it.name].qty += it.qty;
    tally[it.name].rev += it.qty * it.price;
  }));
  const rows = Object.entries(tally).sort((a,b) => b[1].rev - a[1].rev).slice(0, 8);
  if (rows.length === 0) return <div style={{color:'var(--text-muted)', fontSize:13, padding:12, background:'var(--bg-1)', borderRadius:8, border:'1px dashed var(--line)'}}>No data yet.</div>;
  return (
    <div style={{background:'var(--bg-1)', border:'1px solid var(--line)', borderRadius:10, overflow:'hidden'}}>
      {rows.map(([name, stat], i) => (
        <div key={name} style={{display:'grid', gridTemplateColumns:'30px 1fr 60px 90px', gap:12, padding:'10px 16px', borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 'none', alignItems:'center', fontSize:13}}>
          <div style={{color:'var(--text-muted)', fontFamily:'JetBrains Mono, monospace', fontSize:11}}>#{i+1}</div>
          <div>{name}</div>
          <div style={{color:'var(--text-dim)', fontFamily:'JetBrains Mono, monospace', fontSize:12}}>× {stat.qty}</div>
          <div style={{fontFamily:'JetBrains Mono, monospace', fontWeight:600, textAlign:'right'}}>{settings.currency}{stat.rev.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
};

const SettingsView = ({ settings, onChange, onResetTables }) => {
  const upd = (patch) => onChange({ ...settings, ...patch });
  const [sbUrl, setSbUrl] = React.useState(localStorage.getItem("supabase_url") || "");
  const [sbKey, setSbKey] = React.useState(localStorage.getItem("supabase_anon_key") || "");
  const [sbStatus, setSbStatus] = React.useState(localStorage.getItem("supabase_url") ? "Active" : "");

  const handleConnectSupabase = async () => {
    if (!sbUrl || !sbKey) {
      localStorage.removeItem("supabase_url");
      localStorage.removeItem("supabase_anon_key");
      window.initSupabase();
      setSbStatus("Supabase disconnected. Local storage only.");
      return;
    }
    setSbStatus("Connecting & validating schema...");
    const res = await window.testSupabaseConnection(sbUrl, sbKey);
    if (res.success) {
      localStorage.setItem("supabase_url", sbUrl);
      localStorage.setItem("supabase_anon_key", sbKey);
      window.initSupabase();
      setSbStatus("Connected successfully! State synchronized with DB.");
    } else {
      setSbStatus("Connection failed: " + res.error);
    }
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <div className="section-title">Settings</div>
          <div className="section-sub">Persisted to this browser · Changes apply immediately</div>
        </div>
      </div>
      <div style={{background:'var(--bg-1)', border:'1px solid var(--line)', borderRadius:12, padding:24, maxWidth:720}}>
        <div className="settings-grid">
          <div className="setting-field full">
            <label>Restaurant Name</label>
            <input value={settings.restaurantName} onChange={(e) => upd({ restaurantName: e.target.value })}/>
          </div>
          <div className="setting-field full">
            <label>Address (multi-line)</label>
            <textarea value={settings.address} onChange={(e) => upd({ address: e.target.value })}
              rows={2}
              style={{background:'var(--bg-2)', border:'1px solid var(--line)', borderRadius:6, padding:'10px 12px', fontSize:13, color:'var(--text)', fontFamily:'inherit', resize:'vertical'}}/>
          </div>
          <div className="setting-field">
            <label>Tax ID</label>
            <input value={settings.taxId} onChange={(e) => upd({ taxId: e.target.value })}/>
          </div>
          <div className="setting-field">
            <label>Cashier Name</label>
            <input value={settings.cashierName} onChange={(e) => upd({ cashierName: e.target.value })}/>
          </div>
          <div className="setting-field">
            <label>Tax Rate (%)</label>
            <input type="number" step="0.1" value={settings.taxRate} onChange={(e) => upd({ taxRate: parseFloat(e.target.value) || 0 })}/>
          </div>
          <div className="setting-field">
            <label>Service Charge Rate (%)</label>
            <input type="number" step="0.1" value={settings.serviceChargeRate} onChange={(e) => upd({ serviceChargeRate: parseFloat(e.target.value) || 0 })}/>
          </div>
          <div className="setting-field">
            <label>Currency Symbol</label>
            <input value={settings.currency} onChange={(e) => upd({ currency: e.target.value })}/>
          </div>
          <div className="setting-field">
            <label>Table Count</label>
            <input type="number" min="1" max="40" value={settings.tableCount} onChange={(e) => { const n = parseInt(e.target.value) || 1; upd({ tableCount: n }); onResetTables(n); }}/>
          </div>
        </div>
        <div className="divider"/>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom: 20}}>
          <div className="opt-toggle-row" style={{padding:'10px 12px', background:'var(--bg-2)', borderRadius:8}}>
            <div>
              <div style={{fontSize:13, color:'var(--text)', fontWeight:500}}>Enable Tips</div>
              <div style={{fontSize:11, color:'var(--text-muted)'}}>Show tip field in orders</div>
            </div>
            <div className={`toggle-switch ${settings.tipEnabled ? "on" : ""}`} onClick={() => upd({ tipEnabled: !settings.tipEnabled })} style={{cursor:'pointer'}}/>
          </div>
          <div className="opt-toggle-row" style={{padding:'10px 12px', background:'var(--bg-2)', borderRadius:8}}>
            <div>
              <div style={{fontSize:13, color:'var(--text)', fontWeight:500}}>Service Charge</div>
              <div style={{fontSize:11, color:'var(--text-muted)'}}>Auto-apply to orders</div>
            </div>
            <div className={`toggle-switch ${settings.serviceChargeEnabled ? "on" : ""}`} onClick={() => upd({ serviceChargeEnabled: !settings.serviceChargeEnabled })} style={{cursor:'pointer'}}/>
          </div>
        </div>

        <div className="divider"/>
        <div style={{background:'var(--bg-2)', padding:16, borderRadius:8, border:'1px solid var(--line)'}}>
          <h3 style={{fontSize:14, fontWeight:600, marginBottom:12, color:'var(--amber-bright)'}}>🔌 Supabase Database Integration</h3>
          <div className="settings-grid" style={{marginBottom:12}}>
            <div className="setting-field full">
              <label>Supabase URL</label>
              <input value={sbUrl} onChange={(e) => setSbUrl(e.target.value)} placeholder="https://your-project.supabase.co"/>
            </div>
            <div className="setting-field full">
              <label>Supabase Anon Key</label>
              <input type="password" value={sbKey} onChange={(e) => setSbKey(e.target.value)} placeholder="your-anon-key"/>
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:16}}>
            <button className="btn btn-primary" onClick={handleConnectSupabase} style={{background:'var(--amber)', color:'#000', fontWeight:600, padding:'8px 16px', borderRadius:6}}>
              Connect & Sync
            </button>
            {sbStatus && (
              <span style={{fontSize:12, color: sbStatus.includes("failed") ? "var(--red)" : "var(--green)", fontWeight: 500}}>
                {sbStatus}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { HistoryView, SummaryView, SettingsView });
