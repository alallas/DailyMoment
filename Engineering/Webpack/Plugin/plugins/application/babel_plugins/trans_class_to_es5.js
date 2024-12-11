let babel = require('@babel/core'); // babel引擎
let t = require('babel-types'); // 判断某个节是否某个类型，或者生成某个类型的节点

// let classesPlugin = require('babel-plugin-transform-es2015-classes')


let classesPlugin = {
  visitor: {
    ClassDeclaration(path) {
      let node = path.node
      let id = node.id //就是Person

      let newNodes = [];

      let methods = node.body.body; // 拿到的是方法名数组[constructor, getName]
      methods.forEach((item, index) => {
        if(item.kind === 'constructor') {
          // 首先是function Person的部分，构造一个普通函数
          let constructorFunction = t.functionDeclaration(id, item.params, item.body, item.generator, item.async)
          newNodes.push(constructorFunction);
        } else {
          // 其次是原型方法赋值的部分，构造一个AssignmentExpression，left是MemberExpression（a.b这种叫成员表达式），right是FunctionExpression

          let memberExpression = t.memberExpression(
            t.memberExpression(id, t.identifier('prototype')), // 就是Person.prototype
            item.key // 就是getName
          );

          // 注意：这里是functionExpression，因为前面有等于号，而不是functionDeclaration
          let functionExpression = t.functionExpression(null, item.params, item.body, item.generator, item.async);

          let assignmentExpression = t.assignmentExpression('=', memberExpression, functionExpression);
          newNodes.push(assignmentExpression);

        }
      })

      path.replaceWithMultiple(newNodes);

    }
  }
}


let code = `
  class Person {
    constructor(name) {
      this.name = name
    }
    getName() {
      return this.name
    }
  }
`

// babel本身只是一个引擎，不会转换源代码，需要使用插件
let result = babel.transform(code, {
  plugins: [classesPlugin]
})

console.log(result.code)


// 转化成es5应该是这样
// function Person(name) {
//   this.name = name;
// }
// Person.prototype.getName = function () {
//   return this.name;
// }
