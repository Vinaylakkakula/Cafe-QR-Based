// ── Fix QR Base URL in Supabase ──────────────────────────────────────────────
// This script updates the qrBaseUrl setting in your Supabase database
// so QR codes point to your production Vercel URL instead of preview URLs.

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://hjambctdtlitkqmyldnu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYW1iY3RkdGxpdGtxbXlsZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDU0MjcsImV4cCI6MjEwMDIyMTQyN30.3nzkPQSLZKUfcTmA_X_TQ9z8q8o0FIcTBJJQLUyeCtI";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixQrBaseUrl() {
  console.log("Fetching current settings...");
  
  const { data, error } = await supabase
    .from("pos_settings")
    .select("data")
    .eq("id", "global")
    .single();

  if (error) {
    console.error("Error fetching settings:", error);
    return;
  }

  console.log("Current qrBaseUrl:", data.data.qrBaseUrl || "(empty - using window.location)");

  // Update the qrBaseUrl to the production Vercel URL
  const updatedData = {
    ...data.data,
    qrBaseUrl: "https://darbarstreet.vercel.app/"
  };

  const { error: updateError } = await supabase
    .from("pos_settings")
    .update({ data: updatedData })
    .eq("id", "global");

  if (updateError) {
    console.error("Error updating settings:", updateError);
    return;
  }

  console.log("✅ qrBaseUrl updated to: https://darbarstreet.vercel.app/");
  console.log("QR codes will now point to: https://darbarstreet.vercel.app/customer-order.html?table=X");
  console.log("\nPlease refresh your POS page to see the change.");
}

fixQrBaseUrl();
