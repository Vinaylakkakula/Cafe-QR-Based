# Vinay Cafe - Point of Sale (POS)

A beautiful, premium Restaurant Point of Sale application customized with Indian Rupee (₹) currency, renamed as **Vinay Cafe**, and integrated with a Supabase database.

## 🚀 Key Customizations

1. **Renamed Header**: The restaurant is named **Vinay Cafe** globally (default setting and `<title>` tag).
2. **Currency Change**: All pricing, invoice totals, payments, and stats have been updated from `$` to Indian Rupee (`₹`).
3. **Database Integration**: Fully integrated with Supabase for real-time cloud data storage (settings, table layouts, menu items, orders, reservations, and customer records).
4. **Vercel Ready**: Clean structure for deploying the static website directly to Vercel.

---

## 🔌 Supabase Database Setup

Follow these steps to connect your cloud database:

1. **Create a Supabase Project**: Go to [Supabase](https://supabase.com) and create a new project.
2. **Run SQL Schema**: Copy the SQL statements from [schema.sql](file:///c:/Users/vinay/Downloads/POS-Resturent/schema.sql) and run them in the **SQL Editor** of your Supabase project. This creates all the necessary tables.
3. **Configure POS Settings**:
   - Open your deployed Vinay Cafe app or load the local `POS.html` in your browser.
   - Click the **Settings** icon on the left sidebar.
   - Scroll down to the **Supabase Database Integration** section.
   - Enter your **Supabase URL** and **Supabase Anon Key** (found in Project Settings -> API in your Supabase dashboard).
   - Click **Connect & Sync**. The application will instantly synchronize all data with the database.

---

## 🌐 Vercel Deployment

You can deploy either the single-file bundled app or the unpacked clean version.

### Option 1: Deploy Unpacked Folder (Recommended)
This deploys the separate assets (CSS, JS, fonts, images) natively, resulting in faster page loads:
1. Sign in to [Vercel](https://vercel.com).
2. Create a new project.
3. Link your git repository containing this folder or deploy using Vercel CLI:
   ```bash
   npm install -g vercel
   vercel ./unpacked
   ```

### Option 2: Deploy Single File
If you want to host the single-file `POS.html` version:
1. Simply upload the `POS.html` file to a repository and rename it to `index.html` (or configure Vercel routing).
2. Vercel will serve it as a single static HTML page.
