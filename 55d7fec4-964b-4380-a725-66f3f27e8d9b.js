// Main app — dashboard layout with reservations, customers, notifications

const STORAGE_KEY = "ember_pos_v2";
const MENU_VERSION = 5;

function loadState() {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return null; return JSON.parse(raw); } catch { return null; }
}
function saveState(state) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} }

const NAV_ITEMS = [
  { id: "floor", icon: "grid", label: "Floor" },
  { id: "reservations", icon: "clock", label: "Reservations" },
  { id: "customers", icon: "users", label: "Customers" },
  { id: "history", icon: "history", label: "Orders" },
  { id: "summary", icon: "chart", label: "Analytics" },
  { id: "kitchen", icon: "chef", label: "Kitchen" },
  { id: "staff", icon: "users", label: "Staff" },
  { id: "admin", icon: "chef", label: "Admin" },
  { id: "settings", icon: "gear", label: "Settings" },
];

function App({ authUser, onLogout }) {
  const saved = loadState();
  const [settings, setSettings] = React.useState(saved?.settings || DEFAULT_SETTINGS);
  const [tables, setTables] = React.useState(() => {
    const initial = saved?.tables || buildInitialTables(DEFAULT_SETTINGS.tableCount);
    if (!initial.some(t => t.id === "takeaway")) {
      initial.push({
        id: "takeaway",
        num: "Takeaway",
        capacity: 0,
        status: "available",
        waiter: "",
        splits: [createSplit("Takeaway")],
        activeSplit: 0,
      });
    }
    return initial;
  });
  const [menuItems, setMenuItems] = React.useState(
    (saved?.menuVersion === MENU_VERSION && saved?.menuItems) ? saved.menuItems : MENU_ITEMS
  );
  const [categories, setCategories] = React.useState(
    (saved?.menuVersion === MENU_VERSION && saved?.categories) ? saved.categories : MENU_CATEGORIES
  );
  const [orders, setOrders] = React.useState(saved?.orders || []);
  const [events, setEvents] = React.useState(saved?.events || []);
  const [reservations, setReservations] = React.useState(saved?.reservations || seedReservations());
  const [customers, setCustomers] = React.useState(saved?.customers || seedCustomers());
  const [staff, setStaff] = React.useState(() => {
    if (saved?.staff) return saved.staff;
    return [
      { id: "st1", name: "Vinay Lakkakula", role: "Manager", salary: 45000, joined: "2024-01-15", payments: { "2026-05": "paid", "2026-06": "pending" } },
      { id: "st2", name: "Ramesh Kumar", role: "Chef", salary: 35000, joined: "2024-03-10", payments: { "2026-05": "paid", "2026-06": "paid" } },
      { id: "st3", name: "Sita Sharma", role: "Waitstaff", salary: 18000, joined: "2025-02-01", payments: { "2026-05": "paid", "2026-06": "unpaid" } }
    ];
  });
  const [notifications, setNotifications] = React.useState(saved?.notifications || []);
  const [selectedId, setSelectedId] = React.useState(null);
  const [activeCat, setActiveCat] = React.useState("starters");
  const [view, setView] = React.useState("floor");
  const [modal, setModal] = React.useState(null);
  const [ctx, setCtx] = React.useState(null);
  const [now, setNow] = React.useState(new Date());
  const [toast, setToast] = React.useState(null);
  const [search, setSearch] = React.useState("");
  const [showNotif, setShowNotif] = React.useState(false);
  const [tipDismissed, setTipDismissed] = React.useState(saved?.tipDismissed || false);
  const prevTablesRef = React.useRef(tables);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (prevTablesRef.current && prevTablesRef.current.length > 0) {
      tables.forEach(table => {
        const prevTable = prevTablesRef.current.find(t => t.id === table.id);
        if (prevTable) {
          const waiter = table.waiter || "";
          const prevWaiter = prevTable.waiter || "";
          
          // Check if the current user is the waiter for this table
          const isMe = authUser && waiter && (
            authUser.name.toLowerCase() === waiter.toLowerCase() || 
            authUser.username.toLowerCase() === waiter.toLowerCase() ||
            authUser.name.toLowerCase().includes(waiter.toLowerCase()) ||
            waiter.toLowerCase().includes(authUser.name.toLowerCase())
          );
          const isStaffOrAdmin = authUser && (authUser.role === "Admin" || authUser.role === "Manager");

          // 1. Check if waiter assignment changed to the current logged-in waiter
          if (waiter && waiter !== prevWaiter && isMe) {
            const assignTitle = `📋 Table Assigned: T${table.num}`;
            const assignBody = `You have been assigned to Table T${table.num}`;
            
            showToast(assignTitle);
            
            if ("Notification" in window && Notification.permission === "granted") {
              try {
                const notif = new Notification(assignTitle, {
                  body: assignBody,
                  tag: `assigned-table-${table.id}`
                });
                notif.onclick = () => {
                  window.focus();
                  notif.close();
                };
              } catch (e) {}
            }

            // Play a single soft chime
            try {
              const AudioContext = window.AudioContext || window.webkitAudioContext;
              if (AudioContext) {
                const ctxNode = new AudioContext();
                if (ctxNode.state === 'suspended') ctxNode.resume();
                const nowNode = ctxNode.currentTime;
                const osc = ctxNode.createOscillator();
                const gain = ctxNode.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, nowNode); // A5
                gain.gain.setValueAtTime(0.001, nowNode);
                gain.gain.exponentialRampToValueAtTime(0.15, nowNode + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, nowNode + 0.3);
                osc.connect(gain);
                gain.connect(ctxNode.destination);
                osc.start(nowNode);
                osc.stop(nowNode + 0.3);
              }
            } catch (err) {}
          }

          // 2. Check if KDS stage changed to ready
          const currentStage = table.splits?.[table.activeSplit]?.courseStage;
          const prevStage = prevTable.splits?.[prevTable.activeSplit]?.courseStage;
          
          const isTransitionToReady = currentStage === "ready" && 
            (prevStage === "preparing" || prevStage === "cooking" || prevStage === "new");

          if (isTransitionToReady) {
            const title = `🍽️ Order Ready: Table T${table.num}`;
            const body = `Order for Table T${table.num} is ready!${waiter ? ` (Assigned to: ${waiter})` : ""}`;
            
            // Only alert the assigned waiter, or admins/managers (for oversight), or if no waiter is assigned
            if (isMe || isStaffOrAdmin || !waiter) {
              showToast(title);
              
              // Send native desktop/mobile push notification
              if ("Notification" in window && Notification.permission === "granted") {
                try {
                  const notif = new Notification(title, {
                    body,
                    requireInteraction: true,
                    tag: `ready-table-${table.id}`
                  });
                  notif.onclick = () => {
                    window.focus();
                    notif.close();
                  };
                } catch (e) {
                  console.warn("KDS Ready native notification failed:", e);
                }
              }

              // Add to system notifications state
              setNotifications(prev => [{
                id: uid("n"),
                key: `ready-${table.id}-${Date.now()}`,
                level: "ok",
                title,
                msg: body,
                ts: Date.now(),
                read: false
              }, ...prev].slice(0, 20));

              // Play E6/C6 double chime
              try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                  const ctxNode = new AudioContext();
                  if (ctxNode.state === 'suspended') ctxNode.resume();
                  const nowNode = ctxNode.currentTime;
                  
                  const osc1 = ctxNode.createOscillator();
                  const osc2 = ctxNode.createOscillator();
                  const gain1 = ctxNode.createGain();
                  const gain2 = ctxNode.createGain();
                  
                  osc1.type = 'sine';
                  osc1.frequency.setValueAtTime(1318.51, nowNode); // E6
                  gain1.gain.setValueAtTime(0.001, nowNode);
                  gain1.gain.exponentialRampToValueAtTime(0.2, nowNode + 0.02);
                  gain1.gain.exponentialRampToValueAtTime(0.0001, nowNode + 0.4);
                  
                  osc2.type = 'sine';
                  osc2.frequency.setValueAtTime(1046.50, nowNode + 0.15); // C6
                  gain2.gain.setValueAtTime(0.001, nowNode + 0.15);
                  gain2.gain.exponentialRampToValueAtTime(0.2, nowNode + 0.17);
                  gain2.gain.exponentialRampToValueAtTime(0.0001, nowNode + 0.55);
                  
                  osc1.connect(gain1);
                  gain1.connect(ctxNode.destination);
                  osc2.connect(gain2);
                  gain2.connect(ctxNode.destination);
                  
                  osc1.start(nowNode);
                  osc1.stop(nowNode + 0.4);
                  osc2.start(nowNode + 0.15);
                  osc2.stop(nowNode + 0.55);
                }
              } catch (err) {}
            }
          }
        }
      });
    }
    prevTablesRef.current = JSON.parse(JSON.stringify(tables));
  }, [tables, authUser]);

  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    return () => clearInterval(t);
  }, []);
  
  // Auto-route to first permitted view based on role
  React.useEffect(() => {
    if (authUser) {
      const perms = window._authUtils?.ROLE_PERMS?.[authUser.role];
      if (perms && perms[view] === false) {
        const allowedItem = NAV_ITEMS.find(item => {
          const key = item.id === 'reservations' ? 'reservations'
                    : item.id === 'customers'    ? 'customers'
                    : item.id === 'history'      ? 'history'
                    : item.id === 'summary'      ? 'summary'
                    : item.id === 'kitchen'      ? 'kitchen'
                    : item.id === 'admin'        ? 'admin'
                    : item.id === 'settings'     ? 'settings'
                    : item.id === 'staff'        ? 'staff'
                    : 'floor';
          return perms[key] !== false;
        });
        if (allowedItem) setView(allowedItem.id);
      }
    }
  }, [authUser, view]);
  
  // Apply brand colors and title dynamically
  React.useEffect(() => {
    const color = settings.themeColor || "amber";
    const palettes = {
      amber: { accent: "#f2a43a", bright: "#ffb84a", dim: "#3a2a12", soft: "rgba(242, 164, 58, 0.12)" },
      green: { accent: "#6bbf7b", bright: "#83db93", dim: "#123a1a", soft: "rgba(107, 191, 123, 0.12)" },
      blue: { accent: "#67a2d9", bright: "#8ac0f5", dim: "#12243a", soft: "rgba(103, 162, 217, 0.12)" },
      violet: { accent: "#a88ad9", bright: "#c5aaf2", dim: "#27123a", soft: "rgba(168, 138, 217, 0.12)" },
      red: { accent: "#e26060", bright: "#fca4a4", dim: "#3a1212", soft: "rgba(226, 96, 96, 0.12)" }
    };
    const theme = palettes[color] || palettes.amber;
    let styleEl = document.getElementById("dynamic-theme-style");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "dynamic-theme-style";
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
      :root {
        --amber: ${theme.accent} !important;
        --amber-bright: ${theme.bright} !important;
        --amber-dim: ${theme.dim} !important;
        --amber-soft: ${theme.soft} !important;
      }
      .sidebar-brand {
        background: linear-gradient(135deg, ${theme.accent}, ${theme.bright}) !important;
      }
    `;
    document.title = (settings.restaurantName || "POS") + " — Restaurant Point of Sale";
  }, [settings.themeColor, settings.restaurantName]);
  // Load state from Supabase if available
  React.useEffect(() => {
    async function loadFromDb() {
      if (window.supabaseClient) {
        try {
          const dbState = await window.fetchSupabaseState();
          if (dbState) {
            if (dbState.settings) setSettings(dbState.settings);
            if (dbState.tables) {
              const loaded = [...dbState.tables];
              if (!loaded.some(t => t.id === "takeaway")) {
                loaded.push({
                  id: "takeaway",
                  num: "Takeaway",
                  capacity: 0,
                  status: "available",
                  waiter: "",
                  splits: [createSplit("Takeaway")],
                  activeSplit: 0,
                });
              }
              setTables(loaded);
            }
            if (dbState.menuItems) setMenuItems(dbState.menuItems);
            if (dbState.orders) setOrders(dbState.orders);
            if (dbState.reservations) setReservations(dbState.reservations);
            if (dbState.customers) setCustomers(dbState.customers);
            if (dbState.staff) setStaff(dbState.staff);
            showToast("Loaded real-time state from Supabase");
          }
        } catch (e) {
          console.error("Failed loading from Supabase:", e);
        } finally {
          setIsLoaded(true);
        }
      } else {
        setIsLoaded(true);
      }
    }
    loadFromDb();
  }, []);

  // Periodically sync/pull state from Supabase to keep all devices in sync
  React.useEffect(() => {
    if (!window.supabaseClient) return;

    const interval = setInterval(async () => {
      try {
        const dbState = await window.fetchSupabaseState();
        if (dbState) {
          if (dbState.tables) {
            setTables(prev => {
              const loaded = [...dbState.tables];
              if (!loaded.some(t => t.id === "takeaway")) {
                loaded.push({
                  id: "takeaway",
                  num: "Takeaway",
                  capacity: 0,
                  status: "available",
                  waiter: "",
                  splits: [createSplit("Takeaway")],
                  activeSplit: 0,
                });
              }
              if (JSON.stringify(prev) !== JSON.stringify(loaded)) {
                return loaded;
              }
              return prev;
            });
          }
          if (dbState.orders) {
            setOrders(prev => JSON.stringify(prev) !== JSON.stringify(dbState.orders) ? dbState.orders : prev);
          }
          if (dbState.reservations) {
            setReservations(prev => JSON.stringify(prev) !== JSON.stringify(dbState.reservations) ? dbState.reservations : prev);
          }
          if (dbState.customers) {
            setCustomers(prev => JSON.stringify(prev) !== JSON.stringify(dbState.customers) ? dbState.customers : prev);
          }
          if (dbState.staff) {
            setStaff(prev => JSON.stringify(prev) !== JSON.stringify(dbState.staff) ? dbState.staff : prev);
          }
          if (dbState.menuItems) {
            setMenuItems(prev => JSON.stringify(prev) !== JSON.stringify(dbState.menuItems) ? dbState.menuItems : prev);
          }
        }
      } catch (err) {
        console.warn("Realtime state sync failed:", err);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const state = { settings, tables, menuItems, categories, orders, events, reservations, customers, staff, notifications, tipDismissed, menuVersion: MENU_VERSION };
    saveState(state);
    if (window.supabaseClient && isLoaded) {
      window.pushStateToSupabase(state);
    }
  }, [settings, tables, menuItems, categories, orders, events, reservations, customers, staff, notifications, tipDismissed, isLoaded]);

  // Generate notifications from state
  React.useEffect(() => {
    const existingKeys = new Set(notifications.map(n => n.key));
    const newOnes = [];
    menuItems.filter(i => i.available && i.stock <= 5).forEach(i => {
      const key = `low-${i.id}`;
      if (!existingKeys.has(key)) {
        const isCritical = i.stock < 4;
        newOnes.push({ 
          id: uid("n"), 
          key, 
          level: isCritical ? "error" : "warn", 
          title: isCritical ? "Critical low stock" : "Low stock", 
          msg: `${i.name} only ${i.stock} left`, 
          ts: Date.now(), 
          read: false 
        });
      }
    });
    reservations.filter(r => r.status === "confirmed" && r.ts - Date.now() < 30*60*1000 && r.ts - Date.now() > 0).forEach(r => {
      const key = `res-${r.id}`;
      if (!existingKeys.has(key)) newOnes.push({ id: uid("n"), key, level: "info", title: `${r.name} arriving soon`, msg: `Party of ${r.party} · ${formatTime(new Date(r.ts))}`, ts: Date.now(), read: false });
    });
    if (newOnes.length) {
      setNotifications(prev => [...newOnes, ...prev].slice(0, 20));
      if ("Notification" in window && Notification.permission === "granted") {
        newOnes.forEach(n => {
          try {
            const notif = new Notification(`🔔 ${n.title}`, {
              body: n.msg,
              requireInteraction: false
            });
            notif.onclick = () => {
              window.focus();
              notif.close();
            };
          } catch (e) {
            console.warn("Native Notification failed:", e);
          }
        });
      }
    }
  }, [menuItems, reservations]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const lowStockItems = menuItems.filter(i => i.available && i.stock <= 8);

  const selectedTable = tables.find(t => t.id === selectedId) || null;
  const pushEvent = (text, val) => setEvents(prev => [{ ts: Date.now(), text, val }, ...prev].slice(0, 40));
  const updateTable = (u) => setTables(prev => prev.map(t => t.id === u.id ? u : t));
  const selectTable = (table) => {
    setSelectedId(table.id);
    if (table.status === "available") updateTable({ ...table, status: "occupied" });
  };
  const setStatus = (table, status) => { updateTable({ ...table, status }); showToast(`T${table.num} marked ${status}`); pushEvent(`T${table.num} → ${status}`); };
  const assignWaiter = (table, name) => { updateTable({ ...table, waiter: name }); showToast(`Waiter assigned: ${name || "—"}`); };

  const addItemToOrder = (item) => {
    if (!selectedTable) { showToast("Select a table first"); return; }
    const table = selectedTable;
    const split = table.splits[table.activeSplit];
    const existing = split.items.findIndex(i => i.id === item.id && !i.note);
    let items;
    if (existing >= 0) { items = [...split.items]; items[existing] = { ...items[existing], qty: items[existing].qty + 1 }; }
    else items = [...split.items, { id: item.id, name: item.name, price: item.price, qty: 1, note: "", veg: item.veg, img: item.img }];
    const splits = [...table.splits]; splits[table.activeSplit] = { ...split, items };
    updateTable({ ...table, splits, status: "occupied" });
  };

  const toggleAvail = (item) => {
    setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, available: !i.available } : i));
    showToast(`${item.name} ${item.available ? "marked 86'd" : "back on menu"}`);
  };

  const showToast = (msg) => setToast(msg);

  // QR order integration
  const { pendingQROrder: qrPending, acceptOrder: qrAccept, dismissOrder: qrDismiss } =
    (window.useQROrders || (() => ({ pendingQROrder: null, acceptOrder: ()=>{}, dismissOrder: ()=>{} })))
    ({ tables, setTables, showToast, currency: settings.currency, setModal });
  const saveDraft = () => { showToast("Order saved as draft"); pushEvent(`Draft saved · T${selectedTable.num}`); };

  const confirmPayment = (paymentRecord) => {
    const table = selectedTable;
    const split = table.splits[table.activeSplit];
    const totals = computeSplitTotals(split, settings);
    
    // Fallback stock decrement for checkout: if KOT wasn't sent, decrement any unsent quantities
    const updatedItems = split.items.map(item => {
      const unsent = item.qty - (item.sentQty || 0);
      if (unsent > 0) {
        setMenuItems(prev => prev.map(m => {
          if (m.id === item.id) {
            const newStock = Math.max(0, m.stock - unsent);
            if (newStock < 4 && m.stock >= 4) {
              setTimeout(() => showToast(`⚠️ Critically Low Stock: ${m.name} has only ${newStock} left!`), 200);
            }
            return { ...m, stock: newStock };
          }
          return m;
        }));
      }
      return { ...item, sentQty: item.qty };
    });
    
    const order = { id: uid("ord"), ts: Date.now(), tableNum: table.num, waiter: table.waiter, splitLabel: split.label, split: { ...split, items: updatedItems }, totals, payment: paymentRecord };
    setOrders(prev => [...prev, order]);
    pushEvent(`Payment · T${table.num} · ${paymentRecord.method.toUpperCase()}`, settings.currency + paymentRecord.amount.toFixed(2));
    setNotifications(prev => [{ id: uid("n"), key: "pay-"+order.id, level: "ok", title: "Payment received", msg: `T${table.num} · ${settings.currency}${paymentRecord.amount.toFixed(2)}`, ts: Date.now(), read: false }, ...prev].slice(0, 20));

    let newTable;
    if (table.splits.length === 1) newTable = { ...table, status: "available", waiter: "", splits: [createSplit()], activeSplit: 0 };
    else { const splits = table.splits.filter((_, i) => i !== table.activeSplit); newTable = { ...table, splits, activeSplit: Math.max(0, table.activeSplit - 1) }; }
    updateTable(newTable);
    setModal({ type: "receipt", order });
    showToast(`Payment confirmed · ${settings.currency}${paymentRecord.amount.toFixed(2)}`);
  };

  const getTableTotal = (table) => table.splits.reduce((s, split) => s + computeSplitTotals(split, settings).grand, 0);

  const handleResetTables = (count) => {
    setTables(prev => {
      const current = prev.filter(t => t.id !== "takeaway");
      if (count > current.length) {
        const caps = [2,2,4,4,4,6,6,8];
        for (let i = current.length + 1; i <= count; i++) {
          current.push({ id: `t${i}`, num: i, capacity: caps[(i-1)%caps.length], status: "available", waiter: "", splits: [createSplit()], activeSplit: 0 });
        }
      } else if (count < current.length) {
        const sliced = current.slice(0, count);
        sliced.push(prev.find(t => t.id === "takeaway") || { id: "takeaway", num: "Takeaway", capacity: 0, status: "available", waiter: "", splits: [createSplit("Takeaway")], activeSplit: 0 });
        return sliced;
      }
      current.push(prev.find(t => t.id === "takeaway") || { id: "takeaway", num: "Takeaway", capacity: 0, status: "available", waiter: "", splits: [createSplit("Takeaway")], activeSplit: 0 });
      return current;
    });
  };

  const seatReservation = (r) => {
    const target = r.tableNum ? tables.find(t => t.num === r.tableNum) : tables.find(t => t.status === "available" && t.capacity >= r.party);
    if (!target) { showToast("No suitable table available"); return; }
    updateTable({ ...target, status: "occupied", waiter: target.waiter || "" });
    setReservations(prev => prev.map(x => x.id === r.id ? { ...x, status: "seated" } : x));
    setSelectedId(target.id);
    setView("floor");
    showToast(`${r.name} seated at T${target.num}`);
    pushEvent(`Seated · ${r.name} at T${target.num}`);
  };

  const nowStartOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const nowStartOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const dailyOrders = orders.filter(o => o.ts >= nowStartOfDay);
  const monthlyOrders = orders.filter(o => o.ts >= nowStartOfMonth);

  const dailyRevenue = dailyOrders.reduce((s, o) => s + o.payment.amount, 0);
  const dailyCount = dailyOrders.length;
  const dailyAvg = dailyCount > 0 ? dailyRevenue / dailyCount : 0;

  const monthlyRevenue = monthlyOrders.reduce((s, o) => s + o.payment.amount, 0);
  const monthlyCount = monthlyOrders.length;
  const monthlyAvg = monthlyCount > 0 ? monthlyRevenue / monthlyCount : 0;

  const totalRevenue = orders.reduce((s, o) => s + o.payment.amount, 0);
  const totalCount = orders.length;
  const totalAvg = totalCount > 0 ? totalRevenue / totalCount : 0;
  const occupiedCount = tables.filter(t => t.status === "occupied").length;
  const totalSeats = tables.reduce((s, t) => s + t.capacity, 0);
  const seatedEst = tables.filter(t => t.status === "occupied").reduce((s, t) => s + t.capacity, 0);
  const occupancyPct = totalSeats > 0 ? Math.round((seatedEst / totalSeats) * 100) : 0;

  const pageTitle = {
    floor: { main: "Floor & Orders", sub: "Take orders · monitor tables · process payments" },
    reservations: { main: "Reservations", sub: "Today's bookings and waitlist" },
    customers: { main: "Customers & Loyalty", sub: "Regulars, tiers, and rewards" },
    history: { main: "Orders", sub: "All transactions from this session" },
    summary: { main: "Analytics", sub: `${formatDate(now)} · ${getShift(now)} shift` },
    kitchen: { main: "Kitchen Display System", sub: "Real-time kitchen order preparation and queue" },
    staff: { main: "Staff & Salaries", sub: "Manage worker details, experience and salary tracking" },
    admin: { main: "Admin Panel", sub: "Manage menu items, categories & inventory" },
    settings: { main: "Settings", sub: "Configure restaurant & POS behaviour" },
  }[view];

  const filteredMenu = search
    ? menuItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase()))
    : menuItems;

  return (
    <>
      <aside className="sidebar no-print">
        <div className="sidebar-brand" title={settings.restaurantName} style={{overflow:"hidden", display: "grid", placeItems: "center"}}>
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="" style={{width: "100%", height: "100%", objectFit: "cover"}} />
          ) : (
            <span style={{color: "#1a0f00", fontWeight: 800, fontSize: 14}}>
              {(settings.restaurantName || "VC").split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
            </span>
          )}
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.filter(item => {
              const perms = window._authUtils?.ROLE_PERMS?.[authUser?.role];
              if (!perms) return true; // no auth = show all
              const key = item.id === 'reservations' ? 'reservations'
                        : item.id === 'customers'    ? 'customers'
                        : item.id === 'history'      ? 'history'
                        : item.id === 'summary'      ? 'summary'
                        : item.id === 'kitchen'      ? 'kitchen'
                        : item.id === 'staff'        ? 'staff'
                        : item.id === 'admin'        ? 'admin'
                        : item.id === 'settings'     ? 'settings'
                        : 'floor';
              return perms[key] !== false;
            }).map(item => (
            <button key={item.id} className={`sidebar-btn ${view === item.id ? "active" : ""}`} onClick={() => setView(item.id)} title={item.label}>
              <Icon name={item.icon} size={18}/>
              {item.id === "reservations" && reservations.filter(r => r.status==="confirmed" && r.ts - Date.now() < 60*60*1000 && r.ts > Date.now()).length > 0 && <span className="pulse"/>}
              {item.id === "history" && orders.length > 0 && <span className="pulse"/>}
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer"/>
        <button className="sidebar-btn" title={settings.cashierName}>
          <div style={{width:28, height:28, borderRadius:'50%', background:'var(--bg-3)', display:'grid', placeItems:'center', fontSize:10, fontWeight:700, color:'var(--amber)'}}>
            {settings.cashierName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <span className="sidebar-label">{settings.cashierName}</span>
        </button>
      </aside>

      <div className="main-col">
        <div className="topbar no-print">
          <div className="page-title">
            <div className="page-title-main">{pageTitle.main}</div>
            <div className="page-title-sub">{pageTitle.sub}</div>
          </div>
          <div className="topbar-right">
            {view === "floor" && (
              <div className="search-box">
                <Icon name="search" size={14}/>
                <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search menu…"/>
                <kbd>⌘K</kbd>
              </div>
            )}
            <div style={{position:'relative'}}>
              <button className="notif-trigger" onClick={(e) => { e.stopPropagation(); setShowNotif(s => !s); }}>
                <Icon name="clock" size={16}/>
                {unreadCount > 0 && <span className="badge-dot"/>}
              </button>
              {showNotif && <NotificationsPanel items={notifications} onClose={() => setShowNotif(false)} onMarkRead={() => setNotifications(prev => prev.map(n => ({...n, read:true})))}/>}
            </div>
            <div className="shift-badge"><span className="dot"/>{getShift(now)}</div>
            <div className="clock">
              <div className="clock-time">{formatTime(now)}</div>
              <div className="clock-date">{formatDate(now)}</div>
            </div>
            {authUser && window._authUtils?.UserBadge ? (
              <window._authUtils.UserBadge user={authUser} onLogout={onLogout || (() => {})} onChangePassword={() => setModal({ type: "change-password" })}/>
            ) : (
              <div className="cashier-chip">
                <div className="avatar">{settings.cashierName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}</div>
                <span>{settings.cashierName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="stats-strip no-print">
          {(!window._authUtils?.ROLE_PERMS?.[authUser?.role] || window._authUtils.ROLE_PERMS[authUser.role].summary !== false) && (
            <>
              <div className="stat-tile">
                <div className="stat-tile-label"><Icon name="dollar" size={10}/> Daily Revenue</div>
                <div className="stat-tile-value accent">{settings.currency}{dailyRevenue.toFixed(2)}</div>
                <div className="stat-tile-delta">{dailyCount} orders · avg {settings.currency}{dailyAvg.toFixed(2)}</div>
              </div>
              <div className="stat-tile">
                <div className="stat-tile-label"><Icon name="dollar" size={10}/> Monthly Revenue</div>
                <div className="stat-tile-value violet">{settings.currency}{monthlyRevenue.toFixed(2)}</div>
                <div className="stat-tile-delta">{monthlyCount} orders · avg {settings.currency}{monthlyAvg.toFixed(2)}</div>
              </div>
              <div className="stat-tile">
                <div className="stat-tile-label"><Icon name="dollar" size={10}/> Overall Revenue</div>
                <div className="stat-tile-value blue">{settings.currency}{totalRevenue.toFixed(2)}</div>
                <div className="stat-tile-delta">{totalCount} orders · avg {settings.currency}{totalAvg.toFixed(2)}</div>
              </div>
            </>
          )}
          <div className="stat-tile">
            <div className="stat-tile-label"><Icon name="users" size={10}/> Occupancy</div>
            <div className="stat-tile-value green">{occupancyPct}%</div>
            <div className="stat-tile-delta">{occupiedCount}/{tables.length} tables · {seatedEst}/{totalSeats} seats</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-label"><Icon name="clock" size={10}/> Reservations</div>
            <div className="stat-tile-value">{reservations.filter(r => r.status === "confirmed").length}</div>
            <div className="stat-tile-delta">Next: {(() => { const next = reservations.filter(r => r.status==="confirmed" && r.ts > Date.now()).sort((a,b)=>a.ts-b.ts)[0]; return next ? `${next.name} · ${formatTime(new Date(next.ts))}` : "None"; })()}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-label"><Icon name="chef" size={10}/> Menu Availability</div>
            <div className="stat-tile-value blue">{menuItems.filter(i => i.available).length}<span style={{color:'var(--text-muted)', fontSize:14}}>/{menuItems.length}</span></div>
            <div className="stat-tile-delta">{menuItems.filter(i => !i.available).length} items 86'd{lowStockItems.length > 0 ? ` · ${lowStockItems.length} low` : ""}</div>
          </div>
        </div>

        {view === "floor" ? (
          <div className="dash-body">
            <div className="dash-center">
              {!tipDismissed && (
                <div className="tip-banner">
                  <span>💡</span>
                  <span>Tip: <b>Click</b> a table to start an order · <b>Right-click</b> any table to change status or any menu item to toggle 86'd · <kbd>⌘K</kbd> to search</span>
                  <button className="dismiss" onClick={() => setTipDismissed(true)}>Got it</button>
                </div>
              )}
              {lowStockItems.length > 0 && (
                <div className="alerts-strip">
                  {lowStockItems.slice(0, 4).map(i => (
                    <span key={i.id} className="alert-chip"><span className="dot"/>{i.name} · {i.stock} left</span>
                  ))}
                  {lowStockItems.length > 4 && <span className="alert-chip" style={{color:'var(--text-dim)', background:'var(--bg-2)', borderColor:'var(--line)'}}>+{lowStockItems.length - 4} more</span>}
                </div>
              )}
              <FloorPlan tables={tables} selectedId={selectedId} onSelect={selectTable} onContext={(e, t) => setCtx({ x: e.clientX, y: e.clientY, table: t, onShowQR: (t) => setModal({ type: "qr", tableNum: t.num }) })} settings={settings} getTableTotal={getTableTotal} onShowQR={(t) => setModal({ type: "qr", tableNum: t.num })}/>
              <MenuGrid items={filteredMenu} categories={categories} activeCat={activeCat} onCat={setActiveCat} onAdd={addItemToOrder} canAdd={!!selectedTable} currency={settings.currency} onToggleAvail={toggleAvail}/>
            </div>
            <div className="dash-right">
              <OrderPanel selectedTable={selectedTable} onUpdateTable={updateTable} settings={settings} staff={staff} onOpenCheckout={() => setModal({ type: "checkout" })} onOpenKOT={() => setModal({ type: "kot" })} onSaveDraft={saveDraft}/>
              <div className="ticker">
                <div className="ticker-title"><span style={{width:6, height:6, borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 6px var(--green)', display:'inline-block'}}/>Live Activity</div>
                {events.length === 0 ? (
                  <div style={{fontSize:11, color:'var(--text-muted)', padding:'8px 0'}}>No activity yet. Actions stream here.</div>
                ) : events.slice(0, 8).map((ev, i) => (
                  <div key={i} className="ticker-item">
                    <span className="ticker-time">{formatTime(new Date(ev.ts))}</span>
                    <span className="ticker-desc">{ev.text}</span>
                    <span className="ticker-val">{ev.val || ""}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="workspace" style={{flex:1, minHeight:0, background:'var(--bg)'}}>
            <div className="workspace-inner" style={{maxWidth: 1200, margin:'0 auto', width:'100%'}}>
              {view === "reservations" && <ReservationsView reservations={reservations} tables={tables} onCheckIn={seatReservation} onCancel={(r) => { setReservations(prev => prev.map(x => x.id === r.id ? {...x, status:"cancelled"} : x)); showToast("Reservation cancelled"); }} onAdd={() => setModal({ type: "new-res" })}/>}
              {view === "customers" && <CustomersView customers={customers} onAdd={() => setModal({ type: "new-customer" })}/>}
              {view === "kitchen" && <KitchenDisplay tables={tables} onUpdateTable={updateTable} settings={settings} showToast={showToast}/>}
              {view === "staff" && window.StaffView && <window.StaffView staff={staff} setStaff={setStaff} showToast={showToast}/>}
              {view === "admin" && <AdminPanel menuItems={menuItems} setMenuItems={setMenuItems} categories={categories} setCategories={setCategories} orders={orders} settings={settings} showToast={showToast} tables={tables}/>}
              {view === "history" && <HistoryView orders={orders} settings={settings} onReprint={(o) => setModal({ type: "receipt", order: o })}/>}
              {view === "summary" && <SummaryView orders={orders} settings={settings}/>}
              {view === "settings" && <SettingsView settings={settings} onChange={setSettings} onResetTables={handleResetTables}/>}
            </div>
          </div>
        )}
      </div>

      {ctx && <TableContextMenu ctx={ctx} onClose={() => setCtx(null)} onSetStatus={setStatus} onAssignWaiter={(t) => setModal({ type: "waiter", table: t })}/>}
      {modal?.type === "kot" && selectedTable && (
        <KOTModal 
          table={selectedTable} 
          split={selectedTable.splits[selectedTable.activeSplit]} 
          onClose={() => setModal(null)}
          onSendKOT={(updatedItems, decrements) => {
            // Update table items to record the sent quantity
            const table = selectedTable;
            const splits = [...table.splits];
            splits[table.activeSplit] = { ...splits[table.activeSplit], items: updatedItems, courseStage: "cooking" };
            updateTable({ ...table, splits });
            
            // Decrement menu stocks
            if (decrements && Object.keys(decrements).length > 0) {
              setMenuItems(prev => prev.map(m => {
                if (decrements[m.id]) {
                  const dec = decrements[m.id];
                  const newStock = Math.max(0, m.stock - dec);
                  if (newStock < 4 && m.stock >= 4) {
                    setTimeout(() => showToast(`⚠️ Critically Low Stock: ${m.name} has only ${newStock} left!`), 200);
                  }
                  return { ...m, stock: newStock };
                }
                return m;
              }));
            }
          }}
        />
      )}
      {modal?.type === "checkout" && selectedTable && <CheckoutModal table={selectedTable} split={selectedTable.splits[selectedTable.activeSplit]} totals={computeSplitTotals(selectedTable.splits[selectedTable.activeSplit], settings)} settings={settings} onClose={() => setModal(null)} onConfirm={(rec) => { setModal(null); confirmPayment(rec); }}/>}
      {modal?.type === "receipt" && <ReceiptModal order={modal.order} settings={settings} onClose={() => setModal(null)}/>}
      {modal?.type === "waiter" && <WaiterModal table={modal.table} staff={staff} onClose={() => setModal(null)} onAssign={(name) => assignWaiter(modal.table, name)}/>}
      {modal?.type === "new-res" && <NewReservationModal tables={tables} onClose={() => setModal(null)} onSave={(r) => { setReservations(prev => [...prev, r]); setModal(null); showToast(`Reservation saved for ${r.name}`); }}/>}
      {modal?.type === "new-customer" && <NewCustomerModal onClose={() => setModal(null)} onSave={(c) => { setCustomers(prev => [...prev, c]); setModal(null); showToast(`${c.name} added`); }}/>}
      {modal?.type === "qr" && window.QRCodeModal && React.createElement(window.QRCodeModal, { tableNum: modal.tableNum, baseUrl: window.location.href.replace(/[^/]*$/, ""), onClose: () => setModal(null) })}
      {qrPending && window.QROrderBanner && React.createElement(window.QROrderBanner, { order: qrPending, currency: settings.currency, onAccept: qrAccept, onDismiss: qrDismiss })}
      {modal?.type === "change-password" && window._authUtils?.ChangePasswordModal && (
        <window._authUtils.ChangePasswordModal authUser={authUser} onClose={() => setModal(null)} showToast={showToast}/>
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)}/>}
    </>
  );
}

// ── Auth-wrapped entry point ──────────────────────────────────
function AppRoot() {
  const { loadAuth, clearAuth, saveAuth, LoginScreen, UserBadge } = window._authUtils || {};

  // If auth module not loaded (shouldn't happen), just render App
  if (!LoginScreen) {
    return <App/>;
  }

  const [authUser, setAuthUser] = React.useState(() => loadAuth ? loadAuth() : null);

  if (!authUser) {
    return <LoginScreen onLogin={(u) => { saveAuth(u); setAuthUser(u); }}/>;
  }

  return <App authUser={authUser} onLogout={() => { clearAuth(); setAuthUser(null); }}/>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<AppRoot/>);
