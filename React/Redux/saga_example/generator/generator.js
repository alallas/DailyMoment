// ES6的写法
// function* generatorExample() {
//   console.log("开始");
//   const firstYield = yield "第一次暂停";
//   console.log("第一次恢复", firstYield);
//   const secondYield = yield "第二次暂停";
//   console.log("第二次恢复", secondYield);
//   console.log("结束");
// }

// ES5的写法

const _regeneratorRuntime = require("./_regeneratorRuntime");


var _marked = _regeneratorRuntime.mark(generatorExample);

function generatorExample() {
  var firstYield, secondYield;
  return _regeneratorRuntime.wrap(function generatorExample$(_context) {
    while (1)
      switch ((_context.prev = _context.next)) {
        case 0:
          console.log("开始");
          _context.next = 3;
          return "第一次暂停";
        case 3:
          firstYield = _context.sent;
          console.log("第一次恢复", firstYield);
          _context.next = 7;
          return "第二次暂停";
        case 7:
          secondYield = _context.sent;
          console.log("第二次恢复", secondYield);
          console.log("结束");
        case 10:
        case "end":
          return _context.stop();
      }
  }, _marked);
}

debugger;
const it = generatorExample();
console.log(it.next());
console.log(it.next("a"));
console.log(it.next("b"));
