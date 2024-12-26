class Update{
  constructor(payload, nextUpdate) {
    this.payload = payload;
    this.nextUpdate = nextUpdate;
  }
}

class UpdateQueue{
  constructor() {
    // 原始状态
    this.baseState = null;
    // 更新链表的第一个更新
    this.firstUpdate = null;
    // 更新链表的最后一个更新
    this.lastUpdate = null;
  }
  enqueueUpdate(update) {
    if (this.firstUpdate === null) {
      this.firstUpdate = this.lastUpdate = update;
    } else {
      // 第二次执行函数往后：
      // 让上一次的最后一个updater的nextState指向当前这次的这个updater对象，指向自己
      this.lastUpdate.nextUpdate = update;
      // 同时需要改变一下最后一个指针的指向
      this.lastUpdate = update;
    }
  }
  forceUpdate() {
    // 拿到初始状态,上一次都还没修改的state
    let currentState = this.baseState || {};
    // 拿到链表的开头
    let currentUpdate = this.firstUpdate;

    while(currentUpdate) {
      let nextState = typeof currentUpdate.payload === 'function' ? currentUpdate.payload(currentState) : currentUpdate.payload
      // 更新当前的state，因为函数调用拿到的state是最新的！！
      currentState = {...currentState, ...nextState};
      // 下一步就是链表往后走了
      currentUpdate = currentUpdate.nextUpdate;
    }

    // 更新完之后需要清空链表的头和尾
    this.firstUpdate = this.lastUpdate = null;
    // 把baseState覆盖一下
    this.baseState = currentState;
    return currentState;
  }
}



let queue = new UpdateQueue();



// 很像v15的更新机制，队列里面加的不仅仅只是状态，而是一个个更新器
// 但区别在于，这些更新器是通过链表来存储的，而不是数组
queue.enqueueUpdate(new Update({ name: 'zyl' }));
queue.enqueueUpdate(new Update({ number: 0 }));
queue.enqueueUpdate(new Update((state) => ({ number: state.number + 1 })));
queue.enqueueUpdate(new Update((state) => ({ number: state.number + 1 })));

queue.forceUpdate();

console.log(queue.baseState)



// 问题：
// 为什么链表可以中断执行，但是栈不可以？？？？？？且栈比较消耗性能
// 时间复杂度上面来说，链表和栈是差不多的

// generator性能差，第一版本浏览器的polyfill代码冗余






