// hash每次编译都会产生一个hash值，整个项目只要有一个文件发生轻微改变，hash都会改变
// chunkhash是代码块hash，每一个chunk都有自己的hash，每个入口的文件变化只会影响到自己的，其他的直接复用同hash的缓存
// contentHash是内容hash，和内容有关，内容不变就不变（比如外部的css）


// hash的最小单位是chunk

// hash与什么有关系？
// 普通依赖（import和require）
// 异步依赖（import()）
// 模块ID
// usedExport导出对象
// 本次编译的hash


// chunkHash和什么有关系？
// hashSalt的盐值（hash加一些定制的标识语句）
// 代码块的ID
// 代码块的名称
// 代码块包含的模块
// 最终代码的template


// hash生成的流程：
// 拿到每一个module的hash
// 遍历所有的chunk，生成每一个chunkHash，同时生成contentHash（实际上是调用contentHash的call方法，有可能没有）
// 整合所有的chunkhash


class HashPlugin{
  constructor() {
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('HashPlugin', (compilation) => {
      compilation.hooks.afterHash.tap('HashPlugin', () => {


        // webpack把hash值放在了compilation.hash属性上面
        // 相当于如果我要改hash，我只需要直接改compilation.hash属性就可以
        compilation.hash = 'hash' + Date.now();

        // 拿到本次编译的所有的代码块
        let chunks = compilation.chunks;
        for (let chunk of compilation.chunks) {

          // 每个chunkHash计算结果会放在chunk.renderedHash属性里面
          chunk.renderedHash = chunk.name + '_chunkHash';

          // 每个contentHash计算结果会放在chunk.contentHash属性里面
          // 这里的key是因为源码就是这么写的
          chunk.contentHash = { 'javascript': 'contentHash' };
        }


      })
    })
  }

}

module.exports = HashPlugin


