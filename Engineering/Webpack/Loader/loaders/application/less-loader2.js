let less = require('less')

function loader(source) {

  // 转化成异步函数
  // 但是实际上，less是同步转化的！
  let callback = this.async();
  less.render(source, { filename: this.resource }, (err, output) => {

    // 直接使用less库的render方法进行解析
    const css = output.css

    // 是倒数第二个loader，中间没有css-loader，直接用写module.exports
    // let code = `module.exports = ${JSON.stringify(css)}`

    // 不是倒数第二个loader，解析完之后直接传入去到下一个
    callback(err, css)

    // 注意！这里解析后会把@import './global.css'变成@import 'global.css'
    // 在cssloader处理的时候要注意！！！

  })
}


module.exports = loader
