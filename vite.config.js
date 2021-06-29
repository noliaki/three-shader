const { resolve } = require('path')

module.exports = {
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        melt: resolve(__dirname, 'melt/index.html'),
        triangle: resolve(__dirname, 'triangle/index.html'),
      },
    },
  },
}
