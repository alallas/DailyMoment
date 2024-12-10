// url-loader2.js

const { getOptions } = require('loader-utils')
// const mime = require('mime')


function loader(content) {

  // 拿到配置的选项
  let options = getOptions(this) || {};
  let { limit, fallback = 'file-loader' } = options;

  // 把limit转化为数字类型
  if (limit) {
    limit = parseInt(limit, 10);
  }

  // 拿到目标文件的【媒体类型】
  // const mimeType = mime.getType(this.resourcePath); // .jpg变为image/jpeg

  // 如果没有配置limit但是直接用了url-loader，或者图片的大小小于limit的大小
  // 转成base64字符
  if (!limit || content.length < limit) {
    let base64 = `data:image/jpeg;base64,${content.toString('base64')}`

    // loader返回export default只能有一个，且一般是最后一个，经过转换的代码不能有多个export default
    // 二进制文件的导出一般也不会用export default
    return `export default ${JSON.stringify(base64)}`
  } else {

    // 如果大于limit，调用file-loader的函数，拿到返回值
    let fileLoader = require(fallback || 'file-loader')
    return fileLoader.call(this, content);
  }
}

// 加载的是二进制，需要让content是buffer
loader.raw = true;
module.exports = loader