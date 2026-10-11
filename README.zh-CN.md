<div align="center"><a name="readme-top"></a>

[![postcss-px-conversion][image-banner]][github-link]

# postcss-px-conversion

把 px 转换成 vw、vh、vmin、vmax、rem 和 rpx 的 PostCSS 插件。<br/>

[English](./README.md) · **简体中文** · [更新日志][changelog] · [问题反馈][github-issues-link]

<!-- SHIELD GROUP -->

[![npm 版本][npm-release-shield]][npm-release-link]
[![npm 下载量][npm-downloads-shield]][npm-downloads-link]
[![包体积][bundle-shield]][bundle-link]
[![PostCSS 8][postcss-shield]][postcss-link]<br/>
[![GitHub 星标][github-stars-shield]][github-stars-link]
[![GitHub Issues][github-issues-shield]][github-issues-link]
[![许可证][github-license-shield]][github-license-link]

</div>

<details>
<summary><kbd>目录</kbd></summary>

- [✨ 特性](#-特性)
  - [px 转换成视口单位](#px-转换成视口单位)
  - [vw、vh、vmin、vmax、rem 或者 rpx](#vwvhvminvmaxrem-或者-rpx)
  - [每个断点使用各自的设计稿宽度](#每个断点使用各自的设计稿宽度)
  - [每个文件使用各自的设计稿宽度](#每个文件使用各自的设计稿宽度)
  - [横屏](#横屏)
  - [保持不变的值](#保持不变的值)
- [📦 安装](#-安装)
- [🚀 使用](#-使用)
  - [Nuxt](#nuxt)
  - [rem 转换成 px](#rem-转换成-px)
- [⚙️ 配置项](#️-配置项)
- [🧮 换算规则](#-换算规则)
- [🤝 问题反馈](#-问题反馈)

<br/>

</details>

## ✨ 特性

![px 转换成视口单位][image-feature-viewport-units]

### px 转换成视口单位

样式里直接写设计稿上标注的 px 尺寸。插件把每个值除以 `viewportWidth` 再乘以 100，设计稿宽度为 375px 时，`width: 320px` 会转换成 `width: 85.33333vw`。

```css
/* 输入 */
.card {
  width: 320px;
  padding: 12px 24px;
  font-size: 16px;
  border: 1px solid;
}

/* 输出 */
.card {
  width: 85.33333vw;
  padding: 3.2vw 6.4vw;
  font-size: 4.26667vw;
  border: 1px solid;
}
```

不大于 `minPixelValue`（默认为 1）的值保留 px，所以 1px 的细边框仍然只有一个像素宽。

<div align="right">

[![返回顶部][back-to-top]](#readme-top)

</div>

![vw、vh、vmin、vmax、rem 或者 rpx][image-feature-target-units]

### vw、vh、vmin、vmax、rem 或者 rpx

`viewportUnit` 设置要转换成的单位，`fontViewportUnit` 单独设置属性名包含 `font` 的属性要转换成的单位。视口单位根据设计稿宽度换算，rpx 也一样，它把屏幕宽度分成 750 份。rem 和 px 之间通过 `rootValue` 互相换算，`rootValue` 默认为 16。

```js
// 320px -> 20rem
postcssPxConversion({ viewportUnit: "rem" });
// 320px -> 640rpx
postcssPxConversion({ viewportUnit: "rpx" });
// 1.5rem -> 24px
postcssPxConversion({ unitType: "rem", viewportUnit: "px", fontViewportUnit: "px" });
```

<div align="right">

[![返回顶部][back-to-top]](#readme-top)

</div>

![每个断点使用各自的设计稿宽度][image-feature-breakpoints]

### 每个断点使用各自的设计稿宽度

`viewportWidth` 可以写成函数。函数会收到文件路径和声明所在的位置，位置包括属性名、所在规则的选择器和外层的各个 at-rule，at-rule 从最外层开始排列。函数返回 undefined 时，这条声明保持不变。

```js
postcssPxConversion({
  allowMediaQuery: true,
  viewportWidth: (file, { atRules }) => {
    const desktop = atRules.some(atRule => atRule.params.includes("min-width: 768px"));
    return desktop ? 1440 : 375;
  },
});
```

这样设置后，`width: 150px` 在媒体查询外面转换成 `40vw`，在 `@media (min-width: 768px)` 里面转换成 `10.41667vw`。

<div align="right">

[![返回顶部][back-to-top]](#readme-top)

</div>

![每个文件使用各自的设计稿宽度][image-feature-per-file-width]

### 每个文件使用各自的设计稿宽度

以 `viewport-width` 开头的注释给所在文件里的声明设置宽度，多个文件合并成一份样式表以后，每个文件的宽度仍然分别生效。宽度是开头文字后面的第一个数字，必须大于 0。

```css
/* viewport-width: 1920 */
.header {
  width: 1600px; /* 转换成 83.33333vw */
}
```

```css
/* viewport-width: 375 */
.header {
  width: 350px; /* 转换成 93.33333vw */
}
```

这样一次构建就能生成桌面端和移动端两份样式表，再用媒体查询分别加载：

```html
<link rel="stylesheet" href="desktop.css" media="(min-width: 1280px)" />
<link rel="stylesheet" href="mobile.css" media="(max-width: 1279px)" />
```

<div align="right">

[![返回顶部][back-to-top]](#readme-top)

</div>

![横屏][image-feature-landscape]

### 横屏

开启 `enableLandscape` 后，会变化的声明被复制到一个 `@media (orientation: landscape)` 块里，按照 `landscapeUnit` 和 `landscapeViewportWidth` 转换，`landscapeViewportWidth` 默认为 568。

```css
/* 输入 */
.banner {
  width: 71px;
}

/* 输出 */
.banner {
  width: 18.93333vw;
}
@media (orientation: landscape) {
  .banner {
    width: 12.5vw;
  }
}
```

复制的是直接写在样式表里或者 `@layer` 块里的规则，嵌套在其中的规则在副本里保持原来的位置。这个块放在样式表末尾，或者放在原规则所在的 `@layer` 末尾。开启 `allowMediaQuery` 时，自己写在横屏媒体查询里的规则也按照横屏设置转换。

<div align="right">

[![返回顶部][back-to-top]](#readme-top)

</div>

![保持不变的值][image-feature-left-alone]

### 保持不变的值

字符串、`url()` 和含有数字的名字（比如 `var(--space-10px)`）一律不转换。at-rule 的参数（比如 `@media (min-width: 768px)`）以及 `@page`、`@property`、`@font-face` 里的描述符也不转换。

在声明前面写 `px-conversion-ignore-next` 注释，或者在声明后面同一行写 `px-conversion-ignore-prev` 注释，这条声明就保持不变。注释会从输出里删除。

```css
.box {
  /* px-conversion-ignore-next */
  width: 10px;
  height: 10px; /* px-conversion-ignore-prev */
}
```

`selectorBlacklist`、`selectorWhitelist`、`allowedProperties`、`excludedProperties`、`excludeFiles` 和 `includeFiles` 决定哪些规则、属性和文件需要转换。`@media` 和 `@container` 里的规则只在开启 `allowMediaQuery` 时转换。

<div align="right">

[![返回顶部][back-to-top]](#readme-top)

</div>

## 📦 安装

```bash
npm install postcss postcss-px-conversion --save-dev
```

## 🚀 使用

把插件添加到 PostCSS 配置里：

```js
// postcss.config.mjs
export default {
  plugins: {
    "postcss-px-conversion": {
      viewportWidth: 375,
    },
  },
};
```

插件也可以导入后调用，或者不调用直接传给 PostCSS：

```js
// postcss.config.mjs
import postcssPxConversion from "postcss-px-conversion";

export default {
  plugins: [postcssPxConversion({ viewportWidth: 375 })],
};
```

> [!TIP]
>
> Tailwind CSS 4 把规则放在 `@layer` 里，插件会转换这些规则。Tailwind CSS 的断点是媒体查询，开启 `allowMediaQuery` 后才会转换。

### Nuxt

`nuxt.config.ts`

```ts
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

在下面的目录结构里，`index` 页面会转换，`active` 页面不会：

```
- package.json
- pages
  - index
    - index.vue
  - active
    - index.vue
```

### rem 转换成 px

rem 的大小跟随网页 `<html>` 元素的字号。界面如果显示在你无法控制的网页里，比如浏览器扩展放在 shadow root 里的内容脚本界面，可以把 rem 转换成 px，在任何网页上都保持同样的大小：

```js
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

`minPixelValue: 0` 让 `0.25rem` 这样的小数值也会转换，`allowMediaQuery: true` 让媒体查询里的规则也会转换，比如 Tailwind CSS 的断点。

<div align="right">

[![返回顶部][back-to-top]](#readme-top)

</div>

## ⚙️ 配置项

| 配置项                   | 默认值             | 说明                                                                                                   |
| ------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------ |
| `unitType`               | `"px"`             | 要转换的源单位。`viewportWidth` 和 `landscapeViewportWidth` 也以这个单位计算。                         |
| `viewportWidth`          | `375`              | 设计稿宽度，或者根据文件和位置返回宽度的函数。视口单位和 rpx 会用到它。                                |
| `rootValue`              | `16`               | 1rem 等于多少 px，rem 和 px 互相转换时使用。                                                           |
| `unitPrecision`          | `5`                | 转换结果保留的小数位数。                                                                               |
| `allowedProperties`      | `["*"]`            | 要转换的属性。`*` 匹配全部属性，`*name*`、`name*` 和 `*name` 匹配属性名的一部分，以 `!` 开头表示排除。 |
| `excludedProperties`     | `[]`               | 一律不转换的属性，写法和 `allowedProperties` 相同，不加 `!`。                                          |
| `viewportUnit`           | `"vw"`             | 要转换成的单位。                                                                                       |
| `fontViewportUnit`       | `"vw"`             | 属性名包含 `font` 的属性要转换成的单位。                                                               |
| `selectorBlacklist`      | `[]`               | 选择器包含其中某个字符串或者匹配其中某个正则表达式的规则保持不变，嵌套在它们里面的规则也一样。         |
| `selectorWhitelist`      | `[]`               | 不为空时，只转换自身选择器或者外层规则选择器匹配其中一项的规则。                                       |
| `minPixelValue`          | `1`                | 不大于这个数值的值不转换，数值以 `unitType` 计算。                                                     |
| `allowMediaQuery`        | `false`            | 转换 `@media` 和 `@container` 里的规则。                                                               |
| `replaceRules`           | `true`             | 直接替换原值。为 false 时，在原声明后面添加一条转换后的声明。                                          |
| `excludeFiles`           | `[]`               | 不转换的文件，用字符串或者正则表达式按照路径匹配。                                                     |
| `includeFiles`           | `[]`               | 不为空时，只转换路径匹配的文件。                                                                       |
| `enableLandscape`        | `false`            | 添加一个 `@media (orientation: landscape)` 块，里面是按照 `landscapeViewportWidth` 转换的值。          |
| `landscapeUnit`          | `"vw"`             | 横屏时要转换成的单位。                                                                                 |
| `landscapeViewportWidth` | `568`              | 横屏时的设计稿宽度，也可以像 `viewportWidth` 一样写成函数。                                            |
| `enablePerFileConfig`    | `true`             | 从注释里读取每个文件自己的宽度。                                                                       |
| `viewportWidthComment`   | `"viewport-width"` | 文件宽度注释的开头文字。                                                                               |

设为 undefined 的配置项使用默认值。配置项的值无效会在创建插件时报错，宽度函数返回 0 或者负数也会报错。

默认导出上带有类型，比如 `postcssPxConversion.Options` 和 `postcssPxConversion.ConversionContext`。

<div align="right">

[![返回顶部][back-to-top]](#readme-top)

</div>

## 🧮 换算规则

| 目标单位                              | 公式                         | 示例（设计稿宽度 375px）    |
| ------------------------------------- | ---------------------------- | --------------------------- |
| `vw`、`vh`、`vmin`、`vmax` 和其他单位 | `数值 / viewportWidth * 100` | `320px` 转换成 `85.33333vw` |
| `rpx`                                 | `数值 / viewportWidth * 750` | `320px` 转换成 `640rpx`     |
| `rem`（`unitType` 为 `px`）           | `数值 / rootValue`           | `320px` 转换成 `20rem`      |
| `px`（`unitType` 为 `rem`）           | `数值 * rootValue`           | `1.5rem` 转换成 `24px`      |

其他单位转换成 px 或者 rem 不受支持，因为无法确定它们对应多少 px。单位组合不受支持，或者源单位和目标单位相同，都会在创建插件时报错。结果按照 `unitPrecision` 位小数四舍五入，结果为 0 时只写 `0`。

插件转换样式规则、关键帧和 `@position-try` 里声明值中的数字。

<div align="right">

[![返回顶部][back-to-top]](#readme-top)

</div>

## 🤝 问题反馈

如果有任何问题或者建议，请在 [GitHub Issues][github-issues-link] 上反馈。

---

[MIT](./LICENSE) License &copy; 2023-PRESENT [Kirk Lin](https://github.com/kirklin)

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
[bundle-link]: https://bundlejs.com/?q=postcss-px-conversion
[bundle-shield]: https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdeno.bundlejs.com%2F%3Fq%3Dpostcss-px-conversion&query=%24.size.compressedSize&label=minzip&color=8ae8ff&labelColor=black&style=flat-square
[changelog]: https://github.com/kirklin/postcss-px-conversion/releases
[github-issues-link]: https://github.com/kirklin/postcss-px-conversion/issues
[github-issues-shield]: https://img.shields.io/github/issues/kirklin/postcss-px-conversion?color=ff80eb&labelColor=black&style=flat-square
[github-license-link]: https://github.com/kirklin/postcss-px-conversion/blob/main/LICENSE
[github-license-shield]: https://img.shields.io/github/license/kirklin/postcss-px-conversion?color=white&labelColor=black&style=flat-square
[github-link]: https://github.com/kirklin/postcss-px-conversion
[github-stars-link]: https://github.com/kirklin/postcss-px-conversion/stargazers
[github-stars-shield]: https://img.shields.io/github/stars/kirklin/postcss-px-conversion?color=ffcb47&labelColor=black&style=flat-square
[image-banner]: ./.github/assets/banner.png
[image-feature-breakpoints]: ./.github/assets/feature-breakpoints.png
[image-feature-landscape]: ./.github/assets/feature-landscape.png
[image-feature-left-alone]: ./.github/assets/feature-left-alone.png
[image-feature-per-file-width]: ./.github/assets/feature-per-file-width.png
[image-feature-target-units]: ./.github/assets/feature-target-units.png
[image-feature-viewport-units]: ./.github/assets/feature-viewport-units.png
[npm-downloads-link]: https://www.npmjs.com/package/postcss-px-conversion
[npm-downloads-shield]: https://img.shields.io/npm/dm/postcss-px-conversion?color=45cc11&labelColor=black&style=flat-square
[npm-release-link]: https://www.npmjs.com/package/postcss-px-conversion
[npm-release-shield]: https://img.shields.io/npm/v/postcss-px-conversion?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[postcss-link]: https://postcss.org
[postcss-shield]: https://img.shields.io/badge/postcss-8-dd3a0a?labelColor=black&logo=postcss&logoColor=white&style=flat-square
