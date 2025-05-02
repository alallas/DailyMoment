import * as effectTypes from "./effectTypes";
import proc from "./proc";
import is from "./is";
import { createAllStyleChildCallbacks } from "./utils";

function runTakeEffect(env, payload, next) {
  // matcher函数的参数是action
  // payload的参数是next执行之后的value里面的（也就是take函数的返回值）的payload对象，里面的pattern保存了take函数参数里面的字符串
  // next就是总调度函数
  const matcher = (input) => input.type === payload.pattern;
  env.channel.take(next, matcher);
}

function runPutEffect(env, payload, next) {
  // 这里的dispatch就是（在src\redux-saga\middleware.js里面）
  // (action) => {
  //   channel.put(action);
  //   return next(action);
  // }
  // 注意，里面的next是别的中间件，不是迭代器的总控next函数
  // 相当于我把put写在了dispatch里面，这里直接调用它就好，不需要直接写put
  // put函数内部就是把所有的next函数拿出来执行，而take函数是把next放入队列中
  env.dispatch(payload.pattern);
  next();
}

function runForkEffect(env, payload, next) {
  // payload.fn是saga函数，saga函数等于迭代器函数(执行后得到的是迭代器对象)
  // next是总控函数
  // 这里是开启一个新的子线程，不会阻塞当前的saga，如何体现的？？
  const iterator = payload.fn();
  const task = proc(env, iterator);
  // 这个proc执行完之后，不会阻塞调用next，这里手动提前在外部调用next（put函数也一样）
  // 把任务对象给到外面的yield()前面的变量
  next(task);
}

// call会阻塞saga函数的执行
function runCallEffect(env, payload, next) {
  const { fn, args } = payload;
  const result = fn(...args);
  if (is.promise(result)) {
    result.then(
      (res) => next(res),
      (err) => next(err, true)
    );
  } else {
    next(result);
  }
}

function runCpsEffect(env, payload, next) {
  const { fn, args } = payload;
  // 回调里面的逻辑是去执行next函数
  fn(...args, (err, res) => {
    if (err) {
      next(err, true);
    } else {
      next(res);
    }
  });
}

function runAllEffect(env, effects, next, { runEffect }) {
  // 这里的effects就是gen函数的数组
  if (effects.length === 0) {
    return next([]);
  }
  const keys = Object.keys(effects);
  const childCallbacks = createAllStyleChildCallbacks(effects, next);
  keys.forEach((key) => {
    // 这里为什么是用runEffect而不是用proc，每个effect不是一个iterator吗
    // 如果直接用proc的话，proc的env参数去哪里传递呢？
    runEffect(effects[key], childCallbacks[key]);
  });
}

function runCancelEffect(env, task, next) {
  task.cancel();
  next();
}

const effectRunnerMap = {
  [effectTypes.TAKE]: runTakeEffect,
  [effectTypes.PUT]: runPutEffect,
  [effectTypes.FORK]: runForkEffect,
  [effectTypes.CALL]: runCallEffect,
  [effectTypes.CPS]: runCpsEffect,
  [effectTypes.ALL]: runAllEffect,
  [effectTypes.CANCEL]: runCancelEffect,
};

export default effectRunnerMap;
