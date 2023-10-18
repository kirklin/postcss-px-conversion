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
