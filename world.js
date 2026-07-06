(() => {
  "use strict";

  function create(api) {
    const {
      state,
      el,
      worldInputs,
      createId,
      escapeHtml,
      compact,
      normalizeWorld,
      saveWorlds,
      saveCharacters,
      getSelectedWorld,
      pushDeletedItem,
      showToast
    } = api;
    const renderAll = (...args) => api.renderAll(...args);
    const renderPrompt = (...args) => api.renderPrompt(...args);
    const renderCharacterEditor = (...args) => api.renderCharacterEditor(...args);
    const renderCharacters = (...args) => api.renderCharacters(...args);

      function renderWorldLibrary() {
        const world = getSelectedWorld();
        el.worldSelect.innerHTML = "";
        state.worlds.forEach((item) => {
          const option = document.createElement("option");
          option.value = item.id;
          option.textContent = item.name || "이름 없는 세계관";
          el.worldSelect.appendChild(option);
        });
        el.worldSelect.value = world.id;
        el.worldCount.textContent = `${state.worlds.length}개 저장`;
        el.worldName.value = world.name || "";
        el.worldGenre.value = world.genre || "";
        el.worldSummary.value = world.summary || "";
        el.worldRules.value = world.rules || "";
        renderWorldKeywordPicker(world);
        el.deleteWorldButton.disabled = state.worlds.length <= 1;
      }

      function renderWorldKeywordPicker(world = getSelectedWorld()) {
        const validKeywordIds = new Set(state.keywords.map((keyword) => keyword.id));
        world.keywordIds = (world.keywordIds || [])
          .filter((id) => validKeywordIds.has(id))
          .slice(0, 5);

        const selectedIds = new Set(world.keywordIds);
        const selectedCount = selectedIds.size;
        el.worldKeywordCount.textContent = `${selectedCount} / 5`;
        el.worldKeywordPicker.innerHTML = "";

        if (!state.keywords.length) {
          el.worldKeywordPicker.innerHTML = `<div class="empty cute-empty small"><strong>키워드북이 비어 있어요 🐰</strong><span>세계관에 연결할 키워드를 먼저 만들어보세요.</span></div>`;
          return;
        }

        state.keywords.forEach((keyword) => {
          const selected = selectedIds.has(keyword.id);
          const button = document.createElement("button");
          button.type = "button";
          button.className = `world-keyword-button${selected ? " active" : ""}`;
          button.dataset.worldKeywordId = keyword.id;
          button.textContent = keyword.title || "이름 없는 키워드";
          button.title = compact([
            keyword.title || "이름 없는 키워드",
            keyword.triggers ? `트리거: ${keyword.triggers}` : ""
          ], " · ");
          button.setAttribute("aria-pressed", selected ? "true" : "false");
          button.disabled = !selected && selectedCount >= 5;
          el.worldKeywordPicker.appendChild(button);
        });
      }



      function addWorld() {
        const world = normalizeWorld({ id: createId("world"), name: "새 세계관" });
        state.worlds.push(world);
        state.selectedWorldId = world.id;
        saveWorlds();
        renderWorldLibrary();
        renderCharacterEditor();
        renderPrompt();
        window.PC_SHARED.focusWithoutScroll(el.worldName, { select: true });
        showToast("세계관 추가됨");
      }

      function deleteWorld() {
        if (state.worlds.length <= 1) {
          showToast("최소 1개는 필요해요");
          return;
        }
        const deletedWorld = getSelectedWorld();
        const deletedIndex = state.worlds.findIndex((world) => world.id === deletedWorld.id);
        pushDeletedItem({
          type: "world",
          item: deletedWorld,
          index: deletedIndex,
          links: {
            characters: state.characters
              .filter((character) => character.worldId === deletedWorld.id)
              .map((character) => ({ id: character.id, worldId: character.worldId }))
          }
        });
        state.worlds = state.worlds.filter((world) => world.id !== state.selectedWorldId);
        state.selectedWorldId = state.worlds[0].id;
        state.characters.forEach((character) => {
          if (!state.worlds.some((world) => world.id === character.worldId)) {
            character.worldId = state.selectedWorldId;
          }
        });
        saveWorlds();
        saveCharacters({ track: false });
        renderAll();
        showToast("세계관을 삭제했어요", { undoDelete: true });
      }



    function bindEvents() {
      el.worldSelect.addEventListener("change", (event) => {
        state.selectedWorldId = event.target.value;
        saveWorlds();
        renderWorldLibrary();
        renderPrompt();
      });

      el.worldKeywordPicker.addEventListener("click", (event) => {
        const button = event.target.closest("[data-world-keyword-id]");
        if (!button) {
          return;
        }

        const world = getSelectedWorld();
        const keywordId = button.dataset.worldKeywordId;
        const selected = world.keywordIds.includes(keywordId);

        if (selected) {
          world.keywordIds = world.keywordIds.filter((id) => id !== keywordId);
        } else if (world.keywordIds.length < 5) {
          world.keywordIds.push(keywordId);
        } else {
          showToast("키워드는 최대 5개까지 선택할 수 있어요");
          return;
        }

        saveWorlds();
        renderWorldKeywordPicker(world);
      });

      el.addWorldButton.addEventListener("click", addWorld);
      el.deleteWorldButton.addEventListener("click", deleteWorld);

      worldInputs.forEach(([key, input]) => {
        input.addEventListener("input", () => {
          const world = getSelectedWorld();
          world[key] = input.value.trim();
          saveWorlds();
          if (key === "name") {
            const worldOption = Array.from(el.worldSelect.options).find((option) => option.value === world.id);
            const characterWorldOption = Array.from(el.characterWorldSelect.options).find((option) => option.value === world.id);
            if (worldOption) {
              worldOption.textContent = world.name || "이름 없는 세계관";
            }
            if (characterWorldOption) {
              characterWorldOption.textContent = world.name || "이름 없는 세계관";
            }
          }
          renderCharacterEditor();
          renderCharacters();
          renderPrompt();
        });
      });


    }

    return {
      renderWorldLibrary,
      renderWorldKeywordPicker,
      addWorld,
      deleteWorld,
      bindEvents
    };
  }

  window.PC_WORLDS = { create };
})();
