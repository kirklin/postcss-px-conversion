# postcss-px-conversion

[![CI][ci-image]][ci-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript_code style][code-style-image]][code-style-url]

[ci-image]: https://github.com/kirklin/postcss-px-conversion/actions/workflows/release.yml/badge.svg?branch=main
[ci-url]: https://github.com/kirklin/postcss-px-conversion/actions/workflows/release.yml
[npm-image]: https://img.shields.io/npm/v/postcss-px-conversion.svg
[npm-url]: https://npmjs.org/package/postcss-px-conversion
[downloads-image]: https://img.shields.io/npm/dm/postcss-px-conversion.svg
[downloads-url]: https://npmjs.org/package/postcss-px-conversion
[code-style-image]: https://img.shields.io/badge/code__style-%40kirklin%2Feslint--config-brightgreen
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

请根据你的项目需求调整这些选项。

## 示例

以下是一个示例配置，将像素值转换为vw单位，视口宽度为750像素：

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
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      selectorBlacklist: [],
      minPixelValue: 1,
      allowMediaQuery: false,
      replaceRules: true,
      excludeFiles: [],
      includeFiles: [],
      enableLandscape: false,
      landscapeUnit: 'vw',
      landscapeViewportWidth: 568,
    },
  },
};
```

使用这个配置，你的CSS中的像素值将在PostCSS处理期间自动转换为视口单位。

## 鸣谢

原始代码从[evrone/postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport)迁移而来。

如果你有任何问题或疑虑，请在[GitHub Issues](https://github.com/kirklin/postcss-px-conversion/issues)上报告它们。

**愉快的编码！**

## License

[MIT](./LICENSE) License &copy; 2023-PRESENT [Kirk Lin](https://github.com/kirklin)
