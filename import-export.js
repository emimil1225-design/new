(() => {
  "use strict";

  function create(api) {
    const {
      state,
      el,
      createId,
      normalizeScene,
      normalizeKeyword,
      normalizeWorld,
      normalizeCharacter,
      createBlankCharacter,
      saveScenes,
      saveKeywords,
      saveWorlds,
      saveCharacters,
      saveSceneCategories,
      saveKeywordCategories,
      saveCharacterTags,
      savePromptPresets,
      savePromptHistory,
      getSelectedCharacter,
      getCharacterWorld,
      getTemplateView,
      buildNijiPrompt,
      buildChatGptImagePrompt,
      clearDeletedItems,
      clearActivityHistory,
      showToast,
      renumberScenesByOrder,
      renumberKeywordsByOrder
    } = api;
    const renderAll = (...args) => api.renderAll(...args);

      function normalizeOptionList(value, fallback = []) {
        const source = Array.isArray(value)
          ? value
          : String(value || "")
            .split(",")
            .map((item) => item.trim());
        const list = [];
        source.forEach((item) => {
          const clean = String(item || "").trim();
          if (clean && clean !== "전체" && !list.includes(clean)) {
            list.push(clean);
          }
        });
        if (!list.length && Array.isArray(fallback)) {
          fallback.forEach((item) => {
            const clean = String(item || "").trim();
            if (clean && clean !== "전체" && !list.includes(clean)) {
              list.push(clean);
            }
          });
        }
        return list;
      }

      function collectSceneCategories(scenes) {
        const result = [];
        (scenes || []).forEach((scene) => {
          const values = Array.isArray(scene.categories) && scene.categories.length ? scene.categories : [scene.category];
          normalizeOptionList(values).forEach((category) => {
            if (!result.includes(category)) {
              result.push(category);
            }
          });
        });
        return result;
      }

      function collectKeywordCategories(keywords) {
        const result = [];
        (keywords || []).forEach((keyword) => {
          const values = Array.isArray(keyword.categories) && keyword.categories.length ? keyword.categories : [keyword.category];
          normalizeOptionList(values, ["캐릭터"]).forEach((category) => {
            if (!result.includes(category)) {
              result.push(category);
            }
          });
        });
        return result;
      }

      function collectCharacterTags(characters) {
        const result = [];
        (characters || []).forEach((character) => {
          normalizeOptionList(character.tags).forEach((tag) => {
            if (!result.includes(tag)) {
              result.push(tag);
            }
          });
        });
        return result;
      }

      function csvEscape(value) {
        return `"${String(value || "").replace(/"/g, '""')}"`;
      }

      function exportCsv() {
        const character = getSelectedCharacter();
        const world = getCharacterWorld(character);
        const rows = [["character", "world", "scene_id", "scene", "niji_prompt", "chatgpt_prompt"]];
        state.scenes.forEach((template) => {
          const scene = getTemplateView(template.id);
          rows.push([
            character.name,
            world.name,
            scene.id,
            scene.title,
            buildNijiPrompt(character, world, scene),
            buildChatGptImagePrompt(character, world, scene)
          ]);
        });
        const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
        const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${character.name || "character"}_image_prompts.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        showToast("CSV 저장됨");
      }

      function safeFileName(value) {
        return String(value || "library")
          .trim()
          .replace(/[\\/:*?"<>|]+/g, "-")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") || "library";
      }

      function exportLibraryJson() {
        const payload = {
          version: 12,
          exportedAt: new Date().toISOString(),
          app: "character-prompt-composer-scene-v12",
          data: {
            scenes: state.scenes,
            sceneCategories: state.sceneCategories || collectSceneCategories(state.scenes),
            keywords: state.keywords,
            keywordCategories: state.keywordCategories || collectKeywordCategories(state.keywords),
            characters: state.characters,
            characterTags: state.characterTags || collectCharacterTags(state.characters),
            worlds: state.worlds
          }
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const stamp = new Date().toISOString().slice(0, 10);
        link.href = url;
        link.download = `${safeFileName("prompt-composer-library")}-${stamp}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        showToast("현재 데이터 저장됨");
      }

      function applyImportedLibrary(payload) {
        const data = payload && payload.data ? payload.data : payload;
        if (!data || typeof data !== "object") {
          throw new Error("invalid-library");
        }

        const nextScenes = Array.isArray(data.scenes) ? data.scenes.map(normalizeScene) : state.scenes;
        const nextKeywords = Array.isArray(data.keywords) ? data.keywords.map(normalizeKeyword) : state.keywords;
        const nextWorlds = Array.isArray(data.worlds) ? data.worlds.map(normalizeWorld) : state.worlds;
        const fallbackWorldId = nextWorlds[0] ? nextWorlds[0].id : createId("world");
        const nextCharacters = Array.isArray(data.characters)
          ? data.characters.map(normalizeCharacter)
          : state.characters;
        const nextSceneCategories = normalizeOptionList(data.sceneCategories, collectSceneCategories(nextScenes));
        const nextKeywordCategories = normalizeOptionList(data.keywordCategories, collectKeywordCategories(nextKeywords));
        const nextCharacterTags = normalizeOptionList(data.characterTags, collectCharacterTags(nextCharacters));

        state.scenes = nextScenes.length ? nextScenes : [normalizeScene()];
        state.keywords = nextKeywords.length ? nextKeywords : [normalizeKeyword()];
        state.worlds = nextWorlds.length ? nextWorlds : [normalizeWorld({ id: fallbackWorldId, name: "새 세계관" })];
        state.characters = nextCharacters.length ? nextCharacters : [createBlankCharacter(state.worlds[0].id)];
        state.promptPresets = [];
        state.promptHistory = [];
        const importedSceneCategories = nextSceneCategories.length ? nextSceneCategories : collectSceneCategories(state.scenes);
        const importedKeywordCategories = nextKeywordCategories.length ? nextKeywordCategories : collectKeywordCategories(state.keywords);
        const importedCharacterTags = nextCharacterTags.length ? nextCharacterTags : collectCharacterTags(state.characters);
        if (Array.isArray(state.sceneCategories)) {
          state.sceneCategories.splice(0, state.sceneCategories.length, ...importedSceneCategories);
        } else {
          state.sceneCategories = importedSceneCategories;
        }
        if (Array.isArray(state.keywordCategories)) {
          state.keywordCategories.splice(0, state.keywordCategories.length, ...importedKeywordCategories);
        } else {
          state.keywordCategories = importedKeywordCategories;
        }
        if (Array.isArray(state.characterTags)) {
          state.characterTags.splice(0, state.characterTags.length, ...importedCharacterTags);
        } else {
          state.characterTags = importedCharacterTags;
        }

        state.selectedWorldId = state.worlds[0].id;
        state.selectedCharacterId = state.characters[0].id;
        state.activeSceneId = "";
        state.activeKeywordId = "";
        state.sceneCategory = "전체";
        state.sceneQuery = "";
        state.keywordCategory = "전체";
        state.keywordQuery = "";
        state.characterQuery = "";
        state.tagFilter = "전체";

        state.characters.forEach((character) => {
          if (!state.worlds.some((world) => world.id === character.worldId)) {
            character.worldId = state.selectedWorldId;
          }
        });

        if (typeof renumberScenesByOrder === "function") {
          renumberScenesByOrder();
        }
        if (typeof renumberKeywordsByOrder === "function") {
          renumberKeywordsByOrder();
        }
        const mergedSceneCategories = normalizeOptionList(state.sceneCategories, collectSceneCategories(state.scenes));
        const mergedKeywordCategories = normalizeOptionList(state.keywordCategories, collectKeywordCategories(state.keywords));
        const mergedCharacterTags = normalizeOptionList(state.characterTags, collectCharacterTags(state.characters));
        if (Array.isArray(state.sceneCategories)) {
          state.sceneCategories.splice(0, state.sceneCategories.length, ...mergedSceneCategories);
        } else {
          state.sceneCategories = mergedSceneCategories;
        }
        if (Array.isArray(state.keywordCategories)) {
          state.keywordCategories.splice(0, state.keywordCategories.length, ...mergedKeywordCategories);
        } else {
          state.keywordCategories = mergedKeywordCategories;
        }
        if (Array.isArray(state.characterTags)) {
          state.characterTags.splice(0, state.characterTags.length, ...mergedCharacterTags);
        } else {
          state.characterTags = mergedCharacterTags;
        }

        if (typeof saveSceneCategories === "function") {
          saveSceneCategories();
        }
        if (typeof saveKeywordCategories === "function") {
          saveKeywordCategories();
        }
        if (typeof saveCharacterTags === "function") {
          saveCharacterTags();
        }
        saveScenes({ track: false });
        saveKeywords({ track: false });
        saveWorlds({ track: false });
        saveCharacters({ track: false });
        if (typeof clearActivityHistory === "function") {
          clearActivityHistory();
        } else if (typeof clearDeletedItems === "function") {
          clearDeletedItems();
        }
        renderAll();
      }

      function importLibraryJson(file) {
        if (!file) {
          return;
        }
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          try {
            const payload = JSON.parse(String(reader.result || "{}"));
            applyImportedLibrary(payload);
            showToast("데이터 불러옴");
          } catch (error) {
            showToast("불러오기 실패");
          } finally {
            el.libraryImportInput.value = "";
          }
        });
        reader.addEventListener("error", () => {
          el.libraryImportInput.value = "";
          showToast("불러오기 실패");
        });
        reader.readAsText(file, "utf-8");
      }



    function closeExportMenu() {
      if (!el.exportButton || !el.exportMenu) {
        return;
      }
      el.exportMenu.hidden = true;
      el.exportButton.setAttribute("aria-expanded", "false");
    }

    function openExportMenu() {
      if (!el.exportButton || !el.exportMenu) {
        return;
      }
      el.exportMenu.hidden = false;
      el.exportButton.setAttribute("aria-expanded", "true");
      const firstItem = el.exportMenu.querySelector(".export-menu-item");
      if (firstItem) {
        window.setTimeout(() => firstItem.focus(), 0);
      }
    }

    function toggleExportMenu() {
      if (!el.exportMenu || el.exportMenu.hidden) {
        openExportMenu();
      } else {
        closeExportMenu();
      }
    }

    function bindExportMenuItem(button, action) {
      if (!button) {
        return;
      }
      button.addEventListener("click", () => {
        closeExportMenu();
        action();
      });
    }

    function bindEvents() {
      if (el.exportButton && el.exportMenu) {
        el.exportButton.addEventListener("click", (event) => {
          event.stopPropagation();
          toggleExportMenu();
        });
        el.exportButton.addEventListener("keydown", (event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openExportMenu();
          }
        });
        el.exportMenu.addEventListener("click", (event) => event.stopPropagation());
        document.addEventListener("click", closeExportMenu);
        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape") {
            const wasOpen = el.exportMenu && !el.exportMenu.hidden;
            closeExportMenu();
            if (wasOpen) {
              el.exportButton.focus();
            }
          }
        });
        bindExportMenuItem(el.promptCsvExportButton, exportCsv);
      } else if (el.exportButton) {
        el.exportButton.addEventListener("click", exportCsv);
      }

      if (el.libraryExportButton) {
        bindExportMenuItem(el.libraryExportButton, exportLibraryJson);
      }
      if (el.libraryImportButton) {
        bindExportMenuItem(el.libraryImportButton, () => el.libraryImportInput.click());
      }
      el.libraryImportInput.addEventListener("change", (event) => {
        importLibraryJson(event.target.files && event.target.files[0]);
      });

    }

    return {
      exportCsv,
      exportLibraryJson,
      applyImportedLibrary,
      importLibraryJson,
      bindEvents
    };
  }

  window.PC_IMPORT_EXPORT = { create };
})();
