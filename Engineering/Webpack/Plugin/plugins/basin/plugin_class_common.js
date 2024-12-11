class DonePlugin {
  apply(compiler) {
    // 同步写法
    compiler.hooks.done.tap('DonePlugin', (state) => {
      // 这个state是一个对象，有modules，chunks，assets三个属性
      console.log('tap done plugin')
    })
    
    // 异步写法
    compiler.hooks.done.tapAsync('DonePlugin', (state, callback) => {
      console.log('tap done plugin callback')
      callback() // 表示异步执行完毕，可以进行下一步
    })
  }
}

module.exports = DonePlugin;

