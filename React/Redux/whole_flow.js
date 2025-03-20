
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
// 第一层，也就是第一个<Provider>提供的上下文是包装了store和自己的subscription（父订阅工具箱）
// 第二层，也就是第一个connect组件的provider，提供的上下文是包装了store和自己的subscription（子订阅工具箱）
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




const EMPTY_ARRAY = [null, 0];
const NO_SUBSCRIPTION_ARRAY = [null, null];

var didWarnOld18Alpha = !1
var didWarnUncachedGetSnapshot = !1



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





function createStore(reducer, preloadedState, enhancer) {
  // 入参：
  // reducer是一个函数，就上面combineReducer函数的返回值 (相当于包装过的reducer函数, 执行所有reducer的)
  // preloadedState是applyMiddleware的返回值（一个二重嵌套函数）createStore => (reducer, preState) => {}
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

var thunk = createThunkMiddleware();
function createThunkMiddleware(extraArgument) {
  const middleware = ({ dispatch, getState }) => (next) => (action) => {
    if (typeof action === "function") {
      return action(dispatch, getState, extraArgument);
    }
    return next(action);
  };
  return middleware;
}





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
    // 最后得到的函数是：函数1（函数2（函数3（函数4（dispatch函数））））
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




// 当一个action创造者返回的是一个函数，而不是一个action对象，说明这个需要异步执行
// function fetchTitleData() {
//   return function(diapatch) {
//     axios.get("http://123.207.32.32:8000/home/multidata").then(res=>{
//       const title=res.data.data.banner.list[0].title;
//       diapatch(changeTitle(title));
//     })
//   }
// }

// dispatch这个函数的时候，首先进入第一个thunk中间件
// 此时的next就是dispatch函数，而当action为函数时，直接执行这个函数，也不dispatch了，因为默认这个函数里面就有dispatch
// const handleAsyncClick = () => {
//   dispatch(actions.fetchTitleData())
// }



// !此外注意！
// 1. 原生的dispatch返回的是action本身，没啥大问题
// 2. 经过中间件改造的升级版dispatch，假设中间件的第一个是thunk（一般第一个是他）
// 2.1 上面的情况下，当action为对象时，他的返回值就是dispatch的返回值，也是一个action对象
// 2.2 而当action为函数时，他返回的是这个函数执行之后的返回值！（一般是一个promise）
// 也就是action函数要写上一个return，才会在dispatch函数执行之后拿到想要的数据

// 例子：下面这个actionCreator函数
// function getHomeList() {
//   return function(dispatch, getState) {
//     return axios.get('http://localhost:3002/api/users').then(res => {
//       let list = res.data
//       dispatch({
//         type: types.SET_HOME_LIST,
//         payload: list
//       })
//     })
//   }
// }
// 我需要自己手动派发（靠useDispatch），而不靠connect的封装，然后拿到改变之后的数据
// 那么就需要依靠thunk返回 函数式action函数的返回值 这个特点，在action函数中return一些东西，然后在dispatch这边能够拿到
Home.loadData = function(store) {
  return store.dispatch(actions.getHomeList())
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

  // 得到初始化的函数（仅仅只是根据参数类型返回的处理函数，这里有点像在分发）！！
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
      // state对象对比是深度对比
      areStatesEqual,
      // 下面三个都是浅度对比
      areStatePropsEqual,
      areOwnPropsEqual,
      areMergedPropsEqual
    };

    function ConnectFunction(props) {
      // （一）拿到上下文对象与connect组件的props，以此拿到store和getState函数
      // 1. 拿到connect组件的props（空对象）
      const [propsContext, reactReduxForwardedRef, wrapperProps] = React.useMemo(() => {
        // 拿不到这个reactReduxForwardedRef，因为一开始的props是空对象
        const { reactReduxForwardedRef } = props,
        // 删除掉props对象里面的一些属性键值对（参照_excluded数组删除）
        wrapperProps = _objectWithoutPropertiesLoose(props, _excluded);
        // 返回筛选过后的props，实际上这三个值都是undefined
        return [props.context, reactReduxForwardedRef, wrapperProps];
      }, [props]);


      // 2. 拿到上下文对象以此拿到store本身和getState函数
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
      
      // （二）初始化mapToProps的数据（使其经过二次加工），并创造一个二级订阅工具箱，包装/缓存真正执行函数和更新订阅函数
      // 3. 执行之前的入参即初始化函数（不同组件不同的、若干个），得到一个【真正执行dispatch或拿到最新state的函数】
      // childPropsSelector实际上就是pureFinalPropsSelector函数
      const childPropsSelector = React.useMemo(() => {
        // 返回的实际上就是pureFinalPropsSelector函数
        return defaultSelectorFactory(store.dispatch, selectorFactoryOptions);
      }, [store]);


      // 4. 创造一个二级订阅工具箱
      const [subscription, notifyNestedSubs] = React.useMemo(() => {
        // 如果传递了mapStateToProps就说明要检测state是否有变化
        if (!shouldHandleStateChanges) return NO_SUBSCRIPTION_ARRAY;

        // 创造一个“二级订阅”工具箱对象，parentSub那边传入顶层父级所创建的订阅工具箱对象（在<Provider>那边创建的）
        const subscription = createSubscription(store, didStoreComeFromProps ? undefined : contextValue.subscription);
        // 然后让里面的通知函数绑定这个工具箱
        const notifyNestedSubs = subscription.notifyNestedSubs.bind(subscription);
        return [subscription, notifyNestedSubs];
      }, [store, didStoreComeFromProps, contextValue]);


      // 把 上下文对象 和 二级的订阅工具箱 放到一个新的内存地址的对象里面
      // 注意：其中这个 二级的订阅工具箱 覆盖了原有的一级订阅工具箱
      const overriddenContextValue = React.useMemo(() => {
        if (didStoreComeFromProps) {
          return contextValue;
        }
        return _extends({}, contextValue, { subscription });
      }, [didStoreComeFromProps, contextValue, subscription]);


      // 5. 用ref保存一些变量
      // 缓存上一次的state和dispatch函数对象信息
      // 即 【真正执行函数】（pureFinalPropsSelector函数）的结果
      const lastChildProps = React.useRef();
      // 保存上一次的connect组件的props
      const lastWrapperProps = React.useRef(wrapperProps);
      const childPropsFromStoreUpdate = React.useRef();
      const renderIsScheduled = React.useRef(false);
      const isProcessingDispatch = React.useRef(false);
      const isMounted = React.useRef(false);
      const latestSubscriptionCallbackError = React.useRef();

      // 绘制页面之后，改变isMounted这个标志着高阶组件加载成功没有的标识
      useLayoutEffect(() => {
        isMounted.current = true;
        return () => {
          isMounted.current = false;
        };
      }, []);


      // 6. 包装这个真正执行的函数（【拿到最新state对象和汇总的dispatch函数的对象】）
      // 这个actualChildPropsSelector只在wrapperProps有值的时候才返回一个缓存
      const actualChildPropsSelector = React.useMemo(() => {
        const selector = () => {
          if (childPropsFromStoreUpdate.current && wrapperProps === lastWrapperProps.current) {
            return childPropsFromStoreUpdate.current;
          }
          // 真正执行函数（实际上就是pureFinalPropsSelector函数）
          return childPropsSelector(store.getState(), wrapperProps);
        };
        return selector;
      }, [store, wrapperProps]);


      // 7. 缓存一个订阅更新函数
      const subscribeForReact = React.useMemo(() => {
        const subscribe = reactListener => {
          if (!subscription) {
            return () => {};
          }
          return subscribeUpdates(shouldHandleStateChanges, store, subscription, childPropsSelector, lastWrapperProps, lastChildProps, renderIsScheduled, isMounted, childPropsFromStoreUpdate, notifyNestedSubs, reactListener);
        };
        return subscribe;
      }, [subscription]);
      

      // 绘制页面之后，使用后面的数组作为参数执行captureWrapperProps函数
      // 这里没有给第三个参数，即dependencies
      useIsomorphicLayoutEffectWithArgs(
        captureWrapperProps,
        [lastWrapperProps, lastChildProps, renderIsScheduled, wrapperProps, childPropsFromStoreUpdate, notifyNestedSubs]
      );

      // （三）调用connect第一入参的函数（入参为真正执行函数和二级订阅工具箱），得到props
      // 8. 真正执行函数，得到的actualChildProps就是state和dispatch汇总的信息对象
      let actualChildProps;
      try {
        actualChildProps = useSyncExternalStore(
          subscribeForReact, 
          actualChildPropsSelector,
          getServerState
            ? () => childPropsSelector(getServerState(), wrapperProps) 
            : actualChildPropsSelector
        );
      } catch (err) {
        if (latestSubscriptionCallbackError.current) {
          err.message += `\nThe error may be correlated with this previous error:\n${latestSubscriptionCallbackError.current.stack}\n\n`;
        }
        throw err;
      }

      // 绘制页面之后保存信息
      useLayoutEffect(() => {
        latestSubscriptionCallbackError.current = undefined;
        childPropsFromStoreUpdate.current = undefined;
        lastChildProps.current = actualChildProps;
      });


      // （四）创建虚拟DOM，返回经过props传递和二级上下文传递的虚拟DOM
      // 9. 为原来被包裹的类组件创造一个虚拟DOM
      // 因为传给connect第二个括号的参数，只是一个class，而不是一个虚拟DOM
      // 比如Home，而不是<Home />
      // 他的props就是state和dispatch汇总的信息对象
      const renderedWrappedComponent = React.useMemo(() => {
        return (
          React.createElement(WrappedComponent, _extends({}, actualChildProps, {
            ref: reactReduxForwardedRef
          }))
        );
      }, [reactReduxForwardedRef, WrappedComponent, actualChildProps]);


      // 10.再次创建一个上下文对象的provider，并让他的孩子等于类组件
      const renderedChild = React.useMemo(() => {
        // 只要mapStateToProps有值，shouldHandleStateChanges就是true，走下面
        // 注意：其中这个overriddenContextValue里面存的订阅工具箱是二级的订阅工具箱
        if (shouldHandleStateChanges) {
          return React.createElement(ContextToUse.Provider, {
            value: overriddenContextValue
          }, renderedWrappedComponent);
        }
        // shouldHandleStateChanges为false则直接返回这个props被改变的原来的类组件
        return renderedWrappedComponent;
      }, [ContextToUse, renderedWrappedComponent, overriddenContextValue]);

      // 直接返回这个孩子
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



function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}



function useIsomorphicLayoutEffectWithArgs(effectFunc, effectArgs, dependencies) {
  useLayoutEffect(() => effectFunc(...effectArgs), dependencies);
}




// REVIEW - connect函数最后————最后把被包裹组件的属性复制到包裹组件上面


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

    // 4. 在connect组件上添加原来的相应的组件（函数原型、大Component、自定义的需要被包裹的类组件 的属性）
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






// REVIEW - connect函数内部————分发器与初始化函数




// 注意：下面的mapStateToPropsFactory函数
// 只有一种写法是：（一个函数）————>wrapMapToPropsFunc函数————>返回一个proxy，里面有执行函数得到的state对象（某个类型或若干类型杂烩）
// const mapStateToProps=(state)=>({
//   counter:state.counter.counter,
//   banners:state.home.banners,
//   recommends:state.home.recommends,
// })

// 或者
// const mapStateToProps=(state) => state.home

function mapStateToPropsFactory(mapStateToProps) {
  return !mapStateToProps
    ? wrapMapToPropsConstant(() => ({})) 
    : typeof mapStateToProps === 'function' 
      ? wrapMapToPropsFunc(mapStateToProps, 'mapStateToProps') 
      : createInvalidArgFactory(mapStateToProps, 'mapStateToProps');
}




// 注意：下面的mapDispatchToPropsFactory函数
// 一种写法是：（一个函数）————>wrapMapToPropsFunc函数————>返回一个proxy，里面有执行函数得到的state对象（某个类型或若干类型杂烩）
// const mapDispatchToProps=(dispatch)=>({
//   addNumber:(num)=>dispatch(addNumberAction(num)),
//   subNumber:(num)=>dispatch(subNumberAction(num)),
// })
// 另一种写法是：(一个对象)————>wrapMapToPropsConstant函数————>返回一个受到dispatch包裹的action生成器函数集合对象
// const mapDispatchToProps={
//   addNumberAction
// }

function mapDispatchToPropsFactory(mapDispatchToProps) {
  return mapDispatchToProps && typeof mapDispatchToProps === 'object' 
    ? wrapMapToPropsConstant(dispatch => bindActionCreators(mapDispatchToProps, dispatch)) 
    : !mapDispatchToProps 
      ? wrapMapToPropsConstant(dispatch => ({ dispatch })) 
      : typeof mapDispatchToProps === 'function' 
        ? wrapMapToPropsFunc(mapDispatchToProps, 'mapDispatchToProps') 
        : createInvalidArgFactory(mapDispatchToProps, 'mapDispatchToProps');
}




// 注意：下面的三个wrap函数，为什么要采取函数嵌套的方式
// 外层函数wrapMapToPropsFunc是在构造fiber树之前执行的，接受的入参是mapToProps, methodName，这是在执行ReactDOM之前就知道的信息
// 内层函数initProxySelector是在构造fiber树期间执行高阶memo组件的函数时执行的，这个时候接受的入参是dispatch, { displayName }，这是在执行到<Provider>组件之后才拿到的数据（运行时才拿到数据）
// 且内层函数initProxySelector只是在创建高阶memo组件Fiber的时候才需要用到，才需要把map的state对象或汇总的dispatch对象放入props



function wrapMapToPropsFunc(mapToProps, methodName) {
  // 入参：mapToProps要么是mapStateToProps，要么是mapDispatchToProps

  return function initProxySelector(dispatch, { displayName }) {
    // 入参：displayName是`Connect(${wrappedComponentName})`
    // 例如：'Connect(Home)'

    // 下面的函数返回一个函数
    // 但是为了容下分发和递归的逻辑，在一个函数上加了一个方法，使得有两个函数可以用
    // 一个函数专门用于分发，分发去到执行函数那边
    // 另一个函数专门用于递归执行

    // proxy是分发函数，实际上可以等于proxy.mapToProps
    const proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
      // ownProps一般为空
      return proxy.dependsOnOwnProps
        ? proxy.mapToProps(stateOrDispatch, ownProps)
        : proxy.mapToProps(stateOrDispatch, undefined);
    };

    proxy.dependsOnOwnProps = true;

    // proxy.mapToProps函数是递归函数：
    // 首先改变自己的proxy.mapToProps函数为入参函数
    // 1）没有递归情况，去到proxy分发，然后【实际上调用proxy.mapToProps】执行一次
    // 2）有递归情况，去到proxy分发【实际上调用proxy.mapToProps】，相当于调用自身，再次执行，直接覆盖之前的proxy
    proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
      // mapToProps一般是一个函数，
      // 而函数没有dependsOnOwnProps属性，且其length属性为1，dependsOnOwnProps一般被改为false
      proxy.mapToProps = mapToProps;
      proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps);

      // 执行mapToProps函数，参数是（最新的！）state或者Dispatch，得到一个对象：
      // 1）对应的类型的state对象（根据不同的reducer有不同的state对象）
      // 2）一个对象，自定义数据，拿的是state里面不同类型对象的不同数据，有点像大杂烩
      let props = proxy(stateOrDispatch, ownProps);

      // 如果这个mapToProps函数也返回一个函数，那么继续调用，因此可以支持以下形式的mapToProps
      // const mapState = (state, ownProps) => (dispatch) => ({ 
      //   value: state[ownProps.key] 
      // });
      if (typeof props === 'function') {
        proxy.mapToProps = props;
        proxy.dependsOnOwnProps = getDependsOnOwnProps(props);
        props = proxy(stateOrDispatch, ownProps);
      }

      // 确保是一个纯对象
      if (process.env.NODE_ENV !== 'production') verifyPlainObject(props, displayName, methodName);
      
      return props;
    };

    return proxy;
  };
}

function getDependsOnOwnProps(mapToProps) {
  return mapToProps.dependsOnOwnProps ? Boolean(mapToProps.dependsOnOwnProps) : mapToProps.length !== 1;
}



function wrapMapToPropsConstant(getConstant) {
  // getConstant就是一个函数：dispatch => bindActionCreators(mapDispatchToProps, dispatch)

  return function initConstantSelector(dispatch) {
    // 执行上面那个函数，目的是用dispatch函数包裹这个对象里面的每一个函数，得到一个新的对象
    const constant = getConstant(dispatch);
    function constantSelector() {
      return constant;
    }
    constantSelector.dependsOnOwnProps = false;

    // 返回一个函数，这个函数用来获取这个所有的受到dispatch包裹的对象
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

function defaultMergeProps(stateProps, dispatchProps, ownProps) {
  return _extends({}, ownProps, stateProps, dispatchProps);
}






// REVIEW - connect函数内部————归一处理池与整合工厂
// 相当于二次生产的加工厂，对每个传入初始化函数（每个组件都是一个单独的初始化函数）进行执行，得到函数体内信息整合之后的完美形态的对象
// 通过pure工厂整合成一个集合的函数




function defaultSelectorFactory(dispatch, _ref) {
  finalPropsSelectorFactory(dispatch, _ref)
}


function finalPropsSelectorFactory(dispatch, _ref) {
  // 入参：
  // dispatch来自于store工具箱的函数
  // _ref是所有信息和工具的汇总（被包裹的类对象、MapStateToProps、MapDispatchToProps等函数）

  // 把这个信息大杂烩的对象里面不要的属性去掉
  let { initMapStateToProps, initMapDispatchToProps, initMergeProps } = _ref,
  options = _objectWithoutPropertiesLoose(_ref, _excluded);

  // 分别执行三个初始化函数，得到的还是一个函数！
  // 对于传入的是对象来说，得到的函数就是返回一个经过改造的对象
  // 对于传入的是函数来说，得到的函数是一个proxy，执行这个构造函数将会把最新的state或dispatch传入，拿到的是新的state
  const mapStateToProps = initMapStateToProps(dispatch, options);
  const mapDispatchToProps = initMapDispatchToProps(dispatch, options);
  const mergeProps = initMergeProps(dispatch, options);

  // 看有没有以上三个返回的函数有没有dependsOnOwnProps这个属性
  if (process.env.NODE_ENV !== 'production') {
    verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps);
  }

  // 返回的还是一个函数，若这个函数在后面某个地方被执行，那么拿到的将是所有信息的汇总对象
  return pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, options);
}



function verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps) {
  verify(mapStateToProps, 'mapStateToProps');
  verify(mapDispatchToProps, 'mapDispatchToProps');
  verify(mergeProps, 'mergeProps');
}

function verify(selector, methodName) {
  if (!selector) {
    throw new Error(`Unexpected value for ${methodName} in connect.`);
  } else if (methodName === 'mapStateToProps' || methodName === 'mapDispatchToProps') {
    if (!Object.prototype.hasOwnProperty.call(selector, 'dependsOnOwnProps')) {
      warning(`The selector for ${methodName} of connect did not specify a value for dependsOnOwnProps.`);
    }
  }
}


function pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, {
  areStatesEqual,
  areOwnPropsEqual,
  areStatePropsEqual
}) {
  let hasRunAtLeastOnce = false;
  let state;
  let ownProps;
  let stateProps;
  let dispatchProps;
  let mergedProps;

  function handleFirstCall(firstState, firstOwnProps) {
    // 入参：
    // firstState是最新的state，firstOwnProps就是connect组件的经过筛选过的props对象（一般情况都是空）
    state = firstState;
    ownProps = firstOwnProps;

    // 执行真正的“执行”函数，第二个参数一般为空
    // 得到state某个类别的数据或自定义的数据对象 + dispatch执行函数的集合对象
    stateProps = mapStateToProps(state, ownProps);
    dispatchProps = mapDispatchToProps(dispatch, ownProps);
    // 整合上面所有的结果到一个新的内存地址对象中
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    hasRunAtLeastOnce = true;
    // 直接返回这个对象！长这样：(包括dispatch函数和state数据)
    // {
    //   user: 1,
    //   multipleUser: (...args) => dispatch(multipleUser(...args))
    // }
    return mergedProps;
  }

  function handleNewPropsAndNewState() {
    stateProps = mapStateToProps(state, ownProps);
    if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  }

  function handleNewProps() {
    if (mapStateToProps.dependsOnOwnProps) stateProps = mapStateToProps(state, ownProps);
    if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  }

  function handleNewState() {
    const nextStateProps = mapStateToProps(state, ownProps);
    const statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps);
    stateProps = nextStateProps;
    if (statePropsChanged) mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  }

  // 在checkIfSnapshotChanged函数中，再一次执行了pureFinalPropsSelector函数，因此进入下面
  // 但是从childPropsSelector(store.getState(), wrapperProps)进入时，nextOwnProps都是空对象
  function handleSubsequentCalls(nextState, nextOwnProps) {
    // 浅对比新旧wrapperProps（一般都是空对象）————实际上执行的是shallowEqual
    // （ownProps在首次执行的时候被之前的wrapperProps（一般都是空对象）赋予了）
    const propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);

    // 深度对比最新的state对象（注意，只是state对象，不包含dispatch的函数）
    // ————实际上执行的是strictEqual
    const stateChanged = !areStatesEqual(nextState, state, nextOwnProps, ownProps);

    // 保存一下数据
    state = nextState;
    ownProps = nextOwnProps;

    // 分发，看哪个变化了，就去执行哪个的 “ 更新函数 ”
    if (propsChanged && stateChanged) return handleNewPropsAndNewState();
    if (propsChanged) return handleNewProps();
    if (stateChanged) return handleNewState();

    // 返回的是更新过后的整合数据！
    // 如果没变，还是一样的内存地址，
    // 如果变了，每次执行mergeProps（相当于() => defaultMergeProps）都会创造一个新的内存地址的对象
    return mergedProps;
  }

  return function pureFinalPropsSelector(nextState, nextOwnProps) {
    // 外部执行入参为(store.getState(), wrapperProps)
    // hasRunAtLeastOnce首次执行为false
    return hasRunAtLeastOnce
      ? handleSubsequentCalls(nextState, nextOwnProps)
      : handleFirstCall(nextState, nextOwnProps);
  };
}



function shallowEqual(objA, objB) {
  if (is(objA, objB)) return true;

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }

  return true;
}






// REVIEW - connect函数内部————真正执行函数（【拿到最新state对象和汇总的dispatch函数的对象】）






function useSyncExternalStore(subscribe, getSnapshot) {
  // 入参：
  // 从connect组件进来的
  // 1. subscribe就是缓存的订阅更新函数
  // reactListener => {
  //   if (!subscription) {
  //     return () => {};
  //   }
  //   return subscribeUpdates(
  //     shouldHandleStateChanges,
  //     store,
  //     subscription,
  //     childPropsSelector,
  //     lastWrapperProps,
  //     lastChildProps,
  //     renderIsScheduled,
  //     isMounted,
  //     childPropsFromStoreUpdate,
  //     notifyNestedSubs,
  //     reactListener
  //   );
  // };
  // 2. getSnapshot就是缓存的actualChildPropsSelector，即childPropsSelector，实际上就是pureFinalPropsSelector函数
  // 真正执行函数（【真正执行dispatch或拿到最新state的函数】）
  // childPropsSelector入参为(store.getState(), wrapperProps);


  // 从useSelector进来的
  // 1. subscribe是subscription.addNestedSub（父亲的订阅工具箱（provider的））
  // 2. getSnapshot就是下面的函数
  // function () {
  //   return memoizedSelector(getSnapshot());
  // },


  didWarnOld18Alpha || void 0 === React.startTransition ||
    ((didWarnOld18Alpha = !0),
    console.error(
      "You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."
    ));


  // 从connect组件进来的
  // 拿到的是一个对象(包括dispatch函数和state数据)
  // {
  //   user: 1,
  //   multipleUser: (...args) => dispatch(multipleUser(...args))
  // }
  // 从useSelector进来的
  // 拿到的是一个对象(仅包括选择过的state数据)
  var value = getSnapshot();

  // didWarnUncachedGetSnapshot默认是false
  // 再执行一次pureFinalPropsSelector，看是不是内存地址不一样，默认必须不一样，因为是纯函数
  if (!didWarnUncachedGetSnapshot) {
    var cachedValue = getSnapshot();
    objectIs(value, cachedValue) ||
      (console.error(
        "The result of getSnapshot should be cached to avoid an infinite loop"
      ),
      (didWarnUncachedGetSnapshot = !0));
  }

  // 把当前的state和dispatch函数对象缓存起来
  cachedValue = useState({
    inst: { value: value, getSnapshot: getSnapshot }
  });
  var inst = cachedValue[0].inst, forceUpdate = cachedValue[1];

  // 绘制页面之后，再一次用新的信息对象和函数覆盖之前的，检查是否需要强制更新
  // 如果需要强制更新就把inst（为什么用旧的？？）更新给useState维护的信息
  // 同时使用useLayoutEffect和useEffect
  useLayoutEffect(
    function () {
      inst.value = value;
      inst.getSnapshot = getSnapshot;
      checkIfSnapshotChanged(inst) && forceUpdate({ inst: inst });
    },
    [subscribe, value, getSnapshot]
  );
  useEffect(
    function () {
      checkIfSnapshotChanged(inst) && forceUpdate({ inst: inst });

      // 从connect进来：
      // 执行subscribeUpdates（里面的参数函数是subscribeUpdates的最后一个入参），返回卸载函数
      // 从useSelector进来：
      // 直接执行subscription.addNestedSub（父亲的订阅工具箱（provider的））（不用trySubscribe了）
      return subscribe(function () {
        checkIfSnapshotChanged(inst) && forceUpdate({ inst: inst });
      });
    },
    [subscribe]
  );

  // 代码debug用的
  useDebugValue(value);

  // 返回最新的state和dispatch信息对象
  return value;
}


function checkIfSnapshotChanged(inst) {
  var latestGetSnapshot = inst.getSnapshot;
  inst = inst.value;
  // 内存地址比较，如果不同就返回true，表明已经内存地址变化了
  // 正常来说一般都要变化（因为是纯函数）
  try {
    var nextValue = latestGetSnapshot();
    return !objectIs(inst, nextValue);
  } catch (error) {
    return !0;
  }
}


var objectIs = "function" === typeof Object.is ? Object.is : function is(x, y) {
  return (x === y && (0 !== x || 1 / x === 1 / y)) || (x !== x && y !== y);
}






// REVIEW - connect函数内部————订阅函数（也可以说是添加监听函数）相关






function captureWrapperProps(lastWrapperProps, lastChildProps, renderIsScheduled, wrapperProps, childPropsFromStoreUpdate, notifyNestedSubs){
  // 保存connect组件的props对象（为空对象）
  lastWrapperProps.current = wrapperProps;
  renderIsScheduled.current = false;

  // childPropsFromStoreUpdate.current为空，什么时候有值？？
  // subscribeUpdates函数中，当新旧props不一样的时候，childPropsFromStoreUpdate.current的值为新props的值
  // 也就是说只有在更新且新旧props不一样的时候，这个通知函数才会执行。
  // 此时说明store数据有变，在“二级订阅”工具箱对象内执行通知函数，遍历执行二级工具箱内部的listeners函数（实际上为空）
  if (childPropsFromStoreUpdate.current) {
    childPropsFromStoreUpdate.current = null;
    notifyNestedSubs();
  }
}


// 这个函数目前来看只在connect的useEffect钩子里面会执行
function subscribeUpdates(
  shouldHandleStateChanges, 
  store, 
  subscription, 
  childPropsSelector, 
  lastWrapperProps, 
  lastChildProps, 
  renderIsScheduled, 
  isMounted, 
  childPropsFromStoreUpdate, 
  notifyNestedSubs, 
  additionalSubscribeListener
){
  // shouldHandleStateChanges是指 如果传递了mapStateToProps就说明要检测state是否有变化
  // 传递了mapStateToProps的话，shouldHandleStateChanges就是true，不走下面
  if (!shouldHandleStateChanges) return () => {};

  let didUnsubscribe = false;
  let lastThrownError = null;

  const checkForUpdates = () => {
    // 到useEffect进来时，isMounted.current为true，已经完成了加载
    // 如果还没有加载完或者已经取消订阅，就直接退出函数
    if (didUnsubscribe || !isMounted.current) {
      return;
    }

    const latestStoreState = store.getState();
    let newChildProps, error;

    // 执行childPropsSelector(store.getState(), wrapperProps);
    // 实际上就是执行pureFinalPropsSelector，拿到最新的state和dispatchAction的汇合对象
    try {
      newChildProps = childPropsSelector(latestStoreState, lastWrapperProps.current);
    } catch (e) {
      error = e;
      lastThrownError = e;
    }
    // 没错误的话更新一下标识
    if (!error) {
      lastThrownError = null;
    }

    // 如果前后的对象一致，就在“二级订阅”工具箱对象上发出通知，通知调用的是二级订阅工具箱的listeners数组
    // 但是这个时候的二级订阅工具箱的listeners对象之上的函数保存的listen链表为空，因为她根本就没有子组件来为她trySubscribe，然后addNestedSub
    
    // 有值的情况是（这个connect组件下层还有组件也是被connect包裹，他也有一个useEffect在父级的工具箱（通过provider的上下文value拿到工具箱）订阅了自己的checkForUpdates函数）
    // 前后的对象一致，就不更新这个组件，直接把本层组件的listeners数组遍历执行，这个数组里面存的是下一层子组件的订阅工具箱的checkForUpdates
    if (newChildProps === lastChildProps.current) {
      if (!renderIsScheduled.current) {
        notifyNestedSubs();
      }
    } else {
      // 前后对象不一致，更新信息
      lastChildProps.current = newChildProps;
      childPropsFromStoreUpdate.current = newChildProps;
      renderIsScheduled.current = true;

      // 并执行传递过来的最后一个参数
      // 从connect组件的useEffect进来的最后一个参数是：
      // function () {
      //   checkIfSnapshotChanged(inst) && forceUpdate({ inst: inst });
      // }
      // 执行上面函数，再次检查是否正确，然后更新useState的信息为旧的？？
      additionalSubscribeListener();
    }
  };

  // 将onStateChange替换为这个“监听变化——进行通知”的函数本身
  subscription.onStateChange = checkForUpdates;

  // 首次在子组件（connect组件内）执行trySubscribe，也就是手动在父订阅工具箱（Provider）上面订阅监听函数

  // 自己这个子订阅工具箱执行trySubscribe，首先执行trySubscribeSelf，然后执行trySubscribe
  // function trySubscribeSelf() {
  //   if (!selfSubscribed) {
  //     selfSubscribed = true;
  //     trySubscribe();
  //   }
  // }
  // function trySubscribe() {
  //   subscriptionsAmount++;
  //   if (!unsubscribe) {
  //     unsubscribe = parentSub ? parentSub.addNestedSub(handleChangeWrapper) : store.subscribe(handleChangeWrapper);
  //     listeners = createListenerCollection();
  //   }
  // }
  // 在父订阅工具箱上面订阅监听函数，
  // 这个时候的handleChangeWrapper就是执行的自己（connect组件）的工具箱内部的subscription的onStateChange，也就是上面被改成的checkForUpdates函数
  subscription.trySubscribe();

  // 先直接检查是否有变化，没有变化的话通知自己这个订阅工具箱的所有函数执行了（实际上是没有的）
  checkForUpdates();

  // 最后返回一个卸载函数，给到connect组件的useEffect的返回值（destory函数）
  const unsubscribeWrapper = () => {
    didUnsubscribe = true;
    subscription.tryUnsubscribe();
    subscription.onStateChange = null;

    if (lastThrownError) {
      throw lastThrownError;
    }
  };

  return unsubscribeWrapper;
}







// REVIEW - <Provider store={store}> Provider函数组件 以及 订阅相关函数




function Provider({
  store,
  context,
  children,
  serverState,
  stabilityCheck = 'once',
  noopCheck = 'once'
}) {

  // 缓存一个“二级订阅”工具箱对象（仓库变化了就要重新建立这个工具箱）
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
  // 此次订阅是唯一一次在store仓库里面订阅，后面的订阅都由下层组件在本subscription工具包内订阅
  useLayoutEffect(() => {
    const { subscription } = contextValue;
    // 把通知函数给到监听函数
    subscription.onStateChange = subscription.notifyNestedSubs;
    // 开始订阅之后，后面：交互发生了——>执行dispatch函数——>遍历store的listener数组执行监听函数（notify函数）——>遍历下层？内部？的listener数组执行子监听函数
    // 这里给store的笼子里面放的是自己的订阅工具箱的notifyNestedSubs的监听函数（遍历的是Provider自己的这个listeners链表的函数）
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

  // 注意：在函数内进行函数声明的作用是让这些函数私有化！
  // 每次执行createSubscription都会重新创建一个新的内存地址的这些工具函数，因为这个subscription工具箱每个组件都可以创建一个


  // 定义一些变量
  let unsubscribe;
  let listeners = nullListeners;
  let subscriptionsAmount = 0;
  let selfSubscribed = false;

  // 添加嵌套订阅
  function addNestedSub(listener) {
    // 订阅listeners.notify到父级的listeners中，到时外部状态变化时，这个notify函数发出通知
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

  // 激活订阅（实际上是为父订阅者订阅函数！在这里仅仅是为自己创造一个listener的工具箱和闭包）
  // 为父订阅者订阅什么函数呢？！订阅自己本身的onStateChange函数！！！
  // 如果已经正在订阅中，不再重新订阅
  function trySubscribe() {
    subscriptionsAmount++;

    if (!unsubscribe) {
      // parentSub为true，则新的订阅放到嵌套到父级订阅
      // 否则直接订阅store.subscribe，到时候状态变化之后，向listeners发出通知！
      // （只有在顶层的<Provider>的parentSub才是undefined，也就是store里面的listeners数组只有一个监听函数）
      // 之后下层的memo高阶组件，往父级的工具箱执行addNestedSub，首先给父级创造了一个store里面的监听函数，然后给父级自己的工具箱里面的listener函数添加了监听函数
      unsubscribe = parentSub ? parentSub.addNestedSub(handleChangeWrapper) : store.subscribe(handleChangeWrapper);

      // 接下来准备到内部的这个createSubscription函数也订阅函数了
      // 创建全新的监听器集合，里面的作用域用来保存对应的数据，并提供一系列方法
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




function createListenerCollection() {
  // 这个作用域内记录 监听函数链表 的头和尾
  const batch = getBatch();
  let first = null;
  let last = null;

  // 每次都返回一个新对象
  return {
    clear() {
      first = null;
      last = null;
    },

    notify() {
      // 这里的batch就等于batchedUpdates$1
      batch(() => {
        // 遍历当前的listener链表
        let listener = first;
        while (listener) {
          listener.callback();
          listener = listener.next;
        }
      });
    },

    get() {
      let listeners = [];
      let listener = first;

      while (listener) {
        listeners.push(listener);
        listener = listener.next;
      }

      return listeners;
    },

    // 订阅
    subscribe(callback) {
      // 创建一个对象（包含函数信息）
      let isSubscribed = true;
      let listener = last = {
        callback,
        next: null,
        prev: last
      };

      // 放到链表里面
      if (listener.prev) {
        listener.prev.next = listener;
      } else {
        first = listener;
      }

      // 返回一个卸载函数
      return function unsubscribe() {
        if (!isSubscribed || first === null) return;
        isSubscribed = false;

        if (listener.next) {
          listener.next.prev = listener.prev;
        } else {
          last = listener.prev;
        }

        if (listener.prev) {
          listener.prev.next = listener.next;
        } else {
          first = listener.next;
        }
      };
    }

  };
}


function getBatch() {
  return batchedUpdates$1
}


function batchedUpdates$1(fn, a) {
  // 这里的fn就是：
  // () => {
  //   let listener = first;
  //   while (listener) {
  //     listener.callback();
  //     listener = listener.next;
  //   }
  // }

  // 一开始的isBatchingUpdates是false的！
  var previousIsBatchingUpdates = isBatchingUpdates;
  isBatchingUpdates = true;
  try {
    return fn(a);
  } finally {
    isBatchingUpdates = previousIsBatchingUpdates;
    // 因为还在rendering所以退出了，为什么还在render？？
    // 因为在commitPassiveEffects的函数的一开始就让isRendering为true了
    if (!isBatchingUpdates && !isRendering) {
      performSyncWork();
    }
  }
}









// REVIEW - 函数组件的useDispatch和useSelector钩子函数
// 函数组件不需要connect连接者，只是需要一个工具
// （类似把每个组件都有的connect函数脱离组件，自己提供数据给组件，而不是附到组件身上）



// 1. 【useDispatch】就是下面createDispatchHook的返回值

const useDispatch = createDispatchHook();

function createDispatchHook(context = ReactReduxContext) {
  // createDispatchHook没有传递上下文，默认值就是顶层的上下文（包含store和顶层provider的subscription）
  const useStore = context === ReactReduxContext ? useDefaultStore : createStoreHook(context);
  return function useDispatch() {
    // 执行这个函数，就是下面函数的返回的函数，相当于执行useDefaultReduxContext
    // 拿到store之后，直接返回dispatch函数
    const store = useStore();
    return store.dispatch;
  };
}


function createStoreHook(context = ReactReduxContext) {
  const useReduxContext = context === ReactReduxContext ? useDefaultReduxContext : createReduxContextHook(context);
  return function useStore() {
    // 这里相当于执行useDefaultReduxContext，就是下面函数的返回值的函数
    // 解构上下文，拿到里面的store
    const {store} = useReduxContext();
    return store;
  };
}


function createReduxContextHook(context = ReactReduxContext) {
  return function useReduxContext() {
    // 从顶层的上下文拿到这个value对象
    const contextValue = useContext(context);
    if (process.env.NODE_ENV !== 'production' && !contextValue) {
      throw new Error('could not find react-redux context value; please ensure the component is wrapped in a <Provider>');
    }
    // 直接返回这个value对象
    return contextValue;
  };
}





// 2. 【useDispatch】就是下面createSelectorHook的返回值
// 采用闭包是因为createSelectorHook导出的时候直接创建了一个useSelector，注意，只是一个！！
// 每个组件内部使用这个函数，都指向的同一个内存地址，并且共享同样的上层作用域，也就是useReduxContext这个变量可以随时拿到

// 但是不会导致内存泄漏吗？
// 如果不使用useReduxContext这个变量，（或者说不执行useSelector这个函数然后使用这个变量），这个内存就会被垃圾回收掉



const useSelector = createSelectorHook();

function createSelectorHook(context = ReactReduxContext) {
  // 这里在找缓存！
  const useReduxContext = context === ReactReduxContext ? useDefaultReduxContext : createReduxContextHook(context);
  return function useSelector(selector, equalityFnOrOptions = {}) {
    // selector是一个函数，state是她的参数

    // 拿出第二参数的一些属性，一般useSelector不传递第二个参数
    const {
      equalityFn = refEquality,
      stabilityCheck = undefined,
      noopCheck = undefined
    } = typeof equalityFnOrOptions === 'function' ? {
      equalityFn: equalityFnOrOptions
    } : equalityFnOrOptions;

    // 下面执行的是useReduxContext函数
    // 拿到的是顶层上下文对象(其中的subscription是顶层的provider组件的订阅器)
    const {store, subscription, getServerState, stabilityCheck: globalStabilityCheck, noopCheck: globalNoopCheck} = useReduxContext();

    // 包装并缓存这个第一入参的selector函数
    // selector.name是selector的函数名字，如果传的是箭头函数，那么这个name就是空字符串
    const wrappedSelector = useCallback({
      [selector.name](state) {
        // 执行这个selector函数，参数为state
        const selected = selector(state);
        // 直接返回这个执行结果
        return selected;
      }
    }[selector.name], [selector, globalStabilityCheck, stabilityCheck]);

    const selectedState = useSyncExternalStoreWithSelector(subscription.addNestedSub, store.getState, getServerState || store.getState, wrappedSelector, equalityFn);

    useDebugValue(selectedState);
    return selectedState;
  };
}



function useSyncExternalStoreWithSelector(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
  // 入参：
  // subscribe是subscription.addNestedSub（父亲的订阅工具箱）
  // getSnapshot是store.getState
  // 如果上下文对象里面的getServerState为空，getServerSnapshot还是store.getState
  // selector是包装过的useSeletor的入参函数。类似于state => state.home
  // isEqual 是 useSelector的第二个参数，为undefined

  var instRef = useRef(null);


  // 初始走下面的逻辑，为instRef赋予值，总之是拿到inst对象
  if (null === instRef.current) {
    var inst = { hasValue: !1, value: null };
    instRef.current = inst;
  } else inst = instRef.current;


  // 缓存/定义对比函数，得到目标state值
  const selectorRef = useMemo(
    function () {
      function memoizedSelector(nextSnapshot) {
        // nextSnapshot是最新的state（完整的state对象）
        // 本函数的目标是先明确是一个纯函数（深度对比完整对象），然后深度对比 经过选择的对象

        // memoizedSnapshot：存储完整的 state 对象（即 getSnapshot() 的原始结果）。
        // memoizedSelection：存储通过 selector 从 state 中提取的特定数据。

        // 1. 看过去和现在的 “ 自定义 ” 的state对象选的数据是不是一样的
        // 第一次走这个函数的时候，hasMemo是false，走下面的逻辑：inst为null不走内部的if，直接返回最新的提取的state对象，然后以后都不走这个函数了
        // 这个if只有第一次会走（memo会缓存结果，因此不会再进入外部函数，自然外部函数的hasmemo也不会变成!1）
        if (!hasMemo) {
          hasMemo = !0;
          // 这是最新的完整state对象
          memoizedSnapshot = nextSnapshot;
          // 这是最新的提取的state对象
          nextSnapshot = selector(nextSnapshot);

          // !第一次因为inst为null所以不会走下面
          if (void 0 !== isEqual && inst.hasValue) {
            // 这是目前的/过去的提取的state对象
            var currentSelection = inst.value;
            // 对比新旧的这个 “ 自定义 ” 的state对象，如果相同的话直接返回之前的数据，不相同的话直接返回最新的数据
            // 也就是看前后选择的是不是一样的数据
            if (isEqual(currentSelection, nextSnapshot))
              return (memoizedSelection = currentSelection);
          }

          // 直接返回最新的结果
          return (memoizedSelection = nextSnapshot);
        }

        // 2. 深度对比新旧的 “ 完整 ” 的state对象【按道理肯定是不一样的，因为是纯函数】
        // 第二次走下面的逻辑（因为已经有了有值的memoizedSelection（经过选取的特定对象）和memoizedSnapshot（完整state对象））
        currentSelection = memoizedSelection;
        // 深度对比！两个完整state对象的内存地址，如果是一样的直接返回之前的那个所选结果
        if (objectIs(memoizedSnapshot, nextSnapshot))
          return currentSelection;

        // 3. 深度对比新旧的选择的state（ “ 自定义 ” 的state对象）数据是否相同
        // 重新执行函数，得到最新的结果
        var nextSelection = selector(nextSnapshot);
        // 比较新旧的选择的state是否相同，相同的话直接返回过去的结果
        if (void 0 !== isEqual && isEqual(currentSelection, nextSelection))
          return (memoizedSnapshot = nextSnapshot), currentSelection;
          // 上面相当于
          // memoizedSnapshot = nextSnapshot;
          // return currentSelection;

        memoizedSnapshot = nextSnapshot;
        // 新旧选的state不同则返回最新的结果
        return (memoizedSelection = nextSelection);
      }

      // 定义一些变量，通过函数内定义的方式持久化在内存中
      var hasMemo = !1,
        memoizedSnapshot,
        memoizedSelection,
        // getServerSnapshot为空时，maybeGetServerSnapshot也为空
        maybeGetServerSnapshot =
          void 0 === getServerSnapshot ? null : getServerSnapshot;

      return [
        function () {
          return memoizedSelector(getSnapshot());
        },
        // getServerSnapshot不为空的时候，数组第二个元素是memoizedSelector的再次调用的返回值
        null === maybeGetServerSnapshot
          ? void 0
          : function () {
              return memoizedSelector(maybeGetServerSnapshot());
            }
      ];
    },
    [getSnapshot, getServerSnapshot, selector, isEqual]
  );

  // 执行【对比函数】，得到目标值
  // useSyncExternalStore这个函数就是：connect函数内部的真正执行函数（【拿到最新state对象和汇总的dispatch函数的对象】）
  // 到时候执行第二个入参，然后返回第二个入参的返回值，也就是：选择的state数据的对象
  var value = useSyncExternalStore(subscribe, selectorRef[0], selectorRef[1]);


  // 当 value 变化时，更新 inst 中的缓存值，供后续选择器逻辑复用
  // 放在页面绘制之后异步执行了，不是很重要，但是也要执行的
  useEffect(
    function () {
      inst.hasValue = !0;
      inst.value = value;
    },
    [value]
  );

  // 
  useDebugValue(value);
  return value;
};

const refEquality = (a, b) => a === b;

