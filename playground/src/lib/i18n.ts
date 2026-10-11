import type { OptionKey } from "./options";
import type { LinkProblem } from "./share";
import { computed, ref, watch } from "vue";

export type Locale = "en" | "zh";
export type GroupId = "units" | "values" | "filters" | "media" | "files";

interface Messages {
  playground: string;
  docs: string;
  share: string;
  linkCopied: string;
  otherLanguage: string;
  switchLanguage: string;
  useDark: string;
  useLight: string;
  example: string;
  resetOptions: string;
  resetCode: string;
  groups: Record<GroupId, string>;
  fields: Record<OptionKey | "file", string>;
  filePath: string;
  changedFrom: (value: string) => string;
  listPlaceholder: string;
  regex: string;
  remove: (entry: string) => string;
  sameUnit: string;
  needsRem: string;
  needsPx: string;
  input: string;
  html: string;
  output: string;
  config: string;
  preview: string;
  copy: string;
  copied: string;
  converted: (count: number) => string;
  warnings: (count: number) => string;
  failed: string;
  screen: string;
  compare: string;
  before: string;
  after: string;
  design: (width: number) => string;
  rpxNotice: string;
  loadError: (reason: string) => string;
  linkProblem: (problem: LinkProblem) => string;
  targetUnit: string;
}

const MESSAGES: Record<Locale, Messages> = {
  en: {
    playground: "Playground",
    docs: "Docs",
    share: "Share",
    linkCopied: "Link copied",
    otherLanguage: "中文",
    switchLanguage: "Switch to Chinese",
    useDark: "Use the dark theme",
    useLight: "Use the light theme",
    example: "Example",
    resetOptions: "Reset options",
    resetCode: "Reset code",
    groups: {
      units: "Units",
      values: "Values",
      filters: "Selectors and properties",
      media: "Media queries and landscape",
      files: "Files",
    },
    fields: {
      unitType: "The unit to convert from. Design widths are measured in it.",
      viewportWidth: "The width of the design. Viewport units and rpx use it.",
      viewportUnit: "The unit to convert to.",
      fontViewportUnit: "The unit for properties whose name contains font.",
      rootValue: "How many px one rem is.",
      unitPrecision: "Decimal places in converted values.",
      minPixelValue: "Values up to this number stay as they are.",
      replaceRules: "Replace values in place. When off, the converted declaration is added after the original one.",
      selectorBlacklist: "Rules whose selector contains an entry stay as they are. Write /pattern/ for a regular expression.",
      selectorWhitelist: "When not empty, only rules whose selector matches an entry are converted.",
      allowedProperties: "Properties to convert. * matches all, *name*, name* and *name match parts, and ! excludes.",
      excludedProperties: "Properties never to convert.",
      allowMediaQuery: "Convert rules inside @media and @container.",
      enableLandscape: "Add a @media (orientation: landscape) block converted with the landscape width.",
      landscapeUnit: "The unit to convert to in landscape.",
      landscapeViewportWidth: "The width of the design in landscape.",
      file: "The path PostCSS gets for this stylesheet. The file lists match against it.",
      includeFiles: "When not empty, only files whose path matches are converted.",
      excludeFiles: "Files to leave alone, matched by path.",
      enablePerFileConfig: "Read a design width from a viewport-width comment in the file.",
      viewportWidthComment: "The text a width comment starts with.",
    },
    filePath: "file path",
    changedFrom: value => `Changed from ${value}`,
    listPlaceholder: "Type and press Enter",
    regex: "Regular expression",
    remove: entry => `Remove ${entry}`,
    sameUnit: "The same unit as unitType",
    needsRem: "Converting to px needs unitType rem",
    needsPx: "Converting to rem needs unitType px",
    input: "CSS input",
    html: "Preview HTML",
    output: "Converted CSS",
    config: "PostCSS config",
    preview: "Preview",
    copy: "Copy",
    copied: "Copied",
    converted: count => count === 0 ? "No values converted" : count === 1 ? "1 value converted" : `${count} values converted`,
    warnings: count => count === 1 ? "1 warning" : `${count} warnings`,
    failed: "Conversion failed",
    screen: "Screen width",
    compare: "Compare",
    before: "Before",
    after: "After",
    design: width => `${width}px design`,
    rpxNotice: "rpx works only in WeChat Mini Programs, so a browser can't show the converted page.",
    loadError: reason => `Could not open the shared link: ${reason}. The first example is shown instead.`,
    linkProblem: (problem) => {
      switch (problem.kind) {
        case "damaged":
          return "it is incomplete or has been changed";
        case "empty":
          return "it holds no playground code";
        case "wrongType":
          return `${problem.key} in it has the wrong type`;
        case "unknownExample":
          return `the example "${problem.id}" no longer exists`;
      }
    },
    targetUnit: "Convert to",
  },
  zh: {
    playground: "在线试用",
    docs: "文档",
    share: "分享",
    linkCopied: "链接已复制",
    otherLanguage: "English",
    switchLanguage: "切换到英文",
    useDark: "使用深色主题",
    useLight: "使用浅色主题",
    example: "示例",
    resetOptions: "恢复示例选项",
    resetCode: "恢复示例代码",
    groups: {
      units: "单位",
      values: "数值",
      filters: "选择器和属性",
      media: "媒体查询和横屏",
      files: "文件",
    },
    fields: {
      unitType: "要转换的源单位，设计稿宽度也以这个单位计算。",
      viewportWidth: "设计稿宽度，视口单位和 rpx 都按它换算。",
      viewportUnit: "要转换成的单位。",
      fontViewportUnit: "属性名包含 font 的属性要转换成的单位。",
      rootValue: "1rem 等于多少 px。",
      unitPrecision: "转换结果保留的小数位数。",
      minPixelValue: "不大于这个数值的值保持不变。",
      replaceRules: "直接替换原值。关闭后，在原声明后面添加一条转换后的声明。",
      selectorBlacklist: "选择器包含其中一项的规则保持不变。写成 /规则/ 的条目按正则表达式匹配。",
      selectorWhitelist: "不为空时，只转换选择器匹配其中一项的规则。",
      allowedProperties: "要转换的属性。* 匹配全部，*name*、name* 和 *name 匹配属性名的一部分，以 ! 开头表示排除。",
      excludedProperties: "一律不转换的属性。",
      allowMediaQuery: "转换 @media 和 @container 里的规则。",
      enableLandscape: "添加一个 @media (orientation: landscape) 块，里面的值按横屏宽度转换。",
      landscapeUnit: "横屏时要转换成的单位。",
      landscapeViewportWidth: "横屏时的设计稿宽度。",
      file: "PostCSS 拿到的样式文件路径，文件名单按它匹配。",
      includeFiles: "不为空时，只转换路径匹配的文件。",
      excludeFiles: "不转换的文件，按路径匹配。",
      enablePerFileConfig: "从文件里的 viewport-width 注释读取设计稿宽度。",
      viewportWidthComment: "宽度注释的开头文字。",
    },
    filePath: "文件路径",
    changedFrom: value => `已改动，默认值是 ${value}`,
    listPlaceholder: "输入后按回车",
    regex: "正则表达式",
    remove: entry => `删除 ${entry}`,
    sameUnit: "和 unitType 是同一个单位",
    needsRem: "转换成 px 需要 unitType 为 rem",
    needsPx: "转换成 rem 需要 unitType 为 px",
    input: "输入的 CSS",
    html: "预览用的 HTML",
    output: "转换后的 CSS",
    config: "PostCSS 配置",
    preview: "预览",
    copy: "复制",
    copied: "已复制",
    converted: count => count === 0 ? "没有转换任何数值" : `转换了 ${count} 个数值`,
    warnings: count => `${count} 条警告`,
    failed: "转换失败",
    screen: "屏幕宽度",
    compare: "对比",
    before: "转换前",
    after: "转换后",
    design: width => `设计稿 ${width}px`,
    rpxNotice: "rpx 只在微信小程序里有效，浏览器无法显示转换后的页面。",
    loadError: reason => `无法打开分享链接，${reason}。下面显示的是第一个示例。`,
    linkProblem: (problem) => {
      switch (problem.kind) {
        case "damaged":
          return "链接不完整或者被改动过";
        case "empty":
          return "链接里没有试用的代码";
        case "wrongType":
          return `链接里 ${problem.key} 的类型不对`;
        case "unknownExample":
          return `示例“${problem.id}”已经不存在`;
      }
    },
    targetUnit: "转换成",
  },
};

function initialLocale(): Locale {
  const saved = localStorage.getItem("locale");
  if (saved === "en" || saved === "zh") {
    return saved;
  }
  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export const locale = ref<Locale>(initialLocale());
export const t = computed(() => MESSAGES[locale.value]);

watch(locale, (value) => {
  localStorage.setItem("locale", value);
  document.documentElement.lang = value === "zh" ? "zh-CN" : "en";
}, { immediate: true });
