const randomString = () => Math.random().toString(36).substring(7).split('').join('.')
const ActionTypes = {
  INIT: `@@redux/INIT${randomString()}`,
  REPLACE: `@@redux/REPLACE${randomString()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
}



// reducer是指挥函数
// 



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

  // 返回用于执行说有reducers函数的函数
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




function applyMiddleware(...middlewares) {
  return createStore => (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState)
    let dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.'
      )
    }

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args)
    }
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}



function compose(...funcs) {
  if (funcs.length === 0) {
    // infer the argument type so it is usable in inference down the line
    return (arg) => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args))
  )
}






function createStore(reducer, preloadedState, enhancer) {
  // 入参：
  // reducer是一个函数，就上面combineReducer函数的返回值
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
    // 那么首先运行这个二嵌函数，传入本函数，然后再给予reducer函数和undefined的第二个参数
    // 返回的是一个正常函数，也就是“二嵌函数”的最后一层
    return enhancer(createStore)(
      reducer,
      preloadedState
    )
  }


  // 2. 如果这个createStore没有传入第二个参数：
  // 那么就说明他是一个普通的同步仓库，不涉及中间件（没有异步操作）
  // (1)先定义一些中间变量!
  let currentReducer = reducer
  let currentState = preloadedState
  // currentListeners是当前正在使用的监听器列表
  let currentListeners = new Map()
  // nextListeners是待生效的监听器列表
  let nextListeners = currentListeners
  let listenerIdCounter = 0
  let isDispatching = false

  
  // (2)一些关键函数的定义
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


    // 2. 执行这个reducer函数,也就是combineReducers的返回值
    // 这个函数遍历所有的reducer函数, 执行之后获得 { home: {}, counter: {} }
    try {
      // 传入的参数是state和action:
      // 其中state指的是preloadedState,一开始执行是undefined
      // action来自于dispatch函数的入参
      isDispatching = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    // 让下一次的nextListeners给到currentListeners, 此时两个人的内存地址是一样的
    // 
    const listeners = (currentListeners = nextListeners)
    listeners.forEach(listener => {
      listener()
    })
    return action
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param nextReducer The reducer for the store to use instead.
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error(
        `Expected the nextReducer to be a function. Instead, received: '${kindOf(
          nextReducer
        )}`
      )
    }

    currentReducer = nextReducer

    // This action has a similar effect to ActionTypes.INIT.
    // Any reducers that existed in both the new and old rootReducer
    // will receive the previous state. This effectively populates
    // the new state tree with any relevant data from the old one.
    dispatch({ type: ActionTypes.REPLACE })
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */
  function observable() {
    const outerSubscribe = subscribe
    return {
      /**
       * The minimal observable subscription method.
       * @param observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
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

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
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