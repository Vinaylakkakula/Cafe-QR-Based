// ── Portal: renders children directly on document.body to escape
//    any parent overflow/stacking context (needed for modals inside
//    .workspace-inner which has overflow:auto)
const Portal = ({ children }) => {
  const el = React.useRef(document.createElement('div'));
  React.useEffect(() => {
    const container = el.current;
    document.body.appendChild(container);
    return () => { document.body.removeChild(container); };
  }, []);
  return ReactDOM.createPortal(children, el.current);
};

// ============================================================
// ADMIN PANEL — Menu CRUD, Category Management, Admin Dashboard
// ============================================================

// ---- Menu Item Form Modal (Add / Edit) ----------------------

const MenuItemModal = ({ item, categories, onClose, onSave }) => {
  const isEdit = !!item;
  const [form, setForm] = React.useState(item ? { ...item } : {
    id: uid("m"),
    cat: categories[0]?.id || "starters",
    name: "",
    desc: "",
    price: "",
    veg: true,
    available: true,
    stock: 10,
    img: "",
  });
  const [imgPreviewErr, setImgPreviewErr] = React.useState(false);

  const upd = (patch) => setForm(f => ({ ...f, ...patch }));

  const valid = form.name.trim() && parseFloat(form.price) > 0;

  const handleSave = () => {
    if (!valid) return;
    onSave({
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock) || 0,
    });
  };

  return (
    <Portal><div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ width: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{isEdit ? "Edit Menu Item" : "Add Menu Item"}</div>
            <div className="modal-sub">{isEdit ? `Editing: ${item.name}` : "Add a new item to the menu"}</div>
          </div>
          <button className="modal-close" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <div className="settings-grid">
            <div className="setting-field full">
              <label>Item Name <span style={{ color: "var(--red)" }}>*</span></label>
              <input autoFocus value={form.name} onChange={e => upd({ name: e.target.value })} placeholder="e.g. Paneer Butter Masala" />
            </div>
            <div className="setting-field full">
              <label>Description</label>
              <input value={form.desc || ""} onChange={e => upd({ desc: e.target.value })} placeholder="Short description of the dish" />
            </div>
            <div className="setting-field">
              <label>Category <span style={{ color: "var(--red)" }}>*</span></label>
              <select value={form.cat} onChange={e => upd({ cat: e.target.value })}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="setting-field">
              <label>Price (₹) <span style={{ color: "var(--red)" }}>*</span></label>
              <input type="number" min="0" step="0.50" value={form.price} onChange={e => upd({ price: e.target.value })} placeholder="0.00" />
            </div>
            <div className="setting-field">
              <label>Stock Qty</label>
              <input type="number" min="0" value={form.stock} onChange={e => upd({ stock: e.target.value })} />
            </div>
            <div className="setting-field">
              <label>Type</label>
              <select value={form.veg ? "veg" : "nonveg"} onChange={e => upd({ veg: e.target.value === "veg" })}>
                <option value="veg">🟢 Vegetarian</option>
                <option value="nonveg">🔴 Non-Vegetarian</option>
              </select>
            </div>
            <div className="setting-field full">
              <label>Image URL <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional — paste an Unsplash or CDN link)</span></label>
              <input value={form.img || ""} onChange={e => { upd({ img: e.target.value }); setImgPreviewErr(false); }} placeholder="https://images.unsplash.com/..." />
            </div>
            {form.img && !imgPreviewErr && (
              <div className="setting-field full" style={{ marginTop: -8 }}>
                <img
                  src={form.img}
                  alt="preview"
                  onError={() => setImgPreviewErr(true)}
                  style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)" }}
                />
              </div>
            )}
            {imgPreviewErr && (
              <div className="setting-field full" style={{ color: "var(--red)", fontSize: 12, marginTop: -8 }}>
                ⚠ Could not load image — check the URL.
              </div>
            )}
            <div className="setting-field">
              <label>Availability</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 8 }}>
                <div
                  className={`toggle-switch ${form.available ? "on" : ""}`}
                  onClick={() => upd({ available: !form.available })}
                  style={{ cursor: "pointer" }}
                />
                <span style={{ fontSize: 13, color: "var(--text-dim)" }}>
                  {form.available ? "Available on menu" : "86'd — hidden from orders"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!valid}>
            <Icon name="save" size={13} /> {isEdit ? "Save Changes" : "Add Item"}
          </button>
        </div>
      </div>
    </div></Portal>
  );
};

// ---- Category Form Modal ------------------------------------

const CategoryModal = ({ cat, onClose, onSave }) => {
  const isEdit = !!cat;
  const [form, setForm] = React.useState(cat ? { ...cat } : { id: "", name: "", icon: "🍽" });
  const upd = (patch) => setForm(f => ({ ...f, ...patch }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    const id = isEdit ? form.id : form.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    onSave({ ...form, id });
  };

  return (
    <Portal><div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{isEdit ? "Edit Category" : "Add Category"}</div>
            <div className="modal-sub">Menu categories group your items</div>
          </div>
          <button className="modal-close" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 80 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Icon</label>
                <input maxLength={4} value={form.icon} onChange={e => upd({ icon: e.target.value })}
                  style={{ fontSize: 24, textAlign: "center", width: "100%", height: 42, padding: 0, background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Category Name <span style={{ color: "var(--red)" }}>*</span></label>
                <input autoFocus value={form.name} onChange={e => upd({ name: e.target.value })} placeholder="e.g. Biryani"
                  style={{ width: "100%", height: 42, padding: "0 12px", background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)", fontSize: 14, boxSizing: "border-box" }} />
              </div>
            </div>
            {!isEdit && (
              <div style={{ color:"var(--text-dim)", fontSize:12, background:"var(--bg-2)", padding:"8px 10px", borderRadius:6 }}>
                💡 Category ID will be auto-generated from the name.
              </div>
            )}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!form.name.trim()}>
            <Icon name="save" size={13} /> {isEdit ? "Save" : "Add Category"}
          </button>
        </div>
      </div>
    </div></Portal>
  );
};

// ---- Delete Confirm Modal ------------------------------------

const DeleteConfirmModal = ({ title, desc, onClose, onConfirm }) => (
  <Portal><div className="modal-backdrop" onClick={onClose}>
    <div className="modal" style={{ width: 380 }} onClick={e => e.stopPropagation()}>
      <div className="modal-head">
        <div>
          <div className="modal-title" style={{ color: "var(--red)" }}>⚠ Confirm Delete</div>
          <div className="modal-sub">{title}</div>
        </div>
        <button className="modal-close" onClick={onClose}><Icon name="x" /></button>
      </div>
      <div className="modal-body">
        <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6 }}>{desc}</div>
      </div>
      <div className="modal-foot">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button
          className="btn btn-primary"
          style={{ background: "var(--red)", borderColor: "var(--red)" }}
          onClick={onConfirm}
        >
          <Icon name="trash" size={13} /> Delete
        </button>
      </div>
    </div>
  </div></Portal>
);

// ---- Admin Panel Main View ----------------------------------

const AdminPanel = ({ menuItems, setMenuItems, categories, setCategories, orders, settings, showToast, tables = [] }) => {
  const [tab, setTab] = React.useState("menu");
  const [itemModal, setItemModal] = React.useState(null); // null | { mode: "add"|"edit", item? }
  const [catModal, setCatModal] = React.useState(null);   // null | { mode: "add"|"edit", cat? }
  const [deleteModal, setDeleteModal] = React.useState(null); // null | { type, payload }
  const [filterCat, setFilterCat] = React.useState("all");
  const [filterSearch, setFilterSearch] = React.useState("");
  const [filterAvail, setFilterAvail] = React.useState("all");

  // ---- Menu CRUD handlers ----
  const handleAddItem = (item) => {
    setMenuItems(prev => [...prev, item]);
    setItemModal(null);
    showToast(`✓ "${item.name}" added to menu`);
  };
  const handleEditItem = (item) => {
    setMenuItems(prev => prev.map(i => i.id === item.id ? item : i));
    setItemModal(null);
    showToast(`✓ "${item.name}" updated`);
  };
  const handleDeleteItem = (item) => {
    setMenuItems(prev => prev.filter(i => i.id !== item.id));
    setDeleteModal(null);
    showToast(`"${item.name}" removed from menu`);
  };
  const handleToggleAvail = (item) => {
    setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, available: !i.available } : i));
    showToast(`${item.name} ${item.available ? "marked 86'd" : "back on menu"}`);
  };
  const handleStockChange = (item, val) => {
    setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, stock: Math.max(0, parseInt(val) || 0) } : i));
  };

  // ---- Category CRUD handlers ----
  const handleAddCat = (cat) => {
    if (categories.find(c => c.id === cat.id)) { showToast("Category ID already exists"); return; }
    setCategories(prev => [...prev, cat]);
    setCatModal(null);
    showToast(`✓ Category "${cat.name}" added`);
  };
  const handleEditCat = (cat) => {
    setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
    setCatModal(null);
    showToast(`✓ Category "${cat.name}" updated`);
  };
  const handleDeleteCat = (cat) => {
    const inUse = menuItems.filter(i => i.cat === cat.id).length;
    if (inUse > 0) { showToast(`Cannot delete — ${inUse} items use this category`); setDeleteModal(null); return; }
    setCategories(prev => prev.filter(c => c.id !== cat.id));
    setDeleteModal(null);
    showToast(`Category "${cat.name}" deleted`);
  };

  // ---- Filtered menu list ----
  const filteredItems = menuItems.filter(item => {
    if (filterCat !== "all" && item.cat !== filterCat) return false;
    if (filterAvail === "available" && !item.available) return false;
    if (filterAvail === "unavailable" && item.available) return false;
    if (filterSearch && !item.name.toLowerCase().includes(filterSearch.toLowerCase()) && !(item.desc || "").toLowerCase().includes(filterSearch.toLowerCase())) return false;
    return true;
  });

  // ---- Stats for dashboard ----
  const totalRevenue = orders.reduce((s, o) => s + o.payment.amount, 0);
  const topItems = (() => {
    const counts = {};
    orders.forEach(o => (o.split?.items || []).forEach(i => { counts[i.name] = (counts[i.name] || 0) + i.qty; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  })();

  const adminTabs = [
    { id: "menu", label: "Menu Items", icon: "chef" },
    { id: "categories", label: "Categories", icon: "filter" },
    { id: "qrcodes", label: "Table QR Codes", icon: "grid" },
    { id: "dashboard", label: "Admin Dashboard", icon: "chart" },
  ];

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Tab navigation */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid var(--line)", paddingBottom: 0 }}>
        {adminTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 600,
              background: "none",
              border: "none",
              borderBottom: tab === t.id ? "2px solid var(--amber)" : "2px solid transparent",
              color: tab === t.id ? "var(--amber)" : "var(--text-dim)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              transition: "color .15s",
              marginBottom: -1,
            }}
          >
            <Icon name={t.icon} size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* ===== MENU ITEMS TAB ===== */}
      {tab === "menu" && (
        <div>
          <div className="section-head">
            <div>
              <div className="section-title">Menu Items</div>
              <div className="section-sub">{menuItems.length} total · {menuItems.filter(i => i.available).length} available · {menuItems.filter(i => !i.available).length} 86'd</div>
            </div>
            <button className="btn btn-primary" onClick={() => setItemModal({ mode: "add" })}>
              <Icon name="plus" size={13} /> Add Item
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
            <div className="search-box" style={{ flex: "1 1 200px", minWidth: 180 }}>
              <Icon name="search" size={14} />
              <input value={filterSearch} onChange={e => setFilterSearch(e.target.value)} placeholder="Search items…" />
            </div>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              style={{ padding: "8px 12px", fontSize: 13, background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text)", cursor: "pointer" }}
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <div style={{ display: "flex", gap: 4 }}>
              {[["all", "All"], ["available", "Available"], ["unavailable", "86'd"]].map(([v, l]) => (
                <button key={v} className={`filter-chip ${filterAvail === v ? "active" : ""}`} onClick={() => setFilterAvail(v)}>{l}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          {filteredItems.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)", background: "var(--bg-1)", borderRadius: 10, border: "1px dashed var(--line)" }}>
              <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>🍽</div>
              No items found. {filterSearch || filterCat !== "all" ? "Try clearing filters." : "Click \"Add Item\" to create one."}
            </div>
          ) : (
            <div style={{ background: "var(--bg-1)", borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--bg-2)", borderBottom: "1px solid var(--line)" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Item</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</th>
                    <th style={{ padding: "10px 14px", textAlign: "right", fontWeight: 600, color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Price</th>
                    <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600, color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Stock</th>
                    <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600, color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                    <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 600, color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, idx) => {
                    const catObj = categories.find(c => c.id === item.cat);
                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: idx < filteredItems.length - 1 ? "1px solid var(--line)" : "none",
                          background: item.available ? "transparent" : "rgba(239,68,68,0.03)",
                          transition: "background .1s",
                        }}
                      >
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {item.img ? (
                              <img src={item.img} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} onError={e => e.target.style.display = "none"} />
                            ) : (
                              <div style={{ width: 40, height: 40, background: "var(--bg-3)", borderRadius: 6, display: "grid", placeItems: "center", fontSize: 18, flexShrink: 0 }}>
                                {catObj?.icon || "🍽"}
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                                {item.name}
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: item.veg ? "var(--green)" : "var(--red)", display: "inline-block", flexShrink: 0 }} title={item.veg ? "Veg" : "Non-veg"} />
                              </div>
                              {item.desc && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{item.desc}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px", color: "var(--text-dim)" }}>
                          {catObj ? `${catObj.icon} ${catObj.name}` : item.cat}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, color: "var(--amber-bright)" }}>
                          {settings.currency}{item.price.toFixed(2)}
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "center" }}>
                          <input
                            type="number"
                            min="0"
                            value={item.stock}
                            onChange={e => handleStockChange(item, e.target.value)}
                            style={{
                              width: 60, textAlign: "center", padding: "4px 6px",
                              background: "var(--bg-2)", border: "1px solid var(--line)",
                              borderRadius: 6, color: item.stock <= 5 ? "var(--red)" : item.stock <= 10 ? "var(--amber)" : "var(--text)",
                              fontSize: 13, fontFamily: "JetBrains Mono, monospace", fontWeight: 600,
                            }}
                          />
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "center" }}>
                          <div
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 6,
                              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
                              background: item.available ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                              color: item.available ? "var(--green)" : "var(--red)",
                              border: `1px solid ${item.available ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                              userSelect: "none",
                            }}
                            onClick={() => handleToggleAvail(item)}
                            title="Click to toggle"
                          >
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.available ? "var(--green)" : "var(--red)" }} />
                            {item.available ? "Available" : "86'd"}
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "5px 10px", fontSize: 11 }}
                              onClick={() => setItemModal({ mode: "edit", item })}
                            >
                              <Icon name="edit" size={11} /> Edit
                            </button>
                            <button
                              className="btn btn-ghost"
                              style={{ padding: "5px 10px", fontSize: 11, color: "var(--red)" }}
                              onClick={() => setDeleteModal({ type: "item", payload: item })}
                            >
                              <Icon name="trash" size={11} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Bulk stock warning */}
          {menuItems.filter(i => i.available && i.stock === 0).length > 0 && (
            <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 12, color: "var(--red)" }}>
              ⚠ {menuItems.filter(i => i.available && i.stock === 0).length} item(s) are available but have 0 stock — consider marking them 86'd.
            </div>
          )}
        </div>
      )}

      {/* ===== CATEGORIES TAB ===== */}
      {tab === "categories" && (
        <div>
          <div className="section-head">
            <div>
              <div className="section-title">Menu Categories</div>
              <div className="section-sub">{categories.length} categories · Organize your menu</div>
            </div>
            <button className="btn btn-primary" onClick={() => setCatModal({ mode: "add" })}>
              <Icon name="plus" size={13} /> Add Category
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14, marginTop: 4 }}>
            {categories.map(cat => {
              const count = menuItems.filter(i => i.cat === cat.id).length;
              const avail = menuItems.filter(i => i.cat === cat.id && i.available).length;
              return (
                <div
                  key={cat.id}
                  style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 28, width: 44, height: 44, display: "grid", placeItems: "center", background: "var(--bg-2)", borderRadius: 10 }}>
                      {cat.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{cat.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>ID: {cat.id}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ flex: 1, background: "var(--bg-2)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", fontFamily: "JetBrains Mono, monospace" }}>{count}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Items</div>
                    </div>
                    <div style={{ flex: 1, background: "var(--bg-2)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--green)", fontFamily: "JetBrains Mono, monospace" }}>{avail}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Available</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary" style={{ flex: 1, padding: "6px 0", fontSize: 12 }} onClick={() => setCatModal({ mode: "edit", cat })}>
                      <Icon name="edit" size={11} /> Edit
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "6px 12px", fontSize: 12, color: count > 0 ? "var(--text-muted)" : "var(--red)" }}
                      onClick={() => count > 0
                        ? showToast(`Cannot delete — ${count} items use "${cat.name}"`)
                        : setDeleteModal({ type: "category", payload: cat })
                      }
                      title={count > 0 ? `${count} items use this category` : "Delete category"}
                    >
                      <Icon name="trash" size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== ADMIN DASHBOARD TAB ===== */}
      {tab === "dashboard" && (
        <div>
          <div className="section-head">
            <div>
              <div className="section-title">Admin Dashboard</div>
              <div className="section-sub">Overview of menu health, sales performance & inventory</div>
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>
            {[
              { label: "Total Menu Items", val: menuItems.length, sub: `${menuItems.filter(i => i.available).length} available`, color: "var(--blue)" },
              { label: "Items 86'd", val: menuItems.filter(i => !i.available).length, sub: "Unavailable right now", color: "var(--red)" },
              { label: "Low Stock ≤ 8", val: menuItems.filter(i => i.available && i.stock <= 8).length, sub: "Needs restocking", color: "var(--amber)" },
              { label: "Categories", val: categories.length, sub: "Active menu sections", color: "var(--violet)" },
              { label: "Veg Items", val: menuItems.filter(i => i.veg).length, sub: `${menuItems.filter(i => !i.veg).length} non-veg`, color: "var(--green)" },
              { label: "Session Revenue", val: `${settings.currency}${totalRevenue.toFixed(0)}`, sub: `${orders.length} orders`, color: "var(--amber-bright)" },
            ].map((kpi, i) => (
              <div key={i} style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{kpi.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: kpi.color, fontFamily: "JetBrains Mono, monospace" }}>{kpi.val}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{kpi.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Low Stock Items */}
            <div style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--amber)" }}>⚠</span> Low Stock Items
              </div>
              {menuItems.filter(i => i.available && i.stock <= 8).length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>✓ All stock levels OK</div>
              ) : (
                menuItems.filter(i => i.available && i.stock <= 8).sort((a, b) => a.stock - b.stock).map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ fontSize: 13 }}>{item.name}</span>
                    <span style={{
                      fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 13,
                      color: item.stock === 0 ? "var(--red)" : item.stock <= 5 ? "var(--red)" : "var(--amber)"
                    }}>
                      {item.stock} left
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Top Selling Items */}
            <div style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--green)" }}>🏆</span> Top Selling Items (Session)
              </div>
              {topItems.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>No orders yet this session</div>
              ) : (
                topItems.map(([name, qty], idx) => (
                  <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, width: 20, height: 20, borderRadius: "50%", background: idx === 0 ? "var(--amber)" : "var(--bg-3)", color: idx === 0 ? "#000" : "var(--text-dim)", display: "grid", placeItems: "center", fontWeight: 700 }}>
                        {idx + 1}
                      </span>
                      {name}
                    </span>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 13, color: "var(--green)" }}>
                      ×{qty}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Category Breakdown */}
            <div style={{ background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px", gridColumn: "1 / -1" }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📊 Category Breakdown</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                {categories.map(cat => {
                  const total = menuItems.filter(i => i.cat === cat.id).length;
                  const avail = menuItems.filter(i => i.cat === cat.id && i.available).length;
                  const pct = total > 0 ? Math.round((avail / total) * 100) : 0;
                  return (
                    <div key={cat.id} style={{ background: "var(--bg-2)", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 20, marginBottom: 6 }}>{cat.icon}</div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{cat.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{avail}/{total} available</div>
                      <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: "var(--bg-3)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "var(--green)" : pct > 50 ? "var(--amber)" : "var(--red)", borderRadius: 2, transition: "width .3s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ===== TABLE QR CODES TAB ===== */}
      {tab === "qrcodes" && (
        <div>
          <div className="section-head">
            <div>
              <div className="section-title">Table QR Codes</div>
              <div className="section-sub">Generate, download or print digital ordering QR codes for tables</div>
            </div>
            <button className="btn btn-primary" onClick={() => {
              const win = window.open("", "_blank");
              win.document.write(`
                <html>
                  <head>
                    <title>All Table QR Codes</title>
                    <style>
                      body { font-family: sans-serif; padding: 20px; }
                      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                      .card { border: 2px solid #000; border-radius: 12px; padding: 16px; text-align: center; page-break-inside: avoid; }
                      h1 { margin: 0 0 5px 0; font-size: 20px; }
                      p { margin: 5px 0; font-size: 12px; color: #555; }
                    </style>
                  </head>
                  <body>
                    <h2 style="text-align:center; margin-bottom:30px;">${settings.restaurantName} — QR Table Cards</h2>
                    <div class="grid" id="qr-grid"></div>
                    <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
                    <script>
                      const baseUrl = window.location.href.replace(/[^/]*$/, "").replace("about:blank", window.opener.location.href.replace(/[^/]*$/, ""));
                      const tables = ${JSON.stringify(tables)};
                      const grid = document.getElementById("qr-grid");
                      
                      Promise.all(tables.map(t => {
                        const card = document.createElement("div");
                        card.className = "card";
                        const title = document.createElement("h1");
                        title.innerText = "${settings.restaurantName}";
                        const label = document.createElement("p");
                        label.innerText = "Table " + t.num;
                        const canvas = document.createElement("canvas");
                        const sub = document.createElement("p");
                        sub.innerText = "Scan to browse menu & order";
                        
                        card.appendChild(title);
                        card.appendChild(label);
                        card.appendChild(canvas);
                        card.appendChild(sub);
                        grid.appendChild(card);
                        
                        return QRCode.toCanvas(canvas, baseUrl + "customer-order.html?table=" + t.num, {
                          width: 180,
                          margin: 1
                        });
                      })).then(() => {
                        setTimeout(() => { window.print(); window.close(); }, 500);
                      });
                    </script>
                  </body>
                </html>
              `);
              win.document.close();
            }}>
              <Icon name="print" size={13} /> Print All QR Codes
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
            {tables.map(t => (
              <TableQRCard key={t.id} tableNum={t.num} settings={settings} />
            ))}
          </div>
        </div>
      )}

      {/* ===== MODALS ===== */}
      {itemModal?.mode === "add" && (
        <MenuItemModal categories={categories} onClose={() => setItemModal(null)} onSave={handleAddItem} />
      )}
      {itemModal?.mode === "edit" && (
        <MenuItemModal item={itemModal.item} categories={categories} onClose={() => setItemModal(null)} onSave={handleEditItem} />
      )}
      {catModal?.mode === "add" && (
        <CategoryModal onClose={() => setCatModal(null)} onSave={handleAddCat} />
      )}
      {catModal?.mode === "edit" && (
        <CategoryModal cat={catModal.cat} onClose={() => setCatModal(null)} onSave={handleEditCat} />
      )}
      {deleteModal?.type === "item" && (
        <DeleteConfirmModal
          title={`Delete "${deleteModal.payload.name}"`}
          desc={`This will permanently remove "${deleteModal.payload.name}" from the menu. Any active orders referencing this item will not be affected.`}
          onClose={() => setDeleteModal(null)}
          onConfirm={() => handleDeleteItem(deleteModal.payload)}
        />
      )}
      {deleteModal?.type === "category" && (
        <DeleteConfirmModal
          title={`Delete category "${deleteModal.payload.name}"`}
          desc={`This will permanently delete the "${deleteModal.payload.name}" category. Make sure no menu items are using it first.`}
          onClose={() => setDeleteModal(null)}
          onConfirm={() => handleDeleteCat(deleteModal.payload)}
        />
      )}
    </div>
  );
const TableQRCard = ({ tableNum, settings }) => {
  const canvasRef = React.useRef(null);
  const [qrLoaded, setQrLoaded] = React.useState(!!window.QRCode);
  const baseUrl = window.location.href.replace(/[^/]*$/, "");
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
    if (!qrLoaded || !window.QRCode || !canvasRef.current) return;
    window.QRCode.toCanvas(canvasRef.current, orderUrl, {
      width: 140,
      margin: 1,
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

  const printSingle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Print QR Table ${tableNum}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; margin: 0; }
            .card { border: 2px solid #000; border-radius: 12px; padding: 24px; text-align: center; max-width: 300px; }
            h1 { margin: 0 0 10px 0; font-size: 24px; }
            p { margin: 10px 0; font-size: 14px; color: #555; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="card">
            <h1>${settings.restaurantName}</h1>
            <p>Table ${tableNum}</p>
            <img src="${canvas.toDataURL("image/png")}" width="200" height="200"/>
            <p>Scan to order directly from your table</p>
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div style={{background:'var(--bg-2)', border:'1px solid var(--line)', borderRadius:12, padding:16, display:'flex', flexDirection:'column', alignItems:'center', gap:10}}>
      <div style={{fontWeight:700, fontSize:15}}>Table T{tableNum}</div>
      <div style={{background:'#fff', padding:8, borderRadius:8, display:'inline-block'}}>
        <canvas ref={canvasRef} style={{width:120, height:120, display:'block'}}/>
      </div>
      <div style={{display:'flex', gap:6, width:'100%'}}>
        <button className="btn btn-secondary" style={{flex:1, padding:'6px 0', fontSize:11}} onClick={download}>⬇ PNG</button>
        <button className="btn btn-primary" style={{flex:1, padding:'6px 0', fontSize:11}} onClick={printSingle}>🖨 Print</button>
      </div>
    </div>
  );
};

Object.assign(window, { AdminPanel, MenuItemModal, CategoryModal, DeleteConfirmModal, TableQRCard });
