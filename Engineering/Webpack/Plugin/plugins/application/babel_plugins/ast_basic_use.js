let esprima = require('esprima');
let estraverse = require('estraverse');
let escodegen = require('escodegen');


let indent = 0
function padding() {
  return ' '.repeat(indent)
}


let code = `function ast() {}`;
let ast = esprima.parse(code);

estraverse.traverse(ast, {
  // 这里的node相当于一个层级的一个对象
  enter(node) {
    console.log(padding() + node.type + '进入');
    indent+=2;

    if (node.type === 'FunctionDeclaration') {
      node.id.name = 'newAst';
    }
  },
  leave(node) {
    indent-=2;
    console.log(padding() + node.type + '离开');

  }
})

// 打印得到
// Program进入
//   FunctionDeclaration进入
//     Identifier进入
//     Identifier离开
//     BlockStatement进入
//     BlockStatement离开
//   FunctionDeclaration离开
// Program离开


// 相当于Program表示一条语句
// FunctionDeclaration表示这条语句的类型
// Identifier表示这条语句的标识（也就是名字）
// BlockStatement表示这条语句的具体值（函数的块声明，字符串，xxxx）



let newCode = escodegen.generate(ast);
console.log(newCode)

// 打印得到
// function newAst() {
// }


