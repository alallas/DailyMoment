
### createStore
入参是原材料：reducer和state
返回值是通知者、获取最新状态按钮、订阅按钮

PS：为什么要把reducer放到参数上，不直接在内部创建执行，因为reducer是执行状态改变的执行者，需要用户自定义，传入给到store拿到里面最新的state来改state

```
// 主函数createStore
// 返回一个store对象
export default function createStore(reducer, preloadedState, enhancer) {
  // 增强器
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }

    return enhancer(createStore)(reducer, preloadedState)
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }

  let currentReducer = reducer
  let currentState = preloadedState
  let currentListeners = []
  let nextListeners = currentListeners
  let isDispatching = false

  // 获取最终的state
  function getState() {
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
          'The reducer has already received the state as an argument. ' +
          'Pass it down from the top reducer instead of reading it from the store.'
      )
    }

    return currentState
  }

  // dispatch
  // 参数action
  function dispatch(action) {
      // 校验数据类型
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
          'Use custom middleware for async actions.'
      )
    }
    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
          'Have you misspelled a constant?'
      )
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      isDispatching = true

      // 执行传入的reducer函数
      // 返回state，给currentState赋值
      currentState = currentReducer(currentState, action)
    } finally {
        // 一个dispatch执行完，还原状态
      isDispatching = false
    }

    // 执行订阅函数队列
    // dispatch执行的同时会一并执行订阅队列
    const listeners = (currentListeners = nextListeners)
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    // 返回action
    return action
  }

  // 默认执行一次dispatch，做初始化
  dispatch({ type: ActionTypes.INIT })

  // 返回一个store对象
  return {
    dispatch,
    subscribe,
    getState,
    ...
  }
}
```


- 使用：
```
const store = createStore(reducer, initState={}, applyMiddleWare(reduxThunk))
```


### createThunkMiddleware
单个中间件形式

```
function createThunkMiddleware(extraArgument) {
    // 闭包返回三层嵌套
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
```


### applyMiddleware
整合并执行所有中间件

```
export default function applyMiddleware(...middlewares) {
  // 闭包嵌套返回2个方法
  return createStore => (...args) => {
    // 拿到旧的store
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.'
      )
    }

    // 浅复制一个store
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }

    // 整合所有中间件（createThunkMiddleware）
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    // 使用compose执行所有中间件，装饰dispatch
    dispatch = compose(...chain)(store.dispatch)

    // 返回更新过后的store
    return {
      ...store,
      dispatch
    }
  }
}
```


### compose
包裹（装饰）dispatch，执行外部包裹层的所有中间件函数

```
export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }
  if (funcs.length === 1) {
    return funcs[0]
  }

  // 用reduce函数，入参肯定是下一个item，让他成为下一个包裹的对象
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```

