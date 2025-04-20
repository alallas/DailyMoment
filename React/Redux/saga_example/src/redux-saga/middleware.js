import stdChannel from "./channel";



function sagaMiddlewareFactory() {
  const channel = stdChannel();
  // 这个是saga的【绑定第一入参】的真正执行函数，写在这里是为了拿到中间件所拥有的store的工具
  let boundRunSaga;
  function sagaMiddleware(getState, dispatch) {
    // 这个才是runSaga的真正执行函数！！！！
    boundRunSaga = runSaga.bind(null, {
      channel, dispatch, getState
    })
    return (next) => (action) => {
      channel.put(action);
      return next(action);
    }
  }
  // 这里是runSaga的第二入参，是暴露给外面的，一般是rootSaga
  sagaMiddleware.run = function(saga) {

  }
  return sagaMiddleware;
}




export default sagaMiddlewareFactory;