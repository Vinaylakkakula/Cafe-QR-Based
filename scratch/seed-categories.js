const url = "https://hjambctdtlitkqmyldnu.supabase.co/rest/v1";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYW1iY3RkdGxpdGtxbXlsZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDU0MjcsImV4cCI6MjEwMDIyMTQyN30.3nzkPQSLZKUfcTmA_X_TQ9z8q8o0FIcTBJJQLUyeCtI";

const categories = [
  { id: "veg", name: "Veg", icon: "🥬" },
  { id: "egg", name: "Egg", icon: "🥚" },
  { id: "chicken", name: "Chicken", icon: "🍗" },
  { id: "starters", name: "Starters", icon: "🥗" },
  { id: "water", name: "Water", icon: "🥤" },
  { id: "water_bottle_500_ml", name: "Water Bottles", icon: "🧴" }
];

async function seedCategories() {
  try {
    const res = await fetch(`${url}/pos_settings`, {
      method: "POST",
      headers: {
        "apikey": key,
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify({
        id: "categories",
        data: categories
      })
    });
    console.log(`Seed Status: ${res.status}`);
    if (res.ok) {
      console.log("Successfully seeded categories list in Supabase!");
    } else {
      const text = await res.text();
      console.error("Failed to seed categories:", text);
    }
  } catch (err) {
    console.error("Error seeding categories:", err);
  }
}

seedCategories();
