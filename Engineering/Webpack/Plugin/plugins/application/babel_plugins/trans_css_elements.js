const fs = require('fs');
const path = require('path');
const cssTree = require('css-tree');
const cssPath = path.join(__dirname, 'input.css');

let transformPxToRem = async function(cssPath) {
  let cssString = fs.readFileSync(cssPath, 'utf8');
  let cssAstTree = cssTree.parse(cssString);

  // 每遍历一个节点，执行这个函数里面的东西，传入node
  cssTree.walk(cssAstTree, function(node) {
    if (node.type === 'Dimension' && node.unit === 'px') {
       node.value = node.value / 75;
       node.unit = 'rem';
    }
  })

  let output = cssTree.generate(cssAstTree)
  fs.writeFileSync(path.join(__dirname, 'output.css'), output, function(){
    console.log('output', output)
  })
}


transformPxToRem(cssPath)


