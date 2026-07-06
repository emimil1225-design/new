(() => {
  "use strict";

  function create(api) {
    const {
      state,
      el,
      storage,
      roleTags,
      characterInputs,
      createId,
      escapeHtml,
      compact,
      normalizeCharacter,
      normalizeAttribute,
      createBlankCharacter,
      saveCharacters,
      saveWorlds,
      saveCharacterTags,
      getSelectedCharacter,
      getCharacterWorld,
      pushDeletedItem,
      showToast,
      copyText
    } = api;
    const renderAll = (...args) => api.renderAll(...args);
    const renderPrompt = (...args) => api.renderPrompt(...args);
    const renderKeywords = (...args) => api.renderKeywords(...args);

    let draggedCharacterId = "";
    let suppressCharacterClick = false;
    let isEditingCharacterTags = false;
    let characterTagModal = null;
    let activeOpeningIndex = 0;
    const openingCharacterLimit = 1000;
    const defaultCharacterTags = ["주인공", "서브", "조력자", "라이벌"];
    const characterImageSize = 512;
    const defaultCharacterAvatarSrc = "assets/default-character-avatar.jfif";

    function renderCharacterAvatar(character, sizeClass = "") {
      const imageData = String(character?.imageData || "").trim();
      const imageSrc = imageData || defaultCharacterAvatarSrc;
      const className = `character-avatar${sizeClass ? ` ${sizeClass}` : ""} has-image${imageData ? "" : " default-avatar"}`;
      return `<span class="${className}" aria-hidden="true"><img src="${escapeHtml(imageSrc)}" alt="" loading="lazy"></span>`;
    }

    function normalizeTagList(value, fallback = []) {
      const source = Array.isArray(value)
        ? value
        : String(value || "")
          .split(",")
          .map((item) => item.trim());
      const list = [];
      source.forEach((item) => {
        const clean = String(item || "").trim();
        if (clean && !list.includes(clean)) {
          list.push(clean);
        }
      });
      if (!list.length && fallback.length) {
        fallback.forEach((item) => {
          const clean = String(item || "").trim();
          if (clean && !list.includes(clean)) {
            list.push(clean);
          }
        });
      }
      return list;
    }

    function getCharacterTagOptions() {
      const options = normalizeTagList(state.characterTags && state.characterTags.length ? state.characterTags : roleTags, roleTags.length ? roleTags : defaultCharacterTags);
      state.characters.forEach((character) => {
        normalizeTagList(character.tags).forEach((tag) => {
          if (!options.includes(tag)) {
            options.push(tag);
          }
        });
      });
      if (options.join("|") !== roleTags.join("|")) {
        roleTags.splice(0, roleTags.length, ...options);
        state.characterTags = roleTags;
      }
      return options;
    }

    function setCharacterTagOptions(options) {
      const next = normalizeTagList(options, defaultCharacterTags);
      roleTags.splice(0, roleTags.length, ...next);
      state.characterTags = roleTags;
      if (typeof saveCharacterTags === "function") {
        saveCharacterTags();
      }
      return next;
    }

    function ensureCharacterTagOption(tag) {
      const clean = String(tag || "").trim();
      if (!clean) {
        return "";
      }
      const options = getCharacterTagOptions();
      if (!options.includes(clean)) {
        options.push(clean);
        setCharacterTagOptions(options);
      }
      return clean;
    }

    function focusCharacterTagInput() {
      window.requestAnimationFrame(() => {
        const input = characterTagModal && !characterTagModal.hidden
          ? characterTagModal.querySelector("[data-character-tag-new]")
          : el.characterTagPicker.querySelector("[data-character-tag-new]");
        if (input) {
          input.focus();
        }
      });
    }

    function isCharacterTagManagerOpen() {
      return Boolean(isEditingCharacterTags && characterTagModal && !characterTagModal.hidden);
    }

    function closeCharacterTagManager(options = {}) {
      if (characterTagModal) {
        characterTagModal.hidden = true;
      }
      document.body.classList.remove("category-open");
      isEditingCharacterTags = false;
      if (!options.skipRender) {
        renderCharacterEditor();
      }
      if (!options.silent) {
        showToast("캐릭터 분류 관리 창을 닫았어요");
      }
    }

    function ensureCharacterTagModal() {
      if (characterTagModal) {
        return characterTagModal;
      }
      characterTagModal = document.createElement("div");
      characterTagModal.className = "category-modal character-category-modal";
      characterTagModal.hidden = true;
      characterTagModal.innerHTML = `
        <div class="category-backdrop" data-character-tag-close></div>
        <section class="category-dialog" role="dialog" aria-modal="true" aria-labelledby="characterTagManagerTitle">
          <header class="category-dialog-header">
            <div>
              <h2 id="characterTagManagerTitle">캐릭터 분류 관리</h2>
              <p>캐릭터에 붙일 분류를 선택하고, 분류 목록을 정리할 수 있어요.</p>
            </div>
            <button class="category-close" type="button" data-character-tag-close title="닫기" aria-label="캐릭터 분류 관리 닫기">×</button>
          </header>
          <div class="category-dialog-body"></div>
        </section>
      `;
      document.body.appendChild(characterTagModal);

      characterTagModal.addEventListener("click", (event) => {
        if (event.target.closest("[data-character-tag-close]")) {
          closeCharacterTagManager();
          return;
        }

        const toggleButton = event.target.closest("[data-character-tag-toggle]");
        if (toggleButton) {
          toggleCharacterTag(toggleButton.dataset.characterTagToggle);
          return;
        }

        const renameButton = event.target.closest("[data-character-tag-rename]");
        if (renameButton) {
          renameCharacterTag(renameButton.dataset.characterTagRename, renameButton);
          return;
        }

        const deleteButton = event.target.closest("[data-character-tag-delete]");
        if (deleteButton) {
          deleteCharacterTag(deleteButton.dataset.characterTagDelete);
          return;
        }

        const addButton = event.target.closest("[data-character-tag-add]");
        if (addButton) {
          const input = addButton.closest(".category-dialog")?.querySelector("[data-character-tag-new]");
          addCharacterTagFromInput(input);
        }
      });

      characterTagModal.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && event.target.dataset.characterTagNew !== undefined) {
          event.preventDefault();
          addCharacterTagFromInput(event.target);
          return;
        }
        if (event.key === "Enter" && event.target.dataset.characterTagRenameInput !== undefined) {
          event.preventDefault();
          renameCharacterTag(event.target.dataset.characterTagRenameInput, event.target);
          return;
        }
        if (event.key === "Escape" && event.target.dataset.characterTagRenameInput !== undefined) {
          event.preventDefault();
          event.target.value = event.target.dataset.characterTagRenameInput;
          event.target.select();
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          closeCharacterTagManager();
        }
      });

      return characterTagModal;
    }

    function renderCharacterTagManager() {
      if (!characterTagModal || !isEditingCharacterTags) {
        return;
      }
      const character = getSelectedCharacter();
      if (!character) {
        closeCharacterTagManager({ silent: true });
        return;
      }
      const options = getCharacterTagOptions();
      character.tags = normalizeTagList(character.tags);
      const selectedSet = new Set(character.tags);
      const body = characterTagModal.querySelector(".category-dialog-body");
      if (!body) {
        return;
      }
      const chips = options.map((tag) => {
        const selected = selectedSet.has(tag);
        return `
          <span class="managed-chip character-managed-chip">
            <button class="tag-button${selected ? " active" : ""}" type="button" data-character-tag-toggle="${escapeHtml(tag)}" aria-pressed="${selected ? "true" : "false"}">${escapeHtml(tag)}</button>
          </span>
        `;
      }).join("");
      const rows = options.map((tag) => {
        const selected = selectedSet.has(tag);
        return `
          <div class="category-manager-item tag-manager-item${selected ? " active" : ""}">
            <span class="category-manager-name">${escapeHtml(tag)}</span>
            <input class="tag-rename-input" type="text" data-character-tag-rename-input="${escapeHtml(tag)}" value="${escapeHtml(tag)}" aria-label="${escapeHtml(tag)} 분류명 수정">
            <button class="text-button mini-action tag-rename-button" type="button" data-character-tag-rename="${escapeHtml(tag)}">변경</button>
            <button class="text-button mini-action tag-delete-button" type="button" data-character-tag-delete="${escapeHtml(tag)}">삭제</button>
          </div>
        `;
      }).join("");
      body.innerHTML = `
        <div class="category-manager-current">
          <span>현재 캐릭터</span>
          <strong>${escapeHtml(character.name || "새 캐릭터")}</strong>
          <span class="category-badge-row">${character.tags.map((tag) => `<span class="card-category-badge">${escapeHtml(tag)}</span>`).join("") || `<span class="card-category-badge">분류 없음</span>`}</span>
        </div>
        <p class="category-manager-help">위쪽 분류 태그를 눌러 이 캐릭터에 적용하거나 해제하고, 아래에서 분류명을 추가·변경·삭제할 수 있어요.</p>
        <div class="managed-chip-row character-managed-chip-row" role="group" aria-label="캐릭터 분류 선택">${chips}</div>
        <div class="category-manager-panel tag-manager-panel" role="group" aria-label="캐릭터 분류 목록 관리">
          <div class="category-manager-title">
            <strong>분류 목록</strong>
            <span>이름을 바꾸면 연결된 모든 캐릭터에 함께 반영됩니다.</span>
          </div>
          <div class="category-manager-list">${rows}</div>
          <div class="tag-manage-row category-add-row">
            <input type="text" data-character-tag-new placeholder="새 분류명">
            <button class="text-button mini-action" type="button" data-character-tag-add>추가</button>
          </div>
        </div>
      `;
    }

    function openCharacterTagManager() {
      isEditingCharacterTags = true;
      ensureCharacterTagModal();
      characterTagModal.hidden = false;
      document.body.classList.add("category-open");
      renderCharacterEditor();
      renderCharacterTagManager();
      focusCharacterTagInput();
      showToast("캐릭터 분류 관리 창을 열었어요 🐰");
    }

    function toggleCharacterTagManager() {
      if (isCharacterTagManagerOpen()) {
        closeCharacterTagManager();
        return;
      }
      openCharacterTagManager();
    }

    function getCharacterKeywords(character = getSelectedCharacter()) {
      const selectedIds = new Set(character.keywordIds || []);
      return state.keywords.filter((keyword) => selectedIds.has(keyword.id));
    }

    function renderCharacterTagFilters() {
      const tags = ["전체", ...getCharacterTagOptions()];
      if (!tags.includes(state.tagFilter)) {
        state.tagFilter = "전체";
      }
      el.characterTagFilters.innerHTML = "";
      tags.forEach((tag) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `tag-button${tag === state.tagFilter ? " active" : ""}`;
        button.textContent = tag;
        button.addEventListener("click", () => {
          state.tagFilter = tag;
          renderCharacterTagFilters();
          renderCharacters();
        });
        el.characterTagFilters.appendChild(button);
      });
      renderCharacterAdvancedSearchControls();
    }

    function fillSelect(select, options, selectedValue) {
      if (!select) {
        return;
      }
      const current = options.includes(selectedValue) ? selectedValue : "전체";
      select.innerHTML = options.map((option) => `<option value="${escapeHtml(option)}"${option === current ? " selected" : ""}>${escapeHtml(option)}</option>`).join("");
      select.value = current;
    }

    function getCharacterWorldOptions() {
      const options = ["전체"];
      state.worlds.forEach((world) => {
        const name = String(world?.name || "").trim();
        if (name && !options.includes(name)) {
          options.push(name);
        }
      });
      state.characters.forEach((character) => {
        const world = getCharacterWorld(character);
        const name = String(world?.name || "").trim();
        if (name && !options.includes(name)) {
          options.push(name);
        }
      });
      return options;
    }

    function renderCharacterAdvancedSearchControls() {
      const tags = ["전체", ...getCharacterTagOptions()];
      const worlds = getCharacterWorldOptions();
      if (!tags.includes(state.tagFilter)) {
        state.tagFilter = "전체";
      }
      if (!worlds.includes(state.characterWorldFilter)) {
        state.characterWorldFilter = "전체";
      }
      fillSelect(el.characterAdvancedTagSelect, tags, state.tagFilter);
      fillSelect(el.characterAdvancedWorldSelect, worlds, state.characterWorldFilter || "전체");
      if (el.characterAdvancedSearchToggle) {
        el.characterAdvancedSearchToggle.setAttribute("aria-expanded", state.characterAdvancedSearchOpen ? "true" : "false");
        el.characterAdvancedSearchToggle.setAttribute("aria-label", state.characterAdvancedSearchOpen ? "상세 검색 닫기" : "상세 검색 열기");
        el.characterAdvancedSearchToggle.textContent = state.characterAdvancedSearchOpen ? "▴" : "▾";
      }
      if (el.characterAdvancedSearchPanel) {
        el.characterAdvancedSearchPanel.hidden = !state.characterAdvancedSearchOpen;
      }
    }

    function getFilteredCharacters() {
      return window.PC_SHARED.filterByQuery(state.characters, {
        query: state.characterQuery,
        matches: (character) => {
          const world = getCharacterWorld(character);
          character.tags = normalizeTagList(character.tags);
          const tagMatch = state.tagFilter === "전체" || character.tags.includes(state.tagFilter);
          const worldName = String(world?.name || "").trim();
          return tagMatch && (!state.characterWorldFilter || state.characterWorldFilter === "전체" || worldName === state.characterWorldFilter);
        },
        getText: (character) => {
          const world = getCharacterWorld(character);
          const worldName = String(world?.name || "").trim();
          character.tags = normalizeTagList(character.tags);
          return [
            character.name,
            character.age,
            character.job,
            character.appearance,
            character.personality,
            character.speech,
            character.openings,
            getCharacterKeywords(character).flatMap((keyword) => [keyword.title, keyword.triggers]),
            character.tags.join(" "),
            worldName,
            character.attributes.flatMap((attribute) => [attribute.label, attribute.value])
          ];
        }
      });
    }

    function updateCharacterOrderButtons() {
      const index = state.characters.findIndex((character) => character.id === state.selectedCharacterId);
      const disabled = !state.characterDetailOpen || index === -1 || state.characters.length <= 1;
      el.moveCharacterUpButton.disabled = disabled || index === 0;
      el.moveCharacterDownButton.disabled = disabled || index === state.characters.length - 1;
    }

    function clearCharacterDropHints() {
      window.PC_SHARED.clearDropHints(el.characterList);
    }

    function showCharacterDropHint(card, position) {
      window.PC_SHARED.showDropHint(el.characterList, card, position);
    }

    function moveCharacterRelative(sourceId, targetId, position) {
      return window.PC_SHARED.moveRelativeById(state.characters, sourceId, targetId, position);
    }

    function moveCharacterToEnd(sourceId) {
      return window.PC_SHARED.moveToEndById(state.characters, sourceId);
    }

    function finishCharacterDrag(moved, sourceId) {
      clearCharacterDropHints();
      draggedCharacterId = "";
      if (!moved) {
        return;
      }
      const character = state.characters.find((item) => item.id === sourceId);
      state.selectedCharacterId = sourceId;
      state.selectedWorldId = character?.worldId || state.selectedWorldId;
      state.characterDetailOpen = true;
      saveCharacters();
      saveWorlds();
      renderAll();
      showToast("캐릭터 순서를 바꿨어요 🐰");
    }

    function renderCharacters() {
      const characters = getFilteredCharacters();
      const nextSelectedCharacterId = window.PC_SHARED.resolveVisibleSelection(characters, state.selectedCharacterId, {
        fallbackItems: state.characters
      });
      if (!characters.some((character) => character.id === state.selectedCharacterId)) {
        state.characterDetailOpen = false;
      }
      if (state.selectedCharacterId !== nextSelectedCharacterId) {
        state.selectedCharacterId = nextSelectedCharacterId;
        const nextCharacter = getSelectedCharacter();
        state.selectedWorldId = nextCharacter?.worldId || state.selectedWorldId;
        activeOpeningIndex = 0;
        isEditingCharacterTags = false;
        if (characterTagModal) {
          characterTagModal.hidden = true;
          document.body.classList.remove("category-open");
        }
      }
      const selectedCharacterNumber = state.characterDetailOpen && state.selectedCharacterId ? state.characters.findIndex((item) => item.id === state.selectedCharacterId) + 1 : 0;
      el.characterCount.textContent = `${Math.max(0, selectedCharacterNumber)} / ${state.characters.length}명`;
      el.characterList.innerHTML = "";
      updateCharacterOrderButtons();

      if (!characters.length) {
        el.characterList.innerHTML = `<div class="empty cute-empty"><strong>캐릭터를 찾지 못했어요 🐰</strong><span>검색어나 분류 태그를 조금 바꿔볼까요?</span></div>`;
        return;
      }

      characters.forEach((character) => {
        const world = getCharacterWorld(character);
        const card = document.createElement("button");
        card.type = "button";
        const layoutClass = Number(state.characterCardColumns) > 1 ? " compact-grid-card" : "";
        card.className = `character-card${layoutClass}${state.characterDetailOpen && character.id === state.selectedCharacterId ? " active" : ""}`;
        card.draggable = state.characters.length > 1;
        card.dataset.characterId = character.id;
        card.innerHTML = `
          <span class="character-card-main">
            <span class="character-card-heading">
              ${renderCharacterAvatar(character, "card-avatar")}
              <span class="card-top">
                <strong>${escapeHtml(character.name)}</strong>
              </span>
            </span>
            <span class="tag-row">
              ${character.tags.map((tag) => `<span class="tag teal">${escapeHtml(tag)}</span>`).join("")}
            </span>
            <span class="card-meta">${escapeHtml(compact([character.age, character.job, world.name], " · "))}</span>
          </span>
        `;
        card.addEventListener("click", () => {
          if (suppressCharacterClick) {
            suppressCharacterClick = false;
            return;
          }
          const isClosing = state.characterDetailOpen && state.selectedCharacterId === character.id;
          state.characterDetailOpen = !isClosing;
          activeOpeningIndex = 0;
          isEditingCharacterTags = false;
          if (characterTagModal) {
            characterTagModal.hidden = true;
            document.body.classList.remove("category-open");
          }
          if (!isClosing) {
            state.selectedCharacterId = character.id;
            state.selectedWorldId = character.worldId || state.selectedWorldId;
          }
          saveCharacters();
          saveWorlds();
          renderAll();
        });
        window.PC_SHARED.bindOrderableCard(card, {
          targetId: character.id,
          getDraggedId: () => draggedCharacterId,
          setDraggedId: (value) => { draggedCharacterId = value; },
          setSuppressClick: (value) => { suppressCharacterClick = value; },
          showDropHint: showCharacterDropHint,
          clearDropHints: clearCharacterDropHints,
          moveRelative: moveCharacterRelative,
          finishReorder: finishCharacterDrag,
          clickSuppressDelay: 160
        });
        el.characterList.appendChild(card);
      });
    }

    function renderCharacterTagPicker(character) {
      const options = getCharacterTagOptions();
      character.tags = normalizeTagList(character.tags);
      const managerOpen = isCharacterTagManagerOpen();
      el.characterTagPicker.innerHTML = "";
      el.characterTagPicker.classList.toggle("managing-tags", managerOpen);

      const header = document.createElement("div");
      header.className = "tag-picker-header";
      header.innerHTML = `
        <span class="field-label">분류</span>
        <button class="text-button mini-action tag-manage-toggle${managerOpen ? " active" : ""}" type="button" data-character-tag-edit-toggle aria-pressed="${managerOpen ? "true" : "false"}">${managerOpen ? "관리 중" : "분류 관리"}</button>
      `;
      el.characterTagPicker.appendChild(header);

      const chipGroup = document.createElement("div");
      chipGroup.className = "managed-chip-row character-managed-chip-row";
      options.forEach((tag) => {
        const selected = character.tags.includes(tag);
        const chip = document.createElement("span");
        chip.className = "managed-chip character-managed-chip";
        chip.innerHTML = `
          <button class="tag-button${selected ? " active" : ""}" type="button" data-character-tag-toggle="${escapeHtml(tag)}" aria-pressed="${selected ? "true" : "false"}">${escapeHtml(tag)}</button>
        `;
        chipGroup.appendChild(chip);
      });
      el.characterTagPicker.appendChild(chipGroup);
    }

    function renderCharacterEditorVisibility() {
      const collapsed = Boolean(state.characterEditorCollapsed);
      if (el.characterWindow) {
        el.characterWindow.classList.toggle("character-editor-collapsed", collapsed);
      }
      if (el.characterSplitList) {
        el.characterSplitList.classList.toggle("character-editor-collapsed", collapsed);
      }
      if (el.characterEditorVisibilityToggle) {
        el.characterEditorVisibilityToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
        el.characterEditorVisibilityToggle.setAttribute("aria-label", collapsed ? "캐릭터 속성창 보이기" : "캐릭터 속성창 숨기기");
        el.characterEditorVisibilityToggle.setAttribute("title", collapsed ? "캐릭터 속성창 보이기" : "캐릭터 속성창 숨기기");
        el.characterEditorVisibilityToggle.textContent = collapsed ? "›" : "‹";
      }
    }

    function renderCharacterEditor() {
      renderCharacterEditorVisibility();
      if (!state.characterDetailOpen) {
        if (el.characterEditorPanel) {
          el.characterEditorPanel.hidden = false;
          el.characterEditorPanel.classList.add("character-editor-closed");
          el.characterEditorPanel.setAttribute("aria-hidden", "true");
        }
        if (el.deleteCharacterButton) {
          el.deleteCharacterButton.disabled = true;
        }
        if (el.clearCharacterButton) {
          el.clearCharacterButton.disabled = true;
        }
        return;
      }
      if (el.characterEditorPanel) {
        el.characterEditorPanel.hidden = false;
        el.characterEditorPanel.classList.remove("character-editor-closed");
        el.characterEditorPanel.removeAttribute("aria-hidden");
      }
      if (el.clearCharacterButton) {
        el.clearCharacterButton.disabled = false;
      }
      const character = getSelectedCharacter();
      el.characterEditorTitle.textContent = character.name || "캐릭터 편집";
      el.characterName.value = character.name || "";
      el.characterAge.value = character.age || "";
      el.characterJob.value = character.job || "";
      el.characterAppearance.value = character.appearance || "";
      el.characterPersonality.value = character.personality || "";
      el.characterSpeech.value = character.speech || "";
      renderCharacterPhotoEditor(character);
      renderOpeningEditor(character);
      renderCharacterKeywordPicker(character);

      el.characterWorldSelect.innerHTML = "";
      state.worlds.forEach((world) => {
        const option = document.createElement("option");
        option.value = world.id;
        option.textContent = world.name || "이름 없는 세계관";
        el.characterWorldSelect.appendChild(option);
      });
      el.characterWorldSelect.value = character.worldId || state.selectedWorldId;

      renderCharacterTagPicker(character);
      renderAttributes();
      const visibleCharacterIds = new Set(getFilteredCharacters().map((item) => item.id));
      const selectedCharacterVisible = visibleCharacterIds.has(character.id);
      el.deleteCharacterButton.disabled = !state.characterDetailOpen || state.characters.length <= 1 || !selectedCharacterVisible;
    }

    function renderCharacterPhotoEditor(character = getSelectedCharacter()) {
      if (!el.characterPhotoPreview) {
        return;
      }
      const hasImage = Boolean(String(character.imageData || "").trim());
      el.characterPhotoPreview.classList.toggle("has-image", hasImage);
      el.characterPhotoPreview.innerHTML = renderCharacterAvatar(character, "editor-avatar");
      if (el.removeCharacterImageButton) {
        el.removeCharacterImageButton.disabled = !hasImage;
      }
    }

    function renderOpeningEditor(character = getSelectedCharacter()) {
      activeOpeningIndex = Math.max(0, Math.min(4, activeOpeningIndex));
      el.openingSlotPicker.innerHTML = "";
      character.openings.forEach((opening, index) => {
        const button = document.createElement("button");
        const filled = Boolean(String(opening || "").trim());
        button.type = "button";
        button.className = `opening-slot-button${index === activeOpeningIndex ? " active" : ""}${filled ? " filled" : ""}`;
        button.dataset.openingSlot = String(index);
        button.textContent = String(index + 1);
        button.title = `도입부 ${index + 1}${filled ? " · 작성됨" : ""}`;
        button.setAttribute("aria-label", `도입부 ${index + 1}${filled ? ", 작성됨" : ""}`);
        button.setAttribute("aria-pressed", index === activeOpeningIndex ? "true" : "false");
        el.openingSlotPicker.appendChild(button);
      });
      el.characterOpening.value = character.openings[activeOpeningIndex] || "";
      el.characterOpening.placeholder = `도입부 ${activeOpeningIndex + 1} 내용을 적어두세요.`;
      el.copyOpeningButton.disabled = !el.characterOpening.value.trim();
      updateOpeningCharCount();
    }

    function updateOpeningCharCount() {
      if (!el.openingCharCount) {
        return;
      }
      const count = Array.from(el.characterOpening.value || "").length;
      const over = count > openingCharacterLimit;
      const overText = over ? ` · ${count - openingCharacterLimit}자 초과` : "";
      el.openingCharCount.textContent = `${count} / ${openingCharacterLimit}자${overText}`;
      el.openingCharCount.classList.toggle("over-limit", over);
    }

    function renderCharacterKeywordPicker(character = getSelectedCharacter()) {
      const validKeywordIds = new Set(state.keywords.map((keyword) => keyword.id));
      character.keywordIds = (character.keywordIds || [])
        .filter((id) => validKeywordIds.has(id))
        .slice(0, 15);

      const selectedIds = new Set(character.keywordIds);
      const selectedCount = selectedIds.size;
      el.characterKeywordCount.textContent = `${selectedCount} / 15`;
      el.characterKeywordPicker.innerHTML = "";

      if (!state.keywords.length) {
        el.characterKeywordPicker.innerHTML = `<div class="empty cute-empty small"><strong>키워드북이 비어 있어요 🐰</strong><span>왼쪽 키워드북에서 자주 쓰는 설정을 먼저 만들어보세요.</span></div>`;
        return;
      }

      state.keywords.forEach((keyword) => {
        const selected = selectedIds.has(keyword.id);
        const button = document.createElement("button");
        button.type = "button";
        button.className = `character-keyword-button${selected ? " active" : ""}`;
        button.dataset.characterKeywordId = keyword.id;
        button.textContent = keyword.title || "이름 없는 키워드";
        button.title = compact([
          keyword.title || "이름 없는 키워드",
          keyword.triggers ? `트리거: ${keyword.triggers}` : ""
        ], " · ");
        button.setAttribute("aria-pressed", selected ? "true" : "false");
        button.disabled = !selected && selectedCount >= 15;
        el.characterKeywordPicker.appendChild(button);
      });
    }

    function renderAttributes() {
      const character = getSelectedCharacter();
      el.attributeList.innerHTML = "";

      if (!character.attributes.length) {
        el.attributeList.innerHTML = `<div class="attribute-empty">추가된 속성이 없어요</div>`;
        return;
      }

      character.attributes.forEach((attribute) => {
        const row = document.createElement("div");
        row.className = "attribute-row";
        row.innerHTML = `
          <input type="text" value="${escapeHtml(attribute.label)}" placeholder="속성명" data-attr-label="${escapeHtml(attribute.id)}">
          <textarea placeholder="내용" data-attr-value="${escapeHtml(attribute.id)}">${escapeHtml(attribute.value)}</textarea>
          <label class="attribute-prompt-toggle" title="이 속성을 프롬프트에 포함">
            <input type="checkbox" data-attr-prompt="${escapeHtml(attribute.id)}" ${attribute.includeInPrompt !== false ? "checked" : ""}>
            <span>프롬프트 포함</span>
          </label>
          <button class="icon-button" type="button" title="속성 삭제" data-attr-delete="${escapeHtml(attribute.id)}">−</button>
        `;
        el.attributeList.appendChild(row);
      });
    }

    function readFileAsDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(reader.error || new Error("이미지를 읽지 못했어요"));
        reader.readAsDataURL(file);
      });
    }

    function loadImage(dataUrl) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("이미지를 불러오지 못했어요"));
        image.src = dataUrl;
      });
    }

    async function createCharacterImageData(file) {
      if (!file || !file.type || !file.type.startsWith("image/")) {
        throw new Error("이미지 파일을 선택해주세요");
      }
      const dataUrl = await readFileAsDataUrl(file);
      const image = await loadImage(dataUrl);
      const size = characterImageSize;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      const sourceSize = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
      const sourceX = Math.max(0, ((image.naturalWidth || image.width) - sourceSize) / 2);
      const sourceY = Math.max(0, ((image.naturalHeight || image.height) - sourceSize) / 2);
      context.fillStyle = "#fff8fb";
      context.fillRect(0, 0, size, size);
      context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
      return canvas.toDataURL("image/jpeg", 0.86);
    }

    async function updateCharacterImageFromFile(file) {
      try {
        const character = getSelectedCharacter();
        character.imageData = await createCharacterImageData(file);
        saveCharacters();
        renderCharacters();
        renderCharacterPhotoEditor(character);
        showToast("캐릭터 사진을 넣었어요");
      } catch (error) {
        showToast(error?.message || "사진을 넣지 못했어요");
      } finally {
        if (el.characterImageInput) {
          el.characterImageInput.value = "";
        }
      }
    }

    function removeCharacterImage() {
      const character = getSelectedCharacter();
      if (!character.imageData) {
        return;
      }
      character.imageData = "";
      saveCharacters();
      renderCharacters();
      renderCharacterPhotoEditor(character);
      showToast("캐릭터 사진을 삭제했어요");
    }

    function revealCharacterCard(characterId) {
      if (!characterId || !el.characterList) {
        return;
      }
      window.requestAnimationFrame(() => {
        const card = Array.from(el.characterList.querySelectorAll("[data-character-id]")).find((item) => item.dataset.characterId === characterId);
        if (!card) {
          return;
        }
        window.PC_SHARED.revealInScrollContainer(el.characterList, card, { behavior: "smooth", block: "center" });
      });
    }

    function focusCharacterNameField() {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const scrollContainer = el.characterEditorPanel?.closest(".vault-window-body");
          if (scrollContainer && el.characterName) {
            window.PC_SHARED.revealInScrollContainer(scrollContainer, el.characterName, { behavior: "smooth", block: "center" });
          }
          window.PC_SHARED.focusWithoutScroll(el.characterName, { select: true });
        });
      });
    }

    function addCharacter() {
      const character = createBlankCharacter(state.selectedWorldId);
      state.characters.push(character);
      state.selectedCharacterId = character.id;
      state.characterDetailOpen = true;
      state.characterQuery = "";
      state.tagFilter = "전체";
      state.characterWorldFilter = "전체";
      if (el.characterSearchInput) {
        el.characterSearchInput.value = "";
      }
      isEditingCharacterTags = false;
      if (characterTagModal) {
        characterTagModal.hidden = true;
        document.body.classList.remove("category-open");
      }
      activeOpeningIndex = 0;
      saveCharacters();
      renderAll();
      revealCharacterCard(character.id);
      focusCharacterNameField();
      showToast("캐릭터를 추가했어요 ✨");
    }

    function deleteCharacter() {
      if (!state.characterDetailOpen) {
        return;
      }
      if (state.characters.length <= 1) {
        showToast("최소 1명은 필요해요");
        return;
      }
      const deletedCharacterId = state.selectedCharacterId;
      const visibleCharactersBeforeDelete = getFilteredCharacters();
      const deletedVisibleIndex = visibleCharactersBeforeDelete.findIndex((character) => character.id === deletedCharacterId);
      const deletedCharacter = getSelectedCharacter();
      const deletedIndex = state.characters.findIndex((character) => character.id === deletedCharacter.id);
      const nextVisibleCharacter = deletedVisibleIndex >= 0
        ? visibleCharactersBeforeDelete[deletedVisibleIndex + 1] || visibleCharactersBeforeDelete[deletedVisibleIndex - 1]
        : null;
      const nextFallbackCharacter = state.characters[deletedIndex + 1] || state.characters[deletedIndex - 1] || null;
      pushDeletedItem({
        type: "character",
        item: deletedCharacter,
        index: deletedIndex
      });
      state.characters = state.characters.filter((character) => character.id !== deletedCharacterId);
      const nextCharacterId = nextVisibleCharacter?.id || nextFallbackCharacter?.id || state.characters[0]?.id || "";
      state.selectedCharacterId = nextCharacterId;
      state.characterDetailOpen = Boolean(nextCharacterId);
      isEditingCharacterTags = false;
      if (characterTagModal) {
        characterTagModal.hidden = true;
        document.body.classList.remove("category-open");
      }
      activeOpeningIndex = 0;
      saveCharacters();
      renderAll();
      showToast("캐릭터를 삭제했어요", { undoDelete: true });
    }

    function moveSelectedCharacter(direction) {
      const index = state.characters.findIndex((character) => character.id === state.selectedCharacterId);
      const nextIndex = index + direction;
      if (index === -1 || nextIndex < 0 || nextIndex >= state.characters.length) {
        return;
      }

      const [character] = state.characters.splice(index, 1);
      state.characters.splice(nextIndex, 0, character);
      saveCharacters();
      renderCharacters();
      renderCharacterEditor();
      showToast(direction < 0 ? "캐릭터를 위로 이동했어요" : "캐릭터를 아래로 이동했어요");
    }

    function clearCharacter() {
      const character = getSelectedCharacter();
      character.name = "새 캐릭터";
      character.age = "";
      character.job = "";
      character.appearance = "";
      character.personality = "";
      character.speech = "";
      character.imageData = "";
      character.openings = Array(5).fill("");
      character.keywordIds = [];
      activeOpeningIndex = 0;
      isEditingCharacterTags = false;
      if (characterTagModal) {
        characterTagModal.hidden = true;
        document.body.classList.remove("category-open");
      }
      character.tags = [];
      character.attributes = [];
      saveCharacters();
      renderAll();
      showToast("선택 캐릭터를 초기화했어요");
    }

    function toggleCharacterTag(tag) {
      const clean = ensureCharacterTagOption(tag);
      if (!clean) {
        return;
      }
      const character = getSelectedCharacter();
      character.tags = normalizeTagList(character.tags);
      if (character.tags.includes(clean)) {
        character.tags = character.tags.filter((item) => item !== clean);
      } else {
        character.tags.push(clean);
      }
      saveCharacters();
      renderCharacterTagFilters();
      renderCharacters();
      renderCharacterEditor();
      renderCharacterTagManager();
      renderPrompt();
    }

    function addCharacterTagFromInput(input) {
      if (!isEditingCharacterTags) {
        showToast("분류 관리를 연 뒤 새 분류를 추가해주세요");
        return;
      }
      const clean = String(input?.value || "").trim();
      if (!clean) {
        showToast("추가할 분류명을 입력해주세요");
        input?.focus();
        return;
      }
      if (clean === "전체") {
        showToast("전체는 검색용 분류라 사용할 수 없어요");
        input.value = "";
        input.focus();
        return;
      }
      ensureCharacterTagOption(clean);
      const character = getSelectedCharacter();
      character.tags = normalizeTagList([...(Array.isArray(character.tags) ? character.tags : []), clean]);
      saveCharacters();
      if (input) {
        input.value = "";
      }
      renderCharacterTagFilters();
      renderCharacters();
      renderCharacterEditor();
      renderCharacterTagManager();
      renderPrompt();
      showToast(`분류 '${clean}'을 추가했어요 ✨`);
    }

    function renameCharacterTag(tag, inputOrButton) {
      if (!isEditingCharacterTags) {
        showToast("분류 관리를 연 뒤 이름을 변경해주세요");
        return;
      }
      const from = String(tag || "").trim();
      const container = inputOrButton?.closest?.(".tag-edit-item, .tag-manager-item, .category-manager-item") || el.characterTagPicker;
      const input = container?.querySelector?.("[data-character-tag-rename-input]");
      const to = String(input?.value || "").trim();
      if (!from) {
        return;
      }
      if (!to) {
        showToast("변경할 분류명을 입력해주세요");
        input?.focus();
        return;
      }
      if (to === "전체") {
        showToast("전체는 검색용 분류라 사용할 수 없어요");
        input.value = from;
        input.focus();
        return;
      }
      if (from === to) {
        showToast("분류명이 그대로예요");
        input?.focus();
        input?.select?.();
        return;
      }

      const beforeOptions = getCharacterTagOptions();
      const nextOptions = [];
      beforeOptions.forEach((item) => {
        const nextItem = item === from ? to : item;
        if (nextItem && !nextOptions.includes(nextItem)) {
          nextOptions.push(nextItem);
        }
      });
      if (!nextOptions.includes(to)) {
        nextOptions.push(to);
      }
      setCharacterTagOptions(nextOptions);

      let changedCount = 0;
      state.characters.forEach((character) => {
        const before = normalizeTagList(character.tags);
        if (!before.includes(from)) {
          return;
        }
        character.tags = normalizeTagList(before.map((item) => item === from ? to : item));
        changedCount += 1;
      });
      if (state.tagFilter === from) {
        state.tagFilter = to;
      }
      saveCharacters();
      renderCharacterTagFilters();
      renderCharacters();
      renderCharacterEditor();
      renderCharacterTagManager();
      renderPrompt();
      showToast(changedCount ? `분류 '${from}'을 '${to}'로 변경했어요` : `분류명을 '${to}'로 변경했어요`);
    }

    function deleteCharacterTag(tag) {
      if (!isEditingCharacterTags) {
        showToast("분류 관리를 연 뒤 삭제해주세요");
        return;
      }
      const clean = String(tag || "").trim();
      if (!clean) {
        return;
      }
      const beforeOptions = getCharacterTagOptions();
      const options = beforeOptions.filter((item) => item !== clean);
      if (!options.length) {
        showToast("분류는 최소 1개가 필요해요");
        return;
      }
      const affectedCharacters = [];
      setCharacterTagOptions(options);
      state.characters.forEach((character) => {
        const before = normalizeTagList(character.tags);
        const after = before.filter((item) => item !== clean);
        if (before.includes(clean)) {
          affectedCharacters.push({
            id: character.id,
            name: character.name || "",
            before,
            after
          });
        }
        character.tags = after;
      });
      if (typeof pushDeletedItem === "function") {
        pushDeletedItem({
          type: "characterTag",
          item: {
            name: clean,
            options: beforeOptions,
            affectedCharacters,
            activeFilter: state.tagFilter
          },
          index: Math.max(0, beforeOptions.indexOf(clean))
        });
      }
      if (state.tagFilter === clean) {
        state.tagFilter = "전체";
      }
      saveCharacters({ track: false });
      renderCharacterTagFilters();
      renderCharacters();
      renderCharacterEditor();
      renderCharacterTagManager();
      renderPrompt();
      showToast(`분류 '${clean}'을 삭제했어요`, { undoDelete: true });
    }

    function bindEvents() {
      el.characterSearchInput.addEventListener("input", (event) => {
        state.characterQuery = event.target.value;
        renderCharacters();
      });

      el.characterAdvancedSearchToggle?.addEventListener("click", () => {
        state.characterAdvancedSearchOpen = !state.characterAdvancedSearchOpen;
        renderCharacterAdvancedSearchControls();
      });

      el.characterEditorVisibilityToggle?.addEventListener("click", () => {
        state.characterEditorCollapsed = !state.characterEditorCollapsed;
        try {
          localStorage.setItem(storage.characterEditorCollapsed, String(state.characterEditorCollapsed));
        } catch (error) {
          console.warn("캐릭터 속성창 접기 상태를 저장하지 못했어요.", error);
        }
        renderCharacterEditor();
      });

      el.characterAdvancedApplyButton?.addEventListener("click", () => {
        state.tagFilter = el.characterAdvancedTagSelect?.value || "전체";
        state.characterWorldFilter = el.characterAdvancedWorldSelect?.value || "전체";
        renderCharacterTagFilters();
        renderCharacters();
      });

      el.characterAdvancedTagSelect?.addEventListener("change", (event) => {
        state.tagFilter = event.target.value || "전체";
        renderCharacterTagFilters();
        renderCharacters();
      });

      el.characterAdvancedWorldSelect?.addEventListener("change", (event) => {
        state.characterWorldFilter = event.target.value || "전체";
        renderCharacters();
      });

      el.characterAdvancedResetButton?.addEventListener("click", () => {
        state.characterQuery = "";
        state.tagFilter = "전체";
        state.characterWorldFilter = "전체";
        if (el.characterSearchInput) {
          el.characterSearchInput.value = "";
        }
        renderCharacterTagFilters();
        renderCharacters();
      });

      el.moveCharacterUpButton.addEventListener("click", () => moveSelectedCharacter(-1));
      el.moveCharacterDownButton.addEventListener("click", () => moveSelectedCharacter(1));
      el.addCharacterButton.addEventListener("click", addCharacter);
      el.deleteCharacterButton.addEventListener("click", deleteCharacter);
      el.clearCharacterButton.addEventListener("click", clearCharacter);
      el.chooseCharacterImageButton?.addEventListener("click", () => {
        el.characterImageInput?.click();
      });
      el.characterImageInput?.addEventListener("change", (event) => {
        const file = event.target.files?.[0];
        if (file) {
          updateCharacterImageFromFile(file);
        }
      });
      el.removeCharacterImageButton?.addEventListener("click", removeCharacterImage);

      el.characterList.addEventListener("dragover", (event) => {
        if (!draggedCharacterId || event.target.closest(".character-card")) {
          return;
        }
        clearCharacterDropHints();
      });

      el.characterList.addEventListener("drop", (event) => {
        if (!draggedCharacterId || event.target.closest(".character-card")) {
          return;
        }
        event.preventDefault();
        clearCharacterDropHints();
      });

      function refreshCharacterDerivedPrompt() {
        const characterPromptVariants = new Set(["character", "characterIntro", "niji", "chatgpt"]);
        renderPrompt(characterPromptVariants.has(state.promptVariant));
      }

      characterInputs.forEach(([key, input]) => {
        input.addEventListener("input", () => {
          const character = getSelectedCharacter();
          character[key] = input.value.trim();
          saveCharacters();
          renderCharacters();
          if (key === "name") {
            el.characterEditorTitle.textContent = character.name || "캐릭터 편집";
          }
          refreshCharacterDerivedPrompt();
        });
      });

      el.characterTagPicker.addEventListener("click", (event) => {
        const editToggleButton = event.target.closest("[data-character-tag-edit-toggle]");
        if (editToggleButton) {
          toggleCharacterTagManager();
          return;
        }

        const toggleButton = event.target.closest("[data-character-tag-toggle]");
        if (toggleButton) {
          toggleCharacterTag(toggleButton.dataset.characterTagToggle);
          return;
        }

        const renameButton = event.target.closest("[data-character-tag-rename]");
        if (renameButton) {
          renameCharacterTag(renameButton.dataset.characterTagRename, renameButton);
          return;
        }

        const deleteButton = event.target.closest("[data-character-tag-delete]");
        if (deleteButton) {
          deleteCharacterTag(deleteButton.dataset.characterTagDelete);
          return;
        }

        const addButton = event.target.closest("[data-character-tag-add]");
        if (addButton) {
          const input = addButton.closest(".tag-manage-row, .tag-manager-panel")?.querySelector("[data-character-tag-new]");
          addCharacterTagFromInput(input);
        }
      });

      el.characterTagPicker.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && event.target.dataset.characterTagNew !== undefined) {
          event.preventDefault();
          addCharacterTagFromInput(event.target);
          return;
        }
        if (event.key === "Enter" && event.target.dataset.characterTagRenameInput !== undefined) {
          event.preventDefault();
          renameCharacterTag(event.target.dataset.characterTagRenameInput, event.target);
          return;
        }
        if (event.key === "Escape" && event.target.dataset.characterTagRenameInput !== undefined) {
          event.preventDefault();
          event.target.value = event.target.dataset.characterTagRenameInput;
          event.target.select();
        }
      });

      el.openingSlotPicker.addEventListener("click", (event) => {
        const button = event.target.closest("[data-opening-slot]");
        if (!button) {
          return;
        }
        activeOpeningIndex = Number(button.dataset.openingSlot) || 0;
        renderOpeningEditor();
        el.characterOpening.focus();
      });

      el.characterOpening.addEventListener("input", () => {
        const character = getSelectedCharacter();
        character.openings[activeOpeningIndex] = el.characterOpening.value.trim();
        saveCharacters();
        renderCharacters();
        const button = el.openingSlotPicker.querySelector(`[data-opening-slot="${activeOpeningIndex}"]`);
        if (button) {
          const filled = Boolean(character.openings[activeOpeningIndex]);
          button.classList.toggle("filled", filled);
          button.title = `도입부 ${activeOpeningIndex + 1}${filled ? " · 작성됨" : ""}`;
          button.setAttribute("aria-label", `도입부 ${activeOpeningIndex + 1}${filled ? ", 작성됨" : ""}`);
        }
        el.copyOpeningButton.disabled = !el.characterOpening.value.trim();
        updateOpeningCharCount();
      });

      el.copyOpeningButton.addEventListener("click", () => {
        const opening = el.characterOpening.value;
        if (!opening.trim()) {
          return;
        }
        copyText(opening, `도입부 ${activeOpeningIndex + 1}`);
      });

      el.characterKeywordPicker.addEventListener("click", (event) => {
        const button = event.target.closest("[data-character-keyword-id]");
        if (!button) {
          return;
        }

        const character = getSelectedCharacter();
        const keywordId = button.dataset.characterKeywordId;
        const selected = character.keywordIds.includes(keywordId);

        if (selected) {
          character.keywordIds = character.keywordIds.filter((id) => id !== keywordId);
        } else if (character.keywordIds.length < 15) {
          character.keywordIds.push(keywordId);
        } else {
          showToast("키워드는 최대 15개까지 선택할 수 있어요");
          return;
        }

        saveCharacters();
        renderCharacterKeywordPicker(character);
        renderKeywords();
      });

      el.characterWorldSelect.addEventListener("change", (event) => {
        const character = getSelectedCharacter();
        character.worldId = event.target.value;
        saveCharacters();
        renderCharacters();
        renderPrompt();
      });

      el.addAttributeButton.addEventListener("click", () => {
        const character = getSelectedCharacter();
        character.attributes.push(normalizeAttribute({ label: "", value: "" }));
        saveCharacters();
        renderCharacterEditor();
        refreshCharacterDerivedPrompt();
        const lastRow = el.attributeList.querySelector(".attribute-row:last-child");
        const lastInput = lastRow ? lastRow.querySelector("input") : null;
        window.requestAnimationFrame(() => {
          const editorPanel = el.characterEditorPanel;
          if (editorPanel && lastRow) {
            const editorRect = editorPanel.getBoundingClientRect();
            const rowRect = lastRow.getBoundingClientRect();
            const targetTop = editorPanel.scrollTop + rowRect.top - editorRect.top - 24;
            editorPanel.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
          }
          if (lastInput) {
            lastInput.focus({ preventScroll: true });
          }
        });
      });

      el.attributeList.addEventListener("input", (event) => {
        const labelId = event.target.dataset.attrLabel;
        const valueId = event.target.dataset.attrValue;
        const promptId = event.target.dataset.attrPrompt;
        const id = labelId || valueId || promptId;
        if (!id) {
          return;
        }
        const attribute = getSelectedCharacter().attributes.find((item) => item.id === id);
        if (!attribute) {
          return;
        }
        if (labelId) {
          attribute.label = event.target.value.trim();
        }
        if (valueId) {
          attribute.value = event.target.value.trim();
        }
        if (promptId) {
          attribute.includeInPrompt = event.target.checked;
        }
        saveCharacters();
        refreshCharacterDerivedPrompt();
      });

      el.attributeList.addEventListener("click", (event) => {
        const deleteButton = event.target.closest("[data-attr-delete]");
        if (!deleteButton) {
          return;
        }
        const character = getSelectedCharacter();
        character.attributes = character.attributes.filter((attribute) => attribute.id !== deleteButton.dataset.attrDelete);
        saveCharacters();
        renderCharacterEditor();
        refreshCharacterDerivedPrompt();
        showToast("속성 삭제됨");
      });
    }

    return {
      getCharacterKeywords,
      renderCharacterTagFilters,
      getFilteredCharacters,
      updateCharacterOrderButtons,
      renderCharacters,
      renderCharacterEditor,
      renderOpeningEditor,
      renderCharacterKeywordPicker,
      renderAttributes,
      addCharacter,
      deleteCharacter,
      moveSelectedCharacter,
      clearCharacter,
      bindEvents
    };
  }

  window.PC_CHARACTERS = { create };
})();
