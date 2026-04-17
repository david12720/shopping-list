/**
 * Store Module
 * Responsibility: Manage the application's central state and provide reactive updates.
 */
const AppStore = (() => {
  let state = {
    currentUser: null,
    currentGroupId: null,
    group: null,
    shoppingList: [],
    catalog: [],
    templateList: [],
    productStats: {},
    customCategories: [],
    collapsedCategories: new Set(),
    isSheetOpen: false,
    addingToTarget: "list", // "list" or "template"
    modalTarget: "list",
    listItemEditId: null,
    modalContext: null,
    editContext: null
  };

  const listeners = [];

  const CATEGORY_ORDER = [
    "ירקות ופירות",
    "מוצרי חלב",
    "בשר ועוף",
    "מאפים ולחם",
    "שתייה",
    "מוצרי ניקיון",
    "חטיפים וממתקים",
    "שונות",
  ];

  const SEED_PRODUCTS = [
    { id: "v1",  name: "עגבניות",      category: "ירקות ופירות", defaultUnit: "units" },
    { id: "v2",  name: "מלפפונים",     category: "ירקות ופירות", defaultUnit: "units" },
    { id: "v3",  name: "בצל",          category: "ירקות ופירות", defaultUnit: "units" },
    { id: "v4",  name: "תפוחי אדמה",  category: "ירקות ופירות", defaultUnit: "units" },
    { id: "v5",  name: "גזר",          category: "ירקות ופירות", defaultUnit: "units" },
    { id: "v6",  name: "פלפל",         category: "ירקות ופירות", defaultUnit: "units" },
    { id: "v7",  name: "לימון",        category: "ירקות ופירות", defaultUnit: "units" },
    { id: "v8",  name: "תפוחים",       category: "ירקות ופירות", defaultUnit: "units" },
    { id: "v9",  name: "בננות",        category: "ירקות ופירות", defaultUnit: "units" },
    { id: "v10", name: "אבוקדו",       category: "ירקות ופירות", defaultUnit: "units" },
    { id: "v11", name: "חסה",          category: "ירקות ופירות", defaultUnit: "units" },
    { id: "v12", name: "כוסברה",       category: "ירקות ופירות", defaultUnit: "units" },
    { id: "v13", name: "פטרוזיליה",    category: "ירקות ופירות", defaultUnit: "units" },
    { id: "v14", name: "שום",          category: "ירקות ופירות", defaultUnit: "units" },
    { id: "v15", name: "תירס",         category: "ירקות ופירות", defaultUnit: "units" },
    { id: "d1",  name: "חלב",          category: "מוצרי חלב", defaultUnit: "units" },
    { id: "d2",  name: "ביצים",        category: "מוצרי חלב", defaultUnit: "units" },
    { id: "d3",  name: "גבינה צהובה",  category: "מוצרי חלב", defaultUnit: "units" },
    { id: "d4",  name: "גבינה לבנה",   category: "מוצרי חלב", defaultUnit: "units" },
    { id: "d5",  name: "קוטג'",        category: "מוצרי חלב", defaultUnit: "units" },
    { id: "d6",  name: "שמנת",         category: "מוצרי חלב", defaultUnit: "units" },
    { id: "d7",  name: "יוגורט",       category: "מוצרי חלב", defaultUnit: "units" },
    { id: "d8",  name: "חמאה",         category: "מוצרי חלב", defaultUnit: "units" },
    { id: "d9",  name: "שוקו",         category: "מוצרי חלב", defaultUnit: "units" },
    { id: "d10", name: "לבן",          category: "מוצרי חלב", defaultUnit: "units" },
    { id: "m1",  name: "חזה עוף",      category: "בשר ועוף", defaultUnit: "units" },
    { id: "m2",  name: "כרעיים",       category: "בשר ועוף", defaultUnit: "units" },
    { id: "m3",  name: "בשר טחון",     category: "בשר ועוף", defaultUnit: "units" },
    { id: "m4",  name: "שניצל",        category: "בשר ועוף", defaultUnit: "units" },
    { id: "m5",  name: "נקניקיות",     category: "בשר ועוף", defaultUnit: "units" },
    { id: "m6",  name: "המבורגר",      category: "בשר ועוף", defaultUnit: "units" },
    { id: "m7",  name: "כבד עוף",      category: "בשר ועוף", defaultUnit: "units" },
    { id: "m8",  name: "סטייק",        category: "בשר ועוף", defaultUnit: "units" },
    { id: "b1",  name: "לחם",          category: "מאפים ולחם", defaultUnit: "units" },
    { id: "b2",  name: "פיתות",        category: "מאפים ולחם", defaultUnit: "units" },
    { id: "b3",  name: "חלה",          category: "מאפים ולחם", defaultUnit: "units" },
    { id: "b4",  name: "לחמניות",      category: "מאפים ולחם", defaultUnit: "units" },
    { id: "b5",  name: "טורטייה",      category: "מאפים ולחם", defaultUnit: "units" },
    { id: "b6",  name: "קרקרים",       category: "מאפים ולחם", defaultUnit: "units" },
    { id: "b7",  name: "עוגיות",       category: "מאפים ולחם", defaultUnit: "units" },
    { id: "s1",  name: "מים מינרליים", category: "שתייה", defaultUnit: "units" },
    { id: "s2",  name: "קולה",         category: "שתייה", defaultUnit: "units" },
    { id: "s3",  name: "מיץ תפוזים",   category: "שתייה", defaultUnit: "units" },
    { id: "s4",  name: "בירה",         category: "שתייה", defaultUnit: "units" },
    { id: "s5",  name: "יין",          category: "שתייה", defaultUnit: "units" },
    { id: "s6",  name: "סודה",         category: "שתייה", defaultUnit: "units" },
    { id: "c1",  name: "אקונומיקה",    category: "מוצרי ניקיון", defaultUnit: "units" },
    { id: "c2",  name: "סבון כלים",    category: "מוצרי ניקיון", defaultUnit: "units" },
    { id: "c3",  name: "נייר טואלט",   category: "מוצרי ניקיון", defaultUnit: "units" },
    { id: "c4",  name: "מרכך כביסה",   category: "מוצרי ניקיון", defaultUnit: "units" },
    { id: "c5",  name: "אבקת כביסה",   category: "מוצרי ניקיון", defaultUnit: "units" },
    { id: "c6",  name: "שקיות אשפה",   category: "מוצרי ניקיון", defaultUnit: "units" },
    { id: "c7",  name: "מגבונים",      category: "מוצרי ניקיון", defaultUnit: "units" },
    { id: "k1",  name: "במבה",         category: "חטיפים וממתקים", defaultUnit: "units" },
    { id: "k2",  name: "ביסלי",        category: "חטיפים וממתקים", defaultUnit: "units" },
    { id: "k3",  name: "שוקולד",       category: "חטיפים וממתקים", defaultUnit: "units" },
    { id: "k4",  name: "חטיף אנרגיה",  category: "חטיפים וממתקים", defaultUnit: "units" },
    { id: "k5",  name: "גלידה",        category: "חטיפים וממתקים", defaultUnit: "units" },
    { id: "k6",  name: "עוגה",         category: "חטיפים וממתקים", defaultUnit: "units" },
    { id: "x1",  name: "שמן זית",      category: "שונות", defaultUnit: "units" },
    { id: "x2",  name: "אורז",         category: "שונות", defaultUnit: "units" },
    { id: "x3",  name: "פסטה",         category: "שונות", defaultUnit: "units" },
    { id: "x4",  name: "רסק עגבניות",  category: "שונות", defaultUnit: "units" },
    { id: "x5",  name: "טונה",         category: "שונות", defaultUnit: "units" },
    { id: "x6",  name: "חומוס",        category: "שונות", defaultUnit: "units" },
    { id: "x7",  name: "טחינה",        category: "שונות", defaultUnit: "units" },
    { id: "x8",  name: "קטשופ",        category: "שונות", defaultUnit: "units" },
    { id: "x9",  name: "מלח",          category: "שונות", defaultUnit: "units" },
    { id: "x10", name: "סוכר",         category: "שונות", defaultUnit: "units" },
    { id: "x11", name: "קפה",          category: "שונות", defaultUnit: "units" },
    { id: "x12", name: "תה",           category: "שונות", defaultUnit: "units" },
  ];

  const SUGGESTED_NAMES = [
    "חלב", "ביצים", "לחם", "עגבניות", "מלפפונים", "בננות",
    "שוקו", "נייר טואלט", "מים מינרליים", "אורז", "חזה עוף", "בצל"
  ];

  function notify() {
    listeners.forEach(callback => callback(state));
  }

  return {
    // Getters
    getState() { return state; },
    getConstants() { return { CATEGORY_ORDER, SEED_PRODUCTS, SUGGESTED_NAMES }; },
    
    getAllCategories() {
      const base = CATEGORY_ORDER.filter(c => c !== "שונות");
      return [...base, ...state.customCategories, "שונות"];
    },

    // Setters / Actions
    setState(newState) {
      state = { ...state, ...newState };
      notify();
    },

    subscribe(callback) {
      listeners.push(callback);
      callback(state); // Initial call
      return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
      };
    },

    // Specific state modifiers
    toggleCategory(category) {
      if (state.collapsedCategories.has(category)) {
        state.collapsedCategories.delete(category);
      } else {
        state.collapsedCategories.add(category);
      }
      notify();
    }
  };
})();
