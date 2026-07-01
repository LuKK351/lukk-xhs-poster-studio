import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pageSource = readFileSync(join(root, "app/page.tsx"), "utf8");
const cssSource = readFileSync(join(root, "app/globals.css"), "utf8");
const readmeSource = readFileSync(join(root, "README.md"), "utf8");
const launcherScriptPath = join(root, "start_xhs_poster.command");
assert.ok(existsSync(launcherScriptPath), "desktop launcher target script should exist");
const launcherScriptSource = readFileSync(launcherScriptPath, "utf8");
const match = pageSource.match(/const DEFAULT_CONTENT = `([\s\S]*?)`;/);

assert.ok(match, "DEFAULT_CONTENT should be defined as a template string");
assert.match(launcherScriptSource, /nohup npm run dev -- --port 3000/, "desktop launcher should keep the poster studio running after the launcher exits");
assert.match(launcherScriptSource, /open "http:\/\/localhost:3000"/, "desktop launcher should open the local poster studio URL");

const defaultContent = match[1];
const forbiddenPatterns = [
  /不是/g,
  /而是/g,
  /内容先写顺/g,
  /样式可以慢慢试/g,
  /苔绿纸书|森林档案|桃云|深邃曜石|瑞士极简/g
];

for (const pattern of forbiddenPatterns) {
  assert.equal(
    pattern.test(defaultContent),
    false,
    `DEFAULT_CONTENT should not include ${pattern.source}`
  );
}

const primaryHeadingMatches = defaultContent.match(/^#\s+/gm) ?? [];
assert.equal(primaryHeadingMatches.length, 1, "DEFAULT_CONTENT should include exactly one primary heading sample");
assert.match(defaultContent, /^>\s+/m, "DEFAULT_CONTENT should include a quote sample");
assert.match(defaultContent, /^---$/m, "DEFAULT_CONTENT should include a markdown divider sample");
const quoteSample = defaultContent.match(/^>\s+(.+)$/m)?.[1] ?? "";
assert.ok(quoteSample.length > 0 && quoteSample.length <= 34, "quote sample should be short and reusable");
assert.match(defaultContent, /\*\*.+?\*\*/, "DEFAULT_CONTENT should include a bold emphasis sample");
assert.match(defaultContent, /==.+?==/, "DEFAULT_CONTENT should include a marker highlight sample");
assert.match(defaultContent, /外面|外部|贴进/, "DEFAULT_CONTENT should explain that content is pasted in");
assert.match(defaultContent, /基础的 Markdown|基础 Markdown/, "DEFAULT_CONTENT should mention supported Markdown formats");

const mossPaperTheme = pageSource.match(/id: "moss-paper"[\s\S]*?editor: \{([\s\S]*?)\n    \}/);
assert.ok(mossPaperTheme, "moss-paper theme editor settings should be present");
assert.match(mossPaperTheme[1], /titleSize:\s*75/, "default title size should be 75");
assert.match(mossPaperTheme[1], /bodySize:\s*30/, "default body size should be 30");
assert.match(mossPaperTheme[1], /lineHeight:\s*1\.84/, "default line height should be 1.84");
assert.match(mossPaperTheme[1], /titleFontMode:\s*"serif"/, "default title mode should return to high-contrast serif");
const themeEditorDefaults = [...pageSource.matchAll(
  /editor:\s*\{\s*titleSize:\s*(\d+),\s*bodySize:\s*(\d+),\s*lineHeight:\s*([0-9.]+),\s*titleFontMode:\s*"([^"]+)"/g
)];
assert.ok(themeEditorDefaults.length >= 1, "theme editor defaults should be present");
for (const [, titleSize, bodySize, lineHeight, titleFontMode] of themeEditorDefaults) {
  assert.equal(titleSize, "75", "all theme default title sizes should match moss-paper");
  assert.equal(bodySize, "30", "all theme default body sizes should match moss-paper");
  assert.equal(lineHeight, "1.84", "all theme default line heights should match moss-paper");
  assert.equal(titleFontMode, "serif", "all theme default title styles should match moss-paper");
}
assert.match(pageSource, /id:\s*"warm-editor"[\s\S]*?name:\s*"暖灰编辑"/, "warm gray editorial theme should be available");
assert.match(pageSource, /id:\s*"warm-editor"[\s\S]*?preset:\s*"冷灰效率编辑"/, "warm editor theme should move toward cool gray efficiency");
assert.match(pageSource, /id:\s*"warm-editor"[\s\S]*?page:\s*"#f8f9fa"/i, "warm editor background should be clean cool gray-white");
assert.match(pageSource, /id:\s*"warm-editor"[\s\S]*?accent:\s*"#BAF13C"/, "warm editor should use a saturated efficiency green");
assert.match(pageSource, /id:\s*"warm-editor"[\s\S]*?quoteTreatment:\s*"callout"/, "warm gray editorial theme should use callout quotes");
assert.match(pageSource, /id:\s*"lemon-note"[\s\S]*?name:\s*"暖阳香草"/, "yellow editorial theme should be available");
assert.match(pageSource, /id:\s*"lemon-note"[\s\S]*?mode:\s*"swiss"/, "yellow editorial theme should use a flat modern surface");
assert.match(pageSource, /id:\s*"lemon-note"[\s\S]*?page:\s*"#fdfbf7"/i, "yellow editorial theme should use a clean vanilla-white background");
assert.match(pageSource, /id:\s*"lemon-note"[\s\S]*?pageAlt:\s*"#fdfbf7"/i, "yellow editorial theme should avoid dirty background gradients");
assert.match(pageSource, /id:\s*"lemon-note"[\s\S]*?accent:\s*"#f6b21a"/i, "yellow editorial theme should use a warm honey-yellow annotation accent");
assert.match(pageSource, /id:\s*"lemon-note"[\s\S]*?grainAlpha:\s*0[\s\S]*?vignetteAlpha:\s*0[\s\S]*?washStrength:\s*0/, "yellow editorial theme should avoid aged-paper texture and vignette");
assert.match(pageSource, /id:\s*"lemon-note"[\s\S]*?quoteTreatment:\s*"paper"/, "yellow note theme should use a honey-tinted quote block");
assert.match(pageSource, /id:\s*"lemon-note"[\s\S]*?highlightTreatment:\s*"warmSwipe"/, "yellow editorial theme should use marker-like yellow highlights");
assert.match(pageSource, /id:\s*"lemon-note"[\s\S]*?highlightMarkerAlpha:\s*0\.24/, "yellow editorial highlights should stay translucent instead of muddy");
assert.match(pageSource, /type TitleFontMode = "serif" \| "kai" \| "sans" \| "puhuiti" \| "retroSerif";/, "title font modes should include optional Alibaba PuHuiTi style");
assert.match(pageSource, /type QuoteTreatment = "paper" \| "callout" \| "code";/, "quote block treatments should be explicit");
assert.match(pageSource, /type HighlightTreatment = "softUnderline" \| "editorMark" \| "botanicalStroke" \| "warmSwipe" \| "darkGlow" \| "swissRule";/, "highlight treatments should be theme-specific");
assert.match(pageSource, /id:\s*"warm-editor"[\s\S]*?highlightTreatment:\s*"editorMark"/, "warm gray editorial theme should use an editorial marker highlight");
assert.match(pageSource, /id:\s*"swiss-modern"[\s\S]*?highlightTreatment:\s*"swissRule"/, "swiss theme should use a crisp rule highlight");
assert.match(pageSource, /function resolveHighlightTreatment/, "highlight treatment resolution should be extracted");
assert.match(pageSource, /function drawHighlightMark/, "highlight rendering should be extracted from paragraph drawing");
assert.match(pageSource, /const BODY_BOLD_WEIGHT = 450;/, "bold body text should stay lighter than the previous heavy emphasis");
assert.match(pageSource, /const font = `\$\{token\.bold \? BODY_BOLD_WEIGHT : BODY_TEXT_WEIGHT\}/, "highlight marks should not increase measured text weight");
assert.doesNotMatch(pageSource, /token\.mark \? 600|token\.mark \? 500/, "highlight marks should not make text bolder");
assert.match(pageSource, /id:\s*"moss-paper"[\s\S]*?accent:\s*"#3f8f58"[\s\S]*?titleAccentMix:\s*0\.86[\s\S]*?highlightUnderlineAlpha:\s*0\.72/, "moss-paper emphasis should stay visible in small previews");
assert.match(pageSource, /id:\s*"forest-archive"[\s\S]*?accent:\s*"#c9e879"[\s\S]*?titleAccentMix:\s*0\.9[\s\S]*?highlightMarkerAlpha:\s*0\.4/, "forest archive emphasis should stay visible on dark backgrounds");
assert.match(pageSource, /id:\s*"sage-dawn"[\s\S]*?page:\s*"#eef3ee"[\s\S]*?pageAlt:\s*"#dee7df"[\s\S]*?accent:\s*"#2e5f49"[\s\S]*?titleAccentMix:\s*0\.86[\s\S]*?highlightUnderlineAlpha:\s*0\.7/, "sage dawn should read as a cooler mist-green natural theme");
assert.match(pageSource, /id:\s*"peach-cloud"[\s\S]*?page:\s*"#f8eadf"[\s\S]*?pageAlt:\s*"#f3d6c7"[\s\S]*?accent:\s*"#c95b32"[\s\S]*?titleAccentMix:\s*0\.84[\s\S]*?highlightMarkerAlpha:\s*0\.38/, "peach cloud should read as a warmer peach-apricot life theme");
assert.match(pageSource, /label:\s*"复古粗宋"/, "retro serif style should be available in the title style picker");
assert.match(pageSource, /label:\s*"阿里巴巴普惠体"[\s\S]*?family:\s*"'Alibaba PuHuiTi 3\.0','Alibaba PuHuiTi','Alibaba Sans','PingFang SC','Noto Sans SC',sans-serif"/, "Alibaba PuHuiTi should be available in the title style picker");
assert.doesNotMatch(pageSource, /墨迹大字|INK_TITLE_OFFSETS|titleFontMode:\s*"ink"/, "ink handwriting title style should be removed");
assert.match(pageSource, /if \(mode === "serif"\) return 500;/, "default serif title should use a lighter editorial weight");
assert.match(pageSource, /if \(mode === "retroSerif"\) return 700;/, "optional retro serif title should remain a heavier style");
assert.match(pageSource, /mode === "serif" \? 0\.034/, "default serif title should use wider tracking");
assert.match(pageSource, /const titleAccentWeight = settings\.titleFontMode === "serif" \? 600/, "serif title emphasis should stay lighter than the old heavy display");
assert.match(pageSource, /bodyParagraphGap = Math\.max\(30, bodySize \* 1\.25\)/, "paragraph spacing should be clearly larger than line rhythm");
assert.match(pageSource, /function getQuoteBoxMetrics/, "quote block metrics should be extracted from inline paragraph drawing");
assert.match(pageSource, /function drawQuoteBlock/, "quote block rendering should be extracted from inline paragraph drawing");
assert.match(pageSource, /boxOffsetX:\s*-14,[\s\S]*?boxWidthOffset:\s*14,/, "callout quote backgrounds should align their right edge with the body text column");
assert.match(pageSource, /boxOffsetX:\s*-12,[\s\S]*?boxWidthOffset:\s*12,/, "code quote backgrounds should align their right edge with the body text column");
assert.match(pageSource, /boxOffsetX:\s*-18,[\s\S]*?boxWidthOffset:\s*18,/, "paper quote backgrounds should align their right edge with the body text column");
assert.match(pageSource, /layoutPosterPages\(deferredContent, manualTitle, typographySettings, theme\)/, "pagination should account for theme-specific quote treatments");
assert.match(pageSource, /function selectThemePreset\(targetTheme: ThemeDefinition\)\s*\{\s*setThemeId\(targetTheme\.id\);\s*\}/, "theme selection should preserve manual typography adjustments");
assert.doesNotMatch(pageSource, /function selectThemePreset\(targetTheme: ThemeDefinition\)\s*\{[\s\S]*?applyThemeEditorDefaults\(targetTheme\)/, "theme selection should not reset editor controls");
assert.match(pageSource, /onClick=\{\(\) => selectThemePreset\(item\)\}/, "theme buttons should preserve typography while switching theme visuals");
assert.match(pageSource, /function isDigitalEditorTheme/, "digital editorial theme should have explicit theme detection");
assert.match(pageSource, /function drawDigitalNotebookGrid/, "digital editorial theme should render a subtle grid");
assert.match(pageSource, /if \(theme\.mode === "swiss" \|\| isDigitalEditorTheme\(theme\)\) return;/, "digital editorial theme should avoid bookish cover ornaments");
assert.match(pageSource, /const fiberCount = theme\.mode === "paper" \? 72 : 48;/, "paper texture should include subtle fiber strokes");
assert.match(pageSource, /const titleWash = context\.createRadialGradient/, "poster atmosphere should include a soft title-area ink wash");

assert.match(pageSource, /setLineHeight\(1\.68\)[\s\S]*?>紧凑</, "compact line-height preset should use 1.68");
assert.match(pageSource, /setLineHeight\(1\.84\)[\s\S]*?>适中</, "medium line-height preset should use 1.84");
assert.match(pageSource, /setLineHeight\(2\)[\s\S]*?>宽松</, "loose line-height preset should use 2.00");
assert.match(pageSource, /type SubheadingStyle = "large" \| "accent";/, "subheading style should support large and accent modes");
assert.match(pageSource, /currentBlock\.kind === "subheading"[\s\S]*baseGap \* 1\.62/, "subheading should have larger top spacing");
assert.match(pageSource, /previousBlock\.kind === "subheading"[\s\S]*baseGap \* 1\.3/, "subheading should have larger bottom spacing that remains smaller than top spacing");
assert.match(pageSource, /function getSubheadingFontSize[\s\S]*?subheadingStyle === "large" \? Math\.round\(fontSize \* 1\.08\) : fontSize;/, "accent subheading style should keep body-sized text");
assert.match(pageSource, /context\.fillStyle = isSubheading && subheadingStyle === "accent" \? theme\.palette\.accent : theme\.palette\.text;/, "accent subheading style should use the theme accent color");
assert.match(pageSource, /function isStandaloneMarkdownBlockStart/, "line-level markdown block detection should be extracted");
assert.match(pageSource, /function isMarkdownDividerLine\(line: string\) \{\s*return line\.trim\(\) === "---";\s*\}/, "markdown divider support should only recognize the common --- line");
assert.match(pageSource, /isStandaloneMarkdownBlockStart\(trimmed\)[\s\S]*?flushCurrentBlock\(\);[\s\S]*?blocks\.push\(trimmed\);/, "quote, heading, and divider lines should become standalone blocks without requiring a blank line");
assert.match(pageSource, /function serializeParagraphBlock/, "paragraph block serialization should be centralized");
assert.match(pageSource, /if \(kind === "divider"\) return "---";/, "divider serialization should preserve markdown divider syntax");
assert.match(pageSource, /if \(kind === "quote"\) return `> \$\{trimmed\}`;/, "quote serialization should preserve quote style after pagination splits");
assert.match(pageSource, /if \(kind === "subheading"\) return `# \$\{trimmed\}`;/, "split subheading serialization should preserve one heading level");
assert.match(pageSource, /function drawDividerBlock[\s\S]*?theme\.palette\.accent[\s\S]*?lineWidth = 1;/, "markdown divider should render as a lightweight theme-colored line");
assert.match(pageSource, /splitParagraphBlockBySentence\(block, currentText\)/, "sentence-based pagination should preserve the original block kind");
assert.match(pageSource, /if \(wasCarryingParagraph\) \{\s*carryParagraph = "";\s*currentParagraph \+= 1;/, "consumed carry paragraphs should advance the source paragraph index");
assert.match(pageSource, /splitLongParagraph\(block\.raw, chunkSize\)\.map\(\(chunk\) => serializeParagraphBlock\(chunk, block\.kind\)\)/, "long paragraph pre-splits should preserve quote and heading markers");
assert.match(pageSource, /const LEADING_PUNCTUATION/, "line wrapping should define leading punctuation that cannot start a new line");
assert.match(pageSource, /function splitTextForWrapping/, "line wrapping should preserve latin words as unbroken units");
assert.match(pageSource, /\[A-Za-z0-9\]\+\(\?:\[._'’&\/\+:-\]\[A-Za-z0-9\]\+\)\*/, "latin words and product names should not be split in the middle");
assert.match(pageSource, /function splitOversizedWrapUnit/, "oversized latin units should still have a fallback split to avoid overflow");
assert.match(pageSource, /isWhitespaceToken\(token\.text\)/, "line wrapping should avoid leading spaces after word-aware breaks");
assert.match(pageSource, /isLeadingPunctuation\(token\.text\)/, "line wrapping should keep punctuation with the previous line");
assert.match(pageSource, /if \(highlightStyle === "border"\) \{\s*context\.setLineDash\(\[10, 5\]\);[\s\S]*?\} else if \(theme\.mode !== "swiss"\) \{[\s\S]*?context\.setLineDash\(\[10, 5\]\);/, "dashed underline should stay dashed when the border highlight option is selected");
assert.match(pageSource, /const bodyAnchorTitleStartY = 196;/, "cover body should keep its previous vertical anchor");
assert.match(pageSource, /const titleStartY = 218;/, "cover title should sink closer to the fixed body block");
assert.match(pageSource, /const separatorY = titleBlock \? bodyAnchorTitleStartY \+ titleBlock\.titleLines\.length \* titleBlock\.titleLineHeight - 18 : 110;/, "cover body should not move when the title is lowered");
assert.match(pageSource, /const bodyTopY = separatorY \+ \(titleBlock \? 0 : 10\);/, "cover body should stay anchored while title moves");
assert.match(pageSource, /drawTitleLine\(\s*context,\s*line,\s*CONTENT_LEFT,/, "multi-line titles should share the same left edge");
assert.doesNotMatch(pageSource, /titleLineWidths|lineIndex === 1/, "multi-line titles should not use staggered second-line offsets");
assert.match(pageSource, /className="preview-head-actions"/, "export CTA should live in the preview header");
assert.match(pageSource, /className="export-tooltip"/, "download explanation should be moved into a compact tooltip");
assert.match(pageSource, /const FOOTER_FONT_FAMILY = "[^"]*SF Mono[^"]*JetBrains Mono[^"]*Courier New[^"]*monospace"/, "footer should use a shared monospace/typewriter font stack");
assert.match(pageSource, /function drawPosterFooter/, "footer drawing should be centralized");
assert.match(pageSource, /const leftText = footerLeft\.trim\(\);/, "empty footer-left input should stay empty instead of falling back");
assert.doesNotMatch(pageSource, /footerLeft\.trim\(\)\s*\|\|\s*"困困"/, "empty footer-left input should not render the default brand");
assert.match(pageSource, /if \(footerEnabled\) drawPosterFooter/, "footer line and text should be hidden together when footer is disabled");
assert.match(pageSource, /value=\{footerEnabled \? "on" : "off"\}/, "footer visibility should be controlled from the UI");
assert.match(pageSource, /type FooterRightMode = "blank" \| "page" \| "date";/, "footer-right modes should not include redundant auto mode");
assert.match(pageSource, /useState<FooterRightMode>\("page"\)/, "footer-right content should default to page numbers");
assert.doesNotMatch(pageSource, /<option value="auto">/, "footer-right picker should not show a redundant auto option");
assert.match(pageSource, /<option value="blank">留空<\/option>\s*<option value="page">显示页码<\/option>\s*<option value="date">显示北京时间日期<\/option>/, "footer-right picker should list blank before page and date");
assert.match(pageSource, /placeholder="账号名、署名或栏目名，可留空"/, "footer-left placeholder should explain its signature/account use instead of repeating the default value");
assert.match(pageSource, /context\.font = `500 13px \$\{FOOTER_FONT_FAMILY\}`;/, "footer typography should be smaller, lighter, and shared");
assert.match(pageSource, /theme\.surface\.footerTextAlpha \* 0\.74/, "footer text contrast should be quieter than body text");
assert.match(pageSource, /const THEME_PRESET_ORDER = \[\s*"moss-paper",\s*"warm-editor",\s*"peach-cloud",\s*"lemon-note",\s*"sage-dawn",\s*"swiss-modern",\s*"forest-archive",\s*"deep-obsidian"\s*\];/, "theme preset order should group default, efficiency, warm, cool, then dark styles");
assert.match(pageSource, /<details className="accordion-section" open>\s*<summary className="accordion-summary">排版风格预设<\/summary>/, "only the style preset accordion should be open by default");
assert.match(pageSource, /<details className="accordion-section">\s*<summary className="accordion-summary">排版微调<\/summary>/, "typography tuning accordion should be collapsed by default");
assert.match(pageSource, /function sanitizeDownloadName/, "download names should be sanitized for local file systems");
assert.match(pageSource, /function getExportTimestamp/, "exported image names should include a timestamp to prevent conflicts");
assert.match(pageSource, /function createExportFileName/, "exported image names should be centralized");
assert.match(pageSource, /manualTitle\.trim\(\) \|\| "LuKK-小红书卡片"/, "untitled exports should use a LuKK-branded default name");
assert.match(pageSource, /createExportFileName\(manualTitle, index, exportTimestamp\)/, "bulk export should name each single image from the user title and page number");
assert.doesNotMatch(pageSource, /xhs-poster-\$\{index \+ 1\}\.png/, "bulk export should not use the old generic xhs-poster file names");
assert.match(cssSource, /\.text-area::-webkit-scrollbar \{[\s\S]*?width: 5px;/, "textarea scrollbars should use a thinner visual treatment");
assert.match(cssSource, /\.info-icon \{[\s\S]*?display: block;/, "inline SVG info icon should be block-level for stable centering");
assert.doesNotMatch(pageSource, /preview-action-bar|preview-action-kicker/, "bottom export action bar should be removed");
assert.match(pageSource, /borderRadius: cardCornerMode === "rounded" \? 12 : 0/, "preview card radius should use the medium radius level");
assert.match(cssSource, /\.hero-card,[\s\S]*?border-radius: 20px;/, "large surfaces should use tighter 20px radius");
assert.match(cssSource, /--accent:\s*#24211d;/, "outer UI accent should use warm charcoal instead of SaaS blue");
assert.match(cssSource, /--surface-shadow:\s*rgba\(36, 32, 28, 0\.08\);/, "outer UI shadows should use warm charcoal instead of cold blue-gray");
assert.match(cssSource, /\.hero-copy h1 \{[\s\S]*?font-family: "Source Han Serif SC", "Songti SC", "STSong", serif;[\s\S]*?letter-spacing: 0\.026em;/, "top product headline should carry the same editorial serif taste as the cards");
assert.match(cssSource, /\.primary-button \{[\s\S]*?border-radius: 12px;[\s\S]*?background: linear-gradient\(135deg, #181612, #2f2a24\);/, "primary buttons should use warm charcoal with 12px radius");
assert.match(cssSource, /\.panel-tabs \{[\s\S]*?border-radius: 12px;/, "tab switcher should use 12px radius");
assert.match(cssSource, /\.workspace-grid \{[\s\S]*?align-items: stretch;/, "main columns should stretch together");
assert.match(cssSource, /\.text-input,[\s\S]*?border: 1px solid #e4e4e7;[\s\S]*?background: #fff;/, "inputs should use a clean white surface with a subtle border");
assert.match(cssSource, /\.text-input:focus,[\s\S]*?border-color: #a8a09a;[\s\S]*?box-shadow: 0 0 0 2px rgba\(36, 32, 28, 0\.08\);/, "inputs should have a warm, restrained focus state");
assert.match(cssSource, /\.content-form-stack \{[\s\S]*?flex-direction: column;/, "content editor should have a stretching form stack");
assert.match(cssSource, /\.text-area--content \{[\s\S]*?flex: 1;/, "body textarea should fill available sidebar space");
assert.match(cssSource, /\.panel-section \+ \.panel-section \{[\s\S]*?margin-top: 32px;/, "title and body input groups should have clearer separation");
assert.doesNotMatch(cssSource, /preview-action-bar|padding: 24px 24px 118px;/, "bottom action bar styling should not remain");
assert.match(pageSource, /tags:\s*\["复古",\s*"安静"\]/, "theme presets should use compact tags instead of long visible descriptions");
assert.match(pageSource, /function getThemeSwatchMark/, "theme swatches should use a compact visual mark");
assert.match(pageSource, /className="theme-swatch-mark"/, "preset thumbnails should not repeat the full preset name");
assert.match(pageSource, /className="theme-card-tags"/, "theme cards should show compact style tags");
assert.match(pageSource, /title=\{`\$\{item\.name\}：\$\{item\.description\}`\}/, "long preset descriptions should move to hover titles");
assert.doesNotMatch(pageSource, /theme-swatch-preset|theme-swatch-name/, "theme thumbnails should not repeat full theme labels");
assert.doesNotMatch(pageSource, />\s*重置微调\s*</, "duplicate micro-adjust reset label should be removed");
assert.match(pageSource, />\s*恢复预设值\s*</, "reset button should use preset-oriented copy");
assert.match(cssSource, /\.accordion-summary::after/, "accordion arrow should move to the right side");
assert.doesNotMatch(cssSource, /\.accordion-summary::before/, "accordion arrow should not sit before the heading");
assert.match(cssSource, /\.select-input \{[\s\S]*?appearance: none;/, "select controls should use a customized visual treatment");
assert.doesNotMatch(pageSource, /className="field-hint"/, "select helper copy should move to inline right metadata");
assert.doesNotMatch(cssSource, /\.field-hint \{/, "obsolete below-control helper styling should be removed");
assert.match(pageSource, /<label htmlFor="title-font-mode">标题样式<\/label>\s*<span className="section-meta">字体气质<\/span>/, "title style helper should sit inline at the right");
assert.match(pageSource, /<label htmlFor="subheading-style">小标题样式<\/label>\s*<span className="section-meta">Markdown #<\/span>/, "subheading style picker should explain it applies to markdown headings");
assert.match(pageSource, /<option value="large">放大加粗<\/option>\s*<option value="accent">主题异色<\/option>/, "subheading style picker should offer large and accent modes");
assert.match(pageSource, /<label htmlFor="highlight-style">高亮样式<\/label>\s*<span className="section-meta">随主题变化<\/span>/, "highlight helper should sit inline at the right");
assert.match(readmeSource, /分割线 `---`/, "README should document markdown divider syntax");
assert.match(pageSource, /LEGACY_DEFAULT_CONTENT_PATTERNS/, "legacy default content patterns should be defined");
assert.match(pageSource, /setContent\(\(current\) => \(isLegacyDefaultContent\(current\) \? DEFAULT_CONTENT : current\)\)/, "legacy default content should be migrated without overwriting custom content");
