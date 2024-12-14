
// 注意：这里是es6Module导入和commonJS导出情况

// 入口chunk代码./src/index.js
import title,{age} from './title'
console.log(title);
console.log(age);

// 被导入的js
module.exports = {
  name: 'title_name',
  age: 'title_age',
}


// 下面是导出结果

(() => {

  // ! 大对象
  // （树大对象导出js不变（因为是commonJS导出的，直接改写了exports），入口js变化了，加了n方法）
  var __webpack_modules__ = {
    "./src/title.js": (module) => {
      module.exports = {
        name: "title_name",
        age: "title_age",
      };
    },
  };


  // ! 核心迭代函数
  var __webpack_module_cache__ = {};
  function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    var module = (__webpack_module_cache__[moduleId] = {
      exports: {},
    });

    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

    return module.exports;
  }


  // ! n方法
  // 2. n方法：对【默认】的commonJS和esModule的导出做抹平差异化
  (() => {
    __webpack_require__.n = (module) => {

      //这里在抹平esModule和commonJS的差异
      // 前者拿取default值指的是拿export default的值，通过default挂在exports对象上面
      // 后者拿default值（其实没有default值的概念）指的是拿整个被改写的exports对象
      var getter =
        module && module.__esModule ? () => module["default"] : () => module;

      // 为什么要这样？不用d方法直接返回getter不行吗？为什么要挂一个属性到getter上面？
      // 不知道为什么要挂属性！只知道a作为属性名尽可能短！
      __webpack_require__.d(getter, { a: getter });
      return getter;
    };
  })();


  // ! d方法
  (() => {
    __webpack_require__.d = (exports, definition) => {
      for (var key in definition) {
        if (
          __webpack_require__.o(definition, key) &&
          !__webpack_require__.o(exports, key)
        ) {
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key],
          });
        }
      }
    };
  })();


  // ! o方法
  (() => {
    __webpack_require__.o = (obj, prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop);
  })();


  // ! r方法
  (() => {
    __webpack_require__.r = (exports) => {
      if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      }
      Object.defineProperty(exports, "__esModule", { value: true });
    };
  })();

  var __webpack_exports__ = {};


  // ! 入口chunk代码./src/index.js
  // 1. 入口js：拿到exports对象和default值（因为import title from './title'，这里没有加括号，相当于告诉程序我要default值）
  (() => {
    "use strict";
    __webpack_require__.r(__webpack_exports__);

    // 直接拿到exports对象
    var _title__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/title.js");
    // 接着拿到default值
    // 先去做抹平差异化处理，要么得到exports对象的default值，要么得到exports对象（commonJS没有default值）
    var _title__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(
      _title__WEBPACK_IMPORTED_MODULE_0__
    );

    // 取用default变量时，调用n方法返回的getter函数（实际上就是返回exports或exports['default']）
    console.log(_title__WEBPACK_IMPORTED_MODULE_0___default());
    // 取用对象里面的变量，直接用exports对象
    console.log(_title__WEBPACK_IMPORTED_MODULE_0__.age);
  })();
})();


