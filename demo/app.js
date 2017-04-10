const htmlStandards = require('reshape-standard')
const cssStandards = require('spike-css-standards')
const jsStandards = require('babel-preset-env')
const dynamicImport = require('babel-plugin-syntax-dynamic-import')
const pageId = require('spike-page-id')

module.exports = {
  devtool: 'source-map',
  matchers: {
    html: '*(**/)*.sgr',
    css: '*(**/)*.sss'
  },
  ignore: ['**/layout.sgr', '**/_*', '**/.*', 'readme.md', 'yarn.lock'],
  reshape: htmlStandards({
    locals: (ctx) => { return { pageId: pageId(ctx), foo: 'bar' } }
  }),
  postcss: cssStandards(),
  babel: { presets: [[jsStandards, { modules: false }]], plugins: [dynamicImport] }
}
