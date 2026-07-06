(() => {
  "use strict";

  const defaultAllCategory = "전체";
  const defaultSceneCategory = "대표";
  const fallbackSceneCategories = ["대표", "관계", "일상", "서사", "갈등", "이벤트", "계절"];
  const sceneIdPrefix = "ST";
  const globalSceneCategoryManagerId = "__scene-category-global__";

  function formatSceneId(index) {
    return `${sceneIdPrefix}-${String(index + 1).padStart(3, "0")}`;
  }

  function makeId(createId, prefix) {
    return typeof createId === "function"
      ? createId(prefix)
      : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
  }

  function getSceneNumber(id) {
    const match = String(id || "").match(/^ST-(\d+)$/i);
    return match ? Number(match[1]) : 0;
  }

  function getNextSceneId(state) {
    const count = Array.isArray(state.scenes) ? state.scenes.length : 0;
    return formatSceneId(count);
  }

  function normalizeCategoryList(value) {
    const source = Array.isArray(value)
      ? value
      : String(value || "").split(/[,\n]+/);
    return Array.from(new Set(source
      .map((category) => String(category || "").trim())
      .filter((category) => category && category !== defaultAllCategory)));
  }

  function getSceneCategoryList(scene = {}) {
    const categories = normalizeCategoryList(
      Array.isArray(scene.categories) && scene.categories.length ? scene.categories : scene.category
    );
    return categories.length ? categories : [defaultSceneCategory];
  }

  function syncSceneCategories(scene, categories) {
    const normalized = normalizeCategoryList(categories);
    const nextCategories = normalized.length ? normalized : [defaultSceneCategory];
    scene.categories = nextCategories;
    scene.category = nextCategories[0] || defaultSceneCategory;
    return nextCategories;
  }

  function normalizeGeneratedSceneIds(scenes) {
    let nextNumber = scenes.reduce((max, scene) => Math.max(max, getSceneNumber(scene.id)), 0) + 1;
    return scenes.map((scene) => {
      if (!/^scene-\d+-[a-z0-9]+$/i.test(String(scene.id || ""))) {
        return scene;
      }
      return {
        ...scene,
        id: `ST-${String(nextNumber++).padStart(3, "0")}`
      };
    });
  }

  function normalizeScene(scene = {}, createId) {
    const normalized = {
      id: scene.id || makeId(createId, "scene"),
      title: scene.title || scene.name || "새 상황",
      category: scene.category || defaultSceneCategory,
      categories: [],
      scene: scene.scene || ""
    };
    syncSceneCategories(normalized, Array.isArray(scene.categories) && scene.categories.length ? scene.categories : scene.category);
    return normalized;
  }

  function loadScenes({
    readJson,
    storage,
    sourceTemplates = [],
    createId
  }) {
    const stored = readJson(storage.scenes, null);
    if (Array.isArray(stored) && stored.length) {
      return normalizeGeneratedSceneIds(stored.map((scene) => normalizeScene(scene, createId)));
    }

    const scenes = sourceTemplates.map((template) => normalizeScene(template, createId));

    return scenes.length ? scenes : [normalizeScene({}, createId)];
  }

  function getTemplate(state, id = state.activeSceneId) {
    return state.scenes.find((template) => template.id === id) || state.scenes[0];
  }

  function getTemplateView({
    state,
    id = state.activeSceneId,
    createId
  }) {
    const template = getTemplate(state, id);
    if (!template) {
      return normalizeScene({}, createId);
    }

    return {
      ...template,
      categories: getSceneCategoryList(template)
    };
  }

  function getSceneCategories({
    state,
    sourceCategories = [],
    allCategory = defaultAllCategory
  }) {
    const categories = new Set([allCategory]);
    const baseCategories = Array.isArray(state.sceneCategories) && state.sceneCategories.length
      ? state.sceneCategories
      : sourceCategories;
    baseCategories.forEach((category) => {
      normalizeCategoryList(category).forEach((item) => categories.add(item));
    });
    state.scenes.forEach((scene) => {
      getSceneCategoryList(scene).forEach((category) => categories.add(category));
    });
    return Array.from(categories);
  }

  function getFilteredScenes({
    state,
    compact,
    allCategory = defaultAllCategory
  }) {
    const shared = window.PC_SHARED;
    const buildText = shared?.buildSearchText || ((parts) => (typeof compact === "function" ? compact(parts, " ") : parts.join(" ")).toLowerCase());
    const filterByQuery = shared?.filterByQuery || ((items, options) => items.filter((item) => {
      const query = String(options.query || "").trim().toLowerCase();
      return options.matches(item) && (!query || buildText(options.getText(item)).includes(query));
    }));

    return filterByQuery(state.scenes, {
      query: state.sceneQuery,
      matches: (template) => {
        const categories = getSceneCategoryList(template);
        return state.sceneCategory === allCategory || categories.includes(state.sceneCategory);
      },
      getText: (template) => {
        const categories = getSceneCategoryList(template);
        return [
          template.id,
          template.title,
          categories.join(" "),
          template.scene
        ];
      }
    });
  }

  function create(api) {
    const {
      state,
      el,
      sourceCategories,
      createId,
      escapeHtml,
      compact,
      saveScenes,
      saveSceneCategories,
      getTemplate,
      getTemplateView,
      pushDeletedItem,
      showToast,
      renderPrompt,
      renderPromptSelection
    } = api;
    const sceneHelpers = window.PC_SCENES;
    const normalizeScene = (scene = {}) => sceneHelpers.normalizeScene(scene, createId);

    let draggedSceneId = "";
    let suppressSceneClick = false;
    let editingSceneId = "";
    let editingSceneCategoryId = "";
    let sceneHeaderDraft = null;
    let sceneCategoryModal = null;

    function getSceneById(sceneId) {
      return state.scenes.find((scene) => scene.id === sceneId);
    }

    function isGlobalSceneCategoryManager() {
      return editingSceneCategoryId === globalSceneCategoryManagerId;
    }

    function getEditableSceneCategories(currentCategories = "") {
      const base = Array.isArray(state.sceneCategories) && state.sceneCategories.length
        ? state.sceneCategories
        : (Array.isArray(sourceCategories) && sourceCategories.length ? sourceCategories : fallbackSceneCategories);
      const options = [
        ...base,
        ...normalizeCategoryList(currentCategories)
      ];
      const uniqueOptions = normalizeCategoryList(options.length ? options : fallbackSceneCategories);
      return uniqueOptions.length ? uniqueOptions : [...fallbackSceneCategories];
    }

    function getDefaultEditableCategory() {
      return getEditableSceneCategories()[0] || defaultSceneCategory;
    }

    function ensureSceneCategoryOptions() {
      if (!Array.isArray(state.sceneCategories)) {
        state.sceneCategories = [];
      }
      const merged = getEditableSceneCategories();
      state.sceneCategories.splice(0, state.sceneCategories.length, ...merged);
      return state.sceneCategories;
    }

    function saveSceneCategoryOptions() {
      ensureSceneCategoryOptions();
      if (typeof saveSceneCategories === "function") {
        saveSceneCategories();
      }
    }

    function focusSceneHeaderField(field = "title") {
      window.requestAnimationFrame(() => {
        const input = el.sceneList.querySelector(`[data-scene-header-field='${field}']`);
        if (input) {
          window.PC_SHARED.focusWithoutScroll(input, { select: true });
        }
      });
    }

    function revealSceneCard(sceneId) {
      if (!sceneId || !el.sceneList) {
        return;
      }
      window.requestAnimationFrame(() => {
        const card = el.sceneList.querySelector(`[data-scene-id="${sceneId}"]`);
        window.PC_SHARED.revealInScrollContainer(el.sceneList, card, { behavior: "smooth", block: "center" });
      });
    }

    function focusSceneCategoryInput() {
      window.requestAnimationFrame(() => {
        const input = sceneCategoryModal && !sceneCategoryModal.hidden
          ? sceneCategoryModal.querySelector("[data-scene-category-input]")
          : el.sceneList.querySelector("[data-scene-category-input]");
        if (input) {
          input.focus();
        }
      });
    }

    function isSceneCategoryManagerOpen(sceneId = editingSceneCategoryId) {
      return Boolean(sceneCategoryModal && !sceneCategoryModal.hidden && editingSceneCategoryId && (!sceneId || editingSceneCategoryId === sceneId));
    }

    function closeSceneCategoryManager(options = {}) {
      if (sceneCategoryModal) {
        sceneCategoryModal.hidden = true;
      }
      document.body.classList.remove("category-open");
      editingSceneCategoryId = "";
      if (!options.skipRender) {
        renderScenes();
      }
      if (!options.silent) {
        showToast("분류 관리 창을 닫았어요");
      }
    }

    function ensureSceneCategoryModal() {
      if (sceneCategoryModal) {
        return sceneCategoryModal;
      }
      sceneCategoryModal = document.createElement("div");
      sceneCategoryModal.className = "category-modal scene-category-modal";
      sceneCategoryModal.hidden = true;
      sceneCategoryModal.innerHTML = `
        <div class="category-backdrop" data-scene-category-close></div>
        <section class="category-dialog" role="dialog" aria-modal="true" aria-labelledby="sceneCategoryManagerTitle">
          <header class="category-dialog-header">
            <div>
              <h2 id="sceneCategoryManagerTitle">상황 분류 관리</h2>
              <p>상황에 여러 분류를 붙이고, 분류 이름을 정리할 수 있어요.</p>
            </div>
            <button class="category-close" type="button" data-scene-category-close title="닫기" aria-label="상황 분류 관리 닫기">×</button>
          </header>
          <div class="category-dialog-body"></div>
        </section>
      `;
      document.body.appendChild(sceneCategoryModal);

      sceneCategoryModal.addEventListener("click", (event) => {
        if (event.target.closest("[data-scene-category-close]")) {
          closeSceneCategoryManager();
          return;
        }

        const addCategoryButton = event.target.closest("[data-scene-category-add]");
        if (addCategoryButton) {
          addSceneCategoryFromInput(addCategoryButton);
          return;
        }

        const renameCategoryButton = event.target.closest("[data-scene-category-rename]");
        if (renameCategoryButton) {
          renameSceneCategory(renameCategoryButton.dataset.sceneCategoryRename, renameCategoryButton);
          return;
        }

        const deleteCategoryButton = event.target.closest("[data-scene-category-delete]");
        if (deleteCategoryButton) {
          deleteSceneCategory(deleteCategoryButton.dataset.sceneCategoryDelete);
          return;
        }

        const categoryButton = event.target.closest("[data-scene-category-toggle]");
        if (categoryButton) {
          updateSceneCategory(categoryButton.dataset.sceneCategoryToggle);
        }
      });

      sceneCategoryModal.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && event.target.dataset.sceneCategoryInput !== undefined) {
          event.preventDefault();
          addSceneCategoryFromInput(event.target);
          return;
        }
        if (event.key === "Enter" && event.target.dataset.sceneCategoryRenameInput !== undefined) {
          event.preventDefault();
          renameSceneCategory(event.target.dataset.sceneCategoryRenameInput, event.target);
          return;
        }
        if (event.key === "Escape" && event.target.dataset.sceneCategoryRenameInput !== undefined) {
          event.preventDefault();
          event.target.value = event.target.dataset.sceneCategoryRenameInput;
          event.target.select();
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          closeSceneCategoryManager();
        }
      });

      return sceneCategoryModal;
    }

    function renderSceneCategoryManager() {
      if (!sceneCategoryModal || !editingSceneCategoryId) {
        return;
      }
      const isGlobal = isGlobalSceneCategoryManager();
      const scene = isGlobal ? null : getSceneById(editingSceneCategoryId);
      if (!isGlobal && !scene) {
        closeSceneCategoryManager({ silent: true });
        return;
      }
      const view = scene ? getTemplateView(scene.id) : null;
      const body = sceneCategoryModal.querySelector(".category-dialog-body");
      if (!body) {
        return;
      }
      const title = scene ? scene.title || "새 상황" : "상황 전체 분류";
      body.innerHTML = `
        <div class="category-manager-current">
          <span>${scene ? "현재 상황" : "관리 범위"}</span>
          <strong>${escapeHtml(title)}</strong>
          ${scene ? `<span class="category-badge-row">${renderSceneCategoryBadges(scene)}</span>` : ""}
        </div>
        <p class="category-manager-help">${scene ? "위쪽 분류 태그를 눌러 이 상황에 적용하거나 해제하고, 아래에서 분류명을 추가·변경·삭제할 수 있어요." : "아래에서 상황 분류명을 추가·변경·삭제할 수 있어요. 상황별 분류 지정은 상황을 선택한 뒤 관리하면 돼요."}</p>
        <div class="category-manager-picker" role="group" aria-label="상황 분류 선택과 관리">
          ${renderSceneCategoryPicker(view, true)}
        </div>
      `;
    }

    function openSceneCategoryManager(sceneId) {
      const scene = sceneId ? getSceneById(sceneId) : null;
      if (sceneId && !scene) {
        showToast("분류를 관리할 상황을 찾지 못했어요");
        return;
      }
      editingSceneCategoryId = scene ? scene.id : globalSceneCategoryManagerId;
      if (scene) {
        state.activeSceneId = scene.id;
        saveScenes({ track: false });
      }
      ensureSceneCategoryModal();
      sceneCategoryModal.hidden = false;
      document.body.classList.add("category-open");
      renderScenes();
      renderSceneCategoryManager();
      focusSceneCategoryInput();
      showToast("분류 관리 창을 열었어요 🐰");
    }

    function toggleSceneCategoryManager(sceneId) {
      const scene = sceneId ? getSceneById(sceneId) : null;
      if (sceneId && !scene) {
        showToast("분류를 관리할 상황을 찾지 못했어요");
        return;
      }
      const targetId = scene ? scene.id : globalSceneCategoryManagerId;
      if (isSceneCategoryManagerOpen(targetId)) {
        closeSceneCategoryManager();
        return;
      }
      openSceneCategoryManager(scene ? scene.id : "");
    }

    function clearSceneHeaderEdit() {
      editingSceneId = "";
      sceneHeaderDraft = null;
    }

    function beginSceneHeaderEdit(sceneId) {
      const scene = getSceneById(sceneId);
      if (!scene) {
        return;
      }
      editingSceneId = scene.id;
      editingSceneCategoryId = "";
      if (sceneCategoryModal) {
        sceneCategoryModal.hidden = true;
        document.body.classList.remove("category-open");
      }
      sceneHeaderDraft = {
        title: scene.title || "",
        scene: scene.scene || ""
      };
      state.activeSceneId = scene.id;
      saveScenes({ track: false });
      renderScenes();
      focusSceneHeaderField("title");
    }

    function updateSceneHeaderDraft(field, value) {
      if (!sceneHeaderDraft || !editingSceneId) {
        return;
      }
      sceneHeaderDraft[field] = value;
      const scene = getSceneById(editingSceneId);
      if (!scene) {
        return;
      }
      scene[field] = String(value || "");
      saveScenes({ track: false });
    }

    function commitSceneHeaderEdit(options = {}) {
      if (!editingSceneId) {
        return false;
      }
      const scene = getSceneById(editingSceneId);
      if (!scene) {
        clearSceneHeaderEdit();
        if (!options.skipRender) {
          renderScenes();
        }
        return false;
      }
      const draft = sceneHeaderDraft || {
        title: scene.title || "",
        scene: scene.scene || ""
      };
      scene.title = String(draft.title || "").trim() || "새 상황";
      scene.scene = String(draft.scene || "").trim();
      clearSceneHeaderEdit();
      saveScenes(options.track === false ? { track: false } : undefined);
      if (!options.skipRender) {
        renderSceneFilters();
        renderScenes();
      }
      if (!options.silent) {
        showToast("상황명과 장면을 저장했어요");
      }
      return true;
    }

    function cancelSceneHeaderEdit(options = {}) {
      if (!editingSceneId) {
        return;
      }
      clearSceneHeaderEdit();
      if (!options.skipRender) {
        renderScenes();
      }
      if (!options.silent) {
        showToast("상황명/장면 수정을 취소했어요");
      }
    }

    function renumberScenesByOrder() {
      const idMap = new Map();
      state.scenes.forEach((scene, index) => {
        const nextId = formatSceneId(index);
        if (scene.id !== nextId) {
          idMap.set(scene.id, nextId);
          scene.id = nextId;
        }
      });
      if (state.activeSceneId) {
        state.activeSceneId = idMap.get(state.activeSceneId) || state.activeSceneId;
      }
      if (editingSceneId) {
        editingSceneId = idMap.get(editingSceneId) || editingSceneId;
      }
      if (editingSceneCategoryId) {
        editingSceneCategoryId = idMap.get(editingSceneCategoryId) || editingSceneCategoryId;
      }
      return idMap;
    }

    function renderSceneFilters() {
      if (!el.sceneFilters) {
        return;
      }
      const categories = getSceneCategories();
      if (!categories.includes(state.sceneCategory)) {
        state.sceneCategory = defaultAllCategory;
      }
      window.PC_SHARED.renderAdvancedCategoryFilter({
        container: el.sceneFilters,
        toggle: el.sceneAdvancedSearchToggle,
        panel: el.sceneAdvancedSearchPanel,
        open: Boolean(state.sceneAdvancedSearchOpen),
        categories,
        selected: state.sceneCategory,
        onSelect: (category) => {
          state.sceneCategory = category;
          renderSceneFilters();
          renderScenes();
        }
      });
    }

    function getSceneCategories() {
      return sceneHelpers.getSceneCategories({
        state,
        sourceCategories
      });
    }

    function getFilteredScenes() {
      return sceneHelpers.getFilteredScenes({
        state,
        compact
      });
    }

    function clearSceneDropHints() {
      window.PC_SHARED.clearDropHints(el.sceneList);
    }

    function showSceneDropHint(card, position) {
      window.PC_SHARED.showDropHint(el.sceneList, card, position);
    }

    function moveSceneRelative(sourceId, targetId, position) {
      return window.PC_SHARED.moveRelativeById(state.scenes, sourceId, targetId, position);
    }

    function moveSceneToEnd(sourceId) {
      return window.PC_SHARED.moveToEndById(state.scenes, sourceId);
    }

    function finishSceneReorder(moved, sourceId, message = "상황 순서를 바꿨어요") {
      clearSceneDropHints();
      draggedSceneId = "";
      if (!moved) {
        return;
      }
      const idMap = renumberScenesByOrder();
      if (editingSceneId) {
        editingSceneId = idMap.get(editingSceneId) || editingSceneId;
      }
      saveScenes({ track: false });
      renderSceneFilters();
      renderScenes();
      showToast(message);
    }

    function renderSceneCategoryPicker(view, isManaging = false) {
      const hasScene = Boolean(view);
      const currentCategories = hasScene ? getSceneCategoryList(view) : [];
      const currentSet = new Set(currentCategories);
      const options = getEditableSceneCategories(currentCategories);
      const chips = options.map((category) => {
        const active = currentSet.has(category);
        return `
          <span class="managed-category">
            <button class="category-chip${active ? " active" : ""}" type="button" data-scene-category-toggle="${escapeHtml(category)}" aria-pressed="${active ? "true" : "false"}">${escapeHtml(category)}</button>
          </span>
        `;
      }).join("");
      const managerRows = options.map((category) => {
        const active = currentSet.has(category);
        return `
          <div class="category-manager-item${active ? " active" : ""}">
            <span class="category-manager-name">${escapeHtml(category)}</span>
            <input class="category-rename-input" type="text" data-scene-category-rename-input="${escapeHtml(category)}" value="${escapeHtml(category)}" aria-label="${escapeHtml(category)} 분류명 수정">
            <button class="text-button mini-action category-rename-button" type="button" data-scene-category-rename="${escapeHtml(category)}">변경</button>
            <button class="text-button mini-action category-delete-button" type="button" data-scene-category-delete="${escapeHtml(category)}">삭제</button>
          </div>
        `;
      }).join("");
      return `
        ${hasScene ? `<div class="managed-chip-row">${chips}</div>` : ""}
        ${isManaging ? `
          <div class="category-manager-panel" role="group" aria-label="상황 분류 관리">
            <div class="category-manager-title">
              <strong>상황 분류 관리</strong>
              <span>선택은 위 태그로, 이름 변경과 삭제는 여기서 해요.</span>
            </div>
            <div class="category-manager-list">${managerRows}</div>
            <div class="category-add-row">
              <input type="text" data-scene-category-input placeholder="새 분류 추가">
              <button class="text-button mini-action" type="button" data-scene-category-add>추가</button>
            </div>
          </div>
        ` : ""}
      `;
    }

    function renderSceneCategoryBadges(scene) {
      return window.PC_SHARED.renderCategoryBadges(getSceneCategoryList(scene), escapeHtml);
    }

    function renderSceneHeader(template, view) {
      const draft = sceneHeaderDraft || {
        title: view.title || "",
        scene: view.scene || ""
      };
      return window.PC_SHARED.renderEditableCardHeader({
        isEditing: template.id === editingSceneId,
        editorClass: "scene-header-editor",
        editorLabel: "상황명과 장면 편집",
        fields: [
          {
            label: "상황명",
            attribute: 'data-scene-header-field="title"',
            value: escapeHtml(draft.title),
            placeholder: "상황명"
          },
          {
            type: "textarea",
            label: "장면",
            attribute: 'data-scene-header-field="scene"',
            value: escapeHtml(draft.scene),
            placeholder: "장면 설명"
          }
        ],
        saveAttribute: "data-scene-edit-save",
        cancelAttribute: "data-scene-edit-cancel",
        editAttribute: "data-scene-header-edit",
        selectAttribute: "data-scene-select",
        id: escapeHtml(template.id),
        title: escapeHtml(template.title || "새 상황"),
        fallbackTitle: "새 상황",
        subId: escapeHtml(template.id),
        metaHtml: `<span class="category-badge-row">${renderSceneCategoryBadges(template)}</span><span>${escapeHtml(template.scene || "장면 설명 없음")}</span>`,
        actionsLabel: "상황 작업",
        editTitle: "상황명/장면 편집"
      });
    }

    function renderScenes() {
      const scenes = getFilteredScenes();
      const nextActiveSceneId = window.PC_SHARED.resolveVisibleSelection(scenes, state.activeSceneId, {
        allowEmpty: true,
        fallbackItems: state.scenes
      });
      if (state.activeSceneId !== nextActiveSceneId) {
        state.activeSceneId = nextActiveSceneId;
        if (editingSceneId && editingSceneId !== nextActiveSceneId) {
          clearSceneHeaderEdit();
        }
        if (editingSceneCategoryId && editingSceneCategoryId !== nextActiveSceneId && !isGlobalSceneCategoryManager()) {
          editingSceneCategoryId = "";
        }
      }
      const selectedSceneNumber = state.activeSceneId ? state.scenes.findIndex((item) => item.id === state.activeSceneId) + 1 : 0;
      el.sceneCount.textContent = `${Math.max(0, selectedSceneNumber)} / ${state.scenes.length}`;
      el.sceneList.innerHTML = "";
      el.deleteSceneButton.disabled = !state.activeSceneId || state.scenes.length <= 1;
      if (el.manageSceneCategoriesButton) {
        el.manageSceneCategoriesButton.disabled = false;
      }

      if (!scenes.length) {
        el.sceneList.innerHTML = `<div class="empty cute-empty"><strong>찾는 상황이 없어요 🐰</strong><span>검색어를 조금 바꾸거나 새 상황을 만들어볼까요?</span></div>`;
        return;
      }

      scenes.forEach((template) => {
        const view = getTemplateView(template.id);
        const card = document.createElement("article");
        card.className = `scene-card orderable-card${template.id === state.activeSceneId ? " active" : ""}${template.id === editingSceneId ? " editing-header" : ""}`;
        card.draggable = state.scenes.length > 1 && template.id !== editingSceneId;
        card.dataset.sceneId = template.id;
        card.innerHTML = renderSceneHeader(template, view);

        if (template.id === state.activeSceneId) {
          const detail = document.createElement("div");
          detail.className = "scene-detail";
          detail.innerHTML = `
            <div class="scene-category-editor">
              <div class="category-editor-header">
                <div class="detail-label">분류</div>
              </div>
              <div class="category-picker" role="group" aria-label="상황 분류 선택">
                ${renderSceneCategoryPicker(view, false)}
              </div>
            </div>
          `;
          card.appendChild(detail);
        }

        window.PC_SHARED.bindOrderableCard(card, {
          targetId: template.id,
          getDraggedId: () => draggedSceneId,
          setDraggedId: (value) => { draggedSceneId = value; },
          setSuppressClick: (value) => { suppressSceneClick = value; },
          invalidDragSelector: "input, textarea, select, .card-header-editor, [data-scene-header-edit], [data-scene-edit-save], [data-scene-edit-cancel], [data-scene-category-toggle], [data-scene-category-delete], [data-scene-category-add], [data-scene-category-rename]",
          showDropHint: showSceneDropHint,
          clearDropHints: clearSceneDropHints,
          moveRelative: moveSceneRelative,
          finishReorder: finishSceneReorder
        });

        el.sceneList.appendChild(card);
      });
    }

    function updateTemplateEdit(field, value) {
      const template = getTemplate();
      if (!template) {
        return;
      }
      template[field] = value.trim();
      saveScenes();
    }

    function updateSceneCategory(category) {
      if (isGlobalSceneCategoryManager()) {
        return;
      }
      const template = getSceneById(editingSceneCategoryId) || getTemplate();
      if (!template) {
        return;
      }
      const target = String(category || "").trim();
      if (!target) {
        return;
      }
      const current = getSceneCategoryList(template);
      let next = [];
      if (current.includes(target)) {
        if (current.length <= 1) {
          showToast("분류는 최소 1개가 필요해요");
          return;
        }
        next = current.filter((item) => item !== target);
      } else {
        next = [...current, target];
      }
      syncSceneCategories(template, next);
      saveScenes();
      if (state.sceneCategory !== defaultAllCategory && !getSceneCategoryList(template).includes(state.sceneCategory)) {
        state.sceneCategory = defaultAllCategory;
      }
      renderSceneFilters();
      renderScenes();
      renderSceneCategoryManager();
      showToast("상황 분류를 변경했어요");
    }

    function addSceneCategoryFromInput(inputOrButton) {
      if (!sceneCategoryModal || sceneCategoryModal.hidden) {
        showToast("분류 관리를 연 뒤 새 분류를 추가해주세요");
        return;
      }
      const container = inputOrButton.closest(".category-dialog") || inputOrButton.closest(".scene-detail") || inputOrButton.closest(".scene-card") || el.sceneList;
      const input = inputOrButton.matches && inputOrButton.matches("[data-scene-category-input]")
        ? inputOrButton
        : container.querySelector("[data-scene-category-input]");
      const category = String(input?.value || "").trim();
      if (!category) {
        showToast("추가할 분류명을 입력해주세요");
        input?.focus();
        return;
      }
      if (category === defaultAllCategory) {
        showToast("전체는 검색용 분류라 추가할 수 없어요");
        input.value = "";
        input.focus();
        return;
      }
      ensureSceneCategoryOptions();
      if (!state.sceneCategories.includes(category)) {
        state.sceneCategories.push(category);
      }
      const template = isGlobalSceneCategoryManager() ? null : (getSceneById(editingSceneCategoryId) || getTemplate());
      if (template) {
        const current = getSceneCategoryList(template);
        if (!current.includes(category)) {
          syncSceneCategories(template, [...current, category]);
        }
      }
      if (input) {
        input.value = "";
      }
      saveSceneCategoryOptions();
      saveScenes();
      renderSceneFilters();
      renderScenes();
      renderSceneCategoryManager();
      showToast("분류를 추가했어요");
    }

    function renameSceneCategory(category, inputOrButton) {
      if (!sceneCategoryModal || sceneCategoryModal.hidden) {
        showToast("분류 관리를 연 뒤 이름을 변경해주세요");
        return;
      }
      const from = String(category || "").trim();
      const container = inputOrButton?.closest?.(".category-edit-item, .category-manager-item") || inputOrButton?.closest?.(".scene-detail") || el.sceneList;
      const input = container?.querySelector?.("[data-scene-category-rename-input]");
      const to = String(input?.value || "").trim();
      if (!from) {
        return;
      }
      if (!to) {
        showToast("변경할 분류명을 입력해주세요");
        input?.focus();
        return;
      }
      if (to === defaultAllCategory) {
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

      const currentOptions = getEditableSceneCategories([from]);
      const nextOptions = [];
      currentOptions.forEach((item) => {
        const nextItem = item === from ? to : item;
        if (nextItem && nextItem !== defaultAllCategory && !nextOptions.includes(nextItem)) {
          nextOptions.push(nextItem);
        }
      });
      if (!nextOptions.includes(to)) {
        nextOptions.push(to);
      }
      state.sceneCategories.splice(0, state.sceneCategories.length, ...nextOptions);

      let changedCount = 0;
      state.scenes.forEach((scene) => {
        const before = getSceneCategoryList(scene);
        if (!before.includes(from)) {
          return;
        }
        const after = normalizeCategoryList(before.map((item) => item === from ? to : item));
        syncSceneCategories(scene, after.length ? after : [to]);
        changedCount += 1;
      });

      if (state.sceneCategory === from) {
        state.sceneCategory = to;
      }
      saveSceneCategoryOptions();
      saveScenes();
      renderSceneFilters();
      renderScenes();
      renderSceneCategoryManager();
      showToast(changedCount ? `분류 '${from}'을 '${to}'로 변경했어요` : `분류명을 '${to}'로 변경했어요`);
    }

    function deleteSceneCategory(category) {
      if (!sceneCategoryModal || sceneCategoryModal.hidden) {
        showToast("분류 관리를 연 뒤 삭제해주세요");
        return;
      }
      const target = String(category || "").trim();
      if (!target) {
        return;
      }
      ensureSceneCategoryOptions();
      const beforeOptions = state.sceneCategories.slice();
      const optionIndex = Math.max(0, beforeOptions.indexOf(target));
      const existsInOptions = state.sceneCategories.includes(target);
      if (existsInOptions && state.sceneCategories.length <= 1) {
        showToast("분류는 최소 1개가 필요해요");
        return;
      }
      state.sceneCategories.splice(0, state.sceneCategories.length, ...state.sceneCategories.filter((item) => item !== target));
      const fallbackCategory = getDefaultEditableCategory();
      const affectedScenes = [];
      state.scenes.forEach((scene) => {
        const before = getSceneCategoryList(scene);
        const withoutTarget = before.filter((item) => item !== target);
        const after = withoutTarget.length ? withoutTarget : [fallbackCategory];
        if (before.includes(target)) {
          affectedScenes.push({
            id: scene.id,
            title: scene.title || "",
            before,
            after
          });
        }
        syncSceneCategories(scene, after);
      });
      if (typeof pushDeletedItem === "function") {
        pushDeletedItem({
          type: "sceneCategory",
          item: {
            name: target,
            options: beforeOptions,
            affectedScenes,
            activeFilter: state.sceneCategory
          },
          index: optionIndex
        });
      }
      if (state.sceneCategory === target) {
        state.sceneCategory = defaultAllCategory;
      }
      saveSceneCategoryOptions();
      saveScenes({ track: false });
      renderSceneFilters();
      renderScenes();
      renderSceneCategoryManager();
      showToast("분류를 삭제했어요", { undoDelete: true });
    }

    function addScene() {
      const defaultCategory = getDefaultEditableCategory();
      const scene = normalizeScene({
        id: getNextSceneId(state),
        title: "새 상황",
        category: defaultCategory,
        categories: [defaultCategory],
        scene: ""
      });
      state.scenes.push(scene);
      state.activeSceneId = scene.id;
      state.sceneCategory = defaultAllCategory;
      renumberScenesByOrder();
      const activeScene = getSceneById(state.activeSceneId);
      editingSceneCategoryId = "";
      if (sceneCategoryModal) {
        sceneCategoryModal.hidden = true;
        document.body.classList.remove("category-open");
      }
      if (activeScene) {
        editingSceneId = activeScene.id;
        sceneHeaderDraft = {
          title: activeScene.title || "",
          scene: activeScene.scene || ""
        };
      }
      saveScenes({ track: false });
      renderSceneFilters();
      renderScenes();
      revealSceneCard(scene.id);
      focusSceneHeaderField("title");
    }

    function deleteScene() {
      if (state.scenes.length <= 1) {
        showToast("최소 1개는 필요해요");
        return;
      }
      if (!state.activeSceneId) {
        showToast("삭제할 상황을 선택해주세요");
        return;
      }
      const deletedSceneId = state.activeSceneId;
      const visibleScenesBeforeDelete = getFilteredScenes();
      const deletedVisibleIndex = visibleScenesBeforeDelete.findIndex((scene) => scene.id === deletedSceneId);
      const deletedScene = state.scenes.find((scene) => scene.id === deletedSceneId);
      const deletedIndex = state.scenes.findIndex((scene) => scene.id === deletedSceneId);
      const nextVisibleScene = deletedVisibleIndex >= 0
        ? visibleScenesBeforeDelete[deletedVisibleIndex + 1] || visibleScenesBeforeDelete[deletedVisibleIndex - 1]
        : null;
      const nextFallbackScene = state.scenes[deletedIndex + 1] || state.scenes[deletedIndex - 1] || null;
      state.scenes = state.scenes.filter((scene) => scene.id !== deletedSceneId);
      const nextSceneId = nextVisibleScene?.id || nextFallbackScene?.id || state.scenes[0]?.id || "";
      state.activeSceneId = nextSceneId;
      editingSceneCategoryId = "";
      if (sceneCategoryModal) {
        sceneCategoryModal.hidden = true;
        document.body.classList.remove("category-open");
      }
      clearSceneHeaderEdit();
      if (deletedScene) {
        pushDeletedItem({
          type: "scene",
          item: deletedScene,
          index: deletedIndex
        });
      }
      renumberScenesByOrder();
      saveScenes({ track: false });
      renderSceneFilters();
      renderScenes();
      showToast("상황을 삭제했어요", { undoDelete: true });
    }

    function bindEvents() {
      el.sceneSearchInput.addEventListener("input", (event) => {
        state.sceneQuery = event.target.value;
        renderScenes();
      });

      el.sceneAdvancedSearchToggle?.addEventListener("click", () => {
        state.sceneAdvancedSearchOpen = !state.sceneAdvancedSearchOpen;
        renderSceneFilters();
      });

      el.sceneList.addEventListener("click", (event) => {
        const saveEditButton = event.target.closest("[data-scene-edit-save]");
        if (saveEditButton) {
          commitSceneHeaderEdit();
          return;
        }

        const cancelEditButton = event.target.closest("[data-scene-edit-cancel]");
        if (cancelEditButton) {
          cancelSceneHeaderEdit();
          return;
        }

        const addCategoryButton = event.target.closest("[data-scene-category-add]");
        if (addCategoryButton) {
          addSceneCategoryFromInput(addCategoryButton);
          return;
        }

        const renameCategoryButton = event.target.closest("[data-scene-category-rename]");
        if (renameCategoryButton) {
          renameSceneCategory(renameCategoryButton.dataset.sceneCategoryRename, renameCategoryButton);
          return;
        }

        const deleteCategoryButton = event.target.closest("[data-scene-category-delete]");
        if (deleteCategoryButton) {
          deleteSceneCategory(deleteCategoryButton.dataset.sceneCategoryDelete);
          return;
        }

        const categoryButton = event.target.closest("[data-scene-category-toggle]");
        if (categoryButton) {
          updateSceneCategory(categoryButton.dataset.sceneCategoryToggle);
          return;
        }

        const editButton = event.target.closest("[data-scene-header-edit]");
        if (editButton) {
          if (editingSceneId && editingSceneId !== editButton.dataset.sceneHeaderEdit) {
            commitSceneHeaderEdit({ silent: true, skipRender: true });
          }
          beginSceneHeaderEdit(editButton.dataset.sceneHeaderEdit);
          return;
        }

        const sceneCard = event.target.closest(".scene-card");
        if (!sceneCard) {
          return;
        }
        const interactiveSceneControl = event.target.closest("input, textarea, select, button, .card-header-editor, .card-order-actions");
        if (interactiveSceneControl) {
          return;
        }
        if (suppressSceneClick) {
          suppressSceneClick = false;
          return;
        }
        const nextSceneId = sceneCard.dataset.sceneId;
        if (!nextSceneId) {
          return;
        }
        if (editingSceneId && editingSceneId !== nextSceneId) {
          commitSceneHeaderEdit({ silent: true, skipRender: true });
        }
        const isClosing = state.activeSceneId === nextSceneId;
        state.activeSceneId = isClosing ? "" : nextSceneId;
        if (sceneCategoryModal && !sceneCategoryModal.hidden) {
          sceneCategoryModal.hidden = true;
          document.body.classList.remove("category-open");
        }
        editingSceneCategoryId = "";
        saveScenes();
        renderScenes();
        renderPromptSelection?.();
        renderPrompt?.();
      });

      el.sceneList.addEventListener("input", (event) => {
        const headerField = event.target.dataset.sceneHeaderField;
        if (headerField) {
          updateSceneHeaderDraft(headerField, event.target.value);
          return;
        }

        const field = event.target.dataset.sceneField;
        if (field) {
          updateTemplateEdit(field, event.target.value);
        }
      });

      el.sceneList.addEventListener("change", (event) => {
        if (event.target.dataset.sceneField) {
          renderSceneFilters();
          renderScenes();
        }
      });

      el.sceneList.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && event.target.closest(".scene-header-editor")) {
          event.preventDefault();
          cancelSceneHeaderEdit();
          return;
        }
        if (event.key === "Enter" && event.target.dataset.sceneHeaderField === "title") {
          event.preventDefault();
          commitSceneHeaderEdit();
          return;
        }
        if (event.key === "Enter" && event.target.dataset.sceneCategoryInput !== undefined) {
          event.preventDefault();
          addSceneCategoryFromInput(event.target);
          return;
        }
        if (event.key === "Enter" && event.target.dataset.sceneCategoryRenameInput !== undefined) {
          event.preventDefault();
          renameSceneCategory(event.target.dataset.sceneCategoryRenameInput, event.target);
          return;
        }
        if (event.key === "Escape" && event.target.dataset.sceneCategoryRenameInput !== undefined) {
          event.preventDefault();
          event.target.value = event.target.dataset.sceneCategoryRenameInput;
          event.target.select();
        }
      });

      el.sceneList.addEventListener("dragover", (event) => {
        if (!draggedSceneId || event.target.closest(".scene-card")) {
          return;
        }
        clearSceneDropHints();
      });

      el.sceneList.addEventListener("drop", (event) => {
        if (!draggedSceneId || event.target.closest(".scene-card")) {
          return;
        }
        event.preventDefault();
        clearSceneDropHints();
      });

      el.addSceneButton.addEventListener("click", addScene);
      if (el.manageSceneCategoriesButton) {
        el.manageSceneCategoriesButton.addEventListener("click", () => {
          toggleSceneCategoryManager(state.activeSceneId || "");
        });
      }
      el.deleteSceneButton.addEventListener("click", deleteScene);
    }

    return {
      renderSceneFilters,
      renderScenes,
      getSceneCategories,
      getFilteredScenes,
      addScene,
      deleteScene,
      updateTemplateEdit,
      renumberScenesByOrder,
      bindEvents
    };
  }

  window.PC_SCENES = {
    normalizeScene,
    getNextSceneId,
    normalizeGeneratedSceneIds,
    loadScenes,
    getTemplate,
    getTemplateView,
    getSceneCategories,
    getFilteredScenes,
    getSceneCategoryList,
    normalizeCategoryList,
    create
  };
})();
