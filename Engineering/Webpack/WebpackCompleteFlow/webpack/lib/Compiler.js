const { AsyncParallelHook, Tapable, SyncBailHook, AsyncSeriesHook, SyncHook } = require('tapable')
const NormalModuleFactory = require('./NormalModuleFactory.js')
const Compilation = require('./Compilation.js');
const Stats = require('./Stats.js');

class Compiler {
  constructor(context) {
    // super();
    this.context = context;
    this.hooks = {

      // context是项目根目录的绝对路径，当前的文件夹的绝对路径
      // entry是入口文件的路径，也就是写在config里面的相对路径./src/index.js
      entryOption: new SyncBailHook(['context', 'entry']),

      // 运行相关钩子
      beforeRun : new AsyncSeriesHook(['compiler']),
      run : new AsyncSeriesHook(['compiler']),

      // 编译相关钩子
      beforeCompile: new AsyncSeriesHook(['params']),

      compile: new SyncHook(['params']),
      // 这是在webpack.js里面挂载的钩子，用来处理入口js（读写操作）
      // make是compile里面的一部分
      make: new AsyncParallelHook(['compilation']),

      // 开始一次新的编译
      thisCompilation: new SyncHook(['compilation', 'params']),
      // 创建完成一个新的compilation
      compilation: new SyncHook(['compilation', 'params']),

      afterCompile: new AsyncSeriesHook(['compilation']),




    }
  }

  // 开始编译的入口
  run(callback) {
    console.log('run ing----')

    // 编译完成之后的最终函数
    const finalCallback = (err, stats) => {
      callback(err, stats);
    }

    const onCompiled = (err, compilation) => {
      finalCallback(err, new Stats(compilation))
    }

    this.hooks.beforeRun.callAsync(this, err => {
      this.hooks.run.callAsync(this, err => {
        this.compile(onCompiled);
      })
    })

  }

  compile(onCompiled) {
    // 拿到模块工厂工具集（同时也是compilation的入参）
    const params = this.newCompilationParams();
    // 编译开始前
    this.hooks.beforeCompile.callAsync(params, err => {
      // 编译开始
      this.hooks.compile.call(params);
      // compilation创建开始
      const compilation = this.newCompilation(params);

      // 然后开始make，make完的时候，说明所有的module已经被编译完成了
      // compilation里面的_source和_ast数组已经充满了
      this.hooks.make.callAsync(compilation, err => {
        console.log('make done!');
        onCompiled(err, compilation);
      })
    });
  }

  newCompilationParams() {
    const params = {
      normalModuleFactory: new NormalModuleFactory(),
    }
    return params;
  }

  newCompilation(params) {
    const compilation = this.createCompilation();
    this.hooks.thisCompilation.call(compilation, params);
    this.hooks.compilation.call(compilation, params)
    return compilation
  }
  createCompilation() {
    return new Compilation(this);
  }


}

module.exports = Compiler

