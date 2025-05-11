// REVIEW - 创建仓库！


function configureStore(options) {
  // 入参：
  // reducer的集合、middleware的集合

  // 返回一个拿到默认中间件的函数，后面要在middleware属性那边传入给外部使用的
  const getDefaultMiddleware = buildGetDefaultMiddleware();

  const {
    reducer = void 0,
    middleware,
    devTools = true,
    duplicateMiddlewareCheck = true,
    preloadedState = void 0,
    enhancers = void 0,
  } = options || {};

  // 一、处理所有reducer
  let rootReducer;
  if (typeof reducer === "function") {
    // 这种情况就是，已经在外部执行了combineReducers，然后把函数的结果传递给reducer
    rootReducer = reducer;
  } else if (isPlainObject(reducer)) {
    // 检查reducer必须是一个纯对象
    // 【见normal_whole_flow.js那边的 combineReducers 函数】
    // 初始化所有的reducer函数（返回一个遍历执行函数）
    // 注意：这里没有传入extraReducer的东西
    // （他的处理放在了dispatch之后，真正执行某个reducer函数的时候）
    rootReducer = combineReducers(reducer);
  } else {
    throw new Error(
      process.env.NODE_ENV === "production"
        ? formatProdErrorMessage(1)
        : "`reducer` is a required argument, and must be a function or an object of functions that can be passed to combineReducers"
    );
  }

  // 二、处理所有的middleware
  // 2.1 初始化得到中间件数组
  if (
    process.env.NODE_ENV !== "production" &&
    middleware &&
    typeof middleware !== "function"
  ) {
    throw new Error(
      process.env.NODE_ENV === "production"
        ? formatProdErrorMessage(2)
        : "`middleware` field must be a callback"
    );
  }
  let finalMiddleware;
  if (typeof middleware === "function") {
    // 如果中间件是一个函数，执行这个函数，对外部提供一个入参来进行外部的配置，返回的是中间件数组
    // 一般中间件就加在返回值的后面.concat([中间件])
    finalMiddleware = middleware(getDefaultMiddleware);
    if (
      process.env.NODE_ENV !== "production" &&
      !Array.isArray(finalMiddleware)
    ) {
      throw new Error(
        process.env.NODE_ENV === "production"
          ? formatProdErrorMessage(3)
          : "when using a middleware builder function, an array of middleware must be returned"
      );
    }
  } else {
    // 如果middleware是一个数组，就执行getDefaultMiddleware()，返回一个中间件数组
    finalMiddleware = getDefaultMiddleware();
  }

  // 2.2 检测中间件的格式和重复问题（set解决）
  if (
    process.env.NODE_ENV !== "production" &&
    finalMiddleware.some((item) => typeof item !== "function")
  ) {
    throw new Error(
      process.env.NODE_ENV === "production"
        ? formatProdErrorMessage(4)
        : "each middleware provided to configureStore must be a function"
    );
  }
  if (process.env.NODE_ENV !== "production" && duplicateMiddlewareCheck) {
    let middlewareReferences = new Set();
    finalMiddleware.forEach((middleware2) => {
      if (middlewareReferences.has(middleware2)) {
        throw new Error(
          process.env.NODE_ENV === "production"
            ? formatProdErrorMessage(42)
            : "Duplicate middleware references found when creating the store. Ensure that each middleware is only included once."
        );
      }
      middlewareReferences.add(middleware2);
    });
  }

  // 2.3 增强中间件
  let finalCompose = compose;
  if (devTools) {
    finalCompose = composeWithDevTools({
      trace: process.env.NODE_ENV !== "production",
      ...(typeof devTools === "object" && devTools),
    });
  }
  // 【见normal_whole_flow.js那边的 applyMiddleware函数】
  // 返回一个(createStore) => (reducer, preloadedState) => {/** 增强dispatch函数 */}
  const middlewareEnhancer = applyMiddleware(...finalMiddleware);
  // 得到一个获取默认增强器的函数，函数返回一个数组，汇集所有增强器
  const getDefaultEnhancers = buildGetDefaultEnhancers(middlewareEnhancer);
  
  // 三、处理所有的增强器enhancers
  // 3.1 检验格式
  if (
    process.env.NODE_ENV !== "production" &&
    enhancers &&
    typeof enhancers !== "function"
  ) {
    throw new Error(
      process.env.NODE_ENV === "production"
        ? formatProdErrorMessage(5)
        : "`enhancers` field must be a callback"
    );
  }

  // 3.2 初始化，没有外部的增强器就执行默认的，得到一个增强器数组
  let storeEnhancers =
    typeof enhancers === "function"
      ? enhancers(getDefaultEnhancers)
      : getDefaultEnhancers();
  if (process.env.NODE_ENV !== "production" && !Array.isArray(storeEnhancers)) {
    throw new Error(
      process.env.NODE_ENV === "production"
        ? formatProdErrorMessage(6)
        : "`enhancers` callback must return an array"
    );
  }
  if (
    process.env.NODE_ENV !== "production" &&
    storeEnhancers.some((item) => typeof item !== "function")
  ) {
    throw new Error(
      process.env.NODE_ENV === "production"
        ? formatProdErrorMessage(7)
        : "each enhancer provided to configureStore must be a function"
    );
  }
  if (
    process.env.NODE_ENV !== "production" &&
    finalMiddleware.length &&
    !storeEnhancers.includes(middlewareEnhancer)
  ) {
    console.error(
      "middlewares were provided, but middleware enhancer was not included in final enhancers - make sure to call `getDefaultEnhancers`"
    );
  }

  // 3.3 最后内外层层包裹增强器的数组
  const composedEnhancer = finalCompose(...storeEnhancers);

  // 然后调用redux原生的createStore方法
  return createStore(rootReducer, preloadedState, composedEnhancer);
}





// REVIEW - 下面是【一、处理所有reducer】里面的一个函数
// 判断reducer对象是否一个纯对象

function isPlainObject(obj) {
  if (typeof obj !== "object" || obj === null)
    return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto || Object.getPrototypeOf(obj) === null;
}
// 另一个相同功能的函数
// function isPlainObject(value) {
//   if (!value || typeof value !== "object")
//     return false;
//   const proto = getPrototypeOf(value);
//   if (proto === null) {
//     return true;
//   }
//   const Ctor = Object.hasOwnProperty.call(proto, "constructor") && proto.constructor;
//   if (Ctor === Object)
//     return true;
//   return typeof Ctor == "function" && Function.toString.call(Ctor) === objectCtorString;
// }







// REVIEW - 下面是【二、处理所有的middleware 里面的 2.1 初始化得到中间件数组】里面的一个函数

// 返回一个函数，这个函数是拿到默认的中间件数组，可在外部自定义加上别的中间件（通过.concat）
// 如果外部没有设置属性，只是concat了saga函数，那么最终返回的middleware数组是:
// [ActionCreatorCheck中间件函数、immutableCheck中间件函数、thunk中间件函数、SerializableCheck中间件函数、saga中间件函数]
var buildGetDefaultMiddleware = () =>
  function getDefaultMiddleware(options) {
    // 外部如果有中间件就来这里执行
    // 这里的options就是自己外面传的
    const {
      thunk = true, // 是否启用thunk中间件
      immutableCheck = true, // 是否启用 Redux 不可变状态检查
      serializableCheck = true, // 是否启用可序列化状态和 action 检查（不可序列化的值（如函数、Promise、Symbol 等））
      actionCreatorCheck = true, // 是否启用 action creator 检查
    } = options ?? {};

    // 创建一个中间件数组
    let middlewareArray = new Tuple();
    if (thunk) {
      if (isBoolean(thunk)) {
        middlewareArray.push(thunkMiddleware);
      } else {
        // 这说明thunk还能是一个对象：
        // {
        //   extraArgument: 'xxxxx'
        // }
        // 在thunk中间件那边用的是action(dispatch, getState, extraArgument)
        // 在末尾加入中间件函数
        middlewareArray.push(withExtraArgument(thunk.extraArgument));
      }
    }

    // 开发环境下会检测：
    if (process.env.NODE_ENV !== "production") {
      if (immutableCheck) {
        let immutableOptions = {};
        if (!isBoolean(immutableCheck)) {
          immutableOptions = immutableCheck;
        }
        // 如果需要检测 Redux 不可变状态，就要给数组前面加上一个检测函数
        middlewareArray.unshift(
          createImmutableStateInvariantMiddleware(immutableOptions)
        );
      }
      if (serializableCheck) {
        let serializableOptions = {};
        if (!isBoolean(serializableCheck)) {
          serializableOptions = serializableCheck;
        }
        // 如果需要检测 可序列化状态，就要给数组后面加上一个检测函数
        middlewareArray.push(
          createSerializableStateInvariantMiddleware(serializableOptions)
        );
      }
      if (actionCreatorCheck) {
        let actionCreatorOptions = {};
        if (!isBoolean(actionCreatorCheck)) {
          actionCreatorOptions = actionCreatorCheck;
        }
        // 如果需要检测 action creator 的格式，就要给数组前面加上一个检测函数
        middlewareArray.unshift(
          createActionCreatorInvariantMiddleware(actionCreatorOptions)
        );
      }
    }
    return middlewareArray;
  };


// 增强array数组
var Tuple = class _Tuple extends Array {
  constructor(...items) {
    super(...items);
    Object.setPrototypeOf(this, _Tuple.prototype);
  }
  static get [Symbol.species]() {
    return _Tuple;
  }
  concat(...arr) {
    return super.concat.apply(this, arr);
  }
  prepend(...arr) {
    if (arr.length === 1 && Array.isArray(arr[0])) {
      return new _Tuple(...arr[0].concat(this));
    }
    return new _Tuple(...arr.concat(this));
  }
};





// REVIEW - 下面是一些用于【检测】的中间件

// 检测中间件一：检查action格式


function createActionCreatorInvariantMiddleware(options = {}) {
  if (process.env.NODE_ENV === "production") {
    return () => (next) => (action) => next(action);
  }
  const {
    isActionCreator: isActionCreator2 = isActionCreator
  } = options;

  // 返回一个用于检测的中间件函数
  return () => (next) => (action) => {
    // 首先判断action是否合规（是否是一个函数）
    if (isActionCreator2(action)) {
      console.warn(getMessage(action.type));
    }
    // 合规直接去下一个中间件，Immutable那个
    return next(action);
  };
}

function isActionCreator(action) {
  return typeof action === "function" && "type" in action && hasMatchFunction(action);
}






// 检测中间件二：state的不可变性

function createImmutableStateInvariantMiddleware(options = {}) {
  if (process.env.NODE_ENV === "production") {
    return () => (next) => (action) => next(action);
  } else {
    let stringify2 = function(obj, serializer, indent, decycler) {
      return JSON.stringify(obj, getSerialize2(serializer, decycler), indent);
    };
    let getSerialize2 = function(serializer, decycler) {
      let stack = [], keys = [];
      if (!decycler) decycler = function(_, value) {
        if (stack[0] === value) return "[Circular ~]";
        return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
      };
      return function(key, value) {
        if (stack.length > 0) {
          var thisPos = stack.indexOf(this);
          ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
          ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
          if (~stack.indexOf(value)) value = decycler.call(this, key, value);
        } else stack.push(value);
        return serializer == null ? value : serializer.call(this, key, value);
      };
    };
    var stringify = stringify2, getSerialize = getSerialize2;
    let {
      isImmutable = isImmutableDefault,
      ignoredPaths,
      warnAfter = 32
    } = options;

    const track = trackForMutations.bind(null, isImmutable, ignoredPaths);
    
    return ({ getState }) => {
      let state = getState();
      let tracker = track(state);
      let result;

      return (next) => (action) => {
        // 获得检查时间的工具箱
        const measureUtils = getTimeMeasureUtils(warnAfter, "ImmutableStateInvariantMiddleware");
        
        // 检查 dispatch 前的状态是否被修改
        measureUtils.measureTime(() => {
          state = getState();
          result = tracker.detectMutations();
          tracker = track(state);
          if (result.wasMutated) {
            throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(19) : `A state mutation was detected between dispatches, in the path '${result.path || ""}'.  This may cause incorrect behavior. (https://redux.js.org/style-guide/style-guide#do-not-mutate-state)`);
          }
        });

        // 执行下一个中间件，thunk那个
        const dispatchedAction = next(action);

        // 检查 dispatch 后的状态是否被修改
        measureUtils.measureTime(() => {
          state = getState();
          result = tracker.detectMutations();
          tracker = track(state);
          if (result.wasMutated) {
            throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(20) : `A state mutation was detected inside a dispatch, in the path: ${result.path || ""}. Take a look at the reducer(s) handling the action ${stringify2(action)}. (https://redux.js.org/style-guide/style-guide#do-not-mutate-state)`);
          }
        });
        measureUtils.warnIfExceeded();
        return dispatchedAction;
      };
    };
  }
}

// 创建一个跟踪器，用于检测对象是否被修改。
function trackForMutations(isImmutable, ignorePaths, obj) {
  // obj就是最新的state
  const trackedProperties = trackProperties(isImmutable, ignorePaths, obj);
  return {
    detectMutations() {
      return detectMutations(isImmutable, ignorePaths, trackedProperties, obj);
    }
  };
}
// 递归遍历对象的所有属性，创建一个跟踪结构
function trackProperties(isImmutable, ignorePaths = [], obj, path = "", checkedObjects = /* @__PURE__ */ new Set()) {
  const tracked = {
    value: obj
  };
  if (!isImmutable(obj) && !checkedObjects.has(obj)) {
    checkedObjects.add(obj);
    tracked.children = {};
    for (const key in obj) {
      const childPath = path ? path + "." + key : key;
      if (ignorePaths.length && ignorePaths.indexOf(childPath) !== -1) {
        continue;
      }
      tracked.children[key] = trackProperties(isImmutable, ignorePaths, obj[key], childPath);
    }
  }
  return tracked;
}
// 检测对象是否被直接修改。
function detectMutations(isImmutable, ignoredPaths = [], trackedProperty, obj, sameParentRef = false, path = "") {
  // 拿到过去的prevState对象
  const prevObj = trackedProperty ? trackedProperty.value : void 0;
  // 两者是否一个内存地址
  const sameRef = prevObj === obj;
  // 如果父对象引用相同但当前对象引用不同，且不是 NaN，说明对象被替换而不是修改
  if (sameParentRef && !sameRef && !Number.isNaN(obj)) {
    return {
      wasMutated: true,
      path
    };
  }
  // 如果是不可变类型，则不检查
  if (isImmutableDefault(prevObj) || isImmutableDefault(obj)) {
    return {
      wasMutated: false
    };
  }

  // 收集所有要检查的key
  const keysToDetect = {};
  for (let key in trackedProperty.children) {
    keysToDetect[key] = true;
  }
  for (let key in obj) {
    keysToDetect[key] = true;
  }

  // 递归检查新旧state的内存地址
  const hasIgnoredPaths = ignoredPaths.length > 0;
  for (let key in keysToDetect) {
    const nestedPath = path ? path + "." + key : key;
    if (hasIgnoredPaths) {
      const hasMatches = ignoredPaths.some((ignored) => {
        if (ignored instanceof RegExp) {
          return ignored.test(nestedPath);
        }
        return nestedPath === ignored;
      });
      if (hasMatches) {
        continue;
      }
    }
    const result = detectMutations(isImmutable, ignoredPaths, trackedProperty.children[key], obj[key], sameRef, nestedPath);
    if (result.wasMutated) {
      return result;
    }
  }

  // 全部正常返回不是突变
  return {
    wasMutated: false
  };
}
function isImmutableDefault(value) {
  return typeof value !== "object" || value == null || Object.isFrozen(value);
}
// 提供计时和警告功能，用于监控中间件执行时间
function getTimeMeasureUtils(maxDelay, fnName) {
  let elapsed = 0;
  return {
    measureTime(fn) {
      const started = Date.now();
      try {
        return fn();
      } finally {
        const finished = Date.now();
        elapsed += finished - started;
      }
    },
    warnIfExceeded() {
      if (elapsed > maxDelay) {
        console.warn(`${fnName} took ${elapsed}ms, which is more than the warning threshold of ${maxDelay}ms. 
If your state or actions are very large, you may want to disable the middleware as it might cause too much of a slowdown in development mode. See https://redux-toolkit.js.org/api/getDefaultMiddleware for instructions.
It is disabled in production builds, so you don't need to worry about that.`);
      }
    }
  };
}





// 检测中间件三：检查不可序列化状态

function createSerializableStateInvariantMiddleware(options = {}) {
  if (process.env.NODE_ENV === "production") {
    return () => (next) => (action) => next(action);
  } else {
    const {
      isSerializable = isPlain,
      getEntries,
      ignoredActions = [],
      ignoredActionPaths = ["meta.arg", "meta.baseQueryMeta"],
      ignoredPaths = [],
      warnAfter = 32,
      ignoreState = false,
      ignoreActions = false,
      disableCache = false
    } = options;
    const cache = !disableCache && WeakSet ? /* @__PURE__ */ new WeakSet() : void 0;
    return (storeAPI) => (next) => (action) => {

      // 首先检测action的格式
      if (!isAction2(action)) {
        return next(action);
      }
      // 执行下一个中间件，外部concat的那个（比如saga中间件）
      const result = next(action);

      // 拿到结果（肯定会返回dispatch本身的）之后
      // 1. 使用 measureTime 记录检查时间
      // 2. 调用 findNonSerializableValue 函数递归检查 action 对象中的所有值
      // 3. 如果发现非可序列化值，提取其路径和值
      // 4. 输出详细的错误信息
      const measureUtils = getTimeMeasureUtils(warnAfter, "SerializableStateInvariantMiddleware");
      if (!ignoreActions && !(ignoredActions.length && ignoredActions.indexOf(action.type) !== -1)) {
        measureUtils.measureTime(() => {
          const foundActionNonSerializableValue = findNonSerializableValue(action, "", isSerializable, getEntries, ignoredActionPaths, cache);
          if (foundActionNonSerializableValue) {
            const {
              keyPath,
              value
            } = foundActionNonSerializableValue;
            console.error(`A non-serializable value was detected in an action, in the path: \`${keyPath}\`. Value:`, value, "\nTake a look at the logic that dispatched this action: ", action, "\n(See https://redux.js.org/faq/actions#why-should-type-be-a-string-or-at-least-serializable-why-should-my-action-types-be-constants)", "\n(To allow non-serializable values see: https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data)");
          }
        });
      }
      if (!ignoreState) {
        measureUtils.measureTime(() => {
          const state = storeAPI.getState();
          const foundStateNonSerializableValue = findNonSerializableValue(state, "", isSerializable, getEntries, ignoredPaths, cache);
          if (foundStateNonSerializableValue) {
            const {
              keyPath,
              value
            } = foundStateNonSerializableValue;
            console.error(`A non-serializable value was detected in the state, in the path: \`${keyPath}\`. Value:`, value, `
Take a look at the reducer(s) handling this action type: ${action.type}.
(See https://redux.js.org/faq/organizing-state#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state)`);
          }
        });
        measureUtils.warnIfExceeded();
      }
      return result;
    };
  }
}




// REVIEW - 下面是【二、处理所有的middleware 里面的 2.3 增强中间件】里面的一个函数
// 将默认的增强器和自定义的增强器结合到一起

var buildGetDefaultEnhancers = (middlewareEnhancer) => function getDefaultEnhancers(options) {
  const { autoBatch = true } = options ?? {};
  let enhancerArray = new Tuple(middlewareEnhancer);
  if (autoBatch) {
    enhancerArray.push(autoBatchEnhancer(typeof autoBatch === "object" ? autoBatch : void 0));
  }
  return enhancerArray;
};


var autoBatchEnhancer = (options = { type: "raf" }) => (next) => (...args) => {

  // 执行下一个增强器
  // next是下一个增强器，也是createStore
  // ...args是next（也是createStore）的入参
  const store = next(...args);

  let notifying = true;
  let shouldNotifyAtEndOfTick = false;
  let notificationQueued = false;

  const listeners = new Set();
  const queueCallback =
    options.type === "tick"
      ? queueMicrotask
      : options.type === "raf"
      ? typeof window !== "undefined" && window.requestAnimationFrame
        ? window.requestAnimationFrame
        : createQueueWithTimer(10)
      : options.type === "callback"
      ? options.queueNotification
      : createQueueWithTimer(options.timeout);
  
  const notifyListeners = () => {
    notificationQueued = false;
    if (shouldNotifyAtEndOfTick) {
      shouldNotifyAtEndOfTick = false;
      listeners.forEach((l) => l());
    }
  };
  
  // 返回一个增强后的store对象
  return Object.assign({}, store, {
    subscribe(listener2) {
      const wrappedListener = () => notifying && listener2();
      const unsubscribe = store.subscribe(wrappedListener);
      listeners.add(listener2);
      return () => {
        unsubscribe();
        listeners.delete(listener2);
      };
    },

    dispatch(action) {
      try {
        notifying = !action?.meta?.[SHOULD_AUTOBATCH];
        shouldNotifyAtEndOfTick = !notifying;
        if (shouldNotifyAtEndOfTick) {
          if (!notificationQueued) {
            notificationQueued = true;
            queueCallback(notifyListeners);
          }
        }
        return store.dispatch(action);
      } finally {
        notifying = true;
      }
    }
  });
};










// REVIEW - 创建一个【reducer】的切片函数


var createSlice = buildCreateSlice();

// createSlice实际上执行的是createSlice2函数
function buildCreateSlice({ creators } = {}) {
  const cAT = creators?.asyncThunk?.[asyncThunkSymbol];
  return function createSlice2(options) {
    // 入参options是一个对象，里面有initialState、reducers、extraReducers等等
    const { name, reducerPath = name } = options;

    // 数据校验
    if (!name) {
      throw new Error(
        false ? 0 : "`name` is a required option for createSlice"
      );
    }
    if (typeof process !== "undefined" && "development" === "development") {
      if (options.initialState === void 0) {
        console.error(
          "You must provide an `initialState` value that is not `undefined`. You may have misspelled `initialState`"
        );
      }
    }

    // 创建上下文
    const context = {
      sliceCaseReducersByName: {},
      sliceCaseReducersByType: {},
      actionCreators: {},
      sliceMatchers: [],
    };

    // 定义方法
    const contextMethods = {
      addCase(typeOrActionCreator, reducer2) {
        // typeOrActionCreator是reducer的标识，reducer2是函数
        // 在示例中，typeOrActionCreator是"test/increment"

        const type =
          typeof typeOrActionCreator === "string"
            ? typeOrActionCreator
            : typeOrActionCreator.type;
        if (!type) {
          throw new Error(
            false
              ? 0
              : "`context.addCase` cannot be called with an empty action type"
          );
        }
        if (type in context.sliceCaseReducersByType) {
          throw new Error(
            false
              ? 0
              : "`context.addCase` cannot be called with two reducers for the same action type: " +
                type
          );
        }

        // 把函数保存到（此切片内部）上下文的sliceCaseReducersByType里面
        context.sliceCaseReducersByType[type] = reducer2;
        // 继续返回方法，可以链式调用
        return contextMethods;
      },
      addMatcher(matcher, reducer2) {
        context.sliceMatchers.push({
          matcher,
          reducer: reducer2,
        });
        return contextMethods;
      },
      exposeAction(name2, actionCreator) {
        // 把actionCreator的方法存起来！
        // 到时候在外部拿到是slice.actions.xxxx()，这个时候的xxxx实际上就是actionCreator函数
        context.actionCreators[name2] = actionCreator;
        return contextMethods;
      },
      exposeCaseReducer(name2, reducer2) {
        // name2的入参是"increment"
        // 把函数保存到（此切片内部）上下文的sliceCaseReducersByName里面
        context.sliceCaseReducersByName[name2] = reducer2;
        return contextMethods;
      },
    };

    // 保存每一个reducer（初始化）
    const reducers =
      (typeof options.reducers === "function"
        ? options.reducers(buildReducerCreators())
        : options.reducers) || {};
    const reducerNames = Object.keys(reducers);
    reducerNames.forEach((reducerName) => {
      const reducerDefinition = reducers[reducerName];

      // 包装每一个reducer函数
      const reducerDetails = {
        reducerName,
        // 独一无二的标识
        type: getType(name, reducerName),
        createNotation: typeof options.reducers === "function",
      };

      // 根据是异步还是同步来判断进入哪一个逻辑
      if (isAsyncThunkSliceReducerDefinition(reducerDefinition)) {
        // 如果reducer函数本身被外部标记了一个属性（_reducerDefinitionType），就走下面
        handleThunkCaseReducerDefinition(
          reducerDetails,
          reducerDefinition,
          contextMethods,
          cAT
        );
      } else {
        // 如果是一个正常的reducer函数就走下面
        // 目的是保存reducer函数、和对应的action创建函数（一个reducer一个action）
        handleNormalReducerDefinition(
          reducerDetails,
          reducerDefinition,
          contextMethods
        );
      }
    });

    // 用来处理extraReducers
    function buildReducer() {
      // 检验extraReducer的格式，不能是一个对象
      if (true) {
        if (typeof options.extraReducers === "object") {
          throw new Error(
            false
              ? 0
              : "The object notation for `createSlice.extraReducers` has been removed. Please use the 'builder callback' notation instead: https://redux-toolkit.js.org/api/createSlice"
          );
        }
      }
      // 初始化处理extraReducers
      const [
        extraReducers = {},
        actionMatchers = [],
        defaultCaseReducer = void 0,
      ] =
        typeof options.extraReducers === "function"
          ? executeReducerBuilderCallback(options.extraReducers)
          : [options.extraReducers];

      // 整合所有的reducer（异步的normalReducer和本来就是同步的reducer）
      // 拿到的extraReducers就是normalReducer的集合
      // sliceCaseReducersByType就是slice参数对象的reducer属性的所有reducer函数的集合
      const finalCaseReducers = {
        ...extraReducers,
        ...context.sliceCaseReducersByType,
      };
      return createReducer(options.initialState, (builder) => {
        // 再次保存记录所有的reducer函数，目的是？
        for (let key in finalCaseReducers) {
          builder.addCase(key, finalCaseReducers[key]);
        }
        for (let sM of context.sliceMatchers) {
          builder.addMatcher(sM.matcher, sM.reducer);
        }
        for (let m of actionMatchers) {
          builder.addMatcher(m.matcher, m.reducer);
        }
        if (defaultCaseReducer) {
          builder.addDefaultCase(defaultCaseReducer);
        }
      });
    }


    const selectSelf = (state) => state;
    const injectedSelectorCache = new Map();
    const injectedStateCache = new WeakMap();
    let _reducer;
    function reducer(state, action) {
      // 这是一个经过包装的reducer
      // 【store那边收集到的是经过包装的reducer合集】
      // 在执行combieReducer的时候，里面有个检测函数会执行这个buildReducer
      // 这个时候已经初始化成功了，因此当用户dispatch的时候，来到这里直接执行_reducer，也就是createReducer里面的reducer函数
      if (!_reducer) _reducer = buildReducer();
      return _reducer(state, action);
    }
    function getInitialState() {
      if (!_reducer) _reducer = buildReducer();
      return _reducer.getInitialState();
    }
    function makeSelectorProps(reducerPath2, injected = false) {
      function selectSlice(state) {
        let sliceState = state[reducerPath2];
        if (typeof sliceState === "undefined") {
          if (injected) {
            sliceState = getOrInsertComputed(
              injectedStateCache,
              selectSlice,
              getInitialState
            );
          } else if (true) {
            throw new Error(
              false
                ? 0
                : "selectSlice returned undefined for an uninjected slice reducer"
            );
          }
        }
        return sliceState;
      }
      function getSelectors(selectState = selectSelf) {
        const selectorCache = getOrInsertComputed(
          injectedSelectorCache,
          injected,
          () => /* @__PURE__ */ new WeakMap()
        );
        return getOrInsertComputed(selectorCache, selectState, () => {
          const map = {};
          for (const [name2, selector] of Object.entries(
            options.selectors ?? {}
          )) {
            map[name2] = wrapSelector(
              selector,
              selectState,
              () =>
                getOrInsertComputed(
                  injectedStateCache,
                  selectState,
                  getInitialState
                ),
              injected
            );
          }
          return map;
        });
      }
      return {
        reducerPath: reducerPath2,
        getSelectors,
        get selectors() {
          return getSelectors(selectSlice);
        },
        selectSlice,
      };
    }

    // 返回一个方法汇总工具包
    const slice = {
      name,
      reducer, // reducer的执行方法
      actions: context.actionCreators, // action创建函数的集合对象
      caseReducers: context.sliceCaseReducersByName, // 真实的reducer函数对象
      getInitialState,
      ...makeSelectorProps(reducerPath), // selector相关方法
      injectInto(injectable, { reducerPath: pathOpt, ...config } = {}) {
        const newReducerPath = pathOpt ?? reducerPath;
        injectable.inject(
          {
            reducerPath: newReducerPath,
            reducer,
          },
          config
        );
        return {
          ...slice,
          ...makeSelectorProps(newReducerPath, true),
        };
      },
    };
    return slice;
  };
}






// REVIEW - 正常的reducer和extraReducers的处理
// 1. 正常的reducer的处理

function getType(slice, actionKey) {
  return `${slice}/${actionKey}`;
}

function isAsyncThunkSliceReducerDefinition(reducerDefinition) {
  return reducerDefinition._reducerDefinitionType === "asyncThunk";
}

// 保存reducer到createSlice2这个作用域里面
function handleNormalReducerDefinition(
  { type, reducerName, createNotation },
  maybeReducerWithPrepare,
  context
) {
  // 入参：
  // 第一个入参是reducer函数的一些信息（type是唯一的reducer函数的标识，reducerName是reducer函数的名字，createNotation是true）
  // 第二个入参是reducer函数
  // 第三个入参是上下文方法合集

  let caseReducer;
  let prepareCallback;

  //
  if ("reducer" in maybeReducerWithPrepare) {
    if (
      createNotation &&
      !isCaseReducerWithPrepareDefinition(maybeReducerWithPrepare)
    ) {
      throw new Error(
        false
          ? 0
          : "Please use the `create.preparedReducer` notation for prepared action creators with the `create` notation."
      );
    }
    caseReducer = maybeReducerWithPrepare.reducer;
    prepareCallback = maybeReducerWithPrepare.prepare;
  } else {
    // 普通的走下面，创建一个中间变量保存reducer函数
    caseReducer = maybeReducerWithPrepare;
  }

  // 执行
  context
    .addCase(type, caseReducer)
    .exposeCaseReducer(reducerName, caseReducer)
    .exposeAction(
      reducerName,
      prepareCallback ? createAction(type, prepareCallback) : createAction(type)
    );
}


// 2. extraReducers的处理

function executeReducerBuilderCallback(builderCallback) {
  // builderCallback是extraReducers
  const actionsMap = {};
  const actionMatchers = [];
  let defaultCaseReducer;
  const builder = {
    // !【一句话】addCase就是以第一参数的type标识为key，第二参数的normalReducer为value，保存到一个对象里面
    // 为什么要保存到对象里面呢？
    addCase(typeOrActionCreator, reducer) {
      // 第一参数为异步函数的fulfilled状态的actionCreator函数
      // 第二参数为另一种形式的普通的reducer函数 (state, { payload }) => {}（把data存入state里面）
      if (process.env.NODE_ENV !== "production") {
        if (actionMatchers.length > 0) {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(26) : "`builder.addCase` should only be called before calling `builder.addMatcher`");
        }
        if (defaultCaseReducer) {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(27) : "`builder.addCase` should only be called before calling `builder.addDefaultCase`");
        }
      }
      // typeOrActionCreator要么是字符串，要么是fulfilled生成的函数，里面有个type属性记录对应异步函数的唯一标识
      // type比如就是这样："test/fetchData/fulfilled"
      const type = typeof typeOrActionCreator === "string" ? typeOrActionCreator : typeOrActionCreator.type;
      if (!type) {
        throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(28) : "`builder.addCase` cannot be called with an empty action type");
      }
      if (type in actionsMap) {
        throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(29) : `\`builder.addCase\` cannot be called with two reducers for the same action type '${type}'`);
      }

      // 保存这个reducer到actionsMap里面
      actionsMap[type] = reducer;
      return builder;
    },
    addMatcher(matcher, reducer) {
      if (process.env.NODE_ENV !== "production") {
        if (defaultCaseReducer) {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(30) : "`builder.addMatcher` should only be called before calling `builder.addDefaultCase`");
        }
      }
      actionMatchers.push({
        matcher,
        reducer
      });
      return builder;
    },
    addDefaultCase(reducer) {
      if (process.env.NODE_ENV !== "production") {
        if (defaultCaseReducer) {
          throw new Error(process.env.NODE_ENV === "production" ? formatProdErrorMessage(31) : "`builder.addDefaultCase` can only be called once");
        }
      }
      defaultCaseReducer = reducer;
      return builder;
    }
  };

  // 执行外部的函数，给他提供一个builder的方法
  // 外部一般是执行addCase
  builderCallback(builder);

  // 然后返回保存的异步的正常reducer函数对象
  return [actionsMap, actionMatchers, defaultCaseReducer];
}



// 3. 创建整体的reducer创造函数
function createReducer(initialState, mapOrBuilderCallback) {

  // 从buildReducer过来的
  // 合并一些默认的reducer函数
  let [actionsMap, finalActionMatchers, finalDefaultCaseReducer] = executeReducerBuilderCallback(mapOrBuilderCallback);
  let getInitialState;

  // initialState需要被改造为一个函数，这个函数生成一个不可变的对象！
  if (isStateFunction(initialState)) {
    getInitialState = () => freezeDraftable(initialState());
  } else {
    // 一般initialState是一个对象，走下面
    const frozenInitialState = freezeDraftable(initialState);
    getInitialState = () => frozenInitialState;
  }

  // !【单独的reducer】这是对外暴露的单独的reducer的真正函数！！dispatch之后在combinedReducer那边执行每个reducer函数就是下面的函数
  function reducer(state = getInitialState(), action) {
    // 根据actiontype拿到对应的reducer函数
    let caseReducers = [
      actionsMap[action.type],
      ...finalActionMatchers
        .filter(({ matcher }) => matcher(action))
        .map(({ reducer: reducer2 }) => reducer2),
    ];
    if (caseReducers.filter((cr) => !!cr).length === 0) {
      caseReducers = [finalDefaultCaseReducer];
    }

    // 逐一执行reducer函数，逐渐覆盖state
    // 返回最后的state对象（reducer函数的固定返回值）
    return caseReducers.reduce((previousState, caseReducer) => {
      if (caseReducer) {
        if (isDraft2(previousState)) {
          // state对象有symbol属性
          const draft = previousState;
          // 执行reducer函数，入参是之前冻结过的state，action是dispatch传递的动作
          const result = caseReducer(draft, action);
          if (result === void 0) {
            return previousState;
          }
          return result;
        } else if (!isDraftable2(previousState)) {
          // state对象不是一个纯对象
          const result = caseReducer(previousState, action);
          if (result === void 0) {
            if (previousState === null) {
              return previousState;
            }
            throw Error("A case reducer on a non-draftable value must not return undefined");
          }
          return result;
        } else {
          // state对象是一个纯的普通对象
          // 用createNextState包裹的目的是，拿到经过改造的不可变的state对象（draft）
          // 传递给caseReducer执行，改变仓库里面的值
          return createNextState(previousState, (draft) => {
            return caseReducer(draft, action);
          });
        }
      }
      return previousState;
    }, state);
  }
  reducer.getInitialState = getInitialState;

  // 返回经过包裹改造的reducer
  return reducer;
}




// freezeDraftable相关的函数：

function isStateFunction(x) {
  return typeof x === "function";
}
function freezeDraftable(val) {
  // val是initialState，是一个对象
  // 创建一个函数
  return isDraftable(val) ? createNextState(val, () => {}) : val;
}
function isDraftable(value) {
  if (!value)
    return false;
  // 检验是否是一个纯对象
  return isPlainObject(value) || Array.isArray(value) || !!value[DRAFTABLE] || !!value.constructor?.[DRAFTABLE] || isMap(value) || isSet(value);
}
function createNextState(base, recipe, patchListener) {
  // 入参：
  // base是initialState，一个对象
  // recipe是() => {}，
  // patchListener是undefined

  // 前置的参数检验
  if (typeof base === "function" && typeof recipe !== "function") {
    const defaultBase = recipe;
    recipe = base;
    const self = this;
    return function curriedProduce(base2 = defaultBase, ...args) {
      return self.produce(base2, (draft) => recipe.call(this, draft, ...args));
    };
  }
  if (typeof recipe !== "function")
    die(6);
  if (patchListener !== void 0 && typeof patchListener !== "function")
    die(7);

  // 
  let result;
  if (isDraftable(base)) {
    const scope = enterScope(this);
    // 得到的scope是这样一个对象：
    // {
    //   drafts_: [],
    //   parent_,
    //   immer_, // 存的是this
    //   canAutoFreeze_: true,
    //   unfinalizedDrafts_: 0
    // };
    const proxy = createProxy(base, void 0);
    let hasError = true;
    // 执行recipe，但是从freezeDraftable过来的，他是空函数！
    try {
      result = recipe(proxy);
      hasError = false;
    } finally {
      if (hasError)
        revokeScope(scope);
      else
        // 让currentScope为scope的_parent属性，为undefined
        leaveScope(scope);
    }
    usePatchesInScope(scope, patchListener);
    // 因此result为undefined
    return processResult(result, scope);

  } else if (!base || typeof base !== "object") {
    result = recipe(base);
    if (result === void 0)
      result = base;
    if (result === NOTHING)
      result = void 0;
    if (this.autoFreeze_)
      freeze(result, true);
    if (patchListener) {
      const p = [];
      const ip = [];
      getPlugin("Patches").generateReplacementPatches_(base, result, p, ip);
      patchListener(p, ip);
    }
    return result;
  } else
    die(1, base);
}
var currentScope;
function enterScope(immer2) {
  return currentScope = createScope(currentScope, immer2);
}
function createScope(parent_, immer_) {
  return {
    drafts_: [],
    parent_,
    immer_,
    canAutoFreeze_: true,
    unfinalizedDrafts_: 0
  };
}
function createProxy(value, parent) {
  // value是initialState，一个对象
  // parent是undefined
  const draft = isMap(value)
    ? getPlugin("MapSet").proxyMap_(value, parent)
    : isSet(value)
    ? getPlugin("MapSet").proxySet_(value, parent)
    : createProxyProxy(value, parent);

  // scope就是currentScope
  const scope = parent ? parent.scope_ : getCurrentScope();
  // 往数组里面添加代理
  scope.drafts_.push(draft);
  return draft;
}
function isMap(target) {
  return target instanceof Map;
}
function isSet(target) {
  return target instanceof Set;
}
function createProxyProxy(base, parent) {
  // value是initialState，一个对象
  // parent是undefined
  const isArray = Array.isArray(base);
  // 设置代理目标和陷阱
  const state = {
    type_: isArray ? 1  : 0 ,
    scope_: parent ? parent.scope_ : getCurrentScope(),
    modified_: false,
    finalized_: false,
    assigned_: {},
    parent_: parent,
    base_: base,
    draft_: null,
    copy_: null,
    revoke_: null,
    isManual_: false
  };
  let target = state;
  let traps = objectTraps;
  if (isArray) {
    target = [state];
    traps = arrayTraps;
  }

  // 创建可撤销的代理
  // target 是代理的目标对象（state 或 [state]）
  // traps 是拦截器对象，定义了代理如何处理各种操作（如属性访问、赋值等）
  // 返回一个 代理对象 proxy 和撤销函数 revoke 
  const { revoke, proxy } = Proxy.revocable(target, traps);
  state.draft_ = proxy;
  state.revoke_ = revoke;
  return proxy;
}
function getCurrentScope() {
  return currentScope;
}
function leaveScope(scope) {
  if (scope === currentScope) {
    currentScope = scope.parent_;
  }
}
function usePatchesInScope(scope, patchListener) {
  if (patchListener) {
    getPlugin("Patches");
    scope.patches_ = [];
    scope.inversePatches_ = [];
    scope.patchListener_ = patchListener;
  }
}
function processResult(result, scope) {
  // result为undefined
  scope.unfinalizedDrafts_ = scope.drafts_.length;
  const baseDraft = scope.drafts_[0];
  const isReplaced = result !== void 0 && result !== baseDraft;
  if (isReplaced) {
    if (baseDraft[DRAFT_STATE].modified_) {
      revokeScope(scope);
      die(4);
    }
    if (isDraftable(result)) {
      result = finalize(scope, result);
      if (!scope.parent_)
        maybeFreeze(scope, result);
    }
    if (scope.patches_) {
      getPlugin("Patches").generateReplacementPatches_(
        baseDraft[DRAFT_STATE].base_,
        result,
        scope.patches_,
        scope.inversePatches_
      );
    }
  } else {
    // 走这里，没有result
    result = finalize(scope, baseDraft, []);
  }
  revokeScope(scope);
  if (scope.patches_) {
    scope.patchListener_(scope.patches_, scope.inversePatches_);
  }
  return result !== NOTHING ? result : void 0;
}
function finalize(rootScope, value, path) {
  if (isFrozen(value))
    return value;
  const state = value[DRAFT_STATE];
  if (!state) {
    each(
      value,
      (key, childValue) => finalizeProperty(rootScope, state, value, key, childValue, path)
    );
    return value;
  }
  if (state.scope_ !== rootScope)
    return value;
  if (!state.modified_) {
    // 走这里！
    // state.base_就是真正的initialState对象
    maybeFreeze(rootScope, state.base_, true);
    // 最终返回一个冻结过的initialState对象
    return state.base_;
  }
  if (!state.finalized_) {
    state.finalized_ = true;
    state.scope_.unfinalizedDrafts_--;
    const result = state.copy_;
    let resultEach = result;
    let isSet2 = false;
    if (state.type_ === 3 /* Set */) {
      resultEach = new Set(result);
      result.clear();
      isSet2 = true;
    }
    each(
      resultEach,
      (key, childValue) => finalizeProperty(rootScope, state, result, key, childValue, path, isSet2)
    );
    maybeFreeze(rootScope, result, false);
    if (path && rootScope.patches_) {
      getPlugin("Patches").generatePatches_(
        state,
        path,
        rootScope.patches_,
        rootScope.inversePatches_
      );
    }
  }
  return state.copy_;
}
function maybeFreeze(scope, value, deep = false) {
  if (!scope.parent_ && scope.immer_.autoFreeze_ && scope.canAutoFreeze_) {
    freeze(value, deep);
  }
}
function freeze(obj, deep = false) {
  if (isFrozen(obj) || isDraft(obj) || !isDraftable(obj))
    return obj;
  if (getArchtype(obj) > 1) {
    obj.set = obj.add = obj.clear = obj.delete = dontMutateFrozenCollections;
  }
  // 冻结这个initialState对象
  Object.freeze(obj);
  if (deep)
    // 递归冻结
    Object.entries(obj).forEach(([key, value]) => freeze(value, true));
  return obj;
}
function getArchtype(thing) {
  const state = thing[DRAFT_STATE];
  return state ? state.type_ : Array.isArray(thing) ? 1 /* Array */ : isMap(thing) ? 2 /* Map */ : isSet(thing) ? 3 /* Set */ : 0 /* Object */;
}
function revokeScope(scope) {
  leaveScope(scope);
  scope.drafts_.forEach(revokeDraft);
  scope.drafts_ = null;
}
function isDraft(value) {
  return !!value && !!value[DRAFT_STATE];
}
function isDraftable(value) {
  if (!value) return false;
  return (
    isPlainObject(value) ||
    Array.isArray(value) ||
    !!value[DRAFTABLE] ||
    !!value.constructor?.[DRAFTABLE] ||
    isMap(value) ||
    isSet(value)
  );
}








// REVIEW - 包裹异步函数的工具

function createAsyncThunk(typePrefix, payloadCreator, options) {
  // 入参：
  // typePrefix是外部自己给这个异步函数的一个标识，比如"test/fetchData"
  // payloadCreator是一个异步函数async (api所需要的入参， 一个对象) => {}
  // options是配置选项

  // 构造三种状态的异步action创建器
  // 同一个工厂创建出来的
  const fulfilled = createAction(
    typePrefix + "/fulfilled",
    (payload, requestId, arg, meta) => ({
      payload,
      meta: {
        ...(meta || {}),
        arg,
        requestId,
        requestStatus: "fulfilled",
      },
    })
  );
  const pending = createAction(
    typePrefix + "/pending",
    (requestId, arg, meta) => ({
      payload: void 0,
      meta: {
        ...(meta || {}),
        arg,
        requestId,
        requestStatus: "pending",
      },
    })
  );
  const rejected = createAction(
    typePrefix + "/rejected",
    (error, requestId, arg, payload, meta) => ({
      payload,
      error: ((options && options.serializeError) || miniSerializeError)(
        error || "Rejected"
      ),
      meta: {
        ...(meta || {}),
        arg,
        requestId,
        rejectedWithValue: !!payload,
        requestStatus: "rejected",
        aborted: error?.name === "AbortError",
        condition: error?.name === "ConditionError",
      },
    })
  );

  // 异步包裹函数里面还有一个action创造函数
  // dispatch(apiFunc())的时候，就执行这个函数，直接返回一个函数
  // 这个函数会在thunk那边或者saga（？）那边执行
  function actionCreator(arg, { signal } = {}) {
    // apiFunc()返回的是一个函数，通过中间件执行
    return (dispatch, getState, extra) => {
      const requestId = options?.idGenerator
        ? options.idGenerator(arg)
        : nanoid();
      const abortController = new AbortController();
      let abortHandler;
      let abortReason;
      function abort(reason) {
        abortReason = reason;
        abortController.abort();
      }
      if (signal) {
        if (signal.aborted) {
          abort(externalAbortMessage);
        } else {
          signal.addEventListener("abort", () => abort(externalAbortMessage), {
            once: true,
          });
        }
      }
      const promise = (async function () {
        let finalAction;
        try {
          let conditionResult = options?.condition?.(arg, {
            getState,
            extra,
          });
          if (isThenable(conditionResult)) {
            conditionResult = await conditionResult;
          }
          if (conditionResult === false || abortController.signal.aborted) {
            throw {
              name: "ConditionError",
              message: "Aborted due to condition callback returning false.",
            };
          }
          const abortedPromise = new Promise((_, reject) => {
            abortHandler = () => {
              reject({
                name: "AbortError",
                message: abortReason || "Aborted",
              });
            };
            abortController.signal.addEventListener("abort", abortHandler);
          });

          // 执行pending函数，生成一个action，然后dispatch，改变当前执行状态
          dispatch(
            pending(
              requestId,
              arg,
              options?.getPendingMeta?.(
                {
                  requestId,
                  arg,
                },
                {
                  getState,
                  extra,
                }
              )
            )
          );

          // 等外部的异步函数执行完，就可以返回fulfilled的action，给到finalAction
          finalAction = await Promise.race([
            abortedPromise,
            Promise.resolve(
              payloadCreator(arg, {
                dispatch,
                getState,
                extra,
                requestId,
                signal: abortController.signal,
                abort,
                rejectWithValue: (value, meta) => {
                  return new RejectWithValue(value, meta);
                },
                fulfillWithValue: (value, meta) => {
                  return new FulfillWithMeta(value, meta);
                },
              })
            ).then((result) => {
              if (result instanceof RejectWithValue) {
                throw result;
              }
              if (result instanceof FulfillWithMeta) {
                return fulfilled(result.payload, requestId, arg, result.meta);
              }
              return fulfilled(result, requestId, arg);
            }),
          ]);
        } catch (err) {
          finalAction =
            err instanceof RejectWithValue
              ? rejected(null, requestId, arg, err.payload, err.meta)
              : rejected(err, requestId, arg);
        } finally {
          if (abortHandler) {
            abortController.signal.removeEventListener("abort", abortHandler);
          }
        }
        const skipDispatch =
          options &&
          !options.dispatchConditionRejection &&
          rejected.match(finalAction) &&
          finalAction.meta.condition;
        if (!skipDispatch) {
          dispatch(finalAction);
        }

        // 返回这个fulfilled的action对象
        return finalAction;
      })();

      // 中间件执行这个函数之后，返回一个对象
      return Object.assign(promise, {
        abort,
        requestId,
        arg,
        unwrap() {
          return promise.then(unwrapResult);
        },
      });
    };
  }

  // 返回一个带有很多【状态方法】（fulfill的action生成器函数等）的函数
  return Object.assign(actionCreator, {
    pending,
    rejected,
    fulfilled,
    settled: isAnyOf(rejected, fulfilled),
    typePrefix,
  });
}

createAsyncThunk.withTypes = () => createAsyncThunk;

var nanoid = (size = 21) => {
  let id = "";
  let i = size;
  while (i--) {
    id += urlAlphabet[Math.random() * 64 | 0];
  }
  return id;
};







// REVIEW - action创建函数的工厂，返回自定义的action创建函数（存了一些变量在闭包里面）

function createAction(type, prepareAction) {
  // type是reducer的唯一标识
  // prepareAction是reducer的prepare方法
  function actionCreator(...args) {
    // dispatch一个action的时候，首先执行的是对应的type（reducer函数）的action创建函数
    if (prepareAction) {
      let prepared = prepareAction(...args);
      if (!prepared) {
        throw new Error(false ? 0 : "prepareAction did not return an object");
      }
      return {
        type,
        payload: prepared.payload,
        ...("meta" in prepared && {
          meta: prepared.meta,
        }),
        ...("error" in prepared && {
          error: prepared.error,
        }),
      };
    }
    // 没有prepareAction就走下面，直接返回一个action，
    // type是reducer的唯一标识（切片名称加上reducer函数的名称）
    // payload的数据就是执行slice.actions.xxx()时传入的参数
    return {
      type,
      payload: args[0],
    };
  }
  actionCreator.toString = () => `${type}`;
  actionCreator.type = type;
  actionCreator.match = (action) =>
    (0, redux__WEBPACK_IMPORTED_MODULE_0__.isAction)(action) &&
    action.type === type;
  return actionCreator;
}





