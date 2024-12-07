
class SingleEntryPlugin {
  constructor(context, entry, name) {
    this.context = context;
    this.entry = entry;
    this.name = name;
  }

  apply(compiler) {
    compiler.hooks.make.tapAsync('SingleEntryPlugin', (compilation, callback) => {
      const { context, entry, name } = this;
      // 从这个入口开始编译入口文件
      compilation.addEntry(context, entry, name, callback);

      console.log('SingleEntryPlugin running-------------');
    })
  }

}

module.exports = SingleEntryPlugin


