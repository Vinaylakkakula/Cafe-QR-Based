// Portal helper — escapes overflow/stacking context
const Portal = window.Portal || (({ children }) => {
  const el = React.useRef(document.createElement('div'));
  React.useEffect(() => {
    const container = el.current;
    document.body.appendChild(container);
    return () => { document.body.removeChild(container); };
  }, []);
  return ReactDOM.createPortal(children, el.current);
});

// Reservations, Customers, Notifications views

const ReservationsView = ({ reservations, onAssignTable, onCancel, onCheckIn, tables, onAdd }) => {
  const sorted = [...reservations].sort((a,b) => a.ts - b.ts);
  const upcoming = sorted.filter(r => r.status !== "cancelled");
  return (
    <div>
      <div className="section-head">
        <div>
          <div className="section-title">Reservations</div>
          <div className="section-sub">{upcoming.length} upcoming · {formatDate(new Date())}</div>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>
          <Icon name="plus" size={13}/> New Reservation
        </button>
      </div>
      {upcoming.length === 0 ? (
        <div style={{padding:'60px', textAlign:'center', color:'var(--text-muted)', background:'var(--bg-1)', border:'1px dashed var(--line)', borderRadius:10}}>
          <div style={{fontSize:36, opacity:0.4, marginBottom:8}}>📅</div>
          No reservations yet. Click "New Reservation" to add one.
        </div>
      ) : (
        <div className="resv-list">
          {upcoming.map(r => {
            const d = new Date(r.ts);
            return (
              <div key={r.id} className="resv-card">
                <div className="resv-time">
                  <div className="h">{formatTime(d).replace(/ ?(AM|PM)/i, "")}</div>
                  <div className="rel">{formatRelative(r.ts)}</div>
                </div>
                <div>
                  <div className="resv-name">{r.name}</div>
                  <div className="resv-meta">
                    <span><Icon name="users" size={10}/> {r.party} guests</span>
                    <span>{r.phone}</span>
                    {r.tableNum && <span style={{color:'var(--amber)'}}>Table T{r.tableNum}</span>}
                  </div>
                  {r.note && <div className="resv-note">» {r.note}</div>}
                </div>
                <div className="resv-actions">
                  <button className="btn btn-secondary" style={{padding:'6px 10px', fontSize:11}} onClick={() => onCheckIn(r)}>
                    <Icon name="check" size={11}/> Seat
                  </button>
                  <button className="btn btn-ghost" style={{padding:'6px 8px', fontSize:11}} onClick={() => onCancel(r)}>
                    <Icon name="x" size={11}/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CustomersView = ({ customers, onAdd }) => {
  return (
    <div>
      <div className="section-head">
        <div>
          <div className="section-title">Customers & Loyalty</div>
          <div className="section-sub">{customers.length} regulars · Track visits and reward tiers</div>
        </div>
        <button className="btn btn-primary" onClick={onAdd}>
          <Icon name="plus" size={13}/> Add Customer
        </button>
      </div>
      <div className="cust-grid">
        {customers.map(c => (
          <div key={c.id} className="cust-card">
            <div className="cust-top">
              <div className="cust-avatar">{c.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
              <div style={{flex:1}}>
                <div className="cust-name">{c.name}</div>
                <div className="cust-phone">{c.phone}</div>
              </div>
              <span className={`tier-badge tier-${c.tier}`}>{c.tier}</span>
            </div>
            <div className="cust-stats">
              <div className="cust-stat"><span className="cust-stat-lbl">Visits</span><span className="cust-stat-val">{c.visits}</span></div>
              <div className="cust-stat"><span className="cust-stat-lbl">Spent</span><span className="cust-stat-val">${c.spent.toFixed(0)}</span></div>
              <div className="cust-stat"><span className="cust-stat-lbl">Points</span><span className="cust-stat-val" style={{color:'var(--amber)'}}>{c.points}</span></div>
            </div>
            <div style={{fontSize:10, color:'var(--text-muted)', marginTop:10, borderTop:'1px solid var(--line)', paddingTop:8}}>
              Last visit: {c.last}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NotificationsPanel = ({ items, onClose, onMarkRead }) => {
  const ref = React.useRef();
  React.useEffect(() => {
    const close = (e) => { if (!ref.current?.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener("click", close), 0);
    return () => document.removeEventListener("click", close);
  }, []);
  return (
    <div ref={ref} className="notif-panel">
      <div className="notif-head">
        <h3>Notifications</h3>
        <button className="btn-ghost" style={{fontSize:11, padding:'4px 8px'}} onClick={onMarkRead}>Mark all read</button>
      </div>
      <div className="notif-list">
        {items.length === 0 ? (
          <div style={{padding:'32px 20px', textAlign:'center', color:'var(--text-muted)', fontSize:12}}>All caught up ✓</div>
        ) : items.map(n => (
          <div key={n.id} className={`notif-item ${n.read ? "read" : "unread"}`}>
            <span/>
            <div className={`notif-icon ${n.level}`}>
              <Icon name={n.level === "warn" ? "chef" : n.level === "ok" ? "check" : "users"} size={13}/>
            </div>
            <div className="notif-body">
              <div className="notif-title">{n.title}</div>
              <div className="notif-msg">{n.msg}</div>
            </div>
            <div className="notif-time">{formatRelative(n.ts)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NewReservationModal = ({ onClose, onSave, tables }) => {
  const [form, setForm] = React.useState({
    name: "", phone: "", party: 2, hour: new Date().getHours() + 1, min: 0, note: "", tableNum: "",
  });
  const upd = (p) => setForm({ ...form, ...p });
  const save = () => {
    if (!form.name) return;
    const d = new Date();
    d.setHours(form.hour, form.min, 0, 0);
    onSave({
      id: uid("res"), ts: d.getTime(), name: form.name, phone: form.phone, party: parseInt(form.party) || 2,
      note: form.note, tableNum: form.tableNum ? parseInt(form.tableNum) : null, status: "confirmed"
    });
  };
  return (
    <Portal><div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{width: 420}} onClick={(e)=>e.stopPropagation()}>
        <div className="modal-head">
          <div><div className="modal-title">New Reservation</div><div className="modal-sub">Book a guest for today</div></div>
          <button className="modal-close" onClick={onClose}><Icon name="x"/></button>
        </div>
        <div className="modal-body">
          <div className="settings-grid">
            <div className="setting-field full"><label>Guest Name</label><input autoFocus value={form.name} onChange={(e) => upd({ name: e.target.value })}/></div>
            <div className="setting-field"><label>Phone</label><input value={form.phone} onChange={(e) => upd({ phone: e.target.value })}/></div>
            <div className="setting-field"><label>Party Size</label><input type="number" min="1" max="20" value={form.party} onChange={(e) => upd({ party: e.target.value })}/></div>
            <div className="setting-field"><label>Hour</label><input type="number" min="0" max="23" value={form.hour} onChange={(e) => upd({ hour: parseInt(e.target.value) || 0 })}/></div>
            <div className="setting-field"><label>Minute</label><input type="number" min="0" max="59" step="15" value={form.min} onChange={(e) => upd({ min: parseInt(e.target.value) || 0 })}/></div>
            <div className="setting-field full"><label>Preferred Table (optional)</label>
              <select value={form.tableNum} onChange={(e) => upd({ tableNum: e.target.value })}>
                <option value="">Any table</option>
                {tables.map(t => <option key={t.id} value={t.num}>T{t.num} · {t.capacity} seats</option>)}
              </select>
            </div>
            <div className="setting-field full"><label>Special Notes</label><input placeholder="Birthday, dietary needs, window seat…" value={form.note} onChange={(e) => upd({ note: e.target.value })}/></div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={!form.name}>Save</button>
        </div>
      </div>
    </div></Portal>
  );
};

const NewCustomerModal = ({ onClose, onSave }) => {
  const [form, setForm] = React.useState({ name: '', phone: '', note: '' });
  const upd = p => setForm(f => ({ ...f, ...p }));
  const save = () => {
    if (!form.name.trim()) return;
    onSave({ id: uid('cus'), name: form.name.trim(), phone: form.phone.trim(), visits: 0, spent: 0, points: 0, tier: 'Bronze', last: 'Just now' });
  };
  return (
    <Portal><div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{width:400}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div><div className="modal-title">Add Customer</div><div className="modal-sub">Register a new loyalty customer</div></div>
          <button className="modal-close" onClick={onClose}><Icon name="x"/></button>
        </div>
        <div className="modal-body">
          <div className="settings-grid">
            <div className="setting-field full"><label>Full Name *</label><input autoFocus value={form.name} onChange={e=>upd({name:e.target.value})} placeholder="e.g. Priya Sharma"/></div>
            <div className="setting-field full"><label>Phone</label><input value={form.phone} onChange={e=>upd({phone:e.target.value})} placeholder="+91 98765 43210"/></div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={!form.name.trim()}><Icon name="plus" size={13}/> Add Customer</button>
        </div>
      </div>
    </div></Portal>
  );
};

Object.assign(window, { ReservationsView, CustomersView, NotificationsPanel, NewReservationModal, NewCustomerModal });
