/**
 * UI Module
 * Responsibility: Handle all DOM manipulation, rendering, and view management.
 */
const AppUI = (() => {
  const els = {
    // Auth & Loading
    loadingView: document.getElementById("loading-view"),
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
    syncStatus: document.getElementById("sync-status"),
    badge: document.getElementById("badge"),
    
    // Views
    listView: document.getElementById("list-view"),
    templateView: document.getElementById("template-view"),
    
    // List Elements
    emptyState: document.getElementById("empty-state"),
    shoppingList: document.getElementById("shopping-list"),
    listActions: document.getElementById("list-actions"),
    clearPurchased: document.getElementById("clear-purchased"),
    clearAll: document.getElementById("clear-all"),
    
    // Template Elements
    templateEmptyState: document.getElementById("template-empty-state"),
    templateList: document.getElementById("template-list"),
    addToTemplateBtn: document.getElementById("add-to-template-btn"),
    addAllTemplateBtn: document.getElementById("add-all-template"),
    
    // Settings Modal
    settingsModal: document.getElementById("settings-modal"),
    groupNameInput: document.getElementById("group-name-input"),
    saveGroupName: document.getElementById("save-group-name"),
    displayInviteCode: document.getElementById("display-invite-code"),
    refreshInviteCode: document.getElementById("refresh-invite-code"),
    copyInviteCode: document.getElementById("copy-invite-code"),
    membersList: document.getElementById("members-list"),
    leaveGroupBtn: document.getElementById("leave-group-btn"),
    closeSettings: document.getElementById("close-settings"),

    // Amount Modal
    modalOverlay: document.getElementById("modal-overlay"),
    modalProductName: document.getElementById("modal-product-name"),
    amountInput: document.getElementById("amount-input"),
    amountMinus: document.getElementById("amount-minus"),
    amountPlus: document.getElementById("amount-plus"),
    modalConfirm: document.getElementById("modal-confirm"),
    modalCancel: document.getElementById("modal-cancel"),

    // Edit Modal
    editModalOverlay: document.getElementById("edit-modal-overlay"),
    editName: document.getElementById("edit-name"),
    editCategory: document.getElementById("edit-category"),
    editSave: document.getElementById("edit-save"),
    editCancel: document.getElementById("edit-cancel"),

    // FAB
    fabAdd: document.getElementById("fab-add"),
    fabAi: document.getElementById("fab-ai"),

    // AI Modal
    aiModal: document.getElementById("ai-modal-overlay"),
    aiPromptContainer: document.getElementById("ai-prompt-container"),
    aiLoadingContainer: document.getElementById("ai-loading-container"),
    aiInput: document.getElementById("ai-input"),
    aiRecordBtn: document.getElementById("ai-record-btn"),
    aiSendBtn: document.getElementById("ai-send-btn"),
    aiCancelBtn: document.getElementById("ai-cancel-btn"),
    aiStatus: document.getElementById("ai-status"),
    aiReviewContainer: document.getElementById("ai-review-container"),
    aiReviewList: document.getElementById("ai-review-list"),
    aiConfirmBtn: document.getElementById("ai-confirm-btn"),
    aiBackBtn: document.getElementById("ai-back-btn"),
    aiAttachBtn: document.getElementById("ai-attach-btn"),
    aiFileInput: document.getElementById("ai-file-input"),
    aiFilePreview: document.getElementById("ai-file-preview"),
    aiPreviewImg: document.getElementById("ai-preview-img"),
    aiRemoveFile: document.getElementById("ai-remove-file"),

    // Bottom Sheet
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

  function setSyncStatus(connected) {
    if (connected) {
      els.syncStatus.textContent = "●";
      els.syncStatus.title = "מחובר";
      els.syncStatus.className = "sync-status connected";
    } else {
      els.syncStatus.textContent = "●";
      els.syncStatus.title = "לא מחובר";
      els.syncStatus.className = "sync-status disconnected";
    }
  }

  function renderShoppingList(state) {
    const list = state.shoppingList;
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
    const grouped = {};
    unpurchased.forEach(item => {
      const cat = item.category || "כללי";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    Object.entries(grouped).forEach(([category, items]) => {
      const collapsed = state.collapsedCategories.has(category);
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
        <span class="item-amount item-amount-edit">${AppUtils.formatAmount(item.amount, item.unit)}</span>
        <button class="item-delete" title="מחק">✕</button>
      </li>
    `;
  }

  function renderTemplate(state) {
    const list = state.templateList;
    const hasItems = list.length > 0;

    if (!hasItems) {
      els.templateList.innerHTML = "";
      els.templateEmptyState.classList.remove("hidden");
      els.addAllTemplateBtn.classList.add("hidden");
      return;
    }

    els.templateEmptyState.classList.add("hidden");
    els.addAllTemplateBtn.classList.remove("hidden");

    els.templateList.innerHTML = list.map(item => `
      <li class="list-item" data-id="${item.id}">
        <span class="item-name">${item.name}</span>
        <span class="item-amount item-amount-edit">${AppUtils.formatAmount(item.amount, item.unit)}</span>
        <button class="item-add-to-list" title="הוסף לרשימה">+</button>
        <button class="item-delete" title="מחק">✕</button>
      </li>
    `).join("");
  }

  function renderCatalog(state) {
    const filterText = (els.sheetSearchInput.value || "").trim();
    const grouped = {};
    const constants = AppStore.getConstants();
    const allCategories = AppStore.getAllCategories();

    constants.CATEGORY_ORDER.forEach(cat => { grouped[cat] = []; });

    state.catalog.forEach(product => {
      if (filterText && !product.name.includes(filterText)) return;
      if (!grouped[product.category]) grouped[product.category] = [];
      grouped[product.category].push(product);
    });

    let html = "";
    let hasResults = false;

    allCategories.forEach(cat => {
      const items = grouped[cat];
      if (!items || items.length === 0) return;
      hasResults = true;

      const isOpen = !state.collapsedCategories.has(cat);
      html += `
        <div class="category">
          <div class="category-header ${isOpen ? 'open' : ''}" data-category="${cat}">
            <span>${cat}</span>
          </div>
          <div class="category-items ${isOpen ? 'open' : ''}">
      `;

      items.forEach(product => {
        html += `
          <div class="catalog-item" data-id="${product.id}" data-name="${product.name}" data-category="${product.category}">
            <div class="catalog-item-top">
              <span class="catalog-item-name">${product.name}</span>
              <div class="catalog-item-meta">
                <button class="catalog-item-edit" title="ערוך">✎</button>
                <button class="catalog-item-remove" title="מחק">✕</button>
              </div>
            </div>
            
            <div class="catalog-item-bottom">
              <div class="catalog-item-controls">
                <select class="catalog-unit-select">
                  <option value="units" selected>יח'</option>
                  <option value="kg">ק"ג</option>
                </select>
                <div class="qty-group">
                  <button class="qty-btn minus" title="הפחת">-</button>
                  <input type="number" class="qty-input" value="1" step="1" min="1">
                  <button class="qty-btn plus" title="הוסף">+</button>
                </div>
              </div>
              <button class="catalog-item-add" title="הוסף לרשימה">הוסף</button>
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

  function renderSuggested(state) {
    const constants = AppStore.getConstants();
    let html = "";
    constants.SUGGESTED_NAMES.forEach(name => {
      const product = state.catalog.find(p => p.name === name);
      if (!product) return;
      html += `<button class="suggested-chip" data-name="${product.name}" data-category="${product.category}" data-unit="${product.defaultUnit}">${product.name}</button>`;
    });
    els.sheetSuggestedItems.innerHTML = html;
  }

  function renderMembers(state) {
    if (!state.group || !state.group.members) return;
    const isOwner = state.group.ownerId === state.currentUser.uid;
    let html = "";
    
    Object.entries(state.group.members).forEach(([uid, member]) => {
      const isMe = uid === state.currentUser.uid;
      const canRemove = isOwner && !isMe;
      
      html += `
        <li class="member-item" data-uid="${uid}">
          <img src="${member.photoURL || 'https://www.gravatar.com/avatar/0000?d=mp'}" class="member-avatar">
          <span class="member-name">${member.name}${isMe ? ' (אני)' : ''}</span>
          <span class="member-role">${member.role === 'owner' ? 'מנהל' : 'חבר'}</span>
          ${canRemove ? `<button class="member-remove" title="הסר מהקבוצה">✕</button>` : ''}
        </li>
      `;
    });
    els.membersList.innerHTML = html;
  }

  function refreshCategorySelects() {
    const all = AppStore.getAllCategories();
    const opts = all.map(cat => `<option value="${cat}">${cat}</option>`).join("")
      + `<option value="__new__">+ קטגוריה חדשה...</option>`;

    [els.sheetCustomCategory, els.editCategory].forEach(el => {
      if (!el) return;
      const prev = el.value;
      el.innerHTML = opts;
      if (all.includes(prev)) el.value = prev;
    });
  }

  function showToast(message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    
    if (toast.timeout) clearTimeout(toast.timeout);
    toast.timeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  }

  return {
    els,
    refreshCategorySelects,
    setSyncStatus,
    showToast,
    
    render(state) {
      // Views visibility
      if (!state.currentUser) {
        els.loadingView.classList.toggle("hidden", !!state.currentUser); // Wait, if no user and not initializing?
        // Logic for which view to show belongs in app.js controller, 
        // but UI provides the methods.
      }

      if (state.currentUser && state.currentGroupId) {
        renderShoppingList(state);
        renderTemplate(state);
        renderCatalog(state);
        renderSuggested(state);
        renderMembers(state);
        
        els.userAvatar.src = state.currentUser.photoURL || "https://www.gravatar.com/avatar/0000?d=mp";
        els.userName.textContent = state.currentUser.displayName;
        els.groupNameInput.value = state.group ? state.group.name : "";
        els.displayInviteCode.textContent = state.group ? state.group.inviteCode : "------";
        els.refreshInviteCode.classList.toggle("hidden", state.group?.ownerId !== state.currentUser.uid);
      }
    },

    showView(viewName) {
      els.loadingView.classList.add("hidden");
      els.loginView.classList.add("hidden");
      els.groupSelectionView.classList.add("hidden");
      els.appContainer.classList.add("hidden");

      if (viewName === "loading") els.loadingView.classList.remove("hidden");
      if (viewName === "login") els.loginView.classList.remove("hidden");
      if (viewName === "selection") els.groupSelectionView.classList.remove("hidden");
      if (viewName === "app") els.appContainer.classList.remove("hidden");
    },

    showAiPrompt() {
      els.aiInput.value = "";
      els.aiSendBtn.disabled = true;
      els.aiRecordBtn.classList.remove("recording");
      els.aiPromptContainer.classList.remove("hidden");
      els.aiReviewContainer.classList.add("hidden");
      els.aiLoadingContainer.classList.add("hidden");
      els.aiFilePreview.classList.add("hidden");
      els.aiReviewList.innerHTML = "";
      els.aiModal.classList.remove("hidden");
      setTimeout(() => els.aiInput.focus(), 100);
    },

    showAiLoading(statusText) {
      els.aiStatus.textContent = statusText || "מפענח את הבקשה שלך...";
      els.aiPromptContainer.classList.add("hidden");
      els.aiReviewContainer.classList.add("hidden");
      els.aiLoadingContainer.classList.remove("hidden");
      els.aiModal.classList.remove("hidden");
    },

    showAiReview(items, categories) {
      els.aiPromptContainer.classList.add("hidden");
      els.aiLoadingContainer.classList.add("hidden");
      els.aiReviewContainer.classList.remove("hidden");
      
      els.aiReviewList.innerHTML = "";
      items.forEach((item, index) => {
        els.aiReviewList.appendChild(this.renderReviewItem(item, index, categories));
      });
    },

    renderReviewItem(item, index, categories) {
      const row = document.createElement("div");
      row.className = "review-row";
      if (item.isExisting) row.classList.add("existing-item");
      row.dataset.index = index;

      // Checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      checkbox.className = "review-check";

      // Name
      const name = document.createElement("input");
      name.type = "text";
      name.value = item.name;
      name.className = "review-name";
      if (item.isExisting) name.disabled = true;

      // Amount
      const amount = document.createElement("input");
      amount.type = "number";
      amount.value = item.amount || 1;
      amount.step = "0.1";
      amount.className = "review-amount";

      // Unit
      const unit = document.createElement("select");
      unit.className = "review-unit";
      ["units", "kg"].forEach(u => {
        const opt = document.createElement("option");
        opt.value = u;
        opt.textContent = u === "units" ? "יח'" : "ק\"ג";
        opt.selected = item.unit === u;
        unit.appendChild(opt);
      });

      // Category
      const cat = document.createElement("select");
      cat.className = "review-category";
      if (item.isExisting) cat.disabled = true;
      
      categories.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        opt.selected = item.category === c;
        cat.appendChild(opt);
      });

      row.append(checkbox, name, amount, unit, cat);
      return row;
    },

    hideAiLoading() {
      els.aiModal.classList.add("hidden");
    },

  };
})();
