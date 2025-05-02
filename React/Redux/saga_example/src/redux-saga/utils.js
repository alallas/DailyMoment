export function createAllStyleChildCallbacks(effects, parentCallback) {
  // effects是gen函数数组
  // parentCallback就是外部控制all之后走向的next函数

  // 这里为什么要用这种方式去处理一个数组
  // 因为有可能外部传入的不是一个数组而是一个对象
  // all({add1: add1(), add2: add2()})
  const keys = Object.keys(effects);

  const totalCount = effects.length;
  let completeCount = 0;
  let results = new Array(totalCount);
  
  const childCallbacks = {};
  function checkEnd() {
    if (completeCount === totalCount) {
      parentCallback(results);
    }
  }
  // 每个对应的gen函数都指定一个完成函数
  // （保存结果，标记数量，检查是否结束(如果结束的话就执行外部的next函数)）
  keys.forEach(key => {
    childCallbacks[key] = (res) => {
      console.log('child yield', res)
      results[key] = res;
      completeCount++;
      checkEnd();
    }
  })

  return childCallbacks

}



