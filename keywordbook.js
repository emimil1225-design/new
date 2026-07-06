(() => {
  "use strict";

  const keywordIdPrefix = "KW";
  const allCategory = "전체";
  const defaultKeywordCategory = "캐릭터";
  const globalKeywordCategoryManagerId = "__keyword-category-global__";

  function formatKeywordId(index) {
    return `${keywordIdPrefix}-${String(index + 1).padStart(3, "0")}`;
  }

  function create(api) {
    const {
      state,
      el,
      createId,
      escapeHtml,
      compact,
      normalizeKeyword,
      saveKeywords,
      saveCharacters,
      saveWorlds,
      saveKeywordCategories,
      getSelectedCharacter,
      pushDeletedItem,
      showToast
    } = api;
    const renderCharacterKeywordPicker = (...args) => api.renderCharacterKeywordPicker(...args);
    const renderWorldKeywordPicker = (...args) => api.renderWorldKeywordPicker(...args);

    let draggedKeywordId = "";
    let suppressKeywordClick = false;
    let editingKeywordId = "";
    let keywordHeaderDraft = null;
    let keywordCategoryModal = null;
    let editingKeywordCategoryId = "";
    const normalizeOptionList = (value, fallback = []) => window.PC_SHARED.uniqueCleanList(value, {
      exclude: [allCategory],
      fallback
    });

    function getEditableKeywordCategories() {
      const categories = normalizeOptionList(state.keywordCategories, [defaultKeywordCategory, "세계관"]);
      return categories.length ? categories : [defaultKeywordCategory, "세계관"];
    }

    function getKeywordCategoryList(keyword = {}) {
      const categories = normalizeOptionList(keyword.categories || keyword.category, [defaultKeywordCategory]);
      return categories.length ? categories : [defaultKeywordCategory];
    }

    function setKeywordCategoryList(keyword, categories) {
      if (!keyword) {
        return;
      }
      const next = normalizeOptionList(categories, [getEditableKeywordCategories()[0] || defaultKeywordCategory]);
      keyword.categories = next.length ? next : [defaultKeywordCategory];
      keyword.category = keyword.categories[0] || defaultKeywordCategory;
    }

    function ensureKeywordCategoryOptions() {
      const merged = getEditableKeywordCategories();
      state.keywords.forEach((keyword) => {
        getKeywordCategoryList(keyword).forEach((category) => {
          if (!merged.includes(category)) {
            merged.push(category);
          }
        });
      });
      state.keywordCategories = merged;
      return merged;
    }

    function saveKeywordCategoryOptions() {
      ensureKeywordCategoryOptions();
      if (typeof saveKeywordCategories === "function") {
        saveKeywordCategories();
      }
    }

    function getFilteredKeywords() {
      return window.PC_SHARED.filterByQuery(state.keywords, {
        query: state.keywordQuery,
        matches: (keyword) => {
          const categories = getKeywordCategoryList(keyword);
          return state.keywordCategory === allCategory || categories.includes(state.keywordCategory);
        },
        getText: (keyword) => {
          const categories = getKeywordCategoryList(keyword);
          return [
            keyword.id,
            keyword.title,
            keyword.triggers,
            keyword.content,
            categories.join(" ")
          ];
        }
      });
    }

    function getKeywordDisplayId(keyword) {
      return keyword.id || formatKeywordId(Math.max(state.keywords.findIndex((item) => item === keyword), 0));
    }

    function getKeywordById(keywordId) {
      return state.keywords.find((keyword) => keyword.id === keywordId);
    }

    function isGlobalKeywordCategoryManager() {
      return editingKeywordCategoryId === globalKeywordCategoryManagerId;
    }

    function focusKeywordHeaderField(field = "title") {
      window.requestAnimationFrame(() => {
        const input = el.keywordList.querySelector(`[data-keyword-header-field='${field}']`);
        if (input) {
          window.PC_SHARED.focusWithoutScroll(input, { select: true });
        }
      });
    }

    function revealKeywordCard(keywordId) {
      if (!keywordId || !el.keywordList) {
        return;
      }
      window.requestAnimationFrame(() => {
        const card = el.keywordList.querySelector(`[data-keyword-id="${keywordId}"]`);
        window.PC_SHARED.revealInScrollContainer(el.keywordList, card, { behavior: "smooth", block: "center" });
      });
    }

    function clearKeywordHeaderEdit() {
      editingKeywordId = "";
      keywordHeaderDraft = null;
    }

    function beginKeywordHeaderEdit(keywordId) {
      const keyword = getKeywordById(keywordId);
      if (!keyword) {
        return;
      }
      editingKeywordId = keyword.id;
      keywordHeaderDraft = {
        title: keyword.title || "",
        triggers: keyword.triggers || ""
      };
      state.activeKeywordId = keyword.id;
      saveKeywords({ track: false });
      renderKeywords();
      focusKeywordHeaderField("title");
    }

    function persistKeywordHeaderDraft(options = {}) {
      if (!keywordHeaderDraft || !editingKeywordId) {
        return false;
      }
      const keyword = getKeywordById(editingKeywordId);
      if (!keyword) {
        return false;
      }
      keyword.title = String(keywordHeaderDraft.title || "");
      keyword.triggers = String(keywordHeaderDraft.triggers || "");
      saveKeywords(options.track === true ? undefined : { track: false });
      renderCharacterKeywordPicker();
      renderWorldKeywordPicker();
      return true;
    }

    function updateKeywordHeaderDraft(field, value) {
      if (!keywordHeaderDraft || !editingKeywordId) {
        return;
      }
      keywordHeaderDraft[field] = value;
      persistKeywordHeaderDraft({ track: false });
    }

    function commitKeywordHeaderEdit(options = {}) {
      if (!editingKeywordId) {
        return false;
      }
      const keyword = getKeywordById(editingKeywordId);
      if (!keyword) {
        clearKeywordHeaderEdit();
        if (!options.skipRender) {
          renderKeywords();
        }
        return false;
      }
      const draft = keywordHeaderDraft || {
        title: keyword.title || "",
        triggers: keyword.triggers || ""
      };
      keyword.title = String(draft.title || "").trim() || "이름 없는 키워드";
      keyword.triggers = String(draft.triggers || "").trim();
      clearKeywordHeaderEdit();
      saveKeywords(options.track === false ? { track: false } : undefined);
      renderCharacterKeywordPicker();
      renderWorldKeywordPicker();
      if (!options.skipRender) {
        renderKeywords();
      }
      if (!options.silent) {
        showToast("키워드 제목과 트리거를 저장했어요");
      }
      return true;
    }

    function cancelKeywordHeaderEdit(options = {}) {
      if (!editingKeywordId) {
        return;
      }
      clearKeywordHeaderEdit();
      if (!options.skipRender) {
        renderKeywords();
      }
      if (!options.silent) {
        showToast("키워드 제목/트리거 수정을 취소했어요");
      }
    }

    function remapKeywordIdList(ids, idMap, availableIds, maxItems) {
      return Array.from(new Set((Array.isArray(ids) ? ids : [])
        .map((id) => idMap.get(id) || id)
        .filter((id) => availableIds.has(id))))
        .slice(0, maxItems);
    }

    function renumberKeywordsByOrder() {
      const idMap = new Map();
      state.keywords.forEach((keyword, index) => {
        const nextId = formatKeywordId(index);
        if (keyword.id !== nextId) {
          idMap.set(keyword.id, nextId);
          keyword.id = nextId;
        }
      });

      if (!idMap.size) {
        return idMap;
      }

      if (state.activeKeywordId) {
        state.activeKeywordId = idMap.get(state.activeKeywordId) || state.activeKeywordId;
      }
      if (editingKeywordId) {
        editingKeywordId = idMap.get(editingKeywordId) || editingKeywordId;
      }
      if (editingKeywordCategoryId) {
        editingKeywordCategoryId = idMap.get(editingKeywordCategoryId) || editingKeywordCategoryId;
      }

      const availableKeywordIds = new Set(state.keywords.map((keyword) => keyword.id));
      state.characters.forEach((character) => {
        character.keywordIds = remapKeywordIdList(character.keywordIds, idMap, availableKeywordIds, 15);
      });
      state.worlds.forEach((world) => {
        world.keywordIds = remapKeywordIdList(world.keywordIds, idMap, availableKeywordIds, 5);
      });

      return idMap;
    }

    function renderKeywordFilters() {
      if (!el.keywordFilters) {
        return;
      }
      const categories = [allCategory, ...ensureKeywordCategoryOptions()];
      if (!categories.includes(state.keywordCategory)) {
        state.keywordCategory = allCategory;
      }
      window.PC_SHARED.renderAdvancedCategoryFilter({
        container: el.keywordFilters,
        toggle: el.keywordAdvancedSearchToggle,
        panel: el.keywordAdvancedSearchPanel,
        open: Boolean(state.keywordAdvancedSearchOpen),
        categories,
        selected: state.keywordCategory,
        onSelect: (category) => {
          state.keywordCategory = category;
          renderKeywordFilters();
          renderKeywords();
        }
      });
    }

    function updateKeywordOrderButtons() {
      const visibleIds = getFilteredKeywords().map((keyword) => keyword.id);
      el.keywordList.querySelectorAll("[data-keyword-move]").forEach((button) => {
        const index = visibleIds.indexOf(button.dataset.keywordMove);
        const direction = Number(button.dataset.direction || 0);
        button.disabled = state.keywords.length <= 1
          || visibleIds.length <= 1
          || index < 0
          || (direction < 0 && index === 0)
          || (direction > 0 && index === visibleIds.length - 1);
      });
    }

    function clearKeywordDropHints() {
      window.PC_SHARED.clearDropHints(el.keywordList);
    }

    function showKeywordDropHint(card, position) {
      window.PC_SHARED.showDropHint(el.keywordList, card, position);
    }

    function moveKeywordRelative(sourceId, targetId, position) {
      return window.PC_SHARED.moveRelativeById(state.keywords, sourceId, targetId, position);
    }

    function moveKeywordToEnd(sourceId) {
      return window.PC_SHARED.moveToEndById(state.keywords, sourceId);
    }

    function persistKeywordOrder() {
      renumberKeywordsByOrder();
      saveKeywords({ track: false });
      saveCharacters({ track: false });
      saveWorlds({ track: false });
      renderCharacterKeywordPicker();
      renderWorldKeywordPicker();
    }

    function finishKeywordReorder(moved, sourceId, message = "키워드 순서를 바꿨어요") {
      clearKeywordDropHints();
      draggedKeywordId = "";
      if (!moved) {
        return;
      }
      persistKeywordOrder();
      renderKeywords();
      showToast(message);
    }

    function renderKeywordCategoryBadges(keyword) {
      return window.PC_SHARED.renderCategoryBadges(getKeywordCategoryList(keyword), escapeHtml);
    }

    function focusKeywordCategoryInput() {
      window.requestAnimationFrame(() => {
        const input = keywordCategoryModal && !keywordCategoryModal.hidden
          ? keywordCategoryModal.querySelector("[data-keyword-category-input]")
          : null;
        if (input) {
          input.focus();
        }
      });
    }

    function isKeywordCategoryManagerOpen(keywordId = editingKeywordCategoryId) {
      return Boolean(keywordCategoryModal && !keywordCategoryModal.hidden && editingKeywordCategoryId && (!keywordId || editingKeywordCategoryId === keywordId));
    }

    function closeKeywordCategoryManager(options = {}) {
      if (keywordCategoryModal) {
        keywordCategoryModal.hidden = true;
      }
      editingKeywordCategoryId = "";
      document.body.classList.remove("category-open");
      if (!options.silent) {
        showToast("키워드 분류 관리 창을 닫았어요");
      }
    }

    function ensureKeywordCategoryModal() {
      if (keywordCategoryModal) {
        return keywordCategoryModal;
      }
      keywordCategoryModal = document.createElement("div");
      keywordCategoryModal.className = "category-modal keyword-category-modal";
      keywordCategoryModal.hidden = true;
      keywordCategoryModal.innerHTML = `
        <div class="category-backdrop" data-keyword-category-close></div>
        <section class="category-dialog" role="dialog" aria-modal="true" aria-labelledby="keywordCategoryManagerTitle">
          <header class="category-dialog-header">
            <div>
              <h2 id="keywordCategoryManagerTitle">키워드 분류 관리</h2>
              <p>키워드에 붙일 분류를 선택하고, 분류 목록을 정리할 수 있어요.</p>
            </div>
            <button class="category-close" type="button" data-keyword-category-close title="닫기" aria-label="키워드 분류 관리 닫기">×</button>
          </header>
          <div class="category-dialog-body"></div>
        </section>
      `;
      document.body.appendChild(keywordCategoryModal);

      keywordCategoryModal.addEventListener("click", (event) => {
        if (event.target.closest("[data-keyword-category-close]")) {
          closeKeywordCategoryManager();
          return;
        }
        const addButton = event.target.closest("[data-keyword-category-add]");
        if (addButton) {
          addKeywordCategoryFromInput(addButton);
          return;
        }
        const renameButton = event.target.closest("[data-keyword-category-rename]");
        if (renameButton) {
          renameKeywordCategory(renameButton.dataset.keywordCategoryRename, renameButton);
          return;
        }
        const deleteButton = event.target.closest("[data-keyword-category-delete]");
        if (deleteButton) {
          deleteKeywordCategory(deleteButton.dataset.keywordCategoryDelete);
          return;
        }
        const toggleButton = event.target.closest("[data-keyword-category-toggle]");
        if (toggleButton) {
          updateKeywordCategory(toggleButton.dataset.keywordCategoryToggle);
        }
      });

      keywordCategoryModal.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && event.target.dataset.keywordCategoryInput !== undefined) {
          event.preventDefault();
          addKeywordCategoryFromInput(event.target);
        }
        if (event.key === "Enter" && event.target.dataset.keywordCategoryRenameInput !== undefined) {
          event.preventDefault();
          renameKeywordCategory(event.target.dataset.keywordCategoryRenameInput, event.target);
        }
        if (event.key === "Escape" && event.target.dataset.keywordCategoryRenameInput !== undefined) {
          event.preventDefault();
          event.target.value = event.target.dataset.keywordCategoryRenameInput;
        } else if (event.key === "Escape") {
          closeKeywordCategoryManager();
        }
      });
      return keywordCategoryModal;
    }

    function renderKeywordCategoryPicker(keyword, isManaging = false) {
      const hasKeyword = Boolean(keyword);
      const currentCategories = hasKeyword ? getKeywordCategoryList(keyword) : [];
      const currentSet = new Set(currentCategories);
      const chips = getEditableKeywordCategories().map((category) => {
        const selected = currentSet.has(category);
        return `<button class="chip keyword-category-chip${selected ? " active" : ""}" type="button" data-keyword-category-toggle="${escapeHtml(category)}" aria-pressed="${selected ? "true" : "false"}">${escapeHtml(category)}</button>`;
      }).join("");
      const rows = getEditableKeywordCategories().map((category) => {
        const selected = currentSet.has(category);
        const protectedCategory = getEditableKeywordCategories().length <= 1;
        return `
          <div class="category-manager-item${selected ? " active" : ""}">
            <span class="category-manager-name">${escapeHtml(category)}</span>
            <input class="tag-rename-input" type="text" data-keyword-category-rename-input="${escapeHtml(category)}" value="${escapeHtml(category)}" aria-label="${escapeHtml(category)} 분류명 수정">
            <button class="text-button mini-action" type="button" data-keyword-category-rename="${escapeHtml(category)}">변경</button>
            <button class="text-button danger mini-action" type="button" data-keyword-category-delete="${escapeHtml(category)}" ${protectedCategory ? "disabled" : ""}>삭제</button>
          </div>
        `;
      }).join("");
      const managerPanel = isManaging ? `
        <div class="category-manager-panel" role="group" aria-label="키워드 분류 관리">
          <div class="category-manager-title">
            <strong>키워드 분류 관리</strong>
            <span>이름을 바꾸면 모든 키워드에 함께 반영돼요.</span>
          </div>
          <div class="category-manager-list">${rows}</div>
          <div class="tag-manage-row category-add-row">
            <input type="text" data-keyword-category-input placeholder="새 분류명">
            <button class="text-button primary mini-action" type="button" data-keyword-category-add>추가</button>
          </div>
        </div>
      ` : "";
      return `
        ${hasKeyword ? `<div class="category-manager-picker" role="group" aria-label="키워드 분류 선택">${chips}</div>` : ""}
        ${managerPanel}
      `;
    }

    function renderKeywordCategoryManager() {
      if (!keywordCategoryModal || !editingKeywordCategoryId) {
        return;
      }
      const isGlobal = isGlobalKeywordCategoryManager();
      const keyword = isGlobal ? null : getKeywordById(editingKeywordCategoryId);
      if (!isGlobal && !keyword) {
        closeKeywordCategoryManager({ silent: true });
        return;
      }
      const body = keywordCategoryModal.querySelector(".category-dialog-body");
      const title = keyword ? keyword.title || "이름 없는 키워드" : "키워드북 전체 분류";
      body.innerHTML = `
        <div class="category-manager-current">
          <strong>${escapeHtml(title)}</strong>
          ${keyword ? `<span class="category-badge-row">${renderKeywordCategoryBadges(keyword)}</span>` : ""}
        </div>
        <p class="category-manager-help">${keyword ? "위쪽 분류 태그를 눌러 이 키워드에 적용하거나 해제하고, 아래에서 분류명을 추가·변경·삭제할 수 있어요." : "아래에서 키워드북 분류명을 추가·변경·삭제할 수 있어요. 키워드별 분류 지정은 키워드를 선택한 뒤 관리하면 돼요."}</p>
        ${renderKeywordCategoryPicker(keyword, true)}
      `;
    }

    function openKeywordCategoryManager(keywordId) {
      const keyword = keywordId ? getKeywordById(keywordId) : null;
      if (keywordId && !keyword) {
        showToast("분류를 관리할 키워드를 찾지 못했어요");
        return;
      }
      editingKeywordCategoryId = keyword ? keyword.id : globalKeywordCategoryManagerId;
      if (keyword) {
        state.activeKeywordId = keyword.id;
      }
      ensureKeywordCategoryModal();
      keywordCategoryModal.hidden = false;
      document.body.classList.add("category-open");
      renderKeywordCategoryManager();
      renderKeywords();
      focusKeywordCategoryInput();
      showToast("키워드 분류 관리 창을 열었어요 🐰");
    }

    function toggleKeywordCategoryManager(keywordId) {
      const keyword = keywordId ? getKeywordById(keywordId) : null;
      const targetId = keyword ? keyword.id : globalKeywordCategoryManagerId;
      if (keywordId && !keyword) {
        showToast("분류를 관리할 키워드를 찾지 못했어요");
        return;
      }
      if (isKeywordCategoryManagerOpen(targetId)) {
        closeKeywordCategoryManager();
        renderKeywords();
        return;
      }
      openKeywordCategoryManager(keyword ? keyword.id : "");
    }

    function updateKeywordCategory(category) {
      const keyword = getKeywordById(editingKeywordCategoryId) || getKeywordById(state.activeKeywordId);
      if (!keyword || !category) {
        return;
      }
      const current = getKeywordCategoryList(keyword);
      let next = current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category];
      if (!next.length) {
        next = [category];
      }
      setKeywordCategoryList(keyword, next);
      saveKeywords();
      saveKeywordCategoryOptions();
      renderKeywordFilters();
      renderKeywords();
      renderKeywordCategoryManager();
    }

    function addKeywordCategoryFromInput(inputOrButton) {
      if (!keywordCategoryModal || keywordCategoryModal.hidden) {
        showToast("키워드 분류 관리를 연 뒤 새 분류를 추가해주세요");
        return;
      }
      const input = inputOrButton.matches && inputOrButton.matches("input")
        ? inputOrButton
        : inputOrButton.closest(".category-dialog")?.querySelector("[data-keyword-category-input]");
      const value = String(input?.value || "").trim();
      if (!value) {
        showToast("추가할 분류명을 입력해주세요");
        return;
      }
      const categories = ensureKeywordCategoryOptions();
      if (!categories.includes(value)) {
        categories.push(value);
      }
      const keyword = isGlobalKeywordCategoryManager() ? null : getKeywordById(editingKeywordCategoryId);
      if (keyword) {
        setKeywordCategoryList(keyword, [...getKeywordCategoryList(keyword), value]);
      }
      if (input) {
        input.value = "";
      }
      saveKeywordCategoryOptions();
      saveKeywords();
      renderKeywordFilters();
      renderKeywords();
      renderKeywordCategoryManager();
      focusKeywordCategoryInput();
    }

    function renameKeywordCategory(category, inputOrButton) {
      if (!keywordCategoryModal || keywordCategoryModal.hidden) {
        showToast("키워드 분류 관리를 연 뒤 이름을 변경해주세요");
        return;
      }
      const from = String(category || "").trim();
      const input = inputOrButton.matches && inputOrButton.matches("input")
        ? inputOrButton
        : inputOrButton.closest(".category-manager-item")?.querySelector("[data-keyword-category-rename-input]");
      const to = String(input?.value || "").trim();
      if (!from || !to) {
        showToast("변경할 분류명을 입력해주세요");
        return;
      }
      if (from === to) {
        return;
      }
      const options = ensureKeywordCategoryOptions().map((item) => item === from ? to : item);
      state.keywordCategories = normalizeOptionList(options, [to]);
      state.keywords.forEach((keyword) => {
        setKeywordCategoryList(keyword, getKeywordCategoryList(keyword).map((item) => item === from ? to : item));
      });
      if (state.keywordCategory === from) {
        state.keywordCategory = to;
      }
      saveKeywordCategoryOptions();
      saveKeywords();
      renderKeywordFilters();
      renderKeywords();
      renderKeywordCategoryManager();
      showToast("키워드 분류명을 변경했어요");
    }

    function deleteKeywordCategory(category) {
      if (!keywordCategoryModal || keywordCategoryModal.hidden) {
        showToast("키워드 분류 관리를 연 뒤 삭제해주세요");
        return;
      }
      const target = String(category || "").trim();
      const options = ensureKeywordCategoryOptions();
      if (!target || options.length <= 1) {
        showToast("최소 1개 분류는 필요해요");
        return;
      }
      const fallback = options.find((item) => item !== target) || defaultKeywordCategory;
      state.keywordCategories = options.filter((item) => item !== target);
      state.keywords.forEach((keyword) => {
        const current = getKeywordCategoryList(keyword).filter((item) => item !== target);
        setKeywordCategoryList(keyword, current.length ? current : [fallback]);
      });
      if (state.keywordCategory === target) {
        state.keywordCategory = allCategory;
      }
      saveKeywordCategoryOptions();
      saveKeywords();
      renderKeywordFilters();
      renderKeywords();
      renderKeywordCategoryManager();
      showToast("키워드 분류를 삭제했어요");
    }

    function renderKeywordHeader(keyword) {
      const draft = keywordHeaderDraft || {
        title: keyword.title || "",
        triggers: keyword.triggers || ""
      };
      return window.PC_SHARED.renderEditableCardHeader({
        isEditing: keyword.id === editingKeywordId,
        editorClass: "keyword-header-editor",
        editorLabel: "키워드 제목과 트리거 편집",
        fields: [
          {
            label: "키워드 제목",
            attribute: 'data-keyword-header-field="title"',
            value: escapeHtml(draft.title),
            placeholder: "키워드 제목"
          },
          {
            type: "textarea",
            label: "트리거 단어",
            attribute: 'data-keyword-header-field="triggers"',
            value: escapeHtml(draft.triggers),
            placeholder: "쉼표로 구분해서 입력"
          }
        ],
        saveAttribute: "data-keyword-edit-save",
        cancelAttribute: "data-keyword-edit-cancel",
        editAttribute: "data-keyword-header-edit",
        selectAttribute: "data-keyword-select",
        id: escapeHtml(keyword.id),
        title: escapeHtml(keyword.title || "이름 없는 키워드"),
        fallbackTitle: "이름 없는 키워드",
        subId: escapeHtml(getKeywordDisplayId(keyword)),
        metaHtml: `<span class="category-badge-row">${renderKeywordCategoryBadges(keyword)}</span><span>${escapeHtml(keyword.triggers || "트리거 단어 없음")}</span>`,
        actionsLabel: "키워드 작업",
        editTitle: "제목/트리거 편집"
      });
    }

    function renderKeywords() {
      renderKeywordFilters();
      const keywords = getFilteredKeywords();
      const nextActiveKeywordId = window.PC_SHARED.resolveVisibleSelection(keywords, state.activeKeywordId, {
        allowEmpty: true,
        fallbackItems: state.keywords
      });
      if (state.activeKeywordId !== nextActiveKeywordId) {
        state.activeKeywordId = nextActiveKeywordId;
        if (editingKeywordId && editingKeywordId !== nextActiveKeywordId) {
          clearKeywordHeaderEdit();
        }
        if (editingKeywordCategoryId && editingKeywordCategoryId !== nextActiveKeywordId && !isGlobalKeywordCategoryManager()) {
          editingKeywordCategoryId = "";
        }
      }
      const selectedCharacter = getSelectedCharacter ? getSelectedCharacter() : null;
      const characterKeywordIds = new Set(selectedCharacter?.keywordIds || []);
      const selectedKeywordNumber = state.activeKeywordId ? state.keywords.findIndex((item) => item.id === state.activeKeywordId) + 1 : 0;
      el.keywordCount.textContent = `${Math.max(0, selectedKeywordNumber)} / ${state.keywords.length}`;
      el.keywordList.innerHTML = "";
      el.deleteKeywordButton.disabled = !state.activeKeywordId || state.keywords.length <= 1;
      if (el.manageKeywordCategoriesButton) {
        el.manageKeywordCategoriesButton.disabled = false;
      }

      if (!keywords.length) {
        el.keywordList.innerHTML = `<div class="empty cute-empty"><strong>키워드를 찾지 못했어요 🐰</strong><span>검색어나 분류를 조금 바꿔보세요.</span></div>`;
        return;
      }

      keywords.forEach((keyword) => {
        const card = document.createElement("article");
        const linkedToCharacter = characterKeywordIds.has(keyword.id);
        card.className = `keyword-card orderable-card${keyword.id === state.activeKeywordId ? " active" : ""}${linkedToCharacter ? " character-linked" : ""}${keyword.id === editingKeywordId ? " editing-header" : ""}`;
        card.draggable = state.keywords.length > 1 && keyword.id !== editingKeywordId;
        card.dataset.keywordId = keyword.id;
        card.innerHTML = renderKeywordHeader(keyword);

        if (keyword.id === state.activeKeywordId) {
          const detail = document.createElement("div");
          detail.className = "keyword-detail";
          detail.innerHTML = `
            <div class="keyword-category-editor">
              <div class="detail-label">분류</div>
              <div class="category-picker keyword-category-picker" role="group" aria-label="키워드 분류 선택">
                ${renderKeywordCategoryPicker(keyword, false)}
              </div>
            </div>
            <label>내용<textarea data-keyword-field="content" placeholder="키워드가 호출될 때 추가할 내용">${escapeHtml(keyword.content)}</textarea></label>
          `;
          card.appendChild(detail);
        }

        window.PC_SHARED.bindOrderableCard(card, {
          targetId: keyword.id,
          getDraggedId: () => draggedKeywordId,
          setDraggedId: (value) => { draggedKeywordId = value; },
          setSuppressClick: (value) => { suppressKeywordClick = value; },
          invalidDragSelector: "input, textarea, select, .card-header-editor, [data-keyword-header-edit], [data-keyword-edit-save], [data-keyword-edit-cancel], [data-keyword-category-toggle]",
          showDropHint: showKeywordDropHint,
          clearDropHints: clearKeywordDropHints,
          moveRelative: moveKeywordRelative,
          finishReorder: finishKeywordReorder
        });

        el.keywordList.appendChild(card);
      });

      updateKeywordOrderButtons();
    }

    function addKeyword() {
      const defaultCategory = state.keywordCategory && state.keywordCategory !== allCategory
        ? state.keywordCategory
        : getEditableKeywordCategories()[0];
      const keyword = normalizeKeyword({
        id: createId("keyword"),
        title: "새 키워드",
        triggers: "",
        content: "",
        category: defaultCategory,
        categories: [defaultCategory]
      });
      state.keywords.push(keyword);
      state.activeKeywordId = keyword.id;
      if (state.keywordCategory !== allCategory && !getKeywordCategoryList(keyword).includes(state.keywordCategory)) {
        state.keywordCategory = allCategory;
      }
      renumberKeywordsByOrder();
      const activeKeyword = getKeywordById(state.activeKeywordId);
      editingKeywordCategoryId = "";
      if (keywordCategoryModal) {
        keywordCategoryModal.hidden = true;
        document.body.classList.remove("category-open");
      }
      if (activeKeyword) {
        editingKeywordId = activeKeyword.id;
        keywordHeaderDraft = {
          title: activeKeyword.title || "",
          triggers: activeKeyword.triggers || ""
        };
      }
      saveKeywords({ track: false });
      saveCharacters({ track: false });
      saveWorlds({ track: false });
      saveKeywordCategoryOptions();
      renderKeywordFilters();
      renderKeywords();
      renderCharacterKeywordPicker();
      renderWorldKeywordPicker();
      revealKeywordCard(keyword.id);
      focusKeywordHeaderField("title");
    }

    function deleteKeyword() {
      if (state.keywords.length <= 1) {
        showToast("최소 1개는 필요해요");
        return;
      }
      if (!state.activeKeywordId) {
        showToast("삭제할 키워드를 선택해주세요");
        return;
      }
      const deletedKeywordId = state.activeKeywordId;
      const visibleKeywordsBeforeDelete = getFilteredKeywords();
      const deletedVisibleIndex = visibleKeywordsBeforeDelete.findIndex((keyword) => keyword.id === deletedKeywordId);
      const deletedKeyword = state.keywords.find((keyword) => keyword.id === deletedKeywordId);
      const deletedIndex = state.keywords.findIndex((keyword) => keyword.id === deletedKeywordId);
      const nextVisibleKeyword = deletedVisibleIndex >= 0
        ? visibleKeywordsBeforeDelete[deletedVisibleIndex + 1] || visibleKeywordsBeforeDelete[deletedVisibleIndex - 1]
        : null;
      const nextFallbackKeyword = state.keywords[deletedIndex + 1] || state.keywords[deletedIndex - 1] || null;
      if (deletedKeyword) {
        pushDeletedItem({
          type: "keyword",
          item: deletedKeyword,
          index: deletedIndex,
          links: {
            deletedKeywordId,
            characters: state.characters
              .filter((character) => character.keywordIds.includes(deletedKeywordId))
              .map((character) => ({ id: character.id, keywordIds: [...character.keywordIds] })),
            worlds: state.worlds
              .filter((world) => world.keywordIds.includes(deletedKeywordId))
              .map((world) => ({ id: world.id, keywordIds: [...world.keywordIds] }))
          }
        });
      }
      state.keywords = state.keywords.filter((keyword) => keyword.id !== deletedKeywordId);
      state.characters.forEach((character) => {
        character.keywordIds = character.keywordIds.filter((id) => id !== deletedKeywordId);
      });
      state.worlds.forEach((world) => {
        world.keywordIds = world.keywordIds.filter((id) => id !== deletedKeywordId);
      });
      const nextKeywordId = nextVisibleKeyword?.id || nextFallbackKeyword?.id || state.keywords[0]?.id || "";
      state.activeKeywordId = nextKeywordId;
      if (editingKeywordCategoryId === deletedKeywordId) {
        closeKeywordCategoryManager({ silent: true });
      }
      clearKeywordHeaderEdit();
      renumberKeywordsByOrder();
      saveKeywords({ track: false });
      saveCharacters({ track: false });
      saveWorlds({ track: false });
      saveKeywordCategoryOptions();
      renderKeywords();
      renderCharacterKeywordPicker();
      renderWorldKeywordPicker();
      showToast("키워드를 삭제했어요", { undoDelete: true });
    }

    function updateKeywordField(field, value) {
      const keyword = state.keywords.find((item) => item.id === state.activeKeywordId);
      if (!keyword) {
        return;
      }
      keyword[field] = value.trim();
      saveKeywords();
      renderCharacterKeywordPicker();
      renderWorldKeywordPicker();
    }

    function bindEvents() {
      el.keywordSearchInput.addEventListener("input", (event) => {
        state.keywordQuery = event.target.value;
        renderKeywords();
      });

      el.keywordAdvancedSearchToggle?.addEventListener("click", () => {
        state.keywordAdvancedSearchOpen = !state.keywordAdvancedSearchOpen;
        renderKeywordFilters();
      });

      el.keywordList.addEventListener("click", (event) => {
        const saveEditButton = event.target.closest("[data-keyword-edit-save]");
        if (saveEditButton) {
          commitKeywordHeaderEdit();
          return;
        }

        const cancelEditButton = event.target.closest("[data-keyword-edit-cancel]");
        if (cancelEditButton) {
          cancelKeywordHeaderEdit();
          return;
        }

        const editButton = event.target.closest("[data-keyword-header-edit]");
        if (editButton) {
          if (editingKeywordId && editingKeywordId !== editButton.dataset.keywordHeaderEdit) {
            commitKeywordHeaderEdit({ silent: true, skipRender: true });
          }
          beginKeywordHeaderEdit(editButton.dataset.keywordHeaderEdit);
          return;
        }

        const categoryButton = event.target.closest("[data-keyword-category-toggle]");
        if (categoryButton) {
          editingKeywordCategoryId = state.activeKeywordId || "";
          updateKeywordCategory(categoryButton.dataset.keywordCategoryToggle);
          return;
        }

        const keywordCard = event.target.closest(".keyword-card");
        if (!keywordCard) {
          return;
        }
        const interactiveKeywordControl = event.target.closest("input, textarea, select, button, .card-header-editor, .card-order-actions");
        if (interactiveKeywordControl) {
          return;
        }
        if (suppressKeywordClick) {
          suppressKeywordClick = false;
          return;
        }
        const nextKeywordId = keywordCard.dataset.keywordId;
        if (!nextKeywordId) {
          return;
        }
        if (editingKeywordId && editingKeywordId !== nextKeywordId) {
          commitKeywordHeaderEdit({ silent: true, skipRender: true });
        }
        const nextActiveKeywordId = state.activeKeywordId === nextKeywordId ? "" : nextKeywordId;
        if (editingKeywordCategoryId && editingKeywordCategoryId !== nextActiveKeywordId) {
          closeKeywordCategoryManager({ silent: true });
        }
        state.activeKeywordId = nextActiveKeywordId;
        saveKeywords();
        renderKeywords();
      });

      el.keywordList.addEventListener("input", (event) => {
        const headerField = event.target.dataset.keywordHeaderField;
        if (headerField) {
          updateKeywordHeaderDraft(headerField, event.target.value);
          return;
        }
        const field = event.target.dataset.keywordField;
        if (field) {
          updateKeywordField(field, event.target.value);
        }
      });

      el.keywordList.addEventListener("focusout", (event) => {
        const editor = event.target.closest(".keyword-header-editor");
        if (!editor || editor.contains(event.relatedTarget) || el.keywordList.contains(event.relatedTarget)) {
          return;
        }
        window.setTimeout(() => {
          if (editingKeywordId && !editor.contains(document.activeElement)) {
            commitKeywordHeaderEdit({ silent: true });
          }
        }, 0);
      });

      el.keywordList.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && event.target.closest(".keyword-header-editor")) {
          event.preventDefault();
          cancelKeywordHeaderEdit();
          return;
        }
        if (event.key === "Enter" && event.target.dataset.keywordHeaderField === "title") {
          event.preventDefault();
          commitKeywordHeaderEdit();
        }
      });

      el.keywordList.addEventListener("dragover", (event) => {
        if (!draggedKeywordId || event.target.closest(".keyword-card")) {
          return;
        }
        clearKeywordDropHints();
      });

      el.keywordList.addEventListener("drop", (event) => {
        if (!draggedKeywordId || event.target.closest(".keyword-card")) {
          return;
        }
        event.preventDefault();
        clearKeywordDropHints();
      });

      el.addKeywordButton.addEventListener("click", addKeyword);
      if (el.manageKeywordCategoriesButton) {
        el.manageKeywordCategoriesButton.addEventListener("click", () => {
          toggleKeywordCategoryManager(state.activeKeywordId || "");
        });
      }
      el.deleteKeywordButton.addEventListener("click", deleteKeyword);
    }

    return {
      getFilteredKeywords,
      getKeywordDisplayId,
      getKeywordCategoryList,
      renderKeywordFilters,
      renderKeywords,
      addKeyword,
      deleteKeyword,
      updateKeywordField,
      renumberKeywordsByOrder,
      bindEvents
    };
  }

  window.PC_KEYWORDBOOK = { create };
})();
