window.PC_DATA = window.PC_DATA || {};
window.PC_DATA.sourceTemplates = typeof templates !== "undefined" && Array.isArray(templates) ? templates : [];
      const sourceWorlds = typeof defaultWorlds !== "undefined" && Array.isArray(defaultWorlds) ? defaultWorlds : [];
      const sourceCategories = typeof categories !== "undefined" && Array.isArray(categories) ? categories : ["전체"];
window.PC_DATA.roleTags = ["주인공", "서브", "조력자", "라이벌"];
      const promptVariants = [
        { id: "character", label: "캐릭터 기본 정보" },
        { id: "characterIntro", label: "캐릭터 소개" },
        { id: "world", label: "세계관 프롬프트" },
        { id: "worldIntro", label: "세계관 소개" },
        { id: "niji", label: "사진 출력: 니지저니" },
        { id: "chatgpt", label: "사진 출력: ChatGPT" }
      ];
window.PC_DATA.defaultKeywordEntries = [
        {
          id: "KW-001",
          title: "생일",
          triggers: "생일, 태어난 날, 케이크",
          content: "캐릭터의 생일은 X월 XX일이다."
        },
        {
          id: "KW-002",
          title: "필드형 게이트",
          triggers: "필드형, 설원, 초원, 보스",
          content: "필드형 게이트에는 여러 환경이 존재한다. 설원이나 초원, 그리고 보스를 처리해야 게이트에서 탈출할 수 있다."
        }
      ];
window.PC_DATA.supplementalKeywordEntries = [
        {
          id: "KW-PRESET-FIRST-MEETING",
          title: "첫 만남",
          triggers: "첫 만남, 처음 만난 날, 초면, 첫인상",
          content: "{{char}}와 {{user}}가 처음 만난 장소와 사건은 X이며, 서로의 첫인상은 X였다."
        },
        {
          id: "KW-PRESET-RELATIONSHIP-STAGE",
          title: "관계 단계",
          triggers: "관계, 사이, 친밀도, 신뢰",
          content: "현재 {{char}}와 {{user}}의 관계는 X 단계이며, 서로에 대한 신뢰도는 X이다."
        },
        {
          id: "KW-PRESET-CALLING-NAME",
          title: "호칭",
          triggers: "호칭, 이름, 부르는 말, 애칭",
          content: "{{char}}는 {{user}}를 평소 X라고 부르며, 감정이 격해질 때는 X라고 부른다."
        },
        {
          id: "KW-PRESET-LIKES",
          title: "좋아하는 것",
          triggers: "좋아해, 취향, 좋아하는 것, 선호",
          content: "캐릭터가 좋아하는 것은 X이며, 이를 접하면 평소보다 X한 반응을 보인다."
        },
        {
          id: "KW-PRESET-DISLIKES",
          title: "싫어하는 것",
          triggers: "싫어해, 기피, 싫어하는 것, 불호",
          content: "캐릭터가 싫어하거나 피하는 것은 X이며, 그 이유는 X이다."
        },
        {
          id: "KW-PRESET-SECRET",
          title: "숨겨진 비밀",
          triggers: "비밀, 숨기는 것, 진실, 들키다",
          content: "캐릭터가 다른 사람에게 숨기고 있는 비밀은 X이며, 이 사실이 드러나는 것을 두려워한다."
        },
        {
          id: "KW-PRESET-TRAUMA",
          title: "트라우마",
          triggers: "트라우마, 과거, 공포, 기억",
          content: "캐릭터는 과거의 X 사건으로 인해 X 상황에서 불안하거나 방어적인 반응을 보인다."
        },
        {
          id: "KW-PRESET-JEALOUSY",
          title: "질투",
          triggers: "질투, 다른 사람, 독점욕, 신경 쓰여",
          content: "캐릭터는 질투를 느끼면 X한 태도를 보이며, 감정을 직접 인정하기보다 X한다."
        },
        {
          id: "KW-PRESET-INJURY",
          title: "부상",
          triggers: "부상, 상처, 다치다, 치료",
          content: "캐릭터는 현재 X 부위에 부상이 있으며, 무리하면 X 증상이 심해진다."
        },
        {
          id: "KW-PRESET-NIGHTMARE",
          title: "악몽",
          triggers: "악몽, 잠, 꿈, 잠꼬대",
          content: "캐릭터는 X에 관한 악몽을 반복해서 꾸며, 잠에서 깬 직후에는 X한 상태가 된다."
        },
        {
          id: "KW-PRESET-CONTACT-HABIT",
          title: "연락 습관",
          triggers: "연락, 문자, 메시지, 답장, 전화",
          content: "캐릭터의 연락 습관은 X이며, 급한 상황에서는 X 방식으로 연락한다."
        },
        {
          id: "KW-PRESET-DAY-OFF",
          title: "휴일",
          triggers: "휴일, 쉬는 날, 주말, 휴가",
          content: "캐릭터는 쉬는 날에 주로 X를 하며, 특별한 약속이 없을 때는 X에서 시간을 보낸다."
        },
        {
          id: "KW-PRESET-ORGANIZATION",
          title: "소속 조직",
          triggers: "조직, 소속, 길드, 기사단, 협회, 회사",
          content: "캐릭터가 속한 조직은 X이며, 조직의 목적과 내부 규칙은 X이다."
        },
        {
          id: "KW-PRESET-ABILITY-COST",
          title: "능력의 대가",
          triggers: "능력, 힘, 대가, 부작용, 마력",
          content: "능력 X를 사용하면 대가로 X를 잃거나 부작용 X가 발생한다."
        },
        {
          id: "KW-PRESET-FORBIDDEN-AREA",
          title: "금지 구역",
          triggers: "금지 구역, 출입 금지, 봉인, 위험 지역",
          content: "세계관의 금지 구역은 X이며, 출입이 제한된 이유와 내부의 위험 요소는 X이다."
        }
      ];
