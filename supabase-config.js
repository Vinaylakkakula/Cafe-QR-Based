// ── supabase-config.js ───────────────────────────────────────────────────────
// Shared Supabase credentials for both the POS dashboard and customer-order page.
// 
// If you are deploying this app (e.g. on Vercel), hardcode your credentials here
// so customers can access the menu and submit orders directly from their phones.
// ─────────────────────────────────────────────────────────────────────────────

window.SUPABASE_CONFIG = {
  // Replace these with your actual Supabase credentials for production deployment:
  url: localStorage.getItem("https://ytpdutdcoajyxegypkkv.supabase.co") || "",
  key: localStorage.getItem("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0cGR1dGRjb2FqeXhlZ3lwa2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NzA3NDcsImV4cCI6MjA5NjE0Njc0N30.fLJsMeQuHka4ntoMwwJ1jGrYWKAgXEdBsVR1WGaqu70") || ""
};
