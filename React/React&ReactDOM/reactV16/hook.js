
let isMount = true // 是否渲染
let workInprogressHook = null // 当前处理 hook

// Fiber对象
const fiber = {
  stateNode: App,
  memoizedState: null, // 用链表去存储 hook 
}



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


// const alternate = fiber.alternate;
// if (
//   fiber === currentlyRenderingFiber ||
//   (alternate !== null && alternate === currentlyRenderingFiber)
// ) {
//   // This is a render phase update. Stash it in a lazily-created map of
//   // queue -> linked list of updates. After this render pass, we'll restart
//   // and apply the stashed updates on top of the work-in-progress hook.
//   didScheduleRenderPhaseUpdate = true;
//   update.expirationTime = renderExpirationTime;
//   currentlyRenderingFiber.expirationTime = renderExpirationTime;
// } else {
//   if (
//     fiber.expirationTime === NoWork &&
//     (alternate === null || alternate.expirationTime === NoWork)
//   ) {
//     // 只保留核心代码
//     // ...优化调度渲染
//     const currentState: S = (queue.lastRenderedState: any);
//     const eagerState = lastRenderedReducer(currentState, action);
//     update.eagerReducer = lastRenderedReducer;
//     update.eagerState = eagerState;
//     if (is(eagerState, currentState)) {
//       // Fast path. We can bail out without scheduling React to re-render.
//       // It's still possible that we'll need to rebase this update later,
//       // if the component re-renders for a different reason and by that
//       // time the reducer has changed.
//       return;
//     }
//   }
// }



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


// 调度
function schedule() {
  // 把当前的WIPhook指向链头（fiber.memoizedState之前保存过为链头了）
  workInprogressHook = fiber.memoizedState
  const app = fiber.stateNode()
  isMount = false
  return app
}

