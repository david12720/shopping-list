# רשימת קניות - Shopping List

A real-time family shopping list web app with Hebrew RTL interface.

**Live:** https://david12720.github.io/shopping-list/

## Features

- **Google Sign-in** — secure personal identification
- **Shared Groups** — create a group and invite family members via code
- **Shared real-time list** — everyone in the group sees changes instantly
- **65+ Israeli grocery products** organized in 8 categories
- **Dynamic "Most Purchased"** — automatically tracks and sorts frequently bought items based on group history
- **AI Vision, Voice & Text** — upload a recipe photo, speak, or type (e.g., "3kg tomatoes and milk"). AI parses items into a review list where you can verify amounts and assign categories before adding.
- **Inline quantity selection** — adjust amount and unit directly in the catalog
- **Instant feedback** — toast notifications confirm item additions
- **Editable catalog** — add, edit, or remove products from any device
- **Custom items** — add your own products, saved to the shared catalog
- **Mark as purchased** — check off items while shopping (strikethrough + moved to bottom)
- **Hebrew RTL** interface, mobile-first design
- **Connection indicator** — green/red dot shows sync status

## Tech Stack

- HTML / CSS / JavaScript (no frameworks)
- Firebase Realtime Database & Authentication
- GitHub Pages hosting

## Firebase Setup for Deployment

If you are deploying this app to your own domain (e.g., GitHub Pages), you **must** authorize the domain in Firebase to allow Google Sign-in:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Authentication** > **Settings** (or Sign-in method) > **Authorized domains**
3. Click **Add domain** and enter your domain (e.g., `yourusername.github.io`)
4. Ensure the **Google** provider is enabled under the **Sign-in method** tab.

## Usage

1. Open the app and **Sign in with Google**
2. **Create a new group** or **Join an existing one** using an invite code
3. Tap the **"+"** floating action button to add items from the catalog, search, or create custom items
4. Use the **"הרשימה שלי"** tab to view and check off items while shopping
5. Access the **"תבנית שבועית"** tab to create a weekly template for recurring items
6. Share your group's **Invite Code** with family to collaborate on the same list
