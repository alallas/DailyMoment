// 插件用来打包所有的产出文件
// 首先要知道产出哪些文件，文件的内容是什么
// 生成一个新文件，添加到输出列表里面，也写入dist

const JSZip = require('jszip');
const { RawSource } = require('webpack-sources')

class ZipPlugin{
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    // emit钩子在生成资源到output目录之前触发，相当于最后一步了
    compiler.hooks.emit.tapAsync('ZipPlugins', (compilation, callback) => {

      let zip = new JSZip();

      // compilation.assets是一个对象，key是文件名，值是源代码
      // 里面包含了chunk的所有js文件
      for (let filename in compilation.assets) {
        // 调用source方法可以获取源码内容
        const source = compilation.assets[filename].source();

        // 向压缩包里面添加一个文件，名字是filename，内容是source
        zip.file(filename, source);

      }
      // 构造压缩包
      zip.generateAsync({ type: 'nodebuffer' }).then(content => {
        // 把压缩包的内容添加回compilation里面，也就是添加到输出列表里面
        compilation.assets[this.options.filename || 'assets.zip'] = new RawSource(content)

        // 下面这个和上面的RawSource是一样的效果，一个对象，里面有source方法，可以拿到源码内容
        // compilation.assets['assets.zip'] = {
        //   source() {
        //     return content;
        //   }
        // }
        callback();
      })


    })
  }
}

module.exports = ZipPlugin;