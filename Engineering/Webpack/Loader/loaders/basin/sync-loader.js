function normal(source) {
  console.log('sync-normal')
  return source + '//sync-normal'
}

normal.pitch = function () {
  console.log('sync-pitch')
  // 有返回值，回退！
  return '11111'
}

module.exports = normal


// sync同步的loader包括四种类型：
// post、inline、normal、pre
// 执行顺序是从后往前，pre到post，有时候只执行inline（前有!!的时候）


