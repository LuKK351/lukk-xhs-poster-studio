"use client";

import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";

type ThemeDefinition = {
  id: string;
  name: string;
  mood: string;
  preset: string;
  description: string;
  tags: string[];
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
    quoteTreatment: QuoteTreatment;
    highlightTreatment: HighlightTreatment;
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
  subheadingStyle: SubheadingStyle;
};

type FooterRightMode = "blank" | "page" | "date";
type CardCornerMode = "rounded" | "square";
type SidebarTab = "content" | "style";
type TitleFontMode = "serif" | "kai" | "sans" | "puhuiti" | "retroSerif";
type SubheadingStyle = "large" | "accent";
type HighlightStyle = "underline" | "marker" | "border";
type QuoteTreatment = "paper" | "callout" | "code";
type HighlightTreatment = "softUnderline" | "editorMark" | "botanicalStroke" | "warmSwipe" | "darkGlow" | "swissRule";
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
  kind: "body" | "quote" | "subheading" | "divider";
  raw: string;
};

type QuoteBoxMetrics = {
  textInset: number;
  textWidth: number;
  paddingTop: number;
  paddingBottom: number;
  boxOffsetX: number;
  boxWidthOffset: number;
  barOffsetX: number;
  barTopInset: number;
  barBottomInset: number;
  barWidth: number;
  barRadius: number;
};

const THEMES: ThemeDefinition[] = [
  {
    id: "moss-paper",
    name: "苔绿纸书",
    mood: "浅苔纸面与出版物墨感",
    preset: "浅底苔绿纸书",
    description: "浅苔纸面、安静高级，适合默认长期使用",
    tags: ["复古", "安静"],
    mode: "paper",
    palette: {
      page: "#f3f1ea",
      pageAlt: "#e6ebdf",
      text: "#1f2b22",
      muted: "#667368",
      accent: "#3f8f58",
      accentSoft: "rgba(63, 143, 88, 0.18)",
      border: "rgba(63, 77, 66, 0.12)",
      shadow: "rgba(63, 77, 66, 0.12)",
      glow: "rgba(206, 215, 201, 0.34)"
    },
    surface: {
      grainAlpha: 0.038,
      vignetteAlpha: 0.044,
      washStrength: 0.32,
      innerFrameAlpha: 0.11,
      innerFrameInset: 24,
      titleAccentMix: 0.86,
      footerLineAlpha: 0.2,
      footerTextAlpha: 0.9,
      previewShadow: "0 26px 54px rgba(57, 72, 60, 0.11), 0 2px 18px rgba(255,255,255,0.42) inset"
    },
    components: {
      quoteFillAlpha: 0.042,
      quoteStrokeAlpha: 0.074,
      quoteBarAlpha: 0.72,
      quoteRadius: 22,
      quoteTreatment: "paper",
      highlightTreatment: "softUnderline",
      highlightUnderlineAlpha: 0.72,
      highlightMarkerAlpha: 0.32,
      highlightDashAlpha: 0.84
    },
    editor: {
      titleSize: 75,
      bodySize: 30,
      lineHeight: 1.84,
      titleFontMode: "serif",
      highlightStyle: "underline"
    }
  },
  {
    id: "warm-editor",
    name: "暖灰编辑",
    mood: "清透冷灰与荧光绿效率感",
    preset: "冷灰效率编辑",
    description: "冷灰白底、荧光绿高亮、数字网格，适合智性效率长文",
    tags: ["效率", "数字"],
    mode: "paper",
    palette: {
      page: "#f8f9fa",
      pageAlt: "#eef2f4",
      text: "#151d20",
      muted: "#5f6b70",
      accent: "#BAF13C",
      accentSoft: "rgba(186, 241, 60, 0.18)",
      border: "rgba(19, 30, 34, 0.12)",
      shadow: "rgba(16, 24, 28, 0.1)",
      glow: "rgba(186, 241, 60, 0.09)"
    },
    surface: {
      grainAlpha: 0.014,
      vignetteAlpha: 0.018,
      washStrength: 0.16,
      innerFrameAlpha: 0.12,
      innerFrameInset: 24,
      titleAccentMix: 0.7,
      footerLineAlpha: 0.2,
      footerTextAlpha: 0.9,
      previewShadow: "0 24px 52px rgba(31, 44, 50, 0.1), 0 1px 0 rgba(255,255,255,0.7) inset"
    },
    components: {
      quoteFillAlpha: 0.042,
      quoteStrokeAlpha: 0.075,
      quoteBarAlpha: 1,
      quoteRadius: 8,
      quoteTreatment: "callout",
      highlightTreatment: "editorMark",
      highlightUnderlineAlpha: 0.68,
      highlightMarkerAlpha: 0.42,
      highlightDashAlpha: 0.86
    },
    editor: {
      titleSize: 75,
      bodySize: 30,
      lineHeight: 1.84,
      titleFontMode: "serif",
      highlightStyle: "marker"
    }
  },
  {
    id: "lemon-note",
    name: "暖阳香草",
    mood: "香草奶油白与蜂蜜黄标记",
    preset: "暖阳香草黄标",
    description: "奶油白底、半透明蜂蜜黄高亮，适合清爽说明和观点拆解",
    tags: ["清爽", "黄标"],
    mode: "swiss",
    palette: {
      page: "#fdfbf7",
      pageAlt: "#fdfbf7",
      text: "#17140e",
      muted: "#746957",
      accent: "#f6b21a",
      accentSoft: "rgba(246, 178, 26, 0.16)",
      border: "rgba(23, 20, 14, 0.12)",
      shadow: "rgba(98, 72, 22, 0.1)",
      glow: "rgba(250, 204, 21, 0.12)"
    },
    surface: {
      grainAlpha: 0,
      vignetteAlpha: 0,
      washStrength: 0,
      innerFrameAlpha: 0.11,
      innerFrameInset: 20,
      titleAccentMix: 0.86,
      footerLineAlpha: 0.18,
      footerTextAlpha: 0.92,
      previewShadow: "0 18px 36px rgba(98, 72, 22, 0.1), 0 0 0 1px rgba(23,20,14,0.08) inset"
    },
    components: {
      quoteFillAlpha: 0.09,
      quoteStrokeAlpha: 0.14,
      quoteBarAlpha: 0.88,
      quoteRadius: 12,
      quoteTreatment: "paper",
      highlightTreatment: "warmSwipe",
      highlightUnderlineAlpha: 0.62,
      highlightMarkerAlpha: 0.24,
      highlightDashAlpha: 0.78
    },
    editor: {
      titleSize: 75,
      bodySize: 30,
      lineHeight: 1.84,
      titleFontMode: "serif",
      highlightStyle: "marker"
    }
  },
  {
    id: "forest-archive",
    name: "森林档案",
    mood: "深林墨绿与收藏级画册气质",
    preset: "深底森林档案",
    description: "深绿画册、暖米字色，适合特别篇与情绪款",
    tags: ["深绿", "叙事"],
    mode: "archive",
    palette: {
      page: "#18211b",
      pageAlt: "#243128",
      text: "#ebe1cf",
      muted: "#c1b5a1",
      accent: "#c9e879",
      accentSoft: "rgba(201, 232, 121, 0.2)",
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
      titleAccentMix: 0.9,
      footerLineAlpha: 0.24,
      footerTextAlpha: 0.92,
      previewShadow: "0 30px 62px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.04) inset"
    },
    components: {
      quoteFillAlpha: 0.072,
      quoteStrokeAlpha: 0.12,
      quoteBarAlpha: 0.9,
      quoteRadius: 20,
      quoteTreatment: "paper",
      highlightTreatment: "darkGlow",
      highlightUnderlineAlpha: 0.76,
      highlightMarkerAlpha: 0.4,
      highlightDashAlpha: 0.86
    },
    editor: {
      titleSize: 75,
      bodySize: 30,
      lineHeight: 1.84,
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
    tags: ["自然", "复盘"],
    mode: "sage",
    palette: {
      page: "#eef3ee",
      pageAlt: "#dee7df",
      text: "#1a2a22",
      muted: "#5c6d63",
      accent: "#2e5f49",
      accentSoft: "rgba(46, 95, 73, 0.18)",
      border: "rgba(46, 70, 58, 0.14)",
      shadow: "rgba(50, 72, 60, 0.12)",
      glow: "rgba(204, 221, 211, 0.28)"
    },
    surface: {
      grainAlpha: 0.044,
      vignetteAlpha: 0.05,
      washStrength: 0.32,
      innerFrameAlpha: 0.11,
      innerFrameInset: 24,
      titleAccentMix: 0.86,
      footerLineAlpha: 0.18,
      footerTextAlpha: 0.88,
      previewShadow: "0 24px 50px rgba(50, 72, 60, 0.12), 0 2px 16px rgba(255,255,255,0.4) inset"
    },
    components: {
      quoteFillAlpha: 0.048,
      quoteStrokeAlpha: 0.075,
      quoteBarAlpha: 0.7,
      quoteRadius: 22,
      quoteTreatment: "paper",
      highlightTreatment: "botanicalStroke",
      highlightUnderlineAlpha: 0.7,
      highlightMarkerAlpha: 0.32,
      highlightDashAlpha: 0.82
    },
    editor: {
      titleSize: 75,
      bodySize: 30,
      lineHeight: 1.84,
      titleFontMode: "serif",
      highlightStyle: "underline"
    }
  },
  {
    id: "peach-cloud",
    name: "桃云",
    mood: "暖沙旧胶片与生活感",
    preset: "暖沙复古胶片",
    description: "暖木暖沙、轻复古、适合情绪和生活内容",
    tags: ["暖调", "生活"],
    mode: "vintage",
    palette: {
      page: "#f8eadf",
      pageAlt: "#f3d6c7",
      text: "#3b261f",
      muted: "#806256",
      accent: "#c95b32",
      accentSoft: "rgba(201, 91, 50, 0.2)",
      border: "rgba(126, 76, 54, 0.14)",
      shadow: "rgba(110, 64, 44, 0.16)",
      glow: "rgba(236, 174, 146, 0.32)"
    },
    surface: {
      grainAlpha: 0.04,
      vignetteAlpha: 0.065,
      washStrength: 0.38,
      innerFrameAlpha: 0.1,
      innerFrameInset: 24,
      titleAccentMix: 0.84,
      footerLineAlpha: 0.17,
      footerTextAlpha: 0.9,
      previewShadow: "0 28px 58px rgba(110, 64, 44, 0.14), 0 10px 34px rgba(255,255,255,0.2) inset"
    },
    components: {
      quoteFillAlpha: 0.06,
      quoteStrokeAlpha: 0.08,
      quoteBarAlpha: 0.74,
      quoteRadius: 24,
      quoteTreatment: "paper",
      highlightTreatment: "warmSwipe",
      highlightUnderlineAlpha: 0.72,
      highlightMarkerAlpha: 0.38,
      highlightDashAlpha: 0.84
    },
    editor: {
      titleSize: 75,
      bodySize: 30,
      lineHeight: 1.84,
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
    tags: ["暗黑", "科技"],
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
      quoteTreatment: "paper",
      highlightTreatment: "darkGlow",
      highlightUnderlineAlpha: 0.56,
      highlightMarkerAlpha: 0.3,
      highlightDashAlpha: 0.8
    },
    editor: {
      titleSize: 75,
      bodySize: 30,
      lineHeight: 1.84,
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
    tags: ["极简", "结构"],
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
      quoteTreatment: "paper",
      highlightTreatment: "swissRule",
      highlightUnderlineAlpha: 0.88,
      highlightMarkerAlpha: 0.22,
      highlightDashAlpha: 0.92
    },
    editor: {
      titleSize: 75,
      bodySize: 30,
      lineHeight: 1.84,
      titleFontMode: "serif",
      highlightStyle: "border"
    }
  }
];

const DEFAULT_CONTENT = `这套工具适合把已经写好的文字快速排成小红书卡片。你可以从文档、笔记或聊天记录里复制内容，贴进左侧输入框，再做少量删改；右侧会同步预览分页效果，导出时按当前版式生成图片。

# 支持基础 Markdown 格式

正文用空行分段。**加粗文字** 适合放关键判断、产品名或行动建议，==高亮标记== 用来提醒读者扫一眼就该注意的重点。

> 引用会独立成块，适合放提醒。

标题可以留空，也可以单独写一句封面标题。字号、行距、页脚和边角都能在面板里调整；内容过长时会自动拆页，引用、重点、小标题和分割线会跟着段落走。

改完后直接导出图片，适合发布前确认排版，也适合把同一段文字做成一组连续卡片。你只需要关心内容是否准确，剩下的版式交给预览来对齐。

---

上面这条细线就是分割线样式，适合在长文里轻轻隔开两个段落。`;

const LEGACY_DEFAULT_CONTENT_PATTERNS = [
  "为什么记录会在 AI 时代重新变得重要",
  "01 内容先写顺",
  "02 样式可以慢慢试",
  "### 支持基础 Markdown 格式",
  "小红书卡片工具适合处理已经写好的正文",
  "主题按钮可以切换苔绿纸书"
];

function isLegacyDefaultContent(text: string) {
  return LEGACY_DEFAULT_CONTENT_PATTERNS.some((pattern) => text.includes(pattern));
}

const PAGE_WIDTH = 720;
const PAGE_HEIGHT = 960;
const CONTENT_LEFT = 84;
const CONTENT_RIGHT = 636;
const CONTENT_WIDTH = CONTENT_RIGHT - CONTENT_LEFT;
const FOOTER_LINE_LEFT = 108;
const FOOTER_LINE_RIGHT = 612;
const FOOTER_LINE_Y = 850;
const FOOTER_TEXT_Y = 890;
const TITLE_FONT_FAMILY = "'Source Han Serif SC Heavy','Source Han Serif SC','Noto Serif CJK SC','Songti SC','STSong',serif";
const RETRO_SERIF_FONT_FAMILY = "'FZYaSongS-B-GB','FZYaSong-M-GBK','HYDaSongJ','Source Han Serif SC Heavy','Source Han Serif SC','Songti SC','STSong',serif";
const BODY_FONT_FAMILY = "'PingFang SC','Hiragino Sans GB','Noto Sans SC',sans-serif";
const FOOTER_FONT_FAMILY = "'SF Mono','JetBrains Mono','Courier New','PingFang SC','Noto Sans SC',monospace";
const BODY_TEXT_WEIGHT = 300;
const BODY_BOLD_WEIGHT = 450;
const QUOTE_TEXT_WEIGHT = 400;
const SUBHEADING_TEXT_WEIGHT = 600;
const LEADING_PUNCTUATION = new Set(Array.from("，。！？、；：）》」』】〕］〉〗’”%、,.!?;:)]}"));

const TITLE_FONT_MODES: Record<
  TitleFontMode,
  { label: string; family: string; latinFamily: string }
> = {
  serif: {
    label: "高对比宋体",
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
  },
  puhuiti: {
    label: "阿里巴巴普惠体",
    family: "'Alibaba PuHuiTi 3.0','Alibaba PuHuiTi','Alibaba Sans','PingFang SC','Noto Sans SC',sans-serif",
    latinFamily: "'Alibaba PuHuiTi 3.0','Alibaba PuHuiTi','Alibaba Sans','PingFang SC','Noto Sans SC',sans-serif"
  },
  retroSerif: {
    label: "复古粗宋",
    family: RETRO_SERIF_FONT_FAMILY,
    latinFamily: "'Georgia','Times New Roman',serif"
  }
};

const INITIAL_THEME = THEMES[0];
const THEME_PRESET_ORDER = [
  "moss-paper",
  "warm-editor",
  "peach-cloud",
  "lemon-note",
  "sage-dawn",
  "swiss-modern",
  "forest-archive",
  "deep-obsidian"
];
const THEME_PRESETS = THEME_PRESET_ORDER
  .map((themeId) => THEMES.find((theme) => theme.id === themeId))
  .filter((theme): theme is ThemeDefinition => Boolean(theme));
const DEFAULT_SUBHEADING_STYLE: SubheadingStyle = "large";

function getTitleFontWeight(mode: TitleFontMode) {
  if (mode === "serif") return 500;
  if (mode === "retroSerif") return 700;
  return mode === "sans" || mode === "puhuiti" ? 600 : 500;
}

function getTitleTracking(size: number, mode: TitleFontMode) {
  const em = mode === "retroSerif" ? 0.018 : mode === "serif" ? 0.034 : mode === "kai" ? 0.026 : 0.018;
  return size * em;
}

function getTitleLineHeightRatio(mode: TitleFontMode) {
  if (mode === "retroSerif") return 0.96;
  return mode === "serif" ? 1.08 : mode === "kai" ? 1.1 : 1.06;
}

function isMarkdownDividerLine(line: string) {
  return line.trim() === "---";
}

function isStandaloneMarkdownBlockStart(line: string) {
  return /^#{1,6}\s+/.test(line) || /^>\s?/.test(line) || isMarkdownDividerLine(line);
}

function parseInput(raw: string) {
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  if (!normalized) return { paragraphs: [] as string[] };

  const blocks: string[] = [];
  let currentBlock: string[] = [];
  const flushCurrentBlock = () => {
    if (!currentBlock.length) return;
    blocks.push(currentBlock.join("\n").trim());
    currentBlock = [];
  };

  for (const line of normalized.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushCurrentBlock();
      continue;
    }
    if (isStandaloneMarkdownBlockStart(trimmed)) {
      flushCurrentBlock();
      blocks.push(trimmed);
      continue;
    }
    currentBlock.push(trimmed);
  }
  flushCurrentBlock();

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

function getThemeSwatchMark(theme: ThemeDefinition) {
  if (theme.mode === "swiss") return "Aa";
  return Array.from(theme.name)[0] ?? "Aa";
}

function isDarkPosterTheme(theme: ThemeDefinition) {
  return theme.mode === "obsidian" || theme.mode === "archive";
}

function isDigitalEditorTheme(theme: ThemeDefinition) {
  return theme.id === "warm-editor";
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
  if (isMarkdownDividerLine(trimmed)) {
    return { kind: "divider", raw: "" };
  }
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

function splitTextForWrapping(text: string) {
  return text.match(/[A-Za-z0-9]+(?:[._'’&/+:-][A-Za-z0-9]+)*|[ \t]+|\n|./gu) ?? [];
}

function explodeInlineTokens(tokens: InlineToken[]) {
  return tokens.flatMap((token) =>
    splitTextForWrapping(token.text).map((unit) => ({
      text: unit,
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
  const font = `${token.bold ? BODY_BOLD_WEIGHT : BODY_TEXT_WEIGHT} ${fontSize}px ${BODY_FONT_FAMILY}`;
  return getMeasureContext(font).measureText(token.text).width;
}

function isLeadingPunctuation(text: string) {
  return LEADING_PUNCTUATION.has(text);
}

function isWhitespaceToken(text: string) {
  return /^[ \t]+$/.test(text);
}

function splitOversizedWrapUnit(token: InlineToken, fontSize: number, maxWidth: number) {
  if (token.text.length <= 1 || getBodyTokenWidth(token, fontSize) <= maxWidth) return [token];
  return Array.from(token.text).map((char) => ({
    ...token,
    text: char
  }));
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

  for (const sourceToken of charTokens) {
    const splitTokens = splitOversizedWrapUnit(sourceToken, fontSize, maxWidth);
    for (const token of splitTokens) {
    if (token.text === "\n") {
      pushLine();
      continue;
    }
    if (currentLine.length === 0 && isWhitespaceToken(token.text)) {
      continue;
    }
    const tokenWidth = getBodyTokenWidth(token, fontSize);
    if (currentLine.length > 0 && currentWidth + tokenWidth > maxWidth) {
      if (!isLeadingPunctuation(token.text)) {
        pushLine();
        if (isWhitespaceToken(token.text)) {
          continue;
        }
      }
    }
    const lastToken = currentLine[currentLine.length - 1];
    if (lastToken && lastToken.bold === token.bold && lastToken.mark === token.mark) {
      lastToken.text += token.text;
    } else {
      currentLine.push({ ...token });
    }
    currentWidth += tokenWidth;
    }
  }
  pushLine();
  return lines;
}

function serializeParagraphBlock(raw: string, kind: ParagraphBlock["kind"]) {
  const trimmed = raw.trim();
  if (kind === "divider") return "---";
  if (!trimmed) return "";
  if (kind === "quote") return `> ${trimmed}`;
  if (kind === "subheading") return `# ${trimmed}`;
  return trimmed;
}

function splitInlineLines(lines: InlineLine[], count: number) {
  const taken = lines.slice(0, count);
  const rest = lines.slice(count);
  return {
    takenRaw: (kind: ParagraphBlock["kind"]) => serializeParagraphBlock(serializeInlineTokens(taken.flatMap((line) => line.tokens)), kind),
    restRaw: (kind: ParagraphBlock["kind"]) => serializeParagraphBlock(serializeInlineTokens(rest.flatMap((line) => line.tokens)), kind)
  };
}

function splitParagraphBlockBySentence(block: ParagraphBlock, sourceText: string) {
  const sourceRaw = block.kind === "body" ? sourceText.trim() : block.raw;
  return {
    parts: splitParagraphBySentence(sourceRaw),
    separator: sourceRaw.includes("\n") ? "\n" : "",
    serialize: (raw: string) => serializeParagraphBlock(raw, block.kind)
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
  return lines;
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
  const bodyParagraphGap = Math.max(30, bodySize * 1.25);
  const parsedTitle = page.kind === "cover" && page.title.trim() ? parseTitleMarkup(page.title) : null;
  const titleBlock = parsedTitle ? fitTitleLines(parsedTitle.plainText, settings) : null;
  const titleLineHeightRatio = getTitleLineHeightRatio(settings.titleFontMode);
  const bodyAnchorTitleStartY = 196;
  const titleStartY = 218;
  const separatorY = titleBlock ? bodyAnchorTitleStartY + titleBlock.titleLines.length * titleBlock.titleLineHeight - 18 : 110;
  const bodyTopY = separatorY + (titleBlock ? 0 : 10);
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
  if (currentBlock.kind === "subheading") return baseGap * 1.62;
  if (previousBlock.kind === "subheading") return baseGap * 1.3;
  if (previousBlock.kind === "quote" || currentBlock.kind === "quote") return quoteGap;
  return baseGap;
}

function getParagraphVisualHeight(lineCount: number, fontSize: number, lineHeight: number) {
  if (lineCount <= 0) return 0;
  return fontSize + Math.max(0, lineCount - 1) * lineHeight;
}

function getSubheadingFontSize(fontSize: number, subheadingStyle: SubheadingStyle) {
  return subheadingStyle === "large" ? Math.round(fontSize * 1.08) : fontSize;
}

function getSubheadingLineHeight(lineHeight: number, subheadingStyle: SubheadingStyle) {
  return subheadingStyle === "large" ? lineHeight * 1.02 : lineHeight;
}

function getDividerBlockHeight(fontSize: number) {
  return Math.max(18, fontSize * 0.72);
}

function getParagraphMaxLines(
  block: ParagraphBlock,
  availableHeight: number,
  fontSize: number,
  lineHeight: number,
  theme: ThemeDefinition,
  subheadingStyle: SubheadingStyle
) {
  if (block.kind === "divider") {
    return availableHeight >= getDividerBlockHeight(fontSize) ? 1 : 0;
  }
  const activeFontSize = block.kind === "subheading" ? getSubheadingFontSize(fontSize, subheadingStyle) : fontSize;
  const activeLineHeight = block.kind === "subheading" ? getSubheadingLineHeight(lineHeight, subheadingStyle) : lineHeight;
  const quoteMetrics = block.kind === "quote" ? getQuoteBoxMetrics(theme, activeFontSize, CONTENT_WIDTH) : null;
  const quotePaddingTop = quoteMetrics?.paddingTop ?? 0;
  const quotePaddingBottom = quoteMetrics?.paddingBottom ?? 0;
  const textRoom = availableHeight - quotePaddingTop - quotePaddingBottom;
  if (textRoom < activeFontSize) return 0;
  return 1 + Math.floor((textRoom - activeFontSize) / activeLineHeight);
}

function getQuoteBoxMetrics(theme: ThemeDefinition, fontSize: number, maxWidth: number): QuoteBoxMetrics {
  const treatment = theme.components.quoteTreatment;
  if (treatment === "callout") {
    const padding = Math.max(20, fontSize * 0.58);
    return {
      textInset: 42,
      textWidth: maxWidth - 72,
      paddingTop: padding,
      paddingBottom: padding,
      boxOffsetX: -14,
      boxWidthOffset: 14,
      barOffsetX: -8,
      barTopInset: 12,
      barBottomInset: 24,
      barWidth: 5,
      barRadius: 5
    };
  }
  if (treatment === "code") {
    const padding = Math.max(18, fontSize * 0.52);
    return {
      textInset: 40,
      textWidth: maxWidth - 68,
      paddingTop: padding,
      paddingBottom: padding,
      boxOffsetX: -12,
      boxWidthOffset: 12,
      barOffsetX: -7,
      barTopInset: 10,
      barBottomInset: 20,
      barWidth: 4,
      barRadius: 4
    };
  }

  const padding = Math.max(22, fontSize * 0.62);
  return {
    textInset: theme.mode === "swiss" ? 44 : 38,
    textWidth: maxWidth - 72,
    paddingTop: padding,
    paddingBottom: padding,
    boxOffsetX: -18,
    boxWidthOffset: 18,
    barOffsetX: -12,
    barTopInset: 14,
    barBottomInset: 28,
    barWidth: 5,
    barRadius: 5
  };
}

function drawQuoteBlock(
  context: CanvasRenderingContext2D,
  theme: ThemeDefinition,
  x: number,
  y: number,
  maxWidth: number,
  blockHeight: number,
  metrics: QuoteBoxMetrics
) {
  const treatment = theme.components.quoteTreatment;
  const quoteBaseColor = treatment === "paper" && !isDarkPosterTheme(theme)
    ? theme.palette.accent
    : theme.palette.text;
  const fillAlpha = treatment === "callout"
    ? Math.max(theme.components.quoteFillAlpha, 0.05)
    : theme.components.quoteFillAlpha;

  context.save();
  context.fillStyle = hexToRgba(quoteBaseColor, fillAlpha);
  roundRectPath(context, x + metrics.boxOffsetX, y, maxWidth + metrics.boxWidthOffset, blockHeight, theme.components.quoteRadius);
  context.fill();
  context.strokeStyle = hexToRgba(quoteBaseColor, theme.components.quoteStrokeAlpha);
  context.lineWidth = treatment === "code" ? 1.2 : 1;
  context.stroke();
  context.restore();

  context.save();
  context.fillStyle = hexToRgba(theme.palette.accent, theme.components.quoteBarAlpha);
  roundRectPath(
    context,
    x + metrics.barOffsetX,
    y + metrics.barTopInset,
    metrics.barWidth,
    Math.max(24, blockHeight - metrics.barBottomInset),
    metrics.barRadius
  );
  context.fill();
  context.restore();
}

function resolveHighlightTreatment(theme: ThemeDefinition, highlightStyle: HighlightStyle): HighlightTreatment {
  if (highlightStyle === theme.editor.highlightStyle) return theme.components.highlightTreatment;
  if (highlightStyle === "border") return "swissRule";
  if (highlightStyle === "marker") return isDarkPosterTheme(theme) ? "darkGlow" : "warmSwipe";
  return theme.mode === "sage" ? "botanicalStroke" : "softUnderline";
}

function drawHighlightMark(
  context: CanvasRenderingContext2D,
  theme: ThemeDefinition,
  highlightStyle: HighlightStyle,
  x: number,
  baselineY: number,
  tokenWidth: number,
  fontSize: number
) {
  const treatment = resolveHighlightTreatment(theme, highlightStyle);
  const accent = theme.palette.accent;

  context.save();
  if (treatment === "editorMark") {
    context.fillStyle = hexToRgba(accent, Math.max(theme.components.highlightMarkerAlpha, 0.28));
    roundRectPath(
      context,
      x - 5,
      baselineY - fontSize * 0.6,
      tokenWidth + 10,
      Math.max(17, fontSize * 0.52),
      6
    );
    context.fill();
  } else if (treatment === "warmSwipe") {
    context.globalCompositeOperation = isDarkPosterTheme(theme) ? "screen" : "multiply";
    context.fillStyle = hexToRgba(accent, Math.max(theme.components.highlightMarkerAlpha, 0.24));
    roundRectPath(
      context,
      x - 5,
      baselineY - fontSize * 0.48,
      tokenWidth + 12,
      Math.max(15, fontSize * 0.42),
      8
    );
    context.fill();
  } else if (treatment === "darkGlow") {
    context.globalCompositeOperation = "screen";
    context.shadowColor = hexToRgba(accent, 0.34);
    context.shadowBlur = 10;
    context.fillStyle = hexToRgba(accent, Math.max(theme.components.highlightMarkerAlpha, 0.2));
    roundRectPath(
      context,
      x - 4,
      baselineY - fontSize * 0.52,
      tokenWidth + 8,
      Math.max(14, fontSize * 0.46),
      7
    );
    context.fill();
  } else if (treatment === "botanicalStroke") {
    context.strokeStyle = hexToRgba(accent, Math.max(theme.components.highlightUnderlineAlpha, 0.5));
    context.lineWidth = Math.max(5, fontSize * 0.16);
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(x - 1, baselineY + fontSize * 0.11);
    context.bezierCurveTo(
      x + tokenWidth * 0.24,
      baselineY + fontSize * 0.2,
      x + tokenWidth * 0.72,
      baselineY + fontSize * 0.02,
      x + tokenWidth + 2,
      baselineY + fontSize * 0.12
    );
    context.stroke();
  } else if (treatment === "swissRule") {
    context.strokeStyle = hexToRgba(accent, Math.max(theme.components.highlightDashAlpha, 0.78));
    context.lineWidth = theme.mode === "swiss" ? 4 : 3.2;
    context.lineCap = theme.mode === "swiss" ? "butt" : "round";
    if (highlightStyle === "border") {
      context.setLineDash([10, 5]);
    } else if (theme.mode !== "swiss") {
      context.setLineDash([10, 5]);
    }
    context.beginPath();
    context.moveTo(x - 1, baselineY + Math.max(5, fontSize * 0.12));
    context.lineTo(x + tokenWidth + 1, baselineY + Math.max(5, fontSize * 0.12));
    context.stroke();
    context.setLineDash([]);
  } else {
    context.fillStyle = hexToRgba(accent, Math.max(theme.components.highlightUnderlineAlpha, 0.44));
    roundRectPath(
      context,
      x - 2,
      baselineY - fontSize * 0.25,
      tokenWidth + 5,
      Math.max(8, fontSize * 0.22),
      4
    );
    context.fill();
  }
  context.restore();
}

function drawDividerBlock(context: CanvasRenderingContext2D, theme: ThemeDefinition, x: number, y: number, maxWidth: number, height: number) {
  context.save();
  context.globalCompositeOperation = isDarkPosterTheme(theme) ? "screen" : "multiply";
  context.strokeStyle = hexToRgba(theme.palette.accent, isDarkPosterTheme(theme) ? 0.34 : 0.26);
  context.lineWidth = 1;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(x + maxWidth * 0.08, y + height * 0.5);
  context.lineTo(x + maxWidth * 0.92, y + height * 0.5);
  context.stroke();
  context.restore();
}

function measureParagraphBlock(
  block: ParagraphBlock,
  fontSize: number,
  lineHeight: number,
  maxWidth: number,
  theme: ThemeDefinition,
  subheadingStyle: SubheadingStyle
) {
  if (block.kind === "divider") {
    return {
      lines: [] as InlineLine[],
      height: getDividerBlockHeight(fontSize)
    };
  }
  const activeFontSize = block.kind === "subheading" ? getSubheadingFontSize(fontSize, subheadingStyle) : fontSize;
  const activeLineHeight = block.kind === "subheading" ? getSubheadingLineHeight(lineHeight, subheadingStyle) : lineHeight;
  const quoteMetrics = block.kind === "quote" ? getQuoteBoxMetrics(theme, activeFontSize, maxWidth) : null;
  const quoteWidth = quoteMetrics?.textWidth ?? maxWidth;
  const lines = wrapInlineTokensByWidth(parseInlineMarkdown(block.raw), activeFontSize, quoteWidth);
  const textHeight = getParagraphVisualHeight(lines.length, activeFontSize, activeLineHeight);
  const quotePaddingTop = quoteMetrics?.paddingTop ?? 0;
  const quotePaddingBottom = quoteMetrics?.paddingBottom ?? 0;
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
  highlightStyle: HighlightStyle,
  subheadingStyle: SubheadingStyle
) {
  if (block.kind === "divider") {
    const height = getDividerBlockHeight(fontSize);
    drawDividerBlock(context, theme, x, y, maxWidth, height);
    return 0;
  }

  const isQuote = block.kind === "quote";
  const isSubheading = block.kind === "subheading";
  const activeFontSize = isSubheading ? getSubheadingFontSize(fontSize, subheadingStyle) : fontSize;
  const activeLineHeight = isSubheading ? getSubheadingLineHeight(lineHeight, subheadingStyle) : lineHeight;
  const quoteMetrics = isQuote ? getQuoteBoxMetrics(theme, activeFontSize, maxWidth) : null;
  const quoteInset = quoteMetrics?.textInset ?? 0;
  const quoteWidth = quoteMetrics?.textWidth ?? maxWidth;
  const lines = wrapInlineTokensByWidth(parseInlineMarkdown(block.raw), activeFontSize, quoteWidth);
  const textHeight = getParagraphVisualHeight(lines.length, activeFontSize, activeLineHeight);
  const quotePaddingTop = quoteMetrics?.paddingTop ?? 0;
  const quotePaddingBottom = quoteMetrics?.paddingBottom ?? 0;
  const blockHeight = isQuote
    ? quotePaddingTop + textHeight + quotePaddingBottom
    : textHeight;

  if (isQuote && quoteMetrics) {
    drawQuoteBlock(context, theme, x, y, maxWidth, blockHeight, quoteMetrics);
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
        drawHighlightMark(context, theme, highlightStyle, cursorX, baselineY, tokenWidth, activeFontSize);
      }
      context.save();
      const weight = isSubheading
        ? SUBHEADING_TEXT_WEIGHT
        : token.bold
          ? BODY_BOLD_WEIGHT
          : isQuote
            ? QUOTE_TEXT_WEIGHT
            : BODY_TEXT_WEIGHT;
      context.globalCompositeOperation = isDarkPosterTheme(theme) ? "screen" : "multiply";
      context.font = `${weight} ${activeFontSize}px ${BODY_FONT_FAMILY}`;
      context.fillStyle = isSubheading && subheadingStyle === "accent" ? theme.palette.accent : theme.palette.text;
      context.fillText(token.text, cursorX, baselineY);
      context.restore();
      cursorX += tokenWidth;
    }
  });

  return lines.length;
}

function layoutPosterPages(raw: string, manualTitle: string, settings: TypographySettings, theme: ThemeDefinition) {
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
    const block = getParagraphBlock(paragraph);
    if (block.raw.length <= chunkSize + 40) return [paragraph];
    return splitLongParagraph(block.raw, chunkSize).map((chunk) => serializeParagraphBlock(chunk, block.kind));
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
      const wasCarryingParagraph = Boolean(carryParagraph);
      const currentText = wasCarryingParagraph ? carryParagraph : expandedParagraphs[currentParagraph];
      const block = getParagraphBlock(currentText);
      const leadingGap = getGapBetweenBlocks(previousBlock, block, metrics);
      const { lines, height } = measureParagraphBlock(block, metrics.bodySize, metrics.bodyLineHeight, metrics.bodyWidth, theme, settings.subheadingStyle);
      const blockTop = cursorY + leadingGap;
      const blockBottom = blockTop + height;

      if (blockBottom <= metrics.bodyBottomY) {
        page.paragraphs.push(currentText);
        cursorY = blockBottom;
        previousBlock = block;
        if (wasCarryingParagraph) {
          carryParagraph = "";
          currentParagraph += 1;
        } else {
          currentParagraph += 1;
        }
        continue;
      }

      const sentenceSplit = splitParagraphBlockBySentence(block, currentText);
      if (sentenceSplit.parts.length > 1) {
        let fittedRaw = "";
        let fittedCount = 0;
        for (const sentence of sentenceSplit.parts) {
          const candidateRaw = fittedRaw ? `${fittedRaw}${sentenceSplit.separator}${sentence}` : sentence;
          const candidate = sentenceSplit.serialize(candidateRaw);
          const candidateBlock = getParagraphBlock(candidate);
          const { height: candidateHeight } = measureParagraphBlock(candidateBlock, metrics.bodySize, metrics.bodyLineHeight, metrics.bodyWidth, theme, settings.subheadingStyle);
          if (blockTop + candidateHeight <= metrics.bodyBottomY) {
            fittedRaw = candidateRaw;
            fittedCount += 1;
            continue;
          }
          break;
        }
        if (fittedRaw) {
          const fittedText = sentenceSplit.serialize(fittedRaw);
          page.paragraphs.push(fittedText);
          previousBlock = getParagraphBlock(fittedText);
          carryParagraph = sentenceSplit.serialize(sentenceSplit.parts.slice(fittedCount).join(sentenceSplit.separator).trim());
          if (!carryParagraph) currentParagraph += 1;
          break;
        }
      }

      if (page.paragraphs.length > 0) break;

      const remainingHeight = metrics.bodyBottomY - blockTop;
      const maxLines = getParagraphMaxLines(block, remainingHeight, metrics.bodySize, metrics.bodyLineHeight, theme, settings.subheadingStyle);
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
  const density = isDigitalEditorTheme(theme)
    ? 760
    : isDarkPosterTheme(theme)
      ? 2200
      : theme.mode === "vintage"
        ? 1700
        : theme.mode === "paper"
          ? 1900
          : 1500;
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

  if (!isDigitalEditorTheme(theme) && !isDarkPosterTheme(theme) && theme.mode !== "swiss") {
    const fiberCount = theme.mode === "paper" ? 72 : 48;
    context.lineWidth = 0.7;
    context.lineCap = "round";
    for (let index = 0; index < fiberCount; index += 1) {
      const x = Math.random() * PAGE_WIDTH;
      const y = Math.random() * PAGE_HEIGHT;
      const length = 18 + Math.random() * 54;
      const drift = (Math.random() - 0.5) * 2.2;
      const alpha = theme.surface.grainAlpha * (theme.mode === "paper" ? 0.52 : 0.36);
      context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(Math.min(PAGE_WIDTH, x + length), y + drift);
      context.stroke();
    }
  }
  context.restore();
}

function drawDigitalNotebookGrid(context: CanvasRenderingContext2D, theme: ThemeDefinition) {
  const gridAlpha = 0.042;
  const majorAlpha = 0.062;
  context.save();
  context.globalAlpha = 1;
  context.globalCompositeOperation = "multiply";
  context.lineWidth = 0.7;

  for (let x = 54; x <= PAGE_WIDTH - 54; x += 28) {
    context.strokeStyle = hexToRgba(theme.palette.text, x % 112 === 54 ? majorAlpha : gridAlpha);
    context.beginPath();
    context.moveTo(x, 42);
    context.lineTo(x, PAGE_HEIGHT - 42);
    context.stroke();
  }

  for (let y = 54; y <= PAGE_HEIGHT - 54; y += 28) {
    context.strokeStyle = hexToRgba(theme.palette.text, y % 112 === 54 ? majorAlpha : gridAlpha);
    context.beginPath();
    context.moveTo(42, y);
    context.lineTo(PAGE_WIDTH - 42, y);
    context.stroke();
  }

  context.strokeStyle = hexToRgba(theme.palette.accent, 0.09);
  context.lineWidth = 1.2;
  context.beginPath();
  context.moveTo(CONTENT_LEFT, 92);
  context.lineTo(CONTENT_RIGHT, 92);
  context.stroke();
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

  const titleWash = context.createRadialGradient(278, 258, 18, 278, 258, 310);
  titleWash.addColorStop(0, isDarkPosterTheme(theme) ? hexToRgba(theme.palette.accent, 0.12) : hexToRgba(theme.palette.accent, theme.mode === "paper" ? 0.09 : 0.065));
  titleWash.addColorStop(0.55, isDarkPosterTheme(theme) ? hexToRgba(theme.palette.pageAlt, 0.08) : hexToRgba(theme.palette.pageAlt, 0.06));
  titleWash.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = titleWash;
  context.beginPath();
  context.ellipse(278, 258, 310, 190, -0.08, 0, Math.PI * 2);
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

  if (isDigitalEditorTheme(theme)) {
    drawDigitalNotebookGrid(context, theme);
  }

  if (theme.mode === "paper" && !isDigitalEditorTheme(theme)) {
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
  if (theme.mode === "swiss" || isDigitalEditorTheme(theme)) return;
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

function getFooterRightText(mode: FooterRightMode, index: number, totalPages: number) {
  if (mode === "page") return `${String(index + 1).padStart(2, "0")}/${totalPages}`;
  if (mode === "date") return getBeijingDateLabel();
  return "";
}

function drawPosterFooter(
  context: CanvasRenderingContext2D,
  theme: ThemeDefinition,
  index: number,
  totalPages: number,
  footerLeft: string,
  footerRightMode: FooterRightMode
) {
  const leftText = footerLeft.trim();
  const rightText = getFooterRightText(footerRightMode, index, totalPages);
  const footerTextAlpha = Math.max(0.52, theme.surface.footerTextAlpha * 0.74);

  context.strokeStyle = hexToRgba(theme.palette.text, theme.surface.footerLineAlpha * 0.72);
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(FOOTER_LINE_LEFT, FOOTER_LINE_Y);
  context.lineTo(FOOTER_LINE_RIGHT, FOOTER_LINE_Y);
  context.stroke();

  context.fillStyle = hexToRgba(theme.palette.text, footerTextAlpha);
  context.font = `500 13px ${FOOTER_FONT_FAMILY}`;
  context.textBaseline = "alphabetic";
  if (leftText) context.fillText(leftText, CONTENT_LEFT, FOOTER_TEXT_Y);

  if (rightText) {
    context.save();
    context.textAlign = "right";
    context.font = `500 13px ${FOOTER_FONT_FAMILY}`;
    context.fillStyle = hexToRgba(theme.palette.text, footerTextAlpha);
    context.fillText(rightText, CONTENT_RIGHT, FOOTER_TEXT_Y);
    context.restore();
  }
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
  footerEnabled: boolean,
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
    const accentRanges = metrics.titleAccentRanges;
    const titleAccentColor = mixHexColors(theme.palette.text, theme.palette.accent, theme.surface.titleAccentMix);
    const titleAccentWeight = settings.titleFontMode === "serif" ? 600 : settings.titleFontMode === "retroSerif" || settings.titleFontMode === "sans" || settings.titleFontMode === "puhuiti" ? 700 : 600;

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
      titleCharOffset += drawTitleLine(
        context,
        line,
        CONTENT_LEFT,
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
    const { height } = measureParagraphBlock(block, metrics.bodySize, metrics.bodyLineHeight, metrics.bodyWidth, theme, settings.subheadingStyle);
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
      highlightStyle,
      settings.subheadingStyle
    );
    paragraphY = blockBottom;
    previousBlock = block;
  });

  if (footerEnabled) drawPosterFooter(context, theme, index, totalPages, footerLeft, footerRightMode);

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

function sanitizeDownloadName(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^[.\-\s]+|[.\-\s]+$/g, "")
    .slice(0, 80);
}

function getExportTimestamp() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate())
  ].join("") + "-" + [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join("");
}

function createExportFileName(manualTitle: string, index: number, exportTimestamp: string) {
  const baseName = sanitizeDownloadName(manualTitle.trim() || "LuKK-小红书卡片") || "LuKK-小红书卡片";
  const pageNumber = String(index + 1).padStart(2, "0");
  return `${baseName}-${pageNumber}-${exportTimestamp}.png`;
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
  const [subheadingStyle, setSubheadingStyle] = useState<SubheadingStyle>(DEFAULT_SUBHEADING_STYLE);
  const [highlightStyle, setHighlightStyle] = useState<HighlightStyle>(INITIAL_THEME.editor.highlightStyle);
  const [footerEnabled, setFooterEnabled] = useState(true);
  const [footerLeft, setFooterLeft] = useState("困困");
  const [footerRightMode, setFooterRightMode] = useState<FooterRightMode>("page");
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
    subheadingStyle !== DEFAULT_SUBHEADING_STYLE ||
    highlightStyle !== theme.editor.highlightStyle;
  const typographySettings = useMemo(
    () => ({ titleSize, bodySize, lineHeight, titleFontMode, subheadingStyle }),
    [titleSize, bodySize, lineHeight, titleFontMode, subheadingStyle]
  );

  function applyThemeEditorDefaults(targetTheme: ThemeDefinition = theme) {
    setTitleSize(targetTheme.editor.titleSize);
    setBodySize(targetTheme.editor.bodySize);
    setLineHeight(targetTheme.editor.lineHeight);
    setTitleFontMode(targetTheme.editor.titleFontMode);
    setSubheadingStyle(DEFAULT_SUBHEADING_STYLE);
    setHighlightStyle(targetTheme.editor.highlightStyle);
  }

  function selectThemePreset(targetTheme: ThemeDefinition) {
    setThemeId(targetTheme.id);
  }

  useEffect(() => {
    setContent((current) => (isLegacyDefaultContent(current) ? DEFAULT_CONTENT : current));
  }, []);

  useEffect(() => {
    setPages(layoutPosterPages(deferredContent, manualTitle, typographySettings, theme));
  }, [deferredContent, manualTitle, typographySettings, theme]);

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
          footerEnabled,
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
  }, [pages, theme, typographySettings, highlightStyle, footerLeft, footerRightMode, footerEnabled, cardCornerMode]);

  async function handleExportAll() {
    startExportTransition(async () => {
      const exportTimestamp = getExportTimestamp();
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
          footerEnabled,
          cardCornerMode
        );
        downloadDataUrl(dataUrl, createExportFileName(manualTitle, index, exportTimestamp));
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
              <div className="content-form-stack">
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
                    className="text-area text-area--content"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="直接贴正文内容，空行分段。"
                  />
                </div>
              </div>
            ) : (
              <div className="style-form-stack">
                <details className="accordion-section" open>
                  <summary className="accordion-summary">排版风格预设</summary>
                  <div className="section-head section-head--inside">
                    <span>当前预设</span>
                    <span className="section-meta">{theme.preset}</span>
                  </div>
                  <div className="theme-list">
                    {THEME_PRESETS.map((item) => {
                      const isActive = item.id === themeId;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`theme-card${isActive ? " active" : ""}`}
                          onClick={() => selectThemePreset(item)}
                          title={`${item.name}：${item.description}`}
                          style={isActive ? { borderColor: item.palette.accent, boxShadow: `0 16px 32px ${hexToRgba(item.palette.accent, 0.14)}` } : undefined}
                        >
                          <span
                            className="theme-swatch"
                            aria-hidden="true"
                            style={{
                              background: getThemeSwatchBackground(item),
                              boxShadow: `inset 0 0 0 1px ${item.palette.border}`
                            }}
                          >
                            <span className="theme-swatch-mark" style={{ color: item.palette.text }}>
                              {getThemeSwatchMark(item)}
                            </span>
                            <span className="theme-swatch-lines" aria-hidden="true">
                              <span style={{ backgroundColor: hexToRgba(item.palette.text, 0.36) }} />
                              <span style={{ backgroundColor: hexToRgba(item.palette.text, 0.24) }} />
                              <span style={{ backgroundColor: hexToRgba(item.palette.text, 0.18) }} />
                            </span>
                          </span>
                          <span className="theme-card-copy">
                            <strong>{item.name}</strong>
                            <span className="theme-card-tags">
                              {item.tags.map((tag) => (
                                <span key={tag} className="theme-card-tag">{tag}</span>
                              ))}
                            </span>
                          </span>
                          <span className="theme-card-check" style={{ background: item.palette.accent }} aria-hidden="true">{isActive ? "✓" : ""}</span>
                        </button>
                      );
                    })}
                  </div>
                </details>

                <details className="accordion-section">
                  <summary className="accordion-summary">排版微调</summary>
                  <div className="accordion-tools">
                    <button
                      type="button"
                      className="inline-reset-button"
                      onClick={() => applyThemeEditorDefaults()}
                      disabled={!isTypographyDirty}
                    >
                      恢复预设值
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
                        <label htmlFor="subheading-style">小标题样式</label>
                        <span className="section-meta">Markdown #</span>
                      </div>
                      <select id="subheading-style" className="select-input" value={subheadingStyle} onChange={(event) => setSubheadingStyle(event.target.value as SubheadingStyle)}>
                        <option value="large">放大加粗</option>
                        <option value="accent">主题异色</option>
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
                        <button type="button" className={`preset-chip${lineHeight < 1.76 ? " active" : ""}`} onClick={() => setLineHeight(1.68)}>紧凑</button>
                        <button type="button" className={`preset-chip${lineHeight >= 1.76 && lineHeight < 1.94 ? " active" : ""}`} onClick={() => setLineHeight(1.84)}>适中</button>
                        <button type="button" className={`preset-chip${lineHeight >= 1.94 ? " active" : ""}`} onClick={() => setLineHeight(2)}>宽松</button>
                      </div>
                    </div>
                  </div>
                </details>

                <details className="accordion-section">
                  <summary className="accordion-summary">页脚与卡片</summary>
                  <div className="control-stack">
                    <div className="control-item">
                      <div className="section-head section-head--compact">
                        <label htmlFor="footer-enabled-mode">页脚显示</label>
                        <span className="section-meta">含横线与角标</span>
                      </div>
                      <select id="footer-enabled-mode" className="select-input" value={footerEnabled ? "on" : "off"} onChange={(event) => setFooterEnabled(event.target.value === "on")}>
                        <option value="on">显示页脚</option>
                        <option value="off">关闭页脚</option>
                      </select>
                    </div>
                    <div className="control-item">
                      <div className="section-head section-head--compact">
                        <label htmlFor="footer-left-input">左下角内容</label>
                        <span className="section-meta">可留空</span>
                      </div>
                      <input id="footer-left-input" className="text-input" value={footerLeft} onChange={(event) => setFooterLeft(event.target.value)} placeholder="账号名、署名或栏目名，可留空" />
                    </div>
                    <div className="control-item">
                      <div className="section-head section-head--compact">
                        <label htmlFor="footer-right-mode">右下角内容</label>
                        <span className="section-meta">默认页码</span>
                      </div>
                      <select id="footer-right-mode" className="select-input" value={footerRightMode} onChange={(event) => setFooterRightMode(event.target.value as FooterRightMode)}>
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
              </div>
            )}
          </div>
        </aside>

        <section className="preview-panel">
          <div className="preview-head">
            <div className="preview-head-main">
              <div className="preview-title-row">
                <h2>实时预览</h2>
                <div className="theme-quickbar" aria-label="配色快捷切换">
                  {THEME_PRESETS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`theme-dot${item.id === themeId ? " active" : ""}`}
                      style={{
                        background: getThemeSwatchBackground(item),
                        borderColor: item.id === themeId ? item.palette.accent : undefined,
                        boxShadow: item.id === themeId
                          ? `0 0 0 3px ${hexToRgba(item.palette.accent, 0.14)}`
                          : "0 3px 8px rgba(78, 90, 99, 0.08)"
                      }}
                      onClick={() => selectThemePreset(item)}
                      aria-label={`切换到${item.name}`}
                      title={item.name}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="preview-head-actions">
              <span className="preview-note">所见即所得，3:4 双倍高清 PNG</span>
              <span className="export-help">
                <button type="button" className="info-button" aria-label="查看导出说明">
                  <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </button>
                <span className="export-tooltip" role="tooltip">{pages.length} 张卡片将按当前主题批量下载。也可以右键单击单张预览图片保存。</span>
              </span>
              <button className="primary-button preview-primary-button" onClick={() => void handleExportAll()} disabled={isExporting}>
                {isExporting ? "导出中..." : "生成并下载"}
              </button>
            </div>
          </div>

          <div className="poster-grid">
            {pages.map((page, index) => (
              <article key={page.id} className="poster-wrap">
                <div
                  className="poster-preview-stage"
                  style={{
                    borderRadius: cardCornerMode === "rounded" ? 12 : 0,
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

        </section>
      </section>
    </main>
  );
}
