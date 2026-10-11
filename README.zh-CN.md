# postcss-px-conversion

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]
[![javascript_code style][code-style-image]][code-style-url]

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/postcss-px-conversion?style=flat&colorA=080f12&colorB=3491fa
[npm-version-href]: https://npmjs.com/package/postcss-px-conversion
[npm-downloads-src]: https://img.shields.io/npm/dm/postcss-px-conversion?style=flat&colorA=080f12&colorB=3491fa
[npm-downloads-href]: https://npmjs.com/package/postcss-px-conversion
[bundle-src]: https://img.shields.io/bundlephobia/minzip/postcss-px-conversion?style=flat&colorA=080f12&colorB=3491fa&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=postcss-px-conversion
[license-src]: https://img.shields.io/github/license/kirklin/postcss-px-conversion.svg?style=flat&colorA=080f12&colorB=3491fa
[license-href]: https://github.com/kirklin/postcss-px-conversion/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=3491fa
[jsdocs-href]: https://www.jsdocs.io/package/postcss-px-conversion
[code-style-image]: https://img.shields.io/badge/code__style-%40kirklin%2Feslint--config-3491fa?style=flat&colorA=080f12&colorB=3491fa
[code-style-url]: https://github.com/kirklin/eslint-config/

<div align='center'>
<a href="README.md">English</a> | <b>简体中文</b>
</div>

这是一个把像素单位转换成视口单位（vw、vh、vmin、vmax）的 PostCSS 插件，也能把 px 转成 rem、rem 转成 px、px 转成 rpx，适用于 PostCSS 8。

## 安装

```bash
npm install postcss postcss-px-conversion --save-dev
```

## 使用

把插件加到 PostCSS 配置里：

```javascript
// postcss.config.mjs
export default {
  plugins: {
    "postcss-px-conversion": {
      viewportWidth: 375,
    },
  },
};
```

```css
/* 输入 */
.header {
  width: 350px;
  font-size: 15px;
}

/* 输出 */
.header {
  width: 93.33333vw;
  font-size: 4vw;
}
```

### 在 Nuxt 3 中使用

`nuxt.config.ts`

```javascript
export default defineNuxtConfig({
  postcss: {
    plugins: {
      "postcss-px-conversion": {
        viewportWidth: 375,
        unitPrecision: 10,
        viewportUnit: "vw",
        minPixelValue: 1,
        includeFiles: [/\/pages\//],
        excludeFiles: [/node_modules/, /pages\/active\/index\.vue/],
      },
    },
  },
});
```

在下面的目录结构里，`index` 页面会被转换，`active` 页面不会：

```
- package.json
- pages
  - index
    - index.vue
  - active
    - index.vue
```

### rem 转 px

rem 的大小跟着网页 `<html>` 元素的字号走。界面如果要显示在别人的网页里，比如浏览器扩展放在 shadow root 里的内容脚本界面，可以把 rem 转成 px，在哪个网页上都保持同样大小：

```javascript
// postcss.config.mjs
import postcssPxConversion from "postcss-px-conversion";

export default {
  plugins: [
    postcssPxConversion({
      unitType: "rem",
      viewportUnit: "px",
      fontViewportUnit: "px",
      minPixelValue: 0,
      allowMediaQuery: true,
    }),
  ],
};
```

`rootValue`（默认 16）是 1rem 对应的 px 数。`minPixelValue: 0` 让 `0.25rem` 这样的小数值也会转换，`allowMediaQuery: true` 让媒体查询里的规则也会转换，比如 Tailwind CSS 的断点。

### px 转 rem 和 px 转 rpx

```javascript
postcssPxConversion({ viewportUnit: "rem" }); // 24px -> 1.5rem，按 rootValue 换算
postcssPxConversion({ viewportUnit: "rpx", viewportWidth: 375 }); // 10px -> 20rpx，屏幕宽度是 750rpx
```

### 不同断点使用不同的设计稿宽度

`viewportWidth` 可以是一个函数。它会收到文件路径和声明所在的位置：属性名、所在规则的选择器，以及包住它的 at-rule（从最外层到最内层）。函数返回 undefined 时，这条声明保持不变。

```javascript
postcssPxConversion({
  allowMediaQuery: true,
  viewportWidth: (file, { atRules }) => {
    const desktop = atRules.some(atRule => atRule.name === "media" && atRule.params.includes("min-width: 768px"));
    return desktop ? 1440 : 375;
  },
});
```

## 配置项

- `unitType`，默认 `"px"`：要转换的源单位，`viewportWidth` 和 `landscapeViewportWidth` 也以这个单位计。
- `viewportWidth`，默认 `375`：设计稿宽度，或者按文件和位置返回宽度的函数。视口单位和 rpx 会用到它。
- `rootValue`，默认 `16`：1rem 等于多少 px，rem 转 px、px 转 rem 时使用。
- `unitPrecision`，默认 `5`：转换结果保留的小数位数。
- `allowedProperties`，默认 `["*"]`：要转换的属性。`*` 表示全部，`*name*`、`name*`、`*name` 匹配属性名的一部分，以 `!` 开头表示排除。
- `excludedProperties`，默认 `[]`：一律不转换的属性，写法和 `allowedProperties` 相同，不加 `!`。
- `viewportUnit`，默认 `"vw"`：要转换成的目标单位。
- `fontViewportUnit`，默认 `"vw"`：属性名包含 `font` 的属性要转换成的目标单位。
- `selectorBlacklist`，默认 `[]`：选择器包含这些字符串或匹配这些正则表达式的规则不转换，嵌套在它们里面的规则也不转换。
- `selectorWhitelist`，默认 `[]`：不为空时，只转换自身选择器或外层规则选择器匹配其中一项的规则。
- `minPixelValue`，默认 `1`：小于等于这个数值（以 `unitType` 计）的值不转换。
- `allowMediaQuery`，默认 `false`：是否转换 `@media` 和 `@container` 里的规则。
- `replaceRules`，默认 `true`：是否直接替换原值。为 false 时，在原声明后面添加一条转换后的声明。
- `excludeFiles`，默认 `[]`：不转换的文件，用字符串或正则表达式按路径匹配。
- `includeFiles`，默认 `[]`：不为空时，只转换路径匹配的文件。
- `enableLandscape`，默认 `false`：添加一个 `@media (orientation: landscape)` 块，里面是按 `landscapeViewportWidth` 转换的值。
- `landscapeUnit`，默认 `"vw"`：横屏时要转换成的目标单位。
- `landscapeViewportWidth`，默认 `568`：横屏时的设计稿宽度，也可以像 `viewportWidth` 一样写成函数。
- `enablePerFileConfig`，默认 `true`：从注释里读取每个文件自己的宽度，见下文。
- `viewportWidthComment`，默认 `"viewport-width"`：文件宽度注释的开头文字。

设为 undefined 的配置项使用默认值。

## 换算规则

vw 等视口单位按 `数值 / viewportWidth * 100` 计算，vh、svw、cqw 等其他单位也一样。rpx 按 `数值 / viewportWidth * 750` 计算。rem 转 px 乘以 `rootValue`，px 转 rem 除以 `rootValue`；其他单位转 px 或 rem 不支持，因为无法确定它们对应多少 px。单位组合不支持、源单位和目标单位相同或者配置项的值无效时，创建插件时就会报错。宽度函数返回 0 或负数时也会报错。

插件转换样式规则、关键帧和 `@position-try` 里声明值中的数字，以下内容保持不变：

- 字符串和 `url()`
- 名字里的数字，比如 `var(--gap-10px)`
- at-rule 的条件，比如 `@media (min-width: 768px)`
- `@page`、`@property` 和 `@font-face` 里的描述符

类型挂在默认导出上，比如 `postcssPxConversion.Options` 和 `postcssPxConversion.ConversionContext`。

## 按文件设置宽度

开启 `enablePerFileConfig` 后，文件里的一条注释可以设置这个文件里声明的宽度；多个文件合并成一份样式后也按各自的文件生效。宽度取注释开头文字后面的第一个数，必须大于 0：

```css
/* viewport-width: 1920 */
.header {
  width: 1600px; /* 转换为 83.33333vw */
}
```

```css
/* viewport-width: 375 */
.header {
  width: 350px; /* 转换为 93.33333vw */
}
```

这样一次构建就能生成桌面、平板和手机各自的样式，再用媒体查询加载：

```html
<link rel="stylesheet" href="desktop.css" media="(min-width: 1280px)" />
<link rel="stylesheet" href="mobile.css" media="(max-width: 1279px)" />
```

## 不转换某条声明

在声明前面写 `px-conversion-ignore-next` 注释，或者在声明后面同一行写 `px-conversion-ignore-prev` 注释，这条声明就保持不变，注释会从输出里删掉。

```css
.ignore {
  /* px-conversion-ignore-next */
  width: 10px;
  height: 10px; /* px-conversion-ignore-prev */
}
```

## 横屏

开启 `enableLandscape` 后，插件把会变化的声明复制到一个 `@media (orientation: landscape)` 块里，按 `landscapeUnit` 和 `landscapeViewportWidth` 转换。复制的是直接写在样式里或者 `@layer` 块里的规则，嵌套在里面的规则保持原来的位置，复制过来的每条声明都和转换时经过同样的检查。这个块放在样式的末尾，或者原规则所在 `@layer` 的末尾。自己写在横屏媒体查询里的规则，在开启 `allowMediaQuery` 时会按横屏设置转换。

## 从 0.1 升级

配置项的名字和 0.1 相同，以下行为有变化：

- `allowMediaQuery` 为 false 时，`@layer`、`@supports`、`@scope` 等 at-rule 里的规则也会转换；这个配置项只管 `@media` 和 `@container`，嵌套在规则里的 `@media` 和 `@container` 也一样。Tailwind CSS 4 把所有规则都放在 `@layer` 里，0.1 在这种情况下什么都不转换。
- `excludedProperties` 开始生效。
- 嵌套在 `selectorBlacklist` 排除的规则里的规则也不转换；嵌套在 `selectorWhitelist` 列出的规则里的规则会转换。
- 关键帧和其他规则经过同样的检查：`allowedProperties`、`excludedProperties`、`excludeFiles`、`includeFiles`、`allowMediaQuery`、忽略注释和 `replaceRules`。
- 忽略注释在嵌套规则里也生效。
- 选择器名单和文件名单里带 `g` 标志的正则表达式每次都能正确匹配。
- 名字里的数字保持不变，带转义引号的字符串整个保持不变，`10PX` 这样的大写单位和 `1e2px` 这样的数字会转换。
- 数值按十进制四舍五入，1.005 保留两位小数得到 1.01。
- `enableLandscape` 可以在 PostCSS 8 下使用，0.1 会报错 “AtRule is not a constructor”。横屏副本保留嵌套结构和所在的 `@layer`，只包含会变化的声明，不包含带忽略注释的声明，也不会带到下一个文件里。
- 文件宽度注释只对所在的文件生效，并且支持小数。
- `viewportUnit` 设为 `px`、`rem` 或 `rpx` 时，按 `rootValue` 或每 `viewportWidth` 对应 750 换算。
- 开启 `replaceRules` 时，即使规则里已经有转换后的同名声明，原值也会转换。
- `@position-try` 里的声明会转换。
- 设为 undefined 的配置项使用默认值，配置项的值无效时会报错。
- 函数形式的 `viewportWidth` 和 `landscapeViewportWidth` 会收到第二个参数，即声明所在的位置。
- 插件可以不调用、直接传给 PostCSS，比如 `plugins: [postcssPxConversion]`；`require()` 加载的是 CommonJS 版本，类型文件也是对应的版本。

## 问题反馈

如果有任何问题或建议，请在 [GitHub Issues](https://github.com/kirklin/postcss-px-conversion/issues) 上反馈。

## 许可证

[MIT](./LICENSE) License &copy; 2023-PRESENT [Kirk Lin](https://github.com/kirklin)
