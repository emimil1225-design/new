(() => {
  "use strict";

  const context = window.PC_APP_CONTEXT;
  if (!context || !context.state || !context.el) {
    return;
  }

  const THEME_KEY = "promptComposerUxTheme";
  const PROMPT_PRESETS_KEY = "promptComposerPromptPresetsV1";
  const PROMPT_RECENTS_KEY = "promptComposerRecentPromptsV1";
  const PROMPT_VARIANT_KEY = "promptComposerPromptVariant";
  const STORAGE_KEYS = {
    selectedScene: "promptComposerSelectedScene",
    selectedKeyword: "sceneTemplateSelectedKeyword",
    selectedWorld: "sceneTemplateSelectedWorld",
    selectedCharacter: "sceneTemplateSelectedCharacter"
  };

  const state = context.state;
  const el = context.el;
  const root = document.documentElement;
  const toolbar = document.querySelector(".toolbar");

  let quickModal = null;
  let quickInput = null;
  let quickResults = null;
  let quickItems = [];
  let activeQuickIndex = 0;
  let statusBar = null;
  let promptStats = null;
  let promptMemory = null;
  let promptPresetList = null;
  let promptRecentList = null;
  let themeButton = null;
  let updateScheduled = false;
  let zoomToastTimer = 0;

  const TYPE_LABELS = {
    character: "캐릭터",
    scene: "상황",
    keyword: "키워드",
    world: "세계관"
  };

  function compact(parts, separator = " · ") {
    return parts
      .map((part) => (part == null ? "" : String(part).trim()))
      .filter(Boolean)
      .join(separator);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeText(value) {
    return String(value ?? "").trim().toLowerCase();
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") {
      return window.CSS.escape(String(value));
    }
    return String(value).replace(/"/g, "\\\"");
  }

  function showToast(message) {
    if (typeof context.showToast === "function") {
      context.showToast(message);
      return;
    }
    if (!el.toast) {
      return;
    }
    el.toast.textContent = message;
    el.toast.classList.add("show");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => el.toast.classList.remove("show"), 1500);
  }

  async function copyText(text, label = "텍스트") {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      showToast(`${label}를 복사했어요 ✨`);
    } catch (error) {
      showToast("복사에 실패했어요");
    }
  }

  function createButton(id, label, title, className = "text-button") {
    if (!toolbar) {
      return null;
    }
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }
    const button = document.createElement("button");
    button.id = id;
    button.className = className;
    button.type = "button";
    button.title = title;
    button.textContent = label;
    toolbar.insertBefore(button, toolbar.firstElementChild || null);
    return button;
  }

  function getWorldById(id) {
    return state.worlds.find((world) => world.id === id) || state.worlds[0] || {};
  }

  function getCharacterById(id) {
    return state.characters.find((character) => character.id === id) || state.characters[0] || {};
  }

  function getSceneById(id) {
    return state.scenes.find((scene) => scene.id === id) || {};
  }

  function getKeywordById(id) {
    return state.keywords.find((keyword) => keyword.id === id) || {};
  }

  function getRecentModifiedTime(type, id) {
    const entry = (state.modifiedItems || []).find((item) => item && item.type === type && item.itemId === id);
    return entry ? Date.parse(entry.modifiedAt || "") || 0 : 0;
  }

  function renderAll() {
    if (typeof context.renderAll === "function") {
      context.renderAll();
    }
    scheduleUxUpdate();
  }

  function renderPrompt() {
    if (typeof context.renderPrompt === "function") {
      context.renderPrompt();
    }
    scheduleUxUpdate();
  }

  function applyTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    root.dataset.theme = nextTheme;
    localStorage.setItem(THEME_KEY, nextTheme);
    if (themeButton) {
      themeButton.textContent = nextTheme === "dark" ? "라이트" : "다크";
      themeButton.title = nextTheme === "dark" ? "라이트 테마로 전환" : "다크 테마로 전환";
      themeButton.setAttribute("aria-pressed", nextTheme === "dark" ? "true" : "false");
    }
  }

  function toggleTheme() {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
    showToast(root.dataset.theme === "dark" ? "다크 테마를 적용했어요" : "라이트 테마를 적용했어요");
  }

  function makeStatusPill(label, value, className = "") {
    return `<span class="ux-status-pill ${className}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "-")}</strong></span>`;
  }

  function updateStatusBar() {
    if (!statusBar) {
      return;
    }
    const character = getCharacterById(state.selectedCharacterId);
    const world = getWorldById(character.worldId || state.selectedWorldId);
    const promptLength = el.promptOutput ? el.promptOutput.value.length : 0;
    statusBar.innerHTML = [
      makeStatusPill("캐릭터", character.name || "이름 없음", "character"),
      makeStatusPill("세계관", world.name || "세계관 없음", "world"),
      makeStatusPill("프롬프트", `${promptLength.toLocaleString("ko-KR")}자`, "prompt")
    ].join("");
  }

  function countRoughTokens(text) {
    const latinWords = (text.match(/[A-Za-z0-9_]+/g) || []).length;
    const hangulChunks = (text.match(/[가-힣]+/g) || []).reduce((sum, chunk) => sum + Math.ceil(chunk.length / 2), 0);
    const punctuation = (text.match(/[^\sA-Za-z0-9_가-힣]/g) || []).length;
    return Math.max(0, latinWords + hangulChunks + Math.ceil(punctuation / 2));
  }

  function updatePromptStats() {
    if (!promptStats || !el.promptOutput) {
      return;
    }
    const text = el.promptOutput.value || "";
    const chars = text.length;
    const noSpaceChars = text.replace(/\s/g, "").length;
    const lines = text ? text.split(/\r?\n/).length : 0;
    const tokens = countRoughTokens(text);
    promptStats.innerHTML = `
      <span><strong>${chars.toLocaleString("ko-KR")}</strong>자</span>
      <span><strong>${noSpaceChars.toLocaleString("ko-KR")}</strong>자 · 공백 제외</span>
      <span><strong>${lines.toLocaleString("ko-KR")}</strong>줄</span>
      <span><strong>${tokens.toLocaleString("ko-KR")}</strong>토큰 추정</span>
    `;
  }

  function scheduleUxUpdate() {
    if (updateScheduled) {
      return;
    }
    updateScheduled = true;
    window.requestAnimationFrame(() => {
      updateScheduled = false;
      updateStatusBar();
      updatePromptStats();
      autoGrowAllTextareas();
    });
  }

  function cleanPromptText(text) {
    return String(text || "")
      .split(/\r?\n/)
      .map((line) => line.replace(/[ \t]+$/g, ""))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function mountTopUtility() {
    const topbar = document.querySelector(".topbar");
    if (topbar && !document.getElementById("uxStatusBar")) {
      statusBar = document.createElement("div");
      statusBar.id = "uxStatusBar";
      statusBar.className = "ux-statusbar";
      const brand = topbar.querySelector(".brand");
      topbar.insertBefore(statusBar, brand ? brand.nextSibling : topbar.firstChild);
    } else {
      statusBar = document.getElementById("uxStatusBar");
    }

    const quickButton = createButton("quickOpenButton", "빠른 이동", "Ctrl/Cmd+K: 전체 라이브러리 빠른 검색");
    if (quickButton) {
      quickButton.classList.add("ux-command-button");
      quickButton.addEventListener("click", () => openQuickCommand());
    }

    themeButton = createButton("themeToggleButton", "다크", "다크 테마로 전환");
    if (themeButton) {
      themeButton.classList.add("ux-theme-button");
      themeButton.addEventListener("click", toggleTheme);
    }
  }

  function mountPromptTools() {
    if (!el.promptOutput) {
      return;
    }

    const promptPanel = el.promptOutput.closest(".panel");
    const controls = promptPanel ? promptPanel.querySelector(".prompt-controls") : null;
    if (controls && !document.getElementById("promptNormalizeButton")) {
      const normalizeButton = document.createElement("button");
      normalizeButton.id = "promptNormalizeButton";
      normalizeButton.className = "text-button";
      normalizeButton.type = "button";
      normalizeButton.title = "줄 끝 공백과 과한 빈 줄 정리";
      normalizeButton.textContent = "정리";
      normalizeButton.addEventListener("click", () => {
        const cleaned = cleanPromptText(el.promptOutput.value);
        if (cleaned === el.promptOutput.value) {
          showToast("정리할 공백이 없어요 🐰");
          return;
        }
        el.promptOutput.value = cleaned;
        el.promptOutput.dispatchEvent(new Event("input", { bubbles: true }));
        updatePromptStats();
        showToast("프롬프트 공백을 정리했어요 ✨");
      });
      controls.appendChild(normalizeButton);
    }


    if (!document.getElementById("promptStats")) {
      const assist = document.createElement("div");
      assist.className = "prompt-assist";
      assist.innerHTML = `
        <div id="promptStats" class="prompt-stats" aria-live="polite"></div>
        <div class="prompt-shortcuts">
          <span>Ctrl/Cmd+Enter 복사</span>
          <span>Ctrl/Cmd+S 백업 저장</span>
        </div>
      `;
      el.promptOutput.insertAdjacentElement("afterend", assist);
      promptStats = assist.querySelector("#promptStats");
    } else {
      promptStats = document.getElementById("promptStats");
    }
  }

  function getQuickItems() {
    const scenes = state.scenes.map((scene) => {
      const categories = Array.isArray(scene.categories) && scene.categories.length
        ? scene.categories.join(", ")
        : scene.category || "";
      return {
        type: "scene",
        id: scene.id,
        recentModifiedAt: getRecentModifiedTime("scene", scene.id),
        label: scene.title || "이름 없는 상황",
        meta: compact(["상황", categories, scene.id]),
        body: scene.scene || "",
        text: compact([scene.title, categories, scene.id, scene.scene], " ")
      };
    });

    const keywords = state.keywords.map((keyword, index) => ({
      type: "keyword",
      id: keyword.id,
      recentModifiedAt: getRecentModifiedTime("keyword", keyword.id),
      label: keyword.title || "이름 없는 키워드",
      meta: compact(["키워드", `KW-${String(index + 1).padStart(3, "0")}`, keyword.triggers]),
      body: keyword.content || "",
      text: compact([keyword.title, keyword.triggers, keyword.content], " ")
    }));

    const worlds = state.worlds.map((world) => ({
      type: "world",
      id: world.id,
      recentModifiedAt: getRecentModifiedTime("world", world.id),
      label: world.name || "이름 없는 세계관",
      meta: compact(["세계관", world.genre]),
      body: compact([world.summary, world.rules], " "),
      text: compact([world.name, world.genre, world.summary, world.rules], " ")
    }));

    const characters = state.characters.map((character) => {
      const world = getWorldById(character.worldId);
      const tags = Array.isArray(character.tags) ? character.tags.join(" ") : "";
      const attributes = Array.isArray(character.attributes)
        ? character.attributes.map((item) => compact([item.label, item.value], " ")).join(" ")
        : "";
      return {
        type: "character",
        id: character.id,
        recentModifiedAt: getRecentModifiedTime("character", character.id),
        label: character.name || "이름 없는 캐릭터",
        meta: compact(["캐릭터", character.age, character.job, world.name]),
        body: compact([tags, character.appearance, character.personality, character.speech], " "),
        text: compact([
          character.name,
          character.age,
          character.job,
          world.name,
          tags,
          character.appearance,
          character.personality,
          character.speech,
          character.opening,
          attributes
        ], " ")
      };
    });

    return [
      ...characters,
      ...scenes,
      ...worlds,
      ...keywords
    ];
  }

  function scoreQuickItem(item, queryTokens, rawQuery) {
    if (!rawQuery) {
      const activeBonus = (
        (item.type === "character" && item.id === state.selectedCharacterId) ||
        (item.type === "scene" && item.id === state.activeSceneId) ||
        (item.type === "keyword" && item.id === state.activeKeywordId) ||
        (item.type === "world" && item.id === state.selectedWorldId)
      ) ? 40 : 0;
      const typeOrder = { character: 30, scene: 20, world: 10, keyword: 0 };
      return activeBonus + (typeOrder[item.type] || 0);
    }

    const label = normalizeText(item.label);
    const meta = normalizeText(item.meta);
    const body = normalizeText(item.body);
    const text = normalizeText(item.text);
    if (!queryTokens.every((token) => text.includes(token))) {
      return -1;
    }

    let score = 0;
    for (const token of queryTokens) {
      if (label === token) score += 100;
      if (label.startsWith(token)) score += 70;
      if (label.includes(token)) score += 45;
      if (meta.includes(token)) score += 25;
      if (body.includes(token)) score += 10;
    }
    return score;
  }

  function getFilteredQuickItems() {
    const rawQuery = normalizeText(quickInput ? quickInput.value : "");
    const queryTokens = rawQuery.split(/\s+/).filter(Boolean);
    return getQuickItems()
      .map((item) => ({ ...item, score: scoreQuickItem(item, queryTokens, rawQuery) }))
      .filter((item) => item.score >= 0)
      .sort((a, b) => {
        if (!rawQuery && b.recentModifiedAt !== a.recentModifiedAt) {
          return b.recentModifiedAt - a.recentModifiedAt;
        }
        return b.score - a.score || b.recentModifiedAt - a.recentModifiedAt || a.label.localeCompare(b.label, "ko");
      })
      .slice(0, 60);
  }

  function renderQuickResults() {
    if (!quickResults) {
      return;
    }
    quickItems = getFilteredQuickItems();
    if (activeQuickIndex >= quickItems.length) {
      activeQuickIndex = Math.max(0, quickItems.length - 1);
    }

    if (!quickItems.length) {
      quickResults.innerHTML = `<div class="quick-empty cute-empty"><strong>검색 결과가 없어요 🐰</strong><span>다른 이름, 직업, 장면, 트리거를 입력해보세요.</span></div>`;
      return;
    }

    quickResults.innerHTML = quickItems.map((item, index) => `
      <button class="quick-result${index === activeQuickIndex ? " active" : ""}" type="button" data-quick-index="${index}">
        <span class="quick-badge ${item.type}">${TYPE_LABELS[item.type] || item.type}</span>
        <span class="quick-result-main">
          <strong>${escapeHtml(item.label)}</strong>
          <small>${escapeHtml(item.meta || item.body || "")}</small>
        </span>
      </button>
    `).join("");

    const active = quickResults.querySelector(".quick-result.active");
    if (active) {
      active.scrollIntoView({ block: "nearest" });
    }
  }

  function scrollToSelection(item) {
    window.requestAnimationFrame(() => {
      let target = null;
      if (item.type === "character") {
        target = document.querySelector(`[data-character-id="${cssEscape(item.id)}"]`);
      } else if (item.type === "scene") {
        target = document.querySelector(`.scene-card[data-scene-id="${cssEscape(item.id)}"]`);
      } else if (item.type === "keyword") {
        target = document.querySelector(`.keyword-card[data-keyword-id="${cssEscape(item.id)}"]`);
      } else if (item.type === "world") {
        target = el.worldSelect;
      }
      if (target && typeof target.scrollIntoView === "function") {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (target && typeof target.focus === "function") {
        target.focus({ preventScroll: true });
      }
    });
  }

  function applyQuickItem(item) {
    if (!item) {
      return;
    }
    if (item.type === "character") {
      const character = getCharacterById(item.id);
      state.selectedCharacterId = item.id;
      state.selectedWorldId = character.worldId || state.selectedWorldId;
      state.characterQuery = "";
      state.tagFilter = "전체";
      localStorage.setItem(STORAGE_KEYS.selectedCharacter, state.selectedCharacterId);
      localStorage.setItem(STORAGE_KEYS.selectedWorld, state.selectedWorldId);
    } else if (item.type === "scene") {
      state.activeSceneId = item.id;
      state.sceneQuery = "";
      state.sceneCategory = "전체";
      localStorage.setItem(STORAGE_KEYS.selectedScene, state.activeSceneId);
    } else if (item.type === "keyword") {
      state.activeKeywordId = item.id;
      state.keywordQuery = "";
      localStorage.setItem(STORAGE_KEYS.selectedKeyword, state.activeKeywordId);
    } else if (item.type === "world") {
      state.selectedWorldId = item.id;
      localStorage.setItem(STORAGE_KEYS.selectedWorld, state.selectedWorldId);
    }
    renderAll();
    closeQuickCommand();
    scrollToSelection(item);
    showToast(`${TYPE_LABELS[item.type] || "항목"} 이동: ${item.label}`);
  }

  function openQuickCommand(initialQuery = "") {
    if (!quickModal) {
      return;
    }
    quickModal.hidden = false;
    document.body.classList.add("quick-open");
    activeQuickIndex = 0;
    quickInput.value = initialQuery;
    renderQuickResults();
    window.setTimeout(() => {
      quickInput.focus();
      quickInput.select();
    }, 0);
  }

  function closeQuickCommand() {
    if (!quickModal) {
      return;
    }
    quickModal.hidden = true;
    document.body.classList.remove("quick-open");
  }

  function mountQuickCommand() {
    if (document.getElementById("quickCommandModal")) {
      quickModal = document.getElementById("quickCommandModal");
      quickInput = document.getElementById("quickCommandInput");
      quickResults = document.getElementById("quickCommandResults");
      return;
    }

    quickModal = document.createElement("div");
    quickModal.id = "quickCommandModal";
    quickModal.className = "quick-command-modal";
    quickModal.hidden = true;
    quickModal.innerHTML = `
      <div class="quick-command-backdrop" data-quick-close></div>
      <section class="quick-command-dialog" role="dialog" aria-modal="true" aria-labelledby="quickCommandTitle">
        <header class="quick-command-header">
          <div>
            <h2 id="quickCommandTitle">빠른 이동</h2>
            <p>캐릭터, 세계관, 상황, 키워드북을 한 번에 검색하고 바로 이동합니다.</p>
          </div>
          <button class="icon-button" type="button" data-quick-close title="닫기" aria-label="빠른 이동 닫기">×</button>
        </header>
        <div class="quick-search-box">
          <span>⌕</span>
          <input id="quickCommandInput" type="search" autocomplete="off" placeholder="이름, 직업, 장면, 키워드, 세계관 검색">
        </div>
        <div class="quick-help-row">
          <span>↑↓ 선택</span>
          <span>Enter 이동</span>
          <span>Esc 닫기</span>
          <span>Ctrl/Cmd+K 열기</span>
        </div>
        <div id="quickCommandResults" class="quick-command-results"></div>
      </section>
    `;
    document.body.appendChild(quickModal);

    quickInput = document.getElementById("quickCommandInput");
    quickResults = document.getElementById("quickCommandResults");

    quickModal.addEventListener("click", (event) => {
      if (event.target.closest("[data-quick-close]")) {
        closeQuickCommand();
        return;
      }
      const result = event.target.closest("[data-quick-index]");
      if (result) {
        applyQuickItem(quickItems[Number(result.dataset.quickIndex)]);
      }
    });

    quickInput.addEventListener("input", () => {
      activeQuickIndex = 0;
      renderQuickResults();
    });

    quickInput.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        activeQuickIndex = Math.min(activeQuickIndex + 1, Math.max(0, quickItems.length - 1));
        renderQuickResults();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        activeQuickIndex = Math.max(activeQuickIndex - 1, 0);
        renderQuickResults();
      } else if (event.key === "Enter") {
        event.preventDefault();
        applyQuickItem(quickItems[activeQuickIndex]);
      } else if (event.key === "Escape") {
        event.preventDefault();
        closeQuickCommand();
      }
    });
  }

  function isEditableTarget(target) {
    return Boolean(target && target.closest && target.closest("input, textarea, select, [contenteditable='true']"));
  }

  function bindShortcuts() {
    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      const mod = event.ctrlKey || event.metaKey;

      if (mod && key === "k") {
        event.preventDefault();
        openQuickCommand();
        return;
      }

      if (mod && event.key === "Enter") {
        event.preventDefault();
        copyText(el.promptOutput ? el.promptOutput.value : "", "프롬프트");
        return;
      }

      if (mod && key === "s") {
        event.preventDefault();
        if (el.libraryExportButton) {
          el.libraryExportButton.click();
          showToast("현재 데이터 저장 시작");
        }
        return;
      }

      if (mod && event.shiftKey && key === "l") {
        event.preventDefault();
        toggleTheme();
        return;
      }

      if (!mod && event.key === "/" && !isEditableTarget(event.target)) {
        event.preventDefault();
        openQuickCommand();
      }
    });
  }

  function bindProgramZoom() {
    const minZoom = 0.7;
    const maxZoom = 1.3;
    const step = 0.05;
    const savedZoom = Number(localStorage.getItem("characterArchiveZoom") || "1");
    const updateZoomViewportMetrics = (zoomValue) => {
      const zoom = Math.max(minZoom, Math.min(maxZoom, Number(zoomValue) || 1));
      const characterVisualGutter = 20;
      const panelVisualGutter = characterVisualGutter;
      const characterWidth = Math.max(320, Math.floor((window.innerWidth - characterVisualGutter) / zoom));
      const panelWidth = Math.max(300, Math.floor((window.innerWidth - panelVisualGutter) / zoom));
      const height = Math.max(420, Math.ceil(window.innerHeight / zoom));
      document.documentElement.style.setProperty("--mobile-character-window-width", `${characterWidth}px`);
      document.documentElement.style.setProperty("--mobile-panel-window-width", `${panelWidth}px`);
      document.documentElement.style.setProperty("--program-zoomed-vh", `${height}px`);
    };
    const applyZoom = (value, announce = false) => {
      const nextZoom = Math.max(minZoom, Math.min(maxZoom, Number(value) || 1));
      document.documentElement.style.setProperty("--program-zoom", String(nextZoom));
      updateZoomViewportMetrics(nextZoom);
      localStorage.setItem("characterArchiveZoom", String(nextZoom));
      if (announce) {
        window.clearTimeout(zoomToastTimer);
        zoomToastTimer = window.setTimeout(() => {
          showToast(`화면 비율 ${Math.round(nextZoom * 100)}%`);
        }, 40);
      }
    };

    applyZoom(savedZoom);
    window.addEventListener("resize", () => {
      const current = Number(localStorage.getItem("characterArchiveZoom") || "1") || 1;
      updateZoomViewportMetrics(current);
    });
    document.addEventListener("wheel", (event) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }
      event.preventDefault();
      const current = Number(localStorage.getItem("characterArchiveZoom") || "1") || 1;
      applyZoom(current + (event.deltaY < 0 ? step : -step), true);
    }, { passive: false });
  }

  function autoGrowTextarea(textarea) {
    if (!textarea || textarea.id === "promptOutput") {
      return;
    }
    const minHeight = textarea.classList.contains("character-opening") ? 150 : 72;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(minHeight, Math.min(textarea.scrollHeight + 2, 360))}px`;
  }

  function autoGrowAllTextareas() {
    document.querySelectorAll("textarea").forEach(autoGrowTextarea);
  }

  function bindLiveUpdates() {
    document.addEventListener("input", (event) => {
      if (event.target && event.target.tagName === "TEXTAREA") {
        autoGrowTextarea(event.target);
      }
      scheduleUxUpdate();
    });
    document.addEventListener("change", scheduleUxUpdate);
    document.addEventListener("click", () => window.setTimeout(scheduleUxUpdate, 0));
  }

  function decorateSelectedEditor() {
    const editorTitle = document.getElementById("characterEditorTitle");
    if (!editorTitle || document.getElementById("editorHelperNote")) {
      return;
    }
    const note = document.createElement("div");
    note.id = "editorHelperNote";
    note.className = "editor-helper-note";
    note.textContent = "입력 내용은 자동 저장됩니다. 긴 내용 입력창은 내용에 맞춰 자동으로 커집니다.";
    const panel = editorTitle.closest(".panel");
    if (panel) {
      panel.insertBefore(note, panel.children[1] || null);
    }
  }

  function init() {
    mountTopUtility();
    mountPromptTools();
    mountQuickCommand();
    bindProgramZoom();
    bindShortcuts();
    bindLiveUpdates();
    decorateSelectedEditor();

    const savedTheme = localStorage.getItem(THEME_KEY) || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(savedTheme);
    scheduleUxUpdate();
  }

  init();
})();
