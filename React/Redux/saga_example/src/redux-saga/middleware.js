import stdChannel from "./channel";
import runSaga from "./runSaga";

function sagaMiddlewareFactory() {
  const channel = stdChannel();
  // 这个是saga的【绑定第一入参】的真正执行函数，写在这里是为了拿到中间件所拥有的store的工具
  // 同时还给到发布订阅的channel工具
  let boundRunSaga;
  function sagaMiddleware({ getState, dispatch }) {
    // 这个才是runSaga的真正执行函数！！！！
    boundRunSaga = runSaga.bind(null, {
      channel,
      dispatch,
      getState,
    });
    return (next) => (action) => {
      // 【一句话】dispatch调用channel的put，使得take往后的put可以执行，这个put执行真正的dispatch
      // 下面是把taker函数从数组里面拿出来全部执行，也就是执行next函数
      // 然后迭代器继续往下执行，执行外部put函数拿到effect
      // 然后这个时候的done还是为false，就执行runEffect，然后开始内部的putEffect的函数（也就是dispatch函数），用的是真正的action的入参
      // 然后继续来到这里（为什么？），执行put函数，此时队列里面没有函数了，就继续执行next了（也就是原生的dispatch函数了）
      // 为什么继续来到这里？因为传给中间件的dispatch函数都是增强过的了已经（createStore返回的dispatch就是增强后的）
      channel.put(action);
      return next(action);
      // 注意dispatch({type: 'wrap-add'})的最后会用这个wrap的action去执行原生的next，这个时候的匹配就肯定对不上了
    };
  }
  // 这里是runSaga的第二入参，是暴露给外面的，一般是rootSaga
  sagaMiddleware.run = function (saga) {
    boundRunSaga(saga);
  };
  return sagaMiddleware;
}

export default sagaMiddlewareFactory;
