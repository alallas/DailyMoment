
// 注意：这里是es6Module导入和es6Module导出情况

// 入口chunk代码./src/index.js
import title,{age} from './title'

// 被导入的js
export default 'title'
export const age = 'title_age'




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



// ......其他和commonJS导入和es6Module导出的情况差不多


