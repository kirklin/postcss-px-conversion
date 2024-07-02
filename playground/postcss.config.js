// postcss.config.js

module.exports = {
  plugins: {
    "postcss-px-conversion": {
      unitType: "px", // The unit to convert from (default is 'px')
      /**
       * Enable per-file viewport width configuration.
       * 启用每个文件的视口宽度配置。
       */
      enablePerFileConfig: true,

      /**
       * The comment used to specify viewport width in a file.
       * 用于在文件中指定视口宽度的注释。
       */
      viewportWidthComment: "viewport-width",
      // Other configuration options...
    },
  },
};
