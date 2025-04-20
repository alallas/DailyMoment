import { take, put, call } from "redux-saga/effects";
import { fetchData } from "../api";

function* rootSaga() {
  for (let i = 0; i < 3; i++) {
    console.log('开始监听wrap-add')
    const actionBegin = yield take('wrap-add');
    console.log('actionBegin 有人触发了wrap-add指令', actionBegin)
    // take的返回值是一个对象，里面一个type属性，保存着wrap-add的指令名字
  
    // 接下来：
    // 要么 1.执行异步函数，拿到数据
    // const result = yield call(fetchData);
    // 要么 2.直接派发真正的action
    yield put({type: 'add'})
    console.log('派发真正的action完毕，继续进入下次执行')
  }
  console.log('for end')
}

// 这里写for循环是为了展示：
// 页面进入，出现 开始监听的字样
// 点击一次之后，代码执行到进入下一次循环的开始监听处
// 等到循环结束了，继续点击也没有用
// 因为saga内部实现了当done为true的时候（仅在generator函数本身内所有yield执行完毕才为true），
// 就不会继续调用next，凡是没有调用next，下面的函数就不会执行！！

export default rootSaga;

