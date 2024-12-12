// 更简单版的钩子源码，其实就是订阅发布模式
// 其中，new创建钩子时传入的数组参数没啥用！
// 但是里面的形参需要与实际call的时候传入的实参一一对应上
// 且，tap的前面的name参数没啥用！

class SyncHook {
  constructor() {
    this.taps = []
  }
  tap(name, callback) {
    this.taps.push(callback)
  }
  call(...args) {
    this.taps.forEach(tap => tap(...args))
  }
}

let hook = new SyncHook(['name']);

hook.tap('1', (name) => {
  console.log('name', name)
})

hook.call('33333')
hook.call('22222')

// 打印
// name 33333
// name 22222

