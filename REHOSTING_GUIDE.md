# King Subscriptions - Rehosting & Setup Guide

This guide provides a complete walkthrough for setting up, running, and deploying the King Subscriptions website.

## Prerequisites

1.  **Node.js**: Ensure you have Node.js installed (v18 or higher recommended).
2.  **Supabase Account**: You need a Supabase project for the database and authentication.
3.  **Git**: For version control.

## 1. Environment Setup

Create a `.env` file in the root directory (or rename `.env.example` if available) and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. Database Setup

We have consolidated all necessary SQL queries into a single file: `COMPLETE_SETUP_QUERIES.sql`.

1.  Log in to your **Supabase Dashboard**.
2.  Go to the **SQL Editor**.
3.  Open `COMPLETE_SETUP_QUERIES.sql` from this repository.
4.  Copy the entire content of the file.
5.  Paste it into the Supabase SQL Editor.
6.  **Run** the query.

This script will:
*   Enable Row Level Security (RLS) for all tables.
*   Create necessary RLS policies for security.
*   **Populate the database** with the complete list of products (ChatGPT Plus, Netflix, etc.) with their correct details, prices, and image paths.

## 3. Local Development

To run the application locally:

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the development server:
    ```bash
    npm run dev
    ```

3.  Open your browser and navigate to the URL shown (usually `http://localhost:5173`).

## 4. Deployment

### Vercel (Recommended)

1.  Push your code to a GitHub repository.
2.  Log in to [Vercel](https://vercel.com) and "Add New Project".
3.  Import your GitHub repository.
4.  In the **Environment Variables** section, add:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
5.  Click **Deploy**.

### Netlify

1.  Push your code to GitHub.
2.  Log in to [Netlify](https://netlify.com) and "New site from Git".
3.  Connect your repository.
4.  In **Site settings > Build & deploy > Environment**, add your Supabase variables.
5.  Deploy the site.

## 5. Troubleshooting

*   **Images not showing**: Ensure the `public/images/products` folder contains all the product images. The database setup script points to these paths (e.g., `/images/products/chatgpt-plus.png`).
*   **Database errors**: If you see permission errors, verify that the RLS policies in `COMPLETE_SETUP_QUERIES.sql` were applied correctly.

---

**Repository Structure:**
*   `src/`: Source code for the React application.
*   `public/`: Static assets (images, icons).
*   `COMPLETE_SETUP_QUERIES.sql`: Master SQL script for database initialization.
