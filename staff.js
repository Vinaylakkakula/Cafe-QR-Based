// Staff Management & Salary Tracking Component
// Renders inside the main POS space. Available to Admin & Manager.

const StaffView = ({ staff, setStaff, showToast }) => {
  const [selectedStaffId, setSelectedStaffId] = React.useState(staff[0]?.id || null);
  const [search, setSearch] = React.useState("");
  const [modal, setModal] = React.useState(null); // { type: 'add'|'edit', data?: any }
  const [deleteConfirmId, setDeleteConfirmId] = React.useState(null);
  
  // Track mobile layout state
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  const [mobileMode, setMobileMode] = React.useState("list"); // 'list' or 'details'

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileMode("list"); // Reset on desktop resize
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedWorker = staff.find(s => s.id === selectedStaffId) || staff[0] || null;

  const selectWorker = (id) => {
    setSelectedStaffId(id);
    setDeleteConfirmId(null);
    if (isMobile) {
      setMobileMode("details");
    }
  };

  // Compute total months and years of experience based on joining date
  const computeExperience = (joinDateStr) => {
    if (!joinDateStr) return "N/A";
    const joinDate = new Date(joinDateStr);
    const now = new Date();
    let years = now.getFullYear() - joinDate.getFullYear();
    let months = now.getMonth() - joinDate.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years === 0 && months === 0) {
      const diffTime = Math.abs(now - joinDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
    }
    
    let result = "";
    if (years > 0) result += `${years} yr${years > 1 ? "s" : ""} `;
    if (months > 0) result += `${months} mo${months > 1 ? "s" : ""}`;
    return result.trim();
  };

  // Generate list of recent 12 months for salary tracking
  const getTrackingMonths = () => {
    const list = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${monthNum}`;
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      list.push({ key, label });
    }
    return list;
  };

  const trackingMonths = getTrackingMonths();

  const cyclePaymentStatus = (workerId, monthKey) => {
    setStaff(prev => prev.map(w => {
      if (w.id === workerId) {
        const payments = { ...(w.payments || {}) };
        const current = payments[monthKey] || "unpaid";
        let next = "paid";
        if (current === "paid") next = "pending";
        else if (current === "pending") next = "unpaid";
        
        payments[monthKey] = next;
        showToast(`Updated ${w.name}'s payment to ${next.toUpperCase()}`);
        return { ...w, payments };
      }
      return w;
    }));
  };

  const handleSaveStaff = (form) => {
    if (!form.name || !form.role) {
      showToast("Please fill in Name and Designation");
      return;
    }
    
    if (modal.type === "add") {
      const newWorker = {
        id: "st-" + Date.now(),
        name: form.name,
        role: form.role,
        salary: parseFloat(form.salary) || 0,
        joined: form.joined || new Date().toISOString().split('T')[0],
        payments: {}
      };
      setStaff(prev => [...prev, newWorker]);
      setSelectedStaffId(newWorker.id);
      showToast(`Added worker: ${form.name}`);
      if (isMobile) setMobileMode("details");
    } else {
      setStaff(prev => prev.map(w => w.id === form.id ? { ...w, ...form, salary: parseFloat(form.salary) || 0 } : w));
      showToast(`Updated worker: ${form.name}`);
    }
    setModal(null);
  };

  const handleDeleteStaff = (id) => {
    if (deleteConfirmId === id) {
      setStaff(prev => prev.filter(w => w.id !== id));
      showToast("Staff member removed");
      setSelectedStaffId(null);
      setDeleteConfirmId(null);
      if (isMobile) setMobileMode("list");
    } else {
      setDeleteConfirmId(id);
      showToast("Click 'Remove' again to confirm deletion");
    }
  };

  const filteredStaff = staff.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.role.toLowerCase().includes(search.toLowerCase())
  );

  // Define layout structures based on viewport mode
  const showList = !isMobile || mobileMode === "list";
  const showDetails = !isMobile || mobileMode === "details";

  return (
    <div style={{ 
      display: isMobile ? "block" : "grid", 
      gridTemplateColumns: "320px 1fr", 
      gap: 20, 
      height: isMobile ? "calc(100vh - 128px)" : "calc(100vh - 180px)", 
      minHeight: 400, 
      padding: isMobile ? "8px" : "10px 0",
      overflow: isMobile ? "auto" : "hidden"
    }}>
      
      {/* List Panel */}
      {showList && (
        <div style={{ 
          background: "var(--bg-1)", 
          border: "1px solid var(--line)", 
          borderRadius: 12, 
          display: "flex", 
          flexDirection: "column", 
          overflow: "hidden",
          height: isMobile ? "100%" : "auto",
          marginBottom: isMobile ? 64 : 0
        }}>
          <div style={{ padding: 14, borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Team Roster</span>
              <button onClick={() => setModal({ type: "add" })} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 12, borderRadius: 8 }}>
                + Add Staff
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <input 
                type="text" 
                placeholder="Search staff..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", padding: "8px 12px 8px 32px", fontSize: 13, background: "var(--bg-3)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)" }}
              />
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", pointerEvents: "none" }}>🔍</span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {filteredStaff.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--text-dim)", fontSize: 13 }}>No staff found.</div>
            ) : (
              filteredStaff.map(w => {
                const isActive = selectedWorker && selectedWorker.id === w.id;
                const initials = w.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <div 
                    key={w.id} 
                    onClick={() => selectWorker(w.id)}
                    style={{
                      padding: "12px", borderRadius: 8, cursor: "pointer", marginBottom: 6,
                      display: "flex", alignItems: "center", gap: 12, transition: "all .15s",
                      background: isActive ? "var(--amber-soft)" : "transparent",
                      border: "1px solid",
                      borderColor: isActive ? "var(--amber)" : "transparent"
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: isActive ? "var(--amber)" : "var(--bg-3)", color: isActive ? "#000" : "var(--text)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{w.role}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>₹{w.salary.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{computeExperience(w.joined)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Details Panel */}
      {showDetails && (
        selectedWorker ? (
          <div style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: 12, height: "100%", paddingBottom: isMobile ? 80 : 0 }}>
            {/* Top Navigation & Header Card */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {isMobile && (
                <button 
                  onClick={() => setMobileMode("list")} 
                  style={{
                    background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 8,
                    padding: "8px 12px", color: "var(--text-dim)", cursor: "pointer", fontSize: 13,
                    fontWeight: 600, width: "fit-content", display: "flex", alignItems: "center", gap: 6
                  }}
                >
                  ← Back to Team Roster
                </button>
              )}
              
              <div style={{ 
                background: "var(--bg-1)", 
                border: "1px solid var(--line)", 
                borderRadius: 12, 
                padding: isMobile ? 14 : 20, 
                display: "flex", 
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between", 
                alignItems: isMobile ? "stretch" : "center",
                gap: 14
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--amber-soft)", border: "1.5px solid var(--amber)", color: "var(--amber-bright)", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                    {selectedWorker.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{selectedWorker.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2, display: "flex", flexWrap: "wrap", gap: "6px 12px" }}>
                      <span>📋 Role: <b>{selectedWorker.role}</b></span>
                      <span>🗓 Joined: <b>{new Date(selectedWorker.joined).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</b></span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: isMobile ? "space-between" : "flex-end" }}>
                  <button onClick={() => setModal({ type: "edit", data: selectedWorker })} className="btn btn-secondary" style={{ padding: "8px 14px", fontSize: 12, flex: isMobile ? 1 : "none" }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDeleteStaff(selectedWorker.id)} className="btn btn-secondary" style={{ padding: "8px 14px", fontSize: 12, borderColor: "var(--red)", color: "var(--red)", background: deleteConfirmId === selectedWorker.id ? "rgba(226,96,96,0.15)" : "transparent", flex: isMobile ? 1 : "none" }}>
                    {deleteConfirmId === selectedWorker.id ? "⚠️ Confirm Remove?" : "🗑 Remove"}
                  </button>
                </div>
              </div>
            </div>

            {/* Salary Grid Card */}
            <div style={{ 
              background: "var(--bg-1)", 
              border: "1px solid var(--line)", 
              borderRadius: 12, 
              padding: isMobile ? 14 : 20, 
              display: "flex", 
              flexDirection: "column", 
              overflow: "hidden"
            }}>
              <div style={{ 
                display: "flex", 
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between", 
                alignItems: isMobile ? "stretch" : "baseline", 
                marginBottom: 16, 
                borderBottom: "1px solid var(--line)", 
                paddingBottom: 12,
                gap: 12
              }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Salary Tracker</span>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>Tap any badge to cycle: <span style={{ color: "var(--green)" }}>● Paid</span> / <span style={{ color: "var(--amber)" }}>● Pending</span> / <span style={{ color: "var(--red)" }}>● Unpaid</span></div>
                </div>
                <div style={{ display: "flex", gap: 16, justifyContent: isMobile ? "space-between" : "flex-end" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase" }}>Monthly Base</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--amber-bright)", fontFamily: "monospace" }}>₹{selectedWorker.salary.toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase" }}>Experience</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{computeExperience(selectedWorker.joined)}</div>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto" }}>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(130px, 1fr))", 
                  gap: isMobile ? 8 : 12 
                }}>
                  {trackingMonths.map(m => {
                    const status = selectedWorker.payments?.[m.key] || "unpaid";
                    const colorMap = {
                      paid: { border: "var(--green)", bg: "rgba(107, 191, 123, 0.08)", text: "var(--green)", label: "Paid" },
                      pending: { border: "var(--amber)", bg: "rgba(242, 164, 58, 0.08)", text: "var(--amber-bright)", label: "Pending" },
                      unpaid: { border: "#e26060", bg: "rgba(226, 96, 96, 0.05)", text: "#fca4a4", label: "Unpaid" }
                    }[status];

                    return (
                      <div 
                        key={m.key} 
                        onClick={() => cyclePaymentStatus(selectedWorker.id, m.key)}
                        style={{
                          padding: isMobile ? "12px 8px" : "14px 10px", border: "1px solid", borderColor: colorMap.border,
                          borderRadius: 8, background: colorMap.bg, cursor: "pointer",
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          gap: 6, transition: "all .12s"
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-dim)" }}>{m.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: colorMap.text }}>{colorMap.label}</div>
                        <div style={{ fontSize: 9, fontFamily: "monospace", opacity: 0.8 }}>₹{selectedWorker.salary.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 12, display: "grid", placeItems: "center", color: "var(--text-dim)", height: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 36 }}>👥</span>
              <div style={{ marginTop: 12, fontSize: 13 }}>No worker selected. Select one or add a new staff member.</div>
            </div>
          </div>
        )
      )}

      {/* Add / Edit Staff Modal */}
      {modal && (
        <StaffFormModal 
          type={modal.type} 
          data={modal.data} 
          onClose={() => setModal(null)} 
          onSave={handleSaveStaff}
        />
      )}
    </div>
  );
};

// React Portal to escape parent container clips
const Portal = ({ children }) => {
  const el = React.useRef(document.createElement('div'));
  React.useEffect(() => {
    const container = el.current;
    document.body.appendChild(container);
    return () => { document.body.removeChild(container); };
  }, []);
  return ReactDOM.createPortal(children, el.current);
};

// Form Modal Component for Add/Edit
const StaffFormModal = ({ type, data, onClose, onSave }) => {
  const [form, setForm] = React.useState({
    id: data?.id || "",
    name: data?.name || "",
    role: data?.role || "Waitstaff",
    salary: data?.salary || 15000,
    joined: data?.joined || new Date().toISOString().split('T')[0],
    payments: data?.payments || {}
  });

  return (
    <Portal>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" style={{ width: 350 }} onClick={e => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <div className="modal-title">{type === "add" ? "Add Staff Member" : "Edit Staff Details"}</div>
              <div className="modal-sub">Enter team member work details</div>
            </div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>Full Name</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. John Doe"
                style={{ width: "100%", padding: "10px", marginTop: 4, background: "var(--bg-3)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>Designation / Role</label>
              <select 
                value={form.role} 
                onChange={e => setForm({ ...form, role: e.target.value })}
                style={{ width: "100%", padding: "10px", marginTop: 4, background: "var(--bg-3)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)" }}
              >
                <option value="Manager">Manager</option>
                <option value="Chef">Chef</option>
                <option value="Kitchen Helper">Kitchen Helper</option>
                <option value="Waitstaff">Waitstaff</option>
                <option value="Cashier">Cashier</option>
                <option value="Cleaner">Cleaner</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>Monthly Salary (₹)</label>
              <input 
                type="number" 
                value={form.salary} 
                onChange={e => setForm({ ...form, salary: parseFloat(e.target.value) || 0 })}
                style={{ width: "100%", padding: "10px", marginTop: 4, background: "var(--bg-3)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>Date of Joining</label>
              <input 
                type="date" 
                value={form.joined} 
                onChange={e => setForm({ ...form, joined: e.target.value })}
                style={{ width: "100%", padding: "10px", marginTop: 4, background: "var(--bg-3)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)" }}
              />
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => onSave(form)}>Save Details</button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

Object.assign(window, { StaffView });
