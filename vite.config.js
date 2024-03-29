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
        zanzo: resolve(__dirname, 'zanzo/index.html'),
        'zanzo-blur': resolve(__dirname, 'zanzo-blur/index.html'),
        'zanzo-blur-step': resolve(__dirname, 'zanzo-blur-step/index.html'),
        'p-1': resolve(__dirname, 'p-1/index.html'),
        'p-2': resolve(__dirname, 'p-2/index.html'),
        'p-3': resolve(__dirname, 'p-3/index.html'),
        'p-4': resolve(__dirname, 'p-4/index.html'),
        'p-5': resolve(__dirname, 'p-5/index.html'),
        'p-6': resolve(__dirname, 'p-6/index.html'),
        'p-7': resolve(__dirname, 'p-7/index.html'),
        'p-8': resolve(__dirname, 'p-8/index.html'),
      },
    },
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
      },
    },
  },
  server: {
    host: true,
  },
}
