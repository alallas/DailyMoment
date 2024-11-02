//npm i webpack webpack-cli html-webpack-plugin -D

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DonePlugin = require('./plugins/DonePlugin.js');
const InfoPlugin = require('./plugins/InfoPlugin.js');

module.exports = {
  // 预设置
  mode: 'development', // 打包模式
  devtool: false, // 不生成source-map

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

    new DonePlugin(),
    new InfoPlugin(),

  ]
}