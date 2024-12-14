//npm i webpack webpack-cli html-webpack-plugin -D

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const babelLoader = path.join(__dirname, 'loaders/babel-loader.js');
const webpack = require('webpack');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const DonePlugin = require('./plugins/DonePlugin.js')
const AssetsPlugin = require('./plugins/AssetsPlugin.js')
const ZipPlugin = require('./plugins/ZipPlugin.js')
const AutoExternalPlugin = require('./plugins/AutoExternalPlugin_CDN.js')
const HashPlugin = require('./plugins/HashPlugin.js')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')


module.exports = {
  // 预设置
  mode: 'development', // 开发模式development，生产模式production（生成的文件会压缩，变量全部变为一个字母）
  devtool: false, // 不生成source-map
  // devtool: 'source-map', // 生成source-map


  // 根目录
  // node的一个方法，表示当前所在的文件夹,也就是根目录！！cwd指current working directory,  D:/aa_qianduan/webpack_learn_test
  context: process.cwd(),


  // 入口
  // 1. 最前面的.相当于context,这里要写相对于根目录的的路径！！
  // 每个入口表示一个代码块（chunk）
  entry: './src/index.js',

  // 2. 等价于下面，属性名表示代码块（chunk）的名字
  // entry: {
  //   main: './src/index.js'
  // },

  // 3. multipal application page  MAP多页面应用
  // entry: {
  //   main: './src/index.js',
  //   content: './src/content.js'
  // },

  // 4. hash演示
  // entry: {
  //   main: './src/index.js',
  //   vendor: ['lodash'], // 可以把第三方库写到数组里面，表示一个chunk
  // },


  // 出口
  output: {
    // path只能是绝对路径
    path: path.resolve(__dirname, 'dist'), // 打包后的文件在哪个目录下
    filename: '[name].[chunkhash].js', // 打包后的文件名(一个变量，是入口的对象的属性名key)
    publicPath: 'http://img.zyl.com' // 把上面的filename和这个path组合起来，作为html里面的script的src的绝对路径
  },


  // loader查找文件夹设定
  // 这个相当于指定【去哪里找loader】，先去node_modules，找不到再去loaders
  resolveLoader: {
    modules: ['node_modules', path.join(__dirname, 'loaders')]
  },


  // 外链设置（不用cdn外链插件的时候要写这个，同时在html里面用script引入外链的url）
  // 把cdn的库变成window的内置对象
  externals: {
    // key是模块的名称，值是window上面的全局变量
    'jquery': 'jQuery',
    'lodash': '_',
  },


  // loader设置
  module: {
    rules: [
      // 图片使用file也就是生成一个额外的文件到dist
      {
        test: /\.(jpg|png|gif|bmp)$/,
        use: [
          {
            loader: 'file-loader2',
            options: {
              filename: '[hash].[ext]'
            }
          }
        ]
      },
      // 使用url和file结合的loader，小于limit可以直接内置到文件中，不用额外输出一个文件到dist
      {
        test: /\.(jpg|png|gif|bmp)$/,
        use: [
          {
            loader: 'url-loader2',
            options: {
              limit: 8 * 1024
            }
          }
        ]
      },

      {
        test: /\.less$/,
        // use: ['style-loader, less-loader']
        use: [
          {
            loader: 'style-loader2', // 把css文本变成style标签，插入到页面中
          },
          {
            loader: 'css-loader2', // 处理css的@import和url()
          },
          {
            loader: 'less-loader2', // 把less编译成css
          }
        ]
      },

      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader2', // 把css文本变成style标签，插入到页面中
          },
          {
            loader: 'css-loader2', // 处理css的@import和url()
          },
        ]
      },
      // css的mini提取演示
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },

      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader', // 相对路径默认去node_modules里面找
            // loader: babelLoader, // 绝对路径
            options: {
              // plugins: [['import', { library: 'lodash' }]]
              // plugins: [
              //   [path.resolve(__dirname, 'plugins/babel-plugin-import.js'), { libraries: ['lodash'] }]
              // ]
              presets: [
                // modules.false告诉babel不要转换模块代码，不能转化为commonJS
                ['@babel/preset-env', { modules: false }]
              ],
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


  // 插件设置
  plugins: [

    // 如果是多页面应用，也要生成两个html，分别来装下两个入口js
    // 这时要加上chunk属性表明整个html对应的是哪一个入口的chunk

    // 如果是splitChunk的话，不用自己手动往html里面加很多个script，使用插件来插入
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html', // 生成的html的名字，路径和出口的path一样
      chunks: ['main'] // 需要装的对应入口js的key（包名即chunk名）【注意这是chunk名字，不是原始的原js文件的名字】
    }),
    // new HtmlWebpackPlugin({
    //   template: './src/index.html',
    //   filename: 'login.html',
    //   chunks: ['login']
    // })


    // 关闭devtool的source-map，用插件的目的是更加精细地控制source-map
    // 相当于我给bundle.js做一个【指令】指向他的sourceMap位置，在测试环境调试的时候，启动两个服务器，就可以找到对应的sourceMap文件
    new webpack.SourceMapDevToolPlugin({
      append: '//# sourceMappingURL=http://127.0.0.1:8081/[url]',
      filename: '[file].map'
    }),

    
    // 开发环境中需要借助sourceMap调试：
    // sourceMap文件放到自己的服务器上面的，先额外拷贝一份出来，再删掉dist文件夹里面的文件
    // 剩下的文件打包，然后才发布测试或生产
    new FileManagerPlugin({
      onEnd: {
        copy: [
          {
            source: './dist/**/*.map',
            destination: 'D:/aa_qianduan/webpack_learn_test/sourceMap'
          }
        ],
        delete: ['./dist/**/*.map'],
        archive: [
          {
            source: './dist',
            destination: './archives/project.zip'
          }
        ]
      }
    }),


    // 这里如果又有同步钩子，又有异步钩子，那先走谁？
    // 谁写在前面先走谁？
    new DonePlugin(),
    new AssetsPlugin(),
    new ZipPlugin(),
    new HashPlugin(),


    // CDN自动外链设置
    new AutoExternalPlugin({
      // key是模块的名字，expose是window上的名字
      jquery: {
        variable: "$",
        url: 'https://cdn.bootcss.com/jquery/3.1.0/jquery.js',
      },
      lodash: {
        variable: "_",
        url: 'https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.js',
      }
    }),


    // css的mini提取演示
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
  ],


  // 代码分割设置
  optimization: {
    // 代码分割的配置
    // 好处：强缓存，cdn，懒加载
    splitChunks: {
      chunks: 'all', // 默认作用于异步chunk，值是all或者initial或者async，（initial和all一样, initial表示同步，async表示异步）
      minSize: 0, // 默认值是30kb，大于这个数字就要分割，表示chunk的最小尺寸
      minChunks: 1,  // 被多少模块引用了，达到这个次数就需要进行分割
      maxAsyncRequests: 5, // 限制异步模块的拆分模块的最多数量。默认值是5
      maxInitialRequests: 3, // 限制入口的拆分模块的最多数量.默认值是3
      // name: true, // 打包后的名称，默认是chunk的名字通过分割符号分隔开，如vendor~page1~page2
      automaticNameDelimiter: '~', // 默认使用入口名和代码块的名生成命名，比如：vendor~main.js

      // 上面是公共配置，如果下面的对象有一些一样的配置，可以拉到最上面

      cacheGroups: {
        // 设置缓存组用于抽取满足不同规则的chunk

        // 如果走的是vendor的话，不管被多少模块引入，就算只有一个模块引入，都需要分割

        // 假如有一个第三方模块和一个公共模块都被所有模块所引用，受到maxInitialRequests的限制，要去一个留一个，这个时候就看 优先级谁高了

        vendors: {
          chunks: 'all',
          test: /node_modules/, // 第三方模块，放到vendor里面，否则放到common里面。这个表示归类于vendor的条件
          priority: -10, // 数字越大，优先级越高，尽量用负数，webpack里面还有一些别的设置的优先级是0
        },
        commons: {
          chunks: 'all',
          minSize: 0, // 大于这个数字就要分割，默认是30k
          minChunks: 2, // 被多少模块引用了，达到这个次数就需要进行分割
          priority: -20, // 优先级，有些模块所有条件都满足了，那看先优先级高
          reuseExistingChunk: true, // 如果这个chunk中引用了已经被抽取的chunk，直接引用这个被抽出来的chunk，不会重复打包
        }
      }
      // runtimeChunk: true,
      // 把各个chunk分成两个，一个是原本比如page1，另一个是runtime-page1，前者的代码量非常少，所有的导入的依赖都是以懒加载的形式，后者放着webpack的核心代码
      // 好处是runtime-page1是可以强缓存的，即使page1改变，runtime-page1也不需要改变
    }
  }
}