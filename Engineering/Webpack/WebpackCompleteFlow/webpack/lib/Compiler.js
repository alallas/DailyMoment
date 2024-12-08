const { AsyncParallelHook, Tapable, SyncBailHook, AsyncSeriesHook, SyncHook } = require('tapable')
const NormalModuleFactory = require('./NormalModuleFactory.js')
const Compilation = require('./Compilation.js');
const Stats = require('./Stats.js');
const { mkdirp } = require('mkdirp') 
const path = require('path')

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


      emit: new AsyncSeriesHook(['compilation']),
      done: new AsyncSeriesHook(['stats'])
      

    }
  }

  // 开始编译的入口
  run(finalCallback) {
    console.log('run ing----')

    const onCompiled = (err, compilation) => {

      // 编译完之后生成资源，把资源文件根据模板写入dist文件夹
      this.emitAssets(compilation, err => {

        // 然后最后的最后！！终于！done钩子触发
        let stats = new Stats(compilation);
        this.hooks.done.callAsync(stats, err => {
          finalCallback(err, stats)
        })
      })

    }

    this.hooks.beforeRun.callAsync(this, err => {
      this.hooks.run.callAsync(this, err => {
        this.compile(onCompiled);
      })
    })
  }

  emitAssets(compilation, callback) {
    // 把chunk变成文件，写入硬盘
    // const emitFile = (err) => {

    //   const outputPath = this.options.output.path

    //   const assets = compilation.assets;
    //   for (let file in assets) {
    //     let source = assets[file];
    //     let targetPath = path.posix.join(outputPath, file)
    //     this.outputFileSystem.writeFileSystem(targetPath, source, 'utf8')
    //   }
    //   callback();
    // }

    // 先触发emit的钩子，因为这个钩子被使用的很多，是输出文件的而最后阶段对文件内容的修改。
    this.hooks.emit.callAsync(compilation, () => {
      // 创建一个输出目录，然后再写入文件到目录中, emitFile相当于是callback
      mkdirp(this.options.output.path).then(err => {
        const outputPath = this.options.output.path

        const assets = compilation.assets;
        for (let file in assets) {
          let source = assets[file];
          let targetPath = path.posix.join(outputPath, file)
          this.outputFileSystem.writeFileSync(targetPath, source, 'utf8')
        }
        callback();
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

        // 封装代码块之后，编译就完成了
        compilation.seal(err => {
          this.hooks.afterCompile.callAsync(compilation, err => {
            onCompiled(err, compilation);
          })
        })



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

