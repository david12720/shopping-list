# Shopping List App

A Hebrew shopping list application with real-time synchronization via Firebase, built with vanilla JavaScript and no build tooling.

## Overview

- **Language**: Hebrew (RTL layout)
- **Tech Stack**: Vanilla JavaScript, Firebase Realtime Database, HTML5, CSS3
- **Architecture**: Flat structure, no build step — open `index.html` directly in browser
- **State**: Real-time synced across clients via Firebase (Google Sign-in + Shared Groups)

## Features

- ✅ Google Sign-in for user identification
- ✅ Create and join shared shopping groups via invite codes
- ✅ Add items to shopping list with custom amounts and units (units / kg)
- ✅ Edit item amounts directly from the list
- ✅ Mark items as purchased (strikethrough)
- ✅ Delete individual items or clear entire list
- ✅ Manage product catalog (add, edit, remove products)
- ✅ Search catalog by product name
- ✅ Add custom products with category selection
- ✅ Frequently-bought suggestions
- ✅ Real-time sync across multiple clients
- ✅ Responsive design (mobile-first)

## File Structure

```
shopping-list/
├── index.html          # HTML markup (modals, tabs, forms)
├── app.js              # Main application logic (Firebase listeners, event handlers)
├── utils.js            # Pure utility functions (formatUnit, formatAmount)
├── style.css           # Responsive styling (RTL support)
├── package.json        # Dev dependencies (Jest)
├── utils.test.js       # Unit tests for utilities
├── CLAUDE.md           # This file
└── README.md           # User-facing documentation
```

## Setup

### Running the App

1. Open `index.html` directly in a web browser
2. No server or build step required

### Running Tests

1. Install dependencies: `npm install`
2. Run tests: `npm test`

### Firebase Configuration

The app uses the following Firebase project:
- **Project ID**: `shopping-list-b2681`
- **Database URL**: `https://shopping-list-b2681-default-rtdb.firebaseio.com`

The configuration is hardcoded in `app.js` (lines 2-11) for simplicity.

**Important for Authentication:**
To allow Google Sign-in on a live domain (like GitHub Pages):
1. In the Firebase Console, go to **Authentication > Settings > Authorized domains**
2. Click **Add domain** and enter the live URL (e.g., `david12720.github.io`).
3. Ensure the **Google** provider is enabled under **Authentication > Sign-in method**.

## Architecture Notes

### Components

**index.html**
- Defines semantic structure with tabs (Shopping List / Add Products)
- Two primary modals: Amount selection (add/edit items) and Edit Product
- Custom form for adding items to catalog

**app.js**
- Firebase listeners for real-time data sync
- Event delegation for list and catalog interactions
- Modal state management (add vs. edit modes)
- Data persistence via `saveShoppingList()` and `saveCatalog()`

**utils.js**
- Pure, testable functions: `formatUnit(unit)`, `formatAmount(amount, unit)`
- Browser-compatible module pattern (window.AppUtils)
- Also exports for Jest/Node.js

**style.css**
- CSS variables for theming
- RTL (right-to-left) support via `dir="rtl"` on `<html>`
- Mobile-first responsive design
- Hover states and transitions for interactivity

### Data Model

**Shopping List Item**
```javascript
{
  id: string,                // "item_" + timestamp
  name: string,              // Product name
  category: string,          // Product category
  unit: "units" | "kg",      // Unit of measurement
  amount: number,            // Quantity
  purchased: boolean         // Checked status
}
```

**Catalog Product**
```javascript
{
  id: string,                // "v1", "p_" + timestamp for custom
  name: string,              // Product name
  category: string,          // Product category
  defaultUnit: "units" | "kg" // Default unit when added
}
```

### Firebase Structure

**New Structure (Multi-tenant with Groups)**
```
/users/{uid}:
  name: "David"
  groupId: "grp_abc123"

/groups/{groupId}:
  name: "המשפחה שלי"
  ownerId: "{uid}"
  inviteCode: "ABC123"
  shoppingList: [...]
  catalog: [...]
  members:
    {uid1}: { name, photoURL, role: "owner" }
    {uid2}: { name, photoURL, role: "member" }

/invites/{inviteCode}: "{groupId}"
```

## Development Notes

### Adding Features

1. **New List Actions**: Update `renderListItem()` and add handler in the `els.shoppingList` click listener
2. **New Catalog Features**: Modify `renderCatalog()` and add handler in the `els.catalog` click listener
3. **New Modal**: Create modal HTML in `index.html`, add state/handlers in `app.js`
4. **Styling**: Add CSS to `style.css` (use CSS variables for colors)

### Code Style

- Use event delegation for dynamic content
- Separate pure functions (utils.js) from side-effect code (app.js)
- Use `els` object for DOM references
- Prefer clear variable names over comments
- Keep Firebase interactions in dedicated functions

### Testing

- Test pure functions in `utils.test.js`
- Integration testing requires manual browser testing (Firebase listeners, DOM state)
- Mock Firebase by overriding `shoppingList` and `catalog` globals for DOM-related tests

## Deployment

The app can be deployed to any static hosting:
- Firebase Hosting (easiest)
- GitHub Pages
- Netlify
- Vercel
- Any web server (just serve the static files)

## Browser Support

- Modern browsers with ES6 support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Future Enhancements

- 🔄 Offline mode (localStorage fallback)
- 👥 Multi-user support with user identification
- 💾 Export/import lists
- 📅 Recurring shopping lists
- 🔔 Quantity alerts
- 🏷️ Price tracking
