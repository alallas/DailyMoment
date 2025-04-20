import proc from "./proc";

function runSaga({channel, dispatch, getState}, saga) {
  let iterator = saga();
  const env = {
    channel, dispatch, getState
  }
  proc(env, iterator)
}

export default runSaga;