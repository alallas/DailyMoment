
## 导包类型
### common.js
- 基础使用
1. 使用require()导入其他JS
2. 使用module.exports = xxxx导出本JS


- 特点
1. 运行时加载，不真正把整个文件加载下来不知道里面是啥，无法实现静态分析
2. 导入的模块（source）不能是变量

### es6Module
- 基础使用
1. 使用import xx from xx导入其他JS
2. 使用export const xx = xx  或者  export default xx  导出本JS


- 特点
1. 可以实现静态分析，事先知道了导出的东西是什么
2. 导入的模块（source）必须是常量
3. import只能出现在顶层


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



## sourceMap

### 是什么

- 解释：源代码和转化后代码的位置映射
- 终极目的：看得到【压缩前】以及【babel转换前】的代码





### webpack的sourceMap配置
#### devtool处设置（sourceMap与bundle.js放在一起）

1. 'false'：不生成sourceMap文件

2. 'source-map'：生成一个单独的sourceMap文件，文件名字为bundle.js.map。（带module功能，啥都有）
  1. bundle.js里面的源代码处有//# sourceMappingURL=main.js.map注释
  2. 作用是在bundle.js里面设置一个指令指向source-map的地址，使得bundle.js和source-map分开可以找到他
3. 'hidden-source-map'：和source-map一样，但是不会在bundle.js后面加上述注释
  
4. 'eval'：没有单独的sourceMap文件，源代码用eval包裹（且webp5主入口代码不在树对象里，eval之后变成webp4的版本）

```
"./src/index.js": ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
  eval("\n\n__webpack_require__(/*! ./content.js */ \"./src/content.js\");\n__webpack_require__(/*! ./test/title.js */ \"./src/test/title.js\");\nvar a = 1;\nvar sum = function sum(a, b) {\n  return a + b;\n};\n\n//# sourceURL=webpack://zyl/./src/index.js?");
}),
```

5. 'eval-source-map'：没有单独的sourceMap文件，sourceMap内容放在eval里面，用base64的方式
  1. 好处：可以缓存

```
"./src/index.js": ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {
  eval("\n\n__webpack_require__(/*! ./content.js */ \"./src/content.js\");\n__webpack_require__(/*! ./test/title.js */ \"./src/test/title.js\");\nvar a = 1;\nvar sum = function sum(a, b) {\n  return a + b;\n};//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7QUFBQUEsbUJBQU8sQ0FBQyxzQ0FBYyxDQUFDO0FBQ3ZCQSxtQkFBTyxDQUFDLDRDQUFpQixDQUFDO0FBRTFCLElBQUlDLENBQUMsR0FBRyxDQUFDO0FBQ1QsSUFBSUMsR0FBRyxHQUFHLFNBQU5BLEdBQUdBLENBQUlELENBQUMsRUFBRUUsQ0FBQztFQUFBLE9BQUtGLENBQUMsR0FBR0UsQ0FBQztBQUFBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8venlsL2luZGV4LmpzPzA0OTciXSwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZSgnLi9jb250ZW50LmpzJyk7XHJcbnJlcXVpcmUoJy4vdGVzdC90aXRsZS5qcycpO1xyXG5cclxubGV0IGEgPSAxO1xyXG5sZXQgc3VtID0gKGEsIGIpID0+IGEgKyBiO1xyXG5cclxuIl0sIm5hbWVzIjpbInJlcXVpcmUiLCJhIiwic3VtIiwiYiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/index.js\n");
}),
```


6. 'inline-source-map'：没有单独的sourceMap文件，将sourceMap作为DataUrl（注释）嵌入，用base64的方式

```
(() => {
  __webpack_require__(/*! ./content.js */ "./src/content.js");
  __webpack_require__(/*! ./test/title.js */ "./src/test/title.js");
  var a = 1;
  var sum = function sum(a, b) {
    return a + b;
  };
})();

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxJQUFJQSxDQUFBLEVBQUc7RUFDZEMsT0FBTyxDQUFDQyxHQUFHLENBQUMsTUFBTSxDQUFDO0FBQ3JCO0FBQ0FDLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHO0VBQ2ZKLElBQUksRUFBSkE7QUFDRixDQUFDOzs7Ozs7Ozs7Ozs7QUNMREMsT0FBTyxDQUFDQyxHQUFHLENBQUMsc0JBQXNCLENBQUM7QUFDbkNHLG1CQUFPLENBQUMsdUNBQWUsQ0FBQztBQUN4QkYsTUFBTSxDQUFDQyxPQUFPLEdBQUcsT0FBTzs7Ozs7O1VDRnhCO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7Ozs7QUN0QkFDLG1CQUFPLENBQUMsc0NBQWMsQ0FBQztBQUN2QkEsbUJBQU8sQ0FBQyw0Q0FBaUIsQ0FBQztBQUUxQixJQUFJQyxDQUFDLEdBQUcsQ0FBQztBQUNULElBQUlDLEdBQUcsR0FBRyxTQUFOQSxHQUFHQSxDQUFJRCxDQUFDLEVBQUVFLENBQUM7RUFBQSxPQUFLRixDQUFDLEdBQUdFLENBQUM7QUFBQSxFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8venlsL2NvbnRlbnQuanMiLCJ3ZWJwYWNrOi8venlsL3RpdGxlLmpzIiwid2VicGFjazovL3p5bC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly96eWwvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gdGVzdCgpIHtcclxuICBjb25zb2xlLmxvZygndGVzdCcpXHJcbn1cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgdGVzdFxyXG59IiwiY29uc29sZS5sb2coJ3RpdGxlIGpzIHJ1bm5pbmctLS0tJylcclxucmVxdWlyZSgnLi4vY29udGVudC5qcycpXHJcbm1vZHVsZS5leHBvcnRzID0gJ3RpdGxlJzsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwicmVxdWlyZSgnLi9jb250ZW50LmpzJyk7XHJcbnJlcXVpcmUoJy4vdGVzdC90aXRsZS5qcycpO1xyXG5cclxubGV0IGEgPSAxO1xyXG5sZXQgc3VtID0gKGEsIGIpID0+IGEgKyBiO1xyXG5cclxuIl0sIm5hbWVzIjpbInRlc3QiLCJjb25zb2xlIiwibG9nIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcXVpcmUiLCJhIiwic3VtIiwiYiJdLCJzb3VyY2VSb290IjoiIn0=
```


7. 'cheap-source-map'：生成一个单独的sourceMap文件，只有行映射，没有列映射（报错的时候红线显示在一整行，而不是某个点）
  1. 且只能还原到es5的代码
8. 'cheap-module-source-map'：与上面一样，但包含loader的sourceMap，调试的时候可以还原看到es6的代码


总结：
- 关键词含义：
  - cheap：只保留行映射信息
  - module：可以保存loader那边的sourceMap，可以看到es6的代码
  - eval：可以缓存，用eval函数执行代码
  
- 推荐使用：
  - 开发环境：'eval-cheap-module-source-map'
  - 生产环境：'hidden-source-map'
    - bundle.js发布，但bundle.js.map不发布


#### 插件设置（sourceMap可以放在另外的地方，不与bundle.js放在一起）

1. 测试环境
（此时的devtool设置为false）
- 手动指定bundle.js后面指向sourceMap的地址的标识
- 手动拷贝bundle.js.map文件，对其启动一个服务器，开启对sourceMap文件的访问（测试环境的bundle.js可以访问到这个文件）


```
const webpack = require('webpack');
const FileManagerPlugin = require('filemanager-webpack-plugin');

...

  // 插件
plugins: [

    // 关闭devtool的source-map，用插件的目的是更加精细地控制source-map的存放位置
    new webpack.SourceMapDevToolPlugin({
      // 相当于我给bundle.js做一个【指令】指向他的sourceMap位置
      // 在测试/生产环境调试的时候，启动两个服务器，就可以找到对应的sourceMap文件
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
    })
```



2. 生产环境
- webpack自己会生成一份sourceMap放到本地服务器（怎么知道哪个端口呢？？？8081？？？）
- 生产环境调试，可以采用http的代理工具，拦截对bundle.js.map文件的请求（chrome每次请求都会额外再次尝试请求sourcemap），重定向到有这个文件的服务器

```
mode: 'production', // 开发模式
devtool: 'hidden-source-map', // 不生成source-map的【指向指令】
plugins: [
    // 没有SourceMapDevToolPlugin和FileManagerPlugin
]
```





### 内容解读

```
{
  "version": 3,
  "file": "main.js",

  // 位置的映射
  "mappings": ";;;;;;;;;;;;AAAA,SAASA,IAAIA,CAAA,EAAG;EACdC,OAAO,CAACC,GAAG,CAAC,MAAM,CAAC;AACrB;AACAC,MAAM,CAACC,OAAO,GAAG;EACfJ,IAAI,EAAJA;AACF,CAAC;;;;;;;;;;;;ACLDC,OAAO,CAACC,GAAG,CAAC,sBAAsB,CAAC;AACnCG,mBAAO,CAAC,uCAAe,CAAC;AACxBF,MAAM,CAACC,OAAO,GAAG,OAAO;;;;;;UCFxB;UACA;;UAEA;UACA;UACA;UACA;UACA;UACA;UACA;UACA;UACA;UACA;UACA;UACA;UACA;;UAEA;UACA;;UAEA;UACA;UACA;;;;;;;;;;ACtBAC,mBAAO,CAAC,sCAAc,CAAC;AACvBA,mBAAO,CAAC,4CAAiB,CAAC;AAE1B,IAAIC,CAAC,GAAG,CAAC;AACT,IAAIC,GAAG,GAAG,SAANA,GAAGA,CAAID,CAAC,EAAEE,CAAC;EAAA,OAAKF,CAAC,GAAGE,CAAC;AAAA,E",

  // 所有module文件
  "sources": [
    "webpack://zyl/content.js",
    "webpack://zyl/title.js",
    "webpack://zyl/webpack/bootstrap",
    "webpack://zyl/index.js"
  ],

  // 所有源代码
  "sourcesContent": [
    "function test() {\r\n  console.log('test')\r\n}\r\nmodule.exports = {\r\n  test\r\n}",
    "console.log('title js running----')\r\nrequire('../content.js')\r\nmodule.exports = 'title';",
    "// The module cache\nvar __webpack_module_cache__ = {};\n\n// The require function\nfunction __webpack_require__(moduleId) {\n\t// Check if module is in cache\n\tvar cachedModule = __webpack_module_cache__[moduleId];\n\tif (cachedModule !== undefined) {\n\t\treturn cachedModule.exports;\n\t}\n\t// Create a new module (and put it into the cache)\n\tvar module = __webpack_module_cache__[moduleId] = {\n\t\t// no module.id needed\n\t\t// no module.loaded needed\n\t\texports: {}\n\t};\n\n\t// Execute the module function\n\t__webpack_modules__[moduleId](module, module.exports, __webpack_require__);\n\n\t// Return the exports of the module\n\treturn module.exports;\n}\n\n",
    "require('./content.js');\r\nrequire('./test/title.js');\r\n\r\nlet a = 1;\r\nlet sum = (a, b) => a + b;\r\n\r\n"
  ],

  // 所有变量名字
  "names": [
    "test",
    "console",
    "log",
    "module",
    "exports",
    "require",
    "a",
    "sum",
    "b"
  ],
  "sourceRoot": ""
}
```


mappings（一个分号表示一行）
  1. 第一位：这个位置在转换后的代码的第几列
  （为什么没有转换后的代码的第几行，因为转换后的代码默认肯定只有一行，省略）
  2. 第二位：这个位置属于sources属性的那一个文件
  3. 第三位：这个位置在转换前的代码的第几行
  4. 第四位：这个位置在转换前的代码的第几列
  5. 第五位：这个位置属于names属性的哪一个变量



- 注意：只有第一个“AXJID”的位置是绝对位置，后面都是相对位置（相对于前一个位置的左或者右，前一个位置为0）
  - 目的是为了防止列的索引非常大的情况

```
let origin = 'feel the force';
let target = 'the force feel';

let mapping = {
  // 这里只是展示feel、the、force三个单词的首字母
  "mappings":[[10, "a.js", 0, 0, "feel"], [-10, "a.js", 0, 5, "the"], [4, "a.js", 0, 4, "force"], ],
  "sources": ["a.js"],
  "names": ["feel", "the", "force"],
}
```


- 如何把数字变为字母：Base64 VLQ编码
  
  - 数字变为二进制
  - 末位补上正负位标识
  
  - 五位一组分组（why？）
    - 最后要转成base64字符，这个编码方式的字符索引范围是0-63，需要六位(2^6)的二进制数才能涵盖所有十进制数的表示
    - 而最后一位要用来做符号位，第一位用来做连续位，只剩中间四位是有意义的，只能表示-15到15了
    - 目前已经补了末位啦，现在还剩5位
  - 顺序逆转，低位在前
  
  - 首位补上连续位标识（why？）
    - 目的是：如果第一位是1的话，说明后面一个字节也是当前数值的一部分
  - 转base64


```
// 任意一个数字转成一个base64格式的字符串
const base64 = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
  'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
  'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a',
  'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
  'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's',
  't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1',
  '2', '3', '4', '5', '6', '7', '8', '9', '+',
  '/'
];

function encode(num) {
  // 1. 将数字(绝对值)变为二进制的数，得到10001001
  let binary = (Math.abs(num)).toString(2);

  // 两种写法：
  // let binary = 137..toString(2)
  // let binary = (137).toString(2)

  // 2. 末位补正负位：正数补0，负数补1
  binary = num >= 0 ? binary + '0' : binary + '1';

  // 3. 五位一组做分组，不足的补0
  // 为什么要五位一组？
  // 最后要转成base64字符，这个编码方式的字符索引范围是0-63，需要六位(2^6)的二进制数才能涵盖所有十进制数的表示
  // 而最后一位要用来做符号位，第一位用来做连续位，只剩中间四位是有意义的，只能表示-15到15了
  // 已经补了末位啦，现在还剩5位

  let zero = 5 - (binary.length % 5); // 需要补多少个0
  if (zero > 0) {
    binary = binary.padStart(Math.ceil(binary.length / 5) * 5, '0');
  }
  let groups = binary.match(/\d{5}/g);

  // 4. 将数组倒序，低位在前，高位在后（原本按照源数字顺序得到的数组是：高位在前，低位在后）
  // 为什么？？
  groups.reverse()

  // 5. 首位补连续位：最后一组开头补0，其余补1
  // 目的是：如果第一位是1的话，说明后面一个字节也是当前数值的一部分
  groups = groups.map((item, index) => (index === groups.length - 1 ? '0' : '1') + item);

  // 6. 转成base64
  let chars = []
  for (let i = 0; i < groups.length; i++) {
    let base64Index = parseInt(groups[i], 2); // 把最终的二进制编码转为10进制
    chars.push(base64[base64Index])
  }

  return chars.join('')
}

let res = encode(0)
console.log(res) // 0是A
```



- 解码Base64 VLQ

```
function getValue(char) {
  let base64Index = base64.indexOf(char);
  let str = (base64Index).toString(2);
  str = str.padStart(6, '0');

  str = str.slice(1, -1);
  let sign = str.slice(-1) === '0' ? 1 : -1;
  return parseInt(str, 2) * sign;
}

function decode(values) {
  let groups = values.split(',');
  let positions = [];
  for (let i = 0; i < groups.length; i++) {
    let part = groups[i];
    let char = part.split(''); // 拿到的是[I, A, A, I, C]
    let position = [];
    for (let j = 0; j < char.length; j++) {
      position.push(getValue(char[j]));
    }
    positions.push(position);
  }
  return positions;
}

console.log(decode('AAAA,SAASA,IAAIA,CAAA,EAAG;EACdC'))
```


## loader
### 执行原理

1. 参数准备（LoaderRun.js）
  1. 获取module的绝对路径
  2. 构造所有需要执行的loader的顺序
  3. 把所有参数放入runLoaders执行


```
// LoaderRun.js

const path = require('path');
const fs = require('fs');
const { runLoaders } = require('./loader-runner');

// 构造一个方法，使得相对路径变为绝对路径
let loadDir = path.resolve(__dirname, 'loaders');
const resolvePath = (loader) => path.resolve(loadDir, loader)

const moduleAndInlineLoaderCommand = '!!inline-loader1!inline-loader2!./src/index.js'
// 首先把开头的! !! -!三个符号去掉，-出现0或1次，！出现1或多次
// 然后把中间隔开的!做一个预防的处理，去掉多个!!!的情况
let inlineLoaders = moduleAndInlineLoaderCommand.replace(/^-?!+/, '').replace(/!!+/g, '!').split('!')

const modulePath = inlineLoaders.pop()
inlineLoaders = inlineLoaders.map(resolvePath)

const rules = [
  {
    test: /\.js$/,
    use: ['normal-loader1', 'normal-loader2'],
  },
  {
    test: /\.js$/,
    use: ['pre-loader1', 'pre-loader2'],
    enforce: 'pre',
  },
  {
    test: /\.js$/,
    use: ['pre-loader3'],
    enforce: 'pre',
  },
  {
    test: /\.js$/,
    use: ['post-loader1', 'post-loader2'],
    enforce: 'post',
  }
]

let preLoaders = [];
let postLoaders = [];
let normalLoaders = [];

for (let i = 0; i < rules.length; i++) {
  const rule = rules[i];
  if (rule.test.test(modulePath)) {
    if (rule.enforce === 'pre') {
      preLoaders.push(...rule.use)
    } else if (rule.enforce === 'post') {
      postLoaders.push(...rule.use)
    } else {
      normalLoaders.push(...rule.use)
    }
  }
}

preLoaders = preLoaders.map(resolvePath);
postLoaders = postLoaders.map(resolvePath);
normalLoaders = normalLoaders.map(resolvePath);

let allLoaders = []

if (moduleAndInlineLoaderCommand.startsWith('!!')) {
  // 不要前后置和普通loader，只要inlineloader
  allLoaders = [...inlineLoaders];
} else if (moduleAndInlineLoaderCommand.startsWith('!')) {
  // 不要普通loader
  allLoaders = [...postLoaders, ...inlineLoaders, ...preLoaders];
} else if (moduleAndInlineLoaderCommand.startsWith('-!')) {
  // 不要前置和普通loader
  allLoaders = [...postLoaders, ...inlineLoaders];
} else {
  allLoaders = [...postLoaders, ...inlineLoaders, ...normalLoaders, ...preLoaders];
}

runLoaders({
  resource: path.join(__dirname, modulePath),
  loaders: allLoaders,
  readResource: fs.readFile.bind(fs)
}, (err, data) => {
  console.log(err);
  console.log(data);
})
```


2. runLoaders执行（loader-runner.js）
  1. 构造loaderContext上下文对象
  2. 执行遍历pitch函数，开始进入单个loader
    1. 加载每个loader的normal函数和pitch函数
    2. 无pitch函数去下一个，有pitch函数执行，完毕后无返回值去下一个，有返回值直接回退上一层执行normal函数
  3. pitch遍历完执行processResource函数，读取module文件内容
  4. 执行遍历normal函数，叠加module文件的转译内容，最后执行完执行初始的回调函数


```
// loader-runner.js

const fs = require('fs');
const path = require('path');
const readFile = fs.readFile.bind(fs);

const PATH_QUERY = /^([^?#]*)(\?[^#]*)?(#.*)?$/;

function resolveQueryPath(resource) {
  let result = PATH_QUERY.exec(resource);
  return {
    resourcePath: result[1],      // ./src/inde.js
    resourceQuery: result[2],     // ?name=zzzzz
    resourceFragment: result[3],  // #top
  }
}

function createLoaderObject(loader) {
  let obj = {
    path: '',
    query: '',
    fragment: '',

    normal: null, // loader的主函数
    pitch: null, // 当前loader的pinch函数
    pitchExecuted: false, // 当前的pitch函数已经执行过了
    normalExecuted: false, // 当前的normal函数已经执行过了

    raw: null, // normal.raw为true表示这是一个buffer
    data: {}, //当前loader的数据

  }

  // 提供一个【还原】方法，调用loader.request可以拿到loader原来的绝对路径
  Object.defineProperty(obj, 'request', {
    get() {
      return obj.path +
      (obj.query ? obj.query : '') + 
      (obj.fragment ? obj.fragment : '');
    },
    set(value) {
      let { resourcePath, resourceQuery, resourceFragment } = resolveQueryPath(value);
      obj.path = resourcePath;
      obj.query = resourceQuery;
      obj.fragment = resourceFragment;
    }
  })

  obj.request = loader;
  return obj;
}

function processResource(processOptions, loaderContext, callback) {
  // 重置index为最后一个
  loaderContext.loaderIndex = loaderContext.loaders.length - 1;

  // 开始读取这个资源里面的内容，读完之后执行里面的回调函数，也就是开始进入normal函数的迭代
  let resourcePath = loaderContext.resourcePath;
  processOptions.readResource(resourcePath, (err, buffer) => {
    if (err) return callback(err)
    processOptions.resourceBuffer = buffer; // 保存好原始的代码
    iterateNormalLoaders(processOptions, loaderContext, [buffer], callback)
  });

}

function convertArgs(args, raw) {
  // 如果需要buffer（raw为true），且现在不是buffer，需要转化成buffer
  if (raw && !Buffer.isBuffer(args[0])) {
    args[0] = Buffer.from(args[0], 'utf8')
  } else if (!raw && Buffer.isBuffer(args[0])) {
    // 不需要buffer，但现在是buffer，转化成字符串
    args[0] = args[0].toString('utf8')
  }
}

// 为什么normal函数要加上一个args的参数，因为normal函数的出参是要给上一个normal函数的入参的，需要迭代执行
function iterateNormalLoaders(processOptions, loaderContext, args, callback) {

  // normal全部执行完之后，就执行最外部的callback函数了，传出转换后的buffer
  if (loaderContext.loaderIndex < 0) {
    return callback(null, args)
  }

  let currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];

  if (currentLoaderObject.normalExecuted) {
    loaderContext.loaderIndex --;
    return iterateNormalLoaders(processOptions, loaderContext, args, callback);
  }

  let normalFunction = currentLoaderObject.normal;
  currentLoaderObject.normalExecuted = true;

  // 把buffer转化成字符串，或相反
  convertArgs(args, currentLoaderObject.raw);

  runSyncOrAsync(
    normalFunction,
    loaderContext,
    args,

    // switchNextCallback回调函数
    function (err) {
      if (err) return callback(err);
      let newArgs = Array.prototype.slice.call(arguments, 1);
      iterateNormalLoaders(processOptions, loaderContext, newArgs, callback)
    }
  )
}

function iteratePitchingLoaders(processOptions, loaderContext, callback) {

  // 终止条件
  if (loaderContext.loaderIndex >= loaderContext.loaders.length) {
    // pitch函数到头的，开始读取资源
    return processResource(processOptions, loaderContext, callback)
  }

  let currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];

  if (currentLoaderObject.pitchExecuted) {
    loaderContext.loaderIndex ++;
    return iteratePitchingLoaders(processOptions, loaderContext, callback);
  }
  
  // 为currentLoaderObject的normal和pitch赋值，拿到真正的loader函数
  loadLoader(currentLoaderObject)

  let pitchFunction = currentLoaderObject.pitch;
  currentLoaderObject.pitchExecuted = true;

  // 这里为什么要这么设计呢
  // 如果当前的loader没有pitch函数，那直接index++去到下一个，pitchExecuted还是false不行吗，为什么要重新进到自己的loader的内部

  // 回答：很多地方都用到了index++去执行下一个，比如 1. 没有pitch函数；2. pitch函数执行完了，且没有返回值
  // 写成这样是1.说明pitch函数我已经操作过了（无论有无） 2.再次进入自己的loader世界，如果pitch函数已经操作过了，才进入下一个 3.两个步骤都可以公共地写，不用分开两次写
  if (!pitchFunction) {
    return iteratePitchingLoaders(processOptions, loaderContext, callback)
  }

  runSyncOrAsync(
    pitchFunction,
    loaderContext, 

    // 下面是要传递给pitch函数的参数
    [loaderContext.remainingRequest, loaderContext.previousRequest, loaderContext.data = {}],

    // ！！关键的回调函数，【链条节点的对外开关】，决定往前走还是往后走
    function (err, args) {

      // 如果args有值，说明pitch函数有返回值，index--，开始回退了
      if (args) {
        loaderContext.loaderIndex--;
        iterateNormalLoaders(processOptions, loaderContext, Array.isArray(args) ? args : [args], callback);
      } else {
        // 如果没有返回值，执行下一个loader的pitch函数
        return iteratePitchingLoaders(processOptions, loaderContext, callback);
      }
    }
  );

}

function loadLoader(loaderObject) {
  const module = require(loaderObject.path);
  loaderObject.normal = module;
  loaderObject.pitch = module.pitch;
  loaderObject.raw = module.raw;
}

function runSyncOrAsync(fn, context, fnArgs, switchNextCallback) {
  let isSync = true; // 默认是同步
  let isDone = false; // 函数是否已经执行过了

  // 异步的设置，等pitch函数调用才执行，此时把isSync变为false，下面的同步就不会执行了
  // 然后一直等，等到innerCallback被调用才去执行开关函数，决定往哪里走
  context.async = function () {
    isSync = false;

    // 为什么要把这个函数赋予给两个变量，因为：可以从不同的方式拿到这个函数然后手动调用
    const innerCallback = context.callback = function (...args) {
      isDone = true;
      // 保证不会走下面的同步函数了
      isSync = false;
      // 这里的args是本innerCallback函数的参数，也就是调用context.callback方法传递的参数（这个参数相当于【同步函数里面的return值】）
      switchNextCallback(null, ...args);
    }

    return innerCallback;
  }

  // 调用pitch函数
  const result = fn.apply(context, fnArgs)

  // 同步的执行，去执行开关函数，决定往哪里走
  if (isSync) {
    isDone = true;
    return switchNextCallback(null, result)
  }

}

exports.runLoaders = function(options, callback) {

  // module 的绝对路径
  let moduleResource = options.resource || '';

  // loaders数组
  let loaders = options.loaders || [];
  // loader执行的时候的上下文
  let loaderContext = {};

  // 读文件的方法（为什么要传递参数？？？？？）
  let readResource = options.readResource || readFile;

  // 解析路径，保存一下当前module所在的目录（文件夹），以及解析结果
  let { resourcePath, resourceQuery, resourceFragment } = resolveQueryPath(moduleResource)
  loaderContext.moduleContext = path.dirname(resourcePath)
  loaderContext.resourcePath = resourcePath;
  loaderContext.resourceQuery = resourceQuery;
  loaderContext.resourceFragment = resourceFragment;

  // 生成loader对象数组，保存
  loaders = loaders.map(createLoaderObject)
  

  // 保存当前loader的索引
  loaderContext.loaderIndex = 0;
  loaderContext.loaders = loaders;

  loaderContext.async = null;
  loaderContext.callback = null;

  // 输出一个方法，可以查询moduleResource的绝对路径
  // 这不可以直接保存moduleResource吗，也就是loaderContext.moduleResource = moduleResource
  Object.defineProperty(loaderContext, 'moduleResource', {
    get() {
      return loaderContext.resourcePath + loaderContext.resourceQuery + loaderContext.resourceFragment;
    }
  })

  // 输出一个方法，可以拿到loader的绝对路径数组和module的绝对路径数组的结合
  // request为【loader1的绝对路径！loader2的绝对路径！module的绝对路径】
  Object.defineProperty(loaderContext, 'request', {
    get() {
      return loaders.map(i => i.request).concat(loaderContext.moduleResource).join('!')
    }
  })

  // 剩下的loader和module的绝对路径
  Object.defineProperty(loaderContext, 'remainingRequest', {
    get() {
      return loaderContext.loaders.slice(loaderContext.loaderIndex + 1).map(i => i.request).concat(loaderContext.moduleResource).join('!')
    }
  })

  // 当前及之后的loader和module的绝对路径
  Object.defineProperty(loaderContext, 'currentRequest', {
    get() {
      return loaderContext.loaders.slice(loaderContext.loaderIndex).map(i => i.request).concat(loaderContext.moduleResource).join('!')
    }
  })

  // 执行过的loader的绝对路径
  Object.defineProperty(loaderContext, 'previousRequest', {
    get() {
      return loaderContext.loaders.slice(0, loaderContext.loaderIndex).map(i => i.request).join('!')
    }
  })

  // 当前的loader的options或者query
  Object.defineProperty(loaderContext, 'query', {
    get() {
      let loader = loaderContext.loaders[loaderContext.loaderIndex];
      return loader.options || loader.query;
    }
  })

  // 当前的loader的data
  Object.defineProperty(loaderContext, 'data', {
    get() {
      let loader = loaderContext.loaders[loaderContext.loaderIndex];
      return loader.data;
    }
  })

  let processOptions = {
    resourceBuffer: null, // 最后会把loader执行的buffer放在这里
    readResource,
  }

  iteratePitchingLoaders(processOptions, loaderContext, function(err, result) {
    if (err) {
      return callback(err, {});
    }
    callback(null, {
      result,
      resourceBuffer: processOptions.resourceBuffer,
    })
  })
}
```




3. 同步或异步loader的写法
  1. 异步：手动调用this.async方法，拿到返回值，等待执行完再打开下一个的开关（可以是否传参表明是否有return）

```
function normal(source) {
  console.log('normal')
  return source + '//normal'
}

normal.pitch = function () {
  // 调用async方法，把loader从同步改成异步
  // 改成异步之后，当前的loader执行结束后不会立即向下执行下一个loader
  // 需要手动调用callback方法,callback的入参是这个loader的返回值

  let callback = this.async();
  console.log('pintch 1', new Date())
  setTimeout(() => {
    callback(null)
  }, 3000)
  
}

module.exports = normal
```



  2. 同步

```
function normal(source) {
  console.log('inline')
  return source + '//inline'
}

normal.pitch = function () {
  console.log('pitch 2')
  // 有返回值，回退！
  return '11111'
}

module.exports = normal
```



- 问题：
  - pitch函数什么时候使用？
  - 只有最左边的loader的normal函数才能写module.export = xxxxx，如果我想在倒数第二个loader也写module.exports = xxxxx，怎么办？？（也就是连用最左边两个loader的导出结果）
- 解决：看style-loader和less-loader




### 常用的loader


- 配置补充，写在module.exports外部大变量

```
// 这个相当于指定【去哪里找loader】，先去node_modules，找不到再去loaders
resolveLoader: {
  modules: ['node_modules', path.join(__dirname, 'loaders')]
},
```


#### JS文件
##### source-map loader

- 问题：被import或require导入的代码，呈现的是压缩且转化后的样子，调试的时候我想看到源码
- 解决：source-map-loader

```
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
```


- 效果

```
// 被引入的文件 content.js
function test() {
  console.log('test');
}
module.exports = {
  test,
}
//# sourceMappingURL=content.js.map
```




##### babel-loader

- 核心是babel.transform(source, options)方法

```
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
```





#### IMG文件（png、jpg、gif、bmp...）

- 配置

```
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
```



##### file-loader

主要干了两件事：

1. 把源文件加到输出目录dist里面
2. 生成一个hash文件名，导出去

```
// file-loader2.js

// let { getOptions, interpolateName } = require('loader-utils')
const path = require('path')

function getOptions(loaderContext) {
  // query的逻辑是 loader.options || loader.query
  // 这里的核心目标是保证导出的query是一个对象
  const query = loaderContext.query;
  if (typeof query === 'string' && query !== '') {
    return parseQuery(loaderContext.query)
  }
  if (!query || typeof query !== 'object') {
    return null
  }
  return query;
}

function parseQuery(query) {
  return query.split('&').reduce((accum, item) => {
    if (item.startsWith('?')) {
      item = item.replace(/^\?+/, '')
    }
    let [key, value] = item.split('=');
    accum[key] = value;
    return accum;
  }, {})
}

function interpolateName(loaderContext, name, options) {
  let filename = name || '[hash].[ext]';

  // 拿到原来的扩展名
  let ext = path.extname(loaderContext.resourcePath).slice(1);
  // 根据内容生成一个hash
  let hash = require('crypto').createHash('md5').update(options.content).digest('hex')

  // 用真实值替换占位符
  filename = filename.replace(/\[hash\]/ig, hash).replace(/\[ext\]/ig, ext);

  return filename;

}

function loader(content) {

  // 拿到配置的选项
  let options = getOptions(this) || {}
  // 拿到改过的hash文件名
  let filename = interpolateName(this, options.filename || '[hash].[ext]', {
    content
  })

  // 向输出文件夹（dist）里面加新的文件
  // 目的是可以在main.js里面直接引用当前文件夹下面的xx图片
  this.emitFile(filename, content)
  
  // 相当于把图片变成了一个js文件，可以导出他的名字
  // 我在require('./xx.png')的时候，可以直接拿到exports对象里面的default的值，也就是图片文件名
  return `export default ${JSON.stringify(filename)}`;
}

// 加载的是二进制，需要让content是buffer
loader.raw = true;
module.exports = loader
```

##### url-loader

file-loader的升级版：

1. 小于xx值的文件可以直接转成base64字符，导出去
2. 大于xx值的文件，调用file-loader的函数处理

```
// url-loader2.js

const { getOptions } = require('loader-utils')
const mime = require('mime')

function loader(content) {

  // 拿到配置的选项
  let options = getOptions(this) || {};
  let { limit, fallback = 'file-loader' } = options;

  // 把limit转化为数字类型
  if (limit) {
    limit = parseInt(limit, 10);
  }

  // 拿到目标文件的【媒体类型】
  const mimeType = mime.getType(this.resourcePath); // .jpg变为image/jpeg

  // 如果没有配置limit但是直接用了url-loader，或者图片的大小小于limit的大小
  // 转成base64字符
  if (!limit || content.length < limit) {
    let base64 = `data:${mimeType};base64,${content.toString('base64')}`

    // loader返回export default只能有一个，且一般是最后一个，经过转换的代码不能有多个export default
    // 二进制文件的导出一般也不会用export default
    return `export default ${JSON.stringify(base64)}`
  } else {

    // 如果大于limit，调用file-loader的函数，拿到返回值
    let fileLoader = require(fallback || 'file-loader')
    return fileLoader.call(this, content);
  }
}

// 加载的是二进制，需要让content是buffer
loader.raw = true;
module.exports = loader
```


#### CSS文件（css、less、sass...）

- 配置
  - less和css不能结合在一起写（因为：css经过less的转化，路径会出现问题）

```
{
    test: /\.less$/,
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
```



##### style-loader

主要干了：（css放到html里面）把css内容写入style标签，把style标签加到head


- 普通写法：写在normal上
  - 只有styleLoader才是最后一个，其他都不能写module.exports = xxx，其他传过来都是单纯的内容值。

```
// style-loader2.js

let loaderUtils = require('loader-utils')

function loader(source) {
  let script = `
    let style = document.createElement('style');
    style.innerHTML = ${JSON.stringify(source)};
    document.head.appendChild(style);
  `
  return script;
}

module.exports = loader
```


- 同时利用最左侧两个loader的写法：写在pitch上
  - 使用require把后面执行的（remainingRequest）所有loader的累加返回值拿到
  - 倒数第二个loader需要写module.exports = xxx，这个loader的返回值给到【已经在webpack里面】的【styleLoader的pitch函数的返回值】
  
```
loader.pitch = function (remainingRequest, previousRequest, data) {

  // 此时的remainingRequest是 ../loaders/css-loader2.js!../loaders/less-loader2.js!./index.less
  // 加上感叹号的是只要inlineloader，直接用当前的这个command，不读取rule的配置项了

  // stringifyRequest把绝对路径转为相对路径
  // 因为webpack是相对根目录找文件的，所以要转换
  
  let script = `
    let style = document.createElement('style');
    style.innerHTML = require(${loaderUtils.stringifyRequest(this, '!!' + remainingRequest)});
    document.head.appendChild(style);
  `

  // 接下来：
  // script给webpack，把脚本转成抽象语法树，然后找依赖，也就是找import或者require
  // 继续解析内容"!!../loaders/css-loader2.js!../loaders/less-loader2.js!./index.less"
  // 要解析index.less这文件，找行内loader，以及其他需要这个文件（less）的loader（写在rules里面的）
  // 因为写了！！，所以只要行内loader
  // 开始使用css-loader和less-loader，执行他们的pitch（没有），然后读less内容，然后执行less-loader和css-loader的normal

  return script;
}
```



##### css-loader

主要干了：（处理css的@import和url()）

1. 针对每一个module，执行插件
  1. 遍历里面的@import语句，保存路径到外部，以便替换为require
  2. 遍历里面的url()语句，直接替换路径为require
2. module操作完，执行then回调函数
  1. 把保存好的@import语句全部替换为require
  2. 整合自己module的所有import内容和本身的css
3. 开关函数执行去到下一个：实际上是给到styleLoader的pitch函数，因为cssLoader自己module.export导出了

```
let postcss = require('postcss'); // 用来处理css，基于css语法树
let loaderUtils = require('loader-utils');
let tokenizer = require('css-selector-tokenizer');

function loader(cssString) {

  // 转化为异步执行
  let callback = this.async();

  const cssPlugin = (options) => {
    return (cssRoot) => {

      // 遍历每个css文件的规则，找到所有的@import()语句，保存路径到外部
      cssRoot.walkAtRules(/^import$/i, rule => {
        rule.remove(); // 删除这个rule，保证下次遍历不会拿到并push同样的值
        options.imports.push(rule.params.slice(1, -1)) // params的形式为“‘./global.css’”，需要把首尾两个双引号去掉
      })

      // 遍历每个css文件的规则，找到所有的url()，改为require形式（改完后覆盖原来的值）
      cssRoot.walkDecls(decl => {
        let values = tokenizer.parseValues(decl.value);
        values.nodes.forEach(item => {
          item.nodes.forEach(item2 => {
            if(item2.type === 'url') {
              item2.url = "`+require(" + loaderUtils.stringifyRequest(this, item2.url) + ").default+`";
            }
          })
        })
        decl.value = tokenizer.stringifyValues(values)
      })
    }
  }

  // 保存所有顶部import的路径
  let options = {
    imports: [], // ["./global.css"]
  };

  // 源代码（每个css文件）会经过流水线的一个个插件（每个css文件都去执行一遍插件）
  // 构造流水线
  let pipeLine = postcss([cssPlugin(options)])

  // 每个css文件处理完所有插件之后，整合所有内容构造本css文件的完整版本
  pipeLine.process(cssString).then(result => {

    // 对于顶部的@import，转化成require去拿文件
    // 且通过inlineLoader的方式先过一遍cssLoader的内容，再得到结果写入module.exports，然后返回值给到父css
    let importCSS = options.imports.map(url => {
      return "`+require(" + loaderUtils.stringifyRequest(this, '!!css-loader2!' + url) + ")+`";
    })

    // 把顶部@import的内容和自己的css内容合并起来，返回值给stylePitch的返回值，然后给webpack，不用经过styleLoader的normal
    let output = "module.exports = `" + importCSS + "\r\n" + result.css + "`"

    // 开关调用，去下一个
    callback(null, output)
  })
}

// 为什么每个require()前后都要加上`+
// 因为原本的其他部分都是字符串，require是一个表达式
// 通过【结束上一个字符串】+【连接表达式】+【开始下一个字符串】实现，相当于：
// module.export = ` 字符串 `+ require() +` 字符串 `
// （上一行再loader里面输出也是个字符串，在webpack那里会去实现）

module.exports = loader
```


##### less-loader

主要干了：（把less编译成css）直接使用less库的render方法把less解析变成css

```
let less = require('less')

function loader(source) {

  // 转化成异步函数
  let callback = this.async();
  less.render(source, { filename: this.resource }, (err, output) => {

    // 直接使用less库的render方法进行解析
    const css = output.css

    // 是倒数第二个loader，中间没有css-loader，直接用写module.exports
    // let code = `module.exports = ${JSON.stringify(css)}`

    // 不是倒数第二个loader，解析完之后直接传入去到下一个
    callback(err, css)
  })

}

module.exports = loader
```




## plugin

### 执行原理（tapable）

事件流的机制：树枝上需要的地方挂上钩子，执行的时候自动找有钩子函数的去执行

#### 总分类

1. 按照同步异步分
  1. 同步
  2. 异步
    1. 串行
    2. 并行


2. 按照返回值分
  1. basic：不关心返回值，从头到尾执行每个钩子函数，结束
  2. bail：
    1. 没有返回值（返回undefined）：继续执行
    2. 有返回值：结束
  3. waterfall：
    1. 没有返回值：用【之前有返回值的函数】的返回值（或者初始入参）
    2. 有返回值：下一个函数的入参用上一个函数的返回值
  4. loop：
    1. 没有返回值（返回undefined）：继续执行
    2. 有返回值：从头开始执行


#### 基础使用

- PS：
  - 新建的时候，参数列表要写全，取决于后面写回调时拿到的参数的数量（参数列表里面的名字没有要求，只看数组的长度）
  - tap第一个参数没有用


1. 同步钩子

```
// 同步钩子basic
let { SyncHook } = require('tapable');
const hook = new SyncHook(['name', 'age'])
// 1 ee ww
// 2 ee ww
// 3 ee ww
// 4 ee ww


// 同步钩子bail
let { SyncBailHook } = require('tapable');
const hook = new SyncBailHook(['name', 'age'])
// 1 ee ww
// 2 ee ww


// 同步钩子waterfall
let { SyncWaterfallHook } = require('tapable');
const hook = new SyncWaterfallHook(['name', 'age'])
// 1 ee ww
// 2 ee ww
// 3 A ww
// 4 A ww


// 订阅事件
hook.tap('1', (name, age) => {
  console.log(1, name,age)
})
hook.tap('2', (name, age) => {
  console.log(2, name,age)
    return 'A';
})
hook.tap('3', (name, age) => {
  console.log(3, name,age)
})
hook.tap('4', (name, age) => {
  console.log(4, name,age)
})

// 触发事件
hook.call('ee', 'ww')


// -----------------------------------------------------------


// 同步钩子loop
let { SyncLoopHook } = require('tapable');
const hook = new SyncLoopHook(['name', 'age'])
let counter1 = 0;
let counter2 = 0;

// 订阅事件
hook.tap('A', (name, age) => {
  console.log('A', 'counter1', counter1)
  if (++counter1 === 1) {
    counter1 = 0;
    return;
  }
  return 'A';
})
hook.tap('B', (name, age) => {
  console.log('B', 'counter2', counter2)
  if (++counter2 === 2) {
    counter2 = 0;
    return;
  }
  return 'B';
})
// 触发事件
hook.call('ee', 'ww')
// A counter1 0
// B counter2 0
// A counter1 0
// B counter2 1
```




2. 异步钩子

```
// 异步并行钩子
let { AsyncParallelHook } = require('tapable');
const hook = new AsyncParallelHook(['name'])
// 1 ee
// 2 ee
// 3 ee
// undefined
// cost: 3.004s


// 异步串行钩子
let { AsyncSeriesHook } = require('tapable');
const hook = new AsyncSeriesHook(['name'])
// 1 ee
// 2 ee
// 3 ee
// undefined
// cost: 6.017s



// 返回值的写法
callback(null, 'A')
resolve('A')

// 加上Bail
let { AsyncSeriesBailHook } = require('tapable');
let { AsyncParallelBailHook } = require('tapable');

// 加上Waterfall，只有串行，因为要等上一个函数执行完看有无返回值再决定下一个函数的入参
let { AsyncSeriesWaterfallHook } = require('tapable');




// 一种写法，用封好的异步方法
// 订阅事件 callback表示执行完去开启下一步
console.time('cost')
hook.tapAsync('1', (name, callback) => {
  setTimeout(() => {
    console.log(1, name)
    callback()
  }, 1000)
})
hook.tapAsync('2', (name, callback) => {
  setTimeout(() => {
    console.log(2, name)
    callback()
  }, 2000)
})
hook.tapAsync('3', (name, callback) => {
  setTimeout(() => {
    console.log(3, name)
    callback()
  }, 3000)
})

// 触发事件 最后的回调函数
hook.callAsync('ee', (err) => {
  console.log(err)
  console.timeEnd('cost')
})




// 第二种写法，用promise
// 订阅事件
console.time('cost')
hook.tapPromise('1', (name) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(1, name)
      resolve()
    }, 1000)
  })
})
hook.tapPromise('2', (name) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(2, name)
      resolve()
    }, 2000)
  })
})
hook.tapPromise('3', (name) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(3, name)
      resolve()
    }, 3000)
  })
})

// 触发事件
hook.promise('eeeee').then((data) => {
  console.log(data);
  console.timeEnd('cost')
})
```





#### 同步钩子basic

1. 供继承的大类Hook

```
class Hook {
  constructor(args) {
    if (!Array.isArray(args)) args = [];
    this._args = args; // 用来放参数列表

    this.taps = []; // 用来放钩子函数，存对象 { namw:钩子名称， fn:钩子函数 }
    this._x = undefined;// 存钩子函数，只有函数 [fn1, fn2, fn3...]

  }

  tap(options, fn) {
    // 创造一个对象
    if (typeof options === 'string') {
      options = { name: options }
    }
    options.fn = fn;
    this._inert(options);
  }
  _inert(item) {
    this.taps[this.taps.length] = item;
    // this.taps.push(item);
  }

  call(...args) {
    let callMethod = this._createCall() // 动态编译出一个函数
    return callMethod.apply(this, args); // 然后执行这个函数
  }
  _createCall() {
    return this.compile({
      taps: this.taps,
      _args: this._args,
    })
  }

}

module.exports = Hook;
```


2. 每个具体的小钩子类SyncHook

```
let Hook = require('./Hook')
let HookCodeFactory = require('./HookCodeFactory')

const factory = new HookCodeFactory();

class SyncHook extends Hook{
  compile(options) {
    factory.setup(this, options);
    return factory.create()
  }

}

module.exports = SyncHook
```



PS：这里补充一下有两种情况：
- 如果子类没有constructor函数，那么子类的this===父类的this
- 如果子类有constructor函数，首先必须用super继承父类的constructor（父类有constructor的前提），然后此时子类的this是两者的结合

```
class Parent {
    constructor() {
        this.a = '22';
        this.parent = 'parent';
        this._x = undefined
    }
    parentThis() {
        console.log('parent this', this)
        return this
    }
}

class Child extends Parent {
    // constructor() {
    //     super()
    //     this.a = '33';
    //     this.child = 'child'
    // }
    childThis() {
        console.log('child this', this)
        return this
    }
    change() {
        this._x = [1,2]
    }
}

const c = new Child()
const this1 = c.parentThis()
const this2 = c.childThis()
console.log(this1 === this2)

// 子类没有constructor的情况：
// parentThis和childThis都是打印下面
// {a: '22', parent: 'parent', _x: undefined}
// 且两者===为true

// 子类有constructor的情况：
// parentThis和childThis都是打印下面
// {a: '33', parent: 'parent', _x: undefined, child: 'child'}
// 且两者===为true
```




3. 实时构造回调函数的字符串代码的工厂

```
class HookCodeFactory {
  // 首先填充_x属性的值为单纯的回调函数数组
  setup(instance, options) {
    this.options = options
    instance._x = options.taps.map(item => item.fn)
  }

  args() {
    return this.options._args.join(',') // [name, age]变成name, age
  }

  // create函数执行的时候，是在syncHook里面执行的，this指向这个钩子的实例
  header() {
    return `var _x = this._x;\n`
  }
  content() {
    return this.options.taps.map((item, index) => (
      `
        var _fn${index} = _x[${index}];\n
        _fn${index}(${this.args()});
      `
    )).join('\n');
  }
  
  create() {
    return new Function(this.args(), this.header() + this.content())
  }
}

module.exports = HookCodeFactory;
```






### babel插件
#### ast（抽象语法树）

PS：不同引擎的抽象语法树不一样


- 谁负责生成ast树：parser


- 步骤

1. Esprima：把源码转化为AST
  5. 一条语句分词，得到token
  6. token信息转化成一个对象
2. Estraverse：遍历并更新AST
3. Escodegen：将AST重新生成源码


- ast的生成、遍历与原地修改

```
let esprima = require('esprima');
let estraverse = require('estraverse');
let escodegen = require('escodegen');

let indent = 0
function padding() {
  return ' '.repeat(indent)
}

let code = `function ast() {}`;
let ast = esprima.parse(code);

estraverse.traverse(ast, {
  // 这里的node相当于一个层级的一个对象
  enter(node) {
    console.log(padding() + node.type + '进入');
    indent+=2;

    if (node.type === 'FunctionDeclaration') {
      node.id.name = 'newAst';
    }
  },
  leave(node) {
    indent-=2;
    console.log(padding() + node.type + '离开');

  }
})

// 打印得到
// Program进入
//   FunctionDeclaration进入
//     Identifier进入
//     Identifier离开
//     BlockStatement进入
//     BlockStatement离开
//   FunctionDeclaration离开
// Program离开

// 相当于Program表示一条语句
// FunctionDeclaration表示这条语句的类型
// Identifier表示这条语句的标识（也就是名字）
// BlockStatement表示这条语句的具体值（函数的块声明，字符串，xxxx）

let newCode = escodegen.generate(ast);
console.log(newCode)

// 打印得到
// function newAst() {
// }
```


- 为什么在babel插件里面用上了ast树？？？？？
  - 因为babel是转换语法的，需要一个【共同的规则】来实现新旧语法之间的切换。
  - 这个共同的规则就是ast树



#### 几个插件源码
##### 转换箭头函数为普通函数

- 核心思路是：
1. 找到箭头函数的函数名字、函数参数、函数体，
2. 然后构造一个函数声明或函数表达式，
3. 进行替换

```
let babel = require('@babel/core'); // babel引擎
let t = require('babel-types'); // 判断某个节是否某个类型，或者生成某个类型的节点

// 转换箭头函数的插件
// let arrowFunctionPlugin = require('babel-plugin-transform-es2015-arrow-functions')

// 手写转换箭头函数的babel插件

let arrowFunctionPlugin = {
  visitor: {
    // 遍历到ArrowFunctionExpression类型的节点（层级对象）的时候，把响应的路径作为path传入
    // 目的是让这个类型转化为FunctionExpression的类型

    ArrowFunctionExpression: (path) => {
      let node = path.node; // 当前路径的节点对象
      let id = path.parent.id; // 父路径的id，就是父节点的标识符identifier，即函数的名字
      let params = node.params; // 参数
      let body = node.body; // 函数体

      // ****这种是箭头函数后面没有大括号的表达式
      // ****(a, b) => a + b

      // 构造一个returnStatement
      let returnStatement = t.returnStatement(body)
      // 构造一个blockStatement
      let blockStatement = t.blockStatement([returnStatement])

      let functionExpression = t.functionExpression(id, params, blockStatement, node.generator, node.async)

      // 替换节点
      path.replaceWith(functionExpression)



      // ****这种是箭头函数后面有大括号的表达式，且含有this
      // ****{ console.log(this); return a + b; }

      let functionExpression2 = t.functionExpression(id, params, body, false, false);

      // 新造一个 var _this = this 的语句
      let thisVariableDeclaration = t.variableDeclaration('var', [
        t.variableDeclarator(t.identifier('_this'), t.thisExpression())
      ])

      // 让这个新语句在函数体外面，相当于【把箭头函数里面的this变成全局的this】
      let newNodes = [thisVariableDeclaration, functionExpression2]

      path.replaceWithMultiple(newNodes);

    },

    // 把【箭头函数体内】的所有this的标识符转换成_this，以使用刚才新造的_this
    // 注意是箭头函数体，所以才要加上这个callExpression的判断，外面的this不能被替换成_this
    ThisExpression(path) {
      if (path.parent.type === 'CallExpression') {
        path.replaceWith(t.identifier('_this'))
      }
    }
  }
}

let code = `const sum = (a, b) => a + b;`;

let code2 = `const sum = (a, b) => {
  console.log(this);
  return a + b;
};`;

// babel本身只是一个引擎，不会转换源代码，需要使用插件
let result = babel.transform(code2, {
  plugins: [arrowFunctionPlugin]
})

console.log(result.code)

// ****这种是箭头函数后面没有大括号的表达式
// const sum = function (a, b) {
//   return a + b;
// };


// ****这种是箭头函数后面有大括号的表达式，且含有this
// var _this = this;
// const sum = function (a, b) {
//   console.log(_this);
//   return a + b;
// };
```



##### 转换类写法为原型写法


- 核心思路是：
1. 判断区分constructor和其他函数
2. 新建一个【构造函数】声明，作为constructor的替代
3. 新建一个assignmentExpression，作为自定义方法的替代
4. 用两个语句替换原本的一个class语句


```
let babel = require('@babel/core'); // babel引擎
let t = require('babel-types'); // 判断某个节是否某个类型，或者生成某个类型的节点

// let classesPlugin = require('babel-plugin-transform-es2015-classes')

let classesPlugin = {
  visitor: {
    ClassDeclaration(path) {
      let node = path.node
      let id = node.id //就是Person

      let newNodes = [];
      let methods = node.body.body; // 拿到的是方法名数组[constructor, getName]
      
      methods.forEach((item, index) => {
        if(item.kind === 'constructor') {
          // 首先是function Person的部分，构造一个普通函数
          
          let constructorFunction = t.functionDeclaration(id, item.params, item.body, item.generator, item.async)
          newNodes.push(constructorFunction);
          
        } else {
          // 其次是原型方法赋值的部分，构造一个AssignmentExpression
          // left是MemberExpression（a.b这种叫成员表达式），right是FunctionExpression

          let memberExpression = t.memberExpression(
            t.memberExpression(id, t.identifier('prototype')), // 就是Person.prototype
            item.key // 就是getName
          );

          // 注意：这里是functionExpression，因为前面有等于号，而不是functionDeclaration
          let functionExpression = t.functionExpression(null, item.params, item.body, item.generator, item.async);

          let assignmentExpression = t.assignmentExpression('=', memberExpression, functionExpression);
          newNodes.push(assignmentExpression);

        }
      })

      path.replaceWithMultiple(newNodes);

    }
  }
}

let code = `
  class Person {
    constructor(name) {
      this.name = name
    }
    getName() {
      return this.name
    }
  }
`

// babel本身只是一个引擎，不会转换源代码，需要使用插件
let result = babel.transform(code, {
  plugins: [classesPlugin]
})

console.log(result.code)


// 转化成es5应该是这样
// function Person(name) {
//   this.name = name;
// }
// Person.prototype.getName = function () {
//   return this.name;
// }
```




##### Tree shaking（树摇）

- 本质是：引入库里面那些没有用到的代码模块（就是js文件）都删掉，不要打包进来，甚至有些变量没用到都可以被删掉


- 注意：
1. 只能使用import和export，require不行
2. 配合js代码压缩插件，uglifyJS、terserPlugin
3. 不让bebel-loader进行转换（会把es6变成commonJS，这时就不能判断了，除非babel转换保留import和export关键字，后面让webpack转换）
4. 浏览器跑代码，使用import，减少文件体积。node跑代码不关心文件体积


- 核心思路是：
1. 把原来import的模块（Specifier）和来源（Source）找到，
2. 构造两个import语句
3. 替换

```
let t = require('babel-types'); // 判断某个节是否某个类型，或者生成某个类型的节点

// let classesPlugin = require('babel-plugin-transform-es2015-classes')

// ！！！这里只针对那些库的工具是分成一个一个js的情况，如果所有的都放在一个大js里面就shake不了了

// tree-shaking是严重依赖es module的，非而es module不能使用tree shaking
// es module是静态依赖，编译的时候就能判断，因为我在import的时候提前把source里面的名字拿出来了。
// require 运行时依赖，不到支持的时候不知道如何依赖
// 比如require(window.xxxx)，我怎么知道你这个里面有啥，必须去里面把所有与文件都读取了，然后导出的exports对象拿到之后才知道是啥

let visitor = {
  // 除了写函数之外还可以写对象
  ImportDeclaration: {
    enter(path, state = {opts}) {
      const specifiers = path.node.specifiers; // 是一个数组，里面是每个导入的模块 [ImportSpecifier, ImportSpecifier]
      const source = path.node.source // 是模块的来源

      // 判断一下来源是不是和options里面要求的是一样的
      // 并且如果导入已经是默认的，那就不用转化了，只处理非默认导入
      if (state.opts.libraries.includes(source.value) && !t.isImportDefaultSpecifier(specifiers[0])) {

        const newNodes = specifiers.map((item) => {
          // 单个模块(默认)
          let importDefaultSpecifier = t.importDefaultSpecifier(item.local)
          // 来源
          let newSource = t.stringLiteral(`${source.value}/${item.imported.name}`)
          // 构造import声明语句
          return t.importDeclaration([importDefaultSpecifier], newSource)
        })
        path.replaceWithMultiple(newNodes)
      }
    }
  }
}

// 插件的写法
// babel的插件是一个函数，函数返回一个对象，里面有visitor属性
module.exports = function() {
  return {
    visitor
  }
}
```



（config文件那边的插件配置写法，module里面的rules里面）

```
{
    test: /\.js$/,
    use: [
      {
        loader: 'babel-loader', // 相对路径默认去node modules里面找
        options: {
          // 官方的插件写法（需要用二维数组！！！前面是插件名称，后面是options）
          plugins: [['import', { library: 'lodash' }]]
    
          // 改了一下路径来源（后面的libraries也可以用数组的，指定多个需要树摇的库！！）
          plugins: [
            [path.resolve(__dirname, 'plugins/babel-plugin-import.js'), { libraries: ['lodash'] }]
          ]
        }
      }
    ]
},
```


（index.js处引入了一个很大的库）

```
// 这样写会把整个lodash包打进去，实际上lodash包非常大
import { flatten, concat } from "lodash";

// 但是这样写会很麻烦要写两行，可以用插件把上面的一行转化成下面的两行
// import flatten from 'lodash/flatten'
// import concat from 'lodash/concat'

console.log(flatten);
console.log(concat);
```







### 其他插件
#### 最最基础的同步异步插件写法

- compiler.hooks上面有很多个表示不同时间点的插件，对他tap（也就是订阅），可以在config文件生效的一开始把回调函数挂到对应的时间点上，时间点一到就执行这个回调，拿到当前响应的数据。


```
class DonePlugin {
  apply(compiler) {
    // 同步写法
    compiler.hooks.done.tap('DonePlugin', (state) => {
      // 这个state是一个对象，有modules，chunks，assets三个属性
      console.log('tap done plugin')
    })
    
    // 异步写法
    compiler.hooks.done.tapAsync('DonePlugin', (state, callback) => {
      console.log('tap done plugin callback')
      callback() // 表示异步执行完毕，可以进行下一步
    })
  }
}

module.exports = DonePlugin;
```


#### 查看assets插件

- assets包含所有的chunk
- 放在了compilation上面


```
// 查看资产信息
// 表示打包后的内容，也就是输出的文件

class AssetsPlugin{
  constructor(options) {
    this.options = options
  }
  apply(compiler) {
  
    // 监听compilation钩子拿到最新的compilation
    compiler.hooks.compilation.tap('AssetsPlugin', (compilation, params) => {

      // 监听compilation里面的chunkAsset钩子拿到每个被添加的chunk和他对应的文件名字
      compilation.hooks.chunkAsset.tap('AssetsPlugin', (chunk, filename) => {
        console.log('chunk', chunk.name);
        console.log('filename', filename);

        console.log('compilation.assets', compilation.assets)

        // compilation.assets是这样一个对象
        // {
        //   'main.js': CachedSource {
        //     _source: ConcatSource { _children: [Array], _isOptimized: false },
        //     _cachedSourceType: undefined,
        //     _cachedSource: undefined,
        //     _cachedBuffer: undefined,
        //     _cachedSize: undefined,
        //     _cachedMaps: Map(0) {},
        //     _cachedHashUpdate: undefined
        //   }
        // }
        
      })
    })
  }
}

module.exports = AssetsPlugin;
```



#### 打包assets插件


```
// 插件用来打包所有的产出文件
// 首先要知道产出哪些文件，文件的内容是什么
// 生成一个新文件，添加到输出列表里面，也写入dist

const JSZip = require('jszip');
const { RawSource } = require('webpack-sources')

class ZipPlugin{
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    // emit钩子在生成资源到output目录之前触发，相当于最后一步了
    compiler.hooks.emit.tapAsync('ZipPlugins', (compilation, callback) => {

      let zip = new JSZip();

      // compilation.assets是一个对象，key是文件名，值是源代码
      // 里面包含了chunk的所有js文件
      for (let filename in compilation.assets) {
      
        // 调用source方法可以获取源码内容
        const source = compilation.assets[filename].source();

        // 向压缩包里面添加一个文件，名字是filename，内容是source
        zip.file(filename, source);

      }
      // 构造压缩包
      zip.generateAsync({ type: 'nodebuffer' }).then(content => {
      
        // 把整个压缩包的内容添加回compilation里面，也就是添加到输出列表里面
        compilation.assets[this.options.filename || 'assets.zip'] = new RawSource(content)

        // 下面这个和上面的RawSource是一样的效果，一个对象，里面有source方法，可以拿到源码内容
        // compilation.assets['assets.zip'] = {
        //   source() {
        //     return content;
        //   }
        // }
        callback();
      })

    })
  }
}

module.exports = ZipPlugin;
```




（config里面的使用）

```
plugins: [
  new ZipPlugin(),
]
```




#### 自动添加外链插件


- 使用场景：某些库很大，我希望用cdn引入，但是要在html写script且在config配置external，然后直接在window上面取对象，很麻烦，直接用插件帮我解决


```
// HTML处：

<script src="https://cdn.bootcss.com/jquery/3.1.0/jquery.js"></script>
<script>
    console.log('jquery $', window.$)
    console.log('jquery _', window._)
</script>



// webpack.config.js处：

  // 把cdn的库变成window的内置对象
externals: {
    // key是模块的名称，值是window上面的全局变量
    'jquery': '$',
    'lodash': '_',
},
```



- 核心思路：
1. 自动在html里面插入script标签，src使用config配置的
2. 在生成normalModule阶段，判断如果导入的是目标转换的库，改为externalModule
3. 注意，如果config配置了，但代码实际没用上，就不需要生成script标签（拿到所有导入的modules和配置的库的交集）


```
// 向html里面插入script标签，
// 引入lodash等库，自动转为外部模块，直接读window的对象
// 只引入项目中使用的脚本，即使在config里面配置了，我实际的代码没有用到相应的模块，就不要引用（找到项目所有依赖（依赖在ast阶段查找，找到这个阶段的钩子）和配置的external的交集部分）

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExternalModule = require('webpack/lib/ExternalModule')

class AutoExternalPlugin{
  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    // 先缓存一个this，永远指向插件类的实例
    let _this = this;
    let { options } = this;
    let usedExternalModules = new Set();

    // 2. 引入lodash等库，自动转为外部模块，直接读window的对象

    // webpack module
    // NormalModule普通模块，普通的js模块，由NormalModuleFactory创建
    // 要把普通模块变为一个外部模块

    compiler.hooks.normalModuleFactory.tap('AutoExternalPlugin', (normalModuleFactory) => {

      // 3. 优化：没用的库别引入
      // 这里用到的parser，parser本质上是一个hookmap，映射的是synchook，有两个参数parse和paeseOption
      // 为什么要用hookmap的形式呢？因为parser有很多类型，'javascript/auto'只是其中的一种

      normalModuleFactory.hooks.parser.for('javascript/auto').tap('AutoExternalPlugin', (parser) => {

        // import识别
        // 下面这个hook的执行时机是parser把js转化成ast，然后找里面的import，找到就来执行这个回调函数
        parser.hooks.import.tap('AutoExternalPlugin', (statement, source) => {

          // 这里的statement就是：let $ = require('jquery')，source就是：jquery
          if (options[source]) {
            // 把source模块添加到set里面，且不重复
            usedExternalModules.add(source)
          }
        });

        // require识别
        parser.hooks.call.for('require').tap('AutoExternalPlugin', (expression) => {
          let value = expression.arguments[0].value;
          if (options[value]) {
            usedExternalModules.add(value)
          }
        });
      });

      // ******这是webpack4的旧方法******
      // 拿到了普通模块的工厂
      // 每个工厂都有一个factory，是用来生产模块的钩子
      // 回调根据data创建模块，且提供了一个factory的原本的创建模块的方法

      normalModuleFactory.hooks.factory.tap('AutoExternalPlugin', (factory) => {
        (data, callback) => {

          // data是一个对象，上面的核心信息就是一个要加载的模块：jquery，lodash
          // 正常来说会直接创建模块，并把模块传给callback，没有别的判断逻辑
          // factory(data, callback)

          // 现在要改造这个逻辑，不再统一生成normalModule，normalModule是要被一起打包到main.js的，现在如果某个module已经被cdn引入了，那不需要生成normalModule了

          // 拿到所有要加载的模块的名字
          let request = data.request;

          if (options[request]) {
            let { variable } = options[request] // 拿到$或者_
            
            // 外部模块参数包括：新的变量名字、挂在那个对象上、旧的模块名字
            let newModule = new ExternalModule(variable, 'window', request)
            callback(null, newModule)

          } else {

            // 走正常的生产逻辑，生成普通模块
            factory(data, callback);
          }
        }
      })

      // ******这是webpack5的新方法******
      // 把factory的方法改成了resolve的方法

      normalModuleFactory.hooks.resolve.tapAsync('AutoExternalPlugin', (resolveData, callback) => {

        let request = resolveData.request;

        if (options[request]) {
          let { variable } = options[request];
          let newModule = new ExternalModule(variable, 'window', request);
          callback(null, newModule)
        } else {
          callback(null);
        }
      });

    })

    // 1. 向html里面插入script标签，
    // 通过监听compilation钩子，可以在compiler开启新编译的时候把compilation传过来
    compiler.hooks.compilation.tap('AutoExternalPlugin', (compilation) => {

      // 这个html的插件可以向compilation里面挂上额外的钩子（getHooks方法），供其他插件使用
      // 相当于compilation.hooks.htmlWebpackPluginAlterAssetTags = new xxx()
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync('AutoExternalPlugin', (htmlPluginData, callback) => {

        // htmlPluginData是一个对象，里面有assetTags属性，表明html里面的script标签的所有信息
        // "assetTags": {
        //   "scripts": [
        //     {
        //       "tagName": "script",
        //       "voidTag": false,
        //       "meta": {
        //         "plugin": "html-webpack-plugin"
        //       },
        //       "attributes": {
        //         "defer": true,
        //         "src": "main.js"
        //       }
        //     }
        //   ],
        //   "styles": [],
        //   "meta": []
        // },

        let scriptsUrl = Object.keys(options).filter(key => usedExternalModules.has(key)).map(key => options[key].url)

        scriptsUrl.forEach(url => {

          let newScript = {
            "tagName": "script",
            "voidTag": false,
            "attributes": {
              "defer": true,
              "src": url
            }
          }

          // 必须要unshift，因为要把库插入到main.js前面，因为main用到这些库
          htmlPluginData.assetTags.scripts.unshift(newScript)
        })

        // 这是异步串行的瀑布流钩子，需要把返回值传入
        callback(null, htmlPluginData)
      })
    })

  }

}

module.exports = AutoExternalPlugin;
```



- 其中parser是一个hookmap，hookmap实际上是一个变量到钩子的映射工厂

```
// hookmap是一个帮助类，使用方式如下，可以帮助创建一个映射函数，映射某个变量为一个hook

let { SyncHook, HookMap } = require('tapable');

const keyedHook = new HookMap(key => new SyncHook(['name']))

// 下面两种写法是一样的，本意是拿到key所映射的hook，然后去订阅他
keyedHook.tap('key', 'plugin1', (name) => { console.log(1, name) })
keyedHook.for('key').tap('plugin2', (name) => { console.log(2, name) })

// 拿到key所映射的hook，然后call发布
// 用get拿是因为这是一个map
const hook = keyedHook.get('key')
hook.call('zzzzz')



// 手写hookMap
class HookMap{
  constructor(factory) {
    this._map = new Map();
    this._factory = factory;
  }

  tap(key, options, fn) {
    return this.for(key).tap(options, fn)
  }
  tapAsync(key, options, fn) {
    return this.for(key).tapAsync(options, fn)
  }
  tapPromise(key, options, fn) {
    return this.for(key).tapAsync(options, fn)
  }

  for(key) {
    const hook = this.get(key)
    if (!!hook) {
      return hook
    }
    let newHook = this._factory(key)
    this._map.set(key, newHook)
    return newHook
  }

  get(key) {
    return this._map.get(key)
  }

}
```




#### 改变HASH插件

- 核心思路：
1. 在compilation的afterHash阶段改变
2. hash改compilation.hash
3. chunkhash改compilation.chunks数组的chunk.renderedHash
4. contenthash改compilation.chunks数组的chunk.contentHash


```
// hash每次编译都会产生一个hash值，整个项目只要有一个文件发生轻微改变，hash都会改变
// chunkhash是代码块hash，每一个chunk都有自己的hash，每个入口的文件变化只会影响到自己的，其他的直接复用同hash的缓存
// contentHash是内容hash，和内容有关，内容不变就不变（比如外部的css）

// hash的最小单位是chunk

// hash与什么有关系？
// 普通依赖（import和require）
// 异步依赖（import()）
// 模块ID
// usedExport导出对象
// 本次编译的hash

// chunkHash和什么有关系？
// hashSalt的盐值（hash加一些定制的标识语句）
// 代码块的ID
// 代码块的名称
// 代码块包含的模块
// 最终代码的template

// hash生成的流程：
// 拿到每一个module的hash
// 遍历所有的chunk，生成每一个chunkHash，同时生成contentHash（实际上是调用contentHash的call方法，有可能没有）
// 整合所有的chunkhash

class HashPlugin{
  constructor() {
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('HashPlugin', (compilation) => {
      compilation.hooks.afterHash.tap('HashPlugin', () => {

        // webpack把hash值放在了compilation.hash属性上面
        // 相当于如果我要改hash，我只需要直接改compilation.hash属性就可以
        compilation.hash = 'hash' + Date.now();

        // 拿到本次编译的所有的代码块
        let chunks = compilation.chunks;
        for (let chunk of compilation.chunks) {

          // 每个chunkHash计算结果会放在chunk.renderedHash属性里面
          chunk.renderedHash = chunk.name + '_chunkHash';

          // 每个contentHash计算结果会放在chunk.contentHash属性里面
          // 这里的key是因为源码就是这么写的
          chunk.contentHash = { 'javascript': 'contentHash' };
        }

      })
    })
  }

}

module.exports = HashPlugin
```


