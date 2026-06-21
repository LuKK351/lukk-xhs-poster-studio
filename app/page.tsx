"use client";

import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";

type ThemeDefinition = {
  id: string;
  name: string;
  mood: string;
  preset: string;
  description: string;
  mode: "paper" | "sage" | "vintage" | "obsidian" | "archive" | "swiss";
  palette: {
    page: string;
    pageAlt: string;
    text: string;
    muted: string;
    accent: string;
    accentSoft: string;
    border: string;
    shadow: string;
    glow: string;
  };
  surface: {
    grainAlpha: number;
    vignetteAlpha: number;
    washStrength: number;
    innerFrameAlpha: number;
    innerFrameInset: number;
    titleAccentMix: number;
    footerLineAlpha: number;
    footerTextAlpha: number;
    previewShadow: string;
  };
  components: {
    quoteFillAlpha: number;
    quoteStrokeAlpha: number;
    quoteBarAlpha: number;
    quoteRadius: number;
    highlightUnderlineAlpha: number;
    highlightMarkerAlpha: number;
    highlightDashAlpha: number;
  };
  editor: {
    titleSize: number;
    bodySize: number;
    lineHeight: number;
    titleFontMode: TitleFontMode;
    highlightStyle: HighlightStyle;
  };
};

type PosterPage = {
  id: string;
  kind: "cover" | "body";
  title: string;
  paragraphs: string[];
};

type TypographySettings = {
  titleSize: number;
  bodySize: number;
  lineHeight: number;
  titleFontMode: TitleFontMode;
};

type FooterRightMode = "auto" | "blank" | "page" | "date";
type CardCornerMode = "rounded" | "square";
type SidebarTab = "content" | "style";
type TitleFontMode = "serif" | "kai" | "sans";
type HighlightStyle = "underline" | "marker" | "border";
type TextRange = { start: number; end: number };

type PosterMetrics = {
  titleSize: number;
  titleLineHeight: number;
  bodySize: number;
  bodyLineHeight: number;
  bodyParagraphGap: number;
  titleLines: string[];
  titleAccentRanges: TextRange[];
  titleStartY: number;
  separatorY: number;
  bodyTopY: number;
  bodyBottomY: number;
  bodyWidth: number;
};

type InlineToken = {
  text: string;
  bold: boolean;
  mark: boolean;
};

type InlineLine = {
  tokens: InlineToken[];
};

type ParagraphBlock = {
  kind: "body" | "quote" | "subheading";
  raw: string;
};

const THEMES: ThemeDefinition[] = [
  {
    id: "moss-paper",
    name: "苔绿纸书",
    mood: "浅苔纸面与出版物墨感",
    preset: "浅底苔绿纸书",
    description: "浅苔纸面、安静高级，适合默认长期使用",
    mode: "paper",
    palette: {
      page: "#f3f1ea",
      pageAlt: "#e6ebdf",
      text: "#1f2b22",
      muted: "#667368",
      accent: "#566f57",
      accentSoft: "rgba(86, 111, 87, 0.14)",
      border: "rgba(63, 77, 66, 0.12)",
      shadow: "rgba(63, 77, 66, 0.12)",
      glow: "rgba(206, 215, 201, 0.34)"
    },
    surface: {
      grainAlpha: 0.03,
      vignetteAlpha: 0.038,
      washStrength: 0.28,
      innerFrameAlpha: 0.11,
      innerFrameInset: 24,
      titleAccentMix: 0.62,
      footerLineAlpha: 0.2,
      footerTextAlpha: 0.9,
      previewShadow: "0 26px 54px rgba(57, 72, 60, 0.11), 0 2px 18px rgba(255,255,255,0.42) inset"
    },
    components: {
      quoteFillAlpha: 0.042,
      quoteStrokeAlpha: 0.074,
      quoteBarAlpha: 0.72,
      quoteRadius: 22,
      highlightUnderlineAlpha: 0.48,
      highlightMarkerAlpha: 0.22,
      highlightDashAlpha: 0.72
    },
    editor: {
      titleSize: 62,
      bodySize: 31,
      lineHeight: 1.68,
      titleFontMode: "serif",
      highlightStyle: "underline"
    }
  },
  {
    id: "forest-archive",
    name: "森林档案",
    mood: "深林墨绿与收藏级画册气质",
    preset: "深底森林档案",
    description: "深绿画册、暖米字色，适合特别篇与情绪款",
    mode: "archive",
    palette: {
      page: "#18211b",
      pageAlt: "#243128",
      text: "#ebe1cf",
      muted: "#c1b5a1",
      accent: "#8ea58d",
      accentSoft: "rgba(142, 165, 141, 0.15)",
      border: "rgba(235, 225, 207, 0.12)",
      shadow: "rgba(0, 0, 0, 0.34)",
      glow: "rgba(151, 171, 148, 0.1)"
    },
    surface: {
      grainAlpha: 0.07,
      vignetteAlpha: 0.16,
      washStrength: 0.22,
      innerFrameAlpha: 0.14,
      innerFrameInset: 22,
      titleAccentMix: 0.64,
      footerLineAlpha: 0.24,
      footerTextAlpha: 0.92,
      previewShadow: "0 30px 62px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.04) inset"
    },
    components: {
      quoteFillAlpha: 0.072,
      quoteStrokeAlpha: 0.12,
      quoteBarAlpha: 0.9,
      quoteRadius: 20,
      highlightUnderlineAlpha: 0.56,
      highlightMarkerAlpha: 0.24,
      highlightDashAlpha: 0.76
    },
    editor: {
      titleSize: 64,
      bodySize: 31,
      lineHeight: 1.72,
      titleFontMode: "serif",
      highlightStyle: "underline"
    }
  },
  {
    id: "sage-dawn",
    name: "晨鼠尾草",
    mood: "植物纸面与野外手稿感",
    preset: "静谧植物手稿",
    description: "安静青绿、自然纸张、适合复盘随笔",
    mode: "sage",
    palette: {
      page: "#f4efe5",
      pageAlt: "#e7dece",
      text: "#1d2a21",
      muted: "#657064",
      accent: "#476a55",
      accentSoft: "rgba(71, 106, 85, 0.16)",
      border: "rgba(60, 79, 66, 0.14)",
      shadow: "rgba(76, 88, 78, 0.12)",
      glow: "rgba(199, 210, 194, 0.26)"
    },
    surface: {
      grainAlpha: 0.044,
      vignetteAlpha: 0.05,
      washStrength: 0.32,
      innerFrameAlpha: 0.11,
      innerFrameInset: 24,
      titleAccentMix: 0.64,
      footerLineAlpha: 0.18,
      footerTextAlpha: 0.88,
      previewShadow: "0 24px 50px rgba(73, 86, 74, 0.12), 0 2px 16px rgba(255,255,255,0.36) inset"
    },
    components: {
      quoteFillAlpha: 0.048,
      quoteStrokeAlpha: 0.075,
      quoteBarAlpha: 0.7,
      quoteRadius: 22,
      highlightUnderlineAlpha: 0.42,
      highlightMarkerAlpha: 0.2,
      highlightDashAlpha: 0.66
    },
    editor: {
      titleSize: 60,
      bodySize: 30,
      lineHeight: 1.7,
      titleFontMode: "sans",
      highlightStyle: "underline"
    }
  },
  {
    id: "peach-cloud",
    name: "桃云",
    mood: "暖沙旧胶片与生活感",
    preset: "暖沙复古胶片",
    description: "暖木暖沙、轻复古、适合情绪和生活内容",
    mode: "vintage",
    palette: {
      page: "#f6ede3",
      pageAlt: "#e8d7c8",
      text: "#392c24",
      muted: "#7c6a5e",
      accent: "#a26948",
      accentSoft: "rgba(162, 105, 72, 0.17)",
      border: "rgba(106, 78, 58, 0.14)",
      shadow: "rgba(89, 65, 50, 0.16)",
      glow: "rgba(220, 188, 164, 0.3)"
    },
    surface: {
      grainAlpha: 0.04,
      vignetteAlpha: 0.065,
      washStrength: 0.38,
      innerFrameAlpha: 0.1,
      innerFrameInset: 24,
      titleAccentMix: 0.6,
      footerLineAlpha: 0.17,
      footerTextAlpha: 0.9,
      previewShadow: "0 28px 58px rgba(101, 75, 56, 0.14), 0 10px 34px rgba(255,255,255,0.18) inset"
    },
    components: {
      quoteFillAlpha: 0.06,
      quoteStrokeAlpha: 0.08,
      quoteBarAlpha: 0.74,
      quoteRadius: 24,
      highlightUnderlineAlpha: 0.48,
      highlightMarkerAlpha: 0.26,
      highlightDashAlpha: 0.7
    },
    editor: {
      titleSize: 62,
      bodySize: 31,
      lineHeight: 1.72,
      titleFontMode: "serif",
      highlightStyle: "marker"
    }
  },
  {
    id: "deep-obsidian",
    name: "深邃曜石",
    mood: "暗黑画册与金属油墨",
    preset: "暗黑画册",
    description: "沉静深灰、暖金点缀、适合商业与科技",
    mode: "obsidian",
    palette: {
      page: "#141312",
      pageAlt: "#221f1c",
      text: "#ece2cf",
      muted: "#b6a78f",
      accent: "#d4a04a",
      accentSoft: "rgba(212, 160, 74, 0.16)",
      border: "rgba(236, 226, 207, 0.12)",
      shadow: "rgba(0, 0, 0, 0.32)",
      glow: "rgba(212, 160, 74, 0.12)"
    },
    surface: {
      grainAlpha: 0.1,
      vignetteAlpha: 0.22,
      washStrength: 0.28,
      innerFrameAlpha: 0.16,
      innerFrameInset: 22,
      titleAccentMix: 0.76,
      footerLineAlpha: 0.28,
      footerTextAlpha: 0.92,
      previewShadow: "0 30px 62px rgba(0,0,0,0.3), 0 1px 0 rgba(255,255,255,0.05) inset"
    },
    components: {
      quoteFillAlpha: 0.08,
      quoteStrokeAlpha: 0.14,
      quoteBarAlpha: 0.92,
      quoteRadius: 20,
      highlightUnderlineAlpha: 0.56,
      highlightMarkerAlpha: 0.3,
      highlightDashAlpha: 0.8
    },
    editor: {
      titleSize: 64,
      bodySize: 31,
      lineHeight: 1.7,
      titleFontMode: "serif",
      highlightStyle: "underline"
    }
  },
  {
    id: "swiss-modern",
    name: "瑞士极简",
    mood: "硬边网格与现代海报感",
    preset: "瑞士现代主义",
    description: "直角几何、强对比、适合结构化表达",
    mode: "swiss",
    palette: {
      page: "#f8f7f2",
      pageAlt: "#f8f7f2",
      text: "#121212",
      muted: "#757575",
      accent: "#1552c4",
      accentSoft: "rgba(21, 82, 196, 0.12)",
      border: "rgba(18, 18, 18, 0.2)",
      shadow: "rgba(18, 18, 18, 0.06)",
      glow: "rgba(21, 82, 196, 0.08)"
    },
    surface: {
      grainAlpha: 0,
      vignetteAlpha: 0.02,
      washStrength: 0,
      innerFrameAlpha: 0.22,
      innerFrameInset: 20,
      titleAccentMix: 0.86,
      footerLineAlpha: 0.22,
      footerTextAlpha: 0.92,
      previewShadow: "0 14px 28px rgba(18,18,18,0.06), 0 0 0 1px rgba(18,18,18,0.12) inset"
    },
    components: {
      quoteFillAlpha: 0.03,
      quoteStrokeAlpha: 0.1,
      quoteBarAlpha: 0.94,
      quoteRadius: 14,
      highlightUnderlineAlpha: 0.88,
      highlightMarkerAlpha: 0.22,
      highlightDashAlpha: 0.92
    },
    editor: {
      titleSize: 68,
      bodySize: 29,
      lineHeight: 1.58,
      titleFontMode: "sans",
      highlightStyle: "border"
    }
  }
];

const DEFAULT_CONTENT = `为什么记录会在 AI 时代重新变得重要

以前很多人觉得记录只是为了以后回看，所以它像一种可做可不做的习惯。

但现在我越来越觉得，记录真正重要的地方，不是存档，而是调用。

### 01 真正变重要的是调用

你写下来的每一句判断、每一次情绪、每一个细节，在当下看起来都很普通。可只要它被稳定留下来，它就会在未来某个时刻重新回来，帮你组织表达、校准认知、生成新的内容。

AI 不会凭空理解一个人。它只能读取你留下来的材料。所以一个人有没有持续记录，差别会越来越大。

> 记录不是文艺爱好，而是一种正在变成基础设施的能力。

这是普通文字，**这是柔和重点**，后面继续普通文字。

==这是更醒目的强调==`;

const PAGE_WIDTH = 720;
const PAGE_HEIGHT = 960;
const CONTENT_LEFT = 84;
const CONTENT_RIGHT = 636;
const CONTENT_WIDTH = CONTENT_RIGHT - CONTENT_LEFT;
const FOOTER_LINE_LEFT = 108;
const FOOTER_LINE_RIGHT = 612;
const FOOTER_LINE_Y = 850;
const FOOTER_TEXT_Y = 890;
const TITLE_FONT_FAMILY = "'Source Han Serif SC','Songti SC','STSong','Noto Serif SC',serif";
const BODY_FONT_FAMILY = "'PingFang SC','Hiragino Sans GB','Noto Sans SC',sans-serif";
const TITLE_BREAK_AVOID_START = new Set(Array.from("地的了着吗呢啊呀和与及并而但也又都就才还再把被让给向对将"));
const TITLE_BREAK_AVOID_END = new Set(Array.from("在把让向对与和及并而但也又都就才还再很太地的了"));
const NO_LINE_START = new Set(Array.from("，。！？、；：）》」』】〕］〉〗’”%、,.!?;:)]}"));
const NO_LINE_END = new Set(Array.from("（《「『【〔［〈〖‘“([{"));

const TITLE_FONT_MODES: Record<
  TitleFontMode,
  { label: string; family: string; latinFamily: string }
> = {
  serif: {
    label: "知性宋体",
    family: TITLE_FONT_FAMILY,
    latinFamily: TITLE_FONT_FAMILY
  },
  kai: {
    label: "文气楷体",
    family: "'LXGW WenKai','Kaiti SC','STKaiti','Songti SC',serif",
    latinFamily: "'LXGW WenKai','Kaiti SC','STKaiti','Songti SC',serif"
  },
  sans: {
    label: "现代黑体",
    family: "'DingTalk JinBuTi','PingFang SC','Noto Sans SC',sans-serif",
    latinFamily: "'DingTalk JinBuTi','PingFang SC','Noto Sans SC',sans-serif"
  }
};

const INITIAL_THEME = THEMES[0];

function getTitleFontWeight(mode: TitleFontMode) {
  return mode === "sans" ? 600 : 500;
}

function getTitleTracking(size: number, mode: TitleFontMode) {
  const em = mode === "serif" ? 0.038 : mode === "kai" ? 0.026 : 0.018;
  return size * em;
}

function getTitleLineHeightRatio(mode: TitleFontMode) {
  return mode === "serif" ? 1.08 : mode === "kai" ? 1.1 : 1.06;
}

function parseInput(raw: string) {
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  if (!normalized) return { paragraphs: [] as string[] };
  const blocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  return { paragraphs: blocks };
}

function normalizeComparableText(text: string) {
  return text.replace(/\s+/g, "").replace(/[：:，,。！？!?；;、“”"'‘’（）()《》]/g, "").trim();
}

function getBeijingDateLabel() {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date()).replace(/\//g, ".");
}

function getTitleSegments(text: string) {
  const cleanText = text.trim();
  if (!cleanText) return [] as string[];
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("zh-Hans", { granularity: "word" });
    const segments = Array.from(segmenter.segment(cleanText)).map((item) => item.segment).filter(Boolean);
    if (segments.length > 0) return segments;
  }
  return Array.from(cleanText);
}

function splitLongParagraph(text: string, chunkSize: number) {
  if (text.includes("\n")) {
    const manualLines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    if (manualLines.length > 1) {
      const chunks: string[] = [];
      let current = "";
      for (const line of manualLines) {
        const candidate = current ? `${current}\n${line}` : line;
        if (candidate.length > chunkSize && current) {
          chunks.push(current.trim());
          current = line;
        } else {
          current = candidate;
        }
      }
      if (current.trim()) chunks.push(current.trim());
      return chunks;
    }
  }

  const sentences = text.split(/(?<=[。！？!?；;])/).map((item) => item.trim()).filter(Boolean);
  if (sentences.length <= 1) {
    const slices: string[] = [];
    let cursor = 0;
    while (cursor < text.length) {
      slices.push(text.slice(cursor, cursor + chunkSize).trim());
      cursor += chunkSize;
    }
    return slices.filter(Boolean);
  }

  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const candidate = `${current}${sentence}`;
    if (candidate.length > chunkSize && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = candidate;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function getMeasureContext(font: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("无法初始化测量画布。");
  context.font = font;
  return context;
}

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  if (value.length !== 6) {
    return `rgba(36, 52, 70, ${alpha})`;
  }
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  if (value.length !== 6) return [36, 52, 70] as const;
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16)
  ] as const;
}

function mixHexColors(fromHex: string, toHex: string, ratio: number) {
  const normalize = (value: string) => value.replace("#", "");
  const from = normalize(fromHex);
  const to = normalize(toHex);
  if (from.length !== 6 || to.length !== 6) return toHex;

  const mix = (start: number, end: number) => Math.round(start + (end - start) * ratio);
  const fromRgb = [
    Number.parseInt(from.slice(0, 2), 16),
    Number.parseInt(from.slice(2, 4), 16),
    Number.parseInt(from.slice(4, 6), 16)
  ];
  const toRgb = [
    Number.parseInt(to.slice(0, 2), 16),
    Number.parseInt(to.slice(2, 4), 16),
    Number.parseInt(to.slice(4, 6), 16)
  ];

  return `rgb(${mix(fromRgb[0], toRgb[0])}, ${mix(fromRgb[1], toRgb[1])}, ${mix(fromRgb[2], toRgb[2])})`;
}

function getThemeSwatchBackground(theme: ThemeDefinition) {
  switch (theme.mode) {
    case "swiss":
      return `linear-gradient(90deg, ${theme.palette.accent} 0 12px, ${theme.palette.page} 12px 100%)`;
    case "archive":
      return `radial-gradient(circle at 78% 22%, ${hexToRgba(theme.palette.accent, 0.22)}, transparent 24%), linear-gradient(180deg, ${theme.palette.pageAlt}, ${theme.palette.page})`;
    case "obsidian":
      return `radial-gradient(circle at 78% 22%, ${hexToRgba(theme.palette.accent, 0.26)}, transparent 26%), linear-gradient(180deg, ${theme.palette.pageAlt}, ${theme.palette.page})`;
    case "vintage":
      return `radial-gradient(circle at 24% 22%, ${theme.palette.glow}, transparent 34%), linear-gradient(180deg, ${theme.palette.pageAlt}, ${theme.palette.page})`;
    case "sage":
      return `radial-gradient(circle at 82% 20%, ${theme.palette.glow}, transparent 30%), linear-gradient(180deg, ${theme.palette.pageAlt}, ${theme.palette.page})`;
    case "paper":
      return `radial-gradient(circle at 24% 18%, ${theme.palette.glow}, transparent 32%), linear-gradient(180deg, ${theme.palette.pageAlt}, ${theme.palette.page})`;
    default:
      return `radial-gradient(circle at 18% 24%, ${theme.palette.glow}, transparent 34%), linear-gradient(180deg, ${theme.palette.pageAlt}, ${theme.palette.page})`;
  }
}

function isDarkPosterTheme(theme: ThemeDefinition) {
  return theme.mode === "obsidian" || theme.mode === "archive";
}

function resolveTitleFontFamily(mode: TitleFontMode, isLatin: boolean) {
  const config = TITLE_FONT_MODES[mode] ?? TITLE_FONT_MODES.serif;
  return isLatin ? config.latinFamily : config.family;
}

function parseTitleMarkup(raw: string) {
  const ranges: TextRange[] = [];
  let plainText = "";
  let sourceCursor = 0;
  let charCursor = 0;
  const pattern = /\*\*([\s\S]+?)\*\*/g;
  const countVisibleTitleChars = (text: string) => Array.from(text.replace(/\n/g, "")).length;

  for (const match of raw.matchAll(pattern)) {
    const matchIndex = match.index ?? 0;
    const before = raw.slice(sourceCursor, matchIndex);
    plainText += before;
    charCursor += countVisibleTitleChars(before);

    const emphasized = match[1] ?? "";
    plainText += emphasized;
    const emphasizedLength = countVisibleTitleChars(emphasized);
    if (emphasized.trim()) {
      ranges.push({ start: charCursor, end: charCursor + emphasizedLength });
    }
    charCursor += emphasizedLength;
    sourceCursor = matchIndex + match[0].length;
  }

  plainText += raw.slice(sourceCursor);
  return {
    plainText,
    accentRanges: ranges
  };
}

function parseInlineMarkdown(text: string) {
  const tokens: InlineToken[] = [];
  const pattern = /(\*\*[\s\S]+?\*\*|==[\s\S]+?==)/g;
  const parts = text.split(pattern).filter(Boolean);
  for (const part of parts) {
    const boldMatch = part.match(/^\*\*([\s\S]+)\*\*$/);
    if (boldMatch) {
      tokens.push({ text: boldMatch[1], bold: true, mark: false });
      continue;
    }
    const markMatch = part.match(/^==([\s\S]+)==$/);
    if (markMatch) {
      tokens.push({ text: markMatch[1], bold: false, mark: true });
      continue;
    }
    tokens.push({ text: part, bold: false, mark: false });
  }
  return tokens;
}

function getParagraphBlock(text: string): ParagraphBlock {
  const trimmed = text.trim();
  const markdownHeadingMatch = trimmed.match(/^#{1,6}\s+(.+)$/);
  if (markdownHeadingMatch) {
    return { kind: "subheading", raw: markdownHeadingMatch[1].trim() };
  }
  const quoteMatch = trimmed.match(/^>\s?(.*)$/);
  if (quoteMatch) {
    return { kind: "quote", raw: quoteMatch[1].trim() };
  }
  return { kind: "body", raw: trimmed };
}

function explodeInlineTokens(tokens: InlineToken[]) {
  return tokens.flatMap((token) =>
    Array.from(token.text).map((char) => ({
      text: char,
      bold: token.bold,
      mark: token.mark
    }))
  );
}

function serializeInlineTokens(tokens: InlineToken[]) {
  return tokens
    .map((token) => {
      if (token.bold) return `**${token.text}**`;
      if (token.mark) return `==${token.text}==`;
      return token.text;
    })
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .trim();
}

function getBodyTokenWidth(token: InlineToken, fontSize: number) {
  if (token.text === "\n") return 0;
  const font = `${token.bold ? 500 : token.mark ? 500 : 300} ${fontSize}px ${BODY_FONT_FAMILY}`;
  return getMeasureContext(font).measureText(token.text).width;
}

function wrapInlineTokensByWidth(tokens: InlineToken[], fontSize: number, maxWidth: number) {
  const charTokens = explodeInlineTokens(tokens);
  const lines: InlineLine[] = [];
  let currentLine: InlineToken[] = [];
  let currentWidth = 0;

  const pushLine = () => {
    if (currentLine.length > 0) {
      lines.push({ tokens: currentLine });
      currentLine = [];
      currentWidth = 0;
    }
  };

  for (const token of charTokens) {
    if (token.text === "\n") {
      pushLine();
      continue;
    }
    const tokenWidth = getBodyTokenWidth(token, fontSize);
    if (currentLine.length > 0 && currentWidth + tokenWidth > maxWidth) {
      pushLine();
    }
    const lastToken = currentLine[currentLine.length - 1];
    if (lastToken && lastToken.bold === token.bold && lastToken.mark === token.mark) {
      lastToken.text += token.text;
    } else {
      currentLine.push({ ...token });
    }
    currentWidth += tokenWidth;
  }
  pushLine();
  return lines;
}

function splitInlineLines(lines: InlineLine[], count: number) {
  const taken = lines.slice(0, count);
  const rest = lines.slice(count);
  const serializeWithBlockKind = (raw: string, kind: ParagraphBlock["kind"]) => {
    if (!raw) return "";
    if (kind === "quote") return `> ${raw}`;
    if (kind === "subheading") return `### ${raw}`;
    return raw;
  };
  return {
    takenRaw: (kind: ParagraphBlock["kind"]) => serializeWithBlockKind(serializeInlineTokens(taken.flatMap((line) => line.tokens)), kind),
    restRaw: (kind: ParagraphBlock["kind"]) => serializeWithBlockKind(serializeInlineTokens(rest.flatMap((line) => line.tokens)), kind)
  };
}

function splitParagraphBySentence(text: string) {
  if (/\*\*|==/.test(text)) return [text];
  if (text.includes("\n")) {
    return text.split("\n").map((item) => item.trim()).filter(Boolean);
  }
  return text.split(/(?<=[。！？!?；;])/).map((item) => item.trim()).filter(Boolean);
}

function roundRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function tracePosterShape(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  cardCornerMode: CardCornerMode,
  radius = 36
) {
  if (cardCornerMode === "rounded") {
    roundRectPath(context, x, y, width, height, radius);
    return;
  }
  context.beginPath();
  context.rect(x, y, width, height);
  context.closePath();
}

function splitLatinRuns(text: string) {
  return text.match(/[A-Za-z0-9][A-Za-z0-9\s'&/.-]*|[^A-Za-z0-9]+/g) ?? [text];
}

function measureTrackedTitleSegment(segment: string, size: number, mode: TitleFontMode, isLatin: boolean) {
  const context = getMeasureContext(`${getTitleFontWeight(mode)} ${size}px ${resolveTitleFontFamily(mode, isLatin)}`);
  const chars = Array.from(segment);
  const tracking = getTitleTracking(size, mode);
  let width = 0;

  chars.forEach((char, index) => {
    width += context.measureText(char).width;
    const nextChar = chars[index + 1];
    if (nextChar && !/\s/.test(char) && !/\s/.test(nextChar)) {
      width += tracking;
    }
  });

  return width;
}

function measureTitleText(text: string, size: number, mode: TitleFontMode) {
  let width = 0;
  for (const segment of splitLatinRuns(text)) {
    const isLatin = /^[A-Za-z0-9\s'&/.-]+$/.test(segment);
    width += measureTrackedTitleSegment(segment, size, mode, isLatin);
  }
  return width;
}

function drawTitleLine(
  context: CanvasRenderingContext2D,
  line: string,
  x: number,
  y: number,
  size: number,
  mode: TitleFontMode,
  options?: {
    globalCharStart?: number;
    accentRanges?: TextRange[];
    normalColor?: string;
    accentColor?: string;
    accentWeight?: number;
  }
) {
  let cursorX = x;
  let globalCharIndex = options?.globalCharStart ?? 0;
  const tracking = getTitleTracking(size, mode);
  const titleWeight = getTitleFontWeight(mode);
  for (const segment of splitLatinRuns(line)) {
    const isLatin = /^[A-Za-z0-9\s'&/.-]+$/.test(segment);
    const chars = Array.from(segment);
    chars.forEach((char, index) => {
      const isAccent = Boolean(
        options?.accentRanges?.some((range) =>
          globalCharIndex >= range.start && globalCharIndex < range.end
        ) &&
        !/\s/.test(char)
      );
      const activeWeight = isAccent ? (options?.accentWeight ?? Math.min(titleWeight + 100, 700)) : titleWeight;
      context.font = `${activeWeight} ${size}px ${resolveTitleFontFamily(mode, isLatin)}`;
      context.fillStyle = isAccent ? (options?.accentColor ?? context.fillStyle) : (options?.normalColor ?? context.fillStyle);
      context.fillText(char, cursorX, y);
      cursorX += context.measureText(char).width;
      const nextChar = chars[index + 1];
      if (nextChar && !/\s/.test(char) && !/\s/.test(nextChar)) {
        cursorX += tracking;
      }
      globalCharIndex += 1;
    });
  }

  return globalCharIndex - (options?.globalCharStart ?? 0);
}

function balanceTitleLines(
  lines: string[],
  context: CanvasRenderingContext2D,
  maxWidth: number,
  mode: TitleFontMode
) {
  if (lines.length !== 2) return lines;
  const merged = lines.join("");
  let bestSplit = lines;
  let bestScore = Number.POSITIVE_INFINITY;
  const sizeMatch = context.font.match(/(\d+)px/);
  const titleSize = sizeMatch ? Number(sizeMatch[1]) : 62;

  for (let index = 2; index <= merged.length - 2; index += 1) {
    const first = merged.slice(0, index).trim();
    const second = merged.slice(index).trim();
    if (!first || !second) continue;
    const firstWidth = measureTitleText(first, titleSize, mode);
    const secondWidth = measureTitleText(second, titleSize, mode);
    if (firstWidth > maxWidth || secondWidth > maxWidth) continue;

    let score = Math.abs(firstWidth - secondWidth);
    const lastChar = Array.from(first).at(-1) ?? "";
    const nextChar = Array.from(second)[0] ?? "";
    if (TITLE_BREAK_AVOID_END.has(lastChar)) score += 220;
    if (TITLE_BREAK_AVOID_START.has(nextChar)) score += 220;
    if (first.length <= 3 || second.length <= 3) score += 160;
    if (score < bestScore) {
      bestScore = score;
      bestSplit = [first, second];
    }
  }
  return bestSplit;
}

function wrapTitleByWidth(
  text: string,
  context: CanvasRenderingContext2D,
  maxWidth: number,
  mode: TitleFontMode
) {
  const manualLines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  if (manualLines.length > 1) return manualLines;

  const segments = getTitleSegments(text);
  const lines: string[] = [];
  let currentLine = "";
  const sizeMatch = context.font.match(/(\d+)px/);
  const titleSize = sizeMatch ? Number(sizeMatch[1]) : 62;

  for (const segment of segments) {
    const candidate = `${currentLine}${segment}`;
    if (currentLine && measureTitleText(candidate, titleSize, mode) > maxWidth) {
      lines.push(currentLine.trim());
      currentLine = segment.trimStart();
    } else {
      currentLine = candidate;
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());
  return balanceTitleLines(lines, context, maxWidth, mode);
}

function fitTitleLines(title: string, settings: TypographySettings) {
  const cleanTitle = title.trim();
  const titleLineHeightRatio = getTitleLineHeightRatio(settings.titleFontMode);
  if (!cleanTitle) {
    return {
      titleSize: settings.titleSize,
      titleLineHeight: settings.titleSize * titleLineHeightRatio,
      titleLines: [] as string[]
    };
  }
  const minSize = Math.max(34, settings.titleSize - 18);
  for (let size = settings.titleSize; size >= minSize; size -= 2) {
    const context = getMeasureContext(`${getTitleFontWeight(settings.titleFontMode)} ${size}px ${TITLE_FONT_MODES[settings.titleFontMode].family}`);
    const lines = wrapTitleByWidth(cleanTitle, context, CONTENT_WIDTH, settings.titleFontMode);
    if (lines.length <= 2) {
      return {
        titleSize: size,
        titleLineHeight: size * titleLineHeightRatio,
        titleLines: lines
      };
    }
  }
  const context = getMeasureContext(`${getTitleFontWeight(settings.titleFontMode)} ${minSize}px ${TITLE_FONT_MODES[settings.titleFontMode].family}`);
  return {
    titleSize: minSize,
    titleLineHeight: minSize * titleLineHeightRatio,
    titleLines: wrapTitleByWidth(cleanTitle, context, CONTENT_WIDTH, settings.titleFontMode)
  };
}

function getPosterMetrics(page: PosterPage, settings: TypographySettings): PosterMetrics {
  const bodySize = Math.max(21, settings.bodySize - 4);
  const bodyLineHeight = bodySize * Math.max(1.58, settings.lineHeight - 0.06);
  const bodyParagraphGap = Math.max(14, bodySize * 0.72);
  const parsedTitle = page.kind === "cover" && page.title.trim() ? parseTitleMarkup(page.title) : null;
  const titleBlock = parsedTitle ? fitTitleLines(parsedTitle.plainText, settings) : null;
  const titleLineHeightRatio = getTitleLineHeightRatio(settings.titleFontMode);
  const titleStartY = 176;
  const separatorY = titleBlock ? titleStartY + titleBlock.titleLines.length * titleBlock.titleLineHeight + 2 : 110;
  const bodyTopY = separatorY + (titleBlock ? 6 : 10);
  const bodyBottomY = 818;
  return {
    titleSize: titleBlock?.titleSize ?? settings.titleSize,
    titleLineHeight: titleBlock?.titleLineHeight ?? settings.titleSize * titleLineHeightRatio,
    bodySize,
    bodyLineHeight,
    bodyParagraphGap,
    titleLines: titleBlock?.titleLines ?? [],
    titleAccentRanges: parsedTitle?.accentRanges ?? [],
    titleStartY,
    separatorY,
    bodyTopY,
    bodyBottomY,
    bodyWidth: CONTENT_WIDTH
  };
}

function getGapBetweenBlocks(
  previousBlock: ParagraphBlock | null,
  currentBlock: ParagraphBlock,
  metrics: PosterMetrics
) {
  if (!previousBlock) return 0;
  const baseGap = metrics.bodyParagraphGap;
  const quoteGap = baseGap * 1.08 + 4;
  if (previousBlock.kind === "quote" || currentBlock.kind === "quote") return quoteGap;
  if (previousBlock.kind === "subheading") return baseGap * 0.78;
  return baseGap;
}

function getParagraphVisualHeight(lineCount: number, fontSize: number, lineHeight: number) {
  if (lineCount <= 0) return 0;
  return fontSize + Math.max(0, lineCount - 1) * lineHeight;
}

function getParagraphMaxLines(
  block: ParagraphBlock,
  availableHeight: number,
  fontSize: number,
  lineHeight: number
) {
  const activeFontSize = block.kind === "subheading" ? Math.round(fontSize * 1.08) : fontSize;
  const activeLineHeight = block.kind === "subheading" ? lineHeight * 1.02 : lineHeight;
  const quotePaddingTop = block.kind === "quote" ? Math.max(22, activeFontSize * 0.62) : 0;
  const quotePaddingBottom = block.kind === "quote" ? quotePaddingTop : 0;
  const textRoom = availableHeight - quotePaddingTop - quotePaddingBottom;
  if (textRoom < activeFontSize) return 0;
  return 1 + Math.floor((textRoom - activeFontSize) / activeLineHeight);
}

function measureParagraphBlock(block: ParagraphBlock, fontSize: number, lineHeight: number, maxWidth: number) {
  const activeFontSize = block.kind === "subheading" ? Math.round(fontSize * 1.08) : fontSize;
  const activeLineHeight = block.kind === "subheading" ? lineHeight * 1.02 : lineHeight;
  const quoteWidth = block.kind === "quote" ? maxWidth - 72 : maxWidth;
  const lines = wrapInlineTokensByWidth(parseInlineMarkdown(block.raw), activeFontSize, quoteWidth);
  const textHeight = getParagraphVisualHeight(lines.length, activeFontSize, activeLineHeight);
  const quotePaddingTop = block.kind === "quote" ? Math.max(22, activeFontSize * 0.62) : 0;
  const quotePaddingBottom = block.kind === "quote" ? quotePaddingTop : 0;
  return {
    lines,
    height: block.kind === "quote"
      ? quotePaddingTop + textHeight + quotePaddingBottom
      : textHeight
  };
}

function drawInlineParagraph(
  context: CanvasRenderingContext2D,
  block: ParagraphBlock,
  x: number,
  y: number,
  fontSize: number,
  lineHeight: number,
  maxWidth: number,
  theme: ThemeDefinition,
  highlightStyle: HighlightStyle
) {
  const isQuote = block.kind === "quote";
  const isSubheading = block.kind === "subheading";
  const quoteInset = isQuote ? (theme.mode === "swiss" ? 44 : 38) : 0;
  const activeFontSize = isSubheading ? Math.round(fontSize * 1.08) : fontSize;
  const activeLineHeight = isSubheading ? lineHeight * 1.02 : lineHeight;
  const quoteWidth = isQuote ? maxWidth - 72 : maxWidth;
  const lines = wrapInlineTokensByWidth(parseInlineMarkdown(block.raw), activeFontSize, quoteWidth);
  const textHeight = getParagraphVisualHeight(lines.length, activeFontSize, activeLineHeight);
  const quotePaddingTop = isQuote ? Math.max(22, activeFontSize * 0.62) : 0;
  const quotePaddingBottom = isQuote ? quotePaddingTop : 0;
  const blockHeight = isQuote
    ? quotePaddingTop + textHeight + quotePaddingBottom
    : textHeight;

  if (isQuote) {
    const quoteBaseColor = isDarkPosterTheme(theme) ? theme.palette.text : theme.palette.accent;
    context.save();
    context.fillStyle = hexToRgba(quoteBaseColor, theme.components.quoteFillAlpha);
    roundRectPath(context, x - 18, y, maxWidth - 8, blockHeight, theme.components.quoteRadius);
    context.fill();
    context.strokeStyle = hexToRgba(quoteBaseColor, theme.components.quoteStrokeAlpha);
    context.lineWidth = 1;
    context.stroke();
    context.restore();

    context.save();
    context.fillStyle = hexToRgba(theme.palette.accent, theme.components.quoteBarAlpha);
    roundRectPath(context, x - 12, y + 14, 5, Math.max(26, blockHeight - 28), 5);
    context.fill();
    context.restore();
  }

  lines.forEach((line, lineIndex) => {
    let cursorX = x + quoteInset;
    const textStartY = isQuote ? y + quotePaddingTop : y;
    const baselineY = isQuote
      ? textStartY + activeFontSize * 0.84 + lineIndex * activeLineHeight
      : textStartY + activeFontSize * 0.84 + lineIndex * activeLineHeight;

    for (const token of line.tokens) {
      const tokenWidth = getBodyTokenWidth(token, activeFontSize);
      if (token.mark) {
        context.save();
        if (highlightStyle === "underline") {
          context.fillStyle = hexToRgba(theme.palette.accent, theme.components.highlightUnderlineAlpha);
          roundRectPath(
            context,
            cursorX - 2,
            baselineY - activeFontSize * 0.26,
            tokenWidth + 4,
            Math.max(8, activeFontSize * 0.24),
            4
          );
          context.fill();
        } else if (highlightStyle === "border") {
          context.strokeStyle = hexToRgba(theme.palette.accent, theme.components.highlightDashAlpha);
          context.lineWidth = 3.2;
          context.lineCap = "round";
          context.setLineDash([10, 5]);
          context.beginPath();
          context.moveTo(cursorX - 1, baselineY + Math.max(5, activeFontSize * 0.12));
          context.lineTo(cursorX + tokenWidth + 1, baselineY + Math.max(5, activeFontSize * 0.12));
          context.stroke();
          context.setLineDash([]);
        } else {
          context.fillStyle = hexToRgba(theme.palette.accent, theme.components.highlightMarkerAlpha);
          context.fillRect(
            cursorX - 2,
            baselineY - activeFontSize * 0.42,
            tokenWidth + 4,
            Math.max(13, activeFontSize * 0.56)
          );
        }
        context.restore();
      }
      context.save();
      const weight = isSubheading ? 600 : token.mark ? 600 : token.bold ? 500 : isQuote ? 400 : 300;
      context.globalCompositeOperation = isDarkPosterTheme(theme) ? "screen" : "multiply";
      context.font = `${weight} ${activeFontSize}px ${BODY_FONT_FAMILY}`;
      context.fillStyle = theme.palette.text;
      context.fillText(token.text, cursorX, baselineY);
      context.restore();
      cursorX += tokenWidth;
    }
  });

  return lines.length;
}

function layoutPosterPages(raw: string, manualTitle: string, settings: TypographySettings) {
  const parsed = parseInput(raw);
  const title = manualTitle.trim();
  const renderableTitle = parseTitleMarkup(title).plainText.trim();
  let sourceParagraphs = parsed.paragraphs.filter((paragraph) => paragraph.trim().length > 0);

  if (renderableTitle && sourceParagraphs.length > 0 && normalizeComparableText(sourceParagraphs[0]) === normalizeComparableText(renderableTitle)) {
    sourceParagraphs = sourceParagraphs.slice(1);
  }

  if (sourceParagraphs.length === 0) {
    return [{
      id: "page-1",
      kind: "body" as const,
      title: "",
      paragraphs: ["在左侧贴入正文后，这里会生成卡片。"]
    }];
  }

  const expandedParagraphs = sourceParagraphs.flatMap((paragraph) => {
    const chunkSize = 180;
    if (paragraph.length <= chunkSize + 40) return [paragraph];
    return splitLongParagraph(paragraph, chunkSize);
  });

  const pages: PosterPage[] = [];
  let currentParagraph = 0;
  let carryParagraph = "";

  while (currentParagraph < expandedParagraphs.length || carryParagraph) {
    const kind = pages.length === 0 && title ? "cover" : "body";
    const page: PosterPage = {
      id: `page-${pages.length + 1}`,
      kind,
      title: kind === "cover" ? title : "",
      paragraphs: []
    };
    const metrics = getPosterMetrics(page, settings);
    let cursorY = metrics.bodyTopY;
    let previousBlock: ParagraphBlock | null = null;

    while (currentParagraph < expandedParagraphs.length || carryParagraph) {
      const currentText = carryParagraph || expandedParagraphs[currentParagraph];
      const block = getParagraphBlock(currentText);
      const leadingGap = getGapBetweenBlocks(previousBlock, block, metrics);
      const { lines, height } = measureParagraphBlock(block, metrics.bodySize, metrics.bodyLineHeight, metrics.bodyWidth);
      const blockTop = cursorY + leadingGap;
      const blockBottom = blockTop + height;

      if (blockBottom <= metrics.bodyBottomY) {
        page.paragraphs.push(currentText);
        cursorY = blockBottom;
        previousBlock = block;
        if (carryParagraph) carryParagraph = "";
        else currentParagraph += 1;
        continue;
      }

      const sentenceParts = splitParagraphBySentence(currentText);
      if (sentenceParts.length > 1) {
        let fittedText = "";
        let fittedCount = 0;
        for (const sentence of sentenceParts) {
          const candidate = fittedText ? `${fittedText}${currentText.includes("\n") ? "\n" : ""}${sentence}` : sentence;
          const candidateBlock = getParagraphBlock(candidate);
          const { height: candidateHeight } = measureParagraphBlock(candidateBlock, metrics.bodySize, metrics.bodyLineHeight, metrics.bodyWidth);
          if (blockTop + candidateHeight <= metrics.bodyBottomY) {
            fittedText = candidate;
            fittedCount += 1;
            continue;
          }
          break;
        }
        if (fittedText) {
          page.paragraphs.push(fittedText);
          previousBlock = getParagraphBlock(fittedText);
          carryParagraph = sentenceParts.slice(fittedCount).join(currentText.includes("\n") ? "\n" : "").trim();
          if (!carryParagraph) currentParagraph += 1;
          break;
        }
      }

      if (page.paragraphs.length > 0) break;

      const remainingHeight = metrics.bodyBottomY - blockTop;
      const maxLines = getParagraphMaxLines(block, remainingHeight, metrics.bodySize, metrics.bodyLineHeight);
      if (maxLines <= 0) break;
      const { takenRaw, restRaw } = splitInlineLines(lines, maxLines);
      const taken = takenRaw(block.kind);
      const rest = restRaw(block.kind);
      if (taken) page.paragraphs.push(taken);
      carryParagraph = rest;
      if (!carryParagraph) currentParagraph += 1;
      break;
    }

    pages.push(page);
    if (pages.length > 60) break;
  }

  return pages;
}

function applyNoiseTexture(context: CanvasRenderingContext2D, theme: ThemeDefinition) {
  if (theme.surface.grainAlpha <= 0) return;
  const [r, g, b] = hexToRgb(theme.palette.text);
  const density = isDarkPosterTheme(theme) ? 2200 : theme.mode === "vintage" ? 1700 : theme.mode === "paper" ? 1900 : 1500;
  context.save();
  context.globalCompositeOperation = isDarkPosterTheme(theme) ? "screen" : "multiply";
  for (let index = 0; index < density; index += 1) {
    const x = Math.random() * PAGE_WIDTH;
    const y = Math.random() * PAGE_HEIGHT;
    const size = Math.random() > 0.92 ? 1.4 : 0.8;
    const alpha = theme.surface.grainAlpha * (Math.random() > 0.9 ? 1.4 : 0.8);
    context.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    context.fillRect(x, y, size, size);
  }
  context.restore();
}

function paintPosterAtmosphere(context: CanvasRenderingContext2D, theme: ThemeDefinition) {
  if (theme.mode === "swiss") {
    if (theme.surface.vignetteAlpha > 0) {
      const sideShade = context.createLinearGradient(0, 0, PAGE_WIDTH, 0);
      sideShade.addColorStop(0, hexToRgba(theme.palette.accent, 0.04));
      sideShade.addColorStop(0.12, "rgba(255,255,255,0)");
      sideShade.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = sideShade;
      context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    }
    return;
  }

  context.save();
  context.globalAlpha = theme.surface.washStrength;

  const topWash = context.createRadialGradient(160, 120, 0, 160, 120, 220);
  topWash.addColorStop(0, isDarkPosterTheme(theme) ? hexToRgba(theme.palette.accent, theme.mode === "archive" ? 0.2 : 0.28) : theme.palette.glow);
  topWash.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = topWash;
  context.beginPath();
  context.arc(160, 120, 220, 0, Math.PI * 2);
  context.fill();

  const sideWash = context.createRadialGradient(616, 172, 0, 616, 172, 154);
  sideWash.addColorStop(0, isDarkPosterTheme(theme) ? hexToRgba(theme.palette.accent, theme.mode === "archive" ? 0.14 : 0.18) : theme.palette.glow);
  sideWash.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = sideWash;
  context.beginPath();
  context.arc(616, 172, 154, 0, Math.PI * 2);
  context.fill();

  const bottomWash = context.createRadialGradient(94, 820, 0, 94, 820, 124);
  bottomWash.addColorStop(0, theme.palette.accentSoft);
  bottomWash.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = bottomWash;
  context.beginPath();
  context.arc(94, 820, 124, 0, Math.PI * 2);
  context.fill();

  if (theme.mode === "vintage") {
    const filmSweep = context.createLinearGradient(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    filmSweep.addColorStop(0, hexToRgba(theme.palette.accent, 0.08));
    filmSweep.addColorStop(0.4, "rgba(255,255,255,0)");
    filmSweep.addColorStop(1, hexToRgba(theme.palette.pageAlt, 0.18));
    context.fillStyle = filmSweep;
    context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  }

  if (theme.mode === "paper") {
    const paperBloom = context.createLinearGradient(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    paperBloom.addColorStop(0, hexToRgba(theme.palette.pageAlt, 0.08));
    paperBloom.addColorStop(0.35, "rgba(255,255,255,0)");
    paperBloom.addColorStop(1, hexToRgba(theme.palette.accent, 0.04));
    context.fillStyle = paperBloom;
    context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  }

  if (isDarkPosterTheme(theme)) {
    const darkVignette = context.createLinearGradient(0, 0, 0, PAGE_HEIGHT);
    darkVignette.addColorStop(0, theme.mode === "archive" ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)");
    darkVignette.addColorStop(1, theme.mode === "archive" ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.24)");
    context.fillStyle = darkVignette;
    context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  }

  context.restore();

  const vignette = context.createRadialGradient(
    PAGE_WIDTH / 2,
    PAGE_HEIGHT / 2,
    PAGE_WIDTH * 0.18,
    PAGE_WIDTH / 2,
    PAGE_HEIGHT / 2,
    PAGE_WIDTH * 0.76
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, `rgba(0,0,0,${theme.surface.vignetteAlpha})`);
  context.fillStyle = vignette;
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
}

function drawPosterInsetFrame(
  context: CanvasRenderingContext2D,
  theme: ThemeDefinition,
  cardCornerMode: CardCornerMode
) {
  if (theme.surface.innerFrameAlpha <= 0) return;
  const inset = theme.surface.innerFrameInset;
  context.save();
  context.lineWidth = theme.mode === "swiss" ? 1.6 : 1;
  context.strokeStyle = hexToRgba(
    theme.palette.text,
    theme.surface.innerFrameAlpha
  );
  tracePosterShape(
    context,
    inset,
    inset,
    PAGE_WIDTH - inset * 2,
    PAGE_HEIGHT - inset * 2,
    cardCornerMode,
    Math.max(0, 28 - inset * 0.08)
  );
  context.stroke();
  context.restore();
}

function drawCoverOrnament(
  context: CanvasRenderingContext2D,
  theme: ThemeDefinition,
  metrics: PosterMetrics
) {
  if (theme.mode === "swiss") return;
  context.save();
  context.fillStyle = isDarkPosterTheme(theme)
    ? hexToRgba(theme.palette.text, 0.08)
    : theme.mode === "paper"
      ? hexToRgba(theme.palette.text, 0.06)
      : theme.mode === "vintage"
      ? hexToRgba(theme.palette.accent, 0.14)
      : "rgba(255,255,255,0.18)";
  context.font = `500 ${Math.round(metrics.titleSize * 1.46)}px ${TITLE_FONT_FAMILY}`;
  context.fillText("“", 58, metrics.titleStartY - Math.max(18, metrics.titleSize * 0.24));
  context.restore();
}

async function renderPosterToDataUrl(
  page: PosterPage,
  theme: ThemeDefinition,
  settings: TypographySettings,
  highlightStyle: HighlightStyle,
  index: number,
  totalPages: number,
  footerLeft: string,
  footerRightMode: FooterRightMode,
  cardCornerMode: CardCornerMode
) {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH * 2;
  canvas.height = PAGE_HEIGHT * 2;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 初始化失败。");
  context.scale(2, 2);

  const metrics = getPosterMetrics(page, settings);
  context.shadowColor = theme.palette.shadow;
  context.shadowBlur = theme.mode === "swiss" ? 18 : 40;
  context.shadowOffsetY = theme.mode === "swiss" ? 12 : 24;

  const background = context.createLinearGradient(0, 0, 0, PAGE_HEIGHT);
  if (theme.mode === "archive") {
    background.addColorStop(0, theme.palette.pageAlt);
    background.addColorStop(0.58, theme.palette.page);
    background.addColorStop(1, "#101713");
  } else if (theme.mode === "obsidian") {
    background.addColorStop(0, theme.palette.pageAlt);
    background.addColorStop(0.55, theme.palette.page);
    background.addColorStop(1, "#0e0d0c");
  } else if (theme.mode === "swiss") {
    background.addColorStop(0, theme.palette.page);
    background.addColorStop(1, theme.palette.page);
  } else {
    background.addColorStop(0, theme.palette.pageAlt);
    background.addColorStop(1, theme.palette.page);
  }

  tracePosterShape(context, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, cardCornerMode, 36);
  context.fillStyle = background;
  context.fill();

  context.save();
  tracePosterShape(context, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, cardCornerMode, 36);
  context.clip();
  context.shadowColor = "transparent";
  context.shadowBlur = 0;
  context.shadowOffsetY = 0;
  paintPosterAtmosphere(context, theme);
  applyNoiseTexture(context, theme);
  drawPosterInsetFrame(context, theme, cardCornerMode);
  context.restore();

  if (page.kind === "cover" && page.title.trim()) {
    const titleLineWidths = metrics.titleLines.map((line) => measureTitleText(line, metrics.titleSize, settings.titleFontMode));
    const accentRanges = metrics.titleAccentRanges;
    const titleAccentColor = mixHexColors(theme.palette.text, theme.palette.accent, theme.surface.titleAccentMix);
    const titleAccentWeight = settings.titleFontMode === "sans" ? 700 : 600;

    drawCoverOrnament(context, theme, metrics);

    context.save();
    context.globalCompositeOperation = isDarkPosterTheme(theme) ? "screen" : "multiply";
    if (theme.mode === "paper") {
      context.shadowColor = "rgba(255,255,255,0.34)";
      context.shadowBlur = 0;
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 1;
    } else if (theme.mode === "archive") {
      context.shadowColor = "rgba(0,0,0,0.24)";
      context.shadowBlur = 0;
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 1;
    }
    let titleCharOffset = 0;
    metrics.titleLines.forEach((line, lineIndex) => {
      const lineX = lineIndex === 1 && metrics.titleLines.length > 1
        ? CONTENT_LEFT + Math.max(16, Math.min(34, (titleLineWidths[0] - titleLineWidths[lineIndex]) * 0.22 + 12))
        : CONTENT_LEFT;
      titleCharOffset += drawTitleLine(
        context,
        line,
        lineX,
        metrics.titleStartY + lineIndex * metrics.titleLineHeight,
        metrics.titleSize,
        settings.titleFontMode,
        {
          globalCharStart: titleCharOffset,
          accentRanges,
          normalColor: theme.palette.text,
          accentColor: titleAccentColor,
          accentWeight: titleAccentWeight
        }
      );
    });
    context.restore();
  }

  let paragraphY = metrics.bodyTopY;
  let previousBlock: ParagraphBlock | null = null;
  page.paragraphs.forEach((paragraph) => {
    const block = getParagraphBlock(paragraph);
    paragraphY += getGapBetweenBlocks(previousBlock, block, metrics);
    const { height } = measureParagraphBlock(block, metrics.bodySize, metrics.bodyLineHeight, metrics.bodyWidth);
    const blockBottom = paragraphY + height;
    if (blockBottom > metrics.bodyBottomY) return;
    drawInlineParagraph(
      context,
      block,
      CONTENT_LEFT,
      paragraphY,
      metrics.bodySize,
      metrics.bodyLineHeight,
      metrics.bodyWidth,
      theme,
      highlightStyle
    );
    paragraphY = blockBottom;
    previousBlock = block;
  });

  context.strokeStyle = hexToRgba(theme.palette.text, theme.surface.footerLineAlpha);
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(FOOTER_LINE_LEFT, FOOTER_LINE_Y);
  context.lineTo(FOOTER_LINE_RIGHT, FOOTER_LINE_Y);
  context.stroke();

  context.fillStyle = hexToRgba(theme.palette.text, theme.surface.footerTextAlpha);
  context.font = `600 14px ${BODY_FONT_FAMILY}`;
  context.fillText(footerLeft.trim() || "困困", CONTENT_LEFT, FOOTER_TEXT_Y);

  let rightText = "";
  if (footerRightMode === "page") rightText = `${String(index + 1).padStart(2, "0")}/${totalPages}`;
  else if (footerRightMode === "date") rightText = getBeijingDateLabel();
  else if (footerRightMode === "auto" && totalPages > 1) rightText = `${String(index + 1).padStart(2, "0")}/${totalPages}`;

  if (rightText) {
    context.save();
    context.textAlign = "right";
    context.font = theme.mode === "paper" || theme.mode === "archive"
      ? `600 18px Georgia, 'Times New Roman', serif`
      : `600 14px ${BODY_FONT_FAMILY}`;
    context.fillText(rightText, CONTENT_RIGHT, FOOTER_TEXT_Y);
    context.restore();
  }

  return canvas.toDataURL("image/png");
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function HomePage() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [manualTitle, setManualTitle] = useState("");
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("content");
  const [themeId, setThemeId] = useState(INITIAL_THEME.id);
  const [titleSize, setTitleSize] = useState(INITIAL_THEME.editor.titleSize);
  const [bodySize, setBodySize] = useState(INITIAL_THEME.editor.bodySize);
  const [lineHeight, setLineHeight] = useState(INITIAL_THEME.editor.lineHeight);
  const [titleFontMode, setTitleFontMode] = useState<TitleFontMode>(INITIAL_THEME.editor.titleFontMode);
  const [highlightStyle, setHighlightStyle] = useState<HighlightStyle>(INITIAL_THEME.editor.highlightStyle);
  const [footerLeft, setFooterLeft] = useState("困困");
  const [footerRightMode, setFooterRightMode] = useState<FooterRightMode>("auto");
  const [cardCornerMode, setCardCornerMode] = useState<CardCornerMode>("square");
  const [pages, setPages] = useState<PosterPage[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isExporting, startExportTransition] = useTransition();
  const deferredContent = useDeferredValue(content);

  const theme = useMemo(() => THEMES.find((item) => item.id === themeId) ?? THEMES[0], [themeId]);
  const characterCount = content.replace(/\s+/g, "").length;
  const isTypographyDirty =
    titleSize !== theme.editor.titleSize ||
    bodySize !== theme.editor.bodySize ||
    lineHeight !== theme.editor.lineHeight ||
    titleFontMode !== theme.editor.titleFontMode ||
    highlightStyle !== theme.editor.highlightStyle;
  const typographySettings = useMemo(
    () => ({ titleSize, bodySize, lineHeight, titleFontMode }),
    [titleSize, bodySize, lineHeight, titleFontMode]
  );

  function applyThemeEditorDefaults(targetTheme: ThemeDefinition = theme) {
    setTitleSize(targetTheme.editor.titleSize);
    setBodySize(targetTheme.editor.bodySize);
    setLineHeight(targetTheme.editor.lineHeight);
    setTitleFontMode(targetTheme.editor.titleFontMode);
    setHighlightStyle(targetTheme.editor.highlightStyle);
  }

  useEffect(() => {
    setPages(layoutPosterPages(deferredContent, manualTitle, typographySettings));
  }, [deferredContent, manualTitle, typographySettings]);

  useEffect(() => {
    let cancelled = false;
    async function generatePreviews() {
      if (pages.length === 0) {
        setPreviewUrls([]);
        return;
      }
      const urls: string[] = [];
      for (let index = 0; index < pages.length; index += 1) {
        const dataUrl = await renderPosterToDataUrl(
          pages[index],
          theme,
          typographySettings,
          highlightStyle,
          index,
          pages.length,
          footerLeft,
          footerRightMode,
          cardCornerMode
        );
        urls.push(dataUrl);
      }
      if (!cancelled) setPreviewUrls(urls);
    }
    void generatePreviews();
    return () => {
      cancelled = true;
    };
  }, [pages, theme, typographySettings, highlightStyle, footerLeft, footerRightMode, cardCornerMode]);

  async function handleExportAll() {
    startExportTransition(async () => {
      for (let index = 0; index < pages.length; index += 1) {
        const dataUrl = await renderPosterToDataUrl(
          pages[index],
          theme,
          typographySettings,
          highlightStyle,
          index,
          pages.length,
          footerLeft,
          footerRightMode,
          cardCornerMode
        );
        downloadDataUrl(dataUrl, `xhs-poster-${index + 1}.png`);
        await new Promise((resolve) => window.setTimeout(resolve, 120));
      }
    });
  }

  return (
    <main className="studio-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <h1>文章进来，自动排成一页页能发的小红书卡片</h1>
          <p className="hero-text">你贴内容，我负责标题强化、智能分页、配色和批量导出。</p>
        </div>
      </section>

      <section className="workspace-grid">
        <aside className="control-panel">
          <div className="panel-tabs">
            <button
              type="button"
              className={`panel-tab${sidebarTab === "content" ? " active" : ""}`}
              onClick={() => setSidebarTab("content")}
            >
              内容编辑
            </button>
            <button
              type="button"
              className={`panel-tab${sidebarTab === "style" ? " active" : ""}`}
              onClick={() => setSidebarTab("style")}
            >
              视觉样式
            </button>
          </div>
          <div className="control-panel-scroll">
            {sidebarTab === "content" ? (
              <>
                <div className="panel-section">
                  <div className="section-head">
                    <label htmlFor="title-input">自定义标题</label>
                    <span className="section-meta">可选</span>
                  </div>
                  <textarea
                    id="title-input"
                    className="text-area text-area--title"
                    value={manualTitle}
                    onChange={(event) => setManualTitle(event.target.value)}
                    placeholder="留空则不显示标题，只排正文；回车可手动换行；**重点词** 可异色强调"
                  />
                </div>

                <div className="panel-section">
                  <div className="section-head">
                    <label htmlFor="content-input">正文内容</label>
                    <span className="section-meta section-meta--quiet">{characterCount} 字</span>
                  </div>
                  <textarea
                    id="content-input"
                    className="text-area"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="直接贴正文内容，空行分段。"
                  />
                </div>
              </>
            ) : (
              <>
                <details className="accordion-section" open>
                  <summary className="accordion-summary">排版风格预设</summary>
                  <div className="section-head section-head--inside">
                    <span>当前预设</span>
                    <span className="section-meta">{theme.preset}</span>
                  </div>
                  <div className="theme-list">
                    {THEMES.map((item) => {
                      const isActive = item.id === themeId;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`theme-card${isActive ? " active" : ""}`}
                          onClick={() => setThemeId(item.id)}
                          style={isActive ? { borderColor: item.palette.accent, boxShadow: `0 16px 32px ${hexToRgba(item.palette.accent, 0.14)}` } : undefined}
                        >
                          <span
                            className="theme-swatch"
                            style={{
                              background: getThemeSwatchBackground(item),
                              boxShadow: `inset 0 0 0 1px ${item.palette.border}`
                            }}
                          >
                            <span className="theme-swatch-preset" style={{ color: item.mode === "obsidian" || item.mode === "archive" ? hexToRgba(item.palette.text, 0.82) : item.palette.muted }}>
                              {item.preset}
                            </span>
                            <span className="theme-swatch-name" style={{ color: item.palette.text }}>
                              {item.name}
                            </span>
                          </span>
                          <span className="theme-card-copy">
                            <strong>{item.name}</strong>
                            <span>{item.description}</span>
                          </span>
                          <span className="theme-card-check" style={{ background: item.palette.accent }} aria-hidden="true">{isActive ? "✓" : ""}</span>
                        </button>
                      );
                    })}
                  </div>
                </details>

                <details className="accordion-section" open>
                  <summary className="accordion-summary">排版微调</summary>
                  <div className="accordion-tools">
                    <span className="section-meta">恢复当前预设的推荐排版</span>
                    <button
                      type="button"
                      className="inline-reset-button"
                      onClick={() => applyThemeEditorDefaults()}
                      disabled={!isTypographyDirty}
                    >
                      恢复默认
                    </button>
                  </div>
                  <div className="control-stack">
                    <div className="control-item">
                      <div className="section-head section-head--compact">
                        <label htmlFor="title-font-mode">标题样式</label>
                        <span className="section-meta">字体气质</span>
                      </div>
                      <select id="title-font-mode" className="select-input" value={titleFontMode} onChange={(event) => setTitleFontMode(event.target.value as TitleFontMode)}>
                        {Object.entries(TITLE_FONT_MODES).map(([id, config]) => (
                          <option key={id} value={id}>{config.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="control-item">
                      <div className="section-head section-head--compact">
                        <label htmlFor="highlight-style">高亮样式</label>
                        <span className="section-meta">随主题变化</span>
                      </div>
                      <select id="highlight-style" className="select-input" value={highlightStyle} onChange={(event) => setHighlightStyle(event.target.value as HighlightStyle)}>
                        <option value="underline">优雅下划线</option>
                        <option value="marker">柔和涂抹</option>
                        <option value="border">虚线下划线</option>
                      </select>
                    </div>
                    <div className="control-item">
                      <div className="section-head section-head--compact">
                        <label htmlFor="title-size-range">标题字号</label>
                        <span className="section-meta section-meta--value">{titleSize}px</span>
                      </div>
                      <input id="title-size-range" className="range-input" type="range" min={36} max={96} step={1} value={titleSize} onChange={(event) => setTitleSize(Number(event.target.value))} />
                    </div>
                    <div className="control-item">
                      <div className="section-head section-head--compact">
                        <label htmlFor="body-size-range">正文字号</label>
                        <span className="section-meta section-meta--value">{bodySize}px</span>
                      </div>
                      <input id="body-size-range" className="range-input" type="range" min={22} max={40} step={1} value={bodySize} onChange={(event) => setBodySize(Number(event.target.value))} />
                    </div>
                    <div className="control-item">
                      <div className="section-head section-head--compact">
                        <label htmlFor="line-height-range">正文行距</label>
                        <span className="section-meta section-meta--value">{lineHeight.toFixed(2)}</span>
                      </div>
                      <input id="line-height-range" className="range-input" type="range" min={1.4} max={2} step={0.02} value={lineHeight} onChange={(event) => setLineHeight(Number(event.target.value))} />
                      <div className="preset-row">
                        <button type="button" className={`preset-chip${lineHeight <= 1.56 ? " active" : ""}`} onClick={() => setLineHeight(1.52)}>紧凑</button>
                        <button type="button" className={`preset-chip${lineHeight > 1.56 && lineHeight < 1.76 ? " active" : ""}`} onClick={() => setLineHeight(1.68)}>适中</button>
                        <button type="button" className={`preset-chip${lineHeight >= 1.76 ? " active" : ""}`} onClick={() => setLineHeight(1.84)}>宽松</button>
                      </div>
                    </div>
                  </div>
                </details>

                <details className="accordion-section">
                  <summary className="accordion-summary">页脚与卡片</summary>
                  <div className="control-stack">
                    <div className="control-item">
                      <div className="section-head section-head--compact">
                        <label htmlFor="footer-left-input">左下角内容</label>
                        <span className="section-meta">默认困困</span>
                      </div>
                      <input id="footer-left-input" className="text-input" value={footerLeft} onChange={(event) => setFooterLeft(event.target.value)} placeholder="困困" />
                    </div>
                    <div className="control-item">
                      <div className="section-head section-head--compact">
                        <label htmlFor="footer-right-mode">右下角内容</label>
                        <span className="section-meta">默认自动</span>
                      </div>
                      <select id="footer-right-mode" className="select-input" value={footerRightMode} onChange={(event) => setFooterRightMode(event.target.value as FooterRightMode)}>
                        <option value="auto">自动</option>
                        <option value="blank">留空</option>
                        <option value="page">显示页码</option>
                        <option value="date">显示北京时间日期</option>
                      </select>
                    </div>
                    <div className="control-item">
                      <div className="section-head section-head--compact">
                        <label htmlFor="card-corner-mode">边角样式</label>
                        <span className="section-meta">预览与导出同步</span>
                      </div>
                      <select id="card-corner-mode" className="select-input" value={cardCornerMode} onChange={(event) => setCardCornerMode(event.target.value as CardCornerMode)}>
                        <option value="rounded">圆角</option>
                        <option value="square">直角</option>
                      </select>
                    </div>
                  </div>
                </details>
              </>
            )}
          </div>
        </aside>

        <section className="preview-panel">
          <div className="preview-head">
            <div className="preview-head-main">
              <h2>实时预览</h2>
              <div className="theme-quickbar">
                {THEMES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`theme-dot${item.id === themeId ? " active" : ""}`}
                    style={{
                      background: getThemeSwatchBackground(item),
                      borderColor: item.id === themeId ? item.palette.accent : undefined,
                      boxShadow: item.id === themeId
                        ? `0 0 0 4px ${hexToRgba(item.palette.accent, 0.16)}`
                        : "0 4px 10px rgba(78, 90, 99, 0.08)"
                    }}
                    onClick={() => setThemeId(item.id)}
                    aria-label={`切换到${item.name}`}
                    title={item.name}
                  />
                ))}
              </div>
            </div>
            <p className="preview-note">所见即所得 · 导出为 3:4 双倍高清图片</p>
          </div>

          <div className="poster-grid">
            {pages.map((page, index) => (
              <article key={page.id} className="poster-wrap">
                <div
                  className="poster-preview-stage"
                  style={{
                    borderRadius: cardCornerMode === "rounded" ? 30 : 0,
                    boxShadow: theme.surface.previewShadow,
                    borderColor: theme.palette.border,
                    background: theme.palette.pageAlt
                  }}
                >
                  {previewUrls[index] ? (
                    <img className="poster-preview-image" src={previewUrls[index]} alt={`第 ${index + 1} 页预览`} />
                  ) : (
                    <div className="poster-preview-loading">生成预览中...</div>
                  )}
                </div>
                <div className="poster-meta">
                  <span>第 {index + 1} 页</span>
                  <span>{page.paragraphs.length} 段</span>
                </div>
              </article>
            ))}
          </div>

          <div className="preview-action-bar">
            <div>
              <span className="preview-action-kicker">准备好了就直接导出</span>
              <strong>{pages.length} 张卡片将按当前主题批量下载，或右键单击单张图片保存</strong>
            </div>
            <button className="primary-button preview-primary-button" onClick={() => void handleExportAll()} disabled={isExporting}>
              {isExporting ? "导出中..." : "生成并下载"}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
