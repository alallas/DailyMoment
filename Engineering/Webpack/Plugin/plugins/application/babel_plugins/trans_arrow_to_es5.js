let babel = require('@babel/core'); // babel引擎
let t = require('babel-types'); // 判断某个节是否某个类型，或者生成某个类型的节点

// 转换箭头函数的插件
// let arrowFunctionPlugin = require('babel-plugin-transform-es2015-arrow-functions')


// 手写转换箭头函数的babel插件

let arrowFunctionPlugin = {
  visitor: {
    // 遍历到ArrowFunctionExpression类型的节点（层级对象）的时候，把响应的路径作为path传入
    // 目的是让这个类型转化为FunctionExpression的类型

    ArrowFunctionExpression: (path) => {
      let node = path.node; // 当前路径的节点对象
      let id = path.parent.id; // 父路径的id，就是父节点的标识符identifier，即函数的名字
      let params = node.params; // 参数
      let body = node.body; // 函数体


      // ****这种是箭头函数后面没有大括号的表达式
      // ****(a, b) => a + b

      // 构造一个returnStatement
      let returnStatement = t.returnStatement(body)
      // 构造一个blockStatement
      let blockStatement = t.blockStatement([returnStatement])

      let functionExpression = t.functionExpression(id, params, blockStatement, node.generator, node.async)

      // 替换节点
      path.replaceWith(functionExpression)



      // ****这种是箭头函数后面有大括号的表达式，且含有this
      // ****{ console.log(this); return a + b; }

      let functionExpression2 = t.functionExpression(id, params, body, false, false);

      // 新造一个 var _this = this 的语句
      let thisVariableDeclaration = t.variableDeclaration('var', [
        t.variableDeclarator(t.identifier('_this'), t.thisExpression())
      ])

      // 让这个新语句在函数体外面，相当于【把箭头函数里面的this变成全局的this】
      let newNodes = [thisVariableDeclaration, functionExpression2]

      path.replaceWithMultiple(newNodes);

    },

    // 把【箭头函数体内】的所有this的标识符转换成_this，以使用刚才新造的_this
    // 注意是箭头函数体，所以才要加上这个callExpression的判断，外面的this不能被替换成_this
    ThisExpression(path) {
      if (path.parent.type === 'CallExpression') {
        path.replaceWith(t.identifier('_this'))
      }
    }
  }
}


let code = `const sum = (a, b) => a + b;`;

let code2 = `const sum = (a, b) => {
  console.log(this);
  return a + b;
};`;

// babel本身只是一个引擎，不会转换源代码，需要使用插件
let result = babel.transform(code2, {
  plugins: [arrowFunctionPlugin]
})

console.log(result.code)


// ****这种是箭头函数后面没有大括号的表达式
// const sum = function (a, b) {
//   return a + b;
// };



// ****这种是箭头函数后面有大括号的表达式，且含有this
// var _this = this;
// const sum = function (a, b) {
//   console.log(_this);
//   return a + b;
// };



