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
var promiseDebug = GLOBAL_PRIVATE("Promise#debug");
var lastMicrotaskId = 0;



// 出口的Promise大类

var $Promise = function Promise(resolver) {
  // 错误检测
  if (resolver === promiseRaw) return;
  if (!C_$_IsConstructCall()) throw MakeTypeError('not_a_promise', [this]);
  if (!IS_SPEC_FUNCTION(resolver))
    throw MakeTypeError('resolver_not_a_function', [resolver]);

  // 给属性私有化？？（相当于去到PromiseSet）
  var promise = PromiseInit(this);

  // 初始时执行resolver入参函数
  // 对外提供的参数是两个函数resolve和reject函数，
  // 前者执行就是PromiseResolve(promise, x)执行，后者执行就是PromiseReject(promise, r)执行
  try {
    C_$DebugPushPromise(promise);
    resolver(function(x) { PromiseResolve(promise, x) }, function(r) { PromiseReject(promise, r) });
  } catch (e) {
    PromiseReject(promise, e);
  } finally {
    C_$DebugPopPromise();
  }
}


function PromiseSet(promise, status, value, onResolve, onReject) {
  SET_PRIVATE(promise, promiseStatus, status);
  SET_PRIVATE(promise, promiseValue, value);
  SET_PRIVATE(promise, promiseOnResolve, onResolve);
  SET_PRIVATE(promise, promiseOnReject, onReject);
  if (DEBUG_IS_ACTIVE) {
    C_$DebugPromiseEvent({ promise: promise, status: status, value: value });
  }
  return promise;
}


function PromiseInit(promise) {
  return PromiseSet(promise, 0, UNDEFINED, new InternalArray, new InternalArray)
}


function PromiseDone(promise, status, value, promiseQueue) {
  if (GET_PRIVATE(promise, promiseStatus) === 0) {
    PromiseEnqueue(value, GET_PRIVATE(promise, promiseQueue), status);
    PromiseSet(promise, status, value);
  }
}


function PromiseCoerce(constructor, x) {
  if (!IsPromise(x) && IS_SPEC_OBJECT(x)) {
    var then;
    try {
      then = x.then;
    } catch(r) {
      return C_$_CallFunction(constructor, r, PromiseRejected);
    }
    if (IS_SPEC_FUNCTION(then)) {
      var deferred = C_$_CallFunction(constructor, PromiseDeferred);
      try {
        C_$_CallFunction(x, deferred.resolve, deferred.reject, then);
      } catch(r) {
        deferred.reject(r);
      }
      return deferred.promise;
    }
  }
  return x;
}


function PromiseHandle(value, handler, deferred) {
  try {
    C_$DebugPushPromise(deferred.promise);
    var result = handler(value);
    if (result === deferred.promise)
      throw MakeTypeError('promise_cyclic', [result]);
    else if (IsPromise(result))
      C_$_CallFunction(result, deferred.resolve, deferred.reject, PromiseChain);
    else
      deferred.resolve(result);
  } catch (exception) {
    try { deferred.reject(exception); } catch (e) { }
  } finally {
    C_$DebugPopPromise();
  }
}


function PromiseEnqueue(value, tasks, status) {
  var id, name, instrumenting = DEBUG_IS_ACTIVE;
  C_$EnqueueMicrotask(function() {
    if (instrumenting) {
      C_$DebugAsyncTaskEvent({ type: "willHandle", id: id, name: name });
    }
    for (var i = 0; i < tasks.length; i += 2) {
      PromiseHandle(value, tasks[i], tasks[i + 1])
    }
    if (instrumenting) {
      C_$DebugAsyncTaskEvent({ type: "didHandle", id: id, name: name });
    }
  });
  if (instrumenting) {
    id = ++lastMicrotaskId;
    name = status > 0 ? "Promise.resolve" : "Promise.reject";
    C_$DebugAsyncTaskEvent({ type: "enqueue", id: id, name: name });
  }
}


function PromiseIdResolveHandler(x) { return x }
function PromiseIdRejectHandler(r) { throw r }
function PromiseNopResolver() {}

IsPromise = function IsPromise(x) {
  return IS_SPEC_OBJECT(x) && HAS_DEFINED_PRIVATE(x, promiseStatus);
}
PromiseCreate = function PromiseCreate() {
  return new $Promise(PromiseNopResolver)
}
PromiseResolve = function PromiseResolve(promise, x) {
  PromiseDone(promise, +1, x, promiseOnResolve)
}
PromiseReject = function PromiseReject(promise, r) {
  // Check promise status to confirm that this reject has an effect.
  // Check promiseDebug property to avoid duplicate event.
  if (DEBUG_IS_ACTIVE &&
      GET_PRIVATE(promise, promiseStatus) == 0 &&
      !HAS_DEFINED_PRIVATE(promise, promiseDebug)) {
    C_$DebugPromiseRejectEvent(promise, r);
  }
  PromiseDone(promise, -1, r, promiseOnReject)
}


function PromiseDeferred() {
  if (this === $Promise) {
    // Optimized case, avoid extra closure.
    var promise = PromiseInit(new $Promise(promiseRaw));
    return {
      promise: promise,
      resolve: function(x) { PromiseResolve(promise, x) },
      reject: function(r) { PromiseReject(promise, r) }
    };
  } else {
    var result = {};
    result.promise = new this(function(resolve, reject) {
      result.resolve = resolve;
      result.reject = reject;
    })
    return result;
  }
}

function PromiseResolved(x) {
  if (this === $Promise) {
    // Optimized case, avoid extra closure.
    return PromiseSet(new $Promise(promiseRaw), +1, x);
  } else {
    return new this(function(resolve, reject) { resolve(x) });
  }
}

function PromiseRejected(r) {
  if (this === $Promise) {
    // Optimized case, avoid extra closure.
    return PromiseSet(new $Promise(promiseRaw), -1, r);
  } else {
    return new this(function(resolve, reject) { reject(r) });
  }
}


PromiseChain = function PromiseChain(onResolve, onReject) {  // a.k.a.
                                                              // flatMap
  onResolve = IS_UNDEFINED(onResolve) ? PromiseIdResolveHandler : onResolve;
  onReject = IS_UNDEFINED(onReject) ? PromiseIdRejectHandler : onReject;
  var deferred = C_$_CallFunction(this.constructor, PromiseDeferred);
  switch (GET_PRIVATE(this, promiseStatus)) {
    case UNDEFINED:
      throw MakeTypeError('not_a_promise', [this]);
    case 0:  // Pending
      GET_PRIVATE(this, promiseOnResolve).push(onResolve, deferred);
      GET_PRIVATE(this, promiseOnReject).push(onReject, deferred);
      break;
    case +1:  // Resolved
      PromiseEnqueue(GET_PRIVATE(this, promiseValue),
                      [onResolve, deferred],
                      +1);
      break;
    case -1:  // Rejected
      PromiseEnqueue(GET_PRIVATE(this, promiseValue),
                      [onReject, deferred],
                      -1);
      break;
  }
  if (DEBUG_IS_ACTIVE) {
    C_$DebugPromiseEvent({ promise: deferred.promise, parentPromise: this });
  }
  return deferred.promise;
}
PromiseCatch = function PromiseCatch(onReject) {
  return this.then(UNDEFINED, onReject);
}
PromiseThen = function PromiseThen(onResolve, onReject) {
  onResolve = IS_SPEC_FUNCTION(onResolve) ? onResolve
                                          : PromiseIdResolveHandler;
  onReject = IS_SPEC_FUNCTION(onReject) ? onReject
                                        : PromiseIdRejectHandler;
  var that = this;
  var constructor = this.constructor;
  return C_$_CallFunction(
    this,
    function(x) {
      x = PromiseCoerce(constructor, x);
      return x === that ? onReject(MakeTypeError('promise_cyclic', [x])) :
              IsPromise(x) ? x.then(onResolve, onReject) : onResolve(x);
    },
    onReject,
    PromiseChain
  );
}


function PromiseCast(x) {
  // TODO(rossberg): cannot do better until we support @@create.
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
            // Nested scope to get closure over current i (and avoid .bind).
            // TODO(rossberg): Use for-let instead once available.
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


function PromiseHasRejectHandlerRecursive(promise) {
  var queue = GET_PRIVATE(promise, promiseOnReject);
  if (IS_UNDEFINED(queue)) return false;
  // Do a depth first search for a reject handler that's not
  // the default PromiseIdRejectHandler.
  for (var i = 0; i < queue.length; i += 2) {
    if (queue[i] != PromiseIdRejectHandler) return true;
    if (PromiseHasRejectHandlerRecursive(queue[i + 1].promise)) return true;
  }
  return false;
}
PromiseHasRejectHandler = function PromiseHasRejectHandler() {
  // Mark promise as already having triggered a reject event.
  SET_PRIVATE(this, promiseDebug, true);
  return PromiseHasRejectHandlerRecursive(this);
};

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
