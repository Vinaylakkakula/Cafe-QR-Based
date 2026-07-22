const url = "https://hjambctdtlitkqmyldnu.supabase.co/rest/v1";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYW1iY3RkdGxpdGtxbXlsZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDU0MjcsImV4cCI6MjEwMDIyMTQyN30.3nzkPQSLZKUfcTmA_X_TQ9z8q8o0FIcTBJJQLUyeCtI";

async function testTable(tableName) {
  try {
    const res = await fetch(`${url}/${tableName}?select=*&limit=1`, {
      headers: {
        "apikey": key,
        "Authorization": "Bearer " + key
      }
    });
    console.log(`Table: ${tableName} | Status: ${res.status}`);
    const data = await res.json();
    console.log(`Response:`, JSON.stringify(data).slice(0, 300));
  } catch (err) {
    console.error(`Error testing table ${tableName}:`, err);
  }
}

async function checkAll() {
  await testTable("pos_settings");
  await testTable("pos_tables");
  await testTable("pos_menu");
  await testTable("pos_orders");
  await testTable("pos_reservations");
  await testTable("pos_customers");
}

checkAll();
