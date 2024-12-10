let postcss = require('postcss'); // 用来处理css，基于css语法树
let loaderUtils = require('loader-utils');
let tokenizer = require('css-selector-tokenizer');

function loader(cssString) {

  // 转化为异步执行
  let callback = this.async();

  const cssPlugin = (options) => {
    return (cssRoot) => {

      // 遍历每个css文件的规则，找到所有的@import()语句，保存路径到外部
      cssRoot.walkAtRules(/^import$/i, rule => {
        rule.remove(); // 删除这个rule，保证下次遍历不会拿到并push同样的值

        // 拿到资源路径，放到Options里面保存
        // 1. params的形式为“‘./global.css’”，需要把首尾两个双引号去掉
        // 2. 且有可能经过less转换的资源不以./开头，需要判断
        let relResource = rule.params.slice(1, -1) // ‘./global.css’

        if(relResource[1] !== '.') {
          relResource = './' + relResource
        }

        options.imports.push(relResource)
      })

      // 遍历每个css文件的规则，找到所有的url()，改为require形式（改完后覆盖原来的值）
      cssRoot.walkDecls(decl => {
        let values = tokenizer.parseValues(decl.value);
        values.nodes.forEach(item => {
          item.nodes.forEach(item2 => {
            // ! 如果是cssloader作为最后一个loader（不用经过styleLoader）的情况
            // if(item2.type === 'url') {
            //   item2.url = "`+require(" + loaderUtils.stringifyRequest(this, item2.url) + ").default+`";
            // }


            // ! 如果是最后经过了styleloader的情况
            if(item2.type === 'url' && item2.url) {
              item2.url = "`+require(" + item2.url + ").default+`";
            }
          })
        })
        decl.value = tokenizer.stringifyValues(values)
      })
    }
  }


  // 保存所有顶部import的路径
  let options = {
    imports: [], // ["./global.css"]
  };


  // 源代码（每个css文件）会经过流水线的一个个插件（每个css文件都去执行一遍插件）
  // 构造流水线
  let pipeLine = postcss([cssPlugin(options)])


  // 每个css文件处理完所有插件之后，整合所有内容构造本css文件的完整版本
  pipeLine.process(cssString).then(result => {

    // ! 这是最后经过了styleloader的情况
    let importCSS = options.imports.map(url => {
      return '`+require(' + url + ')+`';
    })
    let output = importCSS + "\r\n" + result.css

    // 确保所有的require前面都有引号
    let findRequireQuot = /.*require\((.+?)\).*/gi
    output = output.replace(findRequireQuot, (match, p1, offset) => {
      if (!p1.startsWith("'") && !p1.startsWith('"')) {
        let newUrl = match.replace(p1, `'${p1}'`)
        return newUrl;
      }
    });



    // ! 这是cssloader作为最后一个loader（不用经过styleLoader）的情况：
    // 对于顶部的@import，转化成require去拿文件
    // 且通过inlineLoader的方式先过一遍cssLoader的内容，再得到结果写入module.exports，然后返回值给到父css
    // let importCSS = options.imports.map(url => {
    //   return "`+require(" + loaderUtils.stringifyRequest(this, '!!css-loader2!' + url) + ")+`";
    // })

    // 把顶部@import的内容和自己的css内容合并起来，返回值给stylePitch的返回值，然后给webpack，不用经过styleLoader的normal
    // let output = "module.exports = `" + importCSS + "\r\n" + result.css + "`"

    // url()在遍历的时候已经转化了它的url，所以在这里不需要处理了

    // 开关调用，去下一个
    callback(null, output)

  })
}


// 为什么每个require()前后都要加上`+
// 因为原本的其他部分都是字符串，require是一个表达式
// 通过【结束上一个字符串】+【连接表达式】+【开始下一个字符串】实现，相当于：
// module.export = ` 字符串 `+ require() +` 字符串 `
// （上一行再loader里面输出也是个字符串，在webpack那里会去实现）


module.exports = loader



