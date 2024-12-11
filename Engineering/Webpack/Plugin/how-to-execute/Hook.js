
class Hook {
  constructor(args) {
    if (!Array.isArray(args)) args = [];
    this._args = args; // 用来放参数列表

    this.taps = []; // 用来放钩子函数，存对象 { namw:钩子名称， fn:钩子函数 }
    this._x = undefined;// 存钩子函数，只有函数 [fn1, fn2, fn3...]

  }

  tap(options, fn) {
    // 创造一个对象
    if (typeof options === 'string') {
      options = { name: options }
    }
    options.fn = fn;
    this._inert(options);
  }
  _inert(item) {
    this.taps[this.taps.length] = item;
    // this.taps.push(item);
  }

  call(...args) {
    let callMethod = this._createCall() // 动态编译出一个函数
    return callMethod.apply(this, args); // 然后执行这个函数（注意这个this指向的其实是父类的constructor）
  }
  _createCall() {
    return this.compile({
      taps: this.taps,
      _args: this._args,
    })
  }

}

module.exports = Hook;