
const Compiler = require('./Compiler.js');
const NodeEnvironmentPlugin = require('./Node/NodeEnvironmentPlugin.js');
const WebpackOptionsApply = require('./WebpackOptionsApply.js');

// 主要干了两件事：
// 目的是创建一个编译器大对象，里面有很多方法，相当于  一个工具包，
// 同时订阅所有的插件

const webpack = (options, callback) => {
  // 创建一个compiler对象，加一个options属性
  let compiler = new Compiler(options.context);
  compiler.options = options;

  // 让compiler具有读写文件的功能
  new NodeEnvironmentPlugin().apply(compiler);

  // 拿到插件，调用apply方法，挂载操作，相当于订阅，此时还没有触发插件函数
  if (options.plugins && Array.isArray(options.plugins)) {
    for (let plugin of options.plugins) {
      plugin.apply && plugin.apply(compiler);
    }
  }

  // 里面有一个make钩子被订阅，到时在compiler里面的run的时候触发

  new WebpackOptionsApply().process(options, compiler);

  return compiler;


}


exports = module.exports = webpack