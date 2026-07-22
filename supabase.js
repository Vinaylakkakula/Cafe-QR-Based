// Supabase integration and sync module
let supabaseClient = null;

function getSupabaseConfig() {
  const url = window.SUPABASE_CONFIG?.url || localStorage.getItem("supabase_url") || "";
  const key = window.SUPABASE_CONFIG?.key || localStorage.getItem("supabase_anon_key") || "";
  return { url, key };
}

function initSupabase() {
  const { url, key } = getSupabaseConfig();
  if (url && key && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(url, key);
      console.log("Supabase client initialized successfully.");
      return true;
    } catch (err) {
      console.error("Failed to initialize Supabase client:", err);
    }
  }
  supabaseClient = null;
  return false;
}

// Check connection and schema
async function testSupabaseConnection(url, key) {
  if (!window.supabase) return { success: false, error: "Supabase library not loaded." };
  try {
    const client = window.supabase.createClient(url, key);
    const { data, error } = await client.from("pos_settings").select("id").limit(1);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || "Unknown connection error." };
  }
}

// Fetch all states from Supabase
async function fetchSupabaseState() {
  if (!supabaseClient) return null;
  try {
    console.log("Fetching state from Supabase...");
    
    // Fetch Settings
    const settingsRes = await supabaseClient.from("pos_settings").select("data").eq("id", "global").single();
    let settings = null;
    if (settingsRes.data) {
      settings = settingsRes.data.data;
    }

    // Fetch Staff
    let staff = null;
    try {
      const staffRes = await supabaseClient.from("pos_settings").select("data").eq("id", "staff").single();
      if (staffRes.data) {
        staff = staffRes.data.data;
      }
    } catch (e) {
      console.warn("Could not load staff data (row might not exist yet):", e);
    }

    // Fetch Categories
    let categories = null;
    try {
      const categoriesRes = await supabaseClient.from("pos_settings").select("data").eq("id", "categories").single();
      if (categoriesRes.data) {
        categories = categoriesRes.data.data;
      }
    } catch (e) {
      console.warn("Could not load categories data (row might not exist yet):", e);
    }
    
    // Fetch Tables
    const tablesRes = await supabaseClient.from("pos_tables").select("*").order("num", { ascending: true });
    let tables = null;
    if (tablesRes.data && tablesRes.data.length > 0) {
      tables = tablesRes.data.map(t => ({
        id: t.id,
        num: (t.num === 9999 || t.id === "takeaway") ? "Takeaway" : t.num,
        capacity: t.capacity,
        status: t.status,
        waiter: t.waiter || "",
        splits: t.splits,
        activeSplit: t.active_split
      }));
    }
    
    // Fetch Menu
    const menuRes = await supabaseClient.from("pos_menu").select("*");
    let menuItems = null;
    if (menuRes.data && menuRes.data.length > 0) {
      menuItems = menuRes.data.map(m => ({
        id: m.id,
        cat: m.cat,
        name: m.name,
        desc: m.desc_text || "",
        price: parseFloat(m.price),
        veg: m.veg,
        available: m.available,
        stock: m.stock,
        img: m.img || ""
      }));
    }
    
    // Fetch Orders
    const ordersRes = await supabaseClient.from("pos_orders").select("*").order("ts", { ascending: true });
    let orders = null;
    if (ordersRes.data) {
      orders = ordersRes.data.map(o => ({
        id: o.id,
        ts: parseInt(o.ts),
        tableNum: o.table_num === 9999 ? "Takeaway" : o.table_num,
        waiter: o.waiter || "",
        splitLabel: o.split_label,
        split: o.split,
        totals: o.totals,
        payment: o.payment
      }));
    }
    
    // Fetch Reservations
    const resRes = await supabaseClient.from("pos_reservations").select("*").order("ts", { ascending: true });
    let reservations = null;
    if (resRes.data) {
      reservations = resRes.data.map(r => ({
        id: r.id,
        ts: parseInt(r.ts),
        name: r.name,
        party: r.party,
        phone: r.phone || "",
        note: r.note || "",
        tableNum: r.table_num === 9999 ? "Takeaway" : r.table_num,
        status: r.status
      }));
    }
    
    // Fetch Customers
    const custRes = await supabaseClient.from("pos_customers").select("*");
    let customers = null;
    if (custRes.data) {
      customers = custRes.data.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone || "",
        visits: c.visits,
        spent: parseFloat(c.spent),
        points: c.points,
        tier: c.tier,
        last: c.last || ""
      }));
    }
    
    return {
      settings,
      tables,
      menuItems,
      categories,
      orders,
      reservations,
      customers,
      staff
    };
  } catch (err) {
    console.error("Failed to fetch state from Supabase:", err);
    return null;
  }
}

// Push state changes to Supabase
async function pushStateToSupabase(state) {
  if (!supabaseClient) return;
  try {
    const { settings, tables, menuItems, categories, orders, reservations, customers, staff } = state;
    
    // Sync Settings
    if (settings) {
      await supabaseClient.from("pos_settings").upsert([{ id: "global", data: settings }]);
    }

    // Sync Staff
    if (staff) {
      await supabaseClient.from("pos_settings").upsert([{ id: "staff", data: staff }]);
    }
    
    // Sync Categories
    if (categories) {
      await supabaseClient.from("pos_settings").upsert([{ id: "categories", data: categories }]);
    }
    
    // Sync Tables
    if (tables && tables.length > 0) {
      const dbTables = tables
        .map(t => ({
          id: t.id,
          num: (t.id === "takeaway" || t.num === "Takeaway") ? 9999 : (typeof t.num === "number" ? t.num : parseInt(t.num) || 0),
          capacity: t.capacity,
          status: t.status,
          waiter: t.waiter || null,
          splits: t.splits,
          active_split: t.activeSplit
        }));
      await supabaseClient.from("pos_tables").upsert(dbTables);
      
      // Delete any table rows from Supabase that are no longer in the local tables array.
      // This is critical when tableCount is reduced — without this, old rows persist and get pulled back.
      // Two-pronged approach: delete by ID and by num range for maximum reliability.
      try {
        const currentIds = tables.map(t => t.id);
        const tableCount = settings?.tableCount || 0;
        
        // 1. Delete by num range: remove all physical tables with num > tableCount
        if (tableCount > 0) {
          await supabaseClient.from("pos_tables").delete()
            .gt("num", tableCount)
            .neq("num", 9999); // don't delete takeaway
        }
        
        // 2. Delete by ID: remove any rows whose id isn't in the local set
        const { data: remoteTables } = await supabaseClient.from("pos_tables").select("id");
        if (remoteTables) {
          const orphanIds = remoteTables.map(r => r.id).filter(id => !currentIds.includes(id));
          if (orphanIds.length > 0) {
            await supabaseClient.from("pos_tables").delete().in("id", orphanIds);
            console.log("Deleted orphaned table rows from Supabase:", orphanIds);
          }
        }
      } catch (delErr) {
        console.warn("Failed to clean up orphaned tables:", delErr);
      }
    }
    
    // Sync Menu Items
    if (menuItems && menuItems.length > 0) {
      const dbMenu = menuItems.map(m => ({
        id: m.id,
        cat: m.cat,
        name: m.name,
        desc_text: m.desc || null,
        price: m.price,
        veg: m.veg,
        available: m.available,
        stock: m.stock,
        img: m.img || null
      }));
      await supabaseClient.from("pos_menu").upsert(dbMenu);
    }
    
    // Sync Orders
    if (orders && orders.length > 0) {
      const dbOrders = orders.map(o => ({
        id: o.id,
        ts: o.ts,
        table_num: o.tableNum === "Takeaway" ? 9999 : (typeof o.tableNum === "number" ? o.tableNum : parseInt(o.tableNum) || 0),
        waiter: o.waiter || null,
        split_label: o.splitLabel,
        split: o.split,
        totals: o.totals,
        payment: o.payment
      }));
      await supabaseClient.from("pos_orders").upsert(dbOrders);
    }
    
    // Sync Reservations
    if (reservations && reservations.length > 0) {
      const dbRes = reservations.map(r => ({
        id: r.id,
        ts: r.ts,
        name: r.name,
        party: r.party,
        phone: r.phone || null,
        note: r.note || null,
        table_num: r.tableNum === "Takeaway" ? 9999 : (typeof r.tableNum === "number" ? r.tableNum : parseInt(r.tableNum) || null),
        status: r.status
      }));
      await supabaseClient.from("pos_reservations").upsert(dbRes);
    }
    
    // Sync Customers
    if (customers && customers.length > 0) {
      const dbCust = customers.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone || null,
        visits: c.visits,
        spent: c.spent,
        points: c.points,
        tier: c.tier,
        last: c.last || null
      }));
      await supabaseClient.from("pos_customers").upsert(dbCust);
    }
    
    console.log("Supabase sync completed successfully.");
  } catch (err) {
    console.error("Failed to sync state to Supabase:", err);
  }
}

// Initialize on page load
initSupabase();

// Export variables to window
Object.assign(window, {
  supabaseClient,
  getSupabaseConfig,
  initSupabase,
  testSupabaseConnection,
  fetchSupabaseState,
  pushStateToSupabase
});
