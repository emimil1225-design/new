(() => {
  "use strict";

  const STORAGE_KEY = "characterArchiveWindowLayoutV1";
  const desktop = document.getElementById("vaultDesktop");
  const windows = Array.from(document.querySelectorAll("[data-vault-window]"));
  const openButtons = Array.from(document.querySelectorAll("[data-vault-open]"));
  const brandTitle = document.querySelector(".vault-brand h1");
  const brandSubtitle = document.querySelector(".vault-brand span");

  if (!desktop || !windows.length) {
    return;
  }

  if (brandTitle) {
    brandTitle.textContent = "Character Archive";
  }
  if (brandSubtitle) {
    brandSubtitle.textContent = "";
  }

  let topZ = 80;
  const compactWindowQuery = window.matchMedia("(max-width: 520px)");

  function isCompactWindowMode() {
    return compactWindowQuery.matches;
  }

  function readLayout() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
    } catch (error) {
      return {};
    }
  }

  function writeLayout(layout) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }

  function getLayout() {
    return readLayout();
  }

  function updateWindowLayout(id, patch) {
    const layout = getLayout();
    layout[id] = { ...(layout[id] || {}), ...patch };
    writeLayout(layout);
  }

  function getWindow(id) {
    return windows.find((item) => item.id === id);
  }

  function setMenuState(id, open) {
    openButtons
      .filter((button) => button.dataset.vaultOpen === id)
      .forEach((button) => button.setAttribute("aria-pressed", open ? "true" : "false"));
  }

  function setMinimized(win, minimized, shouldSave = true) {
    if (!win) {
      return;
    }

    const metrics = getDesktopMetrics();
    const rect = getWindowLayoutRect(win, metrics);
    const currentLeft = win.style.left || `${Math.round(rect.left)}px`;
    const currentTop = win.style.top || `${Math.round(rect.top)}px`;

    if (win.classList.contains("character-window") && minimized && !win.classList.contains("is-minimized")) {
      const width = Math.round(rect.width);
      if (width > 0) {
        win.style.setProperty("--character-minimized-preserved-width", `${width}px`);
      }
    }

    win.classList.toggle("is-minimized", minimized);
    win.style.left = currentLeft;
    win.style.top = currentTop;
    const button = win.querySelector("[data-vault-minimize]");
    if (button) {
      button.setAttribute("aria-pressed", minimized ? "true" : "false");
      button.title = minimized ? "창 펼치기" : "창 최소화";
    }
    if (shouldSave) {
      updateWindowLayout(win.id, { minimized });
    }
  }

  function bringToFront(win) {
    if (!win) {
      return;
    }
    topZ += 1;
    win.style.zIndex = String(topZ);
  }

  function sendOpenWindowsBehind(activeWindow) {
    windows
      .filter((win) => win !== activeWindow && !win.hidden)
      .forEach((win, index) => {
        win.style.zIndex = String(70 + index);
      });
    topZ = Math.max(80, Number(activeWindow?.style.zIndex) || topZ);
  }

  function closeOtherWindows(activeWindow) {
    windows
      .filter((win) => win !== activeWindow && !win.hidden)
      .forEach((win) => {
        setMinimized(win, false, false);
        win.hidden = true;
        win.classList.remove("is-open", "dragging");
        setMenuState(win.id, false);
        updateWindowLayout(win.id, { open: false, minimized: false });
      });
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), Math.max(min, max));
  }

  function getDesktopMetrics() {
    const rect = desktop.getBoundingClientRect();
    const width = desktop.clientWidth || rect.width || 1;
    const height = desktop.clientHeight || rect.height || 1;
    return {
      rect,
      width,
      height,
      scaleX: rect.width ? rect.width / width : 1,
      scaleY: rect.height ? rect.height / height : 1
    };
  }

  function viewportToDesktopPoint(clientX, clientY, metrics = getDesktopMetrics()) {
    return {
      x: (clientX - metrics.rect.left) / metrics.scaleX,
      y: (clientY - metrics.rect.top) / metrics.scaleY
    };
  }

  function getWindowLayoutRect(win, metrics = getDesktopMetrics()) {
    const rect = win.getBoundingClientRect();
    return {
      left: (rect.left - metrics.rect.left) / metrics.scaleX,
      top: (rect.top - metrics.rect.top) / metrics.scaleY,
      width: rect.width / metrics.scaleX,
      height: rect.height / metrics.scaleY
    };
  }

  function clampWindow(win) {
    if (!win || win.hidden) {
      return;
    }
    const metrics = getDesktopMetrics();
    const rect = getWindowLayoutRect(win, metrics);
    const nextLeft = clamp(rect.left, 0, metrics.width - rect.width);
    const nextTop = clamp(rect.top, 0, metrics.height - rect.height);
    win.style.left = `${Math.round(nextLeft)}px`;
    win.style.top = `${Math.round(nextTop)}px`;
  }

  function centerWindow(win) {
    if (!win || win.hidden) {
      return;
    }
    const metrics = getDesktopMetrics();
    const rect = getWindowLayoutRect(win, metrics);
    const nextLeft = Math.max(0, (metrics.width - rect.width) / 2);
    const nextTop = isCompactWindowMode()
      ? 0
      : Math.max(0, (metrics.height - rect.height) / 2);
    win.style.left = `${Math.round(nextLeft)}px`;
    win.style.top = `${Math.round(nextTop)}px`;
  }

  function alignOpenWindows() {
    windows.forEach((win) => {
      if (win.hidden) {
        return;
      }
      centerWindow(win);
      clampWindow(win);
    });
  }

  function openWindow(id) {
    const win = getWindow(id);
    if (!win) {
      return;
    }
    win.hidden = false;
    win.classList.add("is-open");
    if (isCompactWindowMode()) {
      closeOtherWindows(win);
    }
    // Reopening a closed window should always show the full window body.
    // Keep position/size state, but never carry over the minimized state from a previous close.
    setMinimized(win, false, false);
    setMenuState(id, true);
    sendOpenWindowsBehind(win);
    bringToFront(win);
    window.requestAnimationFrame(() => {
      centerWindow(win);
      clampWindow(win);
      updateWindowLayout(id, {
        open: true,
        minimized: false,
        left: win.style.left || "",
        top: win.style.top || ""
      });
    });
  }

  function closeWindow(win) {
    if (!win) {
      return;
    }
    // Closing and minimizing are separate actions. When a minimized window is closed,
    // clear the minimized flag so the next open starts expanded.
    setMinimized(win, false, false);
    win.hidden = true;
    win.classList.remove("is-open", "dragging");
    setMenuState(win.id, false);
    updateWindowLayout(win.id, { open: false, minimized: false });
  }

  function restoreWindows() {
    const layout = getLayout();
    windows.forEach((win, index) => {
      const saved = layout[win.id] || {};
      if (saved.left) {
        win.style.left = saved.left;
      }
      if (saved.top) {
        win.style.top = saved.top;
      }
      if (saved.z) {
        win.style.zIndex = String(saved.z);
        topZ = Math.max(topZ, Number(saved.z) || topZ);
      } else {
        win.style.zIndex = String(topZ + index);
      }

      const shouldOpen = typeof saved.open === "boolean"
        ? saved.open
        : win.hasAttribute("data-default-open");
      win.hidden = !shouldOpen;
      win.classList.toggle("is-open", shouldOpen);
      setMinimized(win, Boolean(saved.minimized), false);
      setMenuState(win.id, shouldOpen);
    });
    if (isCompactWindowMode()) {
      const openWindows = windows
        .filter((win) => !win.hidden)
        .sort((a, b) => (Number(b.style.zIndex) || 0) - (Number(a.style.zIndex) || 0));
      const activeWindow = openWindows[0];
      if (activeWindow) {
        closeOtherWindows(activeWindow);
        bringToFront(activeWindow);
      }
    }
    window.requestAnimationFrame(alignOpenWindows);
  }

  function startDrag(win, event) {
    if (isCompactWindowMode()) {
      return;
    }
    if (!win || event.button !== 0) {
      return;
    }
    if (event.target.closest("button, input, textarea, select, a, [contenteditable='true']")) {
      return;
    }

    event.preventDefault();
    bringToFront(win);
    win.classList.add("dragging");

    const metrics = getDesktopMetrics();
    const rect = getWindowLayoutRect(win, metrics);
    const pointer = viewportToDesktopPoint(event.clientX, event.clientY, metrics);
    const offsetX = pointer.x - rect.left;
    const offsetY = pointer.y - rect.top;

    const onMove = (moveEvent) => {
      const moveMetrics = getDesktopMetrics();
      const moveRect = getWindowLayoutRect(win, moveMetrics);
      const movePoint = viewportToDesktopPoint(moveEvent.clientX, moveEvent.clientY, moveMetrics);
      const nextLeft = clamp(movePoint.x - offsetX, 0, moveMetrics.width - moveRect.width);
      const nextTop = clamp(movePoint.y - offsetY, 0, moveMetrics.height - moveRect.height);
      win.style.left = `${Math.round(nextLeft)}px`;
      win.style.top = `${Math.round(nextTop)}px`;
    };

    const onUp = () => {
      win.classList.remove("dragging");
      updateWindowLayout(win.id, {
        open: !win.hidden,
        left: win.style.left || "",
        top: win.style.top || "",
        z: Number(win.style.zIndex) || topZ
      });
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const win = getWindow(button.dataset.vaultOpen);
      if (win && !win.hidden) {
        closeWindow(win);
        return;
      }
      openWindow(button.dataset.vaultOpen);
    });
  });

  windows.forEach((win) => {
    const handle = win.querySelector("[data-vault-drag-handle]");
    const closeButton = win.querySelector("[data-vault-close]");
    closeButton?.classList.add("vault-window-control", "vault-window-close");
    if (handle && closeButton && !win.querySelector("[data-vault-minimize]")) {
      const minimizeButton = document.createElement("button");
      minimizeButton.className = "vault-window-control vault-window-minimize";
      minimizeButton.type = "button";
      minimizeButton.dataset.vaultMinimize = "";
      minimizeButton.textContent = "-";
      minimizeButton.title = "창 최소화";
      minimizeButton.setAttribute("aria-label", "창 최소화");
      minimizeButton.setAttribute("aria-pressed", "false");
      closeButton.insertAdjacentElement("beforebegin", minimizeButton);
    }
    handle?.addEventListener("pointerdown", (event) => startDrag(win, event));
    win.addEventListener("pointerdown", () => {
      if (!isCompactWindowMode()) {
        bringToFront(win);
      }
    });
    win.querySelector("[data-vault-minimize]")?.addEventListener("click", () => {
      setMinimized(win, !win.classList.contains("is-minimized"));
    });
    closeButton?.addEventListener("click", () => closeWindow(win));
  });

  compactWindowQuery.addEventListener("change", () => {
    if (isCompactWindowMode()) {
      const openWindows = windows.filter((win) => !win.hidden);
      closeOtherWindows(openWindows[0]);
    }
    alignOpenWindows();
  });
  window.addEventListener("resize", alignOpenWindows);
  restoreWindows();
})();
