(() => {
  "use strict";

  const context = window.PC_APP_CONTEXT;
  const storage = window.PC_STORAGE;
  if (!context || !storage || typeof storage.readAutoBackups !== "function") {
    return;
  }

  const toolbar = document.querySelector(".toolbar");
  let modal = null;
  let toggleButton = null;
  let limitSelect = null;
  let listNode = null;
  let countNode = null;
  let statusNode = null;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showToast(message) {
    if (typeof context.showToast === "function") {
      context.showToast(message);
      return;
    }
    const toast = context.el && context.el.toast;
    if (!toast) {
      return;
    }
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 1500);
  }

  function createToolbarButton() {
    if (!toolbar || document.getElementById("backupManagerButton")) {
      return;
    }
    const button = document.createElement("button");
    button.id = "backupManagerButton";
    button.className = "text-button backup-manager-button";
    button.type = "button";
    button.title = "자동 백업 설정과 백업 복원 관리";
    button.textContent = "백업 관리";
    const exportButton = document.getElementById("exportButton");
    toolbar.insertBefore(button, exportButton || null);
    button.addEventListener("click", openBackupManager);
  }

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function formatTime(date) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function formatBackupTitle(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "시간 정보 없음";
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    if (target.getTime() === today.getTime()) {
      return `오늘 ${formatTime(date)}`;
    }
    if (target.getTime() === yesterday.getTime()) {
      return `어제 ${formatTime(date)}`;
    }
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${formatTime(date)}`;
  }

  function countOf(value) {
    return Array.isArray(value) ? value.length : 0;
  }

  function getBackupSummary(backup) {
    const data = backup && backup.snapshot && backup.snapshot.data ? backup.snapshot.data : {};
    const parts = [
      ["캐릭터", countOf(data.sceneTemplateCharacters)],
      ["세계관", countOf(data.sceneTemplateWorlds)],
      ["상황", countOf(data.sceneTemplateScenes)],
      ["키워드", countOf(data.sceneTemplateKeywords)]
    ];
    return parts.map(([label, count]) => `${label} ${count.toLocaleString("ko-KR")}`).join(" · ");
  }

  function getReasonLabel(reason) {
    const labels = {
      auto: "자동",
      manual: "수동",
      "manual-export": "파일 저장",
      restore: "복원"
    };
    return labels[reason] || "백업";
  }

  function downloadJsonFile(fileName, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function saveBackupAsFile(id) {
    const backup = storage.readAutoBackups().find((item) => item.id === id);
    if (!backup) {
      showToast("저장할 백업을 찾지 못했어요");
      renderBackupManager();
      return;
    }
    const payload = storage.buildBackupExportPayload(backup);
    const stamp = typeof storage.toBackupFileStamp === "function"
      ? storage.toBackupFileStamp(backup.createdAt)
      : new Date().toISOString().replace(/[:.]/g, "-");
    downloadJsonFile(`character-prompt-composer-backup-${stamp}.json`, payload);
    showToast("백업 JSON 파일 저장을 시작했어요");
  }

  function createManualBackup() {
    const backup = storage.createAutoBackup(storage.readUnifiedStorage(), { force: true, reason: "manual" });
    if (!backup) {
      showToast("백업할 데이터가 아직 없어요");
      return;
    }
    renderBackupManager();
    showToast("현재 상태를 백업했어요");
  }

  function restoreBackup(id) {
    const backup = storage.readAutoBackups().find((item) => item.id === id);
    if (!backup) {
      showToast("복원할 백업을 찾지 못했어요");
      renderBackupManager();
      return;
    }
    const label = formatBackupTitle(backup.createdAt);
    const ok = window.confirm(`${label} 백업으로 복원할까요?\n\n현재 라이브러리 상태는 선택한 백업 내용으로 바뀌고 앱을 다시 불러옵니다.`);
    if (!ok) {
      return;
    }
    if (!storage.restoreAutoBackup(id)) {
      showToast("백업 복원에 실패했어요");
      renderBackupManager();
      return;
    }
    showToast("백업을 복원했어요. 앱을 다시 불러옵니다");
    window.setTimeout(() => window.location.reload(), 250);
  }

  function deleteBackup(id) {
    const backup = storage.readAutoBackups().find((item) => item.id === id);
    const label = backup ? formatBackupTitle(backup.createdAt) : "선택한";
    if (!window.confirm(`${label} 백업을 삭제할까요?`)) {
      return;
    }
    storage.deleteAutoBackup(id);
    renderBackupManager();
    showToast("백업을 삭제했어요");
  }

  function renderBackupList(backups) {
    if (!listNode) {
      return;
    }
    if (!backups.length) {
      listNode.innerHTML = `
        <div class="backup-empty cute-empty">
          <strong>아직 저장된 백업이 없어요</strong>
          <span>데이터가 자동 저장되면 백업이 생깁니다. 바로 만들려면 ‘지금 백업’을 눌러주세요.</span>
        </div>
      `;
      return;
    }

    listNode.innerHTML = backups.map((backup) => `
      <article class="backup-item" data-backup-id="${escapeHtml(backup.id)}">
        <div class="backup-item-main">
          <div class="backup-item-title">
            <strong>${escapeHtml(formatBackupTitle(backup.createdAt))}</strong>
            <span>${escapeHtml(getReasonLabel(backup.reason))}</span>
          </div>
          <p>${escapeHtml(getBackupSummary(backup))}</p>
        </div>
        <div class="backup-item-actions">
          <button class="text-button mini-action primary" type="button" data-backup-restore="${escapeHtml(backup.id)}">복원</button>
          <button class="text-button mini-action" type="button" data-backup-download="${escapeHtml(backup.id)}">백업 파일로 저장</button>
          <button class="text-button mini-action danger" type="button" data-backup-delete="${escapeHtml(backup.id)}">삭제</button>
        </div>
      </article>
    `).join("");
  }

  function renderBackupManager() {
    const settings = storage.readAutoBackupSettings();
    const backups = storage.readAutoBackups();
    if (toggleButton) {
      toggleButton.textContent = settings.enabled ? "켜짐" : "꺼짐";
      toggleButton.classList.toggle("active", settings.enabled);
      toggleButton.setAttribute("aria-pressed", settings.enabled ? "true" : "false");
    }
    if (limitSelect) {
      limitSelect.value = String(settings.limit);
      if (limitSelect.value !== String(settings.limit)) {
        const option = document.createElement("option");
        option.value = String(settings.limit);
        option.textContent = `${settings.limit}개`;
        limitSelect.appendChild(option);
        limitSelect.value = String(settings.limit);
      }
    }
    if (countNode) {
      countNode.textContent = `${backups.length.toLocaleString("ko-KR")} / ${settings.limit.toLocaleString("ko-KR")}개`;
    }
    if (statusNode) {
      statusNode.textContent = settings.enabled
        ? "자동 백업이 켜져 있어요. 저장 내용이 바뀌면 내부 백업 목록에 자동으로 기록됩니다."
        : "자동 백업이 꺼져 있어요. ‘지금 백업’으로 수동 백업만 만들 수 있습니다.";
    }
    renderBackupList(backups);
  }

  function openBackupManager() {
    if (!modal) {
      mountBackupManager();
    }
    renderBackupManager();
    modal.hidden = false;
    document.body.classList.add("backup-manager-open");
    window.setTimeout(() => toggleButton && toggleButton.focus({ preventScroll: true }), 0);
  }

  function closeBackupManager() {
    if (!modal) {
      return;
    }
    modal.hidden = true;
    document.body.classList.remove("backup-manager-open");
  }

  function mountBackupManager() {
    if (document.getElementById("backupManagerModal")) {
      modal = document.getElementById("backupManagerModal");
      toggleButton = document.getElementById("autoBackupToggle");
      limitSelect = document.getElementById("autoBackupLimitSelect");
      listNode = document.getElementById("backupList");
      countNode = document.getElementById("backupCount");
      statusNode = document.getElementById("backupStatusText");
      return;
    }

    modal = document.createElement("div");
    modal.id = "backupManagerModal";
    modal.className = "backup-manager-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="backup-manager-backdrop" data-backup-close></div>
      <section class="backup-manager-dialog" role="dialog" aria-modal="true" aria-labelledby="backupManagerTitle">
        <header class="backup-manager-header">
          <div>
            <h2 id="backupManagerTitle">설정 / 백업 관리</h2>
            <p id="backupStatusText">자동 백업 상태를 확인하는 중입니다.</p>
          </div>
          <div class="backup-header-actions">
            <button id="createBackupNowButton" class="text-button primary" type="button">지금 백업</button>
            <button class="icon-button backup-manager-close" type="button" data-backup-close title="닫기" aria-label="백업 관리 닫기">×</button>
          </div>
        </header>

        <div class="backup-settings-card">
          <div class="backup-setting-row">
            <div>
              <strong>자동 백업</strong>
              <span>자동 저장 흐름에서 복원 지점을 함께 남깁니다.</span>
            </div>
            <button id="autoBackupToggle" class="backup-toggle" type="button" aria-pressed="true">켜짐</button>
          </div>
          <label class="backup-setting-row" for="autoBackupLimitSelect">
            <div>
              <strong>보관 개수</strong>
              <span>초과한 오래된 백업은 자동으로 정리됩니다.</span>
            </div>
            <select id="autoBackupLimitSelect" class="control backup-limit-select">
              <option value="5">5개</option>
              <option value="10">10개</option>
              <option value="20">20개</option>
              <option value="30">30개</option>
              <option value="50">50개</option>
            </select>
          </label>
          <div class="backup-external-note">
            <strong>완전판 파일 백업 연동</strong>
            <span>네이티브 호스트가 백업 메시지를 처리하면 <code>${escapeHtml(storage.externalBackupFolderHint || "%LOCALAPPDATA%\\CharacterPromptComposer\\Backups")}</code> 에 JSON 파일을 자동 저장하도록 준비되어 있습니다.</span>
          </div>
        </div>

        <section class="backup-list-section" aria-labelledby="backupListTitle">
          <div class="backup-list-header">
            <h3 id="backupListTitle">백업 목록</h3>
            <span id="backupCount" class="count">0 / 10개</span>
          </div>
          <div id="backupList" class="backup-list"></div>
        </section>
      </section>
    `;
    document.body.appendChild(modal);

    toggleButton = document.getElementById("autoBackupToggle");
    limitSelect = document.getElementById("autoBackupLimitSelect");
    listNode = document.getElementById("backupList");
    countNode = document.getElementById("backupCount");
    statusNode = document.getElementById("backupStatusText");

    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-backup-close]")) {
        closeBackupManager();
        return;
      }
      const restoreButton = event.target.closest("[data-backup-restore]");
      if (restoreButton) {
        restoreBackup(restoreButton.dataset.backupRestore);
        return;
      }
      const downloadButton = event.target.closest("[data-backup-download]");
      if (downloadButton) {
        saveBackupAsFile(downloadButton.dataset.backupDownload);
        return;
      }
      const deleteButton = event.target.closest("[data-backup-delete]");
      if (deleteButton) {
        deleteBackup(deleteButton.dataset.backupDelete);
      }
    });

    toggleButton.addEventListener("click", () => {
      const settings = storage.readAutoBackupSettings();
      storage.writeAutoBackupSettings({ enabled: !settings.enabled });
      renderBackupManager();
      showToast(!settings.enabled ? "자동 백업을 켰어요" : "자동 백업을 껐어요");
    });

    limitSelect.addEventListener("change", () => {
      storage.writeAutoBackupSettings({ limit: Number(limitSelect.value) });
      renderBackupManager();
      showToast(`백업 보관 개수를 ${limitSelect.value}개로 변경했어요`);
    });

    const createNowButton = document.getElementById("createBackupNowButton");
    if (createNowButton) {
      createNowButton.addEventListener("click", createManualBackup);
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal && !modal.hidden) {
        closeBackupManager();
      }
    });
  }

  createToolbarButton();
  mountBackupManager();
})();
