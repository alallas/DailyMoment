
## 简单原理
### useState和useEffect
- useState
```
// 把历史的状态存起来，（渲染更新过之后可以清除）
let memoizedState  = [];
let currentCursor = 0;

// useState会被调用很多次
function useState(initVal) {
    // 拿出当前的记录，当前的cur指针指向的肯定是新的一个状态
    memoizedState[currentCursor] = memoizedState[currentCursor] || initVal;

    // 存状态，渲染，（实际上应该是状态放入队列，一定的时候才会渲染）
    function setVal(newVal) {
        memoizedState[currentCursor] = newVal;
        render(); 
    }

    // 返回当前state，然后 currentCursor+1，下一次一开始cur指针就是最新的
    return [memoizedState[currentCursor++], setVal]; 
}
```

- useEffect
```
function useEffect(fn, watch) {
  // 检查当前的传入的数组是否和保存起来的一样，判断参数是否变化？
  const hasWatchChange = memoizedState[currentCursor]
    ? !watch.every((val, i) => val === memoizedState[currentCursor][i])
    : true;
  
  // 变化了就执行函数
  if (hasWatchChange) {
    fn();
    
    // 存当前的依赖变量数组
    memoizedState[currentCursor] = watch;
    currentCursor++; // 累加 currentCursor，保证下一次调用useEffect指针指向最新的位置
  }
}
```

使用 Hooks 的注意事项：

- 不要在循环，条件或嵌套函数中调用 Hooks。
- 只在 React 函数中调用 Hooks。

因为我们是根据调用hook的顺序依次将值存入数组中，如果在判断逻辑循环嵌套中，且在执行setState时，发现不用更新，这时WIPhook位于链末尾的地方，然后再次更新时，WIPhook位于开头，就有可能导致更新时不能获取到对应的值，从而导致取值混乱。

### useReducer
```
function useReducer(reducer, initialState) {
    // 相比较于前两个钩子，这个的存储的地方是封装好的useState
    const [state, setState] = useState(initialState);

    // 构造dispatch函数，通知reducer执行action命令，然后把结果存起来
    const update = (state, action) => {
      const result = reducer(state, action);
      setState(result);
    }
    
    // 给出执行结果和透传了state的dispatch函数
    const dispatch = update.bind(null, state);
    return [state, dispatch];
}
```


### useMemo和useCallback
- useMemo
```
function useMemo(fn, deps) {
    // 拿到一整个hook，包括执行结果和依赖变量
    const hook = memoizedState[currentCursor];
    // 拿到依赖变量
    const _deps = hook && hook._deps;
    // 判断依赖变量是否发生变化
    const hasChange = _deps ? !deps.every((v, i) => _deps[i] === v) : true;
    
    // 执行函数拿到最新结果，不然的话直接使用原来的数据
    const memo = hasChange ? fn() : hook.memo;
    // 把当前的结果存起来
    memoizedState[currentCursor++] = {_deps: deps, memo};
    // 返回当前结果
    return memo;
}
```

- useCallback
```
// 相当于把memo的入参的fn（）执行后的结果变为一个函数即fn，因此memo就是fn，优化的是fn
function useCallback(fn, deps) {
    return useMemo(() => fn, deps);
}
```



## 真实的react实现

https://blog.csdn.net/kelly0721/article/details/127495025
https://www.cnblogs.com/bejamin/p/15116546.html

以useState为例子，简化版


0. 总体的架构设计：
- 超级初始的简化版本：
  - 初始定义很多状态和对应的函数——>
  - 交互行为发生需要更新状态，把状态放入队列——>
  - 一定积累后批量更新
- 进化版本：
  - 第一个是挂载才会构建链表存储状态和对应函数。
  - 中间的放队列需要暴露出来作为 setXX的函数，因为很多地方都要用到；
  - 第三个等中间队列有东西再执行，怎么执行？从头到尾（指代码中逐个useState）逐个看其queue是否有东西要更新（相当于又从头到尾执行了一遍各个useState的代码）；
- 再进化版本：
  - 中间函数拉出来之后如何触发第三个批量更新的执行？末尾放一个开关（渲染调度中心），不断调用setXX函数，触发渲染调度中心，不断从头至尾执行useState函数，清空队列
  - 主函数先挂载构建hook表，然后等中间函数队列有东西，且开关打开，批量更新输出state。（第一次useState挂载不用，第二次useState全局更新，（因为中间函数调用且开关打开导致的），state队列肯定有东西，就更新，之后清空）



1. 外部变量：
- fiber：当前处理节点
- workInProgressHook：当前hook的内容，存储state和setState为主
- 当前是渲染阶段还是更新阶段

```
let isMount = true // 是否渲染
let workInprogressHook = null // 当前处理 hook

// Fiber对象
const fiber = {
  stateNode: App,
  memoizedState: null, // 用链表去存储 hook 
}
```


2. 构建hook链表（解决useState多次调用的问题）

```
function useState(initialState) {
  let hook // 当前 hook 节点

  if (typeof initialState === 'function') {
    initialState = initialState();
  }

  if (isMount) {
    // 挂载阶段
    // 初始化当前的hook节点
    hook = {
      memoizedState: initialState,
      next: null,
      // 用队列来保存需要更新的状态
      // 队列是因为有可能有多个更新函数
      // setCount(num => num + 1)
      // setCount(num => num + 1)
      queue: {
        pending: null,
      }
    }

    // 创建 hook 链表
    // 如果是初始化，先存链头
    // 不是的话WIPhook为过去的，hook为当前的，两者相连接
    if (!fiber.memoizedState) {
      fiber.memoizedState = hook
    } else {
      workInprogressHook.next = hook
    }

    // 移动当前的WIPhook指针
    workInprogressHook = hook
  } else {
  
    // 更新阶段
    // 把当前位于fiber.memoizedState的WIPhook指针给到当前的hook，也就是初始化当前的hook为链头hook
    // 指针先后移一位，保证下一次的调用useState的WIPhook指针位置是对的（WIPhook指针在没有更新的时候不会执行链头）
    hook = workInprogressHook
    workInprogressHook = workInprogressHook.next
  }

  // 后面的代码用if限制了只有【setState之后】才能执行
  // 后面还有遍历state链表更新state的代码，但需要先构建state链表

}
```


3. 构建state链表（把state放入队列，等待更新，用来解决多次setState的问题）

```
function dispatchAction(queue, action) {
  // 初始化当前的“更新”节点
  const update = {
    action,
    next: null,
  }

  // 构建state链表——环状链表
  if (queue.pending === null) {
  
    // 初始化，让当前state节点指向自己，自我连接
    update.next = update
  } else {
  
    // 构建【环形链表】的【环】部分
    // 当前state节点指向上一个节点的next，因为一开始上一个节点的next指向他自己，即指向链头
    // 而后面每一个新节点都会指向上一个节点的next， 也就是指向链头
    update.next = queue.pending.next
    
    // 构建【环形链表】的【链】部分
    // 上一个节点指向当前节点
    queue.pending.next = update
  }
  
  // 更新当前节点为hook对象的queue属性
  queue.pending = update
  
  // 实际上这里还做了一个拦截判断，如果发现当前fiber不需要更新，那就return掉
  // fiber.expirationTime === NoWork
  // fiber === currentlyRenderingFiber

  // 触发更新
  schedule()
}
```

关于中间的拦截优化部分：

```
  const alternate = fiber.alternate;
  if (
    fiber === currentlyRenderingFiber ||
    (alternate !== null && alternate === currentlyRenderingFiber)
  ) {
    // This is a render phase update. Stash it in a lazily-created map of
    // queue -> linked list of updates. After this render pass, we'll restart
    // and apply the stashed updates on top of the work-in-progress hook.
    didScheduleRenderPhaseUpdate = true;
    update.expirationTime = renderExpirationTime;
    currentlyRenderingFiber.expirationTime = renderExpirationTime;
  } else {
    if (
      fiber.expirationTime === NoWork &&
      (alternate === null || alternate.expirationTime === NoWork)
    ) {
      // 只保留核心代码
      // ...优化调度渲染
      const currentState: S = (queue.lastRenderedState: any);
      const eagerState = lastRenderedReducer(currentState, action);
      update.eagerReducer = lastRenderedReducer;
      update.eagerState = eagerState;
      if (is(eagerState, currentState)) {
        // Fast path. We can bail out without scheduling React to re-render.
        // It's still possible that we'll need to rebase this update later,
        // if the component re-renders for a different reason and by that
        // time the reducer has changed.
        return;
      }
    }
```

- 第一个条件：需要 render 阶段触发更新
- 第二个条件：fiber.expirationTime 保存的是 fiber 对象的 update的优先级，fiber.expirationTime === NoWork 则意味着 fiber 对象上不存在 update。

总结：update 计算 state 是在 hook 的声明阶段（useState函数内的initialState），在调用阶段还通过内置的 reducer 重新计算 state（setState函数内），如果调用阶段的 state 和声明阶段的 state 是相等的，那么就完全不需要重新开启一次新的调度了。


4. 批量更新state（遍历更新）（注意：仅仅是更新队列的state，还不能渲染呢）
继续useState的函数的下半部分

```
function useState(initialState) {
  let hook // 当前 hook 节点

  if (typeof initialState === 'function') {
    initialState = initialState();
  }

  if (isMount) {
    // 初始化当前的hook节点
    hook = {
      memoizedState: initialState,
      next: null,
      // 用队列来保存需要更新的状态
      // 队列是因为有可能有多个更新函数
      // setCount(num => num + 1)
      // setCount(num => num + 1)
      queue: {
        pending: null,
      }
    }

    // 创建 hook 链表
    // 如果是初始化，先存链头
    // 不是的话WIPhook为过去的，hook为当前的，两者相连接
    if (!fiber.memoizedState) {
      fiber.memoizedState = hook
    } else {
      workInprogressHook.next = hook
    }

    // 更新当前的WIPhook指针
    workInprogressHook = hook
  } else {
  
    // 更新阶段
    // 把当前位于fiber.memoizedState的WIPhook指针给到当前的hook，也就是初始化当前的hook为链头hook
    // 指针先后移一位，保证下一次的调用useState的WIPhook指针位置是对的（WIPhook指针在没有更新的时候不会执行链头）
    hook = workInprogressHook
    workInprogressHook = workInprogressHook.next
  }

  // 后面的代码用if限制了只有【setState之后】才能执行
  // 后面还有遍历state链表更新state的代码，但需要先构建state链表
  
  // 遍历更新函数的环状链表
  
  // 建立一个变量，用来记录最新的state
  let baseState = hook.memoizedState

  if (hook.queue.pending) {
    // 先让指针指向链头，因为hook.queue.pending此时位于链尾，而这是一个环形链表，因此尾部next指向头
    let firstUpdate = hook.queue.pending.next

    do {
      // 执行更新函数，一轮轮更新baseState
      const action = firstUpdate.action
      baseState = action(baseState)
      firstUpdate = firstUpdate.next
    } while (firstUpdate !== hook.queue.pending.next) // 遍历完环状链表

    // 清空链表
    hook.queue.pending = null
  }

  // 此时state更新完了，baseState是最新的，队列最后的state，保存起来
  hook.memoizedState = baseState

  // 输出最新的state，以及透传了hook.queue的dispatchAction函数
  return [baseState, dispatchAction.bind(null, hook.queue)]
}
```


5. 渲染调度中心
用来开启渲染，记得先把WIPhook初始化为链头的hook对象

```
// 调度
function schedule() {
  // 把当前的WIPhook指向链头（fiber.memoizedState之前保存过为链头了）
  workInprogressHook = fiber.memoizedState
  const app = fiber.stateNode()
  isMount = false
  return app
}
```
