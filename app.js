/**
 * App Module (Controller)
 * Responsibility: Orchestrate API, Store, and UI. Handle user interactions.
 */
const AppController = (() => {
  const { els } = AppUI;

  // === Event Listeners ===
  function setupEventListeners() {
    // Auth
    els.googleLoginBtn.addEventListener("click", () => AppAPI.signInWithGoogle());
    els.logoutBtn.addEventListener("click", () => AppAPI.signOut());
    els.selectionLogoutBtn.addEventListener("click", () => AppAPI.signOut());

    // Group Selection
    els.showCreateGroup.addEventListener("click", handleCreateGroup);
    els.joinGroupBtn.addEventListener("click", () => handleJoinGroup(els.joinInviteCode.value));

    // Settings
    els.settingsBtn.addEventListener("click", () => els.settingsModal.classList.remove("hidden"));
    els.closeSettings.addEventListener("click", () => els.settingsModal.classList.add("hidden"));
    els.settingsModal.addEventListener("click", (e) => { if (e.target === els.settingsModal) els.settingsModal.classList.add("hidden"); });
    els.saveGroupName.addEventListener("click", handleSaveGroupName);
    els.refreshInviteCode.addEventListener("click", handleRefreshInviteCode);
    els.leaveGroupBtn.addEventListener("click", handleLeaveGroup);
    els.copyInviteCode.addEventListener("click", handleCopyInviteCode);

    // Tabs
    document.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => switchTab(tab.dataset.tab));
    });

    // FAB
    els.fabAdd.addEventListener("click", () => {
      const activeTab = document.querySelector(".tab.active");
      const target = activeTab && activeTab.dataset.tab === "template" ? "template" : "list";
      openSheet(target);
    });

    els.fabAi.addEventListener("click", handleAiAdd);

    // Shopping List Actions
    els.shoppingList.addEventListener("click", handleListClick);
    els.clearPurchased.addEventListener("click", handleClearPurchased);
    els.clearAll.addEventListener("click", handleClearAll);

    // Template Actions
    els.templateList.addEventListener("click", handleTemplateClick);
    els.addToTemplateBtn.addEventListener("click", () => openSheet("template"));
    els.addAllTemplateBtn.addEventListener("click", handleAddAllTemplate);

    // Bottom Sheet
    els.sheetClose.addEventListener("click", closeSheet);
    els.sheetOverlay.addEventListener("click", (e) => { if (e.target === els.sheetOverlay) closeSheet(); });
    els.sheetSearchInput.addEventListener("input", () => AppUI.render(AppStore.getState()));
    els.sheetTemplateToggle.addEventListener("click", () => {
      els.sheetTemplateContent.classList.toggle("hidden");
      els.sheetTemplateChevron.classList.toggle("open");
    });
    els.sheetAddAllTemplate.addEventListener("click", handleAddAllTemplate);
    els.sheetSuggestedItems.addEventListener("click", handleSuggestedClick);
    els.sheetAddCustomBtn.addEventListener("click", () => {
      els.sheetCustomForm.classList.toggle("hidden");
      if (!els.sheetCustomForm.classList.contains("hidden")) els.sheetCustomName.focus();
    });
    els.sheetCustomSubmit.addEventListener("click", handleSubmitCustomItem);
    els.sheetCustomName.addEventListener("keydown", (e) => { if (e.key === "Enter") handleSubmitCustomItem(); });
    els.sheetCatalog.addEventListener("click", handleCatalogClick);

    // Modals
    els.modalOverlay.addEventListener("click", (e) => { if (e.target === els.modalOverlay) closeModal(); });
    els.modalConfirm.addEventListener("click", handleModalConfirm);
    els.modalCancel.addEventListener("click", closeModal);
    els.amountMinus.addEventListener("click", () => adjustAmount(-1));
    els.amountPlus.addEventListener("click", () => adjustAmount(1));
    document.querySelectorAll("#modal-overlay .unit-btn").forEach(btn => {
      btn.addEventListener("click", () => setUnit(btn.dataset.unit));
    });

    els.editModalOverlay.addEventListener("click", (e) => { if (e.target === els.editModalOverlay) closeEditModal(); });
    els.editSave.addEventListener("click", handleSaveEditProduct);
    els.editCancel.addEventListener("click", closeEditModal);
    document.querySelectorAll(".edit-unit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".edit-unit-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // Category changes
    [els.sheetCustomCategory, els.editCategory].forEach(el => {
      el.addEventListener("change", () => handleCategoryChange(el));
    });

    // Members list
    els.membersList.addEventListener("click", handleMemberAction);

    // AI Modal
    els.aiInput.addEventListener("input", () => {
      els.aiSendBtn.disabled = !els.aiInput.value.trim() && !AiProcessor.attachedFile;
    });
    els.aiInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !els.aiSendBtn.disabled) {
        e.preventDefault();
        handleAiSend();
      }
    });
    els.aiSendBtn.addEventListener("click", handleAiSend);
    els.aiCancelBtn.addEventListener("click", () => {
      if (recognition) {
        recognition.stop();
        els.aiRecordBtn.classList.remove("recording");
      }
      AppUI.hideAiLoading();
    });
    els.aiRecordBtn.addEventListener("click", toggleAiRecording);
    els.aiRecipeBtn.addEventListener("click", () => AiProcessor.toggleRecipeMode());

    // AI Image Upload

    els.aiAttachBtn.addEventListener("click", () => els.aiFileInput.click());
    els.aiFileInput.addEventListener("change", (e) => AiProcessor.handleFileSelect(e));
    els.aiRemoveFile.addEventListener("click", () => AiProcessor.removeFile());
    
    // AI Review
    els.aiBackBtn.addEventListener("click", () => {
      AiProcessor.reset();
      AppUI.showAiPrompt();
    });
    els.aiConfirmBtn.addEventListener("click", () => AiProcessor.confirmReview());
  }

  // === AI Processor (SOLID Orchestrator) ===
  const AiProcessor = {
    attachedFile: null,
    recipeMode: false,
    extractedItems: [],
    provider: null, // Will be set to GeminiProvider

    reset() {
      this.recipeMode = false;
      this.attachedFile = null;
      this.extractedItems = [];
      els.aiRecipeBtn.classList.remove("active");
      const promptTitle = els.aiPromptContainer.querySelector("h3");
      const promptHelp = els.aiPromptContainer.querySelector(".ai-help");
      promptTitle.textContent = "מה להוסיף לרשימה? ✨";
      promptHelp.textContent = "למשל: \"3 קילו עגבניות\" או צרף צילום של רשימה/מתכון";
      els.aiInput.placeholder = "הקלד או הקלט את הבקשה...";
    },

    toggleRecipeMode() {
      this.recipeMode = !this.recipeMode;
      els.aiRecipeBtn.classList.toggle("active", this.recipeMode);
      
      const promptTitle = els.aiPromptContainer.querySelector("h3");
      const promptHelp = els.aiPromptContainer.querySelector(".ai-help");
      
      if (this.recipeMode) {
        promptTitle.textContent = "מה תרצו להכין היום? 🧑‍🍳";
        promptHelp.textContent = "למשל: \"אני רוצה להכין כדורי פלאפל\"";
        els.aiInput.placeholder = "תאר את המנה או המאכל...";
        // Clear file if recipe mode is on
        this.removeFile();
      } else {
        promptTitle.textContent = "מה להוסיף לרשימה? ✨";
        promptHelp.textContent = "למשל: \"3 קילו עגבניות\" או צרף צילום של רשימה/מתכון";
        els.aiInput.placeholder = "הקלד או הקלט את הבקשה...";
      }
    },

    handleFileSelect(e) {
      const file = e.target.files[0];
      if (!file) return;

      // If recipe mode is on, turn it off when selecting a file
      if (this.recipeMode) {
        this.recipeMode = false;
        els.aiRecipeBtn.classList.remove("active");
        const promptTitle = els.aiPromptContainer.querySelector("h3");
        const promptHelp = els.aiPromptContainer.querySelector(".ai-help");
        promptTitle.textContent = "מה להוסיף לרשימה? ✨";
        promptHelp.textContent = "למשל: \"3 קילו עגבניות\" או צרף צילום של רשימה/מתכון";
        els.aiInput.placeholder = "הקלד או הקלט את הבקשה...";
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        this.attachedFile = event.target.result; // Base64
        els.aiPreviewImg.src = this.attachedFile;
        els.aiFilePreview.classList.remove("hidden");
        els.aiSendBtn.disabled = false;
      };
      reader.readAsDataURL(file);
    },

    removeFile() {
      this.attachedFile = null;
      els.aiFileInput.value = "";
      els.aiFilePreview.classList.add("hidden");
      els.aiSendBtn.disabled = !els.aiInput.value.trim();
    },

    async process(text) {
      const { catalog } = AppStore.getState();
      const categories = AppStore.getAllCategories();
      
      let loadingMsg = "מנתח את הטקסט...";
      if (this.attachedFile) loadingMsg = "קורא את התמונה...";
      if (this.recipeMode) loadingMsg = "מכין לך רשימה למנה...";

      AppUI.showAiLoading(loadingMsg);

      try {
        const response = await this.provider.process(text, this.attachedFile, catalog, categories, this.recipeMode);
        
        if (response && response.items) {
          // Flag existing items and sync their categories
          this.extractedItems = response.items.map(item => {
            const catalogItem = Object.values(catalog).find(
              c => c.name.toLowerCase().trim() === item.name.toLowerCase().trim()
            );
            return {
              ...item,
              isExisting: !!catalogItem,
              // Use existing category if found, otherwise keep AI guess
              category: catalogItem ? catalogItem.category : item.category
            };
          });
          AppUI.showAiReview(this.extractedItems, categories);
        } else {
          throw new Error("לא נמצאו מוצרים");
        }
      } catch (error) {
        console.error("AI Processor Error:", error);
        alert("שגיאה בעיבוד: " + error.message);
        AppUI.showAiPrompt();
      }
    },

    async confirmReview() {
      const rows = els.aiReviewList.querySelectorAll(".review-row");
      const selectedItems = [];
      const { catalog } = AppStore.getState();
      const categories = AppStore.getAllCategories();

      rows.forEach(row => {
        const checkbox = row.querySelector(".review-check");
        if (checkbox.checked) {
          selectedItems.push({
            name: row.querySelector(".review-name").value,
            amount: parseFloat(row.querySelector(".review-amount").value),
            unit: row.querySelector(".review-unit").value,
            category: row.querySelector(".review-category").value
          });
        }
      });

      if (selectedItems.length === 0) return;

      AppUI.showAiLoading("מעדכן את הרשימה...");
      
      try {
        const addedNames = [];
        for (const item of selectedItems) {
          // Find or Create in catalog
          let catalogItem = Object.values(catalog).find(
            c => c.name.toLowerCase().trim() === item.name.toLowerCase().trim()
          );

          if (!catalogItem) {
            const newId = "p_" + Date.now() + Math.random().toString(36).substr(2, 5);
            catalogItem = {
              id: newId,
              name: item.name,
              category: item.category,
              defaultUnit: item.unit
            };
            await AppAPI.saveCatalogItem(catalogItem);
          }

          // Add to list
          const newItem = {
            id: "item_" + Date.now() + Math.random().toString(36).substr(2, 5),
            name: item.name,
            category: catalogItem.category,
            unit: item.unit,
            amount: item.amount,
            purchased: false
          };
          await AppAPI.addListItem(newItem);
          addedNames.push(item.name);
        }

        AppUI.showToast(`${addedNames.length} מוצרים נוספו לרשימה`);
        AppUI.hideAiLoading();
        this.removeFile();
      } catch (error) {
        console.error("Confirm Review Error:", error);
        alert("שגיאה בשמירת המוצרים");
        AppUI.hideAiLoading();
      }
    }
  };

  // === AI Provider Implementation (SOLID Strategy) ===
  const GeminiProvider = {
    async process(text, fileData, catalog, categories, recipeMode) {
      // Logic for calling Firebase Cloud Function with Gemini 2.5 Flash Lite
      // We pass categories so the AI can guess them correctly
      const context = {
        catalogNames: Object.values(catalog).map(p => p.name),
        categories: categories
      };
      
      // Default extraction prompt
      let promptText = text || "Extract all food items from this image/text.";
      
      // Special prompt for recipe mode
      if (recipeMode) {
        promptText = `Suggest ingredients for the following dish: "${text}". 
        Be concise and list standard items that would be found in a grocery store.
        If the user didn't specify a dish, just say you're ready to help with recipes.`;
      }

      const payload = {
        text: promptText,
        fileData: fileData, // Base64
        context: context,
        mode: recipeMode ? 'recipe' : 'extract'
      };

      return await AppAPI.processAiRequest(payload);
    }
  };

  // Initialize Processor with Gemini
  AiProcessor.provider = GeminiProvider;

  // === Handlers ===
  function handleAiAdd() {
    AiProcessor.reset();
    AppUI.showAiPrompt();
  }

  async function handleAiSend() {
    const text = els.aiInput.value.trim();
    if (!text && !AiProcessor.attachedFile) return;

    // Stop recording if active (iPhone fix)
    if (recognition) {
      recognition.stop();
      els.aiRecordBtn.classList.remove("recording");
    }

    await AiProcessor.process(text);
  }

  let recognition;
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.lang = "he-IL";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        els.aiRecordBtn.classList.add("recording");
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join("");
        
        els.aiInput.value = transcript;
        els.aiSendBtn.disabled = !els.aiInput.value.trim();
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        els.aiRecordBtn.classList.remove("recording");
      };

      recognition.onend = () => {
        els.aiRecordBtn.classList.remove("recording");
      };
    }
  }

  function toggleAiRecording() {
    if (!recognition) {
      alert("חיפוש קולי לא נתמך בדפדפן זה");
      return;
    }

    if (els.aiRecordBtn.classList.contains("recording")) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (e) {
        console.warn("Recognition already started", e);
      }
    }
  }

  async function processAiItem(aiItem) {
    const { catalog, shoppingList, customCategories } = AppStore.getState();
    let product = findProductByName(aiItem.name);

    if (!product) {
      const categories = AppStore.getAllCategories();
      const catList = categories.map((c, i) => `${i + 1}. ${c}`).join("\n");
      const choice = prompt(`המוצר "${aiItem.name}" לא מוכר. באיזו קטגוריה הוא?\n${catList}\n${categories.length + 1}. + קטגוריה חדשה...`, "1");

      if (choice) {
        let category;
        const index = parseInt(choice);

        if (index === categories.length + 1) {
          const newCat = prompt("שם הקטגוריה החדשה:");
          if (newCat && newCat.trim()) {
            category = newCat.trim();
            if (!customCategories.includes(category)) {
              customCategories.push(category);
              AppStore.setState({ customCategories });
              saveCustomCategories();
              AppUI.refreshCategorySelects();
            }
          } else {
            category = "שונות";
          }
        } else {
          category = categories[index - 1] || "שונות";
        }

        product = {
          id: "p_" + Date.now() + Math.random().toString(36).substr(2, 5),
          name: aiItem.name,
          category: category,
          defaultUnit: aiItem.unit || "units"
        };

        catalog.push(product);
        AppStore.setState({ catalog });
        saveCatalog();
      } else {
        return null; // User cancelled this item
      }
    }

    // Add to shopping list
    const existing = shoppingList.find(i => i.name === product.name && !i.purchased);
    const amount = aiItem.amount || 1;
    const unit = aiItem.unit || product.defaultUnit;

    if (existing) {
      if (confirm(`"${product.name}" כבר נמצא ברשימה. להוסיף לכמות הקיימת?`)) {
        existing.amount = Math.round((existing.amount + amount) * 10) / 10;
      } else {
        return null; // Skip this item
      }
    } else {
      shoppingList.push({
        id: "item_" + Date.now() + Math.random().toString(36).substr(2, 5),
        name: product.name,
        category: product.category,
        unit: unit,
        amount: amount,
        purchased: false
      });
    }

    AppStore.setState({ shoppingList });
    saveShoppingList();

    // Return summary string
    return `${amount > 1 ? amount + " " : ""}${product.name}`;
  }
  function findProductByName(name) {
    const { catalog } = AppStore.getState();
    return catalog.find(p => p.name === name || p.name.includes(name) || name.includes(p.name));
  }

  async function handleCreateGroup() {
    const name = prompt("שם הקבוצה החדשה:", "המשפחה שלי");
    if (!name) return;
    const { currentUser } = AppStore.getState();
    const { SEED_PRODUCTS } = AppStore.getConstants();
    const groupId = await AppAPI.createGroup(
      currentUser.uid, 
      currentUser.displayName, 
      currentUser.email, 
      currentUser.photoURL, 
      name, 
      SEED_PRODUCTS
    );
    await AppAPI.migrateOldData(groupId);
  }

  async function handleJoinGroup(code) {
    if (!code || code.length !== 6) return alert("קוד הזמנה חייב להיות בן 6 תווים");
    try {
      const { currentUser } = AppStore.getState();
      await AppAPI.joinGroupByCode(
        currentUser.uid, 
        currentUser.displayName, 
        currentUser.email, 
        currentUser.photoURL, 
        code
      );
    } catch (e) {
      alert("קוד הזמנה לא תקין");
    }
  }

  async function handleLeaveGroup() {
    const { currentUser, currentGroupId } = AppStore.getState();
    if (!currentGroupId || !confirm("האם אתה בטוח שברצונך לעזוב את הקבוצה?")) return;
    await AppAPI.leaveGroup(currentUser.uid, currentGroupId);
    els.settingsModal.classList.add("hidden");
  }

  async function handleSaveGroupName() {
    const { currentGroupId } = AppStore.getState();
    const newName = els.groupNameInput.value.trim();
    if (newName && currentGroupId) await AppAPI.updateGroupName(currentGroupId, newName);
  }

  async function handleRefreshInviteCode() {
    const { currentGroupId, group } = AppStore.getState();
    if (!currentGroupId || !confirm("להחליף קוד? הקוד הישן יבוטל.")) return;
    await AppAPI.refreshInviteCode(currentGroupId, group.inviteCode);
  }

  function handleCopyInviteCode() {
    const code = els.displayInviteCode.textContent;
    navigator.clipboard.writeText(code).then(() => {
      const btn = els.copyInviteCode;
      const original = btn.textContent;
      btn.textContent = "הועתק!";
      setTimeout(() => btn.textContent = original, 2000);
    });
  }

  function handleListClick(e) {
    const header = e.target.closest(".list-category-header");
    if (header) return AppStore.toggleCategory(header.dataset.category);

    const li = e.target.closest(".list-item");
    if (!li) return;
    const id = li.dataset.id;
    const item = AppStore.getState().shoppingList.find(i => i.id === id);

    if (e.target.classList.contains("item-checkbox")) {
      item.purchased = !item.purchased;
      saveShoppingList();
    } else if (e.target.classList.contains("item-delete")) {
      const newList = AppStore.getState().shoppingList.filter(i => i.id !== id);
      AppStore.setState({ shoppingList: newList });
      saveShoppingList();
    } else if (e.target.classList.contains("item-amount-edit") && item) {
      openAmountModal(item.name, item.unit, item.category, id, "list");
    }
  }

  function handleTemplateClick(e) {
    const li = e.target.closest(".list-item");
    if (!li) return;
    const id = li.dataset.id;
    const item = AppStore.getState().templateList.find(i => i.id === id);

    if (e.target.classList.contains("item-delete")) {
      const newList = AppStore.getState().templateList.filter(i => i.id !== id);
      AppStore.setState({ templateList: newList });
      saveTemplate();
    } else if (e.target.classList.contains("item-add-to-list") && item) {
      if (addItemToList(item.name, item.amount, item.unit, item.category, null, "list")) {
        AppUI.showToast(`"${item.name}" נוסף לרשימה`);
      }
    } else if (e.target.classList.contains("item-amount-edit") && item) {
      openAmountModal(item.name, item.unit, item.category, id, "template");
    }
  }

  function handleSuggestedClick(e) {
    const chip = e.target.closest(".suggested-chip");
    if (chip) {
      const { name, unit, category } = chip.dataset;
      const target = AppStore.getState().addingToTarget;
      if (addItemToList(name, 1, unit, category, null, target)) {
        AppUI.showToast(`"${name}" נוסף לרשימה`);
      }
    }
  }

  function handleCatalogClick(e) {
    const header = e.target.closest(".category-header");
    if (header) {
      AppStore.toggleCategory(header.dataset.category);
      return;
    }

    const noResultsAdd = e.target.closest(".no-results-add");
    if (noResultsAdd) {
      els.sheetCustomName.value = noResultsAdd.dataset.name;
      els.sheetCustomForm.classList.remove("hidden");
      els.sheetCustomName.focus();
      return;
    }

    const itemEl = e.target.closest(".catalog-item");
    if (!itemEl) return;

    // Inline Quantity Controls
    const qtyInput = itemEl.querySelector(".qty-input");
    const unitSelect = itemEl.querySelector(".catalog-unit-select");

    if (e.target.closest(".plus")) {
      qtyInput.value = parseInt(qtyInput.value) + 1;
      return;
    }
    if (e.target.closest(".minus")) {
      const val = parseInt(qtyInput.value) - 1;
      if (val >= 1) qtyInput.value = val;
      return;
    }
    if (e.target.closest(".catalog-unit-select")) {
      // Always step 1 and min 1 now
      qtyInput.step = "1";
      qtyInput.min = "1";
      qtyInput.value = Math.max(1, Math.round(qtyInput.value));
      return;
    }

    if (e.target.closest(".catalog-item-add")) {
      const { name, category } = itemEl.dataset;
      const amount = parseFloat(qtyInput.value) || 1;
      const unit = unitSelect.value;
      const target = AppStore.getState().addingToTarget;
      
      if (addItemToList(name, amount, unit, category, null, target)) {
        AppUI.showToast(`"${name}" נוסף לרשימה`);
      }
      return;
    }

    if (e.target.closest(".catalog-item-edit")) {
      openEditModal(itemEl.dataset.id);
    } else if (e.target.closest(".catalog-item-remove")) {
      const { catalog } = AppStore.getState();
      const product = catalog.find(p => p.id === itemEl.dataset.id);
      if (confirm(`למחוק את "${product.name}"?`)) {
        const newList = catalog.filter(p => p.id !== itemEl.dataset.id);
        AppStore.setState({ catalog: newList });
        saveCatalog();
      }
    }
  }

  function handleMemberAction(e) {
    const btn = e.target.closest(".member-remove");
    if (!btn) return;
    const uid = btn.closest(".member-item").dataset.uid;
    const { currentGroupId, group } = AppStore.getState();
    const member = group.members[uid];
    if (confirm(`להסיר את ${member.name}?`)) AppAPI.removeMember(currentGroupId, uid);
  }

  // === Modal Logic ===
  function openAmountModal(name, unit, category, itemId, target) {
    AppStore.setState({ listItemEditId: itemId, modalTarget: target, modalContext: { name, category } });
    els.modalProductName.textContent = name;
    setUnit(unit);
    els.modalConfirm.textContent = itemId ? "עדכן" : "הוסף לרשימה";
    
    if (itemId) {
      const list = target === "template" ? AppStore.getState().templateList : AppStore.getState().shoppingList;
      const item = list.find(i => i.id === itemId);
      if (item) {
        els.amountInput.value = item.amount;
        setUnit(item.unit);
      }
    } else {
      els.amountInput.value = 1;
    }
    els.modalOverlay.classList.remove("hidden");
  }

  function closeModal() {
    els.modalOverlay.classList.add("hidden");
    AppStore.setState({ modalContext: null, listItemEditId: null });
  }

  function addItemToList(name, amount, unit, category, itemId, target) {
    const { shoppingList, templateList } = AppStore.getState();
    const list = target === "template" ? templateList : shoppingList;

    if (itemId) {
      const item = list.find(i => i.id === itemId);
      if (item) { 
        item.amount = amount; 
        item.unit = unit; 
      }
    } else {
      // Check for existing items with the same name (not purchased for list, any for template)
      const existing = (target === "template") 
        ? list.find(i => i.name === name)
        : list.find(i => i.name === name && !i.purchased);

      if (existing) {
        const targetName = target === "template" ? "בתבנית" : "ברשימה";
        if (confirm(`"${name}" כבר נמצא ${targetName}. להוסיף לכמות הקיימת?`)) {
          existing.amount = Math.round((existing.amount + amount) * 10) / 10;
        } else {
          return false;
        }
      } else {
        const id = (target === "template" ? "tpl_" : "item_") + Date.now();
        list.push({ id, name, category, unit, amount, purchased: false });
      }
    }

    if (target === "template") {
      saveTemplate();
    } else {
      saveShoppingList();
    }
    return true;
  }

  function handleModalConfirm() {
    const { modalContext, modalTarget, listItemEditId } = AppStore.getState();
    if (!modalContext) return;

    const unit = document.querySelector("#modal-overlay .unit-btn.active").dataset.unit;
    const amount = parseFloat(els.amountInput.value) || 1;

    if (addItemToList(modalContext.name, amount, unit, modalContext.category, listItemEditId, modalTarget)) {
      if (modalTarget === "template" && !listItemEditId) closeSheet();
      closeModal();
    }
  }
  function openEditModal(id) {
    const product = AppStore.getState().catalog.find(p => p.id === id);
    if (!product) return;
    AppStore.setState({ editContext: { id } });
    els.editName.value = product.name;
    AppUI.refreshCategorySelects();
    els.editCategory.value = product.category;
    document.querySelectorAll(".edit-unit-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.unit === product.defaultUnit));
    els.editModalOverlay.classList.remove("hidden");
  }

  function closeEditModal() {
    els.editModalOverlay.classList.add("hidden");
    AppStore.setState({ editContext: null });
  }

  function handleSaveEditProduct() {
    const { editContext, catalog } = AppStore.getState();
    if (!editContext) return;
    const item = catalog.find(p => p.id === editContext.id);
    item.name = els.editName.value.trim();
    item.category = els.editCategory.value;
    item.defaultUnit = document.querySelector(".edit-unit-btn.active").dataset.unit;
    saveCatalog();
    closeEditModal();
  }

  function handleSubmitCustomItem() {
    const name = els.sheetCustomName.value.trim();
    if (!name) return;
    const { catalog } = AppStore.getState();
    const category = els.sheetCustomCategory.value || "שונות";
    if (!catalog.some(p => p.name === name)) {
      catalog.push({ id: "p_" + Date.now(), name, category, defaultUnit: "units" });
      saveCatalog();
    }
    els.sheetCustomName.value = "";
    els.sheetCustomForm.classList.add("hidden");
    openAmountModal(name, "units", category, null, AppStore.getState().addingToTarget);
  }

  function handleCategoryChange(select) {
    if (select.value !== "__new__") return;
    const name = prompt("שם הקטגוריה החדשה:");
    if (name && name.trim()) {
      const { customCategories } = AppStore.getState();
      const trimmed = name.trim();
      if (!customCategories.includes(trimmed)) {
        customCategories.push(trimmed);
        AppStore.setState({ customCategories });
        saveCustomCategories();
        AppUI.refreshCategorySelects();
        select.value = trimmed;
      }
    } else {
      select.value = AppStore.getAllCategories()[0];
    }
  }

  // === Helper Helpers ===
  function saveShoppingList() { AppAPI.saveShoppingList(AppStore.getState().currentGroupId, AppStore.getState().shoppingList); }
  function saveCatalog() { AppAPI.saveCatalog(AppStore.getState().currentGroupId, AppStore.getState().catalog); }
  function saveTemplate() { AppAPI.saveTemplate(AppStore.getState().currentGroupId, AppStore.getState().templateList); }
  function saveCustomCategories() { AppAPI.saveCustomCategories(AppStore.getState().currentGroupId, AppStore.getState().customCategories); }

  function switchTab(tab) {
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
    els.listView.classList.toggle("active", tab === "list");
    els.templateView.classList.toggle("active", tab === "template");
  }

  function openSheet(target) {
    const allCategories = AppStore.getAllCategories();
    AppStore.setState({ 
      addingToTarget: target, 
      isSheetOpen: true,
      collapsedCategories: new Set(allCategories)
    });
    els.sheetTitle.textContent = target === "template" ? "הוספה לתבנית" : "הוספת מוצרים";
    els.sheetSearchInput.value = "";
    els.sheetOverlay.classList.remove("hidden");
    requestAnimationFrame(() => els.bottomSheet.classList.add("open"));
    document.body.style.overflow = "hidden";
    AppUI.render(AppStore.getState());
  }

  function closeSheet() {
    els.bottomSheet.classList.remove("open");
    els.bottomSheet.addEventListener("transitionend", () => {
      els.sheetOverlay.classList.add("hidden");
      document.body.style.overflow = "";
      AppStore.setState({ isSheetOpen: false });
    }, { once: true });
  }

  async function handleClearPurchased() {
    const state = AppStore.getState();
    const purchasedItems = state.shoppingList.filter(i => i.purchased);
    if (purchasedItems.length === 0) return;

    // Extract unique names for stats tracking
    const itemNames = [...new Set(purchasedItems.map(i => i.name))];
    
    // Increment purchase stats in background
    AppAPI.incrementProductStats(state.currentGroupId, itemNames).catch(console.error);

    const newList = state.shoppingList.filter(i => !i.purchased);
    AppStore.setState({ shoppingList: newList });
    saveShoppingList();
  }

  function handleClearAll() {
    if (confirm("למחוק הכל?")) { AppStore.setState({ shoppingList: [] }); saveShoppingList(); }
  }

  function handleAddAllTemplate() {
    const { templateList, shoppingList } = AppStore.getState();
    templateList.forEach(item => {
      if (!shoppingList.some(i => i.name === item.name && !i.purchased)) {
        shoppingList.push({ ...item, id: "item_" + Date.now(), purchased: false });
      }
    });
    saveShoppingList();
    closeSheet();
  }

  function adjustAmount(delta) {
    const unit = document.querySelector("#modal-overlay .unit-btn.active").dataset.unit;
    const step = unit === "kg" ? 0.5 : 1;
    let val = parseFloat(els.amountInput.value) || step;
    val = Math.round((val + delta * step) * 10) / 10;
    if (val < step) val = step;
    els.amountInput.value = val;
  }

  function setUnit(unit) {
    document.querySelectorAll("#modal-overlay .unit-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.unit === unit));
    els.amountInput.step = unit === "kg" ? "0.5" : "1";
    els.amountInput.min = unit === "kg" ? "0.5" : "1";
  }

  // === Init ===
  function init() {
    setupEventListeners();
    initSpeechRecognition();
    AppStore.subscribe(state => AppUI.render(state));

    AppAPI.onAuthStateChanged(user => {
      if (user) {
        AppStore.setState({ currentUser: user });
        AppAPI.getUserGroupId(user.uid, groupId => {
          if (groupId) {
            AppStore.setState({ currentGroupId: groupId });
            AppUI.showView("app");
            AppAPI.setupGroupListeners(groupId, {
              onGroupUpdate: group => AppStore.setState({ group }),
              onListUpdate: shoppingList => AppStore.setState({ shoppingList }),
              onCatalogUpdate: catalog => AppStore.setState({ catalog }),
              onTemplateUpdate: templateList => AppStore.setState({ templateList }),
              onStatsUpdate: productStats => AppStore.setState({ productStats }),
              onCategoriesUpdate: customCategories => {

                const normalized = Array.isArray(customCategories) ? customCategories : (customCategories ? Object.values(customCategories) : []);
                AppStore.setState({ customCategories: normalized });
                AppUI.refreshCategorySelects();
              },
              onConnectionUpdate: connected => AppUI.setSyncStatus(connected)
            });
          } else {
            AppStore.setState({ currentGroupId: null });
            AppUI.showView("selection");
          }
          els.loadingView.classList.add("hidden");
        });
      } else {
        AppStore.setState({ currentUser: null, currentGroupId: null });
        AppUI.showView("login");
        els.loadingView.classList.add("hidden");
      }
    });
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => AppController.init());
