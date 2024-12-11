// 查看资产信息
// 表示打包后的内容，也就是输出的文件

class AssetsPlugin{
  constructor(options) {
    this.options = options
  }
  apply(compiler) {
    // 监听compilation钩子拿到最新的compilation
    compiler.hooks.compilation.tap('AssetsPlugin', (compilation, params) => {

      // 监听chunkAsset钩子拿到每个被添加的chunk和他对应的文件
      compilation.hooks.chunkAsset.tap('AssetsPlugin', (chunk, filename) => {
        console.log('chunk', chunk.name);
        console.log('filename=', filename);

        console.log('compilation.assets=', compilation.assets)

        // compilation.assets是这样一个对象
        // {
        //   'main.js': CachedSource {
        //     _source: ConcatSource { _children: [Array], _isOptimized: false },
        //     _cachedSourceType: undefined,
        //     _cachedSource: undefined,
        //     _cachedBuffer: undefined,
        //     _cachedSize: undefined,
        //     _cachedMaps: Map(0) {},
        //     _cachedHashUpdate: undefined
        //   }
        // }
      })
    })
  }
}

module.exports = AssetsPlugin;

