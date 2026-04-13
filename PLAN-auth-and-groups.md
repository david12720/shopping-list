# Plan: Google Sign-in + Group Shopping Lists

## Context
The shopping list app currently uses a single shared Firebase Realtime Database with no authentication — everyone sees the same list. The goal is to add:
1. **Google sign-in** — easiest auth, one click, free
2. **Groups** — a user can create a group and add members; each group shares one shopping list

## Database Restructure

### Current structure (flat, single-tenant)
```
/shoppingList: [...]
/catalog: [...]
```

### New structure (multi-tenant with groups)
```
/users/{uid}:
  name: "David"
  email: "david@gmail.com"
  photoURL: "https://..."
  groupId: "grp_abc123"

/groups/{groupId}:
  name: "המשפחה שלי"
  ownerId: "{uid}"
  inviteCode: "ABC123"
  shoppingList: [...]
  catalog: [...]
  members:
    {uid1}: { name, email, photoURL, role: "owner" }
    {uid2}: { name, email, photoURL, role: "member" }

/invites/{inviteCode}: "{groupId}"   ← lookup table for join-by-code
```

### Migration
On first load after update, if the old `/shoppingList` and `/catalog` paths still exist, the first user who signs in gets them migrated into their new group automatically. After migration, old paths are deleted.

## UX Flow

### Sign-in
1. App loads → check `firebase.auth().currentUser`
2. If not signed in → show login screen with **"התחבר עם Google"** button
3. On sign-in → check `/users/{uid}` in database

### First-time user (no group)
1. Show a choice screen:
   - **"צור קבוצה חדשה"** (Create new group) — creates group, user is owner
   - **"הצטרף לקבוצה"** (Join existing group) — enter invite code
2. After group is set → proceed to shopping list

### Returning user (has group)
1. Read `groupId` from `/users/{uid}`
2. Set `listRef` and `catalogRef` to group-scoped paths
3. Start real-time listeners (same as before)

### Group management (in header/settings)
- Show user avatar + name in header
- **"הגדרות קבוצה"** button opens a panel showing:
  - Group name (editable by owner)
  - Invite code (copyable)
  - Member list
  - **"עזוב קבוצה"** / **"מחק קבוצה"** (leave/delete)
- Logout button

## Files to Modify

### `index.html`
- Add Firebase Auth CDN: `firebase-auth-compat.js`
- Add login screen (hidden by default): Google sign-in button
- Add group selection screen: create/join options
- Add group panel/modal: members, invite code, settings
- Add user info in header: avatar, name, logout, group settings button
- Wrap existing header+main in an `#app-container` div (hidden until auth+group resolved)

### `app.js`
- Add Firebase Auth initialization and Google provider
- Add auth state listener (`firebase.auth().onAuthStateChanged`)
- Add user/group management functions:
  - `signInWithGoogle()`
  - `signOut()`
  - `createGroup(name)`
  - `joinGroup(inviteCode)`
  - `leaveGroup()`
  - `generateInviteCode()` — 6-char random alphanumeric
- Change `listRef` and `catalogRef` from static `const` to dynamic `let` (set after group is resolved)
- Modify `setupFirebaseListeners()` to use group-scoped refs
- Add `detachFirebaseListeners()` for cleanup on sign-out/group change
- Gate the app UI behind auth state (show/hide login vs app)

### `style.css`
- Login screen styles (centered card, Google button)
- Group selection screen styles
- Group panel/modal styles
- User avatar + header adjustments

### `utils.js` + `utils.test.js`
- Add `generateInviteCode()` to AppUtils
- Add tests for invite code generation (length, character set)

## Implementation Order

1. **Auth setup** — add CDN, sign-in/sign-out, auth state listener
2. **Login screen UI** — HTML + CSS for login page
3. **User record** — create/read `/users/{uid}` on sign-in
4. **Group creation** — create group + invite code + seed catalog
5. **Group joining** — join by invite code lookup
6. **Group selection screen** — UI for create/join choice
7. **Dynamic refs** — make `listRef`/`catalogRef` point to group path
8. **Group management panel** — members list, invite code, leave/delete
9. **Header update** — avatar, name, logout, settings button
10. **Data migration** — migrate old flat data for first user
11. **Tests** — update utils.test.js

## Key Design Decisions

- **Invite code** (not email search) — simplest for adding members, no need to search users
- **6-char alphanumeric code** — short enough to share verbally/text
- **Group-scoped catalog** — each group has its own catalog (seeded from SEED_PRODUCTS on creation)
- **Owner role** — only owner can delete group; anyone can leave
- **No group switching** — a user belongs to one group at a time (can leave and join another)
- **No server needed** — Firebase Auth + Realtime Database handles everything, free tier is sufficient

## Firebase Console Prerequisites
Before implementing, ensure in the Firebase Console (https://console.firebase.google.com):
1. **Authentication** → Sign-in method → Enable **Google** provider
2. **Realtime Database** → Rules → Update to allow authenticated reads/writes

## Verification
1. Open app → see login screen → sign in with Google
2. First time → see create/join screen → create group → see shopping list
3. Copy invite code → open in another browser/incognito → sign in → join group with code
4. Both users see the same shopping list in real-time
5. Add/edit/delete items → changes sync across both sessions
6. Group panel shows both members
7. Sign out → see login screen again
8. `npm test` → all tests pass
