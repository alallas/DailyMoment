// npm i babel-loader @babel/preset-env @babel/core -D

let babel = require('@babel/core')

function normal(source) {
  let options = {
    presets: ['@babel/preset-env'], // 配置预设，是一个插件包
    sourceMap: true, // 生成sourcemap文件,调试的时候看到的是es6的源代码，不是转换之后的

    // module对应文件的名字（调试时：各个module的名字）
    filename: this.resourcePath.split('/').pop()
  }

  // code转化后的es5代码，map新的source-map文件，ast抽象语法树
  // 如果babel生成了ast，webpack直接用它的
  let { code, map, ast } = babel.transform(source, options)

  // callback是webpack内置的方法
  // loader执行的时候，this指向loaderContext对象，上面有一个callback方法
  return this.callback(null, code, map, ast);
}
module.exports = normal