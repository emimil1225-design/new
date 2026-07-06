(() => {
  "use strict";

  function create(api) {
    const { state, el, storage } = api;

      function decorateToastMessage(message) {
        const text = String(message || "").trim();
        if (!text) {
          return "알림이 도착했어요";
        }
        if (/복사됨$/.test(text)) {
          return text.replace(/복사됨$/, "복사했어요");
        }
        if (/저장됨$/.test(text)) {
          return text.replace(/저장됨$/, "저장했어요");
        }
        if (/삭제됨$/.test(text)) {
          return text.replace(/삭제됨$/, "삭제했어요");
        }
        return text;
      }

      function showToast(message, options = {}) {
        if (!el.toast) {
          return;
        }
        const hasAction = options && options.actionLabel && typeof options.onAction === "function";
        el.toast.textContent = "";
        el.toast.classList.toggle("has-action", Boolean(hasAction));
        const icon = document.createElement("span");
        icon.className = "toast-icon";
        icon.textContent = "🐰";
        const body = document.createElement("span");
        body.className = "toast-message";
        body.textContent = decorateToastMessage(message);
        el.toast.append(icon, body);
        if (hasAction) {
          const actionButton = document.createElement("button");
          actionButton.className = "toast-action";
          actionButton.type = "button";
          actionButton.textContent = options.actionLabel;
          actionButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            window.clearTimeout(showToast.timeout);
            el.toast.classList.remove("show");
            el.toast.classList.remove("has-action");
            options.onAction();
          }, { once: true });
          el.toast.append(actionButton);
        }
        el.toast.classList.add("show");
        window.clearTimeout(showToast.timeout);
        const duration = Number(options?.duration) > 0 ? Number(options.duration) : 1850;
        showToast.timeout = window.setTimeout(() => {
          el.toast.classList.remove("show");
          el.toast.classList.remove("has-action");
        }, duration);
      }

      async function copyText(text, label) {
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

      const paneLayout = {
        leftMin: 260,
        leftMax: 560,
        rightMin: 260,
        rightMax: 640,
        middleMin: 420,
        step: 16
      };

      const sceneKeywordLayout = {
        sceneMin: 190,
        keywordMin: 170,
        handle: 14,
        bottomHandle: 14,
        step: 18
      };

      const worldPromptLayout = {
        worldMin: 260,
        promptMin: 260,
        handle: 14,
        step: 18
      };

      const promptEditorLayout = {
        min: 180,
        max: 900,
        step: 18
      };

      function clampNumber(value, min, max) {
        return Math.min(Math.max(value, min), max);
      }

      function getPaneLayoutBounds() {
        const workspaceWidth = el.workspace ? el.workspace.getBoundingClientRect().width : window.innerWidth;
        const compact = window.matchMedia("(max-width: 860px)").matches;
        const leftHidden = window.matchMedia("(max-width: 1180px)").matches;
        const handleSpace = leftHidden ? 6 : 12;
        const available = Math.max(0, workspaceWidth - handleSpace - paneLayout.middleMin);
        return { ...paneLayout, available, compact, leftHidden };
      }

      function getPaneDisplayWidths() {
        const bounds = getPaneLayoutBounds();
        let left = clampNumber(state.leftPaneWidth, bounds.leftMin, bounds.leftMax);
        let right = clampNumber(state.rightPaneWidth, bounds.rightMin, bounds.rightMax);

        if (bounds.leftHidden) {
          const maxRight = Math.max(bounds.rightMin, Math.min(bounds.rightMax, bounds.available));
          right = clampNumber(right, bounds.rightMin, maxRight);
          return { left, right, bounds };
        }

        const maxLeft = Math.max(bounds.leftMin, Math.min(bounds.leftMax, bounds.available - bounds.rightMin));
        left = clampNumber(left, bounds.leftMin, maxLeft);
        const maxRight = Math.max(bounds.rightMin, Math.min(bounds.rightMax, bounds.available - left));
        right = clampNumber(right, bounds.rightMin, maxRight);
        return { left, right, bounds };
      }

      function applyPaneWidths() {
        if (!el.workspace) {
          return;
        }
        const { left, right } = getPaneDisplayWidths();
        el.workspace.style.setProperty("--left-pane-width", `${left}px`);
        el.workspace.style.setProperty("--right-pane-width", `${right}px`);
      }

      function savePaneWidths() {
        localStorage.setItem(storage.leftPaneWidth, String(Math.round(state.leftPaneWidth)));
        localStorage.setItem(storage.rightPaneWidth, String(Math.round(state.rightPaneWidth)));
      }

      function getSceneKeywordBounds() {
        const container = el.workspace?.querySelector(".v2-scenes");
        const height = container ? container.getBoundingClientRect().height : 0;
        const maxScene = Math.max(sceneKeywordLayout.sceneMin, height - sceneKeywordLayout.keywordMin - sceneKeywordLayout.handle - sceneKeywordLayout.bottomHandle);
        return {
          container,
          height,
          min: sceneKeywordLayout.sceneMin,
          max: maxScene
        };
      }

      function applySceneKeywordSplit() {
        const { container, height, min, max } = getSceneKeywordBounds();
        if (!container || !height) {
          return;
        }
        const fallback = Math.round(height * 0.54);
        const next = clampNumber(Number(state.sceneKeywordSplitHeight) || fallback, min, max);
        state.sceneKeywordSplitHeight = next;
        container.style.setProperty("--scene-section-height", `${next}px`);
        applyKeywordSectionHeight();
      }

      function saveSceneKeywordSplit() {
        localStorage.setItem(storage.sceneKeywordSplitHeight, String(Math.round(state.sceneKeywordSplitHeight || 0)));
      }

      function setSceneKeywordSplit(height) {
        const { container, min, max } = getSceneKeywordBounds();
        if (!container) {
          return;
        }
        state.sceneKeywordSplitHeight = clampNumber(Math.round(height), min, max);
        applySceneKeywordSplit();
      }

      function setSceneKeywordSplitFromPointer(clientY) {
        const { container } = getSceneKeywordBounds();
        if (!container) {
          return;
        }
        const rect = container.getBoundingClientRect();
        setSceneKeywordSplit(clientY - rect.top);
      }

      function startSceneKeywordResize(event) {
        if (event.button && event.button !== 0) {
          return;
        }
        event.preventDefault();
        el.sceneKeywordResizeHandle?.classList.add("active");
        document.body.classList.add("is-resizing-vertical");
        setSceneKeywordSplitFromPointer(event.clientY);

        const onMove = (moveEvent) => {
          setSceneKeywordSplitFromPointer(moveEvent.clientY);
        };
        const onUp = () => {
          el.sceneKeywordResizeHandle?.classList.remove("active");
          document.body.classList.remove("is-resizing-vertical");
          saveSceneKeywordSplit();
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      }

      function handleSceneKeywordResizeKey(event) {
        const directionMap = {
          ArrowUp: -1,
          ArrowDown: 1
        };
        const direction = directionMap[event.key];
        if (!direction) {
          return;
        }
        event.preventDefault();
        const { height } = getSceneKeywordBounds();
        const current = Number(state.sceneKeywordSplitHeight) || Math.round(height * 0.54);
        setSceneKeywordSplit(current + direction * sceneKeywordLayout.step);
        saveSceneKeywordSplit();
      }

      function getKeywordSectionBounds() {
        const container = el.workspace?.querySelector(".v2-scenes");
        if (!container && el.keywordList) {
          const archiveContainer = el.keywordList.closest(".keyword-stack") || el.keywordList.parentElement;
          const containerRect = archiveContainer ? archiveContainer.getBoundingClientRect() : null;
          const listRect = el.keywordList.getBoundingClientRect();
          const height = containerRect ? containerRect.height : 0;
          const available = containerRect ? Math.max(0, containerRect.bottom - listRect.top - sceneKeywordLayout.bottomHandle) : 0;
          return {
            container: archiveContainer,
            height,
            min: sceneKeywordLayout.keywordMin,
            max: Math.max(sceneKeywordLayout.keywordMin, available),
            available,
            archiveList: el.keywordList
          };
        }
        const height = container ? container.getBoundingClientRect().height : 0;
        const sceneHeight = Number(state.sceneKeywordSplitHeight) || Math.round(height * 0.54);
        const available = Math.max(0, height - sceneHeight - sceneKeywordLayout.handle - sceneKeywordLayout.bottomHandle);
        return {
          container,
          height,
          min: sceneKeywordLayout.keywordMin,
          max: Math.max(sceneKeywordLayout.keywordMin, available),
          available
        };
      }

      function applyKeywordSectionHeight() {
        const { container, height, min, max, available, archiveList } = getKeywordSectionBounds();
        if (!container || !height) {
          return;
        }
        if (archiveList) {
          container.style.removeProperty("--keyword-section-height");
          archiveList.style.removeProperty("height");
          archiveList.style.removeProperty("max-height");
          archiveList.style.removeProperty("flex");
          return;
        }
        const fallback = available || max;
        const next = clampNumber(Number(state.keywordSectionHeight) || fallback, min, max);
        state.keywordSectionHeight = next;
        container.style.setProperty("--keyword-section-height", `${next}px`);
      }

      function saveKeywordSectionHeight() {
        localStorage.setItem(storage.keywordSectionHeight, String(Math.round(state.keywordSectionHeight || 0)));
      }

      function setKeywordSectionHeight(height) {
        const { container, min, max } = getKeywordSectionBounds();
        if (!container) {
          return;
        }
        state.keywordSectionHeight = clampNumber(Math.round(height), min, max);
        applyKeywordSectionHeight();
      }

      function getWorldPromptBounds() {
        const container = el.workspace?.querySelector(".v2-side");
        const height = container ? container.getBoundingClientRect().height : 0;
        const maxWorld = Math.max(worldPromptLayout.worldMin, height - worldPromptLayout.promptMin - worldPromptLayout.handle);
        return {
          container,
          height,
          min: worldPromptLayout.worldMin,
          max: maxWorld
        };
      }

      function applyWorldPromptSplit() {
        const { container, height, min, max } = getWorldPromptBounds();
        if (!container || !height) {
          return;
        }
        const fallback = Math.round(height * 0.48);
        const next = clampNumber(Number(state.worldPromptSplitHeight) || fallback, min, max);
        state.worldPromptSplitHeight = next;
        container.style.setProperty("--world-section-height", `${next}px`);
      }

      function saveWorldPromptSplit() {
        localStorage.setItem(storage.worldPromptSplitHeight, String(Math.round(state.worldPromptSplitHeight || 0)));
      }

      function setWorldPromptSplit(height) {
        const { container, min, max } = getWorldPromptBounds();
        if (!container) {
          return;
        }
        state.worldPromptSplitHeight = clampNumber(Math.round(height), min, max);
        applyWorldPromptSplit();
      }

      function setWorldPromptSplitFromPointer(clientY) {
        const { container } = getWorldPromptBounds();
        if (!container) {
          return;
        }
        const rect = container.getBoundingClientRect();
        setWorldPromptSplit(clientY - rect.top);
      }

      function startWorldPromptResize(event) {
        if (event.button && event.button !== 0) {
          return;
        }
        event.preventDefault();
        el.worldPromptResizeHandle?.classList.add("active");
        document.body.classList.add("is-resizing-vertical");
        setWorldPromptSplitFromPointer(event.clientY);

        const onMove = (moveEvent) => {
          setWorldPromptSplitFromPointer(moveEvent.clientY);
        };
        const onUp = () => {
          el.worldPromptResizeHandle?.classList.remove("active");
          document.body.classList.remove("is-resizing-vertical");
          saveWorldPromptSplit();
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      }

      function handleWorldPromptResizeKey(event) {
        const directionMap = {
          ArrowUp: -1,
          ArrowDown: 1
        };
        const direction = directionMap[event.key];
        if (!direction) {
          return;
        }
        event.preventDefault();
        const { height } = getWorldPromptBounds();
        const current = Number(state.worldPromptSplitHeight) || Math.round(height * 0.48);
        setWorldPromptSplit(current + direction * worldPromptLayout.step);
        saveWorldPromptSplit();
      }

      function getPromptEditorBounds() {
        const viewportLimit = Math.max(promptEditorLayout.min, window.innerHeight - 190);
        return {
          min: promptEditorLayout.min,
          max: Math.max(promptEditorLayout.min, Math.min(promptEditorLayout.max, viewportLimit))
        };
      }

      function applyPromptEditorHeight() {
        if (!el.promptOutput) {
          return;
        }
        const { min, max } = getPromptEditorBounds();
        const next = clampNumber(Number(state.promptEditorHeight) || 430, min, max);
        state.promptEditorHeight = next;
        el.promptOutput.style.setProperty("--prompt-editor-height", `${next}px`);
        el.promptOutput.style.height = `${next}px`;
      }

      function setPaneWidth(type, width) {
        const { left, right, bounds } = getPaneDisplayWidths();
        if (bounds.compact) {
          return;
        }
        if (type === "left") {
          if (bounds.leftHidden) {
            return;
          }
          const maxLeft = Math.max(bounds.leftMin, Math.min(bounds.leftMax, bounds.available - right));
          state.leftPaneWidth = clampNumber(Math.round(width), bounds.leftMin, maxLeft);
        } else {
          const maxRight = Math.max(bounds.rightMin, Math.min(bounds.rightMax, bounds.available - (bounds.leftHidden ? 0 : left)));
          state.rightPaneWidth = clampNumber(Math.round(width), bounds.rightMin, maxRight);
        }
        applyPaneWidths();
      }

      function setPaneWidthFromPointer(type, clientX) {
        if (!el.workspace) {
          return;
        }
        const rect = el.workspace.getBoundingClientRect();
        const width = type === "left" ? clientX - rect.left : rect.right - clientX;
        setPaneWidth(type, width);
      }

      function startPaneResize(type, event) {
        if (event.button && event.button !== 0) {
          return;
        }
        event.preventDefault();
        const handle = type === "left" ? el.leftResizeHandle : el.rightResizeHandle;
        handle?.classList.add("active");
        document.body.classList.add("is-resizing");
        setPaneWidthFromPointer(type, event.clientX);

        const onMove = (moveEvent) => {
          setPaneWidthFromPointer(type, moveEvent.clientX);
        };
        const onUp = () => {
          handle?.classList.remove("active");
          document.body.classList.remove("is-resizing");
          savePaneWidths();
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      }

      function handlePaneResizeKey(type, event) {
        const directionMap = {
          ArrowLeft: type === "left" ? -1 : 1,
          ArrowRight: type === "left" ? 1 : -1
        };
        const direction = directionMap[event.key];
        if (!direction) {
          return;
        }
        event.preventDefault();
        const current = type === "left" ? state.leftPaneWidth : state.rightPaneWidth;
        setPaneWidth(type, current + direction * paneLayout.step);
        savePaneWidths();
      }

      function renderCollapsedCharacterLayoutControls() {
        const savedColumns = Number(state.characterCardColumns);
        const columns = [1, 2, 3].includes(savedColumns) ? savedColumns : 2;
        state.characterCardColumns = columns;

        if (el.collapsedCharacterLayoutControls) {
          el.collapsedCharacterLayoutControls.hidden = false;
        }
        if (el.characterList) {
          el.characterList.dataset.cardColumns = String(columns);
        }
        if (el.characterListPanel) {
          el.characterListPanel.dataset.cardColumns = String(columns);
        }
        if (el.workspace) {
          el.workspace.dataset.characterCardColumns = String(columns);
        }

        const buttons = [el.characterLayoutOneButton, el.characterLayoutTwoButton, el.characterLayoutThreeButton].filter(Boolean);
        buttons.forEach((button) => {
          const active = Number(button.dataset.characterCardColumns) === columns;
          button.classList.toggle("active", active);
          button.setAttribute("aria-pressed", active ? "true" : "false");
        });
      }
      function renderResponsiveLayoutControls() {
        renderCollapsedCharacterLayoutControls();
        applyPaneWidths();
        applySceneKeywordSplit();
        applyKeywordSectionHeight();
        applyWorldPromptSplit();
      }

    function bindEvents() {
      [el.characterLayoutOneButton, el.characterLayoutTwoButton, el.characterLayoutThreeButton].filter(Boolean).forEach((button) => {
        button.addEventListener("click", () => {
          const requestedColumns = Number(button.dataset.characterCardColumns);
          const columns = [1, 2, 3].includes(requestedColumns) ? requestedColumns : 2;
          state.characterCardColumns = columns;
          localStorage.setItem(storage.characterCardColumns, String(columns));
          renderCollapsedCharacterLayoutControls();
          showToast(`캐릭터 카드를 ${columns}줄 배열로 바꿨어요`);
        });
      });

      if (el.leftResizeHandle) {
        el.leftResizeHandle.addEventListener("pointerdown", (event) => startPaneResize("left", event));
        el.leftResizeHandle.addEventListener("keydown", (event) => handlePaneResizeKey("left", event));
      }

      if (el.sceneKeywordResizeHandle) {
        el.sceneKeywordResizeHandle.addEventListener("pointerdown", startSceneKeywordResize);
        el.sceneKeywordResizeHandle.addEventListener("keydown", handleSceneKeywordResizeKey);
      }

      if (el.worldPromptResizeHandle) {
        el.worldPromptResizeHandle.addEventListener("pointerdown", startWorldPromptResize);
        el.worldPromptResizeHandle.addEventListener("keydown", handleWorldPromptResizeKey);
      }

      if (el.rightResizeHandle) {
        el.rightResizeHandle.addEventListener("pointerdown", (event) => startPaneResize("right", event));
        el.rightResizeHandle.addEventListener("keydown", (event) => handlePaneResizeKey("right", event));
      }

      window.addEventListener("resize", () => {
        applyPaneWidths();
        applySceneKeywordSplit();
        applyKeywordSectionHeight();
        applyWorldPromptSplit();
        applyPromptEditorHeight();
      });

      applyPromptEditorHeight();


    }

    return {
      showToast,
      copyText,
      renderResponsiveLayoutControls,
      renderCollapsedCharacterLayoutControls,
      applyPaneWidths,
      applySceneKeywordSplit,
      applyKeywordSectionHeight,
      applyWorldPromptSplit,
      applyPromptEditorHeight,
      bindEvents
    };
  }

  window.PC_UI = { create };
})();
