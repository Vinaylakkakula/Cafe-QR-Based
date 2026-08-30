const url = "https://hjambctdtlitkqmyldnu.supabase.co/rest/v1";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYW1iY3RkdGxpdGtxbXlsZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDU0MjcsImV4cCI6MjEwMDIyMTQyN30.3nzkPQSLZKUfcTmA_X_TQ9z8q8o0FIcTBJJQLUyeCtI";

async function queryAllMenu() {
  try {
    const res = await fetch(`${url}/pos_menu?select=*`, {
      headers: {
        "apikey": key,
        "Authorization": "Bearer " + key
      }
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log(`Total items in database: ${data.length}`);
    const categories = [...new Set(data.map(item => item.cat))];
    console.log(`Unique categories in database:`, categories);
    console.log(`Items:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error querying menu:", err);
  }
}

queryAllMenu();
