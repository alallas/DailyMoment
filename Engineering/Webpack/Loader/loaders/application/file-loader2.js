// file-loader2.js

// let { getOptions, interpolateName } = require('loader-utils')
const path = require('path')

function getOptions(loaderContext) {
  // query的逻辑是 loader.options || loader.query
  // 这里的核心目标是保证导出的query是一个对象
  const query = loaderContext.query;
  if (typeof query === 'string' && query !== '') {
    return parseQuery(loaderContext.query)
  }
  if (!query || typeof query !== 'object') {
    return null
  }
  return query;
}


function parseQuery(query) {
  return query.split('&').reduce((accum, item) => {
    if (item.startsWith('?')) {
      item = item.replace(/^\?+/, '')
    }
    let [key, value] = item.split('=');
    accum[key] = value;
    return accum;
  }, {})
}


function interpolateName(loaderContext, name, options) {
  let filename = name || '[hash].[ext]';


  // 拿到原来的扩展名
  let ext = path.extname(loaderContext.resourcePath).slice(1);
  // 根据内容生成一个hash
  let hash = require('crypto').createHash('md5').update(options.content).digest('hex')

  // 用真实值替换占位符
  filename = filename.replace(/\[hash\]/ig, hash).replace(/\[ext\]/ig, ext);

  return filename;

}


function loader(content) {

  // 拿到配置的选项
  let options = getOptions(this) || {}
  // 拿到改过的hash文件名
  let filename = interpolateName(this, options.filename || '[hash].[ext]', {
    content
  })

  // 向输出文件夹（dist）里面加新的文件
  // 目的是可以在main.js里面直接引用当前文件夹下面的xx图片
  this.emitFile(filename, content)
  
  // 相当于把图片变成了一个js文件，可以导出他的名字
  // 我在require('./xx.png')的时候，可以直接拿到exports对象里面的default的值，也就是图片文件名
  return `export default ${JSON.stringify(filename)}`;
}

// 加载的是二进制，需要让content是buffer
loader.raw = true;
module.exports = loader