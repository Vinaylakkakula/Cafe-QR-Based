const url = "https://hjambctdtlitkqmyldnu.supabase.co/rest/v1";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYW1iY3RkdGxpdGtxbXlsZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDU0MjcsImV4cCI6MjEwMDIyMTQyN30.3nzkPQSLZKUfcTmA_X_TQ9z8q8o0FIcTBJJQLUyeCtI";

async function verify() {
  try {
    const res = await fetch(`${url}/pos_settings`, {
      headers: { 
        "apikey": key,
        "Authorization": "Bearer " + key 
      }
    });
    const data = await res.json();
    console.log("Settings rows in DB:", data.map(d => ({ id: d.id, itemCount: Array.isArray(d.data) ? d.data.length : Object.keys(d.data).length })));
    console.log("Seeded Categories data in DB:", JSON.stringify(data.find(d => d.id === 'categories')?.data, null, 2));
  } catch (err) {
    console.error("Verification error:", err);
  }
}
verify();
