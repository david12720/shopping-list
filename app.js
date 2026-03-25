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
const listRef = db.ref("shoppingList");
const catalogRef = db.ref("catalog");

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

// === Firebase Data Helpers ===
function saveShoppingList() {
  listRef.set(shoppingList);
}

function saveCatalog() {
  catalogRef.set(catalog);
}

// === Utility ===
function formatUnit(unit) {
  return unit === "kg" ? 'ק"ג' : "יח'";
}

function formatAmount(amount, unit) {
  const display = unit === "kg" ? amount : Math.floor(amount);
  return `${display} ${formatUnit(unit)}`;
}

// === Modal State ===
let modalContext = null;
let editContext = null;

// === Render Suggested Items ===
function renderSuggested() {
  let html = "";
  SUGGESTED_NAMES.forEach(name => {
    const product = catalog.find(p => p.name === name);
    if (!product) return;
    html += `<button class="suggested-chip" data-name="${product.name}" data-category="${product.category}" data-unit="${product.defaultUnit}">${product.name}</button>`;
  });

  document.getElementById("suggested-items").innerHTML = html;
}

// === DOM References ===
const els = {
  badge: document.getElementById("badge"),
  listView: document.getElementById("list-view"),
  addView: document.getElementById("add-view"),
  emptyState: document.getElementById("empty-state"),
  shoppingList: document.getElementById("shopping-list"),
  listActions: document.getElementById("list-actions"),
  searchInput: document.getElementById("search-input"),
  catalog: document.getElementById("catalog"),
  addCustomBtn: document.getElementById("add-custom-btn"),
  customForm: document.getElementById("custom-form"),
  customName: document.getElementById("custom-name"),
  customSubmit: document.getElementById("custom-submit"),
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

  unpurchased.forEach(item => {
    html += renderListItem(item);
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
      <span class="item-amount">${formatAmount(item.amount, item.unit)}</span>
      <button class="item-delete" title="מחק">✕</button>
    </li>
  `;
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

  CATEGORY_ORDER.forEach(cat => {
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
    html = `<div class="no-results">לא נמצאו מוצרים</div>`;
  }

  els.catalog.innerHTML = html;
}

// === Amount Modal ===
function openAmountModal(name, defaultUnit, category) {
  modalContext = { name, category };
  els.modalProductName.textContent = name;
  setUnit(defaultUnit);
  els.amountInput.value = 1;
  els.modalOverlay.classList.remove("hidden");
}

function closeModal() {
  els.modalOverlay.classList.add("hidden");
  modalContext = null;
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
  addItemToList(modalContext.name, modalContext.category, unit, amount);
  closeModal();
}

// === Edit Product Modal ===
function openEditModal(productId) {
  const product = catalog.find(p => p.id === productId);
  if (!product) return;

  editContext = { id: productId };
  els.editName.value = product.name;

  // Populate category dropdown
  els.editCategory.innerHTML = CATEGORY_ORDER.map(cat =>
    `<option value="${cat}" ${cat === product.category ? "selected" : ""}>${cat}</option>`
  ).join("");

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
  switchTab("list");
}

function addCustomProductToCatalog(name, unit) {
  const alreadyExists = catalog.some(p => p.name === name);
  if (alreadyExists) return;

  catalog.push({
    id: "p_" + Date.now(),
    name,
    category: "שונות",
    defaultUnit: unit || "units",
  });
  saveCatalog();
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
  els.addView.classList.toggle("active", tabName === "add");
}

// === Event Listeners ===
function attachEventListeners() {
  // Tab clicks
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  // Shopping list — event delegation
  els.shoppingList.addEventListener("click", (e) => {
    const li = e.target.closest(".list-item");
    if (!li) return;
    const id = li.dataset.id;

    if (e.target.classList.contains("item-checkbox")) {
      togglePurchased(id);
    } else if (e.target.classList.contains("item-delete")) {
      removeItem(id);
    }
  });

  // Clear buttons
  els.clearPurchased.addEventListener("click", clearPurchased);
  els.clearAll.addEventListener("click", clearAll);

  // Search
  els.searchInput.addEventListener("input", (e) => {
    renderCatalog(e.target.value);
  });

  // Catalog — event delegation
  els.catalog.addEventListener("click", (e) => {
    const header = e.target.closest(".category-header");
    if (header) {
      header.classList.toggle("open");
      const items = header.nextElementSibling;
      items.classList.toggle("open");
      return;
    }

    const catalogItem = e.target.closest(".catalog-item");
    if (!catalogItem) return;

    if (e.target.closest(".catalog-item-add")) {
      openAmountModal(catalogItem.dataset.name, catalogItem.dataset.unit, catalogItem.dataset.category);
    } else if (e.target.closest(".catalog-item-edit")) {
      openEditModal(catalogItem.dataset.id);
    } else if (e.target.closest(".catalog-item-remove")) {
      removeCatalogProduct(catalogItem.dataset.id);
    }
  });

  // Suggested items — event delegation
  document.getElementById("suggested-items").addEventListener("click", (e) => {
    const chip = e.target.closest(".suggested-chip");
    if (chip) {
      openAmountModal(chip.dataset.name, chip.dataset.unit, chip.dataset.category);
    }
  });

  // Custom item
  els.addCustomBtn.addEventListener("click", () => {
    els.customForm.classList.toggle("hidden");
    if (!els.customForm.classList.contains("hidden")) {
      els.customName.focus();
    }
  });

  els.customSubmit.addEventListener("click", submitCustomItem);
  els.customName.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitCustomItem();
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
}

function submitCustomItem() {
  const name = els.customName.value.trim();
  if (!name) return;
  els.customName.value = "";
  els.customForm.classList.add("hidden");
  // Add to catalog first, then open amount modal
  addCustomProductToCatalog(name, "units");
  openAmountModal(name, "units", "שונות");
}

// === Firebase Real-time Listeners ===
function setupFirebaseListeners() {
  // Listen for shopping list changes
  listRef.on("value", (snapshot) => {
    shoppingList = snapshot.val() || [];
    renderShoppingList();
  });

  // Listen for catalog changes
  catalogRef.on("value", (snapshot) => {
    const data = snapshot.val();
    if (data === null) {
      // First run — seed the catalog
      catalog = [...SEED_PRODUCTS];
      saveCatalog();
    } else {
      catalog = data;
    }
    renderCatalog(els.searchInput.value);
    renderSuggested();
  });

  // Connection status
  const connectedRef = db.ref(".info/connected");
  connectedRef.on("value", (snapshot) => {
    setSyncStatus(snapshot.val() ? "connected" : "disconnected");
  });
}

// === Initialize ===
document.addEventListener("DOMContentLoaded", () => {
  renderSuggested();
  renderCatalog("");
  attachEventListeners();
  setupFirebaseListeners();
});
