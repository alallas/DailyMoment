import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";
import { AboutReducer } from "../pages/About/store";

const reducer = combineReducers({
  about: AboutReducer,
});

// 导出成函数的原因, 一个组件或用户用一个实例, 不破坏其他的store

export const createClientStore = () => {
  // 把最新的store初始化压入客户端的store
  const defaultState = window.context ? window.context.state : {};
  return createStore(reducer, defaultState, applyMiddleware(thunk));
};

export const createServerStore = () => {
  return createStore(reducer, applyMiddleware(thunk));
};