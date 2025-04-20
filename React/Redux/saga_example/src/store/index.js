import Redux, { applyMiddleware, combineReducers, createStore } from "redux";
import { counterReducer, loginReducer } from "./reducers";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./rootSaga";

const AllReducers = combineReducers({
  counter: counterReducer,
  login: loginReducer,
})

const sagaMiddleware = createSagaMiddleware()

const store = createStore(AllReducers, applyMiddleware(sagaMiddleware))

sagaMiddleware.run(rootSaga)

export default store
