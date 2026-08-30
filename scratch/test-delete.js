const url = "https://hjambctdtlitkqmyldnu.supabase.co/rest/v1";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYW1iY3RkdGxpdGtxbXlsZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDU0MjcsImV4cCI6MjEwMDIyMTQyN30.3nzkPQSLZKUfcTmA_X_TQ9z8q8o0FIcTBJJQLUyeCtI";

async function testDelete() {
  try {
    // We try to perform a delete for table numbers > 10
    const res = await fetch(`${url}/pos_tables?num=gt.10&num=neq.9999`, {
      method: "DELETE",
      headers: {
        "apikey": key,
        "Authorization": "Bearer " + key,
        "Prefer": "return=representation"
      }
    });
    console.log(`Delete Status: ${res.status}`);
    const data = await res.json();
    console.log(`Deleted rows data:`, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error performing delete:", err);
  }
}

testDelete();
