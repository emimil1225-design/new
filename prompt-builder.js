(() => {
  "use strict";

  function ctx() {
    return window.PC_APP_CONTEXT || {};
  }

  function compact(...args) {
    return ctx().compact(...args);
  }

  function getSelectedCharacter(...args) {
    return ctx().getSelectedCharacter(...args);
  }

  function getSelectedWorld(...args) {
    return ctx().getSelectedWorld(...args);
  }

  function getCharacterWorld(...args) {
    return ctx().getCharacterWorld(...args);
  }

  const el = new Proxy({}, {
    get(_target, prop) {
      return ctx().el ? ctx().el[prop] : undefined;
    }
  });

  const state = new Proxy({}, {
    get(_target, prop) {
      return ctx().state ? ctx().state[prop] : undefined;
    }
  });

  function requiredInstructions() {
        return [
          "# 필수 출력 지시",
          "## 상단부 가장 첫 번째 줄에는 반드시 [날짜(요일)|시간|날씨|장소] 형식을 표기한다.",
          "## 상단 두 번째 줄에는 아래 양식의 시작과 끝을 ```로 감싸 출력한다.",
          "[양식]",
          "- (한 줄 생각):",
          "- 요약:",
          "",
          "## 대화 시간이 자연스럽게 흐르게 한다.",
          "## 문자, 센터 알림, 긴급 호출, 시스템 메시지는 [] 안에 표기한다.",
          "## 묘사는 {{char}} 시점으로 서술하고 {{user}}를 항상 '당신'이라고 지칭한다.",
          "## {{user}}의 대사, 행동, 감정, 선택을 상상해서 적지 않는다.",
          "## {{user}}가 말하지 않은 대사를 대신 작성하지 않는다."
        ].join("\n");
      }

  function openingRules() {
        return [
          "# 도입부 규칙",
          "- 모든 도입부에서 {{char}}와 {{user}}는 초면이다.",
          "## 도입부 1번",
          "## 도입부 2번",
          "## 도입부 3번"
        ].join("\n");
      }

  function formatAttributeLines(character) {
        return character.attributes
          .filter((attribute) => attribute.includeInPrompt !== false)
          .filter((attribute) => attribute.label || attribute.value)
          .map((attribute) => `# ${attribute.label || "속성"}: ${attribute.value || ""}`);
      }

  function buildCharacterPrompt(character = getSelectedCharacter()) {
        return [
          requiredInstructions(),
          "",
          openingRules(),
          "",
          "# 캐릭터 기본 정보",
          `# 이름: ${character.name || ""}`,
          `# 나이: ${character.age || ""}`,
          `# 직업: ${character.job || ""}`,
          `# 외형: ${character.appearance || ""}`,
          `# 성격: ${character.personality || ""}`,
          `# 말투: ${character.speech || ""}`,
          ...formatAttributeLines(character)
        ].join("\n");
      }

  function buildCharacterIntroPrompt(character = getSelectedCharacter()) {
        return [
          "[]",
          "",
          "",
          "💠 기본 정보",
          `이름: ${character.name || ""}`,
          `나이: ${character.age || ""}`,
          `외형: ${character.appearance || ""}`,
          `직업: ${character.job || ""}`,
          "",
          "",
          "",
          "💠 성격",
          character.personality || "",
          "",
          "",
          "",
          "💠 {{user}}의 고정 설정",
          "",
          "",
          "",
          "X",
          "",
          "",
          "",
          "",
          "",
          "",
          "----",
          "",
          "",
          "",
          "‼️명령어",
          "* [] 안에 내용을 입력하면 문자를 보낼 수 있습니다.",
          "",
          "",
          "",
          "✨"
        ].join("\n");
      }

  function buildWorldPrompt(world = getCharacterWorld()) {
        return [
          "# 세계관 프롬프트",
          `# 세계관명: ${world.name || ""}`,
          `# 세계관 설명: ${world.summary || ""}`,
          `# 유지 규칙: ${world.rules || ""}`
        ].join("\n");
      }

  function buildWorldIntroPrompt(world = getCharacterWorld()) {
        return [
          "[]",
          "",
          `✨ 세계관 이름: ${world.name || ""}`,
          `✨ 세계관 설명: ${world.summary || ""}`,
          "",
          "",
          ""
        ].join("\n");
      }

  function buildNijiPrompt(character = getSelectedCharacter(), world = null, scene = null) {
        const fixedTop = "masterpiece, best quality, ultra-detailed, semi-realistic illustration, high-end Korean editorial style, guideverse fantasy sci-fi mood, 1boy, handsome young male guide, tall build, broad shoulders, slim but balanced physique, refined small face, smooth sharp jawline, narrow V-line face,";
        const fixedBottom = "--no text, logo, title, letters, watermark, signature --chaos 6 --ar 9:16 --niji 7 --profile fo255ny";
        const sceneParts = scene ? [
          `scene: ${scene.scene}`
        ] : [];
        return [
          "아래 내용을 참고해서 니지저니에 넣을 프롬프트를 영어로 작성해줘.",
          "",
          `${compact([
            fixedTop,
            character.appearance,
            ...sceneParts
          ], " ")} ${fixedBottom}`
        ].join("\n");
      }

  function buildChatGptImagePrompt(character = getSelectedCharacter(), world = null, scene = null) {
        return [
          "아래 정보를 바탕으로 이미지 생성용 프롬프트를 정리해줘. 캐릭터의 핵심 외형과 분위기를 최우선으로 유지해줘.",
          "",
          "[캐릭터]",
          `이름: ${character.name || ""}`,
          `나이: ${character.age || ""}`,
          `직업: ${character.job || ""}`,
          `외형: ${character.appearance || ""}`,
          `성격: ${character.personality || ""}`,
          `말투/분위기: ${character.speech || ""}`
        ].join("\n");
      }

  function buildPrompt(variant = state.promptVariant) {
        const character = getSelectedCharacter();
        const selectedWorld = getSelectedWorld();
        if (variant === "characterIntro") {
          return buildCharacterIntroPrompt(character);
        }
        if (variant === "world") {
          return buildWorldPrompt(selectedWorld);
        }
        if (variant === "worldIntro") {
          return buildWorldIntroPrompt(selectedWorld);
        }
        if (variant === "niji") {
          return buildNijiPrompt(character);
        }
        if (variant === "chatgpt") {
          return buildChatGptImagePrompt(character);
        }
        return buildCharacterPrompt(character);
      }

  window.PC_PROMPT_BUILDER = {
    buildPrompt,
    buildNijiPrompt,
    buildChatGptImagePrompt
  };
})();
