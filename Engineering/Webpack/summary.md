
## 导包类型
### common.js
1. 使用require()导入其他JS
2. 使用module.exports = xxxx导出本JS

### es6Module
1. 使用import xx from xx导入其他JS
2. 使用export const xx = xx  或者  export default xx  导出本JS


## 打包结果

### 同步

#### 前提
webpack默认的是用commonJS的方式，所以对于其他导包类型，都会最终变成module.exports对象上面的东西

#### common.js导入+common.js导出

```
// 入口chunk代码./src/index.js
const title = require('./title')

// 被导入的js
module.exports = 'title'
```


1. 外部套一个自执行函数
2. 定义缓存空对象
3. 定义除入口之外所有路径js及其函数（webp5），真实函数体外部套一个函数透传【module对象】和【自定义的require方法】
4. 自定义require方法：
  1. 查缓存
  2. 定义空module对象
  3. 执行path指向的函数（透传【module对象】和【自定义的require方法】）
  4. 返回module.exports

```
(() => {
  
  // 定义树对象
  var __webpack_modules__ = ({
    "./src/content.js":
      ((module) => {
        function test() {
          console.log('test')
        }
        module.exports = {
          test
        }
      }),

    "./src/title.js":
      ((module, __unused_webpack_exports, __webpack_require__) => {
        console.log('title js running----')
        const content = __webpack_require__(/*! ./content */ "./src/content.js")
        content.test()
        module.exports = 'title';
      })
  });

  // 定义缓存空对象
  var __webpack_module_cache__ = {};

  // 自定义基于commonJS的require方法
  function __webpack_require__(moduleId) {

    // 检查缓存
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }

    // 新建module对象
    var module = __webpack_module_cache__[moduleId] = {
      exports: {}
    };

    // 执行树对象的每一个path对应的函数
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

    // 返回exports的值
    return module.exports;
  }
    
  // 自执行入口js代码
  (() => {
    let title = __webpack_require__(/*! ./title */ "./src/title.js");
    let content = __webpack_require__(/*! ./content */ "./src/content.js");

    console.log('main js running----');
    console.log(title);
    content.test();
  })();

})();
```


#### common.js导入+es6Module导出

```
// 入口chunk代码./src/index.js
const title = require('./title')

// 被导入的js
export default 'title'
export const age = 'title_age'
```


（其他不变，加了r、o、d方法（自执行函数的形式））
1. 树对象：每个JS路径对应的函数被包裹了一层代码
  1. 执行r方法，使得exports对象挂上两个属性，变为[object Module]
  2. 执行d方法，把所有export（动词）的东西做成一个对象，放到exports对象上
  
  3. 执行原本的js的函数体
  
  4. （最后声明了export（动词）的东西，实际上被变量声明提升了）
    1. 因此export必须要写上变量声明，要么default关键词替代，要么直接const

```
// 打包js内的树对象的（导出js）
"./src/title.js":
((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
// 执行r方法和d方法
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  age: () => (age),
  "default": () => (__WEBPACK_DEFAULT_EXPORT__)
});

// 原本JS的函数体
console.log('title js running----')

// export东西的声明
const __WEBPACK_DEFAULT_EXPORT__ = ('title');
const age = 'title_age';

})
```


2. r方法：使得exports对象变成一个es6模块
```
// 打包js
// r方法
(() => {
__webpack_require__.r = (exports) => {
  // 检查symbol及其toStringTag方法是否存在？？
  // 相当于exports[Symbol.toStringTag] = 'Module'
  if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
  }
  // 相当于exports[__esModule] = true
  // 其实没什么用，只是表明这个exports对象是一个es6模块
  Object.defineProperty(exports, '__esModule', { value: true });
};
})();
- 一个对象设置一个key为Symbol.toStringTag，value为'Module' ，使其变为一个module
let obj = {};
Object.defineProperty(obj, Symbol.toStringTag, { value: 'Module' })
const type = Object.prototype.toString.call(obj)
console.log(type)

// 打印得到[object Module]
```

3. d、o方法：把es6的export的东西放到exports对象上
```
// 打包js
// o方法
// 看一个对象有没有一个key
(() => {
__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
})();


// d方法
(() => {
__webpack_require__.d = (exports, definition) => {
  // 遍历新加的definition对象（所有es6 export的内容）上的key
  for(var key in definition) {
    // 如果exports对象没有
    if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
      // 给exports对象加上这些key和value
      // 相当于把es6的export的东西放到exports对象上
      // 这里用了getter的方式，传入get：getter表示value：getter()，也就是用getter函数执行后的值赋给value属性
      Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
    }
  }
};

})();
```

#### es6Module导入+es6Module导出
```
// 入口chunk代码./src/index.js
import title,{age} from './title'

// 被导入的js
export default 'title'
export const age = 'title_age'
```

（与第二类差不多，入口chunk的js代码有细微变化）
1. 入口chunk的js：
  1. 把一个外部对象变为esModule的形式（好像没啥用）
  2. import的东西（module.exports）存为一个变量，拿变量的时候遵守：
    1. import使用大括号表示直接拿对应的值
    2. import没有使用大括号表示拿default的值

```
// 打包js内的入口chunk代码./src/index.js（导入js）
var __webpack_exports__ = {};
(() => {
    // 把一个外部对象变为esModule的形式
    __webpack_require__.r(__webpack_exports__);
    
    // 拿到执行完之后的module.exports
    var _title__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/title.js");
    
    // 入口chunk原本的代码
    console.log('main js running----');
    
    // 使用导入的东西
    // 如果import xx没有使用大括号，默认是去拿exports的default的值
    // 如果import xx有使用大括号解构，默认去拿exports的这个解构的key对应的值
    console.log(_title__WEBPACK_IMPORTED_MODULE_0__["default"]);
    console.log(_title__WEBPACK_IMPORTED_MODULE_0__.age);

})();
```


#### es6Module导入+common.js导出
```
// 入口chunk代码./src/index.js
import title,{age} from './title'

// 被导入的js
module.exports = {
  name: 'title_name',
  age: 'title_age',
}
```

（树对象导出js不变（因为是commonJS导出的，直接改写了exports），入口js变化了，加了n方法）
1. 入口js：拿到exports对象和default值（因为import title from './title'，这里没有加括号，相当于告诉程序我要default值）

```
(() => {
  "use strict";
  __webpack_require__.r(__webpack_exports__);

  // 直接拿到exports对象
  var _title__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/title.js");
  // 接着拿到default值
  // 先去做抹平差异化处理，要么得到exports对象的default值，要么得到exports对象（commonJS没有default值）
  var _title__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(_title__WEBPACK_IMPORTED_MODULE_0__);

  // 原本的函数体
  console.log('main js running----');

  // 取用default变量时，调用n方法返回的getter函数（实际上就是返回exports或exports['default']）
  console.log((_title__WEBPACK_IMPORTED_MODULE_0___default()));
  // 取用对象里面的变量，直接用exports对象
  console.log(_title__WEBPACK_IMPORTED_MODULE_0__.age);

})();
```

2. n方法：对【默认】的commonJS和esModule的导出做抹平差异化

```
(() => {
__webpack_require__.n = (module) => {
  
  //这里在抹平esModule和commonJS的差异
  // 前者拿取default值指的是拿export default的值，通过default挂在exports对象上面
  // 后者拿default值（其实没有default值的概念）指的是拿整个被改写的exports对象
  var getter = module && module.__esModule ?
    () => (module['default']) :
    () => (module);

  // 为什么要这样？不用d方法直接返回getter不行吗？为什么要挂一个属性到getter上面？
  // 不知道为什么要挂属性！只知道a作为属性名尽可能短！
  __webpack_require__.d(getter, { a: getter });
  return getter;
};
})();
```


### 异步


1. 异步的路径另成一个chunk（同时：重写了chunk内执行的window['xx']的push方法）
2. 交互事件发生
3. e方法：
  1. f对象的j方法（创建并保存新promise）
  2. l方法（创建script标签加载资源）
4. 执行chunk代码，找到状态机的promise数组，执行resolve函数，改变promiseAll的状态
5. 执行promiseAll的then方法（t方法），require目标路径，return导出的值
6. 下一个then函数执行，拿到目标值


- 主chunk代码 main.js

```
(() => {

  // 主树对象
  var __webpack_modules__ = ({});

  // 缓存对象
  var __webpack_module_cache__ = {};
  

  function __webpack_require__(moduleId) {

    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }

    var module = __webpack_module_cache__[moduleId] = {
      exports: {}
    };
  
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
  
    return module.exports;
  }
  
  // 主树对象（副本）
  __webpack_require__.m = __webpack_modules__;
  

  /* （一）e方法 */
  (() => {
    __webpack_require__.f = {};

    __webpack_require__.e = (chunkId) => {
      return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
        __webpack_require__.f[key](chunkId, promises);
        return promises;
      }, []));
    };
  })();

  /* （二）f对象的j方法 + （四）给额外的chunk自定义一个方法 */
  (() => {

    // 定义状态机
    // undefined = chunk not loaded, 
    // null = chunk preloaded/prefetched
    // [resolve, reject, Promise] = chunk loading, 
    // 0 = chunk loaded
    var installedChunks = {
      "main": 0
    };
    
    // f对象的j方法
    __webpack_require__.f.j = (chunkId, promises) => {
      // 创建一个当前变量
      var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
      if(installedChunkData !== 0) {
  
        // 如果状态机里面没有这个状态
        if(installedChunkData) {
          promises.push(installedChunkData[2]);
        } else {
          if(true) {
            // 新建promise，保存到状态机
            var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
            promises.push(installedChunkData[2] = promise);
  
            // 构造一个url
            var url = __webpack_require__.p + __webpack_require__.u(chunkId);

            // 错误处理
            var error = new Error();
            var loadingEnded = (event) => {
              if(__webpack_require__.o(installedChunks, chunkId)) {
                installedChunkData = installedChunks[chunkId];
                if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
                if(installedChunkData) {
                  var errorType = event && (event.type === 'load' ? 'missing' : event.type);
                  var realSrc = event && event.target && event.target.src;
                  error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
                  error.name = 'ChunkLoadError';
                  error.type = errorType;
                  error.request = realSrc;
                  installedChunkData[1](error);
                }
              }
            };

            // 去加载资源
            __webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
          }
        }
      }
    };
    
    // 自定义一个函数，保存在window对象，加载完script之后，可以执行这个函数
    var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
      var [chunkIds, moreModules, runtime] = data;

      // 合并这个额外的chunk到原本的主树对象
      var moduleId, chunkId, i = 0;
      if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
        for(moduleId in moreModules) {
          if(__webpack_require__.o(moreModules, moduleId)) {
            __webpack_require__.m[moduleId] = moreModules[moduleId];
          }
        }
        if(runtime) var result = runtime(__webpack_require__);
      }
      if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);

      // 执行resolve()函数，接连改变状态
      for(;i < chunkIds.length; i++) {
        chunkId = chunkIds[i];
        if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
          installedChunks[chunkId][0]();
        }
        installedChunks[chunkId] = 0;
      }
    }
    
    // 保存自定义函数到window对象
    var chunkLoadingGlobal = self["webpackChunkzyl"] = self["webpackChunkzyl"] || [];
    chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
    chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
  })();

  /* （三）加载script标签，拿到chunk资源 */
  (() => {
    var inProgress = {};
    var dataWebpackPrefix = "zyl:";

    __webpack_require__.l = (url, done, key, chunkId) => {
      if(inProgress[url]) { inProgress[url].push(done); return; }
      var script, needAttach;

     // 看html中是不是已经有同样url的script，这样就不用再创建一个了
      if(key !== undefined) {
        var scripts = document.getElementsByTagName("script");
        for(var i = 0; i < scripts.length; i++) {
          var s = scripts[i];
          if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
        }
      }
     // 创建一个新的script标签
      if(!script) {
        needAttach = true;
        script = document.createElement('script');
    
        script.charset = 'utf-8';
        script.timeout = 120;
        if (__webpack_require__.nc) {
          script.setAttribute("nonce", __webpack_require__.nc);
        }
        script.setAttribute("data-webpack", dataWebpackPrefix + key);
    
        script.src = url;
      }

     // 后续成功加载或失败的函数处理
      inProgress[url] = [done];
     
     // 失败把原来保存的东西都删掉，防止内存泄漏
      var onScriptComplete = (prev, event) => {
        script.onerror = script.onload = null;
        clearTimeout(timeout);
        var doneFns = inProgress[url];
        delete inProgress[url];
        script.parentNode && script.parentNode.removeChild(script);
        doneFns && doneFns.forEach((fn) => (fn(event)));
        if(prev) return prev(event);
      }
      var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
      script.onerror = onScriptComplete.bind(null, script.onerror);
      script.onload = onScriptComplete.bind(null, script.onload);

     // script标签挂上去
      needAttach && document.head.appendChild(script);
    };
  })();

  /* （五）t方法 */
  (() => {
    var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
    var leafPrototypes;

    // mode & 1: value is a module id, require it（八进制转换成二进制表示就是0001）
    // mode & 2: merge all properties of value into the ns
    // mode & 4: return value when already ns object
    // mode & 16: return value when it's Promise-like
    // mode & 8|1: behave like require

    __webpack_require__.t = function(value, mode) {
      // 大多数情况都要执行__webpack_require__(path)，得到exports对象的值
      if(mode & 1) value = this(value);

      // 其他8、4、16的情况，（已经是es6Module或一个Promise对象）直接返回本身
      if(mode & 8) return value;
      if(typeof value === 'object' && value) {
        if((mode & 4) && value.__esModule) return value;
        if((mode & 16) && typeof value.then === 'function') return value;
      }

      // 如果是module.exports = xxx的情况，改成es6Module的情况
      var ns = Object.create(null);
      __webpack_require__.r(ns);
      var def = {};
      leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
      
      // 2的情况：把value的所有属性合并到def上，后面def摘合并到ns上，返回ns
      for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
        Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
      }

      // 设置默认属性为chunk的【所有】导出值
      def['default'] = () => (value);

      // 把def挂到ns上，强制变为es6Module
      __webpack_require__.d(ns, def);

      // then回调函数的返回值可以resolve本then的Promise，然后传递给下一个then
      return ns;
    };
  })();
  

  /* d方法：挂载其他对象的属性到目标对象上面 */
  (() => {
    __webpack_require__.d = (exports, definition) => {
      for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
          Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
      }
    };
  })();
  

  /* 定义一下全局this */
  (() => {
    __webpack_require__.g = (function() {
      if (typeof globalThis === 'object') return globalThis;
      try {
        return this || new Function('return this')();
      } catch (e) {
        if (typeof window === 'object') return window;
      }
    })();
  })();

  /* o方法：检查对象有没有xx属性 */
  (() => {
    __webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
  })();
  

  /* r方法：挂es6Module属性 */
  (() => {
    __webpack_require__.r = (exports) => {
      if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
      }
      Object.defineProperty(exports, '__esModule', { value: true });
    };
  })();
  

  /* 为异步的JSchunk提取域名 */
  (() => {
    var scriptUrl;
    if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
    var document = __webpack_require__.g.document;
    if (!scriptUrl && document) {
      if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
        scriptUrl = document.currentScript.src;
      if (!scriptUrl) {
        var scripts = document.getElementsByTagName("script");
        if(scripts.length) {
          var i = scripts.length - 1;
          while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
        }
      }
    }

    if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
    scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
    __webpack_require__.p = scriptUrl;
  })();
  

  /* 构造chunk文件名和扩展名 */
  (() => {
    __webpack_require__.u = (chunkId) => {
      return "" + chunkId + ".js";
    };
  })();

  

  /* 入口chunk的函数 */
  console.log('index js running')
  const btn = document.getElementById('btn');
  btn.addEventListener('click', () => {
    // 执行e方法，第一个then执行t方法，然后才是第二个then
    __webpack_require__.e("src_test_title_js").then(__webpack_require__.t.bind(__webpack_require__, "./src/test/title.js", 23)).then(result => {
      console.log(result);
    })
  })
})();
```


- 异步加载的额外的chunk代码 title.js

```
(self["webpackChunkzyl"] = self["webpackChunkzyl"] || []).push([
  ["src_test_title_js"],
  {
  "./src/test/title.js":
    ((module) => {
      console.log('title js running----')
      module.exports = 'title';
    })
  }
]);
```







## 编译流程

1. 初始化：从配置文件和shell语句读取、合并参数，得到最终参数，并初始化compiler对象
2. 插件： 加载所有配置的插件（订阅所有插件！）
3. 模块：开始构造抽象语法树（module树）：
  1. 拿【入口】路径
  2. 读取文件内容
  3. 使用对应的loader转化内容
  4. 构造module对象（保存到modules）
  5. 找内容中的require或import，递归
  （拿路径读内容——转化内容——构造module对象——找require或import递归）
  
4. 代码块：构造每个入口对应的代码信息
  1. 组装同一个name的module成为一个chunk，构造chunks
  2. 遍历chunks构造assets：类似主树对象，key为每个path，值为每个chunk的代码字符串
  3. 插件：执行插件的回调函数（发布所有插件！），改变assets
  
5. 文件：遍历assets输出文件


- 编译主代码

```
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
```


- 插件代码

```
class InfoPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('InfoPlugin', (assets) => {
      assets['info.json'] = `{ id: "webpack" }`;
    });
  }
}

module.exports = InfoPlugin;
```



- 配置文件（webpack.config.js）

```
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
```


