// === Firebase Config ===
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

let listRef;
let catalogRef;
let templateRef;
let categoriesRef;
let groupRef;

let currentUser = null;
let currentGroupId = null;

// === Initial Default Products (used to seed Firebase on first run) ===
const SEED_PRODUCTS = [
  { id: "v1",  name: "עגבניות",      category: "ירקות ופירות", defaultUnit: "kg" },
  { id: "v2",  name: "מלפפונים",     category: "ירקות ופירות", defaultUnit: "kg" },
  { id: "v3",  name: "בצל",          category: "ירקות ופירות", defaultUnit: "kg" },
  { id: "v4",  name: "תפוחי אדמה",  category: "ירקות ופירות", defaultUnit: "kg" },
  { id: "v5",  name: "גזר",          category: "ירקות ופירות", defaultUnit: "kg" },
  { id: "v6",  name: "פלפל",         category: "ירקות ופירות", defaultUnit: "kg" },
  { id: "v7",  name: "לימון",        category: "ירקות ופירות", defaultUnit: "units" },
  { id: "v8",  name: "תפוחים",       category: "ירקות ופירות", defaultUnit: "kg" },
  { id: "v9",  name: "בננות",        category: "ירקות ופירות", defaultUnit: "kg" },
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
  { id: "m1",  name: "חזה עוף",      category: "בשר ועוף", defaultUnit: "kg" },
  { id: "m2",  name: "כרעיים",       category: "בשר ועוף", defaultUnit: "kg" },
  { id: "m3",  name: "בשר טחון",     category: "בשר ועוף", defaultUnit: "kg" },
  { id: "m4",  name: "שניצל",        category: "בשר ועוף", defaultUnit: "kg" },
  { id: "m5",  name: "נקניקיות",     category: "בשר ועוף", defaultUnit: "units" },
  { id: "m6",  name: "המבורגר",      category: "בשר ועוף", defaultUnit: "units" },
  { id: "m7",  name: "כבד עוף",      category: "בשר ועוף", defaultUnit: "kg" },
  { id: "m8",  name: "סטייק",        category: "בשר ועוף", defaultUnit: "kg" },
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

// === Frequently Bought Items (by name for flexibility) ===
const SUGGESTED_NAMES = [
  "חלב", "ביצים", "לחם", "עגבניות", "מלפפונים", "בננות",
  "שוקו", "נייר טואלט", "מים מינרליים", "אורז", "חזה עוף", "בצל"
];

// === In-memory state (synced from Firebase) ===
let shoppingList = [];
let catalog = [];
let templateList = [];
let customCategories = [];
const collapsedCategories = new Set();

// === Firebase Data Helpers ===
function saveShoppingList() {
  listRef.set(shoppingList);
}

function saveCatalog() {
  catalogRef.set(catalog);
}

function saveTemplate() {
  templateRef.set(templateList);
}

function saveCustomCategories() {
  categoriesRef.set(customCategories);
}

// === Category Helpers ===
function getAllCategories() {
  const base = CATEGORY_ORDER.filter(c => c !== "שונות");
  return [...base, ...customCategories, "שונות"];
}

function refreshCategorySelects(selectedValues = {}) {
  const all = getAllCategories();
  const opts = all.map(cat => `<option value="${cat}">${cat}</option>`).join("")
    + `<option value="__new__">+ קטגוריה חדשה...</option>`;

  [els.sheetCustomCategory, els.editCategory].forEach(el => {
    if (!el) return;
    const prev = selectedValues[el.id] || el.value;
    el.innerHTML = opts;
    if (all.includes(prev)) el.value = prev;
  });
}

function addCustomCategory(name) {
  const trimmed = name.trim();
  if (!trimmed || customCategories.includes(trimmed) || CATEGORY_ORDER.includes(trimmed)) return trimmed;
  customCategories.push(trimmed);
  saveCustomCategories();
  refreshCategorySelects();
  return trimmed;
}

function handleCategoryChange(selectEl) {
  if (selectEl.value !== "__new__") return;
  const name = prompt("שם הקטגוריה החדשה:");
  if (name && name.trim()) {
    const cat = addCustomCategory(name);
    selectEl.value = cat;
  } else {
    selectEl.value = getAllCategories()[0];
  }
}

// === Utility ===
function formatUnit(unit) {
  return AppUtils.formatUnit(unit);
}

function formatAmount(amount, unit) {
  return AppUtils.formatAmount(amount, unit);
}

// === Modal State ===
let modalContext = null;
let editContext = null;
let listItemEditId = null;
let modalTarget = "list"; // "list" or "template"
let addingToTarget = "list"; // Track if we're adding to list or template from the add view
let isSheetOpen = false;

// === Render Suggested Items ===
function renderSuggested() {
  let html = "";
  SUGGESTED_NAMES.forEach(name => {
    const product = catalog.find(p => p.name === name);
    if (!product) return;
    html += `<button class="suggested-chip" data-name="${product.name}" data-category="${product.category}" data-unit="${product.defaultUnit}">${product.name}</button>`;
  });

  if (els.sheetSuggestedItems) {
    els.sheetSuggestedItems.innerHTML = html;
  }
}

// === DOM References ===
const els = {
  // Auth Views
  loginView: document.getElementById("login-view"),
  groupSelectionView: document.getElementById("group-selection-view"),
  appContainer: document.getElementById("app-container"),
  googleLoginBtn: document.getElementById("google-login-btn"),
  selectionLogoutBtn: document.getElementById("selection-logout-btn"),
  showCreateGroup: document.getElementById("show-create-group"),
  joinInviteCode: document.getElementById("join-invite-code"),
  joinGroupBtn: document.getElementById("join-group-btn"),
  
  // Header / User
  userAvatar: document.getElementById("user-avatar"),
  userName: document.getElementById("user-name"),
  settingsBtn: document.getElementById("settings-btn"),
  logoutBtn: document.getElementById("logout-btn"),
  
  // Settings Modal
  settingsModal: document.getElementById("settings-modal"),
  groupNameInput: document.getElementById("group-name-input"),
  saveGroupName: document.getElementById("save-group-name"),
  displayInviteCode: document.getElementById("display-invite-code"),
  copyInviteCode: document.getElementById("copy-invite-code"),
  membersList: document.getElementById("members-list"),
  leaveGroupBtn: document.getElementById("leave-group-btn"),
  closeSettings: document.getElementById("close-settings"),

  badge: document.getElementById("badge"),
  listView: document.getElementById("list-view"),
  templateView: document.getElementById("template-view"),
  emptyState: document.getElementById("empty-state"),
  templateEmptyState: document.getElementById("template-empty-state"),
  shoppingList: document.getElementById("shopping-list"),
  templateList: document.getElementById("template-list"),
  listActions: document.getElementById("list-actions"),
  addToTemplateBtn: document.getElementById("add-to-template-btn"),
  addAllTemplateBtn: document.getElementById("add-all-template"),
  modalOverlay: document.getElementById("modal-overlay"),
  modalProductName: document.getElementById("modal-product-name"),
  amountInput: document.getElementById("amount-input"),
  amountMinus: document.getElementById("amount-minus"),
  amountPlus: document.getElementById("amount-plus"),
  modalConfirm: document.getElementById("modal-confirm"),
  modalCancel: document.getElementById("modal-cancel"),
  clearPurchased: document.getElementById("clear-purchased"),
  clearAll: document.getElementById("clear-all"),
  syncStatus: document.getElementById("sync-status"),
  editModalOverlay: document.getElementById("edit-modal-overlay"),
  editName: document.getElementById("edit-name"),
  editCategory: document.getElementById("edit-category"),
  editSave: document.getElementById("edit-save"),
  editCancel: document.getElementById("edit-cancel"),
  fabAdd: document.getElementById("fab-add"),
  sheetOverlay: document.getElementById("sheet-overlay"),
  bottomSheet: document.getElementById("bottom-sheet"),
  sheetClose: document.getElementById("sheet-close"),
  sheetTitle: document.getElementById("sheet-title"),
  sheetTemplateToggle: document.getElementById("sheet-template-toggle"),
  sheetTemplateChevron: document.getElementById("sheet-template-chevron"),
  sheetTemplateContent: document.getElementById("sheet-template-content"),
  sheetTemplateEmpty: document.getElementById("sheet-template-empty"),
  sheetTemplateList: document.getElementById("sheet-template-list"),
  sheetAddAllTemplate: document.getElementById("sheet-add-all-template"),
  sheetSearchInput: document.getElementById("sheet-search-input"),
  sheetCatalog: document.getElementById("sheet-catalog"),
  sheetSuggestedItems: document.getElementById("sheet-suggested-items"),
  sheetAddCustomBtn: document.getElementById("sheet-add-custom-btn"),
  sheetCustomForm: document.getElementById("sheet-custom-form"),
  sheetCustomName: document.getElementById("sheet-custom-name"),
  sheetCustomCategory: document.getElementById("sheet-custom-category"),
  sheetCustomSubmit: document.getElementById("sheet-custom-submit"),
};

// === Sync Status ===
function setSyncStatus(status) {
  if (status === "connected") {
    els.syncStatus.textContent = "●";
    els.syncStatus.title = "מחובר";
    els.syncStatus.className = "sync-status connected";
  } else {
    els.syncStatus.textContent = "●";
    els.syncStatus.title = "לא מחובר";
    els.syncStatus.className = "sync-status disconnected";
  }
}

// === Render Shopping List ===
function renderShoppingList() {
  const list = shoppingList;
  const unpurchased = list.filter(item => !item.purchased);
  const purchased = list.filter(item => item.purchased);

  if (unpurchased.length > 0) {
    els.badge.textContent = unpurchased.length;
    els.badge.classList.remove("hidden");
  } else {
    els.badge.classList.add("hidden");
  }

  if (list.length === 0) {
    els.emptyState.classList.remove("hidden");
    els.listActions.classList.add("hidden");
    els.shoppingList.innerHTML = "";
    return;
  }

  els.emptyState.classList.add("hidden");
  els.listActions.classList.remove("hidden");

  let html = "";

  // Group unpurchased items by category
  const categoryOrder = {};
  unpurchased.forEach(item => {
    const cat = item.category || "כללי";
    if (!categoryOrder[cat]) categoryOrder[cat] = [];
    categoryOrder[cat].push(item);
  });

  Object.entries(categoryOrder).forEach(([category, items]) => {
    const collapsed = collapsedCategories.has(category);
    const arrow = collapsed ? "◂" : "▾";
    html += `<li class="list-category-header${collapsed ? " collapsed" : ""}" data-category="${category}">
      <span class="category-toggle">${arrow}</span>
      <span>${category}</span>
      <span class="category-count">${items.length}</span>
    </li>`;
    if (!collapsed) {
      items.forEach(item => {
        html += renderListItem(item);
      });
    }
  });

  if (purchased.length > 0 && unpurchased.length > 0) {
    html += `<li class="list-divider">── נקנו ──</li>`;
  }

  purchased.forEach(item => {
    html += renderListItem(item);
  });

  els.shoppingList.innerHTML = html;
}

function renderListItem(item) {
  const checkedAttr = item.purchased ? "checked" : "";
  const purchasedClass = item.purchased ? "purchased" : "";
  return `
    <li class="list-item ${purchasedClass}" data-id="${item.id}">
      <input type="checkbox" class="item-checkbox" ${checkedAttr}>
      <span class="item-name">${item.name}</span>
      <span class="item-amount item-amount-edit">${formatAmount(item.amount, item.unit)}</span>
      <button class="item-delete" title="מחק">✕</button>
    </li>
  `;
}

// === Render Template ===
function renderTemplate() {
  const hasItems = templateList.length > 0;

  if (!hasItems) {
    els.templateList.innerHTML = "";
    els.templateEmptyState.classList.remove("hidden");
    els.addAllTemplateBtn.classList.add("hidden");
    return;
  }

  els.templateEmptyState.classList.add("hidden");
  els.addAllTemplateBtn.classList.remove("hidden");

  let html = "";
  templateList.forEach(item => {
    html += `
      <li class="list-item" data-id="${item.id}">
        <span class="item-name">${item.name}</span>
        <span class="item-amount item-amount-edit">${formatAmount(item.amount, item.unit)}</span>
        <button class="item-add-to-list" title="הוסף לרשימה">+</button>
        <button class="item-delete" title="מחק">✕</button>
      </li>
    `;
  });

  els.templateList.innerHTML = html;
}

// === Render Catalog ===
function renderCatalog(filter) {
  const filterText = (filter || "").trim();
  const grouped = {};

  CATEGORY_ORDER.forEach(cat => { grouped[cat] = []; });

  catalog.forEach(product => {
    if (filterText && !product.name.includes(filterText)) return;
    if (!grouped[product.category]) grouped[product.category] = [];
    grouped[product.category].push(product);
  });

  let html = "";
  let hasResults = false;

  getAllCategories().forEach(cat => {
    const items = grouped[cat];
    if (!items || items.length === 0) return;
    hasResults = true;

    html += `
      <div class="category">
        <div class="category-header" data-category="${cat}">
          <span>${cat}</span>
        </div>
        <div class="category-items">
    `;

    items.forEach(product => {
      html += `
        <div class="catalog-item" data-id="${product.id}" data-name="${product.name}" data-category="${product.category}" data-unit="${product.defaultUnit}">
          <span class="catalog-item-name">${product.name}</span>
          <div class="catalog-item-actions">
            <button class="catalog-item-edit" title="ערוך">✎</button>
            <button class="catalog-item-remove" title="מחק">✕</button>
            <button class="catalog-item-add">+</button>
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
  });

  if (!hasResults) {
    if (filterText) {
      html = `<div class="no-results">לא נמצאו מוצרים <button class="no-results-add" data-name="${filterText}">+ הוסף "${filterText}"</button></div>`;
    } else {
      html = `<div class="no-results">לא נמצאו מוצרים</div>`;
    }
  }

  els.sheetCatalog.innerHTML = html;
}

// === Amount Modal ===
function openAmountModal(name, defaultUnit, category, itemId, target = "list") {
  listItemEditId = itemId || null;
  modalTarget = target;
  modalContext = { name, category };
  els.modalProductName.textContent = name;
  setUnit(defaultUnit);

  // Update button text based on edit vs add
  els.modalConfirm.textContent = itemId ? "עדכן" : "הוסף לרשימה";

  if (itemId) {
    // Editing existing item — pre-fill amount
    const list = target === "template" ? templateList : shoppingList;
    const item = list.find(i => i.id === itemId);
    if (item) {
      els.amountInput.value = item.amount;
      setUnit(item.unit);
    }
  } else {
    // Adding new item
    els.amountInput.value = 1;
  }

  els.modalOverlay.classList.remove("hidden");
}

function closeModal() {
  els.modalOverlay.classList.add("hidden");
  modalContext = null;
  listItemEditId = null;
  modalTarget = "list";
}

function setUnit(unit) {
  document.querySelectorAll("#modal-overlay .unit-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.unit === unit);
  });

  if (unit === "kg") {
    els.amountInput.step = "0.5";
    els.amountInput.min = "0.5";
    if (parseFloat(els.amountInput.value) < 0.5) {
      els.amountInput.value = 0.5;
    }
  } else {
    els.amountInput.step = "1";
    els.amountInput.min = "1";
    const val = parseFloat(els.amountInput.value);
    if (val < 1 || val !== Math.floor(val)) {
      els.amountInput.value = 1;
    }
  }
}

function getActiveUnit() {
  const active = document.querySelector("#modal-overlay .unit-btn.active");
  return active ? active.dataset.unit : "units";
}

function adjustAmount(delta) {
  const unit = getActiveUnit();
  const step = unit === "kg" ? 0.5 : 1;
  const min = unit === "kg" ? 0.5 : 1;
  let val = parseFloat(els.amountInput.value) || min;
  val = Math.round((val + delta * step) * 10) / 10;
  if (val < min) val = min;
  els.amountInput.value = val;
}

function confirmModal() {
  if (!modalContext) return;
  const unit = getActiveUnit();
  const amount = parseFloat(els.amountInput.value) || 1;

  if (modalTarget === "template") {
    if (listItemEditId) {
      // Update existing template item
      const item = templateList.find(i => i.id === listItemEditId);
      if (item) {
        item.amount = amount;
        item.unit = unit;
        saveTemplate();
      }
    } else {
      // Add new item to template
      addItemToTemplate(modalContext.name, modalContext.category, unit, amount);
      // Close sheet after adding to template (no multi-add for template)
      closeModal();
      closeSheet();
      return;
    }
  } else {
    if (listItemEditId) {
      // Update existing list item
      const item = shoppingList.find(i => i.id === listItemEditId);
      if (item) {
        item.amount = amount;
        item.unit = unit;
        saveShoppingList();
      }
    } else {
      // Add new item to list
      addItemToList(modalContext.name, modalContext.category, unit, amount);
    }
  }
  closeModal();
}

// === Edit Product Modal ===
function openEditModal(productId) {
  const product = catalog.find(p => p.id === productId);
  if (!product) return;

  editContext = { id: productId };
  els.editName.value = product.name;

  // Populate category dropdown
  refreshCategorySelects({ "edit-category": product.category });

  // Set unit
  document.querySelectorAll(".edit-unit-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.unit === product.defaultUnit);
  });

  els.editModalOverlay.classList.remove("hidden");
}

function closeEditModal() {
  els.editModalOverlay.classList.add("hidden");
  editContext = null;
}

function saveEditProduct() {
  if (!editContext) return;
  const idx = catalog.findIndex(p => p.id === editContext.id);
  if (idx === -1) return;

  const activeUnitBtn = document.querySelector(".edit-unit-btn.active");
  catalog[idx].name = els.editName.value.trim();
  catalog[idx].category = els.editCategory.value;
  catalog[idx].defaultUnit = activeUnitBtn ? activeUnitBtn.dataset.unit : "units";

  saveCatalog();
  closeEditModal();
}

function removeCatalogProduct(productId) {
  const product = catalog.find(p => p.id === productId);
  if (!product) return;
  if (!confirm(`למחוק את "${product.name}" מהקטלוג?`)) return;

  catalog = catalog.filter(p => p.id !== productId);
  saveCatalog();
}

// === Item Operations ===
function addItemToList(name, category, unit, amount) {
  // Check for duplicate — merge amounts
  const existing = shoppingList.find(item => item.name === name && !item.purchased);
  if (existing) {
    existing.amount = Math.round((existing.amount + amount) * 10) / 10;
  } else {
    shoppingList.push({
      id: "item_" + Date.now(),
      name,
      category,
      unit,
      amount,
      purchased: false,
    });
  }

  saveShoppingList();
}

function addCustomProductToCatalog(name, unit, category) {
  const alreadyExists = catalog.some(p => p.name === name);
  if (alreadyExists) return;

  catalog.push({
    id: "p_" + Date.now(),
    name,
    category: category || "שונות",
    defaultUnit: unit || "units",
  });
  saveCatalog();
}

// === Template Item Operations ===
function addItemToTemplate(name, category, unit, amount) {
  // Check for duplicate — merge amounts
  const existing = templateList.find(item => item.name === name);
  if (existing) {
    existing.amount = Math.round((existing.amount + amount) * 10) / 10;
  } else {
    templateList.push({
      id: "tpl_" + Date.now(),
      name,
      category,
      unit,
      amount,
    });
  }

  saveTemplate();
}

function removeTemplateItem(id) {
  templateList = templateList.filter(item => item.id !== id);
  saveTemplate();
}

function addAllTemplateToList() {
  if (templateList.length === 0) return;
  templateList.forEach(item => {
    // Skip if item already exists in unpurchased list
    const exists = shoppingList.some(i => i.name === item.name && !i.purchased);
    if (!exists) {
      addItemToList(item.name, item.category, item.unit, item.amount);
    }
  });
  closeSheet();
}

// === Bottom Sheet ===
function openSheet(target = "list") {
  addingToTarget = target;
  els.sheetTitle.textContent = target === "template" ? "הוספה לתבנית" : "הוספת מוצרים";
  els.sheetSearchInput.value = "";
  renderCatalog("");
  renderSuggested();
  renderSheetTemplate();
  els.sheetOverlay.classList.remove("hidden");
  requestAnimationFrame(() => els.bottomSheet.classList.add("open"));
  isSheetOpen = true;
  document.body.style.overflow = "hidden";
}

function closeSheet() {
  els.bottomSheet.classList.remove("open");
  const handleTransitionEnd = () => {
    els.sheetOverlay.classList.add("hidden");
    document.body.style.overflow = "";
    addingToTarget = "list";
    isSheetOpen = false;
    els.bottomSheet.removeEventListener("transitionend", handleTransitionEnd);
  };
  els.bottomSheet.addEventListener("transitionend", handleTransitionEnd, { once: true });
}

function renderSheetTemplate() {
  const hasItems = templateList.length > 0;
  if (!hasItems) {
    els.sheetTemplateList.innerHTML = "";
    els.sheetTemplateEmpty.classList.remove("hidden");
    els.sheetAddAllTemplate.classList.add("hidden");
    return;
  }
  els.sheetTemplateEmpty.classList.add("hidden");
  els.sheetAddAllTemplate.classList.remove("hidden");
  els.sheetTemplateList.innerHTML = templateList.map(item => `
    <li class="list-item" data-id="${item.id}">
      <span class="item-name">${item.name}</span>
      <span class="item-amount">${formatAmount(item.amount, item.unit)}</span>
    </li>
  `).join("");
}

function submitSheetCustomItem() {
  const name = els.sheetCustomName.value.trim();
  if (!name) return;
  const category = els.sheetCustomCategory.value || "שונות";
  els.sheetCustomName.value = "";
  els.sheetCustomForm.classList.add("hidden");
  addCustomProductToCatalog(name, "units", category);
  openAmountModal(name, "units", category, null, addingToTarget);
}

function removeItem(id) {
  shoppingList = shoppingList.filter(item => item.id !== id);
  saveShoppingList();
}

function togglePurchased(id) {
  const item = shoppingList.find(item => item.id === id);
  if (item) {
    item.purchased = !item.purchased;
    saveShoppingList();
  }
}

function clearPurchased() {
  shoppingList = shoppingList.filter(item => !item.purchased);
  saveShoppingList();
}

function clearAll() {
  if (!confirm("למחוק את כל הרשימה?")) return;
  shoppingList = [];
  saveShoppingList();
}

// === Tab Navigation ===
function switchTab(tabName) {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });

  els.listView.classList.toggle("active", tabName === "list");
  els.templateView.classList.toggle("active", tabName === "template");
}

// === Event Listeners ===
function attachEventListeners() {
  // Populate category selects
  refreshCategorySelects();

  // Handle "new category" option in all category selects
  [els.sheetCustomCategory, els.editCategory].forEach(el => {
    if (!el) return;
    el.addEventListener("change", () => handleCategoryChange(el));
  });

  // Tab clicks
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  // FAB — context-aware based on active tab
  els.fabAdd.addEventListener("click", () => {
    const activeTab = document.querySelector(".tab.active");
    const target = activeTab && activeTab.dataset.tab === "template" ? "template" : "list";
    openSheet(target);
  });

  // Shopping list — event delegation
  els.shoppingList.addEventListener("click", (e) => {
    const categoryHeader = e.target.closest(".list-category-header");
    if (categoryHeader) {
      const category = categoryHeader.dataset.category;
      if (collapsedCategories.has(category)) {
        collapsedCategories.delete(category);
      } else {
        collapsedCategories.add(category);
      }
      renderShoppingList();
      return;
    }

    const li = e.target.closest(".list-item");
    if (!li) return;
    const id = li.dataset.id;
    const item = shoppingList.find(i => i.id === id);

    if (e.target.classList.contains("item-checkbox")) {
      togglePurchased(id);
    } else if (e.target.classList.contains("item-delete")) {
      removeItem(id);
    } else if (e.target.classList.contains("item-amount-edit") && item) {
      openAmountModal(item.name, item.unit, item.category, id);
    }
  });

  // Template list — event delegation
  els.templateList.addEventListener("click", (e) => {
    const li = e.target.closest(".list-item");
    if (!li) return;
    const id = li.dataset.id;
    const item = templateList.find(i => i.id === id);

    if (e.target.classList.contains("item-delete")) {
      removeTemplateItem(id);
    } else if (e.target.classList.contains("item-add-to-list") && item) {
      openAmountModal(item.name, item.unit, item.category, null, "list");
    } else if (e.target.classList.contains("item-amount-edit") && item) {
      openAmountModal(item.name, item.unit, item.category, id, "template");
    }
  });

  // Template actions
  els.addToTemplateBtn.addEventListener("click", () => {
    openSheet("template");
  });

  els.addAllTemplateBtn.addEventListener("click", addAllTemplateToList);

  // Clear buttons
  els.clearPurchased.addEventListener("click", clearPurchased);
  els.clearAll.addEventListener("click", clearAll);

  // Sheet search
  els.sheetSearchInput.addEventListener("input", (e) => {
    renderCatalog(e.target.value);
  });

  // Sheet template toggle
  els.sheetTemplateToggle.addEventListener("click", () => {
    els.sheetTemplateContent.classList.toggle("hidden");
    els.sheetTemplateChevron.classList.toggle("open");
  });

  // Sheet close
  els.sheetOverlay.addEventListener("click", (e) => {
    if (e.target === els.sheetOverlay) closeSheet();
  });

  els.sheetClose.addEventListener("click", closeSheet);

  // Sheet add all template
  els.sheetAddAllTemplate.addEventListener("click", addAllTemplateToList);

  // Sheet template items — event delegation (add individual items to list)
  els.sheetTemplateList.addEventListener("click", (e) => {
    const li = e.target.closest(".list-item");
    if (!li) return;
    const id = li.dataset.id;
    const item = templateList.find(i => i.id === id);
    if (item) {
      openAmountModal(item.name, item.unit, item.category, null, "list");
    }
  });

  // Sheet suggested items — event delegation
  els.sheetSuggestedItems.addEventListener("click", (e) => {
    const chip = e.target.closest(".suggested-chip");
    if (chip) {
      openAmountModal(chip.dataset.name, chip.dataset.unit, chip.dataset.category, null, addingToTarget);
    }
  });

  // Sheet custom item
  els.sheetAddCustomBtn.addEventListener("click", () => {
    els.sheetCustomForm.classList.toggle("hidden");
    if (!els.sheetCustomForm.classList.contains("hidden")) {
      els.sheetCustomName.focus();
    }
  });

  els.sheetCustomSubmit.addEventListener("click", submitSheetCustomItem);
  els.sheetCustomName.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitSheetCustomItem();
  });

  // Sheet catalog — event delegation
  els.sheetCatalog.addEventListener("click", (e) => {
    const header = e.target.closest(".category-header");
    if (header) {
      header.classList.toggle("open");
      const items = header.nextElementSibling;
      items.classList.toggle("open");
      return;
    }

    const noResultsAdd = e.target.closest(".no-results-add");
    if (noResultsAdd) {
      const name = noResultsAdd.dataset.name;
      els.sheetCustomName.value = name;
      els.sheetCustomForm.classList.remove("hidden");
      els.sheetCustomName.focus();
      return;
    }

    const catalogItem = e.target.closest(".catalog-item");
    if (!catalogItem) return;

    if (e.target.closest(".catalog-item-add")) {
      openAmountModal(catalogItem.dataset.name, catalogItem.dataset.unit, catalogItem.dataset.category, null, addingToTarget);
    } else if (e.target.closest(".catalog-item-edit")) {
      openEditModal(catalogItem.dataset.id);
    } else if (e.target.closest(".catalog-item-remove")) {
      removeCatalogProduct(catalogItem.dataset.id);
    }
  });

  // Suggested items — event delegation
  els.sheetSuggestedItems.addEventListener("click", (e) => {
    const chip = e.target.closest(".suggested-chip");
    if (chip) {
      openAmountModal(chip.dataset.name, chip.dataset.unit, chip.dataset.category, null, addingToTarget);
    }
  });

  // Amount Modal
  els.modalOverlay.addEventListener("click", (e) => {
    if (e.target === els.modalOverlay) closeModal();
  });

  document.querySelectorAll("#modal-overlay .unit-btn").forEach(btn => {
    btn.addEventListener("click", () => setUnit(btn.dataset.unit));
  });

  els.amountMinus.addEventListener("click", () => adjustAmount(-1));
  els.amountPlus.addEventListener("click", () => adjustAmount(1));
  els.modalConfirm.addEventListener("click", confirmModal);
  els.modalCancel.addEventListener("click", closeModal);

  // Edit Modal
  els.editModalOverlay.addEventListener("click", (e) => {
    if (e.target === els.editModalOverlay) closeEditModal();
  });

  document.querySelectorAll(".edit-unit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".edit-unit-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  els.editSave.addEventListener("click", saveEditProduct);
  els.editCancel.addEventListener("click", closeEditModal);

  // Auth & Groups
  els.googleLoginBtn.addEventListener("click", signInWithGoogle);
  els.selectionLogoutBtn.addEventListener("click", signOut);
  els.logoutBtn.addEventListener("click", signOut);
  els.showCreateGroup.addEventListener("click", createGroup);
  els.joinGroupBtn.addEventListener("click", () => joinGroup(els.joinInviteCode.value));
  els.settingsBtn.addEventListener("click", openSettings);
  els.closeSettings.addEventListener("click", closeSettings);
  els.saveGroupName.addEventListener("click", saveGroupName);
  els.copyInviteCode.addEventListener("click", copyInviteCode);
  els.leaveGroupBtn.addEventListener("click", leaveGroup);

  els.settingsModal.addEventListener("click", (e) => {
    if (e.target === els.settingsModal) closeSettings();
  });
}

function signInWithGoogle() {
  console.log("Starting Google Sign-in...");
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider).then(result => {
    console.log("Sign-in successful:", result.user.email);
  }).catch(err => {
    console.error("Auth error details:", err);
    console.error("Auth error code:", err.code);
    console.error("Auth error message:", err.message);
    alert("שגיאה בהתחברות (" + err.code + "): " + err.message);
  });
}

function signOut() {
  if (currentUser) {
    detachFirebaseListeners();
  }
  return auth.signOut();
}

function createGroup() {
  const name = prompt("שם הקבוצה החדשה:", "המשפחה שלי");
  if (!name) return;

  const groupId = "grp_" + Date.now();
  const inviteCode = AppUtils.generateInviteCode();
  
  const groupData = {
    name: name,
    ownerId: currentUser.uid,
    inviteCode: inviteCode,
    shoppingList: [],
    catalog: [...SEED_PRODUCTS],
    templateList: [],
    customCategories: [],
    members: {
      [currentUser.uid]: {
        name: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
        role: "owner"
      }
    }
  };

  const updates = {};
  updates[`/groups/${groupId}`] = groupData;
  updates[`/invites/${inviteCode}`] = groupId;
  updates[`/users/${currentUser.uid}/groupId`] = groupId;

  db.ref().update(updates).then(() => {
    migrateOldData(groupId);
  });
}

function joinGroup(inviteCode) {
  if (!inviteCode || inviteCode.length !== 6) {
    alert("קוד הזמנה חייב להיות בן 6 תווים");
    return;
  }

  inviteCode = inviteCode.toUpperCase();
  db.ref(`invites/${inviteCode}`).once("value").then(snapshot => {
    const groupId = snapshot.val();
    if (!groupId) {
      alert("קוד הזמנה לא תקין");
      return;
    }

    const updates = {};
    updates[`/groups/${groupId}/members/${currentUser.uid}`] = {
      name: currentUser.displayName,
      email: currentUser.email,
      photoURL: currentUser.photoURL,
      role: "member"
    };
    updates[`/users/${currentUser.uid}/groupId`] = groupId;

    db.ref().update(updates);
  });
}

function leaveGroup() {
  if (!currentGroupId || !confirm("האם אתה בטוח שברצונך לעזוב את הקבוצה?")) return;

  detachFirebaseListeners();
  
  const updates = {};
  updates[`/users/${currentUser.uid}/groupId`] = null;
  updates[`/groups/${currentGroupId}/members/${currentUser.uid}`] = null;

  db.ref().update(updates).then(() => {
    closeSettings();
  });
}

function migrateOldData(groupId) {
  db.ref("shoppingList").once("value").then(snapshot => {
    const oldList = snapshot.val();
    if (oldList) {
      db.ref(`groups/${groupId}/shoppingList`).set(oldList);
      db.ref("shoppingList").remove();
    }
  });

  db.ref("catalog").once("value").then(snapshot => {
    const oldCatalog = snapshot.val();
    if (oldCatalog) {
      db.ref(`groups/${groupId}/catalog`).set(oldCatalog);
      db.ref("catalog").remove();
    }
  });
  
  db.ref("templateList").once("value").then(snapshot => {
    const oldTemplate = snapshot.val();
    if (oldTemplate) {
      db.ref(`groups/${groupId}/templateList`).set(oldTemplate);
      db.ref("templateList").remove();
    }
  });

  db.ref("customCategories").once("value").then(snapshot => {
    const oldCategories = snapshot.val();
    if (oldCategories) {
      db.ref(`groups/${groupId}/customCategories`).set(oldCategories);
      db.ref("customCategories").remove();
    }
  });
}

function saveGroupName() {
  const newName = els.groupNameInput.value.trim();
  if (!newName || !currentGroupId) return;
  db.ref(`groups/${currentGroupId}/name`).set(newName);
}

function updateMembersList(members) {
  if (!members) return;
  let html = "";
  Object.values(members).forEach(member => {
    html += `
      <li class="member-item">
        <img src="${member.photoURL || 'https://www.gravatar.com/avatar/0000?d=mp'}" class="member-avatar">
        <span class="member-name">${member.name}</span>
        <span class="member-role">${member.role === 'owner' ? 'מנהל' : 'חבר'}</span>
      </li>
    `;
  });
  els.membersList.innerHTML = html;
}

function openSettings() {
  els.settingsModal.classList.remove("hidden");
}

function closeSettings() {
  els.settingsModal.classList.add("hidden");
}

function copyInviteCode() {
  const code = els.displayInviteCode.textContent;
  navigator.clipboard.writeText(code).then(() => {
    const originalText = els.copyInviteCode.textContent;
    els.copyInviteCode.textContent = "הועתק!";
    setTimeout(() => {
      els.copyInviteCode.textContent = originalText;
    }, 2000);
  });
}

// === Firebase Real-time Listeners ===
function detachFirebaseListeners() {
  if (listRef) listRef.off();
  if (catalogRef) catalogRef.off();
  if (templateRef) templateRef.off();
  if (categoriesRef) categoriesRef.off();
  if (groupRef) groupRef.off();
}

function setupFirebaseListeners() {
  detachFirebaseListeners();

  // Listen for group info
  groupRef = db.ref(`groups/${currentGroupId}`);
  groupRef.on("value", (snapshot) => {
    const group = snapshot.val();
    if (!group) return;
    
    els.groupNameInput.value = group.name;
    els.displayInviteCode.textContent = group.inviteCode;
    updateMembersList(group.members);
  });

  // Listen for shopping list changes
  listRef = db.ref(`groups/${currentGroupId}/shoppingList`);
  listRef.on("value", (snapshot) => {
    shoppingList = snapshot.val() || [];
    renderShoppingList();
  });

  // Listen for catalog changes
  catalogRef = db.ref(`groups/${currentGroupId}/catalog`);
  catalogRef.on("value", (snapshot) => {
    const data = snapshot.val();
    if (data === null) {
      catalog = [...SEED_PRODUCTS];
      saveCatalog();
    } else {
      catalog = data;
    }
    renderCatalog(els.sheetSearchInput.value);
    renderSuggested();
  });

  // Listen for template changes
  templateRef = db.ref(`groups/${currentGroupId}/templateList`);
  templateRef.on("value", (snapshot) => {
    templateList = snapshot.val() || [];
    renderTemplate();
    if (isSheetOpen) renderSheetTemplate();
  });

  // Listen for custom categories changes
  categoriesRef = db.ref(`groups/${currentGroupId}/customCategories`);
  categoriesRef.on("value", (snapshot) => {
    const val = snapshot.val();
    customCategories = Array.isArray(val) ? val : (val ? Object.values(val) : []);
    refreshCategorySelects();
    renderCatalog(els.sheetSearchInput.value);
  });

  // Connection status
  const connectedRef = db.ref(".info/connected");
  connectedRef.on("value", (snapshot) => {
    setSyncStatus(snapshot.val() ? "connected" : "disconnected");
  });
}

// === Initialize ===
document.addEventListener("DOMContentLoaded", () => {
  console.log("App initializing...");
  
  // Auth state listener
  auth.onAuthStateChanged(user => {
    console.log("Auth state changed:", user ? user.email : "no user");
    if (user) {
      currentUser = user;
      els.userAvatar.src = user.photoURL || "https://www.gravatar.com/avatar/0000?d=mp";
      els.userName.textContent = user.displayName;
      
      // Look for group
      const userGroupRef = db.ref(`users/${user.uid}/groupId`);
      userGroupRef.on("value", snapshot => {
        const groupId = snapshot.val();
        console.log("User group ID:", groupId);
        if (groupId) {
          currentGroupId = groupId;
          els.loginView.classList.add("hidden");
          els.groupSelectionView.classList.add("hidden");
          els.appContainer.classList.remove("hidden");
          setupFirebaseListeners();
        } else {
          // No group - show selection
          els.loginView.classList.add("hidden");
          els.groupSelectionView.classList.remove("hidden");
          els.appContainer.classList.add("hidden");
          detachFirebaseListeners();
        }
      });
    } else {
      // Not logged in
      console.log("Showing login view");
      currentUser = null;
      currentGroupId = null;
      detachFirebaseListeners();
      els.loginView.classList.remove("hidden");
      els.groupSelectionView.classList.add("hidden");
      els.appContainer.classList.add("hidden");
    }
  });

  attachEventListeners();
});
