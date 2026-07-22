const { createClient } = require("@supabase/supabase-js");
const webpush = require("web-push");

// Supabase config (hardcoded to match your project config for zero-setup deployment)
const SUPABASE_URL = "https://hjambctdtlitkqmyldnu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYW1iY3RkdGxpdGtxbXlsZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDU0MjcsImV4cCI6MjEwMDIyMTQyN30.3nzkPQSLZKUfcTmA_X_TQ9z8q8o0FIcTBJJQLUyeCtI";

// VAPID keys generated for your project
const VAPID_PUBLIC_KEY = "BH1rM8SgGALXWgez8o05tC0QILQLycQtL6gU321h5voMKwlmHVVp5dW1r_qy6-6dK6nDGqsImq-NCoT6qjs1dPQ";
const VAPID_PRIVATE_KEY = "Sboo3MHHbqXSmVctBdnpsTEQy3OBi_E4pwaLmkuP3ug";

webpush.setVapidDetails(
  "mailto:support@darbarstreet.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

module.exports = async (req, res) => {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = req.body;
    
    // Check if the payload comes from a Supabase insert webhook
    const newOrder = payload.record;
    if (!newOrder || newOrder.status !== "pending") {
      return res.status(200).json({ status: "ignored", reason: "Order is not pending" });
    }

    // Initialize Supabase Client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Fetch all active device push subscriptions
    const { data: subs, error } = await supabase
      .from("pos_push_subscriptions")
      .select("*");

    if (error) {
      console.error("Failed to query push subscriptions:", error);
      return res.status(500).json({ error: "Database error querying subscriptions" });
    }

    if (!subs || subs.length === 0) {
      return res.status(200).json({ status: "success", pushedCount: 0, reason: "No active subscriptions found" });
    }

    // Build the push payload matching client expectations in sw.js
    const pushPayload = JSON.stringify({
      title: `🔔 New QR Order — Table T${newOrder.table_num}`,
      body: `A new order has been placed for ₹${parseFloat(newOrder.total).toFixed(2)}.`,
      tag: `qr-order-${newOrder.id}`,
      data: { orderId: newOrder.id, tableNum: newOrder.table_num }
    });

    // Send push payload to all registered devices
    const promises = subs.map((sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };
      return webpush.sendNotification(pushSubscription, pushPayload)
        .catch((err) => {
          // If subscription is expired or unsubscribed, delete it from database
          if (err.statusCode === 410 || err.statusCode === 404) {
            return supabase
              .from("pos_push_subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint)
              .then(() => console.log(`Cleaned up expired subscription: ${sub.endpoint}`));
          }
          console.error("Error sending push notification to endpoint:", sub.endpoint, err);
        });
    });

    await Promise.all(promises);

    return res.status(200).json({ status: "success", pushedCount: subs.length });
  } catch (err) {
    console.error("Webhook function failed:", err);
    return res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
};
