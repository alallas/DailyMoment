let { Tapable, SyncHook } = require('tapable');
const NormalModuleFactory = require('./NormalModuleFactory.js')
const normalModuleFactory = new NormalModuleFactory();
const path = require('path');
const Parser = require('./Parser.js');
const parser = new Parser();




class Compilation {
  constructor(compiler) {
    // super();
    this.compiler = compiler;
    this.options = compiler.options;
    this.context = compiler.context;
    this.inputFileSystem = compiler.inputFileSystem;
    this.outputFileSystem = compiler.outputFileSystem;

    this.entries = []; // 入口模块的数组
    this.modules = []; // 所有模块的数组

    this.hooks = {
      // 成功创建完一个模块之后就会触发这个钩子
      succeedModule: new SyncHook(['module']),
    };
  }

  // context是文件夹的根目录的绝对路径
  // entry是config里面的相对入口路径
  // name是main
  // finalCallback是make函数里面的定义的回调函数
  addEntry(context, entry, name, finalCallback) {
    this._addModuleChain(context, entry, name, (err, module) => {
      finalCallback(err, module);
    })
  }

  _addModuleChain(context, entry, name, callback) {
    // 通过模块工厂先创建一个入口模块
    let entryModule = normalModuleFactory.create({
      name,
      context,
      rawRequest: entry,
      resource: path.posix.join(context, entry), // 入口的绝对路径
      parser,
    });

    this.entries.push(entryModule);
    this.modules.push(entryModule);

    const afterBuild = (err) => {
      return callback(err, entryModule)
    }

    this.buildModule(entryModule, afterBuild)
  }

  // module是要编译的模块
  // afterBuild是编译完成之后的回调
  buildModule(module, afterBuild) {
    // 模块的真正编译逻辑其实是放在module内部完成
    module.build(this, (err) => {

      // 当执行这个回调函数的时候说明模块已经编译完成
      this.hooks.succeedModule.call(module);
      afterBuild(err);
    })
  }



}



module.exports = Compilation



