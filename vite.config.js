const { resolve } = require('path')

module.exports = {
  build: {
    rollupOptions: {
      input: {
        melt: resolve(__dirname, 'melt/index.html'),
        triangle: resolve(__dirname, 'triangle/index.html'),
      },
    },
  },
}
