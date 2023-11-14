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

This is a PostCSS plugin that converts pixel units to viewport units (vw, vh, vmin, vmax). The code has been migrated from the original project [evrone/postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport), as it is no longer maintained. This migrated code is compatible with the latest version of PostCSS.

## Installation

To use this plugin, you'll need to have PostCSS set up in your project. If you haven't already, you can install PostCSS by running:

```bash
npm install postcss --save
```

Next, install the `postcss-px-conversion` plugin:

```bash
npm install postcss-px-conversion --save
```

## Usage

To use this plugin in your PostCSS configuration, add it to your PostCSS plugins list, along with the desired configuration options.

Here's an example configuration in your `postcss.config.js`:

```javascript
// postcss.config.js

module.exports = {
  plugins: {
    "postcss-px-conversion": {
      unitType: "px", // The unit to convert from (default is 'px')
      viewportWidth: 375,
      // Other configuration options...
    },
  },
};
```

## Configuration Options

You can configure this plugin using various options:

- `unitType`: The unit to convert from (default is 'px').
- `viewportWidth`: The width of the viewport.
- `unitPrecision`: The number of decimal places for vw units.
- `allowedProperties`: List of CSS properties to convert to vw.
- `excludedProperties`: List of CSS properties to exclude from conversion.
- `viewportUnit`: The expected viewport unit (vw, vh, vmin, vmax).
- `fontViewportUnit`: The expected font viewport unit.
- `selectorBlacklist`: Selectors to ignore (strings or regular expressions).
- `minPixelValue`: Minimum pixel value to replace.
- `allowMediaQuery`: Allow px to vw conversion in media queries.
- `replaceRules`: Replace rules containing vw instead of adding fallbacks.
- `excludeFiles`: Files to ignore (as an array of regular expressions).
- `includeFiles`: Only convert matching files (as an array of regular expressions).
- `enableLandscape`: Add @media (orientation: landscape) for landscape mode.
- `landscapeUnit`: The expected unit for landscape mode.
- `landscapeViewportWidth`: Viewport width for landscape orientation.

Please adjust these options according to your project's requirements.

## Example

Here's an example configuration that converts pixel values to vw units for a viewport width of 750 pixels:

```javascript
// postcss.config.js

module.exports = {
  plugins: {
    "postcss-px-conversion": {
  		unitType: "px",
  		viewportWidth: 375,
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

With this configuration, any pixel values in your CSS will be automatically converted to viewport units during PostCSS processing.

## Credits

Original code migrated from [evrone/postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport).

If you have any questions or issues, please report them on [GitHub Issues](https://github.com/kirklin/postcss-px-conversion/issues).

**Happy coding!**


## License

[MIT](./LICENSE) License &copy; 2023-PRESENT [Kirk Lin](https://github.com/kirklin)
