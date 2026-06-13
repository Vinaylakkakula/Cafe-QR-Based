// Seed data and helpers
// Fallback for window.__resources when not running in bundled mode
if (typeof window !== 'undefined' && !window.__resources) {
  window.__resources = new Proxy({}, {
    get(_, key) {
      if (key === 'hero') return "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=70";
      const m = String(key).match(/^img_(photo_.+)$/);
      if (m) return `https://images.unsplash.com/${m[1].replace(/_/g, '-')}?auto=format&fit=crop&w=400&q=70`;
      return undefined;
    }
  });
}

const DEFAULT_SETTINGS = {
  restaurantName: "Vinay Cafe",
  address: "214 Vine Street, Riverside\n+1 (415) 555-0184",
  taxId: "TIN 87-4429301",
  taxRate: 8.5,
  serviceChargeRate: 5,
  currency: "₹",
  cashierName: "Morgan Reyes",
  tipEnabled: true,
  serviceChargeEnabled: true,
  tableCount: 16,
  heroImage: window.__resources["hero"],
  themeColor: "amber",
  logoUrl: "",
  receiptHeader: "Thank you for dining with us!",
  receiptFooter: "Follow us on Instagram @yourcafe",
  qrNotificationSound: "loud",
};

const MENU_CATEGORIES = [
  { id: "starters", name: "Starters", icon: "🥗" },
  { id: "mains", name: "Mains", icon: "🍽" },
  { id: "grill", name: "From the Grill", icon: "🔥" },
  { id: "pasta", name: "Pasta", icon: "🍝" },
  { id: "sides", name: "Sides", icon: "🥔" },
  { id: "desserts", name: "Desserts", icon: "🍰" },
  { id: "drinks", name: "Drinks", icon: "🍷" },
  { id: "bakery", name: "Bakery", icon: "🥐" },
];

// Using Unsplash images (hotlinkable, no auth needed)
const IMG = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=70`;

const MENU_ITEMS = [
  // Starters
  { id: "m1", cat: "starters", name: "Charred Shishito Peppers", desc: "Flaked sea salt, smoked aioli, lemon", price: 12.00, veg: true, available: true, stock: 22, img: window.__resources["img_photo_1604909052743_94e838986d24"] },
  { id: "m2", cat: "starters", name: "Tuna Tartare", desc: "Yellowfin, avocado, crispy wonton, yuzu", price: 18.50, veg: false, available: true, stock: 8, img: window.__resources["img_photo_1615141982883_c7ad0e69fd62"] },
  { id: "m3", cat: "starters", name: "Burrata & Heirloom", desc: "Stracciatella, tomato, basil oil, sourdough", price: 16.00, veg: true, available: true, stock: 15, img: window.__resources["img_photo_1608897013039_887f21d8c804"] },
  { id: "m4", cat: "starters", name: "Crispy Calamari", desc: "Lemon, chili oil, black garlic aioli", price: 14.50, veg: false, available: true, stock: 18, img: window.__resources["img_photo_1604909052743_94e838986d24"] },
  { id: "m5", cat: "starters", name: "Beet Carpaccio", desc: "Whipped goat cheese, pistachio, orange", price: 13.00, veg: true, available: false, stock: 0, img: window.__resources["img_photo_1505253668822_42074d58a7c6"] },
  { id: "m6", cat: "starters", name: "Bone Marrow Toast", desc: "Roasted marrow, parsley gremolata, grilled sourdough", price: 17.00, veg: false, available: true, stock: 9, img: window.__resources["img_photo_1432139509613_5c4255815697"] },
  { id: "m7", cat: "starters", name: "Oysters on Ice", desc: "Half dozen, mignonette, cocktail, lemon", price: 24.00, veg: false, available: true, stock: 12, img: window.__resources["img_photo_1599021456807_25db0f974333"] },
  { id: "m8", cat: "starters", name: "Steak Tartare", desc: "Hand-cut filet, quail egg, capers, crostini", price: 19.50, veg: false, available: true, stock: 7, img: window.__resources["img_photo_1544025162_d76694265947"] },
  { id: "m9", cat: "starters", name: "Crispy Brussels Sprouts", desc: "Honey glaze, chili crunch, lime yogurt", price: 11.50, veg: true, available: true, stock: 20, img: window.__resources["img_photo_1580013759032_c96505e24c1f"] },
  { id: "m9b", cat: "starters", name: "French Onion Soup", desc: "Gruyère crust, thyme, caramelized onions", price: 13.50, veg: true, available: true, stock: 14, img: window.__resources["img_photo_1547592180_85f173990554"] },

  // Mains
  { id: "m10", cat: "mains", name: "Pan-Seared Halibut", desc: "Corn puree, chanterelles, brown butter", price: 34.00, veg: false, available: true, stock: 12, img: window.__resources["img_photo_1519708227418_c8fd9a32b7a2"] },
  { id: "m11", cat: "mains", name: "Roasted Duck Breast", desc: "Cherry gastrique, fennel, farro", price: 32.00, veg: false, available: true, stock: 10, img: window.__resources["img_photo_1544025162_d76694265947"] },
  { id: "m12", cat: "mains", name: "Wild Mushroom Risotto", desc: "Porcini, parmigiano, truffle oil", price: 26.00, veg: true, available: true, stock: 24, img: window.__resources["img_photo_1476124369491_e7addf5db371"] },
  { id: "m13", cat: "mains", name: "Miso Black Cod", desc: "Bok choy, jasmine rice, ginger scallion", price: 36.00, veg: false, available: true, stock: 6, img: window.__resources["img_photo_1467003909585_2f8a72700288"] },

  // Grill
  { id: "m20", cat: "grill", name: "Dry-Aged Ribeye 16oz", desc: "45-day aged, bone marrow butter", price: 58.00, veg: false, available: true, stock: 7, img: window.__resources["img_photo_1558030006_450675393462"] },
  { id: "m21", cat: "grill", name: "Filet Mignon 8oz", desc: "Red wine reduction, potato puree", price: 46.00, veg: false, available: true, stock: 9, img: window.__resources["img_photo_1432139509613_5c4255815697"] },
  { id: "m22", cat: "grill", name: "Lamb Chops", desc: "Rosemary, garlic confit, mint chimichurri", price: 42.00, veg: false, available: true, stock: 11, img: window.__resources["img_photo_1514516345957_556ca7d90a29"] },
  { id: "m23", cat: "grill", name: "Cauliflower Steak", desc: "Tahini, pomegranate, crispy chickpeas", price: 22.00, veg: true, available: true, stock: 16, img: window.__resources["img_photo_1568901346375_23c9450c58cd"] },
  { id: "m24", cat: "grill", name: "Tomahawk Steak 32oz", desc: "Bone-in prime, shared for two, roasted garlic", price: 98.00, veg: false, available: true, stock: 4, img: window.__resources["img_photo_1546964124_0cce460f38ef"] },
  { id: "m25", cat: "grill", name: "Grilled Octopus", desc: "Charred Spanish octopus, fingerling, salsa verde", price: 28.00, veg: false, available: true, stock: 8, img: window.__resources["img_photo_1579631542720_3a87824fff86"] },
  { id: "m26", cat: "grill", name: "BBQ Pork Ribs", desc: "Slow smoked, bourbon glaze, pickled slaw", price: 34.00, veg: false, available: true, stock: 10, img: window.__resources["img_photo_1544025162_d76694265947"] },
  { id: "m27", cat: "grill", name: "Portobello & Halloumi", desc: "Fire-grilled, chimichurri, grilled lemon", price: 19.50, veg: true, available: true, stock: 14, img: window.__resources["img_photo_1565299585323_38d6b0865b47"] },

  // Pasta
  { id: "m30", cat: "pasta", name: "Tagliatelle Bolognese", desc: "Slow-braised wagyu beef, parmigiano", price: 24.00, veg: false, available: true, stock: 20, img: window.__resources["img_photo_1621996346565_e3dbc646d9a9"] },
  { id: "m31", cat: "pasta", name: "Cacio e Pepe", desc: "Hand-cut tonnarelli, pecorino, black pepper", price: 20.00, veg: true, available: true, stock: 22, img: window.__resources["img_photo_1473093295043_cdd812d0e601"] },
  { id: "m32", cat: "pasta", name: "Lobster Ravioli", desc: "Maine lobster, saffron cream, chive oil", price: 32.00, veg: false, available: true, stock: 4, img: window.__resources["img_photo_1551183053_bf91a1d81141"] },

  // Sides
  { id: "m40", cat: "sides", name: "Truffle Fries", desc: "Parmesan, chive, truffle aioli", price: 10.00, veg: true, available: true, stock: 35, img: window.__resources["img_photo_1573080496219_bb080dd4f877"] },
  { id: "m41", cat: "sides", name: "Charred Broccolini", desc: "Garlic, chili flake, lemon", price: 9.00, veg: true, available: true, stock: 28, img: window.__resources["img_photo_1466637574441_749b8f19452f"] },
  { id: "m42", cat: "sides", name: "Creamed Spinach", desc: "Gruyere, nutmeg, crispy shallot", price: 11.00, veg: true, available: true, stock: 19, img: window.__resources["img_photo_1576402187878_974f70c890a5"] },
  { id: "m43", cat: "sides", name: "Mac & Cheese", desc: "Aged cheddar, gruyere, panko crust", price: 12.00, veg: true, available: true, stock: 14, img: window.__resources["img_photo_1543339308_43e59d6b73a6"] },

  // Desserts
  { id: "m50", cat: "desserts", name: "Dark Chocolate Torte", desc: "Salted caramel, vanilla gelato", price: 12.00, veg: true, available: true, stock: 10, img: window.__resources["img_photo_1606313564200_e75d5e30476c"] },
  { id: "m51", cat: "desserts", name: "Crème Brûlée", desc: "Madagascar vanilla, fresh berries", price: 11.00, veg: true, available: true, stock: 8, img: window.__resources["img_photo_1470124182917_cc6e71b22ecc"] },
  { id: "m52", cat: "desserts", name: "Affogato", desc: "Vanilla gelato, double espresso, amaretto", price: 10.00, veg: true, available: true, stock: 20, img: window.__resources["img_photo_1587314168485_3236d6710814"] },

  // Drinks
  { id: "m60", cat: "drinks", name: "House Old Fashioned", desc: "Bourbon, demerara, aromatic bitters", price: 16.00, veg: true, available: true, stock: 40, img: window.__resources["img_photo_1470337458703_46ad1756a187"] },
  { id: "m61", cat: "drinks", name: "Negroni", desc: "Gin, Campari, sweet vermouth", price: 15.00, veg: true, available: true, stock: 38, img: window.__resources["img_photo_1514362545857_3bc16c4c7d1b"] },
  { id: "m62", cat: "drinks", name: "Sparkling Water", desc: "San Pellegrino 750ml", price: 6.00, veg: true, available: true, stock: 50, img: window.__resources["img_photo_1523362628745_0c100150b504"] },
  { id: "m63", cat: "drinks", name: "Cold Brew", desc: "House blend, 18-hour steep", price: 5.50, veg: true, available: true, stock: 30, img: window.__resources["img_photo_1461023058943_07fcbe16d735"] },
  { id: "m64", cat: "drinks", name: "Fresh Squeezed OJ", desc: "Valencia orange, daily press", price: 7.00, veg: true, available: true, stock: 25, img: window.__resources["img_photo_1613478223719_2ab802602423"] },

  // Bakery Category Items
  { id: "b1", cat: "bakery", name: "Egg Puff", desc: "Crispy layered pastry stuffed with boiled egg and spiced masala", price: 20.00, veg: false, available: true, stock: 15, img: window.__resources["img_photo_1608686207856_001b95cf60ca"] },
  { id: "b2", cat: "bakery", name: "Chicken Puff", desc: "Flaky golden pastry filled with seasoned minced chicken", price: 25.00, veg: false, available: true, stock: 15, img: window.__resources["img_photo_1626379616459_b2ce1d9decbc"] },
  { id: "b3", cat: "bakery", name: "Vegetable Maggi Noodles", desc: "Classic Maggi noodles cooked with fresh mixed vegetables and spices", price: 35.00, veg: true, available: true, stock: 30, img: window.__resources["img_photo_1612966608967_312ba59910d0"] },
  { id: "b4", cat: "bakery", name: "Grilled Cheese Sandwich", desc: "Toasted bread loaded with melted cheddar and mozzarella cheese", price: 50.00, veg: true, available: true, stock: 20, img: window.__resources["img_photo_1509722747041_616f39b57569"] },
  { id: "b5", cat: "bakery", name: "Chicken Club Sandwich", desc: "Triple-layer sandwich with grilled chicken, egg, lettuce, and mayo", price: 70.00, veg: false, available: true, stock: 12, img: window.__resources["img_photo_1509722747041_616f39b57569"] },
  { id: "b6", cat: "bakery", name: "Classic Veg Burger", desc: "Crispy vegetable patty in a sesame bun with lettuce, tomato, and mayo", price: 60.00, veg: true, available: true, stock: 15, img: window.__resources["img_photo_1568901346375_23c9450c58cd"] },
  { id: "b7", cat: "bakery", name: "Paneer Tikka Pizza", desc: "Personal pizza topped with marinated paneer cubes, onions, capsicum, and cheese", price: 120.00, veg: true, available: true, stock: 10, img: window.__resources["img_photo_1513104890138-7c749659a591"] },
  { id: "b8", cat: "bakery", name: "Butter Croissant", desc: "Freshly baked, rich, and flaky French style croissant", price: 40.00, veg: true, available: true, stock: 18, img: window.__resources["img_photo_1555507036-ab1f4038808a"] },
  { id: "b9", cat: "bakery", name: "Premium Butter Biscuits", desc: "Sweet and salty melt-in-your-mouth bakery style butter biscuits", price: 30.00, veg: true, available: true, stock: 50, img: window.__resources["img_photo_1558030006_450675393462"] },
  { id: "b10", cat: "bakery", name: "Kit-Kat Chocolate Bar", desc: "Crisp wafer fingers covered in smooth milk chocolate", price: 25.00, veg: true, available: true, stock: 40, img: window.__resources["img_photo_1548907040-4d42b52125e0"] },
  { id: "b11", cat: "bakery", name: "Cadbury Dairy Milk", desc: "Classic rich, smooth, and creamy milk chocolate bar", price: 40.00, veg: true, available: true, stock: 45, img: window.__resources["img_photo_1548907040-4d42b52125e0"] },
  { id: "b12", cat: "bakery", name: "Red Velvet Cupcake", desc: "Soft red velvet cupcake topped with smooth cream cheese frosting", price: 35.00, veg: true, available: true, stock: 15, img: window.__resources["img_photo_1587314168485_3236d6710814"] },
  { id: "b13", cat: "bakery", name: "Signature Pastry with Flowers", desc: "Deliciously moist layer cake decorated with beautiful edible flowers", price: 85.00, veg: true, available: true, stock: 8, img: window.__resources["img_photo_1578985545062-69928b1d9587"] },
  { id: "b14", cat: "bakery", name: "Artisan Ice Cream with Flowers", desc: "Creamy gourmet ice cream served with colorful edible flowers", price: 95.00, veg: true, available: true, stock: 10, img: window.__resources["img_photo_1470124182917_cc6e71b22ecc"] },
  { id: "b15", cat: "bakery", name: "Mango Thick Shake", desc: "Rich and creamy thick shake blended with fresh Alphonso mango pulp", price: 80.00, veg: true, available: true, stock: 20, img: window.__resources["img_photo_1461023058943_07fcbe16d735"] },
  { id: "b16", cat: "bakery", name: "Chocolate Milkshake", desc: "Classic chilled milkshake made with dark chocolate syrup and vanilla ice cream", price: 70.00, veg: true, available: true, stock: 20, img: window.__resources["img_photo_1461023058943_07fcbe16d735"] },
  { id: "b17", cat: "bakery", name: "Red Bull Energy Drink", desc: "Chilled 250ml can of premium energy drink", price: 110.00, veg: true, available: true, stock: 25, img: window.__resources["img_photo_1523362628745_0c100150b504"] },
  { id: "b18", cat: "bakery", name: "Monster Energy Drink", desc: "Chilled 350ml can of original Monster energy drink", price: 110.00, veg: true, available: true, stock: 25, img: window.__resources["img_photo_1523362628745_0c100150b504"] },
  { id: "b19", cat: "bakery", name: "Thums Up", desc: "Chilled 300ml can of strong spicy cola", price: 30.00, veg: true, available: true, stock: 50, img: window.__resources["img_photo_1523362628745_0c100150b504"] },
  { id: "b20", cat: "bakery", name: "Coca-Cola", desc: "Chilled 300ml can of original classic Coca-Cola", price: 30.00, veg: true, available: true, stock: 50, img: window.__resources["img_photo_1523362628745_0c100150b504"] },
  { id: "b21", cat: "bakery", name: "Filter Coffee", desc: "Authentic hot South Indian filter coffee brewed with fresh milk", price: 20.00, veg: true, available: true, stock: 30, img: window.__resources["img_photo_1461023058943_07fcbe16d735"] },
  { id: "b22", cat: "bakery", name: "Masala Tea", desc: "Traditional Indian milk tea brewed with aromatic spices and ginger", price: 15.00, veg: true, available: true, stock: 35, img: window.__resources["img_photo_1461023058943_07fcbe16d735"] },
  { id: "b23", cat: "bakery", name: "Hot Boost Milk", desc: "Healthy warm milk mixed with chocolatey Boost energy drink powder", price: 30.00, veg: true, available: true, stock: 25, img: window.__resources["img_photo_1461023058943_07fcbe16d735"] },
  { id: "b24", cat: "bakery", name: "Hot Horlicks Milk", desc: "Nourishing hot milk mixed with classic malt Horlicks powder", price: 30.00, veg: true, available: true, stock: 25, img: window.__resources["img_photo_1461023058943_07fcbe16d735"] },
];

const WAITERS = ["Jamie Chen", "Priya Patel", "Marcus Webb", "Sofia Ruiz", "Theo Park", "Lena Osei"];

// Reservation seed — a few upcoming bookings through the evening
function seedReservations() {
  const today = new Date();
  const mk = (h, m, name, party, phone, note, tableNum) => {
    const d = new Date(today);
    d.setHours(h, m, 0, 0);
    return { id: uid("res"), ts: d.getTime(), name, party, phone, note, tableNum, status: "confirmed" };
  };
  const h = today.getHours();
  return [
    mk(h, Math.min(59, today.getMinutes() + 15), "Anderson, J", 4, "+1 415 555 0122", "Birthday — cake at end", null),
    mk(h + 1, 0, "Okafor Party", 6, "+1 415 555 0188", "Window seat requested", 8),
    mk(h + 1, 30, "Martinez, L", 2, "+1 415 555 0191", "Anniversary", null),
    mk(h + 2, 0, "Kim, S", 3, "+1 415 555 0145", "", null),
    mk(h + 2, 30, "Walsh & Co.", 8, "+1 415 555 0133", "Corporate dinner", null),
  ];
}

function seedCustomers() {
  return [
    { id: uid("cus"), name: "Ava Ramirez", phone: "+1 415 555 0180", visits: 14, spent: 842.50, points: 340, tier: "Gold", last: "2 days ago" },
    { id: uid("cus"), name: "Noah Patel", phone: "+1 415 555 0172", visits: 6, spent: 312.00, points: 124, tier: "Silver", last: "1 week ago" },
    { id: uid("cus"), name: "Emma Chen", phone: "+1 415 555 0164", visits: 22, spent: 1420.75, points: 568, tier: "Platinum", last: "Today" },
    { id: uid("cus"), name: "Liam O'Brien", phone: "+1 415 555 0198", visits: 3, spent: 156.50, points: 62, tier: "Bronze", last: "3 weeks ago" },
  ];
}

function uid(prefix = "id") {
  return prefix + "_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

function buildInitialTables(count) {
  const tables = [];
  const caps = [2, 2, 4, 4, 4, 6, 6, 8];
  for (let i = 1; i <= count; i++) {
    tables.push({
      id: `t${i}`,
      num: i,
      capacity: caps[(i - 1) % caps.length],
      status: "available",
      waiter: "",
      splits: [createSplit()],
      activeSplit: 0,
    });
  }
  if (tables[2]) { tables[2].status = "reserved"; }
  if (tables[6]) { tables[6].status = "reserved"; }
  return tables;
}

function createSplit(label = "Main") {
  return {
    id: "s" + Math.random().toString(36).slice(2, 8),
    label,
    items: [],
    taxRate: null,
    discount: { type: "flat", value: 0 },
    tip: 0,
    includeService: true,
    kotSent: false,
    courseStage: "new", // new | preparing | ready | served
  };
}

function formatMoney(amount, currency = "₹") {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  return sign + currency + abs.toFixed(2);
}
function formatTime(d) { return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }); }
function formatDate(d) { return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }); }
function formatDateTime(d) { return formatDate(d) + " • " + formatTime(d); }
function formatRelative(ts) {
  const diff = ts - Date.now();
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return (diff > 0 ? "in " : "") + mins + "m" + (diff > 0 ? "" : " ago");
  const h = Math.round(mins / 60);
  return (diff > 0 ? "in " : "") + h + "h" + (diff > 0 ? "" : " ago");
}

function getShift(d) {
  const h = d.getHours();
  if (h >= 5 && h < 11) return "Breakfast";
  if (h >= 11 && h < 16) return "Lunch";
  if (h >= 16 && h < 22) return "Dinner";
  return "Late Night";
}

function computeSplitTotals(split, settings) {
  const items = split.items || [];
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  let discountAmt = 0;
  if (split.discount.type === "flat") discountAmt = Math.min(subtotal, split.discount.value || 0);
  else discountAmt = subtotal * ((split.discount.value || 0) / 100);
  const afterDiscount = Math.max(0, subtotal - discountAmt);
  const taxRate = split.taxRate != null ? split.taxRate : settings.taxRate;
  const tax = afterDiscount * (taxRate / 100);
  const service = settings.serviceChargeEnabled && split.includeService
    ? afterDiscount * (settings.serviceChargeRate / 100)
    : 0;
  const tip = settings.tipEnabled ? (split.tip || 0) : 0;
  const grand = afterDiscount + tax + service + tip;
  return { subtotal, discountAmt, afterDiscount, tax, service, tip, grand, taxRate };
}

Object.assign(window, {
  DEFAULT_SETTINGS, MENU_CATEGORIES, MENU_ITEMS, WAITERS,
  buildInitialTables, createSplit, uid,
  formatMoney, formatTime, formatDate, formatDateTime, formatRelative, getShift,
  computeSplitTotals, seedReservations, seedCustomers,
});
