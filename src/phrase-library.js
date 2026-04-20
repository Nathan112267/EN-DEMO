export const PHRASE_LIBRARY = [
  {
    id: "coffee",
    category: "饮品",
    canonical: "帮我点杯咖啡",
    keywords: ["咖啡", "点杯", "喝"],
    aliases: [
      "帮我点一杯咖啡",
      "帮我买杯咖啡",
      "给我来杯咖啡",
      "我想喝杯咖啡",
      "帮我弄杯咖啡",
    ],
  },
  {
    id: "taxi",
    category: "出行",
    canonical: "帮我打个车",
    keywords: ["打车", "叫车", "出租车", "约车"],
    aliases: [
      "帮我叫辆车",
      "帮我叫个出租车",
      "现在帮我打车",
      "帮我约个车",
      "帮我叫车",
    ],
  },
  {
    id: "meeting_time",
    category: "日程",
    canonical: "明天几点的会议",
    keywords: ["明天", "会议", "几点", "开会"],
    aliases: [
      "明天会议几点开始",
      "明天什么时候开会",
      "明天开会是几点",
      "明天会议时间是什么",
      "帮我看下明天的会议时间",
    ],
  },
  {
    id: "weather",
    category: "天气",
    canonical: "今天天气如何",
    keywords: ["今天", "天气", "下雨"],
    aliases: [
      "今天天气怎么样",
      "今天外面天气怎么样",
      "今天会不会下雨",
      "帮我看看今天天气",
      "今天的天气如何",
    ],
  },
  {
    id: "joke",
    category: "娱乐",
    canonical: "讲个笑话",
    keywords: ["笑话", "好笑", "讲"],
    aliases: [
      "给我讲个笑话",
      "说个笑话",
      "来个笑话",
      "讲一个好笑的",
      "说个好笑的事情",
    ],
  },
  {
    id: "food_search",
    category: "美食",
    canonical: "帮我搜一下美食",
    keywords: ["美食", "好吃", "附近", "餐厅"],
    aliases: [
      "帮我找点好吃的",
      "附近有什么好吃的",
      "搜一下附近美食",
      "给我推荐点美食",
      "帮我看看附近餐厅",
    ],
  },
  {
    id: "meeting_room",
    category: "办公",
    canonical: "帮我订一个会议室",
    keywords: ["会议室", "预订", "预约"],
    aliases: [
      "帮我预订会议室",
      "订一下会议室",
      "帮我约个会议室",
      "帮我订一间会议室",
      "帮我预约一个会议室",
    ],
  },
];

function normalizeText(text) {
  return (text || "")
    .replace(/[，。！？、,.!?:：；;"'“”‘’（）()【】\-[\]\s]/g, "")
    .trim();
}

function levenshteinDistance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const table = Array.from({ length: rows }, () => new Array(cols).fill(0));

  for (let row = 0; row < rows; row += 1) {
    table[row][0] = row;
  }

  for (let col = 0; col < cols; col += 1) {
    table[0][col] = col;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const substitutionCost = a[row - 1] === b[col - 1] ? 0 : 1;
      table[row][col] = Math.min(
        table[row - 1][col] + 1,
        table[row][col - 1] + 1,
        table[row - 1][col - 1] + substitutionCost
      );
    }
  }

  return table[a.length][b.length];
}

function characterOverlapScore(a, b) {
  const counts = new Map();
  for (const character of a) {
    counts.set(character, (counts.get(character) || 0) + 1);
  }

  let overlap = 0;
  for (const character of b) {
    const count = counts.get(character) || 0;
    if (count > 0) {
      overlap += 1;
      counts.set(character, count - 1);
    }
  }

  return overlap / Math.max(a.length, b.length, 1);
}

function keywordScore(input, keywords) {
  if (!keywords?.length) {
    return 0;
  }

  const matched = keywords.filter((keyword) => input.includes(keyword)).length;
  return Math.min(0.24, matched * 0.08);
}

function aliasScore(input, alias, keywords) {
  const normalizedInput = normalizeText(input);
  const normalizedAlias = normalizeText(alias);
  if (!normalizedInput || !normalizedAlias) {
    return 0;
  }

  const maxLength = Math.max(normalizedInput.length, normalizedAlias.length, 1);
  const editScore = 1 - levenshteinDistance(normalizedInput, normalizedAlias) / maxLength;
  const overlap = characterOverlapScore(normalizedInput, normalizedAlias);
  const containsBonus =
    normalizedAlias.includes(normalizedInput) || normalizedInput.includes(normalizedAlias) ? 0.08 : 0;
  const leadingBonus = normalizedAlias[0] === normalizedInput[0] ? 0.04 : 0;

  const score =
    editScore * 0.68 +
    overlap * 0.2 +
    keywordScore(normalizedInput, keywords) +
    containsBonus +
    leadingBonus;

  return Math.max(0, Math.min(1, score));
}

export function matchPhraseToLibrary(input) {
  const normalizedInput = normalizeText(input);
  if (!normalizedInput) {
    return null;
  }

  let bestMatch = null;

  for (const entry of PHRASE_LIBRARY) {
    const candidates = [entry.canonical, ...entry.aliases];
    for (const alias of candidates) {
      const score = aliasScore(normalizedInput, alias, entry.keywords);
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          entry,
          alias,
          score,
        };
      }
    }
  }

  if (!bestMatch) {
    return null;
  }

  return {
    ...bestMatch,
    level:
      bestMatch.score >= 0.82
        ? "high"
        : bestMatch.score >= 0.62
          ? "medium"
          : "low",
  };
}
