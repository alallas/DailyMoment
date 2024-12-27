

class Update {
  constructor(payload) {
    this.payload = payload;
  }
}

// 数据结构是一个单链表
class UpdateQueue {
  constructor() {
    this.firstUpdate = null;
    this.lastUpdate = null;
  }
  enqueueUpdate(update) {
    if (this.lastUpdate === null) {
      this.firstUpdate = this.lastUpdate = update;
    } else {
      this.lastUpdate.nextUpdate = update;
      this.lastUpdate = update;
    }
  }
  forceUpdate(state) {
    // 更新state
    let currentUpdate = this.firstUpdate;
    while(currentUpdate) {
      let nextState = typeof currentUpdate.payload === 'function' ? currentUpdate.payload(state) : currentUpdate.payload
      state = {...state, ...nextState};
    }

    // 更新完state之后把头尾的指针清空
    this.firstUpdate = this.lastUpdate = null;
    return state;
  }
}


export {
  Update,
  UpdateQueue,
};

