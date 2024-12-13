class Chunk {
  constructor(entryModule) {
    this.entryModule = entryModule;
    this.name = entryModule.name;
    this.async = entryModule.async;

    // 这个代码块生成了哪些文件
    this.files = []
    // 这个代码块一共包含哪些模块
    this.modules = []
  }

}

module.exports = Chunk


