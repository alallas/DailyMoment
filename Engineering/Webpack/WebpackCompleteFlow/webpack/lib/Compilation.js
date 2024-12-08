const { Tapable, SyncHook } = require('tapable');
const NormalModuleFactory = require('./NormalModuleFactory.js')
const normalModuleFactory = new NormalModuleFactory();
const path = require('path');
const Parser = require('./Parser.js');
const parser = new Parser();
const async = require('neo-async');
const Chunk = require('./Chunk.js');
const ejs = require('ejs');
const fs = require('fs');


// 代码块模板
const mainTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'main.ejs'), 'utf8')
const mainRender = ejs.compile(mainTemplate);
const chunkTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'chunk.ejs'), 'utf8')
const chunkRender = ejs.compile(chunkTemplate);


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
    this.chunks = [];

    // 输出的时候用
    this.files = [];
    this.assets = {}; // key是文件名字，value是文件内容

    // ! *** 我自己加的，目的是把es6Export的变量名字组成一个数组
    this.es6ExportVariableName = [];

    this.hooks = {
      // 成功创建完一个模块之后就会触发这个钩子
      succeedModule: new SyncHook(['module']),
      seal: new SyncHook(),
      beforeChunk: new SyncHook(),
      afterChunk: new SyncHook(),
    };
  }

  // context是文件夹的根目录的绝对路径
  // entry是config里面的相对入口路径
  // name是main
  // finalCallback是make函数里面的定义的回调函数
  addEntry(context, entry, name, finalCallback) {
    this._addModuleChain(context, entry, name, false, (err, module) => {
      finalCallback(err, module);
    })
  }



  // 源码是这么写的，为了减少写重复代码，对他做一下封装，写到createModule里面
  // 这个初始化entry的阶段就直接调用createModule就好了

  _addModuleChain(context, rawResource, name, async, callback) {

    // // 通过模块工厂先创建一个入口模块
    // let entryModule = normalModuleFactory.create({
    //   name,
    //   context,
    //   rawRequest: entry,
    //   resource: path.posix.join(context, entry), // 入口的绝对路径
    //   parser,
    // });

    // this.entries.push(entryModule);
    // this.modules.push(entryModule);

    // const afterBuild = (err, module) => {

    //   if (module.dependencies.length > 0) {
    //     this.processModuleDependencies(module, err => {
    //       callback(err, module);
    //     })
    //   } else {
    //     callback(err, module);
    //   }
    // }

    // this.buildModule(entryModule, afterBuild)



    this.createModule({
      name,
      context,
      rawResource,
      parser,
      resource: path.posix.join(context, rawResource), // 模块的绝对路径
      moduleId: path.posix.relative(context, path.posix.join(context, rawResource)),
      async,
    }, entryModule => this.entries.push(entryModule), callback)

  }


  // 创建并编译模块,addEntry是指如果模块是入口模块就加入到entries里面，不是的话就什么都不做
  createModule(data, addEntry, callback) {
    // 通过模块工厂先创建一个入口模块
    let module = normalModuleFactory.create(data);
    this.es6ExportVariableName = module.es6ExportVariableName

    addEntry && addEntry(module);
    this.modules.push(module);

    const afterBuild = (err, module) => {
      if (module.dependencies.length > 0) {
        this.processModuleDependencies(module, err => {
          callback(err, module);
        })
      } else {
        callback(err, module);
      }
    }

    this.buildModule(module, afterBuild)
  }





  // module是要编译的模块
  // afterBuild是编译完成之后的回调
  buildModule(module, afterBuild) {
    // 模块的真正编译逻辑其实是放在module内部完成
    module.build(this, (err) => {

      // 当执行这个回调函数的时候说明模块已经编译完成
      this.hooks.succeedModule.call(module);
      afterBuild(err, module);
    })
  }


  // 处理依赖
  // neo-async -d
  processModuleDependencies(module, callback) {
    let dependencies = module.dependencies;

    // 这里要开始遍历依赖，然后同样处理依赖(通过模块工厂建立一个模块，然后保存一下，然后开始buildModule，开始读取文件，然后转换ast，然后遍历ast然后再处理_source)
    // 所有依赖搞完之后才调用callback
    // 如果依赖特别无敌多，需要考虑效率的问题，要求所有任务并行开始


    // 所有模块全部并行开始，如果所有模块都做完了，才会执行callback
    async.forEach(dependencies, (dependency, done) => {
      let { name, context, rawResource, moduleId, resource } = dependency;
      this.createModule({
        name,
        context,
        rawResource,
        parser,
        resource,
        moduleId,
      }, null, done)
    }, callback)
  }

  // 把模块封装成chunk
  seal(callback) {
    this.hooks.seal.call();
    this.hooks.beforeChunk.call();
    // 每个入口生成一个代码块
    for (let entryModule of this.entries) {
      const chunk = new Chunk(entryModule);
      this.chunks.push(chunk)
      // 把module的name和当前的chunk的名字相同的筛选出来
      chunk.modules = this.modules.filter(module => module.name === chunk.name)
    }
    this.hooks.afterChunk.call(this.chunks);

    // 创建代码块对应的资源
    this.createChunkAssets();

    callback();
  }

  createChunkAssets() {
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i]
      const file = chunk.name + '.js'
      let source;
      if (chunk.async) {
        source = chunkRender({
          chunkName: chunk.name,
          modules: chunk.modules,
        })
      } else {
        source = mainRender({
          entryModule: chunk.entryModule,
          modules: chunk.modules,
          entries: this.entries,
          es6ExportVariableName: this.es6ExportVariableName,
        })
      }

      this.emitAssets(file, source);
    }
  }
  emitAssets(file, source) {
    this.assets[file] = source;
    this.files.push(file)
  }
}



module.exports = Compilation



