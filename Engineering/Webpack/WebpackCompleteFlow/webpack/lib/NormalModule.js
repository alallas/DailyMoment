
const path = require('path');
const types = require('babel-types')
const generate = require('babel-generator').default;
const traverse = require('babel-traverse').default;
const async = require('neo-async')
const { runLoaders } = require('./loader-runner');


class NormalModule {
  constructor({ name, context, rawResource, resource, parser, moduleId, async }) {
    this.name = name;
    this.context = context;
    this.rawResource = rawResource;
    this.resource = resource; // 绝对路径
    this.parser = parser; // ast解析器，把源代码转化成ast
    this.moduleId = moduleId;

    // 模块对应的源代码，不是模块的路径或名字等信息，而是里面的代码内容
    this._source;
    // 模块对应的抽象语法树
    this._ast;
    // 当前模块的所有依赖的模块信息
    this.dependencies = [];

    // ! *** 我自己加的，目的是把es6Export的变量名字组成一个数组，然后外compilation传。
    this.es6ExportVariableName = [];


    // 当前模块依赖的所有的异步模块（儿子们）
    this.blocks = [];
    // 当前模块是异步的还是同步的（自己本身！！）
    this.async = async;

  }

  build(compilation, callback) {
    // 1. 从硬盘上把模块文件内容读出来，读成一个文本
    // 2. 可能不是一个js模块，需要走loader转化，确保最后出来的都是js模块
    // 3. 把这个js模块经过parser处理成抽象语法树ast
    // 4. 分析ast里面的依赖，
    // 5. 递归编译依赖的模块，直到都完成

    this.doBuild(compilation, err => {
      // 得到语法树
      this._ast = this.parser.parse(this._source);

      // 遍历语法树，过程中修改函数名，并构造moduleID，保存起来，对ast是原地修改
      traverse(this._ast, {

        // 当遍历到CallExpression节点的时候，就会进入回调
        // 因为require就是用的调用表达式，他的callee就是函数名字，argument就是函数的入参（实际参数）
        CallExpression: (nodePath) => {
          let node = nodePath.node;
          if (node.callee.name === 'require') {

            // ! ***把函数名改一下，改成webpack的核心迭代函数
            node.callee.name = '__webpack_require__';

            // 获取模块的名称(有可能有后缀，有可能没有后缀)
            let moduelName = node.arguments[0].value;
            // 依赖的绝对路径
            let depResource;

            // 判断一下哪些是第三方依赖，哪些是自己项目里面的组件依赖
            if(moduelName.startsWith('.')) {
              // 说明是自己的项目组件里面的模块：

              // 获取扩展名字
              let extName = moduelName.split(path.posix.sep).pop().indexOf('.') === -1 ? '.js' : '';

              // 获取依赖模块的绝对路径
              // posix的好处是出来的分隔符永远都是/
              // 拿到当前模块所在的目录，然后拼接上依赖的文件名和扩展名字（这个其实是不是就是resource？？？？？）
              // 这里有一个问题就是：如果我引用的模块和当前模块不在同一个文件夹下面呢？？？？
              depResource = path.posix.join(path.posix.dirname(this.resource), moduelName+extName)

            } else {
              // 否则是第三方模块

              // require.resolve找的是文件夹里面的index.js文件,或者先去package.json里面找main属性对应的文件名是什么
              // 拿到的是绝对路径
              depResource = require.resolve(path.posix.join(this.context, 'node_modules', moduelName))

              // 把window里面的\转化成/
              depResource = depResource.replace(/\\/g, '/')

            }

            // 模块的id
            // 不管是相对的本地模块还是第三方模块
            // 最后所有的moduleID全部都是相对于根目录的一个相对路径
            // 比如
            // ./src/index.js
            // ./node_module/util/util.js
            // 第一个点表示项目根目录
            // 且分割符号一定是/


            // 模块id怎么获取，根目录的./和依赖模块的【除去根目录的路径之后，剩下的路径和名字】
            // 其实就是依赖模块相对于根目录的路径，那不就是config文件里面写的entry入口吗？
            // 因为还有别的非入口模块也要这么处理，非入口模块在config里面没有写，所以拿到根目录，再拿到依赖的路径，再取补集
            // let depModuleId = './' + path.posix.relative(this.context, depResource)

            // 另一种写法更好！！依赖的路径减去根目录的路径：
            let depModuleId = '.' + depResource.substring(this.context.length)

            // moduelName ./content.js
            // depResource D:/aa_qianduan/webpack_learn_test/src/content.js
            // depModuleId ./src/content.js
            // context D:/aa_qianduan/webpack_learn_test

            // ! ***把require()里面的参数改一下，改成相对于根目录的路径
            node.arguments = [types.stringLiteral(depModuleId)]

            this.dependencies.push({
              name: this.name,
              context: this.context, // 根目录路径
              rawResource: moduelName, // 依赖模块的名字（有可能有后缀也可能没有）
              moduleId: depModuleId, // 模块的id，相对于根目录的路径
              resource: depResource, // 模块的绝对路径
            })


          } else if (types.isImport(node.callee)) {
            // 拿到模块的名称
            let moduelName = node.arguments[0].value;
            // 拿到扩展
            let extName = moduelName.split(path.posix.sep).pop().indexOf('.') === -1 ? '.js' : '';
            // 拿到绝对路径
            let depResource = path.posix.join(path.posix.dirname(this.resource), moduelName+extName)
            // 拿到模块id
            let depModuleId = './' + path.posix.relative(this.context, depResource);

            let chunkName = '0'
            // 拿到魔法注释里面的名字
            // webpackChunkname: 'content'
            if (Array.isArray(node.arguments[0].leadingComments) && node.arguments[0].leadingComments.length > 0) {
              let leadingComments = node.arguments[0].leadingComments[0].value;

              let regexp = /webpackChunkName:\s*['"]([^'"]+)['"]/;
              chunkName = leadingComments.match(regexp)[1];
            }

            // 这里的目的是仅仅只是替换import('xxxxxx')的部分，后面的.then()不需要进行替换
            nodePath.replaceWithSourceString(`__webpack_require__.e("${chunkName}").then(__webpack_require__.t.bind(__webpack_require__, "${depModuleId}", 23))`)

            this.blocks.push({
              context: this.context,
              entry: depModuleId,
              name: chunkName, 
              async: true,
            })
          }
        },

        // ! *** 下面两个是我自己加的，目的是转化es6的导出为普通的形式
        ExportDefaultDeclaration: (nodePath) => {
          let node = nodePath.node;
          const exportDefaultValue = node.declaration.value;

          // 新造一个const __WEBPACK_DEFAULT_EXPORT__ = ('title');
          let newNode = types.variableDeclaration(
            'const', 
            [
              types.variableDeclarator(
                types.identifier('__WEBPACK_DEFAULT_EXPORT__'),
                types.stringLiteral(exportDefaultValue)
              )
            ]
          )
          nodePath.replaceWith(newNode);

          this.es6ExportVariableName.push('__WEBPACK_DEFAULT_EXPORT__');
        },

        ExportNamedDeclaration: (nodePath) => {
          let node = nodePath.node;
          const exportVariableName = node.declaration.declarations[0].id.name;
          const exportVariableValue = node.declaration.declarations[0].init.value;

          // 新造一个const age = 'title_age';
          let newNode = types.variableDeclaration(
            'const', 
            [
              types.variableDeclarator(
                types.identifier(exportVariableName),
                types.stringLiteral(exportVariableValue)
              )
            ]
          )
          nodePath.replaceWith(newNode);

          this.es6ExportVariableName.push(exportVariableName);
        }

      });

      // 把转化后的语法树重新生成源代码,覆盖旧的代码
      let { code } = generate(this._ast);
      this._source = code;

      // ! ***这个为什么不放到compilation那里执行呢？？
      // 循环构建每一个异步的代码块,等所有的异步代码构建完之后才去进行下一步。
      async.forEach(this.blocks, (item, done) => {
        let { context, entry, name, async } = item;
        compilation._addModuleChain(context, entry, name, async, done)
      }, callback);
    });
  }

  // 一个中转站，目的是存一下读取出来的源代码
  // 可以理解为准备要build了，但是还没build，要确保所有文件都是js格式,doBuild的do表示准备的意思
  // 以及loader逻辑处理
  doBuild(compilation, callback) {
    this.getSource(compilation, (err, source) => {

      // 把硬盘的内容读出来之后，交给loadRunner进行转换
      let { module: { rules } } = compilation.options;
      let loaders = [];
      for (let i = 0; i < rules.length; i++) {
        let rule = rules[i];
        if (rule.test.test(this.resource)) {
          loaders.push(...rule.use);
        }
      }

      // 把名字转化为绝对路径
      loaders = loaders.map((item) => {
        if (typeof item === 'string') {
          return require.resolve(path.posix.join(this.context, 'loaders', item))
        } else {
          return require.resolve(path.posix.join(this.context, 'loaders', item.loader))
        }
      })

      console.log('loaders', loaders)

      runLoaders({
        resource: this.resource,
        loaders,
      }, (err, { result }) => {
        this._source = result.toString();
        callback()
      })

    });
  }

  // 读取真正的代码
  getSource(compilation, callback) {
    compilation.inputFileSystem.readFile(this.resource, 'utf8', callback)
  }

}


module.exports = NormalModule;

