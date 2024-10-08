## webpack原理

https://blog.ag-grid.com/webpack-tutorial-understanding-how-it-works/
https://github.com/jerryOnlyZRJ/webpack-tools/blob/master/docs/webpack-principle.md
https://blog.lyearn.com/how-webpack-works-236f8cc43ae7

- 目的
两个目的，别无其他
1. 压缩：合并各个文件为一个文件
2. 翻译：把新语法翻译成通用语法，每个浏览器可以使用
（压翻！！！）


- 简单的主流程
1. 找到入口文件，entry对象
2. 遍历入口文件所有依赖的模块，开始把多个文件合并为一个文件
  1. 遇到ts，用ts的loader翻译
  2. 遇到新语法（箭头函数等），用beble的loader翻译
  3. 遇到css，用css的loader加上插件翻译
  4. 遇到图片，用图片压缩的loader转译
  5. .....其他loader，或者插件（module或者plugin对象）
3. 生成一个整合的文件放到output对象指定的位置


- 更完整的主流程
1. 在entry对象找到入口文件，resolver（路径解析机器——扫描机）把相对路径变为绝对路径
2. Module factory（模块工厂——仓库）创建一个对象，包含属性：文件类型、大小、绝对路径、分配的 ID 等
3. transpilers（翻译机器（我猜就是loader）——翻译工人）将代码转换为浏览器可读的格式（？？？？）
4. parser（解析器（把码变成抽象语法树）——绘图工人）查找 'require' 或 'import' 语句，并使用依赖项信息更新对象，比如：
```
// example module object
{
  id: 0,
  absolutePath: '/path',
  fileType: '.jsx',
  dependency: [{ id1, relativePath }, { id2, relativePath }]
  // some more information
}
```
5. 重复上述1-4步，递归遍历入口文件，得到完整的抽象语法树
6. 对上一步生成的抽象语法树拓扑排序（树变为线性表），相当于多文件合并为一个线性文件（bundle file）
7. 在这个文件上进行缩小或摇树

- 总结：
resolver路径解析 --> loader翻译 --> parser解析码为树（递归） --> 树变为线性表（bundle file） --> tree shaking（删除没有被导入的）

- 举例子
1. 源代码
```
// cat.js ES Module
export default "cat";

// bar.js CommonJS
const cat = require("./cat");
const bar = "bar" + cat;
module.exports = bar;

// foo.js ES Module
import catString from './cat';
const fooString = catString + "foo";
export default fooString;

// index.js - entry point
import fooString from './foo';
import barString from './bar';
import './tree.jpeg';
console.log(fooString, barString);
```

2. 解析入口也就是index.js
3. 翻译loader（不需要，因为是原生js）
4. parser解析，码变为树，同时存入仓库
```
// example module object for index.js
{
  "id":0,
  "absolutePath":"$home/index.js",
  "bundledFile": "bundledFile0.js",
  "fileType":".js",
  "dependency":[
    { "id": 1, "path": "./foo" },
    { "id": 2, "path": "./bar" },
    { "id": 3, "path": "./tree.jpeg"}
  ]
}
```

5. 树变为线性表（bundle file）

6. 树摇

配置文件
```
// webpack config 
const path = require("path");
const ExamplePlugin = require("./ExamplePlugin.js");
module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "build"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader"
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ]
      },
    ]
  },
  plugins: [
    new ExamplePlugin(),
  ]
}

// Example of a loader: DoTranspile.js
// You will see a majority of loaders being transpilers.

const doTranspile = require('do-transpile');
module.exports = function(devlopmentSourceCode) {
    const browserCode = doTranspile(devlopmentSourceCode);
    return browserCode;
}

// Example of a plugin.
// ExamplePlugin.js

class ExamplePlugin {
  apply(compiler) {
    compiler.plugin("afterCompile", (compiler, callback) => {
      console.log("Webpack is Running!!");
      callback();
    })
  }
}

module.exports = ExamplePlugin;
```

## 热更新原理（webpack）
注意:只用于开发

https://rajaraodv.medium.com/webpack-hot-module-replacement-hmr-e756a726a07#.j6haj149i



## Tree shaking 原理

https://segmentfault.com/a/1190000040814997/en

配置文件
```
// webpack.config.jsmodule.exports = {
  entry: "./src/index",
  mode: "production",
  devtool: false,
  optimization: {
    usedExports: true,
  },
};
```



