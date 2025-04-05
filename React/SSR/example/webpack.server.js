const path = require('path')
// 下面这个包需要装一个模块：webpack-node-externals
const nodeExternal = require('webpack-node-externals')

// 下面这个模块是用于将两个webpack配置合并的！
const merge = require('webpack-merge')
const base = require('./webpack.base')


module.exports = merge.merge(base, {
  // 告诉webpack打包的目标环境，是web还是node(默认是web)
  target: 'node',
  output: {
    // path.resolve是当前根目录下的一个文件夹
    path: path.resolve('build'),
    filename:'server.js',
  },
  entry: './src/server/index.js',

  // externals的配置解释：
  // 哪些模块不需要被打包到最终的输出文件中，而是在运行时从外部环境获取
  // Node服务端打包 ——> 自动排除所有node核心模块的依赖
  // 用到CDN的浏览器端打包 ——> 手动指定某些库为外部依赖，并通过全局变量（如 window.jQuery）访问它们

  // 下面说明，nodeExternal函数执行的作用是检查代码所有引用的【核心模块】，提供一份不需要打包的列表，
  // 然后webpack读取这里面的列表，对于里面的列表的东西不要打包
  // nodeExternal()得到的是一个函数
  externals:[nodeExternal()],


  // 服务端的css的配置和客户端不一样，服务端没有：document.getElementById().style.xxx = xxx
  // 因此只能用 isomorphic-style-loader，用来准备一些写好的html代码
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'isomorphic-style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 1,
              esModule: false,
            }
          },
        ]
      },
    ]
  }

})


