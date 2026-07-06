(() => {
  "use strict";

  const unifiedStorageKey = "promptComposerUnifiedStateV10";
  const autoBackupStorageKey = "promptComposerAutoBackupsV10";
  const autoBackupSettingsKey = "promptComposerAutoBackupSettingsV1";
  const externalBackupFolderHint = "%LOCALAPPDATA%\\CharacterPromptComposer\\Backups";
  const autoBackupMinIntervalMs = 10 * 60 * 1000;
  const knownMirroredStorageKeys = [
    "sceneTemplateWorlds",
    "sceneTemplateCharacters",
    "sceneTemplateKeywords",
    "sceneTemplateScenes",
    "promptComposerDeletedItems",
    "promptComposerModifiedItems",
    "promptComposerDrafts",
    "promptComposerPromptPresets",
    "promptComposerPromptHistory",
    "promptComposerSceneCategories",
    "promptComposerCharacterTags"
  ];
  const defaultAutoBackupSettings = {
    enabled: true,
    limit: 10
  };

  function safeJsonParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function clampBackupLimit(value) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
      return defaultAutoBackupSettings.limit;
    }
    return Math.max(1, Math.min(50, parsed));
  }

  function readAutoBackupSettings() {
    const stored = safeJsonParse(localStorage.getItem(autoBackupSettingsKey), {});
    return {
      enabled: stored.enabled !== false,
      limit: clampBackupLimit(stored.limit || defaultAutoBackupSettings.limit)
    };
  }

  function writeAutoBackupSettings(settings = {}) {
    const next = {
      ...readAutoBackupSettings(),
      ...settings
    };
    next.enabled = next.enabled !== false;
    next.limit = clampBackupLimit(next.limit);
    try {
      localStorage.setItem(autoBackupSettingsKey, JSON.stringify(next));
      pruneAutoBackups(next.limit);
    } catch (error) {
      return readAutoBackupSettings();
    }
    return next;
  }

  function readUnifiedStorage() {
    try {
      const value = localStorage.getItem(unifiedStorageKey);
      const parsed = value ? JSON.parse(value) : {};
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return {
          version: parsed.version || 10,
          updatedAt: parsed.updatedAt || "",
          data: parsed.data && typeof parsed.data === "object" && !Array.isArray(parsed.data) ? parsed.data : {}
        };
      }
    } catch (error) {
      return { version: 10, updatedAt: "", data: {} };
    }
    return { version: 10, updatedAt: "", data: {} };
  }

  function normalizeBackup(item) {
    if (!item || typeof item !== "object") {
      return null;
    }
    const snapshot = item.snapshot && typeof item.snapshot === "object" ? item.snapshot : null;
    if (!snapshot || !snapshot.data || typeof snapshot.data !== "object") {
      return null;
    }
    const createdAt = item.createdAt || snapshot.updatedAt || new Date().toISOString();
    return {
      id: item.id || `backup-${Date.parse(createdAt) || Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      createdAt,
      reason: item.reason || "auto",
      snapshot: {
        version: snapshot.version || 10,
        updatedAt: snapshot.updatedAt || createdAt,
        data: snapshot.data
      }
    };
  }

  function readAutoBackups() {
    const stored = safeJsonParse(localStorage.getItem(autoBackupStorageKey), []);
    return (Array.isArray(stored) ? stored : [])
      .map(normalizeBackup)
      .filter(Boolean)
      .sort((a, b) => Date.parse(b.createdAt || "") - Date.parse(a.createdAt || ""));
  }

  function writeAutoBackups(backups) {
    let nextBackups = Array.isArray(backups) ? backups : [];
    while (nextBackups.length >= 0) {
      try {
        localStorage.setItem(autoBackupStorageKey, JSON.stringify(nextBackups));
        return true;
      } catch (error) {
        if (!nextBackups.length) {
          break;
        }
        nextBackups = nextBackups.slice(0, -1);
      }
    }
    try {
      localStorage.setItem(autoBackupStorageKey, "[]");
    } catch (error) {
      return false;
    }
    return false;
  }

  function pruneAutoBackups(limit = readAutoBackupSettings().limit) {
    const safeLimit = clampBackupLimit(limit);
    const backups = readAutoBackups().slice(0, safeLimit);
    writeAutoBackups(backups);
    return backups;
  }

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function snapshotHasData(snapshot) {
    return Boolean(snapshot && snapshot.data && typeof snapshot.data === "object" && Object.keys(snapshot.data).length);
  }

  function snapshotFingerprint(snapshot) {
    try {
      return JSON.stringify(snapshot && snapshot.data ? snapshot.data : {});
    } catch (error) {
      return "";
    }
  }

  function toBackupFileStamp(value = new Date()) {
    const date = value instanceof Date ? value : new Date(value);
    const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
    const pad = (number) => String(number).padStart(2, "0");
    return [
      safeDate.getFullYear(),
      pad(safeDate.getMonth() + 1),
      pad(safeDate.getDate()),
      "-",
      pad(safeDate.getHours()),
      pad(safeDate.getMinutes()),
      pad(safeDate.getSeconds())
    ].join("");
  }

  function safeBackupFileName(backup) {
    const rawId = String(backup && backup.id ? backup.id : "").replace(/^backup-/, "");
    const safeId = rawId.replace(/[^0-9A-Za-z_-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
    const stamp = safeId || toBackupFileStamp(backup && backup.createdAt ? backup.createdAt : new Date());
    return `character-prompt-composer-backup-${stamp}.json`;
  }

  function buildBackupExportPayload(backup) {
    const safeBackup = normalizeBackup(backup);
    const snapshot = safeBackup ? safeBackup.snapshot : readUnifiedStorage();
    const createdAt = safeBackup ? safeBackup.createdAt : new Date().toISOString();
    return {
      version: 1,
      app: "character-prompt-composer",
      kind: "auto-backup",
      exportedAt: new Date().toISOString(),
      data: cloneJson(snapshot.data || {}),
      backup: {
        id: safeBackup ? safeBackup.id : `backup-${toBackupFileStamp(createdAt)}`,
        createdAt,
        reason: safeBackup ? safeBackup.reason : "manual-export",
        snapshot: cloneJson(snapshot)
      }
    };
  }

  function requestExternalBackupFile(backup) {
    try {
      const bridge = window.chrome && window.chrome.webview;
      if (!bridge || typeof bridge.postMessage !== "function") {
        return false;
      }
      const payload = buildBackupExportPayload(backup);
      bridge.postMessage({
        type: "character-prompt-composer:auto-backup-file",
        folder: externalBackupFolderHint,
        fileName: safeBackupFileName(backup),
        payload: JSON.stringify(payload, null, 2)
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  function createAutoBackup(snapshot, options = {}) {
    const settings = readAutoBackupSettings();
    const force = options.force === true;
    if (!settings.enabled && !force) {
      return null;
    }

    const safeSnapshot = {
      version: snapshot && snapshot.version ? snapshot.version : 10,
      updatedAt: snapshot && snapshot.updatedAt ? snapshot.updatedAt : new Date().toISOString(),
      data: snapshot && snapshot.data && typeof snapshot.data === "object" ? cloneJson(snapshot.data) : {}
    };
    if (!snapshotHasData(safeSnapshot)) {
      return null;
    }

    const now = new Date();
    const createdAt = now.toISOString();
    const backups = readAutoBackups();
    const latest = backups[0];
    const currentFingerprint = snapshotFingerprint(safeSnapshot);
    const latestFingerprint = latest ? snapshotFingerprint(latest.snapshot) : "";

    if (!force && latest && latestFingerprint === currentFingerprint) {
      return latest;
    }

    let nextBackup = {
      id: `backup-${toBackupFileStamp(now)}-${Math.random().toString(16).slice(2, 8)}`,
      createdAt,
      reason: options.reason || "auto",
      snapshot: safeSnapshot
    };

    let nextBackups;
    const latestTime = latest ? Date.parse(latest.createdAt || "") : 0;
    const canRollIntoLatest = !force
      && latest
      && latest.reason === "auto"
      && latestTime
      && now.getTime() - latestTime < autoBackupMinIntervalMs;

    if (canRollIntoLatest) {
      nextBackup = {
        ...latest,
        createdAt,
        reason: "auto",
        snapshot: safeSnapshot
      };
      nextBackups = [nextBackup, ...backups.slice(1)];
    } else {
      nextBackups = [nextBackup, ...backups.filter((item) => item && item.id !== nextBackup.id)];
    }

    nextBackups = nextBackups.slice(0, settings.limit);
    if (writeAutoBackups(nextBackups)) {
      requestExternalBackupFile(nextBackup);
      return nextBackup;
    }
    return null;
  }

  function deleteAutoBackup(id) {
    const targetId = String(id || "");
    const backups = readAutoBackups().filter((backup) => backup.id !== targetId);
    writeAutoBackups(backups);
    return backups;
  }

  function restoreAutoBackup(id) {
    const targetId = String(id || "");
    const backup = readAutoBackups().find((item) => item.id === targetId);
    if (!backup) {
      return false;
    }
    try {
      const snapshot = {
        version: backup.snapshot.version || 10,
        updatedAt: new Date().toISOString(),
        data: cloneJson(backup.snapshot.data || {})
      };
      localStorage.setItem(unifiedStorageKey, JSON.stringify(snapshot));
      knownMirroredStorageKeys.forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(snapshot.data, key)) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(snapshot.data || {}).forEach((key) => {
        localStorage.setItem(key, JSON.stringify(snapshot.data[key]));
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  function writeUnifiedStorage(key, value) {
    try {
      const current = readUnifiedStorage();
      const next = {
        version: 10,
        updatedAt: new Date().toISOString(),
        data: {
          ...current.data,
          [key]: value
        }
      };
      localStorage.setItem(unifiedStorageKey, JSON.stringify(next));
      createAutoBackup(next);
    } catch (error) {
      return;
    }
  }

  function readJson(key, fallback) {
    try {
      const unified = readUnifiedStorage();
      if (Object.prototype.hasOwnProperty.call(unified.data, key)) {
        return unified.data[key];
      }

      const value = localStorage.getItem(key);
      if (value) {
        const parsed = JSON.parse(value);
        writeUnifiedStorage(key, parsed);
        return parsed;
      }
    } catch (error) {
      return fallback;
    }
    return fallback;
  }

  function readNumber(key, fallback) {
    const value = Number.parseInt(localStorage.getItem(key) || "", 10);
    return Number.isFinite(value) ? value : fallback;
  }

  function writeJson(key, value) {
    writeUnifiedStorage(key, value);

    // Keep legacy per-feature keys mirrored for one transition cycle.
    // This makes v7 safe to downgrade or test beside older exports.
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      return;
    }
  }

  window.PC_STORAGE = {
    unifiedStorageKey,
    autoBackupStorageKey,
    autoBackupSettingsKey,
    externalBackupFolderHint,
    knownMirroredStorageKeys,
    readUnifiedStorage,
    writeUnifiedStorage,
    createAutoBackup,
    readAutoBackups,
    deleteAutoBackup,
    restoreAutoBackup,
    readAutoBackupSettings,
    writeAutoBackupSettings,
    buildBackupExportPayload,
    requestExternalBackupFile,
    toBackupFileStamp,
    safeBackupFileName,
    readJson,
    readNumber,
    writeJson
  };
})();
