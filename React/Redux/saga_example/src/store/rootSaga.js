// import { take, put, call } from "redux-saga/effects";
import {
  take,
  put,
  takeEvery,
  call,
  cps,
  all,
  fork,
  cancel,
} from "../redux-saga/effect";
import { fetchData } from "../api";
import * as actionTypes from "./action-types";
import { addNumberAction } from "./action/counter";

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("async done okkk");
    }, ms);
  });
}

function syncFunc(val) {
  return val + " done";
}

// 回调式的异步，比如 fs.readFile(文件路径， 回调函数)
// 读完文件路径之后才执行回调函数
function callbackDelay(_, cb) {
  setTimeout(() => {
    console.log("2 time", new Date().getSeconds());
    // 回调函数的第一个参数是err，第二个参数是res，会传递给next参数，进而传递给yield前面的result
    cb(null, "callbackDelay okkkk");
  }, 1000);
}

function* add() {
  // （三）同步调用
  // yield put(addNumberAction());
  // console.log("同步add put完毕");

  // （四）异步调用
  // 1.普通的异步调用
  // const result = yield delay(1000);
  // console.log("异步调用完毕，结果是", result);
  // yield put(addNumberAction());
  // console.log("异步add put完毕");

  // 2.api式的异步调用（比如要执行一个函数，然后这个函数返回一个promise对象）
  // call就是把第二个参数传给第一个参数（一个函数）
  // const result2 = yield call(fetchData, "data val");
  // console.log("api异步调用完毕，结果是", result2);

  // 3.回调式的异步调用（node风格的）
  const result3 = yield cps(callbackDelay, "data val");
  console.log("回调异步调用完毕，结果是", result3);
}

function* add1() {
  for (let i = 0; i < 3; i++) {
    yield take(actionTypes.WRAP_ADD);
    yield put(addNumberAction());
  }
}

function* add2() {
  for (let i = 0; i < 3; i++) {
    yield take(actionTypes.WRAP_ADD);
    yield put(addNumberAction());
  }
}

function* delayAndAdd() {
  while (true) {
    yield delay(1000);
    yield put(addNumberAction());
  }
}

function* addWatcher() {
  const task = yield fork(delayAndAdd);
  yield take(actionTypes.STOP_ADD);
  yield cancel(task);
}

// function* rootSaga() {
//   for (let i = 0; i < 3; i++) {
//     console.log("开始监听wrap-add");
//     const actionBegin = yield take(actionTypes.WRAP_ADD);
//     console.log("actionBegin 有人触发了wrap-add指令", actionBegin);
//     // take的返回值是一个effect对象，看effect.js

//     // （一）接下来：
//     // 要么 1.执行异步函数，拿到数据
//     // const result = yield call(fetchData);
//     // console.log("执行异步函数完毕，结果是", result);
//     // 要么 2.直接派发真正的action
//     // yield put(addNumberAction());
//     // console.log("派发真正的action完毕，继续进入下次执行");

//     // (二)iterator：(类似是递归，yield后面是一个generator函数)
//     yield add();
//     console.log("派发真正的action完毕，继续进入下次执行");
//   }
//   console.log("for end");
// }
// 这里写for循环是为了展示：
// 页面进入，出现 开始监听的字样
// 点击一次之后，代码执行到进入下一次循环的开始监听处
// 等到循环结束了，继续点击也没有用
// 因为saga内部实现了当done为true的时候（仅在generator函数本身内所有yield执行完毕才为true），
// 就不会继续调用next，凡是没有调用next，下面的函数就不会执行！！

function* rootSaga() {
  // （三）takeEvery
  // 监听每一次的Wrap-add，然后执行每一次的add，没有上限！！
  // yield takeEvery(actionTypes.WRAP_ADD, add);
  // console.log("派发真正的action完毕，继续进入下次执行");

  // （四）all
  // 类似于promiseAll，让两个迭代器分别执行，等他们都执行完之后就往下走
  // all里面传入的是迭代器
  // const res = yield all([add1(), add2()]);
  // console.log("all result", res);

  // (五)取消
  let result = yield addWatcher();
  console.log("addWatcher done", result);
}

export default rootSaga;

// 几个模式：
// take，然后页面dispatch，然后put真正dispatch
// take，然后fork（开启一个新的子线程）
