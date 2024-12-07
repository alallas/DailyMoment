let fs = require('fs')

class NodeEnvironmentPlugin {
  constructor(options) {
    this.options = this.options || {}
  }

  apply(compiler) {
    // 定义一下读写文件用哪个模块？？
    compiler.inputFileSystem = fs;
    compiler.outputFileSystem = fs;
  }

}

module.exports = NodeEnvironmentPlugin



