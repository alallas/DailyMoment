function normal(source) {
  console.log('async-normal')
  return source + '//async-normal'
}

normal.pitch = function () {
  // 调用async方法，把loader从同步改成异步
  // 改成异步之后，当前的loader执行结束后不会立即向下执行下一个loader
  // 需要手动调用callback方法,callback的入参是1.err 2.这个loader的返回值

  let callback = this.async();
  console.log('async-pitch', new Date())
  setTimeout(() => {
    callback(null)
  }, 3000)
  
}

module.exports = normal

