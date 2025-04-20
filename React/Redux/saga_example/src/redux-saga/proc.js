import * as effectTypes from './effectTypes';


// 这里就是在遍历执行迭代器的next方法，直到装饰器函数的yield被执行完毕

function proc(env, iterator) {
  // 里面的next函数其实相当于是对原来迭代器的单个next函数的递归化增强
  function next(args) {
    let result;
    result = iterator.next(args);
    if (!result.done) {
      // 这个函数里面执行【递归】逻辑，入参是上一个yield的返回值（是一个统一格式的effect对象）
      runEffect(result.value, next);
    }
  }
  next();
}


function runEffect(effect, next) {
  // 入参：
  // 第一个参数，为什么result就是effect，因为在rootsaga那边yield后面就是effect函数的返回值
  // 比如take({type: "wrap-add"})，实际上这个take函数的返回值就是：
  // { type: 'wrap-add'， payload: { pattern: { type: 'wrap-add' }【这里的pattern就是take函数的入参的原封不动的样子】 } }
  
  if (effect) {
    // 处理不同的effect类型所对应的不同的执行逻辑，从一个地方找到对应的类型的函数
    const effectRunner = effectRunnerMap[effect.type];
    effectRunner(env, effect.payload, next, { runEffect })
  }
  
  
  next();
}


export default proc;