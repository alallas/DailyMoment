
// 下面是需要共享的打包配置
module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        // 排除 node_modules 目录（不处理第三方库代码）
        // 这是必要的，因为第三方js文件超级多，且第三方库通常已转译，避免重复处理
        exclude: /node_modules/,
        options: {
          presets: [
            // 第一个是es6转化为es5
            '@babel/preset-env',
            // 将 JSX 转换为 React.createElement() 调用
            '@babel/preset-react',
          ],
          sourceMaps: true,
          plugins: [
            '@babel/plugin-proposal-class-properties'
          ]
        }
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: 'source-map-loader',
          }
        ],
        // 设置loader的优先级，不管写的顺序，只要enforce写了pre，就先执行这个loader
        enforce: 'pre',
      },
    ]
  },
  plugins: [
    // new webpack.SourceMapDevToolPlugin({
    //   append: '//# sourceMappingURL=http://127.0.0.1:8081/[url]',
    //   filename: '[file].map'
    // }),
  ]
}


