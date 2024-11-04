//npm i webpack webpack-cli html-webpack-plugin -D

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const babelLoader = path.join(__dirname, 'loaders/babel-loader.js');
const webpack = require('webpack');
const FileManagerPlugin = require('filemanager-webpack-plugin');


module.exports = {
  // 预设置
  mode: 'production', // 开发模式
  devtool: 'source-map', // 不生成source-map

  // 入口
  context: process.cwd(), // node的一个方法，表示当前所在的文件夹
  entry: './src/index.js', // 最前面的.相当于context

  // 每个入口表示一个代码块（chunk）
  // 等价于下面，属性名表示代码块（chunk）的名字
  // entry: {
  //   main: './src/index.js'
  // },

  // map-multipal application page  多页面应用
  // entry: {
  //   main: './src/index.js',
  //   login: './src/login.js'
  // },


  // 出口
  output: {
    // path只能是绝对路径
    path: path.resolve(__dirname, 'dist'), // 打包后的文件在哪个目录下
    filename: '[name].js', // 打包后的文件名(一个变量，是入口的对象的属性名key)
  },

  // 这个相当于指定【去哪里找loader】，先去node_modules，找不到再去loaders
  // resolveLoader: {
  //   modules: ['node_modules', path.join(__dirname, 'loaders')]
  // },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            // loader: 'babel-loader', // 相对路径默认去node——modules里面找
            loader: babelLoader, // 绝对路径
            options: {
            }
          }
        ]
      },
      // source-map-loader的作用是，为【被引入的文件】生成一个sourceMap文件使得他可以被解析成源码的样子
      {
        test: /\.js$/,
        use: [
          {
            loader: 'source-map-loader',
          }
        ],
        // 设置loader的优先级，不管写的顺序，只要enforce写了pre，就先执行这个loader
        enforce: 'pre',
      }
    ]
  },


  // 插件
  plugins: [

    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html', // 生成的html的名字，路径和出口的path一样
    }),

    // 如果是多页面应用，也要生成两个html，分别来装下两个入口js
    // 这时要加上chunk属性表明整个html对应的是哪一个入口的chunk
    // new HtmlWebpackPlugin({
    //   template: './src/index.html',
    //   filename: 'index.html', // 生成的html的名字，路径和出口的path一样
    //   chunks: ['main'] // 需要装的对应入口js的key（包名即chunk名）
    // }),
    // new HtmlWebpackPlugin({
    //   template: './src/index.html',
    //   filename: 'login.html',
    //   chunks: ['login']
    // })




        // 关闭devtool的source-map，用插件的目的是更加精细地控制source-map
    // 相当于我给bundle.js做一个【指令】指向他的sourceMap位置，在测试环境调试的时候，启动两个服务器，就可以找到对应的sourceMap文件
    // new webpack.SourceMapDevToolPlugin({
    //   append: '//# sourceMappingURL=http://127.0.0.1:8081/[url]',
    //   filename: '[file].map'
    // }),

    
    // 开发环境中需要借助sourceMap调试：
    // sourceMap文件放到自己的服务器上面的，先额外拷贝一份出来，再删掉dist文件夹里面的文件
    // 剩下的文件打包，然后才发布测试或生产
    // new FileManagerPlugin({
    //   onEnd: {
    //     copy: [
    //       {
    //         source: './dist/**/*.map',
    //         destination: 'D:/aa_qianduan/webpack_learn_test/sourceMap'
    //       }
    //     ],
    //     delete: ['./dist/**/*.map'],
    //     archive: [
    //       {
    //         source: './dist',
    //         destination: './archives/project.zip'
    //       }
    //     ]
    //   }
    // })


  ]
}