// 外部写法

const func = _asyncToGenerator(_regeneratorRuntime.mark(function _callee() {
  return _regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        return _context.abrupt("return", 1);
      case 1:
      case "end":
        return _context.stop();
    }
  }, _callee);
}));


// 简写版本
const func$ = _asyncToGenerator(
  mark(function _callee() {
    return wrap(function _callee$(_context) {
      // 状态机逻辑：通过 while/switch 模拟生成器的暂停/恢复
      while (1) {
        switch (_context.prev = _context.next) {
          case 0: // 对应第一个 yield 或代码块
            return _context.abrupt("return", 1); // 相当于 return 1
          case 1: // 结束状态
            return _context.stop();
        }
      }
    }, _callee);
  })
);




// 内部原理
// 伪代码，概念性的

// 1. _regeneratorRuntime.mark：标记一个生成器函数
function mark(generator) {
  // 本质：让生成器函数继承 Generator 原型，使其可被迭代
  generator.prototype = Object.create(GeneratorPrototype);
  return generator;
}

// 2. _regeneratorRuntime.wrap：包装生成器函数为一个状态机
function wrap(generatorLogic, context) {
  // 返回一个生成器函数，内部用状态机模拟 yield/return
  return function () {
    const _context = {
      prev: 0,      // 当前状态（对应 case 数字）
      next: 0,      // 下一个状态
      sent: undefined, // yield 接收的值
      stop: function() { /* 终止生成器 */ }
    };

    // 返回一个生成器对象，包含 next/throw 方法
    return {
      next(val) {
        _context.sent = val;
        // 执行 generatorLogic，根据 _context.prev 跳转到对应 case
        const result = generatorLogic(_context);
        return { value: result.value, done: result.done };
      },
      throw(err) { /* 处理错误 */ }
    };
  };
}

// 3. _asyncToGenerator：驱动生成器自动执行
function _asyncToGenerator(generatorFn) {
  return function () {
    const generator = generatorFn(); // 生成器对象（来自 wrap）
    return new Promise((resolve, reject) => {
      function step(key, arg) {
        try {
          const { value, done } = generator[key](arg);
          if (done) {
            resolve(value);
          } else {
            Promise.resolve(value).then(
              val => step("next", val),
              err => step("throw", err)
            );
          }
        } catch (error) {
          reject(error);
        }
      }
      step("next");
    });
  };
}


