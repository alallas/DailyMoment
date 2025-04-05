const path = require('path')

// 下面这个模块是用于将两个webpack配置合并的！
const merge = require('webpack-merge')
const base = require('./webpack.base')


module.exports = merge.merge(base, {
  output: {
    // path.resolve是当前根目录下的一个文件夹
    path: path.resolve('public2'),
    filename:'client.js',
  },
  entry: './src/client/index.js',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
            }
          },
        ]
      },
    ]
  }
})


