class HookCodeFactory {
  // 首先填充_x属性的值为单纯的回调函数数组
  setup(instance, options) {
    this.options = options
    instance._x = options.taps.map(item => item.fn)
  }

  args() {
    return this.options._args.join(',') // [name, age]变成name, age
  }

  // create函数执行的时候，是在syncHook里面执行的，this指向这个钩子的实例，等于Hook的constructor部分
  header() {
    return `var _x = this._x;\n`
  }
  content() {
    return this.options.taps.map((item, index) => (
      `
        var _fn${index} = _x[${index}];\n
        _fn${index}(${this.args()});
      `
    )).join('\n');
  }
  
  create() {
    return new Function(this.args(), this.header() + this.content())
  }
}

module.exports = HookCodeFactory;