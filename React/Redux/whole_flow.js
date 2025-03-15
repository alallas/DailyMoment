
// 在combineReducers里面的[ 检测reducer函数 ]写对没有时用到了
const randomString = () => Math.random().toString(36).substring(7).split('').join('.')
const ActionTypes = {
  INIT: `@@redux/INIT${randomString()}`,
  REPLACE: `@@redux/REPLACE${randomString()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
}


// 在observable函数里面用到了
const $$observable = (() => (typeof Symbol === 'function' && Symbol.observable) || '@@observable')()


// connect函数用到的
var ReactReduxContext = {
  _calculateChangedBits: null,
  _currentRenderer: null,
  _currentRenderer2: null,
  _currentValue: null,
  _currentValue2: null,
  _threadCount: 0,
  $$typeof: Symbol(react.context),
  Consumer: {
    $$typeof: Symbol(react.context), 
    _context: {}, 
    _calculateChangedBits: null, 
  },
  displayName: 'ReactRedux',
  Provider: {
    $$typeof: Symbol(react.provider),
    _context: {},
  },
}


const _excluded = ["reactReduxForwardedRef"];


// 执行高阶组件的第二个括号，即包裹的过程中使用到的

var defineProperty = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPrototypeOf = Object.getPrototypeOf;
var objectPrototype = Object.prototype;


var TYPE_STATICS = {};
TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;


var REACT_STATICS = {
  childContextTypes: true,
  contextType: true,
  contextTypes: true,
  defaultProps: true,
  displayName: true,
  getDefaultProps: true,
  getDerivedStateFromError: true,
  getDerivedStateFromProps: true,
  mixins: true,
  propTypes: true,
  type: true
};
var KNOWN_STATICS = {
  name: true,
  length: true,
  prototype: true,
  caller: true,
  callee: true,
  arguments: true,
  arity: true
};
var FORWARD_REF_STATICS = {
  '$$typeof': true,
  render: true,
  defaultProps: true,
  displayName: true,
  propTypes: true
};
var MEMO_STATICS = {
  '$$typeof': true,
  compare: true,
  defaultProps: true,
  displayName: true,
  propTypes: true,
  type: true
};








// reducer是指挥函数
// 




// REVIEW - 整合reducer函数，返回大reducer函数


function combineReducers(reducers) {
  // 入参：reducers是一个对象：
  // { 
  //   home: function home(state, action) {},
  //   counter: function counter(state, action) {},
  // }

  const reducerKeys = Object.keys(reducers)
  const finalReducers = {}

  // 遍历所有的reducer名字，把所有的reducer执行者函数放入一个缓存
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }
  const finalReducerKeys = Object.keys(finalReducers)

  // 用于清除重复的key及其对应的函数值，仅在开发环境适用！
  let unexpectedKeyCache
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {}
  }
  // 检验reducer函数是否写对了!
  let shapeAssertionError
  try {
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }

  // 返回用于执行所有reducers函数的函数
  return function combination(state = {}, action) {
    // 1. 相关信息检测
    if (shapeAssertionError) {
      throw shapeAssertionError
    }
    if (process.env.NODE_ENV !== 'production') {
      const warningMessage = getUnexpectedStateShapeWarningMessage(
        state,
        finalReducers,
        action,
        unexpectedKeyCache
      )
      if (warningMessage) {
        warning(warningMessage)
      }
    }

    // 2. 遍历reducer函数的key名字
    let hasChanged = false
    const nextState = {}
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i]
      const reducer = finalReducers[key]

      // 1. 拿到最新的state对象!(这个state是囊括了所有类型的reducer的执行结果对象)
      // 从state对象里面拿到所有的reducer函数的key名字对应的东西??
      // 当时往里面存的是reducer函数在这个key(这个大类)的执行结果!
      // 每一个reducer都有不同的state执行结果,是存在这个大的state入参里面
      const previousStateForKey = state[key]

      // 2. 执行reducer函数,
      // previousStateForKey为最新的一个state对象
      const nextStateForKey = reducer(previousStateForKey, action)

      // 3. 结果检验
      if (typeof nextStateForKey === 'undefined') {
        const actionType = action && action.type
        throw new Error(
          `When called with an action of type ${
            actionType ? `"${String(actionType)}"` : '(unknown type)'
          }, the slice reducer for key "${key}" returned undefined. ` +
            `To ignore an action, you must explicitly return the previous state. ` +
            `If you want this reducer to hold no value, you can return null instead of undefined.`
        )
      }

      // 拿到reducer结果之后, 放到一个新的state大对象里面进行保存
      nextState[key] = nextStateForKey

      // 更新hasChanged这个标识(reducer函数的新旧返回值对比!)
      // 一般来说都是不一样的,因为reducer函数返回的是一个新建的对象,内存地址肯定变化了!
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    // 如果变化了,就直接return下一个新的state(这是一个全新的内存地址!)
    // 没有变化就返回原来的state地址
    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length
    return hasChanged ? nextState : state
  }
}




function assertReducerShape(reducers) {
  Object.keys(reducers).forEach(key => {
    // 拿到每一个的reducer函数
    const reducer = reducers[key]

    // 初始化执行reducer函数
    // state为undefined，因此必须在开发者那边写上默认值对象
    // action为一个对象，type是随机的一个字符串
    // 返回值必须是初始化的state对象
    const initialState = reducer(undefined, { type: ActionTypes.INIT })


    // 检测异常情况：
    // 1. 没有返回一个初始值的state对象
    if (typeof initialState === 'undefined') {
      throw new Error(
        `The slice reducer for key "${key}" returned undefined during initialization. ` +
          `If the state passed to the reducer is undefined, you must ` +
          `explicitly return the initial state. The initial state may ` +
          `not be undefined. If you don't want to set a value for this reducer, ` +
          `you can use null instead of undefined.`
      )
    }
    // 2. 返回值是一个undefined，即没有返回值
    if (
      typeof reducer(undefined, {
        type: ActionTypes.PROBE_UNKNOWN_ACTION()
      }) === 'undefined'
    ) {
      throw new Error(
        `The slice reducer for key "${key}" returned undefined when probed with a random type. ` +
          `Don't try to handle '${ActionTypes.INIT}' or other actions in "redux/*" ` +
          `namespace. They are considered private. Instead, you must return the ` +
          `current state for any unknown actions, unless it is undefined, ` +
          `in which case you must return the initial state, regardless of the ` +
          `action type. The initial state may not be undefined, but can be null.`
      )
    }
  })
}





// REVIEW - 创建仓库函数





function applyMiddleware(...middlewares) {
  return createStore => (reducer, preloadedState) => {

    // 在createStore那边如果传递了第二个参数, 来到这执行的就是下面的函数
    // [ 相当于包裹了createStore函数本身, 加入了"中间件"的参数, 但是外部却可以只用一个函数名字, 因为是自己包裹了自己 ]
    // 执行createStore函数 (dispatch指挥函数执行 (所有reducer函数以及listener函数) )
    const store = createStore(reducer, preloadedState)

    // 重置一下dispatch的值
    let dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.'
      )
    }

    // 封装一个工具,提供getState信息和dispatch指挥者(假的! 只会抛出错误! )的工具
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args)
    }

    // 遍历所有的中间件, 执行所有的中间件函数, 得到中间件函数的返回值(也是函数)数组
    const chain = middlewares.map(middleware => middleware(middlewareAPI))

    // 逐渐整合!
    // 最后得到的函数是：函数4（函数3（函数2（函数1（dispatch函数））））
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}



function compose(...funcs) {
  // 空值返回空函数
  if (funcs.length === 0) {
    return (arg) => arg
  }
  // 只有一个中间件直接返回她本身
  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}



function createStore(reducer, preloadedState, enhancer) {
  // 入参：
  // reducer是一个函数，就上面combineReducer函数的返回值 (相当于包装过的reducer函数, 执行所有reducer的)
  // preloadedState是applyMiddleware的返回值
  // （一个二重嵌套函数）createStore => (reducer, preState) => {}
  // enhancer还不知道是什么？？？


  // 1. 入参信息检验
  if (typeof reducer !== 'function') {
    throw new Error(
      `Expected the root reducer to be a function. Instead, received: '${kindOf(
        reducer
      )}'`
    )
  }
  if (
    (typeof preloadedState === 'function' && typeof enhancer === 'function') ||
    (typeof enhancer === 'function' && typeof arguments[3] === 'function')
  ) {
    throw new Error(
      'It looks like you are passing several store enhancers to ' +
        'createStore(). This is not supported. Instead, compose them ' +
        'together to a single function. See https://redux.js.org/tutorials/fundamentals/part-4-store#creating-a-store-with-enhancers for an example.'
    )
  }

  // 在这里把二重嵌套函数赋予给enhancer变量，preloadedState恢复为undefined
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  // 2. 如果入参传入了二重嵌套函数：
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error(
        `Expected the enhancer to be a function. Instead, received: '${kindOf(
          enhancer
        )}'`
      )
    }

    // 如果入参传入了二重嵌套函数：
    // 那么首先运行这个二嵌函数，传入本函数，然后再给予reducer函数(包装过的,执行所有reducer的)和undefined的第二个参数
    // 返回的是一个正常函数，也就是“二嵌函数”的最后一层
    return enhancer(createStore)(
      reducer,
      preloadedState
    )
  }


  // 2. 如果这个createStore没有传入第二个参数：
  // 那么就说明他是一个普通的同步仓库，不涉及中间件（没有异步操作）

  // (1) 先定义一些中间变量!
  let currentReducer = reducer
  let currentState = preloadedState
  // currentListeners是当前正在使用的监听器列表
  let currentListeners = new Map()
  // nextListeners是待生效的监听器列表
  let nextListeners = currentListeners
  let listenerIdCounter = 0
  let isDispatching = false

  
  // (2) 一些关键函数的定义
  function ensureCanMutateNextListeners() {
    // 如果两者是同一个内存(在初始的时候是这样)
    // nextListeners指定一个新的内存映射表,并复制currentListeners里面的所有listen函数
    if (nextListeners === currentListeners) {
      nextListeners = new Map()
      currentListeners.forEach((listener, key) => {
        nextListeners.set(key, listener)
      })
    }
  }

  // 拿到最新的状态
  function getState(){
    // 确保reducer函数没有在执行
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
          'The reducer has already received the state as an argument. ' +
          'Pass it down from the top reducer instead of reading it from the store.'
      )
    }
    // 返回当前的状态
    return currentState
  }

  // 订阅一个函数
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error(
        `Expected the listener to be a function. Instead, received: '${kindOf(
          listener
        )}'`
      )
    }
    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
          'If you would like to be notified after the store has been updated, subscribe from a ' +
          'component and invoke store.getState() in the callback to access the latest state. ' +
          'See https://redux.js.org/api/store#subscribelistener for more details.'
      )
    }

    let isSubscribed = true

    // 1. 在修改nextListeners前，确保它与currentListeners分离
    // 为什么?
    // !回答: 当遍历currentListeners执行里面的函数时,如果有新的监听器被订阅或取消, 直接修改currentListeners 会导致遍历过程中监听器列表被破坏（例如数组索引错乱）
    // 把函数添加到nextListeners, 下一次遍历需要执行listenr时, 让currentListeners = nextListeners
    // 通过维护两个独立的列表，将订阅/取消订阅的修改延迟到下一次派发
    ensureCanMutateNextListeners()

    // 2. 拿到当前的索引,并且索引加1
    const listenerId = listenerIdCounter++

    // 3. 把这个监听的函数保存到待生效的列表(key为索引,值为函数)
    nextListeners.set(listenerId, listener)

    // 4. 返回一个摧毁函数
    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }
      if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. ' +
            'See https://redux.js.org/api/store#subscribelistener for more details.'
        )
      }
      isSubscribed = false

      // 在修改nextListeners前，确保它与currentListeners分离
      ensureCanMutateNextListeners()

      // 删除掉当前存在nextListeners的函数
      nextListeners.delete(listenerId)

      // 把currentListeners变为null
      currentListeners = null
    }
  }


  function dispatch(action) {

    // 1. 入参检查
    // 检查是不是一个深度嵌套的对象
    if (!isPlainObject(action)) {
      throw new Error(
        `Actions must be plain objects. Instead, the actual type was: '${kindOf(
          action
        )}'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.`
      )
    }
    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.'
      )
    }

    if (typeof action.type !== 'string') {
      throw new Error(
        `Action "type" property must be a string. Instead, the actual type was: '${kindOf(
          action.type
        )}'. Value was: '${action.type}' (stringified)`
      )
    }
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }


    // 2. 执行每个reducer执行者函数,也就是combineReducers的返回值
    // 这个函数遍历所有的reducer函数, 执行之后获得 { home: {}, counter: {} }, 这个变量更新给currentState
    try {
      // 传入的参数是state和action:
      // 其中state指的是preloadedState,一开始执行是undefined
      // action来自于dispatch函数的入参
      isDispatching = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    // 3. 执行listener被监听函数
    // 让下一次的nextListeners给到currentListeners, 此时两个人的内存地址是一样的
    // 这说明这个时候是要执行listener函数的时候了(按道理不能再subscribe了)
    const listeners = (currentListeners = nextListeners)
    listeners.forEach(listener => {
      listener()
    })

    // 返回的是action, 这是一个纯函数!!仅仅执行了reducer函数和listener函数
    return action
  }


  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error(
        `Expected the nextReducer to be a function. Instead, received: '${kindOf(
          nextReducer
        )}`
      )
    }
    currentReducer = nextReducer
    dispatch({ type: ActionTypes.REPLACE })
  }

  
  function observable() {
    const outerSubscribe = subscribe
    return {
      subscribe(observer) {
        if (typeof observer !== 'object' || observer === null) {
          throw new TypeError(
            `Expected the observer to be an object. Instead, received: '${kindOf(
              observer
            )}'`
          )
        }

        function observeState() {
          const observerAsObserver = observer
          if (observerAsObserver.next) {
            observerAsObserver.next(getState())
          }
        }

        // 执行入参里面的next函数, 传入最新的state, 应该是有某些逻辑
        observeState()

        // 然后监听observeState函数,也就是一直执行的是observer的next函数
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      // 用Symbol里面的observable作为属性名字,返回这个observable对象
      [$$observable]() {
        return this
      }
    }
  }


  // (3) 初始化执行
  // 1)所有reducer函数 2)所有listener函数
  // 更新的变量有1)currentState 2)currentListeners
  dispatch({ type: ActionTypes.INIT })

  const store = {
    dispatch: dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
  return store
}






// REVIEW - 中间件函数


// thunk 中间件


function createThunkMiddleware(extraArgument) {
  const middleware = ({ dispatch, getState }) => (next) => (action) => {
    if (typeof action === "function") {
      return action(dispatch, getState, extraArgument);
    }
    return next(action);
  };
  return middleware;
}










// REVIEW - connect函数



function connect(mapStateToProps, mapDispatchToProps, mergeProps, {
  pure,
  areStatesEqual = strictEqual,
  areOwnPropsEqual = shallowEqual,
  areStatePropsEqual = shallowEqual,
  areMergedPropsEqual = shallowEqual,
  forwardRef = false,
  context = ReactReduxContext
} = {}) {

  // 入参：
  // mapStateToProps和mapDispatchToProps可以是一个函数，也可以是一个对象
  // 前者
  // 后者
  // 最后一个参数是一个工具箱!!!


  if (process.env.NODE_ENV !== 'production') {
    if (pure !== undefined && !hasWarnedAboutDeprecatedPureOption) {
      hasWarnedAboutDeprecatedPureOption = true;
      warning('The `pure` option has been removed. `connect` is now always a "pure/memoized" component');
    }
  }


  // 1. 初始化一些中间变量

  // 其中context也就是ReactReduxContext是一个全局变量，长下面这样
  // var ReactReduxContext = {
  //   _calculateChangedBits: null,
  //   _currentRenderer: null,
  //   _currentRenderer2: null,
  //   _currentValue: null,
  //   _currentValue2: null,
  //   _threadCount: 0,
  //   $$typeof: Symbol(react.context),
  //   Consumer: {
  //     $$typeof: Symbol(react.context), 
  //     _context: {}, 
  //     _calculateChangedBits: null, 
  //   },
  //   displayName: 'ReactRedux',
  //   Provider: {
  //     $$typeof: Symbol(react.provider),
  //     _context: {},
  //   },
  // }

  const Context = context;

  // 得到初始化的函数（仅仅只是函数，还没真正拿到里面的东西）！！
  const initMapStateToProps = mapStateToPropsFactory(mapStateToProps);
  const initMapDispatchToProps = mapDispatchToPropsFactory(mapDispatchToProps);
  const initMergeProps = mergePropsFactory(mergeProps);
  // 如果传递了mapStateToProps就说明要检测state是否有变化
  const shouldHandleStateChanges = Boolean(mapStateToProps);


  // 返回一个包裹函数
  // !相当于外部的connect是用来整合传入的【】和【】参数的，第二个括号（Home组件）才是真正的包裹函数

  const wrapWithConnect = WrappedComponent => {
    // 入参：WrappedComponent一般是类组件！！（函数组件不用connect来连接！！）

    if (process.env.NODE_ENV !== 'production' && !isValidElementType(WrappedComponent)) {
      throw new Error(`You must pass a component to the function returned by connect. Instead received ${stringifyComponent(WrappedComponent)}`);
    }

    // 拿到所有的信息和工具
    // 1）这个类组件的名字（类名字）
    const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
    const displayName = `Connect(${wrappedComponentName})`;
    const selectorFactoryOptions = {
      shouldHandleStateChanges,
      displayName,
      wrappedComponentName,
      WrappedComponent,
      initMapStateToProps,
      initMapDispatchToProps,
      initMergeProps,
      areStatesEqual,
      areStatePropsEqual,
      areOwnPropsEqual,
      areMergedPropsEqual
    };

    function ConnectFunction(props) {

      // 
      const [propsContext, reactReduxForwardedRef, wrapperProps] = React.useMemo(() => {
        // 拿不到这个reactReduxForwardedRef，因为一开始的props是空对象
        const { reactReduxForwardedRef } = props,
        // 删除掉props对象里面的一些属性键值对（参照_excluded数组删除）
        wrapperProps = _objectWithoutPropertiesLoose(props, _excluded);
        // 返回筛选过后的props，实际上这三个值都是undefined
        return [props.context, reactReduxForwardedRef, wrapperProps];
      }, [props]);


      // 2. 拿到上下文以此拿到store本身和getState函数
      // 如果props里面有上下文就直接用他的上下文，如果没有就用ReactReduxContext（也就是<Provider>那里传递的上下文）
      const ContextToUse = React.useMemo(() => {
        return propsContext && propsContext.Consumer && isContextConsumer(React.createElement(propsContext.Consumer, null))
          ? propsContext
          : Context;
      }, [propsContext, Context]);

      // 拿到上下文对象里面的_currentValue(同时给当前的fiber的contextDependencies属性保存了一个包装上下文对象)
      const contextValue = React.useContext(ContextToUse);

      // store一般来自于上下文，因此didStoreComeFromProps为false，didStoreComeFromContext为true
      const didStoreComeFromProps = Boolean(props.store) && Boolean(props.store.getState) && Boolean(props.store.dispatch);
      const didStoreComeFromContext = Boolean(contextValue) && Boolean(contextValue.store);
      if (process.env.NODE_ENV !== 'production' && !didStoreComeFromProps && !didStoreComeFromContext) {
        throw new Error(`Could not find "store" in the context of ` + `"${displayName}". Either wrap the root component in a <Provider>, ` + `or pass a custom React context provider to <Provider> and the corresponding ` + `React context consumer to ${displayName} in connect options.`);
      }

      // 拿到store本身和getState函数
      const store = didStoreComeFromProps ? props.store : contextValue.store;
      const getServerState = didStoreComeFromContext ? contextValue.getServerState : store.getState;
      

      // 3. 
      const childPropsSelector = React.useMemo(() => {
        return defaultSelectorFactory(store.dispatch, selectorFactoryOptions);
      }, [store]);


      const [subscription, notifyNestedSubs] = React.useMemo(() => {
        if (!shouldHandleStateChanges) return NO_SUBSCRIPTION_ARRAY;
        const subscription = createSubscription(store, didStoreComeFromProps ? undefined : contextValue.subscription);
        const notifyNestedSubs = subscription.notifyNestedSubs.bind(subscription);
        return [subscription, notifyNestedSubs];
      }, [store, didStoreComeFromProps, contextValue]);

      const overriddenContextValue = React.useMemo(() => {
        if (didStoreComeFromProps) {
          return contextValue;
        }
        return _extends({}, contextValue, { subscription });
      }, [didStoreComeFromProps, contextValue, subscription]);

      const lastChildProps = React.useRef();
      const lastWrapperProps = React.useRef(wrapperProps);
      const childPropsFromStoreUpdate = React.useRef();
      const renderIsScheduled = React.useRef(false);
      const isProcessingDispatch = React.useRef(false);
      const isMounted = React.useRef(false);
      const latestSubscriptionCallbackError = React.useRef();

      useIsomorphicLayoutEffect(() => {
        isMounted.current = true;
        return () => {
          isMounted.current = false;
        };
      }, []);

      const actualChildPropsSelector = React.useMemo(() => {
        const selector = () => {
          if (childPropsFromStoreUpdate.current && wrapperProps === lastWrapperProps.current) {
            return childPropsFromStoreUpdate.current;
          }
          return childPropsSelector(store.getState(), wrapperProps);
        };
        return selector;
      }, [store, wrapperProps]);

      const subscribeForReact = React.useMemo(() => {
        const subscribe = reactListener => {
          if (!subscription) {
            return () => {};
          }
          return subscribeUpdates(shouldHandleStateChanges, store, subscription, // @ts-ignore
          childPropsSelector, lastWrapperProps, lastChildProps, renderIsScheduled, isMounted, childPropsFromStoreUpdate, notifyNestedSubs, reactListener);
        };
        return subscribe;
      }, [subscription]);
      
      useIsomorphicLayoutEffectWithArgs(captureWrapperProps, [lastWrapperProps, lastChildProps, renderIsScheduled, wrapperProps, childPropsFromStoreUpdate, notifyNestedSubs]);

      let actualChildProps;
      try {
        actualChildProps = useSyncExternalStore(subscribeForReact, actualChildPropsSelector, getServerState ? () => childPropsSelector(getServerState(), wrapperProps) : actualChildPropsSelector);
      } catch (err) {
        if (latestSubscriptionCallbackError.current) {
          err.message += `\nThe error may be correlated with this previous error:\n${latestSubscriptionCallbackError.current.stack}\n\n`;
        }
        throw err;
      }

      useIsomorphicLayoutEffect(() => {
        latestSubscriptionCallbackError.current = undefined;
        childPropsFromStoreUpdate.current = undefined;
        lastChildProps.current = actualChildProps;
      });

      const renderedWrappedComponent = React.useMemo(() => {
        return (
          React.createElement(WrappedComponent, _extends({}, actualChildProps, {
            ref: reactReduxForwardedRef
          }))
        );
      }, [reactReduxForwardedRef, WrappedComponent, actualChildProps]);

      const renderedChild = React.useMemo(() => {
        if (shouldHandleStateChanges) {
          return React.createElement(ContextToUse.Provider, {
            value: overriddenContextValue
          }, renderedWrappedComponent);
        }
        return renderedWrappedComponent;
      }, [ContextToUse, renderedWrappedComponent, overriddenContextValue]);


      return renderedChild;
    }


    // 创建一个memo的虚拟DOM组件！
    const _Connect = React.memo(ConnectFunction);
    const Connect = _Connect;
    // 给这个memoe组件赋予一些属性
    // 把这个被包裹的组件放到这个memo虚拟DOM的一个属性里面
    Connect.WrappedComponent = WrappedComponent;
    Connect.displayName = ConnectFunction.displayName = displayName;

    // forwardRef默认是false，不走下面
    if (forwardRef) {
      const _forwarded = React.forwardRef(function forwardConnectRef(props, ref) {
        return React.createElement(Connect, _extends({}, props, {
          reactReduxForwardedRef: ref
        }));
      });
      const forwarded = _forwarded;
      forwarded.displayName = displayName;
      forwarded.WrappedComponent = WrappedComponent;
      return hoistStatics(forwarded, WrappedComponent);
    }

    // 给这个memo的虚拟DOM赋予 函数原型/通用类组件/自定义类组件 的属性，返回这个memo的虚拟DOM
    // 在Home组件的js文件那边，用这个覆盖原来的Home，然后export的是一个包裹着home的memo虚拟DOM
    // 那么相当于把Home用memo的fiber包裹起来的
    return hoistStatics(Connect, WrappedComponent);
  };

  return wrapWithConnect;
}


function strictEqual(a, b) {
  return a === b;
}


function mapStateToPropsFactory(mapStateToProps) {
  return !mapStateToProps
    ? wrapMapToPropsConstant(() => ({})) 
    : typeof mapStateToProps === 'function' 
      ? wrapMapToPropsFunc(mapStateToProps, 'mapStateToProps') 
      : createInvalidArgFactory(mapStateToProps, 'mapStateToProps');
}



function wrapMapToPropsFunc(mapToProps, methodName) {
  // 入参：mapToProps要么是mapStateToProps，要么是mapDispatchToProps

  return function initProxySelector(dispatch, { displayName }) {
    // 入参：displayName是`Connect(${wrappedComponentName})`
    // 例如：'Connect(Home)'

    // 下面的函数返回一个类似class的构造函数

    const proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
      return proxy.dependsOnOwnProps
        ? proxy.mapToProps(stateOrDispatch, ownProps)
        : proxy.mapToProps(stateOrDispatch, undefined);
    };

    proxy.dependsOnOwnProps = true;

    proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
      proxy.mapToProps = mapToProps;
      proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps);
      let props = proxy(stateOrDispatch, ownProps);

      if (typeof props === 'function') {
        proxy.mapToProps = props;
        proxy.dependsOnOwnProps = getDependsOnOwnProps(props);
        props = proxy(stateOrDispatch, ownProps);
      }

      if (process.env.NODE_ENV !== 'production') verifyPlainObject(props, displayName, methodName);
      return props;
    };

    return proxy;
  };
}



function mapDispatchToPropsFactory(mapDispatchToProps) {
  return mapDispatchToProps && typeof mapDispatchToProps === 'object' 
    ? wrapMapToPropsConstant(dispatch => bindActionCreators(mapDispatchToProps, dispatch)) 
    : !mapDispatchToProps 
      ? wrapMapToPropsConstant(dispatch => ({ dispatch })) 
      : typeof mapDispatchToProps === 'function' 
        ? wrapMapToPropsFunc(mapDispatchToProps, 'mapDispatchToProps') 
        : createInvalidArgFactory(mapDispatchToProps, 'mapDispatchToProps');
}



function wrapMapToPropsConstant(getConstant) {
  // getConstant就是一个函数：dispatch => bindActionCreators(mapDispatchToProps, dispatch)

  return function initConstantSelector(dispatch) {
    // 执行上面那个函数，目的是
    const constant = getConstant(dispatch);
    function constantSelector() {
      return constant;
    }
    constantSelector.dependsOnOwnProps = false;
    return constantSelector;
  };
}



function bindActionCreators(actionCreators, dispatch) {
  // 是actionCreator的对象，里面是一个个函数，每个函数都生成一个action对象
  // dispatch是store的方法

  // 下面是遍历这个对象，让每个action生成器函数变成瘦到dispatch包裹的一个函数
  // 也就是说，如果执行里面的函数，相当于就是触发dispatch函数，改变state了
  const boundActionCreators = {};
  for (const key in actionCreators) {
    const actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = (...args) => dispatch(actionCreator(...args));
    }
  }

  return boundActionCreators;
}



function mergePropsFactory(mergeProps) {
  return !mergeProps
    ? () => defaultMergeProps 
    : typeof mergeProps === 'function' 
      ? wrapMergePropsFunc(mergeProps)
      : createInvalidArgFactory(mergeProps, 'mergeProps');
}


function hoistStatics(targetComponent, sourceComponent, blacklist) {
  hoistNonReactStatics(targetComponent, sourceComponent, blacklist)
}


function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
  // 入参：
  // targetComponent需要把东西（props和dispatch）包裹到里面的memo组件（虚拟DOM）————静态属性将被复制到该组件
  // sourceComponent被包裹的组件，一般是类组件（大类对象），或者是function的原型，或者是Object的原型————静态属性将从此组件复制
  // blacklist没有传递，为undefined

  // !本函数的最终目的是让这个memo的虚拟DOM，变成一个具有函数原型/通用类组件/自定义类组件的所有属性的对象！
  // 注意：对于后两者，props不是类的属性，是类的实例的属性，比如对于Component，他的属性只有['length', 'name', 'prototype']

  if (typeof sourceComponent !== 'string') {
    // !1. 递归入口，目的是：
    // !将sourceComponent所有父类的属性复制到targetComponent目标组件上面
    if (objectPrototype) {
      // 拿到这个类组件继承的Component大组件
      var inheritedComponent = getPrototypeOf(sourceComponent);

      // 大Component组件肯定不等于Object的prototype，那么重新用大Component组件再次进入这个函数
      // 接着大Component组件的原型是函数的原型，也不等于Object的prototype，再次进入这个函数
      // 接着当sourceComponent为函数的原型（即他的原型是Object的原型），这里就进不去了！
      if (inheritedComponent && inheritedComponent !== objectPrototype) {
        hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
      }
    }

    // 2. 拿到这个对象所有的属性的名字数组（包括不可枚举属性），并把symbols上面的属性名字也整合到keys数组里面
    // 情况一：当sourceComponent为函数的原型时，他的对象的属性名字有如下这些
    // 0: "length"
    // 1: "name"
    // 2: "arguments"
    // 3: "caller"
    // 4: "constructor"
    // 5: "apply"
    // 6: "bind"
    // 7: "call"
    // 8: "toString"
    var keys = getOwnPropertyNames(sourceComponent);

    // 情况一：当sourceComponent为函数的原型时，
    // keys数组在原基础上加东西：9: Symbol(Symbol.hasInstance)
    if (getOwnPropertySymbols) {
      keys = keys.concat(getOwnPropertySymbols(sourceComponent));
    }

    // 3. 获取需要排除的目标/源组件的静态属性
    // 拿到两个组件的 不同类型对应的 必备属性集合对象！（需要排除的相关静态属性）
    // 前者是MEMO_STATICS，后者是REACT_STATICS对象
    var targetStatics = getStatics(targetComponent);
    var sourceStatics = getStatics(sourceComponent);

    // 4. 遍历sourceComponent对象（函数原型、大Component、自定义的需要被包裹的类组件）的属性
    // 需要排除的东西是：
    // KNOWN_STATICS（已知的属性）（函数、对象和数组的一些基本的属性）、
    // sourceStatics（源组件的React的静态属性）（REACT_STATICS内容）、
    // targetStatics（目标组件已存在的属性）（MEMO_STATICS内容）、
    // blacklist（黑名单中的属性）（为undefined）
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i];

      if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
        var descriptor = getOwnPropertyDescriptor(sourceComponent, key);

        try {
          // Avoid failures from read-only properties
          defineProperty(targetComponent, key, descriptor);
        } catch (e) {}
      }
    }
  }

  return targetComponent;
}


function getStatics(component) {
  if (isMemo(component)) {
    return MEMO_STATICS;
  }
  return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
}


function isMemo(object) {
  return typeOf(object) === REACT_MEMO_TYPE;
}


function typeOf(object) {
  // 如果时memo虚拟组件的话，$$typeof就是Symbol(react.memo)
  if (typeof object === 'object' && object !== null) {
    var $$typeof = object.$$typeof;

    switch ($$typeof) {
      case REACT_ELEMENT_TYPE:
        // 拿到memo组件的函数本身
        var type = object.type;

        switch (type) {
          case REACT_ASYNC_MODE_TYPE:
          case REACT_CONCURRENT_MODE_TYPE:
          case REACT_FRAGMENT_TYPE:
          case REACT_PROFILER_TYPE:
          case REACT_STRICT_MODE_TYPE:
          case REACT_SUSPENSE_TYPE:
            return type;

          // 拿到memo组件的函数本身的$$typeof属性，此时为空，返回undefined
          default:
            var $$typeofType = type && type.$$typeof;

            switch ($$typeofType) {
              case REACT_CONTEXT_TYPE:
              case REACT_FORWARD_REF_TYPE:
              case REACT_LAZY_TYPE:
              case REACT_MEMO_TYPE:
              case REACT_PROVIDER_TYPE:
                return $$typeofType;

              default:
                return $$typeof;
            }

        }

      case REACT_PORTAL_TYPE:
        return $$typeof;
    }
  }

  return undefined;
}





function _objectWithoutPropertiesLoose(r, e) {
  // 入参：
  // r表示这个memo组件的props，实际上是空
  // e是一个数组，长这样["reactReduxForwardedRef"]

  if (null == r) return {};

  // 遍历props的属性（不包括原型上面的属性），删除掉数组_exclude里面的属性键值对
  // 如果数组_exclude里面没有props的属性, 就保存到一个新对象里面
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (e.includes(n)) continue;
    t[n] = r[n];
  }
  return t;
}



function defaultSelectorFactory(dispatch, _ref) {
  finalPropsSelectorFactory(dispatch, _ref)
}





function finalPropsSelectorFactory(dispatch, _ref) {
  // 入参：
  // dispatch来自于store工具箱的函数
  // _ref是所有信息和工具的汇总（被包裹的类对象、MapStateToProps、MapDispatchToProps等函数）

  // 把这个信息大杂烩的对象里面不要的属性去掉
  let {initMapStateToProps, initMapDispatchToProps, initMergeProps} = _ref,
  options = _objectWithoutPropertiesLoose(_ref, _excluded);

  // 分别执行三个初始化函数
  const mapStateToProps = initMapStateToProps(dispatch, options);
  const mapDispatchToProps = initMapDispatchToProps(dispatch, options);
  const mergeProps = initMergeProps(dispatch, options);

  if (process.env.NODE_ENV !== 'production') {
    verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps);
  }

  return pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, options);
}









// REVIEW - <Provider store={store}> Provider函数组件




function Provider({
  store,
  context,
  children,
  serverState,
  stabilityCheck = 'once',
  noopCheck = 'once'
}) {

  // 缓存一个工具箱对象（仓库变化了就要重新建立这个工具箱）
  const contextValue = React.useMemo(() => {
    const subscription = createSubscription(store);
    return {
      store,
      subscription,
      getServerState: serverState ? () => serverState : undefined,
      stabilityCheck,
      noopCheck
    };
  }, [store, serverState, stabilityCheck, noopCheck]);

  // 缓存过去的state结果
  const previousState = React.useMemo(() => store.getState(), [store]);

  // 页面绘制DOM之后，！同步！开始订阅！
  useLayoutEffect(() => {

    const { subscription } = contextValue;
    // 把通知函数给到监听函数
    subscription.onStateChange = subscription.notifyNestedSubs;
    // 开始订阅之后，后面：交互发生了——>执行dispatch函数——>遍历store的listener数组执行监听函数（notify函数）——>遍历内部的listener数组执行子监听函数
    subscription.trySubscribe();

    // 前后state不一样，直接执行通知函数，直接触发内部的listener数组函数，不需要等待交互发生
    if (previousState !== store.getState()) {
      subscription.notifyNestedSubs();
    }

    // 返回取消订阅的函数
    return () => {
      subscription.tryUnsubscribe();ConnectFunction
      subscription.onStateChange = undefined;
    };
  }, [contextValue, previousState]);

  // 返回一个provider，提供的信息是store、订阅工具箱
  const Context = context || ReactReduxContext;

  return React.createElement(Context.Provider, {value: contextValue}, children);
}




function createSubscription(store, parentSub) {
  // 入参：
  // store是仓库工具包
  // parentSub是父级订阅对象（为undefined）

  // 本函数的目的是：同时维护 Store 的直接订阅和 内部的嵌套订阅管理。
  // 1）直接订阅 Store 的代价高：
  // 如果每个组件都直接订阅 Store，每次 dispatch 会触发所有组件的监听器，导致大量重复计算。

  // 2）订阅树的作用：
  // 通过嵌套订阅，只有顶层订阅直接绑定 Store（就是<Provider>组件的useLayoutEffect钩子），子组件通过父组件间接订阅。
  // 当状态变化时，父订阅先触发，再按需通知子订阅，减少不必要的更新。

  // 例子：1000个子组件
  // 直接订阅：每次 dispatch 触发 1000 次回调。
  // 嵌套订阅：父订阅触发 1 次，通过条件判断仅通知 10 个需要更新的子组件。
  // function handleChangeWrapper() {
  //   if (shouldUpdateChildren) {
  //     listeners.notify()
  //   }
  // }


  // 定义一些变量
  let unsubscribe;
  let listeners = nullListeners;
  let subscriptionsAmount = 0;
  let selfSubscribed = false;

  // 添加嵌套订阅
  function addNestedSub(listener) {
    // 订阅listeners.notify到store的listener数组中，到时外部状态变化时，这个notify函数发出通知
    // 并创建本createSubscription函数组件的listeners数组
    trySubscribe();

    // 开始订阅listener到本createSubscription函数组件的listeners数组中
    // 实际上这个listener是一个子监听函数
    // 【到交互发生的时候】，顶层的store执行的只是notify函数发出通知，触发所有 “子订阅” 的回调
    const cleanupListener = listeners.subscribe(listener);
    let removed = false;

    // 返回清理函数
    return () => {
      if (!removed) {
        removed = true;
        // 移除监听器
        cleanupListener();
        tryUnsubscribe();
      }
    };
  }


  // 状态变化时，通知嵌套订阅
  function notifyNestedSubs() {
    listeners.notify();
  }

  // store订阅的listener函数：
  // 状态变化时（交互发生了——>执行dispatch函数——>遍历listener数组执行监听函数）触发的是以下函数
  // （onStateChange实际上一般在外部被覆盖为notifyNestedSubs，也就是listeners.notify()）
  function handleChangeWrapper() {
    if (subscription.onStateChange) {
      subscription.onStateChange();
    }
  }

  // 检查自身订阅状态
  function isSubscribed() {
    return selfSubscribed;
  }

  // 激活订阅
  // 如果已经正在订阅中，不再重新订阅
  // 也就是说listener是逐个实现，完毕之后才订阅下一个的
  function trySubscribe() {
    subscriptionsAmount++;

    if (!unsubscribe) {
      // parentSub为true，则新的订阅放到嵌套到父级订阅（这个变量为undefined）
      // 否则直接订阅store.subscribe，到时候状态变化之后，向listeners发出通知！
      unsubscribe = parentSub ? parentSub.addNestedSub(handleChangeWrapper) : store.subscribe(handleChangeWrapper);
      // 接下来准备到内部的这个createSubscription函数也订阅函数了
      // 创建监听器集合
      listeners = createListenerCollection();
    }
  }

  // 取消订阅
  function tryUnsubscribe() {
    subscriptionsAmount--;

    if (unsubscribe && subscriptionsAmount === 0) {
      unsubscribe();
      unsubscribe = undefined;
      listeners.clear();
      listeners = nullListeners;
    }
  }

  // 管理自身订阅
  function trySubscribeSelf() {
    if (!selfSubscribed) {
      selfSubscribed = true;
      trySubscribe();
    }
  }

  function tryUnsubscribeSelf() {
    if (selfSubscribed) {
      selfSubscribed = false;
      tryUnsubscribe();
    }
  }

  const subscription = {
    addNestedSub,
    notifyNestedSubs,
    handleChangeWrapper,
    isSubscribed,
    trySubscribe: trySubscribeSelf,
    tryUnsubscribe: tryUnsubscribeSelf,
    getListeners: () => listeners
  };
  return subscription;
}



const nullListeners = {
  notify() {},
  get: () => []
};




