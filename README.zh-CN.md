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
<a href="README.md">English</a>| <b>简体中文</b>
</div>

这是一个将像素单位转换为视口单位（vw、vh、vmin、vmax）的PostCSS插件。这段代码已经从原始项目[evrone/postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport)迁移过来，因为原项目已不再维护。这个迁移后的代码与最新版本的PostCSS兼容。

## 安装

要使用这个插件，你需要在你的项目中设置好PostCSS。如果你还没有设置PostCSS，你可以通过运行以下命令来安装：

```bash
npm install postcss --save
```

接下来，安装`postcss-px-conversion`插件：

```bash
npm install postcss-px-conversion --save
```

## 使用

要在你的PostCSS配置中使用这个插件，将其添加到PostCSS插件列表中，同时加上所需的配置选项。

以下是在`postcss.config.js`中的示例配置：

```javascript
// postcss.config.js

module.exports = {
  plugins: {
    "postcss-px-conversion": {
      unitType: "px", // 要从哪种单位转换（默认为'px'）
      viewportWidth: 375,
      enablePerFileConfig: true, // 启用per-file配置
      viewportWidthComment: "viewport-width", // 用于指定视口宽度的注释
      // 其他配置选项...
    },
  },
};
```

## 配置选项

你可以使用各种选项来配置这个插件：

- `unitType`：要从哪种单位转换（默认为'px'）。
- `viewportWidth`：视口的宽度。
- `unitPrecision`：vw单位的小数位数。
- `allowedProperties`：要转换为vw的CSS属性列表。
- `excludedProperties`：要排除在转换之外的CSS属性列表。
- `viewportUnit`：期望的视口单位（vw、vh、vmin、vmax）。
- `fontViewportUnit`：期望的字体视口单位。
- `selectorBlacklist`：要忽略的选择器（字符串或正则表达式）。
- `minPixelValue`：要替换的最小像素值。
- `allowMediaQuery`：在媒体查询中允许px到vw的转换。
- `replaceRules`：替换包含vw的规则而不是添加回退规则。
- `excludeFiles`：要忽略的文件（作为正则表达式数组）。
- `includeFiles`：只转换匹配的文件（作为正则表达式数组）。
- `enableLandscape`：为横向模式添加@media (orientation: landscape)。
- `landscapeUnit`：横向模式的期望单位。
- `landscapeViewportWidth`：横向方向的视口宽度。
- `enablePerFileConfig`：启用per-file配置（默认为true）。
- `viewportWidthComment`：用于指定视口宽度的注释（默认为"viewport-width"）。

请根据你的项目需求调整这些选项。

## Per-File 配置

此插件现在支持per-file配置，允许你为每个CSS或SCSS文件指定不同的视口宽度。要使用这个功能，只需在文件的开头添加一个特殊的注释：

```css
/* viewport-width: 1920 */
```

插件会读取这个注释并使用指定的宽度来进行单位转换。这对于在同一个项目中为不同的设备（如PC、平板、手机）创建不同的CSS文件特别有用。

## 示例

以下是一个示例配置，将像素值转换为vw单位，默认视口宽度为750像素，并启用per-file配置：

```javascript
// postcss.config.js

module.exports = {
  plugins: {
    "postcss-px-conversion": {
      unitType: "px",
      viewportWidth: 750,
      unitPrecision: 5,
      allowedProperties: ["*"],
      excludedProperties: [],
      viewportUnit: "vw",
      fontViewportUnit: "vw",
      selectorBlacklist: [],
      minPixelValue: 1,
      allowMediaQuery: false,
      replaceRules: true,
      excludeFiles: [],
      includeFiles: [],
      enableLandscape: false,
      landscapeUnit: "vw",
      landscapeViewportWidth: 568,
      enablePerFileConfig: true,
      viewportWidthComment: "viewport-width",
    },
  },
};
```

使用这个配置，你的CSS中的像素值将在PostCSS处理期间自动转换为视口单位。同时，你可以在每个文件中使用注释来指定该文件的特定视口宽度。

例如，在一个针对桌面设备的CSS文件中：

```css
/* viewport-width: 1920 */
.header {
  width: 1600px; /* 将被转换为 83.33333vw */
}
```

而在一个针对移动设备的CSS文件中：

```css
/* viewport-width: 375 */
.header {
  width: 350px; /* 将被转换为 93.33333vw */
}
```

这样，你就可以在一次构建中生成适配多种设备的CSS，同时保持了代码的灵活性和可维护性。

## 鸣谢

原始代码从[evrone/postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport)迁移而来。

如果你有任何问题或疑虑，请在[GitHub Issues](https://github.com/kirklin/postcss-px-conversion/issues)上报告它们。

**愉快的编码！**

## License

[MIT](./LICENSE) License &copy; 2023-PRESENT [Kirk Lin](https://github.com/kirklin)
