function addToTaskQueue(task) {
  setTimeout(task, 0);
}

class MyPromise {
  constructor() {
    this.promiseResult = null
    this.promiseState = 'pending'
    this.alreadyResolved = false
  }


  _doResolve(value) {
    const self = this;
    if (typeof value === 'object' && value !== null && 'then' in value) {
      addToTaskQueue(function () {
        value.then(
          function onFulfilled(result) {

            // 这里很关键！！！！
            // 这里针对的是这个时候的上下文（then的promise或者外部调用resolve的promise）
            // 即使value是一个无关的，新的promise实例，doResolve的也是针对this上下文来resolve的

            self._doResolve(result);
          },
          function onRejected(error) {
            self._doReject(error);
          }
        );
      });
    } else {
      this.promiseState = 'fulfilled';
      this.promiseResult = value;
      // 如果队列有函数，肯定是异步执行
      this._clearAndEnqueueReactions(this.fulfillReactions);
    }
  }


  resolve(value) {
    if (this.alreadyResolved) return
    this.alreadyResolved = true

    // 一是为了兼容旧的thenable的对象的使用，或解决value是一个promise实例的问题，
    // 不让他立刻fulfilled，让他then函数执行之后，用then函数来resolve改变状态

    // 二是对于非promise函数或thenable对象，直接改变状态，然后异步执行队列里面的函数（self里面）
    this._doResolve(value);

    return this;
  }


  _clearAndEnqueueReactions(reactions) {
    this.fulfillReactions = undefined;
    this.rejectReactions = undefined;

    // 这里是不是应该要写成去执行函数，而不只是包裹函数
    reactions.map(addToTaskQueue);
  }


  then(onFulfilled, onRejected) {
    // 只要then执行了就肯定生成一个已经resolve的promise对象，回调函数肯定异步执行
    // const returnValue = new Promise();

    const self = this;

    const returnValue = new Promise((resolve, reject) => {
      let fulfilledTask;
      if (typeof onFulfilled === 'function') {
        fulfilledTask = function () {
  
          // 执行回调函数
          const r = onFulfilled(self.promiseResult);
  
          // 执行完回调函数之后就使得这个新的promise变成一个状态为fulfilled的promise对象
          resolve(r);
        };
      } else {
        fulfilledTask = function () {
          resolve(self.promiseResult);
        };
      }

      let rejectedTask;
      if (typeof onRejected === 'function') {
        rejectedTask = function () {
          const r = onRejected(self.promiseResult);
  
          // 这里官网写的是resolve，但是我感觉是不是应该写reject(x)
          // https://exploringjs.com/es6/ch_promises.html#sec_demo-promise
  
          resolve(r);
        };
      } else {
        rejectedTask = function () {
          reject(self.promiseResult);
        };
      }
  
      switch (this.promiseState) {
        case 'pending':
          this.fulfillReactions.push(fulfilledTask);
          this.rejectReactions.push(rejectedTask);
          break;
        case 'fulfilled':

          // 这里要注意，fulfilledTask函数里面干两件事，执行回调函数，resolve 当前的then的promise的状态

          // 而看下面的代码，这是被包裹了一层setTimeout的，也就是异步的
          // 这意味着，如果同时遍历很多个then，说明第一个then返回的永远是pending，因为都没有执行resolve，而是等待“等房间”里面上一条任务执行完毕。

          addToTaskQueue(fulfilledTask);
          break;
        case 'rejected':
          addToTaskQueue(rejectedTask);
          break;
      }
    })

    return returnValue;
  }


  // 这个就是Promise.resolve()方法，肯定返回一个已经resolve的状态为fulfilled的promise对象
  // 返回一个promise对象
  static resolve(value) {
    if (value instanceof MyPromise) {
      return value
    }
    return new MyPromise(resovle => resovle(value))
  }


  // 这个就是Promise.all()方法，只要有一个没有返回结果，那就直接报错，退出循环和函数
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) return new Error('not array')
      let resultList = []
      let resultCount = 0
      for (let i = 0; i < promises.length; i++) {
        const cur = promises[i]
        MyPromise.resolve(cur).then(res => {
          resultList[i] = res
          resultCount ++

          if (resultCount === promises.length) {
            return resolve(resultList)
          }
        }, err => {
          return reject(err)
        })
      }
    })
  }
}




