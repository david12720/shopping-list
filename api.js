/**
 * API Module
 * Responsibility: Handle all external communication (Firebase, Auth, and eventually AI).
 */
const AppAPI = (() => {
  const firebaseConfig = {
    apiKey: "AIzaSyAR95QpwEzKjWaS80WaNESnmSqbCEqI6hk",
    authDomain: "shopping-list-b2681.firebaseapp.com",
    databaseURL: "https://shopping-list-b2681-default-rtdb.firebaseio.com",
    projectId: "shopping-list-b2681",
    storageBucket: "shopping-list-b2681.firebasestorage.app",
    messagingSenderId: "435223136068",
    appId: "1:435223136068:web:12530445ecca0edd777911",
    measurementId: "G-ZP8E3PSVY2"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const auth = firebase.auth();

  let refs = {
    list: null,
    catalog: null,
    template: null,
    categories: null,
    group: null,
    userGroup: null
  };

  return {
    auth,
    db,
    
    // Auth Methods
    signInWithGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      return auth.signInWithPopup(provider);
    },

    signOut() {
      return auth.signOut();
    },

    onAuthStateChanged(callback) {
      return auth.onAuthStateChanged(callback);
    },

    // Group Methods
    getUserGroupId(uid, callback) {
      const ref = db.ref(`users/${uid}/groupId`);
      ref.on("value", snapshot => callback(snapshot.val()));
      return ref;
    },

    async createGroup(uid, userName, userEmail, userPhoto, groupName, seedProducts) {
      const groupId = "grp_" + Date.now();
      const inviteCode = AppUtils.generateInviteCode();
      
      const groupData = {
        name: groupName,
        ownerId: uid,
        inviteCode: inviteCode,
        shoppingList: [],
        catalog: seedProducts,
        templateList: [],
        customCategories: [],
        members: {
          [uid]: {
            name: userName,
            email: userEmail,
            photoURL: userPhoto,
            role: "owner"
          }
        }
      };

      const updates = {};
      updates[`/groups/${groupId}`] = groupData;
      updates[`/invites/${inviteCode}`] = groupId;
      updates[`/users/${uid}/groupId`] = groupId;

      await db.ref().update(updates);
      return groupId;
    },

    async joinGroupByCode(uid, userName, userEmail, userPhoto, inviteCode) {
      const code = inviteCode.toUpperCase();
      const snapshot = await db.ref(`invites/${code}`).once("value");
      const groupId = snapshot.val();
      
      if (!groupId) throw new Error("INVALID_CODE");

      const updates = {};
      updates[`/groups/${groupId}/members/${uid}`] = {
        name: userName,
        email: userEmail,
        photoURL: userPhoto,
        role: "member"
      };
      updates[`/users/${uid}/groupId`] = groupId;

      await db.ref().update(updates);
      return groupId;
    },

    async leaveGroup(uid, groupId) {
      const updates = {};
      updates[`/users/${uid}/groupId`] = null;
      updates[`/groups/${groupId}/members/${uid}`] = null;
      return db.ref().update(updates);
    },

    async updateGroupName(groupId, newName) {
      return db.ref(`groups/${groupId}/name`).set(newName);
    },

    async refreshInviteCode(groupId, oldCode) {
      const newCode = AppUtils.generateInviteCode();
      const updates = {};
      updates[`groups/${groupId}/inviteCode`] = newCode;
      updates[`invites/${oldCode}`] = null;
      updates[`invites/${newCode}`] = groupId;
      return db.ref().update(updates);
    },

    async removeMember(groupId, targetUid) {
      const updates = {};
      updates[`/groups/${groupId}/members/${targetUid}`] = null;
      updates[`/users/${targetUid}/groupId`] = null;
      return db.ref().update(updates);
    },

    // Real-time Data Sync
    setupGroupListeners(groupId, callbacks) {
      this.detachListeners();

      refs.group = db.ref(`groups/${groupId}`);
      refs.group.on("value", snapshot => callbacks.onGroupUpdate(snapshot.val()));

      refs.list = db.ref(`groups/${groupId}/shoppingList`);
      refs.list.on("value", snapshot => callbacks.onListUpdate(snapshot.val() || []));

      refs.catalog = db.ref(`groups/${groupId}/catalog`);
      refs.catalog.on("value", snapshot => callbacks.onCatalogUpdate(snapshot.val() || []));

      refs.template = db.ref(`groups/${groupId}/templateList`);
      refs.template.on("value", snapshot => callbacks.onTemplateUpdate(snapshot.val() || []));

      refs.categories = db.ref(`groups/${groupId}/customCategories`);
      refs.categories.on("value", snapshot => callbacks.onCategoriesUpdate(snapshot.val()));

      // Connection status
      db.ref(".info/connected").on("value", snapshot => callbacks.onConnectionUpdate(snapshot.val()));
    },

    detachListeners() {
      Object.values(refs).forEach(ref => {
        if (ref) ref.off();
      });
    },

    // AI & Natural Language
    async processNaturalLanguage(text, catalog) {
      // In a real scenario, we would send the catalog so the AI knows existing IDs.
      // For now, we'll send a simplified version of the catalog names.
      const catalogNames = catalog.map(p => p.name);
      return this.callAiProxy(text, catalogNames);
    },

    async callAiProxy(text, catalogNames) {
      // This is the "Pluggable" part. 
      // Currently set up to call a Firebase Cloud Function.
      // If you switch to Vercel, you only change this URL or method.
      try {
        // Correct syntax for specifying region in Firebase Compat SDK
        const aiFunction = firebase.app().functions('us-central1').httpsCallable('processShoppingRequest');
        const response = await aiFunction({ text, catalogNames });
        return response.data; // Should return { items: [{ name, amount, unit, category }] }
      } catch (error) {
        console.error("AI Proxy Error details:", error);
        // On some mobile browsers, error.message might be generic, 
        // so we try to get more details if available.
        const errorDetail = error.details || error.message || "Unknown error";
        throw new Error(errorDetail);
      }
    },

    // Data Persistence
    saveShoppingList(groupId, data) {
      return db.ref(`groups/${groupId}/shoppingList`).set(data);
    },

    saveCatalog(groupId, data) {
      return db.ref(`groups/${groupId}/catalog`).set(data);
    },

    saveTemplate(groupId, data) {
      return db.ref(`groups/${groupId}/templateList`).set(data);
    },

    saveCustomCategories(groupId, data) {
      return db.ref(`groups/${groupId}/customCategories`).set(data);
    },

    // Migration
    async migrateOldData(groupId) {
      const paths = ["shoppingList", "catalog", "templateList", "customCategories"];
      for (const path of paths) {
        const snapshot = await db.ref(path).once("value");
        const val = snapshot.val();
        if (val) {
          await db.ref(`groups/${groupId}/${path}`).set(val);
          await db.ref(path).remove();
        }
      }
    }
  };
})();
