import { createStore, applyMiddleware } from "redux";
import { combineReducers } from "redux";
import { thunk } from "redux-thunk";
import { createLogger } from "redux-logger";
import counter from "./reducers/counter";
import home from "./reducers/home";

let reducers = combineReducers({
  counter,
  home
})

let logger = createLogger()

let store = createStore(reducers, applyMiddleware(thunk, logger))

export default store

