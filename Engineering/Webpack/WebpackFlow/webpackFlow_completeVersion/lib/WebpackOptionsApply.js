// 作用：
// 挂载各种插件

const EntryOptionPlugin = require('./EntryOptionPlugin.js')

class WebpackOptionsApply {
  process(options, compiler) {
    new EntryOptionPlugin().apply(compiler);
    compiler.hooks.entryOption.call(options.context, options.entry)
  }
}

module.exports = WebpackOptionsApply

