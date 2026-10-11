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
<b>English</b> | <a href="README.zh-CN.md">简体中文</a>
</div>

A PostCSS plugin that converts pixel units to viewport units (vw, vh, vmin, vmax). It also converts px to rem, rem to px and px to rpx, and works with PostCSS 8.

## Installation

```bash
npm install postcss postcss-px-conversion --save-dev
```

## Usage

Add the plugin to your PostCSS configuration:

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
/* Input */
.header {
  width: 350px;
  font-size: 15px;
}

/* Output */
.header {
  width: 93.33333vw;
  font-size: 4vw;
}
```

### Used in Nuxt 3

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

With this directory structure, the `index` page is converted and the `active` page is not:

```
- package.json
- pages
  - index
    - index.vue
  - active
    - index.vue
```

### rem to px

Sizes in rem follow the font size of the page's `<html>` element. A UI that renders inside pages you do not control, such as a browser extension's content script UI in a shadow root, can convert rem to px to keep the same size everywhere:

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

`rootValue` (16 by default) is the number of px in one rem. `minPixelValue: 0` converts small values such as `0.25rem`, and `allowMediaQuery: true` converts rules inside media queries too, such as Tailwind CSS breakpoints.

### px to rem and px to rpx

```javascript
postcssPxConversion({ viewportUnit: "rem" }); // 24px -> 1.5rem, through rootValue
postcssPxConversion({ viewportUnit: "rpx", viewportWidth: 375 }); // 10px -> 20rpx, 750rpx is the screen width
```

### A different design width per breakpoint

`viewportWidth` can be a function. It receives the file path and the position of the declaration: its property, the selector of its rule and the at-rules around it, outermost first. Returning undefined leaves the declaration as it is.

```javascript
postcssPxConversion({
  allowMediaQuery: true,
  viewportWidth: (file, { atRules }) => {
    const desktop = atRules.some(atRule => atRule.name === "media" && atRule.params.includes("min-width: 768px"));
    return desktop ? 1440 : 375;
  },
});
```

## Options

- `unitType`, default `"px"`: the unit to convert from. `viewportWidth` and `landscapeViewportWidth` are measured in it.
- `viewportWidth`, default `375`: the width of the design, or a function that returns it for a file and position. Viewport units and rpx use it.
- `rootValue`, default `16`: how many px one rem is, used to convert rem to px and px to rem.
- `unitPrecision`, default `5`: the number of decimal places in converted values.
- `allowedProperties`, default `["*"]`: properties to convert. `*` matches all, `*name*`, `name*` and `*name` match parts of a property, and a leading `!` excludes it.
- `excludedProperties`, default `[]`: properties never to convert, written like `allowedProperties` without `!`.
- `viewportUnit`, default `"vw"`: the unit to convert to.
- `fontViewportUnit`, default `"vw"`: the unit to convert properties whose name contains `font` to.
- `selectorBlacklist`, default `[]`: rules whose selector contains one of these strings or matches one of these regular expressions are left alone, together with the rules nested in them.
- `selectorWhitelist`, default `[]`: when not empty, only rules whose own selector, or the selector of a rule around them, matches an entry are converted.
- `minPixelValue`, default `1`: values up to this number, in `unitType`, are not converted.
- `allowMediaQuery`, default `false`: convert rules inside `@media` and `@container`.
- `replaceRules`, default `true`: replace values in place. When false, the converted declaration is added after the original one.
- `excludeFiles`, default `[]`: files to leave alone, matched by path with strings or regular expressions.
- `includeFiles`, default `[]`: when not empty, only files whose path matches are converted.
- `enableLandscape`, default `false`: add a `@media (orientation: landscape)` block with the values converted by `landscapeViewportWidth`.
- `landscapeUnit`, default `"vw"`: the unit to convert to in landscape.
- `landscapeViewportWidth`, default `568`: the width of the design in landscape, or a function like `viewportWidth`.
- `enablePerFileConfig`, default `true`: read a width for each file from a comment, see below.
- `viewportWidthComment`, default `"viewport-width"`: the text a per-file width comment starts with.

An option set to undefined keeps its default.

## How values are converted

Viewport units such as vw take `value / viewportWidth * 100`, and so do other units, such as vh, svw or cqw. rpx takes `value / viewportWidth * 750`. Converting rem to px multiplies by `rootValue` and converting px to rem divides by it; other conversions to px or rem are not supported, because their size in px is unknown. An unsupported pair, the same unit on both sides or an invalid option throws an error when the plugin is created. A width function that returns 0 or less throws an error too.

The plugin converts numbers in declaration values of style rules, keyframes and `@position-try`. It leaves alone:

- strings and `url()`
- numbers that are part of a name, such as in `var(--gap-10px)`
- at-rule params, such as `@media (min-width: 768px)`
- descriptors of `@page`, `@property` and `@font-face`

Types are available on the default export, for example `postcssPxConversion.Options` and `postcssPxConversion.ConversionContext`.

## Per-file width

With `enablePerFileConfig`, a comment in a file sets the width for the declarations from that file, even after several files have been combined into one stylesheet. The width is the first number after the comment text, and it has to be greater than 0:

```css
/* viewport-width: 1920 */
.header {
  width: 1600px; /* converted to 83.33333vw */
}
```

```css
/* viewport-width: 375 */
.header {
  width: 350px; /* converted to 93.33333vw */
}
```

This lets one build produce stylesheets for desktop, tablet and mobile, for example loaded with media queries:

```html
<link rel="stylesheet" href="desktop.css" media="(min-width: 1280px)" />
<link rel="stylesheet" href="mobile.css" media="(max-width: 1279px)" />
```

## Ignoring a declaration

A `px-conversion-ignore-next` comment before a declaration, or a `px-conversion-ignore-prev` comment after it on the same line, keeps it as it is. The comment is removed from the output.

```css
.ignore {
  /* px-conversion-ignore-next */
  width: 10px;
  height: 10px; /* px-conversion-ignore-prev */
}
```

## Landscape

With `enableLandscape`, the plugin copies the declarations that change into a `@media (orientation: landscape)` block, converted with `landscapeUnit` and `landscapeViewportWidth`. It copies rules written directly in the stylesheet or in `@layer` blocks, with the rules nested in them kept in place, and checks every copied declaration the same way as for conversion. The block goes at the end of the stylesheet, or at the end of the `@layer` the rules came from. Rules you write in a landscape media query yourself are converted with the landscape settings when `allowMediaQuery` is on.

## Upgrading from 0.1

The option names are the same as in 0.1. These behaviors changed:

- Rules inside `@layer`, `@supports`, `@scope` and other at-rules are converted when `allowMediaQuery` is false; the option only covers `@media` and `@container`, also when they are nested in a rule. Tailwind CSS 4 puts every rule in `@layer`, where 0.1 converted nothing.
- `excludedProperties` takes effect.
- Rules nested in a rule that `selectorBlacklist` excludes are left alone too, and `selectorWhitelist` accepts rules nested in a listed rule.
- Keyframes go through the same checks as other rules: `allowedProperties`, `excludedProperties`, `excludeFiles`, `includeFiles`, `allowMediaQuery`, ignore comments and `replaceRules`.
- Ignore comments work in nested rules.
- Regular expressions with the `g` flag in selector and file lists match every time.
- Numbers that are part of a name are left alone, strings with escaped quotes are left alone as a whole, and upper-case units such as `10PX` and numbers such as `1e2px` are converted.
- Values round half up in decimal, so 1.005 rounds to 1.01.
- `enableLandscape` works with PostCSS 8; 0.1 threw "AtRule is not a constructor". Landscape copies keep their nesting and `@layer`, contain only declarations that change, leave out declarations with an ignore comment, and never carry over into the next file.
- A per-file width comment applies to its own file and accepts decimals.
- `viewportUnit` set to `px`, `rem` or `rpx` converts with `rootValue` or 750 per `viewportWidth`.
- With `replaceRules`, a value is converted even when the rule already has the converted declaration.
- Declarations of `@position-try` are converted.
- Options set to undefined keep their defaults, and invalid options throw an error.
- `viewportWidth` and `landscapeViewportWidth` functions receive the position of the declaration as a second argument.
- The plugin can be passed to PostCSS without calling it, as `plugins: [postcssPxConversion]`, and `require()` loads the CommonJS build with its own types.

## Feedback

If you have any questions or issues, please report them on [GitHub Issues](https://github.com/kirklin/postcss-px-conversion/issues).

## License

[MIT](./LICENSE) License &copy; 2023-PRESENT [Kirk Lin](https://github.com/kirklin)
