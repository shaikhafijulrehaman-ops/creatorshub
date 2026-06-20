# Deploying Creators Hub to Render

This guide explains how to connect and deploy the **Creators Hub** project on [Render](https://render.com/).

Since Creators Hub is a Single Page Application (SPA) built with Vite, React, and Supabase, we configure it as a **Static Site** on Render. This provides high-performance global CDN hosting, automatic builds, and SSL for free.

---

## Method 1: Deploying via Render Blueprint (Recommended & Zero-Config)

We have created a `render.yaml` blueprint file in the root of the project. Render reads this file to automatically configure the build commands, publish directory, routing, and environment variables.

### Steps:

1. **Push your code** to a GitHub or GitLab repository.
2. Log in to the [Render Dashboard](https://dashboard.render.com/).
3. Click on **New** (top right) and select **Blueprint**.
4. Connect your Git repository.
5. Render will automatically detect the `render.yaml` file and show the configuration:
   - **Service Name**: `creators-hub`
   - **Service Type**: `Static Site`
   - **Required Environment Variables**:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
6. Fill in the values for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (you can find these in your Supabase project settings under API).
7. Click **Apply**.
8. Render will build and deploy your site automatically!

---

## Method 2: Manual Deployment as a Static Site

If you prefer not to use the Blueprint, you can deploy manually using these settings:

### Steps:

1. Go to the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Static Site**.
3. Connect your Git repository.
4. Set the following configuration options:
   - **Name**: `creators-hub`
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Click **Advanced** to add environment variables:
   - Add `VITE_SUPABASE_URL` with your Supabase URL.
   - Add `VITE_SUPABASE_ANON_KEY` with your Supabase Anon Key.
6. Click **Create Static Site**.

### Crucial Step: Configuring SPA Routing (Redirects/Rewrites)
Since this is a React Router SPA, direct navigation to subpages (like `/dashboard` or `/messaging`) will return a 404 error unless rewrite rules are configured.

If deploying manually, you must add a redirect/rewrite rule:
1. Go to your Static Site in the Render Dashboard.
2. In the sidebar, click on **Redirects/Rewrites**.
3. Click **Add Rule** and enter:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
4. Save the rule.

*(Note: This redirect rule is automatically configured for you if you use **Method 1 (Blueprint)**).*

---

## Verifying the Deployment

Once the build finishes:
1. Render will provide you with a URL (e.g., `https://creators-hub.onrender.com`).
2. Open the URL and verify that the application loads and routes work correctly.
3. Open your browser developer console to ensure there are no Supabase connection or CORS errors.
