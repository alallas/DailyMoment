
// 向html里面插入script标签，
// 引入lodash等库，自动转为外部模块，直接读window的对象
// 只引入项目中使用的脚本，即使在config里面配置了，我实际的代码没有用到相应的模块，就不要引用（找到项目所有依赖（依赖在ast阶段查找，找到这个阶段的钩子）和配置的external的交集部分）


const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExternalModule = require('webpack/lib/ExternalModule')


class AutoExternalPlugin{
  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    // 先缓存一个this，永远指向插件类的实例
    let _this = this;
    let { options } = this;
    let usedExternalModules = new Set();



    // 2. 引入lodash等库，自动转为外部模块，直接读window的对象

    // webpack module
    // NormalModule普通模块，普通的js模块，由NormalModuleFactory创建
    // 要把普通模块变为一个外部模块

    compiler.hooks.normalModuleFactory.tap('AutoExternalPlugin', (normalModuleFactory) => {

      // 3. 优化：没用的库别引入
      // 这里用到的parser，parser本质上是一个hookmap，映射的是synchook，有两个参数parse和paeseOption
      // 为什么要用hookmap的形式呢？因为parser有很多类型，'javascript/auto'只是其中的一种

      normalModuleFactory.hooks.parser.for('javascript/auto').tap('AutoExternalPlugin', (parser) => {

        // import识别
        // 下面这个hook的执行时机是parser把js转化成ast，然后找里面的import，找到就来执行这个回调函数
        parser.hooks.import.tap('AutoExternalPlugin', (statement, source) => {

          // 这里的statement就是：let $ = require('jquery')，source就是：jquery
          if (options[source]) {
            // 把source模块添加到set里面，且不重复
            usedExternalModules.add(source)
          }
        });

        // require识别
        parser.hooks.call.for('require').tap('AutoExternalPlugin', (expression) => {
          let value = expression.arguments[0].value;
          if (options[value]) {
            usedExternalModules.add(value)
          }
        });
      });




      // ******这是webpack4的旧方法******
      // 拿到了普通模块的工厂
      // 每个工厂都有一个factory，是用来生产模块的钩子
      // 回调根据data创建模块，且提供了一个factory的原本的创建模块的方法

      normalModuleFactory.hooks.factory.tap('AutoExternalPlugin', (factory) => {
        (data, callback) => {

          // data是一个对象，上面的核心信息就是一个要加载的模块：jquery，lodash
          // 正常来说会直接创建模块，并把模块传给callback，没有别的判断逻辑
          // factory(data, callback)

          // 现在要改造这个逻辑，不再统一生成normalModule，normalModule是要被一起打包到main.js的，现在如果某个module已经被cdn引入了，那不需要生成normalModule了

          // 拿到所有要加载的模块的名字
          let request = data.request;

          if (options[request]) {
            let { variable } = options[request] // 拿到$或者_
            
            // 外部模块参数包括：新的变量名字、挂在哪个对象上、旧的模块名字
            let newModule = new ExternalModule(variable, 'window', request)
            callback(null, newModule)

          } else {

            // 走正常的生产逻辑，生成普通模块
            factory(data, callback);
          }
        }
      })




      // ******这是webpack5的新方法******
      // 把factory的方法改成了resolve的方法

      normalModuleFactory.hooks.resolve.tapAsync('AutoExternalPlugin', (resolveData, callback) => {

        let request = resolveData.request;

        if (options[request]) {
          let { variable } = options[request];
          let newModule = new ExternalModule(variable, 'window', request);
          callback(null, newModule)
        } else {
          callback(null);
        }
      });



    })





    // 1. 向html里面插入script标签，
    // 通过监听compilation钩子，可以在compiler开启新编译的时候把compilation传过来
    compiler.hooks.compilation.tap('AutoExternalPlugin', (compilation) => {

      // 这个html的插件可以向compilation里面挂上额外的钩子（getHooks方法），供其他插件使用
      // 相当于compilation.hooks.htmlWebpackPluginAlterAssetTags = new xxx()
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync('AutoExternalPlugin', (htmlPluginData, callback) => {

        // htmlPluginData是一个对象，里面有assetTags属性，表明html里面的script标签的所有信息
        // "assetTags": {
        //   "scripts": [
        //     {
        //       "tagName": "script",
        //       "voidTag": false,
        //       "meta": {
        //         "plugin": "html-webpack-plugin"
        //       },
        //       "attributes": {
        //         "defer": true,
        //         "src": "main.js"
        //       }
        //     }
        //   ],
        //   "styles": [],
        //   "meta": []
        // },

        let scriptsUrl = Object.keys(options).filter(key => usedExternalModules.has(key)).map(key => options[key].url)

        scriptsUrl.forEach(url => {

          let newScript = {
            "tagName": "script",
            "voidTag": false,
            "attributes": {
              "defer": true,
              "src": url
            }
          }

          // 必须要unshift，因为要把库插入到main.js前面，因为main用到这些库
          htmlPluginData.assetTags.scripts.unshift(newScript)
        })

        // 这是异步串行的瀑布流钩子，需要把返回值传入
        callback(null, htmlPluginData)
      })
    })


  }

}

module.exports = AutoExternalPlugin;