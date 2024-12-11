let t = require('babel-types'); // 判断某个节是否某个类型，或者生成某个类型的节点

// let classesPlugin = require('babel-plugin-transform-es2015-classes')

// ！！！这里只针对那些库的工具是分成一个一个js的情况，如果所有的都放在一个大js里面就shake不了了

// tree-shaking是严重依赖es module的，非而es module不能使用tree shaking

// es module是静态依赖，编译的时候就能判断，因为我在import的时候提前把source里面的名字拿出来了。
// require 运行时依赖，不到支持的时候不知道如何依赖
// 比如require(window.xxxx)，我怎么知道你这个里面有啥，必须去里面把所有与文件都读取了，然后导出的exports对象拿到之后才知道是啥



let visitor = {
  // 除了写函数之外还可以写对象
  ImportDeclaration: {
    enter(path, state = {opts}) {
      const specifiers = path.node.specifiers; // 是一个数组，里面是每个导入的模块 [ImportSpecifier, ImportSpecifier]
      const source = path.node.source // 是模块的来源

      // 判断一下来源是不是和options里面要求的是一样的
      // 并且如果导入已经是默认的，那就不用转化了，只处理非默认导入
      if (state.opts.libraries.includes(source.value) && !t.isImportDefaultSpecifier(specifiers[0])) {

        const newNodes = specifiers.map((item) => {
          // 单个模块(默认)
          let importDefaultSpecifier = t.importDefaultSpecifier(item.local)
          // 来源
          let newSource = t.stringLiteral(`${source.value}/${item.imported.name}`)
          return t.importDeclaration([importDefaultSpecifier], newSource)
        })
        path.replaceWithMultiple(newNodes)
      }
    }
  },
}


// 插件的写法
// babel的插件是一个函数，函数返回一个对象，里面有visitor属性
module.exports = function() {
  return {
    visitor
  }
}


