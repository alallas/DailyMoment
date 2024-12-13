
// 注意：这里是commonJS导入和es6Module导出情况

// 入口chunk代码./src/index.js
const title = require('./title')
console.log(content)
// 拿到的是 { age: 'title_age', default: 'title' }
// 因此要拿default的value就必须写出content.default

// 被导入的js
export default 'title'
export const age = 'title_age'




// 打包js内的树对象的（导出js）
var __webpack_modules__ = ({
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
})




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



// 入口chunk代码./src/index.js
const title = require('./title')
console.log(content)


