function normal(source) {
  console.log('inline')
  return source + '//inline'
}

normal.pitch = function () {
  console.log('pitch 2')
  // 有返回值，回退！
  return '11111'
}

module.exports = normal