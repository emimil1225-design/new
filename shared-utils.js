(() => {
  "use strict";

  function uniqueCleanList(value, options = {}) {
    const {
      exclude = [],
      fallback = [],
      splitPattern = /[,\n]+/
    } = options;
    const excluded = new Set([].concat(exclude).map((item) => String(item || "").trim()).filter(Boolean));
    const source = Array.isArray(value) ? value : String(value || "").split(splitPattern);
    const list = [];

    source.forEach((item) => {
      const clean = String(item || "").trim();
      if (clean && !excluded.has(clean) && !list.includes(clean)) {
        list.push(clean);
      }
    });

    if (!list.length && Array.isArray(fallback)) {
      fallback.forEach((item) => {
        const clean = String(item || "").trim();
        if (clean && !excluded.has(clean) && !list.includes(clean)) {
          list.push(clean);
        }
      });
    }

    return list;
  }

  function moveRelativeById(items, sourceId, targetId, position, getId = (item) => item && item.id) {
    if (!Array.isArray(items) || !sourceId || !targetId || sourceId === targetId) {
      return false;
    }

    const sourceIndex = items.findIndex((item) => getId(item) === sourceId);
    if (sourceIndex === -1) {
      return false;
    }

    const [item] = items.splice(sourceIndex, 1);
    let targetIndex = items.findIndex((entry) => getId(entry) === targetId);
    if (targetIndex === -1) {
      items.splice(sourceIndex, 0, item);
      return false;
    }

    if (position === "after") {
      targetIndex += 1;
    }

    items.splice(targetIndex, 0, item);
    return true;
  }

  function moveToEndById(items, sourceId, getId = (item) => item && item.id) {
    if (!Array.isArray(items)) {
      return false;
    }

    const sourceIndex = items.findIndex((item) => getId(item) === sourceId);
    if (sourceIndex === -1 || sourceIndex === items.length - 1) {
      return false;
    }

    const [item] = items.splice(sourceIndex, 1);
    items.push(item);
    return true;
  }

  function getVerticalDropPosition(event, element) {
    const rect = element.getBoundingClientRect();
    return event.clientY < rect.top + rect.height / 2 ? "before" : "after";
  }

  function clearDropHints(container) {
    container?.querySelectorAll(".drop-before, .drop-after").forEach((card) => {
      card.classList.remove("drop-before", "drop-after");
    });
  }

  function showDropHint(container, card, position) {
    clearDropHints(container);
    if (card && position) {
      card.classList.add(position === "before" ? "drop-before" : "drop-after");
    }
  }

  function focusWithoutScroll(element, options = {}) {
    if (!element || typeof element.focus !== "function") {
      return false;
    }
    try {
      element.focus({ preventScroll: true });
    } catch (error) {
      element.focus();
    }
    if (options.select && typeof element.select === "function") {
      element.select();
    }
    return true;
  }

  function revealInScrollContainer(container, target, options = {}) {
    if (!container || !target) {
      return;
    }
    const { block = "center", behavior = "smooth" } = options;
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetTop = targetRect.top - containerRect.top + container.scrollTop;
    const targetBottom = targetTop + targetRect.height;
    let nextTop = container.scrollTop;

    if (block === "nearest") {
      if (targetTop < container.scrollTop) {
        nextTop = targetTop;
      } else if (targetBottom > container.scrollTop + container.clientHeight) {
        nextTop = targetBottom - container.clientHeight;
      }
    } else {
      nextTop = targetTop - Math.max(0, (container.clientHeight - targetRect.height) / 2);
    }

    const maxTop = Math.max(0, container.scrollHeight - container.clientHeight);
    const top = Math.max(0, Math.min(maxTop, nextTop));
    if (typeof container.scrollTo === "function") {
      container.scrollTo({ top, behavior });
    } else {
      container.scrollTop = top;
    }
  }

  function renderCategoryBadges(categories, escapeFn = (value) => String(value ?? "")) {
    const list = Array.isArray(categories) ? categories : [];
    return list
      .map((category) => `<span class="card-category-badge">${escapeFn(category)}</span>`)
      .join("");
  }


  function normalizeSearchQuery(value) {
    return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
  }

  function buildSearchText(parts, separator = " ") {
    return (Array.isArray(parts) ? parts : [parts])
      .flat(Infinity)
      .map((part) => String(part ?? "").trim())
      .filter(Boolean)
      .join(separator)
      .toLowerCase();
  }

  function filterByQuery(items, options = {}) {
    const {
      query = "",
      getText = (item) => item,
      matches = () => true
    } = options;
    const normalizedQuery = normalizeSearchQuery(query);
    return (Array.isArray(items) ? items : []).filter((item) => {
      if (!matches(item)) {
        return false;
      }
      return !normalizedQuery || buildSearchText(getText(item)).includes(normalizedQuery);
    });
  }

  function resolveVisibleSelection(items, selectedId, options = {}) {
    const {
      getId = (item) => item && item.id,
      allowEmpty = false,
      fallbackItems = []
    } = options;
    const visibleItems = Array.isArray(items) ? items : [];
    const visibleIds = visibleItems.map(getId).filter(Boolean);
    if (selectedId && visibleIds.includes(selectedId)) {
      return selectedId;
    }
    if (allowEmpty && !selectedId) {
      return "";
    }
    if (allowEmpty && !visibleIds.length) {
      return "";
    }
    const fallback = (Array.isArray(fallbackItems) ? fallbackItems : [])
      .map(getId)
      .find(Boolean);
    return visibleIds[0] || fallback || "";
  }

  function renderEditableCardHeader(options = {}) {
    const {
      isEditing = false,
      editorClass = "",
      editorLabel = "",
      fields = [],
      saveAttribute = "data-card-edit-save",
      cancelAttribute = "data-card-edit-cancel",
      editAttribute = "data-card-header-edit",
      selectAttribute = "data-card-select",
      id = "",
      title = "",
      fallbackTitle = "&#51060;&#47492; &#50630;&#51020;",
      subId = "",
      metaHtml = "",
      actionsLabel = "card actions",
      editTitle = "edit",
      saveLabel = "&#51200;&#51109;",
      cancelLabel = "&#52712;&#49548;",
      editIcon = "&#9998;"
    } = options;

    if (isEditing) {
      const fieldHtml = fields.map((field) => {
        const attrs = `${field.attribute} placeholder="${field.placeholder || ""}"`;
        return field.type === "textarea"
          ? `<label>${field.label}<textarea ${attrs}>${field.value || ""}</textarea></label>`
          : `<label>${field.label}<input type="text" ${attrs} value="${field.value || ""}"></label>`;
      }).join("");
      return `<div class="card-main-row header-editing"><div class="card-header-editor ${editorClass}" role="group" aria-label="${editorLabel}">${fieldHtml}<div class="header-edit-actions"><button class="text-button primary mini-action" type="button" ${saveAttribute}="${id}">${saveLabel}</button><button class="text-button mini-action" type="button" ${cancelAttribute}="${id}">${cancelLabel}</button></div></div></div>`;
    }

    return `<div class="card-main-row"><div class="card-top" role="button" tabindex="0" data-card-main="${id}"><strong>${title || fallbackTitle}</strong>${subId ? `<span class="scene-id">${subId}</span>` : ""}<div class="card-meta">${metaHtml}</div></div><div class="card-order-actions" aria-label="${actionsLabel}"><button class="order-button edit-button" type="button" ${editAttribute}="${id}" title="${editTitle}" aria-label="${editTitle}">${editIcon}</button></div></div>`;
  }

  function renderAdvancedCategoryFilter(options = {}) {
    const {
      container,
      toggle,
      panel,
      open = false,
      categories = [],
      selected = "",
      activeClass = "active",
      buttonClassName = "chip",
      openLabel = "상세 검색 닫기",
      closedLabel = "상세 검색 열기",
      onSelect = () => {}
    } = options;

    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? openLabel : closedLabel);
      toggle.textContent = open ? "▴" : "▾";
    }
    if (panel) {
      panel.hidden = !open;
      const wrapper = panel.closest(".advanced-search");
      if (wrapper) {
        wrapper.hidden = !open;
      }
    }
    if (!container) {
      return;
    }

    container.innerHTML = "";
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `${buttonClassName}${category === selected ? ` ${activeClass}` : ""}`;
      button.textContent = category;
      button.addEventListener("click", () => onSelect(category));
      container.appendChild(button);
    });
  }

  function bindOrderableCard(card, options = {}) {
    const {
      targetId,
      getDraggedId,
      setDraggedId,
      setSuppressClick,
      canDrag = () => true,
      invalidDragSelector = "input, textarea, select",
      getDropPosition = getVerticalDropPosition,
      showDropHint = () => {},
      clearDropHints = () => {},
      moveRelative = () => false,
      finishReorder = () => {},
      clickSuppressDelay = 160
    } = options;

    card.addEventListener("dragstart", (event) => {
      if (!card.draggable || !canDrag(event) || event.target.closest(invalidDragSelector)) {
        event.preventDefault();
        return;
      }
      setDraggedId(targetId);
      setSuppressClick(true);
      card.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", targetId);
    });
    card.addEventListener("dragover", (event) => {
      event.stopPropagation();
      const draggedId = getDraggedId();
      if (!draggedId || draggedId === targetId) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      showDropHint(card, getDropPosition(event, card));
    });
    card.addEventListener("dragleave", (event) => {
      if (!card.contains(event.relatedTarget)) {
        card.classList.remove("drop-before", "drop-after");
      }
    });
    card.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const sourceId = getDraggedId() || event.dataTransfer.getData("text/plain");
      const position = getDropPosition(event, card);
      finishReorder(moveRelative(sourceId, targetId, position), sourceId);
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      clearDropHints();
      setDraggedId("");
      window.setTimeout(() => setSuppressClick(false), clickSuppressDelay);
    });
  }

  window.PC_SHARED = {
    uniqueCleanList,
    normalizeSearchQuery,
    buildSearchText,
    filterByQuery,
    resolveVisibleSelection,
    renderEditableCardHeader,
    renderAdvancedCategoryFilter,
    renderCategoryBadges,
    focusWithoutScroll,
    revealInScrollContainer,
    clearDropHints,
    showDropHint,
    bindOrderableCard,
    moveRelativeById,
    moveToEndById,
    getVerticalDropPosition
  };
})();
