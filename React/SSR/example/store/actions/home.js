import * as types from '../action-types'
import axios from 'axios'
// 这个axios库服务端和客户端都能用


/*
function getHomeList() {
  // 为什么这个的参数是dispatch, getState？
  // 在thunk中间件里面，执行这个next函数（action函数）传递的参数就是这两个
  // 另外：下面的action函数中也要有返回值，目的是给中间件链条（外部自己写的）的前一个中间件传递结果
  // 假设thunk中间件是第一个，且action是函数式的，那么最后返回的实际上是action函数的返回值，也就是then返回的promise对象
  return function(dispatch, getState) {
    return axios.get('/api/users').then(res => {
      let list = res.data
      dispatch({
        type: types.SET_HOME_LIST,
        payload: list
      })
      // 在then里面return数据的话，就是把这个数据存到then的promise实例本身
      return list
    })
  }
}
*/



// 关于 不同端要访问不用的服务器 的进一步改造
function getHomeList() {
  return function(dispatch, getState, request) {
    // 这里不能写死端口（api服务器）
    // 服务器读数据，直接访问API服务器
    // 客户端读数据，要访问3001的node服务器，让node服务器帮我拿数据
    // 这里存在一个判断 什么时候是客户端，什么时候是服务端 的逻辑

    // 在action函数中，加一个第三个参数request，这是服务端or客户端的独一无二的axios实例！
    return request.get('/api/home').then(res => {
      let list = res.data
      dispatch({
        type: types.SET_HOME_LIST,
        payload: list
      })
      // 在then里面return数据的话，就是把这个数据存到then的promise实例本身
      return list
    })
  }
}



export default {
  getHomeList
}

