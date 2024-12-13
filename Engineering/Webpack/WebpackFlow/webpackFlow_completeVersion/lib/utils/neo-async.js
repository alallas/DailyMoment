let async = require('neo-async');

let arr = [1, 2, 3]
console.time('cost')

// 同时开始，全部结束之后再打印console.timeEnd()
// 相当于一个并行的任务处理封装函数

function forEach(arr, callback, finalCallback) {
  let total = arr.length;
  function done() {
    if (--total === 0) {
      finalCallback()
    }
  }
  arr.forEach(item => {
    callback(item, done)
  })
}


// 上面的forEach就是async.forEach()的源码
// 这里在演示async.forEach()执行的入参传递
forEach(arr, (item, done) => {
  setTimeout(() => {
    done();
  }, 1000*item)
}, () => {
  console.timeEnd('cost')
})





