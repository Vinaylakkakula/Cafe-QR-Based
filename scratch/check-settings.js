const url = "https://hjambctdtlitkqmyldnu.supabase.co/rest/v1";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYW1iY3RkdGxpdGtxbXlsZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDU0MjcsImV4cCI6MjEwMDIyMTQyN30.3nzkPQSLZKUfcTmA_X_TQ9z8q8o0FIcTBJJQLUyeCtI";

async function querySettings() {
  try {
    const res = await fetch(`${url}/pos_settings?id=eq.global`, {
      headers: {
        "apikey": key,
        "Authorization": "Bearer " + key
      }
    });
    const data = await res.json();
    console.log("Global Settings in DB:", JSON.stringify(data, null, 2));

    const tablesRes = await fetch(`${url}/pos_tables`, {
      headers: {
        "apikey": key,
        "Authorization": "Bearer " + key
      }
    });
    const tablesData = await tablesRes.json();
    console.log(`Total Tables in DB: ${tablesData.length}`);
    console.log("Tables in DB:", tablesData.map(t => ({ id: t.id, num: t.num })));
  } catch (err) {
    console.error("Error querying settings:", err);
  }
}

querySettings();
