// 描述对象，描述本次打包的结果

class Stats {
  constructor(compilation) {
    this.entries = compilation.entries;
    this.modules = compilation.modules;
    this.chunks = compilation.chunks;
    this.files = compilation.files; // 文件名数组
  }
  toJson() {
    return this;
  }
}

module.exports = Stats;


