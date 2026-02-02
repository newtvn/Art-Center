# Admin Portal Implementation Plan: "The Curator's Ledger"

## 1. conceptual Overview
Moving beyond a static gallery, we will build **"The Curator's Ledger"**—an artist-facing portal that feels less like a CMS and more like a private sketchbook or registry.

**Core Philosophy**: The admin interface must not break immersion. It should feel like opening the back pages of the gazette or a private ledger where artists document their contributions.

---

## 2. Architecture & Tech Stack
To support user content (images, profiles) without managing complex server infrastructure, we will introduce a **Backend-as-a-Service (BaaS)**.

*   **Database & Auth**: **Supabase** (PostgreSQL) or **Firebase**.
    *   *Recommendation*: **Supabase** because it uses SQL (structured data for relational art/artist links) and has an excellent distinct "row-level security" model.
*   **Storage**: For hosting the high-res artwork images and artist profile photos.
*   **State Management**: **Pinia** (standard for Vue 3) to handle the logged-in artist's session and data.

---

## 3. Feature Breakdown

### Phase 1: Authentication ("The Gate")
*   **Sign Up / Application**: Artists apply for access.
*   **Login**: Simple email/password or magic link.
*   **Design**: A centered, minimal form on the parchment background. No "Sign in with Google" buttons—keep it strictly aesthetic (e.g., "Enter Credentials").

### Phase 2: The Dashboard ("The Registry")
*   **Overview**: A simple text-based list of the artist's current footprint.
    *   "You are currently exhibiting 4 works."
    *   "Member since 2026."
*   **Profile Management**:
    *   Edit Bio (Rich text or simple textarea).
    *   Update Profile Photo.
    *   Manage Social Links (Instagram, Website - as recently implemented).

### Phase 3: Artwork Management ("The Archive")
*   **Upload Interface**:
    *   Drag & drop zone for art images.
    *   **Visualizer Calibration**: A crucial feature. When uploading, the artist can test their art in the "Visualizer" to set the default *scale* ensuring it looks correct for users.
*   **Inventory List**:
    *   Table view of works (Title, Year, Price, Status).
    *   Actions: Archive (hide), Delete, Edit.

---

## 4. Visual Language & UX
The most important requirement is consistency.

*   **Background**: Same "Old Gazette" parchment with cracks/noise.
*   **Containers**: Instead of white cards/shadows, use **thick borders** (outline style) and **monospaced fonts** (Courier or Space Mono) for input fields to mimic a typewriter or form filling.
*   **Inputs**: Transparent backgrounds with bottom borders only (`border-b border-black`).
*   **Buttons**: Text-based or simple geometric outlines. "SUBMIT" "ERASE".
*   **Feedback**: Toast notifications should look like stamped notes on the paper.

## 5. Data Structure Changes
We will migrate from `data.js` to a real database schema.

**Table: `artists`**
*   `id` (UUID)
*   `name` (Text)
*   `bio` (Text)
*   `specialty` (Text)
*   `socials` (JSONB: { instagram, website })

**Table: `artworks`**
*   `id` (UUID)
*   `artist_id` (Foreign Key)
*   `title` (Text)
*   `image_url` (Text)
*   `price` (Number)
*   `dimensions` (Text)

## 6. Implementation Steps
1.  **Setup Supabase**: Create project, tables, and storage buckets.
2.  **Integrate Auth**: Build the Login/Signup views.
3.  **Profile Editor**: Connect the `ArtistDetail` view to live data.
4.  **Art Manager**: Build the upload pipeline.
5.  **Migration**: Move current static data (`data.js`) into the database.

---

*Written by Antigravity*
