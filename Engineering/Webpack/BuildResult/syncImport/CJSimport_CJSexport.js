
// 注意：这里是commonJS导入和commonJS导出情况

// 入口chunk代码./src/index.js
const title = require('./title')

// 被导入的js
module.exports = 'title'



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