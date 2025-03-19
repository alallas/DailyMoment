// PS:
// 在 Chromium V8 引擎的源码中，类似%CheckIsBootstrapping()的写法，
// %符号是 V8 源码中用于标记 内部运行时函数 的特殊前缀。
// 这些函数是 V8 引擎本身的组成部分，通常用 C++ 实现，而非 JavaScript 代码。
// 它们提供了对 JavaScript 运行时底层行为的直接控制（如堆栈、内存管理、类型检查等）。

// 在这里面，为了防止爆出红色，我把 % 统一替换为 C_$


var IsPromise;
var PromiseCreate;
var PromiseResolve;
var PromiseReject;
var PromiseChain;
var PromiseCatch;
var PromiseThen;
var PromiseHasRejectHandler;

// Status values: 0 = pending, +1 = resolved, -1 = rejected
var promiseStatus = GLOBAL_PRIVATE("Promise#status");
var promiseValue = GLOBAL_PRIVATE("Promise#value");
var promiseOnResolve = GLOBAL_PRIVATE("Promise#onResolve");
var promiseOnReject = GLOBAL_PRIVATE("Promise#onReject");
var promiseRaw = GLOBAL_PRIVATE("Promise#raw");
var lastMicrotaskId = 0;



// REVIEW - 外部手动初始化第一个promise实例



// 一、Promise大类（对外出口的）
var $Promise = function Promise(resolver) {
  // 错误检测
  if (resolver === promiseRaw) return;
  if (!C_$_IsConstructCall()) throw MakeTypeError('not_a_promise', [this]);
  if (!IS_SPEC_FUNCTION(resolver))
    throw MakeTypeError('resolver_not_a_function', [resolver]);

  // 给属性私有化？？（相当于去到PromiseSet）
  var promise = PromiseInit(this);

  // 初始时执行resolver入参函数
  // 对外提供的参数是两个函数resolve和reject函数，前者执行就是PromiseResolve(promise, x)执行，后者执行就是PromiseReject(promise, r)执行
  // 然后在执行这个resolver入参函数的时候执行一些需要等待的东西，并自己定义好什么时候算等待完毕，这个时候就手动写上resolve函数！
  // 完了之后同步代码部分继续执行返回的promise的then方法
  try {
    resolver(function(x) { PromiseResolve(promise, x) }, function(r) { PromiseReject(promise, r) });
  } catch (e) {
    PromiseReject(promise, e);
  } finally {
  }
}


function PromiseInit(promise) {
  // 创建空回调队列 onResolve 和 onReject
  return PromiseSet(promise, 0, undefined, new InternalArray, new InternalArray)
}


function PromiseSet(promise, status, value, onResolve, onReject) {
  SET_PRIVATE(promise, promiseStatus, status);
  SET_PRIVATE(promise, promiseValue, value);
  SET_PRIVATE(promise, promiseOnResolve, onResolve);
  SET_PRIVATE(promise, promiseOnReject, onReject);
  return promise;
}



// 把所有的传入对象都统一为promise类的实例
// 处理thenable对象，即那些具有then方法但并非标准Promise的对象，使其能够适配到Promise链中
function PromiseCoerce(constructor, x) {
  // 这个x应该就是外面new Promise生成的组件实例
  // 如果发现x不是一个promise实例的话，要让他成为一个promise实例
  if (!IsPromise(x) && IS_SPEC_OBJECT(x)) {
    // 1. 尝试拿到then方法
    var then;
    try {
      then = x.then;
    } catch(r) {
      return C_$_CallFunction(constructor, r, PromiseRejected);
    }

    if (IS_SPEC_FUNCTION(then)) {
      // 2. 能够找到则执行PromiseDeferred函数，返回三件套对象
      // （此时这个C_$_CallFunction函数执行时的上下文是当前的实例的constructor对象）
      var deferred = C_$_CallFunction(constructor, PromiseDeferred);
      // 然后执行resolve和reject函数？？？
      try {
        C_$_CallFunction(x, deferred.resolve, deferred.reject, then);
      } catch(r) {
        deferred.reject(r);
      }
      // 返回这个promise对象
      return deferred.promise;
    }
  }
  // 如果是一个实例直接返回他
  return x;
}






// REVIEW - then方法

// !把函数保存到【这个类实例】的某个属性里面（注意是这个类实例），而不是直接放入微任务！！





// 二、then函数-第一辑
PromiseThen = function PromiseThen(onResolve, onReject) {
  // 统一入参函数的格式！
  onResolve = IS_SPEC_FUNCTION(onResolve) ? onResolve : PromiseIdResolveHandler;
  onReject = IS_SPEC_FUNCTION(onReject) ? onReject : PromiseIdRejectHandler;

  var that = this;
  var constructor = this.constructor;

  // 下面这个c语言的_CallFunction函数是在一参上下文的情况下执行二参函数
  // 入参：
  // 第一参数是 函数执行的上下文（当前在外部new之后产生的实例）
  // 第二参数是 要调用的函数
  // 第三参数是 错误回调
  // 第四参数是 链式类型（如 PromiseChain，标识后续处理逻辑）
  return C_$_CallFunction(
    this,
    function(x) {
      // x 是前一个 Promise 的解决值（比如这里初始的时候可能传入this的promiseValue属性，为undefined）
      // 统一传入的参数（即前一个 Promise 的解决值）为promise类的实例
      // （处理thenable对象，即那些具有then方法但并非标准Promise的对象，使其能够适配到Promise链中）
      x = PromiseCoerce(constructor, x);

      // 处理存在 Promise 循环引用的问题，也就是某个 Promise 对象试图解析自身（即 Promise A 调用 .then() 并返回自己）
      // 又或者比如：const p = new Promise(resolve => resolve(p)); // p 的 resolve 返回自身

      // 如果循环引用了，直接就执行then方法/resolve，然后退出了
      return x === that
        ? onReject(MakeTypeError('promise_cyclic', [x]))
        : IsPromise(x) ? x.then(onResolve, onReject) : onResolve(x);
    },
    onReject,
    // 接下来执行的函数，也是then函数的真正逻辑所在！
    PromiseChain
  );
}



// 二、then函数-第二辑
function PromiseChain(onResolve, onReject) {
  // 统一入参函数（有时候没写错误函数就用默认值）
  onResolve = IS_UNDEFINED(onResolve) ? PromiseIdResolveHandler : onResolve;
  onReject = IS_UNDEFINED(onReject) ? PromiseIdRejectHandler : onReject;

  // 执行PromiseDeferred拿到三件套对象
  // {
  //   promise: promise,
  //   resolve: function(x) { PromiseResolve(promise, x) },
  //   reject: function(r) { PromiseReject(promise, r) }
  // };

  // 每then一下都会生成一个全新的三件套对象（里面的promise是一个新的promise）
  var deferred = C_$_CallFunction(this.constructor, PromiseDeferred);

  // 拿到promiseStatus的属性
  switch (GET_PRIVATE(this, promiseStatus)) {
    case UNDEFINED:
      throw MakeTypeError('not_a_promise', [this]);
    // pending状态，存入re和rj函数
    // 注意每个队列分别传入的是两个东西！（【当前的外部手写的处理函数】和【“下一个实例”的三件套对象】）
    case 0:
      GET_PRIVATE(this, promiseOnResolve).push(onResolve, deferred);
      GET_PRIVATE(this, promiseOnReject).push(onReject, deferred);
      break;
    // resolved状态
    // 这个时候适用于那些直接在初始化promise的函数中写了同步resolve()的情况
    // 于是第二个参数的队列就即刻新建，给出这个时候在then里面的函数
    case +1:
      PromiseEnqueue(GET_PRIVATE(this, promiseValue), [onResolve, deferred], +1);
      break;
    // rejected状态
    case -1:
      PromiseEnqueue(GET_PRIVATE(this, promiseValue), [onReject, deferred], -1);
      break;
  }
  // 注意then函数返回的是一个新的promise
  return deferred.promise;
}



function PromiseDeferred() {
  // 一般只有在执行then函数的时候才会重新创造一个promise实例
  if (this === $Promise) {
    // 新建一个实例，返回一个三件套对象
    var promise = PromiseInit(new $Promise(promiseRaw));
    return {
      promise: promise,
      resolve: function(x) { PromiseResolve(promise, x) },
      reject: function(r) { PromiseReject(promise, r) }
    };
  } else {
    // 不然的话返回一个自定义的三件套对象
    // 这种情况很少吧！！（thenable对象？？）
    var result = {};
    result.promise = new this(function(resolve, reject) {
      result.resolve = resolve;
      result.reject = reject;
    })
    return result;
  }
}

// !后续!
// 执行完then方法之后，会把原来的主代码的余下同步函数继续完成执行
// 等到调用栈为空，这个时候【初始化promise里面的函数】已经执行完了（在另一个线程）
// 然后执行里面的函数，然后resolve（目标值）



// REVIEW - 执行resolve()
// 一种情况是：【初始化Promise内部】的【异步函数】处理完成之后来到这里，第二个参数就是自己手写的需要的值
// 一种情况是：then内部函数返回了一个值（不管是什么值，只要有返回值！）就继续来到这里
  // 第一个参数是这个then生成的promise实例
  // 第二个参数就是这个返回值

// 有一个问题，promiseOnResolve一直都在被push函数，
// 比如第一次进来的是第一个then的入参函数，然后第一次执行done放入队列，
// 后面队列函数也执行完了，通过返回值再次进来这里，这个时候的promiseQueue还是有着第一个then的入参函数？？

// !回答：不对，两者不是一个队列，假设一个promise对象有两个then函数
// 先初始化promise函数，然后执行then（status为0），一then内函数和下一个promise对象（就是一then本身生成的实例）放入【初始化promise实例】队列，
// 然后再次执行then（status为0），二then内函数和下一个promise对象（就是二then本身生成的实例）放入【一then本身生成的实例】队列
// 也就是说一开始所有的promise的内部队列都有值了，只是最后一个promise队列没有值

// 相当于：
// 第一个promise实例的处理是：手动创建实例——>执行then放入实例队列（多个then）——>第一实例队列添加到微任务（state变为1）——>后续执行
// 第二个promise实例的处理是：（自动在前面then处创建实例）——>第二实例队列添加到微任务（state变为1）——>后续执行



function PromiseResolve(promise, x) {
  PromiseDone(promise, +1, x, promiseOnResolve)
}

function PromiseReject(promise, r) {
  PromiseDone(promise, -1, r, promiseOnReject)
}


function PromiseDone(promise, status, value, promiseQueue) {
  // 入参：
  // value是要获取的目标值，也就是在外部初始化实例过程中执行resolve时传入的值
  // status是状态，从PromiseResolve过来传入的是1，另一个是-1
  // promise是当前的实例，也就是外部初始化的时候创建的实例
  // promiseQueue是相应的promiseResolve/Reject队列

  if (GET_PRIVATE(promise, promiseStatus) === 0) {
    // 如果当前的状态是pending的，允许更新
    // 1. 把要执行的promiseResolve/Reject队列函数放入微任务中！
    // 注意！这个时候才放入微任务！
    PromiseEnqueue(value, GET_PRIVATE(promise, promiseQueue), status);
    // 2. 放完之后，立刻设置最新状态和目标值到本实例中
    PromiseSet(promise, status, value);
  }
}


// !后续!
// 执行完这个done函数之后，如果后面还有同步代码，就需要继续执行
// 然后才能进入下一轮，此时是第二轮





// REVIEW - 把要执行的promiseResolve/Reject队列函数（受到包装的）放入微任务中！

// !（之前在then把自己写的【结束处理函数】加入到了【promiseOnResolve/Reject队列】）



// 实际上是把任务队列函数进行了一个包装，然后放入微任务的！
function PromiseEnqueue(value, tasks, status) {
  // 入参：
  // value是实例的promiseValue属性
  // tasks是任务队列
    // 从chain过来的是[外部then传入的resolve/reject的函数，三件套对象]
    // 从done过来的是promiseOnResolve/Reject队列！
  // status是pending还是resolved还是rejected

  // C_$EnqueueMicrotask说明下面是被setTimeOut包裹的！
  C_$EnqueueMicrotask(function() {
    // 针对一个小组合即（【外部then传入的resolve的函数】和【三件套对象】）进行处理
    for (var i = 0; i < tasks.length; i += 2) {
      PromiseHandle(value, tasks[i], tasks[i + 1])
    }
  });
}




function PromiseHandle(value, handler, deferred) {
  // 入参：
  // value是实例的promiseValue属性
  // handler是【外部then传入的resolve/reject的函数】
  // deferred是【三件套对象】
  try {

    // 执行外部传入的函数，给到实例的promiseValue属性作为参数
    // 一般来说这个时候就能拿到想要的东西了，然后setState或保存到别的地方，一般不会有返回值
    // 如果有返回值，那就传递给【这个then方法所生成的新promise】的resolve函数
    var result = handler(value);

    // 得到结果，判断这个结果是否还是一个同样的promise对象，
    // 也就是在then的入参函数里面写返回他前面的那个promise实例
    if (result === deferred.promise)
      throw MakeTypeError('promise_cyclic', [result]);

    else if (IsPromise(result))
      // 如果还是一个promise，就执行【下一个实例的三件套】里面存着的resolve函数
      // 也就是function(x) { PromiseResolve(promise, x) }，这个里面的x就是result结果，然后继续去chain那边
      C_$_CallFunction(result, deferred.resolve, deferred.reject, PromiseChain);

      else
      // 不是的话直接执行【下一个实例的三件套】里面存着的resolve函数
      // 也就是function(x) { PromiseResolve(promise, x) }，这个里面的x就是result
      deferred.resolve(result);

  } catch (exception) {
    try { deferred.reject(exception); } catch (e) { }
  } finally {
  }
}




// REVIEW - 常用的函数：Promise.resolve()、Promise.all()、Promise.race()




// 这个就是Promise.resolve()函数
function PromiseCast(x) {
  return IsPromise(x) ? x : new this(function(resolve) { resolve(x) });
}


function PromiseAll(values) {
  var deferred = C_$_CallFunction(this, PromiseDeferred);
  var resolutions = [];
  if (!C_$_IsArray(values)) {
    deferred.reject(MakeTypeError('invalid_argument'));
    return deferred.promise;
  }
  try {
    var count = values.length;
    if (count === 0) {
      deferred.resolve(resolutions);
    } else {
      for (var i = 0; i < values.length; ++i) {
        this.resolve(values[i]).then(
          (function() {
            var i_captured = i;
            return function(x) {
              resolutions[i_captured] = x;
              if (--count === 0) deferred.resolve(resolutions);
            };
          })(),
          function(r) { deferred.reject(r) }
        );
      }
    }
  } catch (e) {
    deferred.reject(e)
  }
  return deferred.promise;
}


// 这个就是Promise.race()函数
function PromiseOne(values) {
  var deferred = C_$_CallFunction(this, PromiseDeferred);
  if (!C_$_IsArray(values)) {
    deferred.reject(MakeTypeError('invalid_argument'));
    return deferred.promise;
  }
  try {
    for (var i = 0; i < values.length; ++i) {
      this.resolve(values[i]).then(
        function(x) { deferred.resolve(x) },
        function(r) { deferred.reject(r) }
      );
    }
  } catch (e) {
    deferred.reject(e)
  }
  return deferred.promise;
}






// REVIEW - 其他函数





function PromiseIdResolveHandler(x) { return x }
function PromiseIdRejectHandler(r) { throw r }
function PromiseNopResolver() {}


function IsPromise(x) {
  return IS_SPEC_OBJECT(x) && HAS_DEFINED_PRIVATE(x, promiseStatus);
}

function PromiseCreate() {
  return new $Promise(PromiseNopResolver)
}


function PromiseResolved(x) {
  if (this === $Promise) {
    return PromiseSet(new $Promise(promiseRaw), +1, x);
  } else {
    return new this(function(resolve, reject) { resolve(x) });
  }
}

function PromiseRejected(r) {
  if (this === $Promise) {
    return PromiseSet(new $Promise(promiseRaw), -1, r);
  } else {
    return new this(function(resolve, reject) { reject(r) });
  }
}

function PromiseCatch(onReject) {
  return this.then(UNDEFINED, onReject);
}



function PromiseHasRejectHandlerRecursive(promise) {
  var queue = GET_PRIVATE(promise, promiseOnReject);
  if (IS_UNDEFINED(queue)) return false;
  for (var i = 0; i < queue.length; i += 2) {
    if (queue[i] != PromiseIdRejectHandler) return true;
    if (PromiseHasRejectHandlerRecursive(queue[i + 1].promise)) return true;
  }
  return false;
}


function PromiseHasRejectHandler() {
  // Mark promise as already having triggered a reject event.
  SET_PRIVATE(this, promiseDebug, true);
  return PromiseHasRejectHandlerRecursive(this);
};







// REVIEW - 对外的函数名字重设






C_$CheckIsBootstrapping();
C_$AddNamedProperty(global, 'Promise', $Promise, DONT_ENUM);
InstallFunctions($Promise, DONT_ENUM, [
  "defer", PromiseDeferred,
  "accept", PromiseResolved,
  "reject", PromiseRejected,
  "all", PromiseAll,
  "race", PromiseOne,
  "resolve", PromiseCast
]);
InstallFunctions($Promise.prototype, DONT_ENUM, [
  "chain", PromiseChain,
  "then", PromiseThen,
  "catch", PromiseCatch
]);



