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

    // Admin Methods
    async fetchAllUsers() {
      const snapshot = await db.ref("/users").once("value");
      return snapshot.val() || {};
    },

    async fetchAllAiCosts() {
      const snapshot = await db.ref("/admin/ai_costs").once("value");
      return snapshot.val() || {};
    },

    async fetchLimits() {
      const snapshot = await db.ref("/admin/limits").once("value");
      return snapshot.val() || {};
    },

    async updateLimit(uid, maxCost) {
      return db.ref(`/admin/limits/${uid}`).update({ maxCostPerMonth: parseFloat(maxCost) || 0 });
    },

    async removeUserFromSystem(uid) {
      const userSnap = await db.ref(`/users/${uid}`).once("value");
      const user = userSnap.val();
      if (!user) return;

      const updates = {};
      if (user.groupId) {
        updates[`/groups/${user.groupId}/members/${uid}`] = null;
      }
      updates[`/users/${uid}`] = null;
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

      refs.stats = db.ref(`groups/${groupId}/productStats`);
      refs.stats.on("value", snapshot => callbacks.onStatsUpdate(snapshot.val() || {}));

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
    async processAiRequest(payload) {
      // payload: { text, fileData, context: { catalogNames, categories } }
      try {
        const aiFunction = firebase.app().functions('us-central1').httpsCallable('processShoppingRequest');
        const response = await aiFunction(payload);
        return response.data; // Expected: { items: [{ name, amount, unit, category }] }
      } catch (error) {
        console.error("AI API Error:", error);
        throw new Error(error.details || error.message || "שגיאה בחיבור לשרת ה-AI");
      }
    },

    // Legacy method for backward compatibility if needed
    async processNaturalLanguage(text, catalog) {
      const catalogNames = catalog.map(p => p.name);
      return this.processAiRequest({ text, context: { catalogNames } });
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

    async incrementProductStats(groupId, itemNames) {
      if (!itemNames || itemNames.length === 0) return;
      
      const updates = {};
      for (const name of itemNames) {
        // We use a transaction or a simple increment if possible. 
        // Since we are doing batch, we can use a loop or multiple updates.
        // Firebase RTDB doesn't have a built-in "increment all" for multiple paths in one call easily without knowing current values,
        // but we can use server-side increment for each.
        const path = `groups/${groupId}/productStats/${name}/purchaseCount`;
        updates[path] = firebase.database.ServerValue.increment(1);
      }
      return db.ref().update(updates);
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
