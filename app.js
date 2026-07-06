const templates = [
      {
        id: "ST-001",
        title: "기본 프로필",
        category: "대표",
        scene: "캐릭터가 자신의 세계관을 상징하는 배경 앞에 서 있음",
      },
      {
        id: "ST-002",
        title: "첫 만남",
        category: "대표",
        scene: "캐릭터가 유저를 처음 발견하고 시선을 맞춤",
      },
      {
        id: "ST-003",
        title: "평소 대화",
        category: "대표",
        scene: "캐릭터가 편안한 자세로 대화 중",
      },
      {
        id: "ST-004",
        title: "미소",
        category: "관계",
        scene: "캐릭터가 유저를 바라보며 미소 짓는 순간",
      },
      {
        id: "ST-005",
        title: "장난스러운 반응",
        category: "관계",
        scene: "캐릭터가 살짝 몸을 기울이며 장난스럽게 반응",
      },
      {
        id: "ST-006",
        title: "당황",
        category: "관계",
        scene: "캐릭터가 말문이 막히거나 시선을 피함",
      },
      {
        id: "ST-007",
        title: "삐짐",
        category: "관계",
        scene: "캐릭터가 팔짱을 끼거나 시선을 돌림",
      },
      {
        id: "ST-008",
        title: "질투",
        category: "관계",
        scene: "캐릭터가 감정을 숨기려 하지만 눈빛에 드러남",
      },
      {
        id: "ST-009",
        title: "걱정",
        category: "관계",
        scene: "캐릭터가 유저를 살피며 다가옴",
      },
      {
        id: "ST-010",
        title: "위로",
        category: "관계",
        scene: "캐릭터가 조용히 곁에 앉아 있거나 손을 내밈",
      },
      {
        id: "ST-011",
        title: "비밀 고백",
        category: "서사",
        scene: "캐릭터가 낮은 목소리로 비밀을 털어놓는 분위기",
      },
      {
        id: "ST-012",
        title: "고백 직전",
        category: "관계",
        scene: "캐릭터가 말을 꺼내기 전 잠시 숨을 고름",
      },
      {
        id: "ST-013",
        title: "데이트 약속",
        category: "일상",
        scene: "캐릭터가 약속 장소에서 기다림",
      },
      {
        id: "ST-014",
        title: "카페",
        category: "일상",
        scene: "캐릭터가 테이블에 앉아 음료를 앞에 둠",
      },
      {
        id: "ST-015",
        title: "밤 산책",
        category: "일상",
        scene: "캐릭터가 밤거리나 공원에서 함께 걷는 듯한 순간",
      },
      {
        id: "ST-016",
        title: "비 오는 거리",
        category: "서사",
        scene: "캐릭터가 우산을 들거나 비를 맞으며 서 있음",
      },
      {
        id: "ST-017",
        title: "잠들기 전",
        category: "일상",
        scene: "캐릭터가 침대 옆, 창가, 조용한 방 안에 있음",
      },
      {
        id: "ST-018",
        title: "일하는 모습",
        category: "대표",
        scene: "캐릭터가 자신의 직업/역할에 맞는 일을 수행",
      },
      {
        id: "ST-019",
        title: "집중",
        category: "대표",
        scene: "캐릭터가 책, 화면, 지도, 도구를 보며 집중",
      },
      {
        id: "ST-020",
        title: "화남",
        category: "갈등",
        scene: "캐릭터가 감정을 억누르거나 차갑게 노려봄",
      },
      {
        id: "ST-021",
        title: "대립",
        category: "갈등",
        scene: "캐릭터가 보이지 않는 상대와 대치",
      },
      {
        id: "ST-022",
        title: "위험한 순간",
        category: "갈등",
        scene: "캐릭터가 위험을 감지하고 즉시 움직이려는 찰나",
      },
      {
        id: "ST-023",
        title: "상처 입은 후",
        category: "갈등",
        scene: "캐릭터가 가벼운 상처나 흐트러진 모습으로 앉아 있음",
      },
      {
        id: "ST-024",
        title: "엔딩/여운",
        category: "서사",
        scene: "캐릭터가 뒤돌아보거나 먼 곳을 바라봄",
      },
      {
        id: "ST-025",
        title: "아침 인사",
        category: "일상",
        scene: "캐릭터가 아침 햇살 속에서 하루를 시작함",
      },
      {
        id: "ST-026",
        title: "늦은 밤 연락",
        category: "관계",
        scene: "캐릭터가 어두운 방에서 화면을 보며 답장을 고민함",
      },
      {
        id: "ST-027",
        title: "선물 받음",
        category: "관계",
        scene: "캐릭터가 작은 선물이나 꽃, 편지를 받음",
      },
      {
        id: "ST-028",
        title: "선물 준비",
        category: "관계",
        scene: "캐릭터가 유저를 위해 무언가를 준비함",
      },
      {
        id: "ST-029",
        title: "사과",
        category: "관계",
        scene: "캐릭터가 진심으로 미안해하며 시선을 낮춤",
      },
      {
        id: "ST-030",
        title: "화해",
        category: "관계",
        scene: "캐릭터가 조심스럽게 다가와 관계를 회복하려 함",
      },
      {
        id: "ST-031",
        title: "약속을 어김",
        category: "서사",
        scene: "캐릭터가 약속 장소에서 늦게 도착하거나 변명하지 못함",
      },
      {
        id: "ST-032",
        title: "기다림",
        category: "일상",
        scene: "캐릭터가 한 장소에서 유저를 기다림",
      },
      {
        id: "ST-033",
        title: "재회",
        category: "서사",
        scene: "오랜만에 만난 순간, 캐릭터가 멈춰 섬",
      },
      {
        id: "ST-034",
        title: "이별 직전",
        category: "서사",
        scene: "캐릭터가 떠나기 전 마지막으로 돌아봄",
      },
      {
        id: "ST-035",
        title: "질투를 숨김",
        category: "관계",
        scene: "캐릭터가 아무렇지 않은 척하지만 손이나 시선에 감정이 드러남",
      },
      {
        id: "ST-036",
        title: "보호",
        category: "갈등",
        scene: "캐릭터가 유저 앞을 막아서며 보호하는 포즈",
      },
      {
        id: "ST-037",
        title: "비밀 임무",
        category: "서사",
        scene: "캐릭터가 임무를 수행하기 전 장비를 확인함",
      },
      {
        id: "ST-038",
        title: "변장/외출복",
        category: "일상",
        scene: "캐릭터가 평소와 다른 외출복 또는 변장 차림",
      },
      {
        id: "ST-039",
        title: "휴식",
        category: "일상",
        scene: "캐릭터가 일을 멈추고 조용히 쉬는 순간",
      },
      {
        id: "ST-040",
        title: "취미",
        category: "일상",
        scene: "캐릭터가 취미 활동을 즐김",
      },
      {
        id: "ST-041",
        title: "음식",
        category: "일상",
        scene: "캐릭터가 좋아하는 음식을 앞에 두고 반응함",
      },
      {
        id: "ST-042",
        title: "술자리/바",
        category: "일상",
        scene: "캐릭터가 바 또는 조용한 술자리에서 대화함",
      },
      {
        id: "ST-043",
        title: "축제/이벤트",
        category: "이벤트",
        scene: "캐릭터가 축제, 파티, 행사장에 있음",
      },
      {
        id: "ST-044",
        title: "계절 한정: 봄",
        category: "계절",
        scene: "꽃잎이 흩날리는 길 또는 창가",
      },
      {
        id: "ST-045",
        title: "계절 한정: 여름",
        category: "계절",
        scene: "강한 햇빛, 바람, 물가 또는 도시 여름",
      },
      {
        id: "ST-046",
        title: "계절 한정: 가을",
        category: "계절",
        scene: "낙엽, 서점, 캠퍼스, 조용한 거리",
      },
      {
        id: "ST-047",
        title: "계절 한정: 겨울",
        category: "계절",
        scene: "눈 내리는 거리, 따뜻한 실내, 입김",
      },
      {
        id: "ST-048",
        title: "생일",
        category: "이벤트",
        scene: "캐릭터가 케이크, 선물, 작은 장식 앞에 있음",
      },
      {
        id: "ST-049",
        title: "기념일",
        category: "이벤트",
        scene: "캐릭터가 특별한 장소에서 조용히 기념일을 맞음",
      },
      {
        id: "ST-050",
        title: "악몽/불안",
        category: "갈등",
        scene: "캐릭터가 어두운 방이나 꿈 같은 공간에서 불안을 느낌",
      },
      {
        id: "ST-051",
        title: "회상",
        category: "서사",
        scene: "캐릭터가 과거의 장소나 물건을 바라봄",
      },
      {
        id: "ST-052",
        title: "각성",
        category: "갈등",
        scene: "캐릭터가 중요한 능력이나 결심을 드러냄",
      },
      {
        id: "ST-053",
        title: "승리 후",
        category: "갈등",
        scene: "사건이 끝난 뒤 캐릭터가 숨을 고름",
      },
      {
        id: "ST-054",
        title: "패배 후",
        category: "갈등",
        scene: "캐릭터가 실패 후 다시 일어나려 함",
      },
      {
        id: "ST-055",
        title: "비밀 장소",
        category: "서사",
        scene: "캐릭터가 자신만 아는 장소로 유저를 데려온 듯한 순간",
      },
      {
        id: "ST-056",
        title: "금지된 장소",
        category: "서사",
        scene: "캐릭터가 들어가면 안 되는 장소 앞에서 망설임",
      },
      {
        id: "ST-057",
        title: "편지/메시지",
        category: "관계",
        scene: "캐릭터가 편지나 메시지를 읽거나 쓰는 중",
      },
      {
        id: "ST-058",
        title: "선택의 순간",
        category: "서사",
        scene: "캐릭터가 중요한 결정을 앞두고 멈춰 섬",
      },
      {
        id: "ST-059",
        title: "약한 모습",
        category: "관계",
        scene: "캐릭터가 평소와 달리 방어를 내려놓은 순간",
      },
      {
        id: "ST-060",
        title: "다시 웃음",
        category: "관계",
        scene: "힘든 장면 이후 캐릭터가 작게 웃음",
      }
    ];

    const categories = ["전체", "대표", "관계", "일상", "서사", "갈등", "이벤트", "계절"];
    const defaultWorlds = [
      {
        id: "world-occult-city",
        name: "현대 오컬트 도시",
        summary: "현대 대도시의 일상 아래에 영혼, 저주, 비밀 조직이 숨어 있는 세계. 초자연 현상은 드물지만 실제로 존재하며, 대부분의 사람은 그 실체를 모른다.\n현대 도시 판타지, 미스터리, 차분한 긴장감\n비 오는 골목, 네온 반사광, 오래된 건물, 부적, 검은 코트, 흐린 밤하늘, 낮은 채도의 도시 조명",
        rules: "현대 기술과 오컬트 요소가 함께 존재한다. 마법은 과하게 화려하기보다 은밀하고 의식적인 느낌으로 표현한다.",
      },
      {
        id: "world-academy-fantasy",
        name: "마법 아카데미",
        summary: "마법 재능을 가진 학생들이 거대한 아카데미에서 수업, 시험, 결투, 금지된 연구를 겪는 세계. 낭만적인 학원 분위기 안에 오래된 비밀이 숨어 있다.\n판타지 학원물, 성장, 경쟁, 비밀\n석조 복도, 도서관, 마법진, 교복, 촛불, 스테인드글라스, 고서, 별빛이 보이는 탑",
        rules: "의상과 소품은 학원 세계관에 맞춘다. 마법 효과는 캐릭터를 가리지 않게 배경이나 손 주변에 절제해서 배치한다.",
      },
      {
        id: "world-cyber-city",
        name: "사이버펑크 기업도시",
        summary: "거대 기업이 도시를 통제하고, 사람들은 증강 기술과 감시 시스템 속에서 살아가는 근미래 세계. 화려한 네온과 차가운 현실이 공존한다.\n근미래 SF, 기업 지배, 느와르\n초고층 빌딩, 홀로그램 간판, 인공 비, 케이블, 금속 질감, 차가운 청록 조명, 좁은 뒷골목",
        rules: "미래 기술은 세련되고 현실감 있게 표현한다. 캐릭터의 핵심 외형과 의상은 네온 조명에 묻히지 않게 유지한다.",
      }
    ];

(() => {
      const sceneHelpers = window.PC_SCENES;
      const sourceTemplates = Array.isArray(window.PC_DATA.sourceTemplates) && window.PC_DATA.sourceTemplates.length
        ? window.PC_DATA.sourceTemplates
        : typeof templates !== "undefined" && Array.isArray(templates) ? templates : [];
      const sourceWorlds = Array.isArray(window.PC_DATA.sourceWorlds) && window.PC_DATA.sourceWorlds.length
        ? window.PC_DATA.sourceWorlds
        : typeof defaultWorlds !== "undefined" && Array.isArray(defaultWorlds) ? defaultWorlds : [];
      const sourceCategories = Array.isArray(window.PC_DATA.sourceCategories) && window.PC_DATA.sourceCategories.length
        ? window.PC_DATA.sourceCategories
        : typeof categories !== "undefined" && Array.isArray(categories) ? categories : ["전체"];
      const storage = {
        worlds: "sceneTemplateWorlds",
        selectedWorld: "sceneTemplateSelectedWorld",
        characters: "sceneTemplateCharacters",
        selectedCharacter: "sceneTemplateSelectedCharacter",
        keywords: "sceneTemplateKeywords",
        selectedKeyword: "sceneTemplateSelectedKeyword",
        scenes: "sceneTemplateScenes",
        selectedScene: "promptComposerSelectedScene",
        deletedItems: "promptComposerDeletedItems",
        modifiedItems: "promptComposerModifiedItems",
        promptDraftsV3: "promptComposerDrafts",
        promptVariant: "promptComposerPromptVariant",
        promptPresets: "promptComposerPromptPresets",
        promptHistory: "promptComposerPromptHistory",
        sceneCategories: "promptComposerSceneCategories",
        keywordCategories: "promptComposerKeywordCategories",
        characterTags: "promptComposerCharacterTags",
        keywordStarterPack: "promptComposerKeywordStarterPack20260624",
        leftPaneWidth: "promptComposerLeftPaneWidth",
        rightPaneWidth: "promptComposerRightPaneWidth",
        sceneKeywordSplitHeight: "promptComposerSceneKeywordSplitHeight",
        keywordSectionHeight: "promptComposerKeywordSectionHeight",
        worldPromptSplitHeight: "promptComposerWorldPromptSplitHeight",
        promptEditorHeight: "promptComposerPromptEditorHeight",
        characterCardColumns: "promptComposerCharacterCardColumns",
        characterEditorCollapsed: "promptComposerCharacterEditorCollapsed"
      };

      const {
        readJson,
        readNumber,
        writeJson,
        readUnifiedStorage,
        writeUnifiedStorage,
        createAutoBackup
      } = window.PC_STORAGE;

      function normalizeOptionList(value, fallback = []) {
        const source = Array.isArray(value)
          ? value
          : String(value || "")
            .split(",")
            .map((item) => item.trim());
        const list = [];
        source.forEach((item) => {
          const clean = String(item || "").trim();
          if (clean && !list.includes(clean)) {
            list.push(clean);
          }
        });
        if (!list.length && Array.isArray(fallback)) {
          fallback.forEach((item) => {
            const clean = String(item || "").trim();
            if (clean && !list.includes(clean)) {
              list.push(clean);
            }
          });
        }
        return list;
      }

      function mergeOptionList(target, values) {
        normalizeOptionList(values).forEach((item) => {
          if (item !== "전체" && !target.includes(item)) {
            target.push(item);
          }
        });
        return target;
      }

      const baseRoleTags = normalizeOptionList(window.PC_DATA.roleTags, ["주인공", "서브", "조력자", "라이벌"]);
      const roleTags = normalizeOptionList(readJson(storage.characterTags, baseRoleTags), baseRoleTags);
      const defaultSceneCategoryOptions = normalizeOptionList(
        sourceCategories.filter((category) => category && category !== "전체"),
        ["대표", "관계", "일상", "서사", "갈등", "이벤트", "계절"]
      );
      const sceneCategoryOptions = normalizeOptionList(readJson(storage.sceneCategories, defaultSceneCategoryOptions), defaultSceneCategoryOptions);
      const defaultKeywordCategoryOptions = ["캐릭터", "세계관"];
      const keywordCategoryOptions = normalizeOptionList(readJson(storage.keywordCategories, defaultKeywordCategoryOptions), defaultKeywordCategoryOptions);

      const defaultKeywordEntries = window.PC_DATA.defaultKeywordEntries;

      const supplementalKeywordEntries = window.PC_DATA.supplementalKeywordEntries;

      const {
        buildPrompt,
        buildNijiPrompt,
        buildChatGptImagePrompt
      } = window.PC_PROMPT_BUILDER;

      function createId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
      }

      function escapeHtml(value) {
        return String(value ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      function compact(parts, separator = ", ") {
        return parts.map((part) => String(part || "").trim()).filter(Boolean).join(separator);
      }

      const normalizeScene = (scene = {}) => sceneHelpers.normalizeScene(scene, createId);

      function normalizeWorld(world = {}) {
        const keywordIds = Array.from(new Set(Array.isArray(world.keywordIds) ? world.keywordIds.filter(Boolean) : [])).slice(0, 5);

        return {
          id: world.id || createId("world"),
          name: world.name || "이름 없는 세계관",
          genre: world.genre || "",
          summary: world.summary || "",
          keywordIds,
          rules: world.rules || ""
        };
      }

      function normalizeKeyword(keyword = {}) {
        const categories = normalizeOptionList(keyword.categories || keyword.category || defaultKeywordCategoryOptions[0], defaultKeywordCategoryOptions);
        return {
          id: keyword.id || createId("keyword"),
          title: keyword.title || keyword.name || "새 키워드",
          triggers: keyword.triggers || keyword.trigger || "",
          content: keyword.content || keyword.body || "",
          category: categories[0] || defaultKeywordCategoryOptions[0],
          categories
        };
      }

      function normalizeAttribute(attribute = {}) {
        return {
          id: attribute.id || createId("attr"),
          label: String(attribute.label || attribute.name || "").trim(),
          value: String(attribute.value || "").trim(),
          includeInPrompt: attribute.includeInPrompt !== false
        };
      }

      function normalizeCharacter(raw = {}) {
        const attributes = Array.isArray(raw.attributes) ? raw.attributes.map(normalizeAttribute) : [];
        const legacyOpening = raw.opening || raw.introduction || "";
        const sourceOpenings = Array.isArray(raw.openings) ? raw.openings : [legacyOpening];
        const openings = Array.from({ length: 5 }, (_, index) => String(sourceOpenings[index] || ""));
        const keywordIds = Array.from(new Set(Array.isArray(raw.keywordIds) ? raw.keywordIds.filter(Boolean) : [])).slice(0, 15);
        const addLegacyAttribute = (label, value) => {
          const clean = String(value || "").trim();
          if (!clean) {
            return;
          }
          const exists = attributes.some((attribute) => attribute.label === label && attribute.value === clean);
          if (!exists) {
            attributes.push(normalizeAttribute({ label, value: clean }));
          }
        };

        addLegacyAttribute("파일명 접두어", raw.filePrefix);
        addLegacyAttribute("의상", raw.outfit);
        addLegacyAttribute("상징 소품", raw.item);
        addLegacyAttribute("세계관 보충 메모", raw.world);
        addLegacyAttribute("이미지 스타일", raw.style);
        addLegacyAttribute("관계성", raw.relationship);
        addLegacyAttribute("절대 유지", raw.locked);
        addLegacyAttribute("추가 금지", raw.customNegative);

        const tags = Array.isArray(raw.tags)
          ? normalizeOptionList(raw.tags)
          : normalizeOptionList(raw.tag ? [raw.tag] : []);

        return {
          id: raw.id || createId("character"),
          name: raw.name || raw.characterName || "새 캐릭터",
          age: raw.age || "",
          job: raw.job || "",
          appearance: raw.appearance || "",
          personality: raw.personality || "",
          speech: raw.speech || "",
          imageData: raw.imageData || raw.avatar || raw.photo || "",
          openings,
          keywordIds,
          tags,
          worldId: raw.worldId || raw.linkedWorldId || "",
          attributes
        };
      }

      function createBlankCharacter(worldId) {
        return normalizeCharacter({
          id: createId("character"),
          name: "새 캐릭터",
          worldId,
          tags: []
        });
      }

      function loadWorlds() {
        const stored = readJson(storage.worlds, null);
        if (Array.isArray(stored) && stored.length) {
          return stored.map(normalizeWorld);
        }
        const worlds = sourceWorlds.length ? sourceWorlds.map(normalizeWorld) : [normalizeWorld({ name: "새 세계관" })];
        writeJson(storage.worlds, worlds);
        return worlds;
      }

      function loadCharacters(defaultWorldId) {
        const stored = readJson(storage.characters, null);
        let characters = [];

        if (Array.isArray(stored) && stored.length) {
          characters = stored.map(normalizeCharacter);
        }

        if (!characters.length) {
          characters = [createBlankCharacter(defaultWorldId)];
        }

        characters.forEach((character) => {
          if (!character.worldId) {
            character.worldId = defaultWorldId;
          }
        });

        return characters;
      }

      function loadKeywords() {
        const stored = readJson(storage.keywords, null);
        const source = Array.isArray(stored) && stored.length ? stored : defaultKeywordEntries;
        const keywords = source.map(normalizeKeyword);

        if (localStorage.getItem(storage.keywordStarterPack) !== "added") {
          const existingIds = new Set(keywords.map((keyword) => keyword.id));
          const existingTitles = new Set(keywords.map((keyword) => keyword.title.trim().toLowerCase()));
          supplementalKeywordEntries.forEach((entry) => {
            const normalized = normalizeKeyword(entry);
            const titleKey = normalized.title.trim().toLowerCase();
            if (!existingIds.has(normalized.id) && !existingTitles.has(titleKey)) {
              keywords.push(normalized);
              existingIds.add(normalized.id);
              existingTitles.add(titleKey);
            }
          });
          writeJson(storage.keywords, keywords);
          localStorage.setItem(storage.keywordStarterPack, "added");
        }

        return keywords;
      }

      function loadScenes() {
        const stored = readJson(storage.scenes, null);
        const scenes = sceneHelpers.loadScenes({
          readJson,
          storage,
          sourceTemplates,
          createId
        });
        if (!Array.isArray(stored) || !stored.length) {
          writeJson(storage.scenes, scenes);
        }
        return scenes;
      }

      const scenes = loadScenes();
      const worlds = loadWorlds();
      const storedWorldId = localStorage.getItem(storage.selectedWorld);
      const initialWorldId = worlds.some((world) => world.id === storedWorldId) ? storedWorldId : worlds[0].id;
      const characters = loadCharacters(initialWorldId);
      mergeOptionList(roleTags, characters.flatMap((character) => character.tags || []));
      mergeOptionList(sceneCategoryOptions, scenes.flatMap((scene) => Array.isArray(scene.categories) ? scene.categories : [scene.category]));
      const storedCharacterId = localStorage.getItem(storage.selectedCharacter);
      const keywords = loadKeywords();
      mergeOptionList(keywordCategoryOptions, keywords.flatMap((keyword) => Array.isArray(keyword.categories) ? keyword.categories : [keyword.category]));
      const storedKeywordId = localStorage.getItem(storage.selectedKeyword);
      const deletedItems = readJson(storage.deletedItems, [])
        .filter((item) => item && item.type && item.item)
        .slice(0, 20)
        .map((item) => ({
          ...item,
          historyId: item.historyId || createId("history")
        }));
      const modifiedItems = readJson(storage.modifiedItems, [])
        .filter((item) => item && item.type && item.before && item.after)
        .slice(0, 30)
        .map((item) => ({
          ...item,
          historyId: item.historyId || createId("history")
        }));
      localStorage.removeItem(storage.promptPresets);
      localStorage.removeItem(storage.promptHistory);
      const promptPresets = [];
      const promptHistory = [];

      const state = {
        sceneCategory: "전체",
        sceneQuery: "",
        sceneAdvancedSearchOpen: false,
        activeSceneId: scenes.some((scene) => scene.id === localStorage.getItem(storage.selectedScene)) ? localStorage.getItem(storage.selectedScene) : "",
        scenes,
        sceneCategories: sceneCategoryOptions,
        keywordCategory: "전체",
        keywordCategories: keywordCategoryOptions,
        keywordQuery: "",
        keywordAdvancedSearchOpen: false,
        activeKeywordId: keywords.some((keyword) => keyword.id === storedKeywordId) ? storedKeywordId : "",
        keywords,
        deletedItems,
        modifiedItems,
        promptPresets,
        promptHistory,
        activityFilter: "all",
        worlds,
        selectedWorldId: initialWorldId,
        characters,
        selectedCharacterId: characters.some((character) => character.id === storedCharacterId) ? storedCharacterId : characters[0].id,
        characterDetailOpen: true,
        characterQuery: "",
        tagFilter: "전체",
        characterWorldFilter: "전체",
        characterAdvancedSearchOpen: false,
        characterTags: roleTags,
        promptVariant: localStorage.getItem(storage.promptVariant) || "character",
        promptDraftsV3: readJson(storage.promptDraftsV3, {}),
        leftPaneWidth: readNumber(storage.leftPaneWidth, 320),
        rightPaneWidth: readNumber(storage.rightPaneWidth, 420),
        sceneKeywordSplitHeight: readNumber(storage.sceneKeywordSplitHeight, 0),
        keywordSectionHeight: readNumber(storage.keywordSectionHeight, 0),
        worldPromptSplitHeight: readNumber(storage.worldPromptSplitHeight, 0),
        promptEditorHeight: readNumber(storage.promptEditorHeight, 430),
        characterCardColumns: [1, 2, 3].includes(readNumber(storage.characterCardColumns, 2)) ? readNumber(storage.characterCardColumns, 2) : 2,
        characterEditorCollapsed: localStorage.getItem(storage.characterEditorCollapsed) === "true"
      };

      function resetTopControl(id) {
        const node = document.getElementById(id);
        if (!node) {
          return null;
        }
        const clone = node.cloneNode(true);
        if ("value" in clone) {
          clone.value = node.value;
        }
        node.replaceWith(clone);
        return clone;
      }

      const topExportButton = resetTopControl("exportButton");
      if (topExportButton) {
        topExportButton.className = "text-button export-menu-button";
        topExportButton.type = "button";
        topExportButton.title = "파일 메뉴";
        topExportButton.textContent = "파일 ▾";
        topExportButton.setAttribute("aria-haspopup", "menu");
        topExportButton.setAttribute("aria-expanded", "false");
        topExportButton.setAttribute("aria-controls", "exportMenu");
      }
      const toolbar = topExportButton ? topExportButton.parentElement : document.querySelector(".toolbar");

      function createTopButton(id, label, title) {
        if (!toolbar) {
          return null;
        }
        const existing = document.getElementById(id);
        if (existing) {
          existing.remove();
        }
        const button = document.createElement("button");
        button.id = id;
        button.className = "text-button";
        button.type = "button";
        button.title = title;
        button.textContent = label;
        toolbar.insertBefore(button, topExportButton || null);
        return button;
      }
      const undoDeleteButton = null;
      const recentActivityButton = createTopButton("recentActivityButton", "최근 기록", "최근 삭제 및 수정 목록 보기");
      let exportMenu = null;
      let promptCsvExportButton = null;
      let libraryExportButton = null;
      let libraryImportButton = null;
      if (toolbar && topExportButton) {
        exportMenu = document.createElement("div");
        exportMenu.id = "exportMenu";
        exportMenu.className = "export-menu";
        exportMenu.hidden = true;
        exportMenu.setAttribute("role", "menu");
        exportMenu.setAttribute("aria-label", "파일 메뉴");

        promptCsvExportButton = document.createElement("button");
        promptCsvExportButton.id = "promptCsvExportButton";
        promptCsvExportButton.className = "export-menu-item";
        promptCsvExportButton.type = "button";
        promptCsvExportButton.setAttribute("role", "menuitem");
        promptCsvExportButton.innerHTML = `<span>프롬프트 CSV로 저장</span><small>선택한 캐릭터의 상황별 이미지 프롬프트를 표 파일로 저장</small>`;

        libraryExportButton = document.createElement("button");
        libraryExportButton.id = "libraryExportButton";
        libraryExportButton.className = "export-menu-item";
        libraryExportButton.type = "button";
        libraryExportButton.setAttribute("role", "menuitem");
        libraryExportButton.innerHTML = `<span>현재 데이터 저장</span><small>캐릭터, 세계관, 상황, 키워드 전체 데이터를 JSON으로 저장</small>`;

        libraryImportButton = document.createElement("button");
        libraryImportButton.id = "libraryImportButton";
        libraryImportButton.className = "export-menu-item";
        libraryImportButton.type = "button";
        libraryImportButton.setAttribute("role", "menuitem");
        libraryImportButton.innerHTML = `<span>데이터 불러오기</span><small>저장한 데이터 JSON을 불러와 현재 데이터로 적용</small>`;

        exportMenu.append(promptCsvExportButton, libraryExportButton, libraryImportButton);
        topExportButton.insertAdjacentElement("afterend", exportMenu);
      }
      const libraryImportInput = document.createElement("input");
      libraryImportInput.id = "libraryImportInput";
      libraryImportInput.type = "file";
      libraryImportInput.accept = "application/json,.json";
      libraryImportInput.hidden = true;
      document.body.appendChild(libraryImportInput);

      const activityModal = document.createElement("div");
      activityModal.id = "activityModal";
      activityModal.className = "activity-modal";
      activityModal.hidden = true;
      activityModal.innerHTML = `
        <div class="activity-backdrop" data-activity-close></div>
        <section class="activity-dialog" role="dialog" aria-modal="true" aria-labelledby="activityTitle">
          <header class="activity-header">
            <div>
              <h2 id="activityTitle">최근 기록</h2>
              <p>최근 삭제 20건과 수정 30건을 보관해요.</p>
            </div>
            <button class="icon-button activity-close" type="button" data-activity-close title="닫기" aria-label="최근 기록 닫기">×</button>
          </header>
          <div id="activityFilters" class="activity-filters" aria-label="기록 종류"></div>
          <div id="activityList" class="activity-list"></div>
        </section>
      `;
      document.body.appendChild(activityModal);

      const el = {
        workspace: document.querySelector(".v2-workspace"),
        exportButton: topExportButton,
        exportMenu,
        promptCsvExportButton,
        undoDeleteButton,
        recentActivityButton,
        activityModal,
        activityFilters: activityModal.querySelector("#activityFilters"),
        activityList: activityModal.querySelector("#activityList"),
        libraryExportButton,
        libraryImportButton,
        libraryImportInput,
        sceneCount: document.getElementById("sceneCount"),
        sceneSearchInput: document.getElementById("sceneSearchInput"),
        sceneAdvancedSearchToggle: document.getElementById("sceneAdvancedSearchToggle"),
        sceneAdvancedSearchPanel: document.getElementById("sceneAdvancedSearchPanel"),
        sceneFilters: document.getElementById("sceneFilters"),
        sceneList: document.getElementById("sceneList"),
        addSceneButton: document.getElementById("addSceneButton"),
        manageSceneCategoriesButton: document.getElementById("manageSceneCategoriesButton"),
        deleteSceneButton: document.getElementById("deleteSceneButton"),
        sceneKeywordResizeHandle: document.getElementById("sceneKeywordResizeHandle"),
        leftResizeHandle: document.getElementById("leftResizeHandle"),
        keywordCount: document.getElementById("keywordCount"),
        keywordSearchInput: document.getElementById("keywordSearchInput"),
        keywordAdvancedSearchToggle: document.getElementById("keywordAdvancedSearchToggle"),
        keywordAdvancedSearchPanel: document.getElementById("keywordAdvancedSearchPanel"),
        keywordFilters: document.getElementById("keywordFilters"),
        keywordList: document.getElementById("keywordList"),
        addKeywordButton: document.getElementById("addKeywordButton"),
        manageKeywordCategoriesButton: document.getElementById("manageKeywordCategoriesButton"),
        deleteKeywordButton: document.getElementById("deleteKeywordButton"),
        characterCount: document.getElementById("characterCount"),
        characterSearchInput: document.getElementById("characterSearchInput"),
        characterTagFilters: document.getElementById("characterTagFilters"),
        characterAdvancedSearchToggle: document.getElementById("characterAdvancedSearchToggle"),
        characterAdvancedSearchPanel: document.getElementById("characterAdvancedSearchPanel"),
        characterAdvancedTagSelect: document.getElementById("characterAdvancedTagSelect"),
        characterAdvancedWorldSelect: document.getElementById("characterAdvancedWorldSelect"),
        characterAdvancedApplyButton: document.getElementById("characterAdvancedApplyButton"),
        characterAdvancedResetButton: document.getElementById("characterAdvancedResetButton"),
        collapsedCharacterLayoutControls: document.getElementById("collapsedCharacterLayoutControls"),
        characterListPanel: document.getElementById("characterListPanel"),
        characterWindow: document.getElementById("characterWindow"),
        characterSplitList: document.getElementById("characterSplitList"),
        characterEditorVisibilityToggle: document.getElementById("characterEditorVisibilityToggle"),
        characterLayoutOneButton: document.getElementById("characterLayoutOneButton"),
        characterLayoutTwoButton: document.getElementById("characterLayoutTwoButton"),
        characterLayoutThreeButton: document.getElementById("characterLayoutThreeButton"),
        characterList: document.getElementById("characterList"),
        characterEditorPanel: document.getElementById("characterEditorPanel"),
        characterEditorTitle: document.getElementById("characterEditorTitle"),
        clearCharacterButton: document.getElementById("clearCharacterButton"),
        characterTagPicker: document.getElementById("characterTagPicker"),
        characterWorldSelect: document.getElementById("characterWorldSelect"),
        characterPhotoPreview: document.getElementById("characterPhotoPreview"),
        chooseCharacterImageButton: document.getElementById("chooseCharacterImageButton"),
        removeCharacterImageButton: document.getElementById("removeCharacterImageButton"),
        characterImageInput: document.getElementById("characterImageInput"),
        characterName: document.getElementById("characterName"),
        characterAge: document.getElementById("characterAge"),
        characterJob: document.getElementById("characterJob"),
        characterAppearance: document.getElementById("characterAppearance"),
        characterPersonality: document.getElementById("characterPersonality"),
        characterSpeech: document.getElementById("characterSpeech"),
        openingSlotPicker: document.getElementById("openingSlotPicker"),
        copyOpeningButton: document.getElementById("copyOpeningButton"),
        characterOpening: document.getElementById("characterOpening"),
        openingCharCount: document.getElementById("openingCharCount"),
        characterKeywordCount: document.getElementById("characterKeywordCount"),
        characterKeywordPicker: document.getElementById("characterKeywordPicker"),
        addAttributeButton: document.getElementById("addAttributeButton"),
        attributeList: document.getElementById("attributeList"),
        moveCharacterUpButton: document.getElementById("moveCharacterUpButton"),
        moveCharacterDownButton: document.getElementById("moveCharacterDownButton"),
        addCharacterButton: document.getElementById("addCharacterButton"),
        deleteCharacterButton: document.getElementById("deleteCharacterButton"),
        worldCount: document.getElementById("worldCount"),
        worldSelect: document.getElementById("worldSelect"),
        addWorldButton: document.getElementById("addWorldButton"),
        deleteWorldButton: document.getElementById("deleteWorldButton"),
        worldName: document.getElementById("worldName"),
        worldGenre: document.getElementById("worldGenre"),
        worldSummary: document.getElementById("worldSummary"),
        worldKeywordCount: document.getElementById("worldKeywordCount"),
        worldKeywordPicker: document.getElementById("worldKeywordPicker"),
        worldRules: document.getElementById("worldRules"),
        promptVariantSelect: document.getElementById("promptVariantSelect"),
        regeneratePromptButton: document.getElementById("regeneratePromptButton"),
        copyPromptButton: document.getElementById("copyPromptButton"),
        promptOutput: document.getElementById("promptOutput"),
        promptMeta: document.getElementById("promptMeta"),
        worldPromptResizeHandle: document.getElementById("worldPromptResizeHandle"),
        rightResizeHandle: document.getElementById("rightResizeHandle"),
        toast: document.getElementById("toast")
      };

      [
        el.sceneList,
        el.keywordList,
        el.characterList,
        el.characterEditorPanel,
        el.characterKeywordPicker,
        el.openingSlotPicker,
        el.worldKeywordPicker,
        el.worldSummary,
        el.worldRules,
        el.promptOutput,
        el.activityList,
        ...document.querySelectorAll(".vault-window, .vault-window-body, .vault-window .panel, textarea, .backup-list, .category-dialog-body, .category-manager-list, .prompt-recent-list, .quick-command-results")
      ].filter(Boolean).forEach((node) => node.classList.add("app-scrollbar"));

      function mountPromptPresetPanel() {
        // 제거된 기능입니다.
      }

      mountPromptPresetPanel();

      let draggedCharacterId = "";
      let suppressCharacterClick = false;
      let activeOpeningIndex = 0;

      const characterInputs = [
        ["name", el.characterName],
        ["age", el.characterAge],
        ["job", el.characterJob],
        ["appearance", el.characterAppearance],
        ["personality", el.characterPersonality],
        ["speech", el.characterSpeech]
      ];

      const worldInputs = [
        ["name", el.worldName],
        ["genre", el.worldGenre],
        ["summary", el.worldSummary],
        ["rules", el.worldRules],
      ];

      const historySnapshots = {
        scene: cloneForUndo(state.scenes),
        keyword: cloneForUndo(state.keywords),
        character: cloneForUndo(state.characters),
        world: cloneForUndo(state.worlds)
      };

      function getSelectedCharacter() {
        let character = state.characters.find((item) => item.id === state.selectedCharacterId);
        if (!character) {
          character = state.characters[0];
          state.selectedCharacterId = character.id;
        }
        return character;
      }

      function getSelectedWorld() {
        let world = state.worlds.find((item) => item.id === state.selectedWorldId);
        if (!world) {
          world = state.worlds[0];
          state.selectedWorldId = world.id;
        }
        return world;
      }

      function getCharacterWorld(character = getSelectedCharacter()) {
        return state.worlds.find((world) => world.id === character.worldId) || getSelectedWorld();
      }

      function getTemplate(id = state.activeSceneId) {
        return sceneHelpers.getTemplate(state, id);
      }

      function getTemplateView(id = state.activeSceneId) {
        return sceneHelpers.getTemplateView({
          state,
          id,
          createId
        });
      }

      function getHistoryList(type) {
        const lists = {
          scene: state.scenes,
          keyword: state.keywords,
          character: state.characters,
          world: state.worlds
        };
        return lists[type] || [];
      }

      function syncHistorySnapshot(type) {
        historySnapshots[type] = cloneForUndo(getHistoryList(type));
      }

      function valuesMatch(left, right) {
        return JSON.stringify(left) === JSON.stringify(right);
      }

      const historyTypeLabels = {
        scene: "상황",
        keyword: "키워드",
        character: "캐릭터",
        world: "세계관",
        sceneCategory: "상황 분류",
        characterTag: "캐릭터 분류"
      };

      const historyFieldLabels = {
        scene: { title: "상황명", category: "분류", categories: "분류", scene: "장면" },
        keyword: { title: "키워드명", triggers: "트리거 단어", content: "내용" },
        character: {
          name: "캐릭터명",
          age: "나이",
          job: "직업",
          appearance: "외형",
          personality: "성격",
          speech: "말투",
          imageData: "캐릭터 사진",
          openings: "도입부",
          keywordIds: "연결 키워드",
          tags: "태그",
          worldId: "연결 세계관",
          attributes: "직접 속성"
        },
        world: { name: "세계관명", genre: "장르", summary: "세계관 설명", keywordIds: "연결 키워드", rules: "세계관 규칙" }
      };

      function getHistoryFieldLabel(type, key) {
        return historyFieldLabels[type]?.[key] || key;
      }

      function getChangedFieldKeys(type, before, after) {
        const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
        keys.delete("id");
        return Array.from(keys).filter((key) => !valuesMatch(before?.[key], after?.[key]));
      }

      function getChangedFields(type, before, after) {
        return getChangedFieldKeys(type, before, after).map((key) => getHistoryFieldLabel(type, key));
      }

      function shouldSplitModificationHistory(type) {
        return type === "character";
      }

      function saveModifiedItems() {
        writeJson(storage.modifiedItems, state.modifiedItems);
      }

      function renderRecentActivityButton() {
        if (!el.recentActivityButton) {
          return;
        }
        const count = state.deletedItems.length + state.modifiedItems.length;
        el.recentActivityButton.textContent = count ? `최근 기록 (${count})` : "최근 기록";
        el.recentActivityButton.title = count ? `최근 삭제 및 수정 기록 ${count}건 보기` : "최근 삭제 및 수정 목록 보기";
      }

      function recordModifiedItem(type, before, after) {
        const changedKeys = getChangedFieldKeys(type, before, after);
        if (!changedKeys.length) {
          return;
        }

        const modifiedAt = new Date().toISOString();
        const itemId = after?.id || before?.id || "";
        const now = Date.now();

        if (shouldSplitModificationHistory(type)) {
          changedKeys.forEach((fieldKey) => {
            const fieldLabel = getHistoryFieldLabel(type, fieldKey);
            const beforeValue = cloneForUndo(before?.[fieldKey]);
            const afterValue = cloneForUndo(after?.[fieldKey]);
            const mergeIndex = state.modifiedItems.findIndex((item) => {
              const latestTime = item ? Date.parse(item.modifiedAt || "") : 0;
              return item
                && item.type === type
                && item.itemId === itemId
                && item.fieldKey === fieldKey
                && now - latestTime < 30000;
            });

            if (mergeIndex >= 0) {
              const latest = state.modifiedItems[mergeIndex];
              latest.after = cloneForUndo(after);
              latest.afterValue = afterValue;
              latest.modifiedAt = modifiedAt;
              latest.fieldLabel = fieldLabel;
              latest.fields = valuesMatch(latest.beforeValue, latest.afterValue) ? [] : [fieldLabel];
              if (!latest.fields.length) {
                state.modifiedItems.splice(mergeIndex, 1);
              } else if (mergeIndex > 0) {
                state.modifiedItems.splice(mergeIndex, 1);
                state.modifiedItems.unshift(latest);
              }
              return;
            }

            state.modifiedItems.unshift({
              historyId: createId("history"),
              type,
              itemId,
              fieldKey,
              fieldLabel,
              before: cloneForUndo(before),
              after: cloneForUndo(after),
              beforeValue,
              afterValue,
              fields: [fieldLabel],
              modifiedAt
            });
          });
        } else {
          const fields = changedKeys.map((key) => getHistoryFieldLabel(type, key));
          const latest = state.modifiedItems[0];
          const latestTime = latest ? Date.parse(latest.modifiedAt || "") : 0;
          const canMerge = latest
            && latest.type === type
            && latest.itemId === itemId
            && !latest.fieldKey
            && now - latestTime < 30000;

          if (canMerge) {
            latest.after = cloneForUndo(after);
            latest.modifiedAt = modifiedAt;
            latest.fields = getChangedFields(type, latest.before, latest.after);
            if (!latest.fields.length) {
              state.modifiedItems.shift();
            }
          } else {
            state.modifiedItems.unshift({
              historyId: createId("history"),
              type,
              itemId,
              before: cloneForUndo(before),
              after: cloneForUndo(after),
              fields,
              modifiedAt
            });
          }
        }

        state.modifiedItems = state.modifiedItems
          .filter((item) => item && (!Array.isArray(item.fields) || item.fields.length))
          .slice(0, 30);
        saveModifiedItems();
        renderRecentActivityButton();
        if (!el.activityModal.hidden) {
          renderActivityHistory();
        }
      }

      function trackArrayModifications(type) {
        const beforeById = new Map((historySnapshots[type] || []).map((item) => [item.id, item]));
        getHistoryList(type).forEach((after) => {
          const before = beforeById.get(after.id);
          if (before && !valuesMatch(before, after)) {
            recordModifiedItem(type, before, after);
          }
        });
      }

      function saveWorlds(options = {}) {
        if (options.track !== false) {
          trackArrayModifications("world");
        }
        writeJson(storage.worlds, state.worlds);
        localStorage.setItem(storage.selectedWorld, state.selectedWorldId);
        syncHistorySnapshot("world");
      }

      function saveCharacters(options = {}) {
        if (options.track !== false) {
          trackArrayModifications("character");
        }
        writeJson(storage.characters, state.characters);
        localStorage.setItem(storage.selectedCharacter, state.selectedCharacterId);
        syncHistorySnapshot("character");
      }

      function saveKeywords(options = {}) {
        if (options.track !== false) {
          trackArrayModifications("keyword");
        }
        writeJson(storage.keywords, state.keywords);
        if (state.activeKeywordId) {
          localStorage.setItem(storage.selectedKeyword, state.activeKeywordId);
        } else {
          localStorage.removeItem(storage.selectedKeyword);
        }
        syncHistorySnapshot("keyword");
      }

      function saveScenes(options = {}) {
        if (options.track !== false) {
          trackArrayModifications("scene");
        }
        writeJson(storage.scenes, state.scenes);
        if (state.activeSceneId) {
          localStorage.setItem(storage.selectedScene, state.activeSceneId);
        } else {
          localStorage.removeItem(storage.selectedScene);
        }
        syncHistorySnapshot("scene");
      }

      function saveDeletedItems() {
        writeJson(storage.deletedItems, state.deletedItems);
      }

      function savePromptDrafts() {
        writeJson(storage.promptDraftsV3, state.promptDraftsV3);
      }

      function savePromptPresets() {
        // 제거된 기능이라 저장하지 않습니다.
      }

      function savePromptHistory() {
        // 제거된 기능이라 저장하지 않습니다.
      }

      function saveSceneCategories() {
        const next = normalizeOptionList(state.sceneCategories && state.sceneCategories.length ? state.sceneCategories : sceneCategoryOptions, defaultSceneCategoryOptions)
          .filter((category) => category !== "전체");
        const safeNext = next.length ? next : [...defaultSceneCategoryOptions];
        sceneCategoryOptions.splice(0, sceneCategoryOptions.length, ...safeNext);
        state.sceneCategories = sceneCategoryOptions;
        writeJson(storage.sceneCategories, sceneCategoryOptions);
      }

      function saveKeywordCategories() {
        const next = normalizeOptionList(state.keywordCategories && state.keywordCategories.length ? state.keywordCategories : keywordCategoryOptions, defaultKeywordCategoryOptions)
          .filter((category) => category !== "전체");
        const safeNext = next.length ? next : [...defaultKeywordCategoryOptions];
        keywordCategoryOptions.splice(0, keywordCategoryOptions.length, ...safeNext);
        state.keywordCategories = keywordCategoryOptions;
        writeJson(storage.keywordCategories, keywordCategoryOptions);
      }

      function saveCharacterTags() {
        const next = normalizeOptionList(state.characterTags && state.characterTags.length ? state.characterTags : roleTags, baseRoleTags);
        roleTags.splice(0, roleTags.length, ...next);
        state.characterTags = roleTags;
        writeJson(storage.characterTags, state.characterTags);
      }

      function cloneForUndo(value) {
        if (value === undefined) {
          return undefined;
        }
        return JSON.parse(JSON.stringify(value));
      }

      function deletedItemLabel(item = state.deletedItems[0]) {
        return historyTypeLabels[item?.type] || "항목";
      }

      function historyItemName(type, item = {}) {
        if (type === "scene" || type === "keyword") {
          return item.title || "이름 없는 항목";
        }
        if (type === "sceneCategory" || type === "characterTag") {
          return item.name || item.title || "이름 없는 분류";
        }
        return item.name || "이름 없는 항목";
      }

      function mergeRestoredOptions(preferredOptions = [], currentOptions = [], requiredValue = "") {
        const merged = [];
        const currentList = normalizeOptionList(currentOptions);
        const currentSet = new Set(currentList);
        const required = String(requiredValue || "").trim();
        const add = (value) => {
          const clean = String(value || "").trim();
          if (clean && clean !== "전체" && !merged.includes(clean)) {
            merged.push(clean);
          }
        };
        normalizeOptionList(preferredOptions).forEach((value) => {
          if (value === required || currentSet.has(value)) {
            add(value);
          }
        });
        currentList.forEach(add);
        add(required);
        return merged;
      }

      function normalizeSceneHistoryList(categories = []) {
        return sceneHelpers.normalizeCategoryList
          ? sceneHelpers.normalizeCategoryList(categories)
          : normalizeOptionList(categories).filter((category) => category !== "전체");
      }

      function syncSceneHistoryCategories(scene, categories) {
        if (!scene) {
          return [];
        }
        const fallback = defaultSceneCategoryOptions[0] || "대표";
        const normalized = normalizeSceneHistoryList(categories);
        const next = normalized.length ? normalized : [fallback];
        scene.categories = next;
        scene.category = next[0] || fallback;
        return next;
      }

      function getSceneHistoryCategories(scene) {
        if (!scene) {
          return [];
        }
        return sceneHelpers.getSceneCategoryList
          ? sceneHelpers.getSceneCategoryList(scene)
          : syncSceneHistoryCategories({ ...scene }, scene.categories || scene.category);
      }

      function normalizeHistoryTagList(tags = []) {
        return normalizeOptionList(tags);
      }

      function formatActivityTime(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          return "시간 정보 없음";
        }
        return date.toLocaleString("ko-KR", {
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      }

      function renderUndoDeleteButton() {
        if (!el.undoDeleteButton) {
          return;
        }
        const latest = state.deletedItems[0];
        el.undoDeleteButton.disabled = !latest;
        el.undoDeleteButton.textContent = latest ? `삭제 되돌리기 (${deletedItemLabel(latest)})` : "삭제 되돌리기";
      }

      function pushDeletedItem(entry) {
        state.deletedItems.unshift({
          ...entry,
          historyId: createId("history"),
          item: cloneForUndo(entry.item),
          deletedAt: new Date().toISOString()
        });
        state.deletedItems = state.deletedItems.slice(0, 20);
        saveDeletedItems();
        renderUndoDeleteButton();
        renderRecentActivityButton();
        if (!el.activityModal.hidden) {
          renderActivityHistory();
        }
      }

      function insertAt(list, item, index) {
        const safeIndex = Math.max(0, Math.min(Number(index) || 0, list.length));
        list.splice(safeIndex, 0, item);
      }

      function restoreDeletedItem(historyId) {
        const entryIndex = state.deletedItems.findIndex((item) => item.historyId === historyId);
        const entry = state.deletedItems[entryIndex];
        if (!entry) {
          showToast("되돌릴 삭제 기록이 없어요");
          renderUndoDeleteButton();
          return;
        }

        let restored = false;
        if (entry.type === "scene") {
          const scene = normalizeScene(entry.item);
          if (state.scenes.some((item) => item.id === scene.id)) {
            scene.id = createId("scene-restored");
          }
          insertAt(state.scenes, scene, entry.index);
          state.activeSceneId = scene.id;
          state.sceneCategory = "전체";
          if (sceneModule && typeof sceneModule.renumberScenesByOrder === "function") {
            sceneModule.renumberScenesByOrder();
          }
          saveScenes({ track: false });
          restored = true;
        }

        if (entry.type === "keyword") {
          const keyword = normalizeKeyword(entry.item);
          const deletedKeywordId = entry.links?.deletedKeywordId || keyword.id;
          if (state.keywords.some((item) => item.id === keyword.id)) {
            keyword.id = createId("keyword-restored");
          }
          insertAt(state.keywords, keyword, entry.index);
          state.activeKeywordId = keyword.id;
          const idMap = keywordModule && typeof keywordModule.renumberKeywordsByOrder === "function"
            ? keywordModule.renumberKeywordsByOrder()
            : new Map();
          const restoredKeywordId = keyword.id;
          const availableKeywordIds = new Set(state.keywords.map((item) => item.id));
          const remapRestoredKeywordIds = (ids, limit) => Array.from(new Set((ids || [])
            .map((id) => id === deletedKeywordId ? restoredKeywordId : (idMap.get(id) || id))
            .filter((id) => availableKeywordIds.has(id))))
            .slice(0, limit);

          (entry.links?.characters || []).forEach((saved) => {
            const character = state.characters.find((item) => item.id === saved.id);
            if (character) {
              character.keywordIds = remapRestoredKeywordIds(saved.keywordIds, 15);
            }
          });
          (entry.links?.worlds || []).forEach((saved) => {
            const world = state.worlds.find((item) => item.id === saved.id);
            if (world) {
              world.keywordIds = remapRestoredKeywordIds(saved.keywordIds, 5);
            }
          });

          saveKeywords({ track: false });
          saveCharacters({ track: false });
          saveWorlds({ track: false });
          restored = true;
        }

        if (entry.type === "sceneCategory") {
          const data = entry.item || {};
          const categoryName = String(data.name || data.category || data.title || "").trim();
          if (!categoryName || categoryName === "전체") {
            showToast("복구할 수 없는 분류 기록이에요");
            renderUndoDeleteButton();
            return;
          }

          const currentOptions = normalizeOptionList(state.sceneCategories, defaultSceneCategoryOptions)
            .filter((category) => category !== "전체");
          const savedOptions = normalizeOptionList(data.options || data.sceneCategories || [categoryName], [categoryName])
            .filter((category) => category !== "전체");
          const nextOptions = mergeRestoredOptions(savedOptions, currentOptions, categoryName);
          sceneCategoryOptions.splice(0, sceneCategoryOptions.length, ...nextOptions);
          state.sceneCategories = sceneCategoryOptions;

          const affectedScenes = Array.isArray(data.affectedScenes) ? data.affectedScenes : [];
          affectedScenes.forEach((saved) => {
            const scene = state.scenes.find((item) => item.id === saved.id);
            if (!scene) {
              return;
            }
            const beforeCategories = normalizeSceneHistoryList(saved.before || saved.categories || [categoryName]);
            const afterCategories = normalizeSceneHistoryList(saved.after || saved.afterCategories || []);
            const currentCategories = getSceneHistoryCategories(scene);
            const nextCategories = afterCategories.length && valuesMatch(currentCategories, afterCategories)
              ? beforeCategories
              : mergeRestoredOptions(currentCategories, beforeCategories, categoryName);
            syncSceneHistoryCategories(scene, nextCategories);
          });

          if (data.activeFilter && (data.activeFilter === "전체" || nextOptions.includes(data.activeFilter))) {
            state.sceneCategory = data.activeFilter;
          } else if (state.sceneCategory !== "전체" && !nextOptions.includes(state.sceneCategory)) {
            state.sceneCategory = "전체";
          }

          saveSceneCategories();
          saveScenes({ track: false });
          restored = true;
        }

        if (entry.type === "characterTag") {
          const data = entry.item || {};
          const tagName = String(data.name || data.tag || data.title || "").trim();
          if (!tagName || tagName === "전체") {
            showToast("복구할 수 없는 분류 기록이에요");
            renderUndoDeleteButton();
            return;
          }

          const currentOptions = normalizeHistoryTagList(state.characterTags);
          const savedOptions = normalizeHistoryTagList(data.options || data.characterTags || [tagName]);
          const nextOptions = mergeRestoredOptions(savedOptions, currentOptions, tagName);
          roleTags.splice(0, roleTags.length, ...nextOptions);
          state.characterTags = roleTags;

          const affectedCharacters = Array.isArray(data.affectedCharacters) ? data.affectedCharacters : [];
          affectedCharacters.forEach((saved) => {
            const character = state.characters.find((item) => item.id === saved.id);
            if (!character) {
              return;
            }
            const beforeTags = normalizeHistoryTagList(saved.before || saved.tags || [tagName]);
            const afterTags = normalizeHistoryTagList(saved.after || saved.afterTags || []);
            const currentTags = normalizeHistoryTagList(character.tags);
            character.tags = afterTags.length && valuesMatch(currentTags, afterTags)
              ? beforeTags
              : mergeRestoredOptions(currentTags, beforeTags, tagName);
          });

          if (data.activeFilter && (data.activeFilter === "전체" || nextOptions.includes(data.activeFilter))) {
            state.tagFilter = data.activeFilter;
          } else if (state.tagFilter !== "전체" && !nextOptions.includes(state.tagFilter)) {
            state.tagFilter = "전체";
          }

          saveCharacterTags();
          saveCharacters({ track: false });
          restored = true;
        }

        if (entry.type === "character") {
          const character = normalizeCharacter(entry.item);
          if (state.characters.some((item) => item.id === character.id)) {
            showToast("같은 캐릭터가 이미 있어요");
            renderUndoDeleteButton();
            return;
          }
          insertAt(state.characters, character, entry.index);
          state.selectedCharacterId = character.id;
          state.selectedWorldId = character.worldId || state.selectedWorldId;
          saveCharacters({ track: false });
          restored = true;
        }

        if (entry.type === "world") {
          const world = normalizeWorld(entry.item);
          if (state.worlds.some((item) => item.id === world.id)) {
            showToast("같은 세계관이 이미 있어요");
            renderUndoDeleteButton();
            return;
          }
          insertAt(state.worlds, world, entry.index);
          state.selectedWorldId = world.id;
          (entry.links?.characters || []).forEach((saved) => {
            const character = state.characters.find((item) => item.id === saved.id);
            if (character) {
              character.worldId = world.id;
            }
          });
          saveWorlds({ track: false });
          saveCharacters({ track: false });
          restored = true;
        }

        if (restored) {
          state.deletedItems.splice(entryIndex, 1);
          saveDeletedItems();
          renderAll();
          renderActivityHistory();
          showToast(`${deletedItemLabel(entry)} 복구됨`);
        } else {
          saveDeletedItems();
          renderUndoDeleteButton();
          showToast("복구할 수 없는 삭제 기록이에요");
        }
      }

      function restoreLastDeleted() {
        const latest = state.deletedItems[0];
        if (!latest) {
          showToast("되돌릴 삭제 기록이 없어요");
          renderUndoDeleteButton();
          return;
        }
        restoreDeletedItem(latest.historyId);
      }

      function restoreModifiedItem(historyId) {
        const entryIndex = state.modifiedItems.findIndex((item) => item.historyId === historyId);
        const entry = state.modifiedItems[entryIndex];
        if (!entry) {
          showToast("되돌릴 수정 기록이 없어요");
          return;
        }

        const list = getHistoryList(entry.type);
        const itemIndex = list.findIndex((item) => item.id === entry.itemId);
        if (itemIndex < 0) {
          showToast("항목이 삭제되어 먼저 복구해야 해요");
          return;
        }

        const isFieldHistory = Boolean(entry.fieldKey) && Object.prototype.hasOwnProperty.call(entry, "beforeValue");

        if (entry.type === "scene") {
          const currentId = list[itemIndex].id;
          const scene = normalizeScene(entry.before);
          scene.id = currentId;
          list[itemIndex] = scene;
          state.activeSceneId = currentId;
          saveScenes({ track: false });
        }
        if (entry.type === "keyword") {
          const currentId = list[itemIndex].id;
          const keyword = normalizeKeyword(entry.before);
          keyword.id = currentId;
          list[itemIndex] = keyword;
          state.activeKeywordId = currentId;
          saveKeywords({ track: false });
        }
        if (entry.type === "character") {
          if (isFieldHistory) {
            const character = list[itemIndex];
            character[entry.fieldKey] = cloneForUndo(entry.beforeValue);

            if (entry.fieldKey === "keywordIds") {
              const availableKeywordIds = new Set(state.keywords.map((item) => item.id));
              character.keywordIds = Array.from(new Set(Array.isArray(character.keywordIds) ? character.keywordIds : []))
                .filter((id) => availableKeywordIds.has(id))
                .slice(0, 15);
            }
            if (entry.fieldKey === "tags") {
              character.tags = normalizeOptionList(character.tags);
            }
            if (entry.fieldKey === "openings") {
              const sourceOpenings = Array.isArray(character.openings) ? character.openings : [];
              character.openings = Array.from({ length: 5 }, (_, index) => String(sourceOpenings[index] || ""));
            }
            if (entry.fieldKey === "attributes") {
              character.attributes = Array.isArray(character.attributes) ? character.attributes.map(normalizeAttribute) : [];
            }

            state.selectedCharacterId = character.id;
          } else {
            const character = normalizeCharacter(entry.before);
            const availableKeywordIds = new Set(state.keywords.map((item) => item.id));
            character.keywordIds = character.keywordIds.filter((id) => availableKeywordIds.has(id));
            list[itemIndex] = character;
            state.selectedCharacterId = character.id;
          }
          saveCharacters({ track: false });
        }
        if (entry.type === "world") {
          const world = normalizeWorld(entry.before);
          const availableKeywordIds = new Set(state.keywords.map((item) => item.id));
          world.keywordIds = world.keywordIds.filter((id) => availableKeywordIds.has(id));
          list[itemIndex] = world;
          state.selectedWorldId = world.id;
          saveWorlds({ track: false });
        }

        state.modifiedItems.splice(entryIndex, 1);
        saveModifiedItems();
        renderAll();
        renderActivityHistory();
        const restoredLabel = isFieldHistory
          ? `${deletedItemLabel(entry)} ${getHistoryFieldLabel(entry.type, entry.fieldKey)}`
          : deletedItemLabel(entry);
        showToast(`${restoredLabel} 이전 상태로 복구됨`);
      }

      function renderActivityHistory() {
        if (!el.activityModal || !el.activityFilters || !el.activityList) {
          return;
        }

        const counts = {
          all: state.deletedItems.length + state.modifiedItems.length,
          delete: state.deletedItems.length,
          modify: state.modifiedItems.length
        };
        const filters = [
          ["all", "전체"],
          ["delete", "삭제"],
          ["modify", "수정"]
        ];
        el.activityFilters.innerHTML = filters.map(([id, label]) => `
          <button class="activity-filter${state.activityFilter === id ? " active" : ""}" type="button" data-activity-filter="${id}">
            ${label} <span>${counts[id]}</span>
          </button>
        `).join("");

        const entries = [
          ...state.deletedItems.map((entry) => ({ ...entry, source: "delete", timestamp: entry.deletedAt })),
          ...state.modifiedItems.map((entry) => ({ ...entry, source: "modify", timestamp: entry.modifiedAt }))
        ]
          .filter((entry) => state.activityFilter === "all" || state.activityFilter === entry.source)
          .sort((left, right) => Date.parse(right.timestamp || "") - Date.parse(left.timestamp || ""));

        if (!entries.length) {
          el.activityList.innerHTML = `<div class="activity-empty">아직 기록이 없어요.</div>`;
          return;
        }

        el.activityList.innerHTML = entries.map((entry) => {
          const isDelete = entry.source === "delete";
          const item = isDelete ? entry.item : entry.after;
          const typeLabel = deletedItemLabel(entry);
          const name = historyItemName(entry.type, item);
          const detail = isDelete
            ? "삭제됨"
            : `${(entry.fields || getChangedFields(entry.type, entry.before, entry.after)).join(", ") || "내용"} 수정`;
          return `
            <article class="activity-item">
              <div class="activity-item-main">
                <div class="activity-item-title">
                  <span class="activity-badge ${entry.source}">${isDelete ? "삭제" : "수정"}</span>
                  <strong>${escapeHtml(typeLabel)} · ${escapeHtml(name)}</strong>
                </div>
                <p>${escapeHtml(detail)} · ${escapeHtml(formatActivityTime(entry.timestamp))}</p>
              </div>
              <button class="text-button activity-restore" type="button" data-activity-restore="${escapeHtml(entry.historyId)}" data-activity-source="${entry.source}">
                ${isDelete ? "복구" : "이전으로"}
              </button>
            </article>
          `;
        }).join("");
      }

      function openActivityHistory() {
        state.activityFilter = "all";
        renderActivityHistory();
        el.activityModal.hidden = false;
        document.body.classList.add("activity-open");
        el.activityModal.querySelector(".activity-close")?.focus();
      }

      function closeActivityHistory() {
        el.activityModal.hidden = true;
        document.body.classList.remove("activity-open");
        el.recentActivityButton?.focus();
      }

      function clearDeletedItems() {
        state.deletedItems = [];
        saveDeletedItems();
        renderUndoDeleteButton();
        renderRecentActivityButton();
      }

      function clearActivityHistory() {
        state.deletedItems = [];
        state.modifiedItems = [];
        saveDeletedItems();
        saveModifiedItems();
        renderUndoDeleteButton();
        renderRecentActivityButton();
      }

      const uiModule = window.PC_UI.create({ state, el, storage });
      const { showToast, copyText, renderResponsiveLayoutControls, applyPaneWidths, applySceneKeywordSplit } = uiModule;

      function showAppToast(message, options = {}) {
        if (options && options.undoDelete) {
          const historyId = state.deletedItems[0]?.historyId || "";
          showToast(message, {
            actionLabel: "되돌리기",
            duration: 5200,
            onAction: () => restoreDeletedItem(historyId)
          });
          return;
        }

        const text = String(message || "");
        if (text.includes("상단에서 되돌릴 수 있어요")) {
          const cleaned = text
            .replace(/\.?\s*상단에서 되돌릴 수 있어요\.?/g, "")
            .replace(/삭제됨$/g, "삭제했어요");
          const historyId = state.deletedItems[0]?.historyId || "";
          showToast(cleaned || "삭제했어요", {
            actionLabel: "되돌리기",
            duration: 5200,
            onAction: () => restoreDeletedItem(historyId)
          });
          return;
        }

        showToast(message, options);
      }

      let characterModule;
      let worldModule;

      const sceneModule = window.PC_SCENES.create({
        state,
        el,
        sourceCategories: state.sceneCategories,
        createId,
        escapeHtml,
        compact,
        normalizeScene,
        saveScenes,
        saveSceneCategories,
        saveKeywordCategories,
        getTemplate,
        getTemplateView,
        pushDeletedItem,
        showToast: showAppToast,
        renderPromptSelection: (...args) => renderPromptSelection(...args),
        renderPrompt: (...args) => renderPrompt(...args)
      });
      const { renderSceneFilters, renderScenes } = sceneModule;

      const keywordModule = window.PC_KEYWORDBOOK.create({
        state,
        el,
        createId,
        escapeHtml,
        compact,
        normalizeKeyword,
        saveKeywords,
        saveCharacters,
        saveWorlds,
        saveKeywordCategories,
        getSelectedCharacter,
        pushDeletedItem,
        showToast: showAppToast,
        renderCharacterKeywordPicker: (...args) => characterModule.renderCharacterKeywordPicker(...args),
        renderWorldKeywordPicker: (...args) => worldModule.renderWorldKeywordPicker(...args)
      });
      const { renderKeywords } = keywordModule;

      characterModule = window.PC_CHARACTERS.create({
        state,
        el,
        storage,
        roleTags,
        characterInputs,
        createId,
        escapeHtml,
        compact,
        normalizeCharacter,
        normalizeAttribute,
        createBlankCharacter,
        saveCharacters,
        saveWorlds,
        saveCharacterTags,
        getSelectedCharacter,
        getCharacterWorld,
        pushDeletedItem,
        showToast: showAppToast,
        copyText,
        renderAll: (...args) => renderAll(...args),
        renderPrompt: (...args) => renderPrompt(...args),
        renderKeywords: (...args) => keywordModule.renderKeywords(...args)
      });
      const {
        renderCharacterTagFilters,
        renderCharacters,
        renderCharacterEditor,
        renderCharacterKeywordPicker
      } = characterModule;

      worldModule = window.PC_WORLDS.create({
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
        showToast: showAppToast,
        renderAll: (...args) => renderAll(...args),
        renderPrompt: (...args) => renderPrompt(...args),
        renderCharacterEditor: (...args) => characterModule.renderCharacterEditor(...args),
        renderCharacters: (...args) => characterModule.renderCharacters(...args)
      });
      const { renderWorldLibrary, renderWorldKeywordPicker } = worldModule;
      function renderPromptVariantOptions() {
        el.promptVariantSelect.innerHTML = "";
        promptVariants.forEach((variant) => {
          const option = document.createElement("option");
          option.value = variant.id;
          option.textContent = variant.label;
          el.promptVariantSelect.appendChild(option);
        });
        el.promptVariantSelect.value = state.promptVariant;
      }

      function promptDraftKey(variant = state.promptVariant) {
        const character = getSelectedCharacter();
        const selectedWorld = getSelectedWorld();
        const characterWorld = getCharacterWorld(character);
        if (variant === "character") {
          return ["character-basic-info-v6", character.id].join("|");
        }
        if (variant === "characterIntro") {
          return ["character-intro-v3", character.id].join("|");
        }
        if (variant === "world") {
          return ["world-prompt-v2", selectedWorld.id].join("|");
        }
        if (variant === "worldIntro") {
          return ["world-intro-v2", selectedWorld.id].join("|");
        }
        if (variant === "niji") {
          return ["niji-character-only-v4", character.id].join("|");
        }
        if (variant === "chatgpt") {
          return ["chatgpt-character-only-v4", character.id].join("|");
        }
        return ["image-v2", variant, character.id, characterWorld.id].join("|");
      }

      function selectedPromptSourceLabel() {
        const character = getSelectedCharacter();
        const world = getSelectedWorld();
        const scene = state.scenes.find((item) => item.id === state.activeSceneId);
        const emptyLabel = "\uC120\uD0DD \uC5C6\uC74C";
        return [
          "\uCE90\uB9AD\uD130: " + (character?.name || emptyLabel),
          "\uC0C1\uD669: " + (scene?.title || emptyLabel),
          "\uC138\uACC4\uAD00: " + (world?.name || emptyLabel)
        ].join(" \u00B7 ");
      }

      function renderPromptSelection() {
        const sourceLabel = selectedPromptSourceLabel();
        el.promptMeta.textContent = sourceLabel;
        el.promptMeta.title = sourceLabel;
      }

      function promptVariantLabel(id = state.promptVariant) {
        return promptVariants.find((item) => item.id === id)?.label || "프롬프트";
      }

      function getCurrentPromptSnapshot(name = "") {
        const character = getSelectedCharacter();
        const world = getSelectedWorld();
        const scene = getTemplate();
        const keyword = state.keywords.find((item) => item.id === state.activeKeywordId);
        return {
          id: createId("preset"),
          name: String(name || "").trim(),
          characterId: character?.id || "",
          characterName: character?.name || "",
          worldId: world?.id || "",
          worldName: world?.name || "",
          sceneId: scene?.id || "",
          sceneTitle: scene?.title || "",
          keywordId: keyword?.id || "",
          keywordTitle: keyword?.title || "",
          promptVariant: state.promptVariant,
          promptVariantLabel: promptVariantLabel(),
          createdAt: new Date().toISOString()
        };
      }

      function defaultPromptPresetName() {
        const snapshot = getCurrentPromptSnapshot();
        return compact([
          snapshot.characterName,
          snapshot.sceneTitle,
          snapshot.promptVariantLabel
        ], " · ") || "새 프리셋";
      }

      function renderPromptPresetControls() {
        // 제거된 UI라 렌더링할 컨트롤이 없습니다.
      }

      function saveCurrentPromptPreset() {
        const nameInput = el.promptPresetNameInput;
        const name = String(nameInput?.value || "").trim() || defaultPromptPresetName();
        const preset = getCurrentPromptSnapshot(name);
        state.promptPresets = [preset, ...state.promptPresets.filter((item) => item.name !== name)].slice(0, 24);
        savePromptPresets();
        if (nameInput) {
          nameInput.value = "";
        }
        renderPromptPresetControls();
        showToast("프롬프트 조합을 프리셋으로 저장했어요 ✨");
      }

      function deleteSelectedPromptPreset() {
        const presetId = el.promptPresetSelect?.value;
        if (!presetId) {
          showToast("삭제할 프리셋을 선택해주세요");
          return;
        }
        state.promptPresets = state.promptPresets.filter((preset) => preset.id !== presetId);
        savePromptPresets();
        renderPromptPresetControls();
        showToast("프리셋을 삭제했어요");
      }

      function applyPromptSnapshot(snapshot, options = {}) {
        if (!snapshot) {
          return;
        }
        if (snapshot.characterId && state.characters.some((item) => item.id === snapshot.characterId)) {
          state.selectedCharacterId = snapshot.characterId;
        }
        if (snapshot.worldId && state.worlds.some((item) => item.id === snapshot.worldId)) {
          state.selectedWorldId = snapshot.worldId;
        }
        if (snapshot.sceneId && state.scenes.some((item) => item.id === snapshot.sceneId)) {
          state.activeSceneId = snapshot.sceneId;
        }
        if (snapshot.keywordId && state.keywords.some((item) => item.id === snapshot.keywordId)) {
          state.activeKeywordId = snapshot.keywordId;
        }
        if (snapshot.promptVariant && promptVariants.some((item) => item.id === snapshot.promptVariant)) {
          state.promptVariant = snapshot.promptVariant;
          localStorage.setItem(storage.promptVariant, state.promptVariant);
        }
        saveScenes({ track: false });
        saveKeywords({ track: false });
        saveWorlds({ track: false });
        saveCharacters({ track: false });
        renderAll();
        if (options.promptText) {
          el.promptOutput.value = options.promptText;
          state.promptDraftsV3[promptDraftKey()] = el.promptOutput.value;
          savePromptDrafts();
        }
        renderPromptPresetControls();
      }

      function applySelectedPromptPreset() {
        const preset = state.promptPresets.find((item) => item.id === el.promptPresetSelect?.value);
        if (!preset) {
          showToast("적용할 프리셋을 선택해주세요");
          return;
        }
        applyPromptSnapshot(preset);
        showToast("프리셋 조합을 적용했어요 🐰");
      }

      function recordPromptHistory(text = el.promptOutput?.value || "") {
        // 제거된 기능이라 최근 생성 기록도 남기지 않습니다.
      }

      function applySelectedPromptHistory() {
        const entry = state.promptHistory.find((item) => item.id === el.promptHistorySelect?.value);
        if (!entry) {
          showToast("불러올 최근 기록을 선택해주세요");
          return;
        }
        applyPromptSnapshot(entry, { promptText: entry.prompt });
        showToast("최근 프롬프트를 불러왔어요 ✨");
      }

      function clearPromptHistory() {
        state.promptHistory = [];
        savePromptHistory();
        renderPromptPresetControls();
        showToast("최근 프롬프트 기록을 비웠어요");
      }



























      function renderPrompt(forceRegenerate = false) {
        const key = promptDraftKey();
        if (forceRegenerate) {
          delete state.promptDraftsV3[key];
          savePromptDrafts();
        }
        el.promptOutput.value = state.promptDraftsV3[key] || buildPrompt();
        renderPromptSelection();
      }

      function renderAll() {
        renderResponsiveLayoutControls();
        renderUndoDeleteButton();
        renderRecentActivityButton();
        renderSceneFilters();
        renderScenes();
        renderKeywords();
        renderCharacterTagFilters();
        renderCharacters();
        renderCharacterEditor();
        renderWorldLibrary();
        renderPromptVariantOptions();
        renderPrompt();
        renderPromptPresetControls();
      }

      const importExportModule = window.PC_IMPORT_EXPORT.create({
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
        renumberScenesByOrder: (...args) => sceneModule.renumberScenesByOrder(...args),
        renumberKeywordsByOrder: (...args) => keywordModule.renumberKeywordsByOrder(...args),
        renderAll: (...args) => renderAll(...args)
      });
      uiModule.bindEvents();
      sceneModule.bindEvents();
      keywordModule.bindEvents();
      characterModule.bindEvents();
      worldModule.bindEvents();

      el.promptVariantSelect.addEventListener("change", (event) => {
        state.promptVariant = event.target.value;
        localStorage.setItem(storage.promptVariant, state.promptVariant);
        renderPrompt();
        renderPromptPresetControls();
      });

      el.regeneratePromptButton.addEventListener("click", () => {
        renderPrompt(true);
        recordPromptHistory(el.promptOutput.value);
        showToast("프롬프트를 새로 만들었어요 ✨");
      });

      el.promptOutput.addEventListener("input", () => {
        state.promptDraftsV3[promptDraftKey()] = el.promptOutput.value;
        savePromptDrafts();
      });

      el.copyPromptButton.addEventListener("click", () => {
        copyText(el.promptOutput.value, "프롬프트");
        recordPromptHistory(el.promptOutput.value);
      });
      if (el.savePromptPresetButton) {
        el.savePromptPresetButton.addEventListener("click", saveCurrentPromptPreset);
      }
      if (el.promptPresetNameInput) {
        el.promptPresetNameInput.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            saveCurrentPromptPreset();
          }
        });
      }
      if (el.promptPresetSelect) {
        el.promptPresetSelect.addEventListener("change", renderPromptPresetControls);
      }
      if (el.applyPromptPresetButton) {
        el.applyPromptPresetButton.addEventListener("click", applySelectedPromptPreset);
      }
      if (el.deletePromptPresetButton) {
        el.deletePromptPresetButton.addEventListener("click", deleteSelectedPromptPreset);
      }
      if (el.promptHistorySelect) {
        el.promptHistorySelect.addEventListener("change", renderPromptPresetControls);
      }
      if (el.applyPromptHistoryButton) {
        el.applyPromptHistoryButton.addEventListener("click", applySelectedPromptHistory);
      }
      if (el.clearPromptHistoryButton) {
        el.clearPromptHistoryButton.addEventListener("click", clearPromptHistory);
      }
      if (el.undoDeleteButton) {
        el.undoDeleteButton.addEventListener("click", restoreLastDeleted);
      }
      if (el.recentActivityButton) {
        el.recentActivityButton.addEventListener("click", openActivityHistory);
      }
      el.activityModal.addEventListener("click", (event) => {
        if (event.target.closest("[data-activity-close]")) {
          closeActivityHistory();
          return;
        }

        const filterButton = event.target.closest("[data-activity-filter]");
        if (filterButton) {
          state.activityFilter = filterButton.dataset.activityFilter;
          renderActivityHistory();
          return;
        }

        const restoreButton = event.target.closest("[data-activity-restore]");
        if (restoreButton) {
          if (restoreButton.dataset.activitySource === "delete") {
            restoreDeletedItem(restoreButton.dataset.activityRestore);
          } else {
            restoreModifiedItem(restoreButton.dataset.activityRestore);
          }
        }
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !el.activityModal.hidden) {
          closeActivityHistory();
        }
      });
      importExportModule.bindEvents();
      function enableHorizontalWheelScroll(element) {
        if (!element || element.dataset.wheelHorizontal === "true") {
          return;
        }
        element.dataset.wheelHorizontal = "true";
        element.addEventListener("wheel", (event) => {
          if (!event.deltaY || element.scrollWidth <= element.clientWidth) {
            return;
          }
          event.preventDefault();
          element.scrollLeft += event.deltaY;
        }, { passive: false });
      }

      enableHorizontalWheelScroll(el.sceneFilters);
      enableHorizontalWheelScroll(el.characterTagFilters);

      window.PC_APP_CONTEXT = {
        get state() {
          return state;
        },
        get el() {
          return el;
        },
        compact,
        showToast: showAppToast,
        renderAll: (...args) => renderAll(...args),
        renderPrompt: (...args) => renderPrompt(...args),
        saveScenes: (...args) => saveScenes(...args),
        saveSceneCategories: (...args) => saveSceneCategories(...args),
        saveKeywordCategories: (...args) => saveKeywordCategories(...args),
        saveCharacters: (...args) => saveCharacters(...args),
        saveCharacterTags: (...args) => saveCharacterTags(...args),
        pushDeletedItem: (...args) => pushDeletedItem(...args),
        getSelectedCharacter,
        getSelectedWorld,
        getCharacterWorld
      };

      if (typeof sceneModule.renumberScenesByOrder === "function") {
        sceneModule.renumberScenesByOrder();
      }
      if (typeof keywordModule.renumberKeywordsByOrder === "function") {
        keywordModule.renumberKeywordsByOrder();
      }

      if (!state.scenes.some((template) => template.id === state.activeSceneId)) {
        state.activeSceneId = "";
      }

      if (!state.keywords.some((keyword) => keyword.id === state.activeKeywordId)) {
        state.activeKeywordId = "";
      }

      if (!state.worlds.some((world) => world.id === state.selectedWorldId)) {
        state.selectedWorldId = state.worlds[0].id;
      }

      state.characters.forEach((character) => {
        if (!state.worlds.some((world) => world.id === character.worldId)) {
          character.worldId = state.selectedWorldId;
        }
      });

      const availableKeywordIds = new Set(state.keywords.map((keyword) => keyword.id));
      state.characters.forEach((character) => {
        character.keywordIds = character.keywordIds
          .filter((id) => availableKeywordIds.has(id))
          .slice(0, 15);
      });
      state.worlds.forEach((world) => {
        world.keywordIds = world.keywordIds
          .filter((id) => availableKeywordIds.has(id))
          .slice(0, 5);
      });

      saveSceneCategories();
      saveKeywordCategories();
      saveCharacterTags();
      saveScenes({ track: false });
      saveKeywords({ track: false });
      saveCharacters({ track: false });
      saveWorlds({ track: false });
      renderAll();
    })();


/* v58: ambient background video playback speed */
(() => {
  const AMBIENT_PLAYBACK_RATE = 0.8;
  const applyAmbientPlaybackRate = () => {
    document.querySelectorAll(".ambient-video").forEach((video) => {
      if (!(video instanceof HTMLVideoElement)) {
        return;
      }
      try {
        video.playbackRate = AMBIENT_PLAYBACK_RATE;
        video.defaultPlaybackRate = AMBIENT_PLAYBACK_RATE;
      } catch (error) {
        // Some WebView builds can reject playbackRate while metadata is loading.
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyAmbientPlaybackRate, { once: true });
  } else {
    applyAmbientPlaybackRate();
  }

  document.addEventListener("loadedmetadata", (event) => {
    if (event.target instanceof HTMLVideoElement && event.target.classList.contains("ambient-video")) {
      try {
        event.target.playbackRate = AMBIENT_PLAYBACK_RATE;
        event.target.defaultPlaybackRate = AMBIENT_PLAYBACK_RATE;
      } catch (error) {}
    }
  }, true);

  document.addEventListener("play", (event) => {
    if (event.target instanceof HTMLVideoElement && event.target.classList.contains("ambient-video")) {
      try {
        event.target.playbackRate = AMBIENT_PLAYBACK_RATE;
      } catch (error) {}
    }
  }, true);
})();
