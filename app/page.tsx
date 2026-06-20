"use client";

import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";

type ThemeDefinition = {
  id: string;
  name: string;
  mood: string;
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

type PosterMetrics = {
  titleSize: number;
  titleLineHeight: number;
  bodySize: number;
  bodyLineHeight: number;
  bodyParagraphGap: number;
  titleLines: string[];
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
    id: "mist-lake",
    name: "雾湖",
    mood: "灰蓝莫兰迪",
    palette: {
      page: "#f4f0e8",
      pageAlt: "#e6edf0",
      text: "#233446",
      muted: "#657588",
      accent: "#6e8799",
      accentSoft: "rgba(110, 135, 153, 0.16)",
      border: "rgba(87, 105, 122, 0.16)",
      shadow: "rgba(90, 105, 119, 0.18)",
      glow: "rgba(140, 160, 172, 0.28)"
    }
  },
  {
    id: "sage-dawn",
    name: "晨鼠尾草",
    mood: "柔和青绿",
    palette: {
      page: "#f5f1e8",
      pageAlt: "#e5ede5",
      text: "#28342d",
      muted: "#69746e",
      accent: "#7f9184",
      accentSoft: "rgba(127, 145, 132, 0.16)",
      border: "rgba(99, 113, 103, 0.16)",
      shadow: "rgba(89, 102, 92, 0.16)",
      glow: "rgba(160, 177, 163, 0.28)"
    }
  },
  {
    id: "peach-cloud",
    name: "桃云",
    mood: "暖豆沙",
    palette: {
      page: "#f8f1ea",
      pageAlt: "#efe3de",
      text: "#3b3036",
      muted: "#806f75",
      accent: "#b38e88",
      accentSoft: "rgba(179, 142, 136, 0.16)",
      border: "rgba(142, 113, 106, 0.16)",
      shadow: "rgba(120, 98, 93, 0.16)",
      glow: "rgba(194, 164, 156, 0.28)"
    }
  },
  {
    id: "classic-newsprint",
    name: "伦敦独立志",
    mood: "经典新闻纸",
    palette: {
      page: "#F4F1EA",
      pageAlt: "#F7F5EF",
      text: "#2B2A27",
      muted: "#887e72",
      accent: "#8D8478",
      accentSoft: "rgba(141, 132, 120, 0.14)",
      border: "rgba(193, 190, 181, 0.42)",
      shadow: "rgba(78, 72, 64, 0.14)",
      glow: "rgba(242, 238, 227, 0.34)"
    }
  },
  {
    id: "muted-matcha",
    name: "京都物语",
    mood: "安静抹茶纸",
    palette: {
      page: "#EAECE6",
      pageAlt: "#F1F3EE",
      text: "#1E2A25",
      muted: "#738079",
      accent: "#708076",
      accentSoft: "rgba(112, 128, 118, 0.12)",
      border: "rgba(182, 192, 187, 0.44)",
      shadow: "rgba(76, 89, 80, 0.12)",
      glow: "rgba(239, 243, 236, 0.36)"
    }
  },
  {
    id: "warm-nostalgia",
    name: "午后布拉格",
    mood: "暖白旧书页",
    palette: {
      page: "#F5EBE5",
      pageAlt: "#FAF4EF",
      text: "#3A2E28",
      muted: "#8a7a70",
      accent: "#A8887B",
      accentSoft: "rgba(168, 136, 123, 0.12)",
      border: "rgba(210, 197, 189, 0.44)",
      shadow: "rgba(101, 77, 67, 0.12)",
      glow: "rgba(248, 239, 233, 0.34)"
    }
  },
  {
    id: "cool-editorial",
    name: "北欧先锋",
    mood: "冷灰艺术纸",
    palette: {
      page: "#E8ECEE",
      pageAlt: "#F2F5F6",
      text: "#182232",
      muted: "#748191",
      accent: "#72869A",
      accentSoft: "rgba(114, 134, 154, 0.12)",
      border: "rgba(184, 195, 204, 0.44)",
      shadow: "rgba(69, 84, 98, 0.12)",
      glow: "rgba(238, 243, 246, 0.36)"
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

function resolveTitleFontFamily(mode: TitleFontMode, isLatin: boolean) {
  const config = TITLE_FONT_MODES[mode] ?? TITLE_FONT_MODES.serif;
  return isLatin ? config.latinFamily : config.family;
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
  return {
    takenRaw: serializeInlineTokens(taken.flatMap((line) => line.tokens)),
    restRaw: serializeInlineTokens(rest.flatMap((line) => line.tokens))
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

function splitLatinRuns(text: string) {
  return text.match(/[A-Za-z0-9][A-Za-z0-9\s'&/.-]*|[^A-Za-z0-9]+/g) ?? [text];
}

function measureTitleText(text: string, size: number, mode: TitleFontMode) {
  let width = 0;
  for (const segment of splitLatinRuns(text)) {
    const isLatin = /^[A-Za-z0-9\s'&/.-]+$/.test(segment);
    const context = getMeasureContext(`700 ${size}px ${resolveTitleFontFamily(mode, isLatin)}`);
    width += context.measureText(segment).width;
  }
  return width;
}

function drawTitleLine(
  context: CanvasRenderingContext2D,
  line: string,
  x: number,
  y: number,
  size: number,
  mode: TitleFontMode
) {
  let cursorX = x;
  for (const segment of splitLatinRuns(line)) {
    const isLatin = /^[A-Za-z0-9\s'&/.-]+$/.test(segment);
    context.font = `700 ${size}px ${resolveTitleFontFamily(mode, isLatin)}`;
    context.fillText(segment, cursorX, y);
    cursorX += context.measureText(segment).width;
  }
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
  if (!cleanTitle) {
    return {
      titleSize: settings.titleSize,
      titleLineHeight: settings.titleSize * 1.16,
      titleLines: [] as string[]
    };
  }
  const minSize = Math.max(34, settings.titleSize - 16);
  for (let size = settings.titleSize; size >= minSize; size -= 2) {
    const context = getMeasureContext(`700 ${size}px ${TITLE_FONT_MODES[settings.titleFontMode].family}`);
    const lines = wrapTitleByWidth(cleanTitle, context, CONTENT_WIDTH, settings.titleFontMode);
    if (lines.length <= 2) {
      return {
        titleSize: size,
        titleLineHeight: size * 1.16,
        titleLines: lines
      };
    }
  }
  const context = getMeasureContext(`700 ${minSize}px ${TITLE_FONT_MODES[settings.titleFontMode].family}`);
  return {
    titleSize: minSize,
    titleLineHeight: minSize * 1.16,
    titleLines: wrapTitleByWidth(cleanTitle, context, CONTENT_WIDTH, settings.titleFontMode)
  };
}

function getPosterMetrics(page: PosterPage, settings: TypographySettings): PosterMetrics {
  const bodySize = Math.max(21, settings.bodySize - 4);
  const bodyLineHeight = bodySize * Math.max(1.58, settings.lineHeight - 0.06);
  const bodyParagraphGap = Math.max(14, bodySize * 0.72);
  const titleBlock = page.kind === "cover" && page.title.trim() ? fitTitleLines(page.title, settings) : null;
  const titleStartY = 126;
  const separatorY = titleBlock ? titleStartY + titleBlock.titleLines.length * titleBlock.titleLineHeight + 4 : 110;
  const bodyTopY = separatorY + 10;
  const bodyBottomY = 818;
  return {
    titleSize: titleBlock?.titleSize ?? settings.titleSize,
    titleLineHeight: titleBlock?.titleLineHeight ?? settings.titleSize * 1.16,
    bodySize,
    bodyLineHeight,
    bodyParagraphGap,
    titleLines: titleBlock?.titleLines ?? [],
    titleStartY,
    separatorY,
    bodyTopY,
    bodyBottomY,
    bodyWidth: CONTENT_WIDTH
  };
}

function measureParagraphBlock(block: ParagraphBlock, fontSize: number, lineHeight: number, maxWidth: number) {
  const activeFontSize = block.kind === "subheading" ? Math.round(fontSize * 1.08) : fontSize;
  const activeLineHeight = block.kind === "subheading" ? lineHeight * 1.02 : lineHeight;
  const quoteWidth = block.kind === "quote" ? maxWidth - 44 : maxWidth;
  const lines = wrapInlineTokensByWidth(parseInlineMarkdown(block.raw), activeFontSize, quoteWidth);
  return {
    lines,
    height: lines.length * activeLineHeight
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
  const quoteInset = isQuote ? 26 : 0;
  const activeFontSize = isSubheading ? Math.round(fontSize * 1.08) : fontSize;
  const activeLineHeight = isSubheading ? lineHeight * 1.02 : lineHeight;
  const quoteWidth = isQuote ? maxWidth - 44 : maxWidth;
  const lines = wrapInlineTokensByWidth(parseInlineMarkdown(block.raw), activeFontSize, quoteWidth);
  const blockHeight = lines.length * activeLineHeight;

  if (isQuote) {
    context.save();
    context.fillStyle = "rgba(255,255,255,0.32)";
    roundRectPath(context, x - 16, y - activeFontSize + 10, maxWidth, blockHeight + 20, 20);
    context.fill();
    context.restore();

    context.save();
    context.fillStyle = theme.palette.accent;
    roundRectPath(context, x - 2, y - activeFontSize + 16, 6, blockHeight + 8, 6);
    context.fill();
    context.restore();
  }

  lines.forEach((line, lineIndex) => {
    let cursorX = x + quoteInset;
    const baselineY = y + lineIndex * activeLineHeight;

    for (const token of line.tokens) {
      const tokenWidth = getBodyTokenWidth(token, activeFontSize);
      if (token.mark) {
        context.save();
        if (highlightStyle === "underline") {
          context.fillStyle = hexToRgba(theme.palette.accent, 0.26);
          context.fillRect(cursorX - 1, baselineY - activeFontSize * 0.18, tokenWidth + 2, Math.max(6, activeFontSize * 0.16));
        } else if (highlightStyle === "border") {
          context.strokeStyle = hexToRgba(theme.palette.accent, 0.44);
          context.lineWidth = 1.2;
          context.setLineDash([4, 3]);
          context.strokeRect(cursorX - 3, baselineY - activeFontSize + 7, tokenWidth + 6, activeFontSize + 8);
          context.setLineDash([]);
        } else {
          context.fillStyle = hexToRgba(theme.palette.accent, 0.18);
          context.fillRect(
            cursorX - 2,
            baselineY - activeFontSize * 0.42,
            tokenWidth + 4,
            Math.max(12, activeFontSize * 0.52)
          );
        }
        context.restore();
      }
      context.save();
      const weight = isSubheading ? 600 : token.bold ? 500 : token.mark ? 500 : 300;
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
  let sourceParagraphs = parsed.paragraphs.filter((paragraph) => paragraph.trim().length > 0);

  if (title && sourceParagraphs.length > 0 && normalizeComparableText(sourceParagraphs[0]) === normalizeComparableText(title)) {
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

    while (currentParagraph < expandedParagraphs.length || carryParagraph) {
      const currentText = carryParagraph || expandedParagraphs[currentParagraph];
      const block = getParagraphBlock(currentText);
      const { lines, height } = measureParagraphBlock(block, metrics.bodySize, metrics.bodyLineHeight, metrics.bodyWidth);
      const blockBottom = cursorY + height;

      if (blockBottom <= metrics.bodyBottomY) {
        page.paragraphs.push(currentText);
        const lineHeight = block.kind === "subheading" ? metrics.bodyLineHeight * 1.02 : metrics.bodyLineHeight;
        const gap = block.kind === "subheading" ? metrics.bodyParagraphGap * 0.78 : metrics.bodyParagraphGap;
        cursorY += lines.length * lineHeight + gap;
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
          if (cursorY + candidateHeight <= metrics.bodyBottomY) {
            fittedText = candidate;
            fittedCount += 1;
            continue;
          }
          break;
        }
        if (fittedText) {
          page.paragraphs.push(fittedText);
          carryParagraph = sentenceParts.slice(fittedCount).join(currentText.includes("\n") ? "\n" : "").trim();
          if (!carryParagraph) currentParagraph += 1;
          break;
        }
      }

      if (page.paragraphs.length > 0) break;

      const remainingHeight = metrics.bodyBottomY - cursorY;
      const maxLines = Math.floor(remainingHeight / metrics.bodyLineHeight);
      if (maxLines <= 0) break;
      const { takenRaw, restRaw } = splitInlineLines(lines, maxLines);
      if (takenRaw) page.paragraphs.push(takenRaw);
      carryParagraph = restRaw;
      if (!carryParagraph) currentParagraph += 1;
      break;
    }

    pages.push(page);
    if (pages.length > 60) break;
  }

  return pages;
}

function applyNoiseTexture(context: CanvasRenderingContext2D) {
  context.save();
  context.globalAlpha = 0.02;
  for (let index = 0; index < 1800; index += 1) {
    const x = Math.random() * PAGE_WIDTH;
    const y = Math.random() * PAGE_HEIGHT;
    const size = Math.random() > 0.92 ? 1.4 : 0.8;
    const shade = 180 + Math.floor(Math.random() * 40);
    context.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    context.fillRect(x, y, size, size);
  }
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
  context.shadowBlur = 40;
  context.shadowOffsetY = 24;

  const background = context.createLinearGradient(0, 0, 0, PAGE_HEIGHT);
  background.addColorStop(0, theme.palette.pageAlt);
  background.addColorStop(1, theme.palette.page);

  if (cardCornerMode === "rounded") {
    roundRectPath(context, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, 36);
  } else {
    context.beginPath();
    context.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  }
  context.fillStyle = background;
  context.fill();

  context.save();
  if (cardCornerMode === "rounded") {
    roundRectPath(context, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, 36);
  } else {
    context.beginPath();
    context.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  }
  context.clip();

  const vignette = context.createRadialGradient(PAGE_WIDTH / 2, PAGE_HEIGHT / 2, PAGE_WIDTH * 0.18, PAGE_WIDTH / 2, PAGE_HEIGHT / 2, PAGE_WIDTH * 0.72);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.035)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  context.shadowColor = "transparent";
  context.shadowBlur = 0;
  context.shadowOffsetY = 0;

  const topGlow = context.createRadialGradient(150, 120, 0, 150, 120, 170);
  topGlow.addColorStop(0, theme.palette.glow);
  topGlow.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = topGlow;
  context.beginPath();
  context.arc(150, 120, 170, 0, Math.PI * 2);
  context.fill();

  const sideGlow = context.createRadialGradient(620, 160, 0, 620, 160, 120);
  sideGlow.addColorStop(0, theme.palette.glow);
  sideGlow.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = sideGlow;
  context.beginPath();
  context.arc(620, 160, 120, 0, Math.PI * 2);
  context.fill();

  const bottomGlow = context.createRadialGradient(88, 812, 0, 88, 812, 110);
  bottomGlow.addColorStop(0, theme.palette.accentSoft);
  bottomGlow.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = bottomGlow;
  context.beginPath();
  context.arc(88, 812, 110, 0, Math.PI * 2);
  context.fill();

  applyNoiseTexture(context);
  context.restore();

  if (page.kind === "cover" && page.title.trim()) {
    context.save();
    context.fillStyle = "rgba(255,255,255,0.16)";
    context.font = `700 126px ${TITLE_FONT_FAMILY}`;
    context.fillText("“", 58, 118);
    context.restore();

    context.save();
    context.globalCompositeOperation = "multiply";
    context.fillStyle = theme.palette.text;
    metrics.titleLines.forEach((line, lineIndex) => {
      drawTitleLine(
        context,
        line,
        CONTENT_LEFT,
        metrics.titleStartY + lineIndex * metrics.titleLineHeight,
        metrics.titleSize,
        settings.titleFontMode
      );
    });
    context.restore();
  }

  context.save();
  context.globalCompositeOperation = "multiply";
  context.fillStyle = theme.palette.text;
  let paragraphY = metrics.bodyTopY;
  page.paragraphs.forEach((paragraph) => {
    const block = getParagraphBlock(paragraph);
    const { lines } = measureParagraphBlock(block, metrics.bodySize, metrics.bodyLineHeight, metrics.bodyWidth);
    const blockBottom = paragraphY + (lines.length - 1) * (block.kind === "subheading" ? metrics.bodyLineHeight * 1.02 : metrics.bodyLineHeight);
    if (blockBottom > metrics.bodyBottomY) return;
    const lineCount = drawInlineParagraph(
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
    const lineHeight = block.kind === "subheading" ? metrics.bodyLineHeight * 1.02 : metrics.bodyLineHeight;
    const gap = block.kind === "subheading" ? metrics.bodyParagraphGap * 0.78 : metrics.bodyParagraphGap;
    paragraphY += lineCount * lineHeight + gap;
  });
  context.restore();

  context.strokeStyle = "rgba(90, 98, 108, 0.18)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(FOOTER_LINE_LEFT, FOOTER_LINE_Y);
  context.lineTo(FOOTER_LINE_RIGHT, FOOTER_LINE_Y);
  context.stroke();

  context.fillStyle = "rgba(79, 89, 102, 0.88)";
  context.font = `600 14px ${BODY_FONT_FAMILY}`;
  context.fillText(footerLeft.trim() || "困困", CONTENT_LEFT, FOOTER_TEXT_Y);

  let rightText = "";
  if (footerRightMode === "page") rightText = `${String(index + 1).padStart(2, "0")}/${totalPages}`;
  else if (footerRightMode === "date") rightText = getBeijingDateLabel();
  else if (footerRightMode === "auto" && totalPages > 1) rightText = `${String(index + 1).padStart(2, "0")}/${totalPages}`;

  if (rightText) {
    context.save();
    context.textAlign = "right";
    context.font = `600 14px ${BODY_FONT_FAMILY}`;
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
  const [themeId, setThemeId] = useState(THEMES[0].id);
  const [titleSize, setTitleSize] = useState(62);
  const [bodySize, setBodySize] = useState(31);
  const [lineHeight, setLineHeight] = useState(1.68);
  const [titleFontMode, setTitleFontMode] = useState<TitleFontMode>("serif");
  const [highlightStyle, setHighlightStyle] = useState<HighlightStyle>("underline");
  const [footerLeft, setFooterLeft] = useState("困困");
  const [footerRightMode, setFooterRightMode] = useState<FooterRightMode>("auto");
  const [cardCornerMode, setCardCornerMode] = useState<CardCornerMode>("square");
  const [pages, setPages] = useState<PosterPage[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isExporting, startExportTransition] = useTransition();
  const deferredContent = useDeferredValue(content);

  const theme = useMemo(() => THEMES.find((item) => item.id === themeId) ?? THEMES[0], [themeId]);
  const characterCount = content.replace(/\s+/g, "").length;
  const typographySettings = useMemo(
    () => ({ titleSize, bodySize, lineHeight, titleFontMode }),
    [titleSize, bodySize, lineHeight, titleFontMode]
  );

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
          <p className="hero-eyebrow">Independent Tool / 3:4 HTML Poster</p>
          <h1>短文进来，自动排成一页页能发的小红书（小绿书）卡片</h1>
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
                  placeholder="留空则不显示标题，只排正文；回车可手动换行"
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
                <summary className="accordion-summary">✦ 主题风格</summary>
                <div className="section-head section-head--inside">
                  <span>当前主题</span>
                  <span className="section-meta">{theme.mood}</span>
                </div>
                <div className="theme-list">
                  {THEMES.map((item) => {
                    const isActive = item.id === themeId;
                    return (
                      <button key={item.id} type="button" className={`theme-card${isActive ? " active" : ""}`} onClick={() => setThemeId(item.id)}>
                        <span
                          className="theme-swatch"
                          style={{
                            background: `radial-gradient(circle at 18% 30%, ${item.palette.glow}, transparent 35%), linear-gradient(180deg, ${item.palette.pageAlt}, ${item.palette.page})`,
                            boxShadow: `inset 0 0 0 1px ${item.palette.border}`
                          }}
                        >
                          <span className="theme-swatch-name" style={{ color: item.palette.text }}>
                            {item.name}
                          </span>
                        </span>
                        <span className="theme-card-check" aria-hidden="true">{isActive ? "✓" : ""}</span>
                      </button>
                    );
                  })}
                </div>
              </details>

              <details className="accordion-section" open>
                <summary className="accordion-summary">✦ 排版微调</summary>
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
                      <option value="border">虚线边框</option>
                    </select>
                  </div>
                  <div className="control-item">
                    <div className="section-head section-head--compact">
                      <label htmlFor="title-size-range">标题字号</label>
                      <span className="section-meta section-meta--value">{titleSize}px</span>
                    </div>
                    <input id="title-size-range" className="range-input" type="range" min={36} max={84} step={1} value={titleSize} onChange={(event) => setTitleSize(Number(event.target.value))} />
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
                <summary className="accordion-summary">✦ 页脚与卡片</summary>
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
                    style={{ background: `linear-gradient(180deg, ${item.palette.pageAlt}, ${item.palette.page})` }}
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
                <div className="poster-preview-stage" style={{ borderRadius: cardCornerMode === "rounded" ? 30 : 0 }}>
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
              <strong>{pages.length} 张卡片将按当前主题批量下载</strong>
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
