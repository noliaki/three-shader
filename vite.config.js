const { resolve } = require('path')

module.exports = {
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        melt: resolve(__dirname, 'melt/index.html'),
        triangle: resolve(__dirname, 'triangle/index.html'),
        crystal: resolve(__dirname, 'crystal/index.html'),
        'tokyo-2020': resolve(__dirname, 'tokyo-2020/index.html'),
        effect: resolve(__dirname, 'effect/index.html'),
      },
    },
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
      },
    },
  },
}
