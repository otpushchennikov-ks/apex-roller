const {
  override,
  addBabelPlugin,
  addBabelPreset,
  addLessLoader,
  fixBabelImports,
} = require('customize-cra');

module.exports = override(
  addBabelPlugin('@emotion/babel-plugin'),
  addBabelPreset('@emotion/babel-preset-css-prop'),
  addBabelPreset(['@babel/preset-react', {
    runtime: 'automatic',
    importSource: '@emotion/react',
  }]),
  // https://ant.design/docs/react/customize-theme#Ant-Design-Less-variables
  fixBabelImports('antd', {
    libraryDirectory: 'es',
    style: true,
  }),
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
      modifyVars: {
        '@text-color': 'rgba(0, 0, 0, 1)',
        '@text-color-secondary': 'rgba(0, 0, 0, 0.65)',
        '@border-radius-base': '4px',
      },
    },
  }),
);
