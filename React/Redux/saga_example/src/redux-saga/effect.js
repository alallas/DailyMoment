import * as effectTypes from "./effectTypes";

// 统一一下effect函数返回值，是这样一个对象
const makeEffect = (type, payload) => {
  return { type, payload };
};

// 也就是take函数的payload就是一个对象，里面有pattern属性
export function take(pattern) {
  return makeEffect(effectTypes.TAKE, { pattern });
}

export function put(pattern) {
  return makeEffect(effectTypes.PUT, { pattern });
}

// take函数生成的effect对象格式是这样
// {
//   type: 'PUT',
//   payload: {
//     pattern: 'wrap-add'
//   }
// }

// put函数生成的effect对象格式是这样
// {
//   type: 'PUT',
//   payload: {
//     pattern: {
//       type: 'wrap-add',
//       payload: /* 用户自己传入的参数 */
//     }
//   }
// }

export function fork(fn) {
  return makeEffect(effectTypes.FORK, { fn });
}

export function takeEvery(pattern, saga) {
  // 外面的这个saga也是一个装饰器函数function*
  function* takeEveryHelper() {
    while (true) {
      // 监听某个对应的子类型
      yield take(pattern);
      // 一旦外部dispatch对应的wrap指令之后，执行channel的put函数，拿出队列的next函数，回到这里继续往下
      // 然后开启一个新的子线程，不会阻塞当前的saga
      // 这个子线程就专门负责的是put(指令是真正的action指令)
      // 然后就去执行put effect函数（也就是去真正的dispatch）
      // 等到传入的saga结束之后，会回到外层的next函数，也就是本层（takeEveryHelper）的next，继续往下执行，继续take监听
      yield fork(saga);
    }
  }
  return fork(takeEveryHelper);
}

// 相当于fork是执行传入的迭代器，
// 然后完了之后外层还要执行next，假设内层阻塞了，先让外层的gen函数执行完
// 当外部触发dispatch也就是put函数，拿出以前的next函数执行，之前内部的gen函数阻塞的逻辑，需要继续执行

export function call(fn, ...args) {
  return makeEffect(effectTypes.CALL, { fn, args });
}

export function cps(fn, ...args) {
  return makeEffect(effectTypes.CPS, { fn, args });
}

export function all(effects) {
  return makeEffect(effectTypes.ALL, effects);
}

export function cancel(task) {
  return makeEffect(effectTypes.CANCEL, task);
}

function delayP(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const delay = call.bind(null, delayP);
