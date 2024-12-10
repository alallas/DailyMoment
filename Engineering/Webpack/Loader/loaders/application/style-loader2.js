// style-loader2.js

let loaderUtils = require('loader-utils')

// ! 下面是styleloader只是执行normal的情况

function loader(source) {

  let sourceString = JSON.stringify(source);

  let script = `
    let style = document.createElement('style');
    style.innerHTML = ${'`' + sourceString.substring(1, sourceString.length - 1) + '`'};
    document.head.appendChild(style);
    module.exports = style.innerHTML;
  `


  // 之前旧的版本，不太OK！！！！
  // let script = `
  //   let style = document.createElement('style');
  //   style.innerHTML = ${JSON.stringify(source)};
  //   document.head.appendChild(style);
  // `

  return script;
}




// ! 下面是styleloader只是执行pitch的情况，执行完pitch就给到webpack了

// loader.pitch = function (remainingRequest, previousRequest, data) {

//   // 此时的remainingRequest是 ../loaders/css-loader2.js!../loaders/less-loader2.js!./index.less
//   // 加上感叹号的是只要inlineloader，直接用当前的这个command，不读取rule的配置项了

//   // stringifyRequest把绝对路径转为相对路径
//   // 因为webpack是相对根目录找文件的，所以要转换


//   let script = `
//     let style = document.createElement('style');
//     style.innerHTML = require(${loaderUtils.stringifyRequest(this, '!!' + remainingRequest)});
//     document.head.appendChild(style);
//   `

//   // 接下来：
//   // script给webpack，把脚本转成抽象语法树，然后找依赖，也就是找import或者require
//   // 继续解析内容"!!../loaders/css-loader2.js!../loaders/less-loader2.js!./index.less"
//   // 要解析index.less这文件，找行内loader，以及其他需要这个文件（less）的loader（写在rules里面的）
//   // 因为写了！！，所以只要行内loader
//   // 开始使用css-loader和less-loader，执行他们的pitch（没有），然后读less内容，然后执行less-loader和css-loader的normal

//   return script;
// }


module.exports = loader


