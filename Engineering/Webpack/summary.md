
## 导包类型
### common.js
1. 使用require()导入其他JS
2. 使用module.exports = xxxx导出本JS

### es6Module
1. 使用import xx from xx导入其他JS
2. 使用export const xx = xx  或者  export default xx  导出本JS


## 打包
### 前提
webpack默认的是用commonJS的方式，所以对于其他导包类型，都会最终变成module.exports对象上面的东西

### common.js导入+common.js导出

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


### common.js导入+es6Module导出

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

### es6Module导入+es6Module导出
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


### es6Module导入+common.js导出
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








