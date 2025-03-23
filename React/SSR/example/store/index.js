import {createStore, applyMiddleware} from 'redux'
import { thunk, withExtraArgument } from 'redux-thunk'
import logger, { createLogger } from 'redux-logger'
import reducers from './reducers'
import clientAxios from "../client/request"
import serverAxios from "../server/request"


export function getClientStore() {
  let initState = window?.context?.state
  return createStore(reducers, initState, applyMiddleware(withExtraArgument(clientAxios), createLogger()))
}


export function getServerStore(req) {
  return createStore(reducers, applyMiddleware(withExtraArgument(serverAxios(req)), createLogger()))
}


// 为什么要导出一个函数，而不是直接let res = createStore，然后导出这个仓库对象？
// 回答：
// 客户端代码浏览器都会每次运行，结果不同
// 但服务端返回的都是一个结果
// 因此需要每运行一次就要创建一个仓库，数据不会有冲突


