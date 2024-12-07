class NormalModule {
  constructor({ name, context, rawResource, resource, parser }) {
    this.name = name;
    this.context = context;
    this.rawResource = rawResource;
    this.resource = resource; // 绝对路径
    this.parser = parser; // ast解析器，把源代码转化成ast

    // 模块对应的源代码，不是模块的路径或名字等信息，而是里面的代码内容
    this._source;
    // 模块对应的抽象语法树
    this._ast;
  }

  build(compilation, callback) {
    // 1. 从硬盘上把模块文件内容读出来，读成一个文本
    // 2. 可能不是一个js模块，需要走loader转化，确保最后出来的都是js模块
    // 3. 把这个js模块经过parser处理成抽象语法树ast
    // 4. 分析ast里面的依赖，
    // 5. 递归编译依赖的模块，直到都完成

    this.doBuild(compilation, err => {
      this._ast = this.parser.parse(this._source);
      callback();
    });
  }

  // 一个中转站，目的是存一下读取出来的源代码
  doBuild(compilation, callback) {
    this.getSource(compilation, (err, source) => {
      this._source = source;
      callback();
    });
  }

  // 读取真正的代码
  getSource(compilation, callback) {
    compilation.inputFileSystem.readFile(this.resource, 'utf8', callback)
  }

}

module.exports = NormalModule;

