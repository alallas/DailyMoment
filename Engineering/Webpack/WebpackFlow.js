// ! 编译流程主代码

const fs = require('fs');
const path = require('path');
// const { SyncHook } = require('tapable');

// 插件的调用机制——>发布订阅模式
class SyncHook {
  constructor() {
    this.taps = []
  }
  tap(name, callback) {
    this.taps.push(callback)
  }
  call(...args) {
    this.taps.forEach(tap => tap(...args))
  }
}

// 主编译函数
class Compiler {
  constructor(config) {
    this.config = config;
    this.hooks = {
      emit: new SyncHook(),
    }
  }
  run() {

    let entries = []; // 放所有入口路径（注意：仅路径），一个入口对应一个代码块即chunk
    let modules = []; // 放所有模块，一个require或import对应一个模块即module
    let chunks = []; // 放所有代码块，一个代码块包含所有模块

    let assets = {}; // key是文件名，值是文件内容，有点像主树对象
    let files = []; // 元素都是文件名，files = Object.keys(assets)

    // 入口文件开始，拿路径读内容
    // 在config里面拿到路径path（存到entries）
    // 读取文件内容
    const entryPath = path.join(this.config.context, this.config.entry);
    entries.push({
      name: 'main',
      entry: entryPath,
    });
    const entryContent = fs.readFileSync(entryPath, 'utf8');

    // 利用对应Loader转换内容
    const entrySource = babelLoader(entryContent);

    // 构造模块对象（保存到modules）
    const entryModule = {
      name: 'main', // name表示这个模块归属于哪个入口chunk
      id: entryPath,
      source: entrySource,
    };
    modules.push(entryModule);


    // 找到entryContent里面的require或import
    // 递归地编译所有模块（拿路径-读内容-loader转换内容-构造模块对象）
    // 最终通过每个module对象编译成抽象语法树
    const cssPath = path.join(this.config.context, './src/index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const cssSource = cssLoader(cssContent);
    const cssModule = {
      name: 'main',
      id: cssPath,
      source: cssSource,
    };
    modules.push(cssModule);


    // 组装含多个module的chunk
    let chunk = {
      id: 'main',
      module: [entryModule, cssModule],
    };
    chunks.push(chunk);

    // 构造assets，类似主树对象，key为每个path，值为每个chunk的代码字符串
    // 原本的代码外部包裹一个函数，提供__webpack_require__的方法
    for (let chunk of chunks) {
      // 入口main的函数体则不是这样
      assets[chunk.id + '.js'] = `
        ((module, __unused_webpack_exports, __webpack_require__) => {
          console.log('title js running----')
          __webpack_require__("./src/content.js")
          module.exports = 'title';
        })
      `
    }
    // 执行插件的回调函数，透传assets，改变输出文件的内容
    this.hooks.emit.call(assets)

    // 根据assets把每个chunk的文件内容写入文件系统
    files = Object.keys(assets);
    for (let file in assets) {
      let filePath = path.join(this.config.output.path, file);
      fs.writeFileSync(filePath, assets[file]);
    }
  }
}


// loder是一个函数，入参是【新语法】的代码，返回值是【通用旧语法】的代码
function babelLoader(source) {
  return `
    let sum = function (a, b) { return a + b }
    require('./index.css')
  `
}
function cssLoader(source) {
  return `
    let style = document.createElement('style');
    style.innerHTML = body { margin: 0; };
    document.head.appendChild(style);
  `
}



// 1. 初始化：
// 从配置文件和shell语句读取、合并参数，得到最终参数，并初始化compiler对象
let config = require('./webpack.config.js');
let compiler = new Compiler(config);

// 2. 加载所有配置的插件（订阅所有插件！）
for (let plugin of config.plugins) {
  plugin.apply(compiler);
}

// 3. 执行对象的run方法开始编译
compiler.run();



// ! 插件代码
class InfoPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('InfoPlugin', (assets) => {
      assets['info.json'] = `{ id: "webpack" }`;
    });
  }
}
module.exports = InfoPlugin;
