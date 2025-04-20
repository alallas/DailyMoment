import { Provider } from "react-redux"
import store from "./store"
import Home from "./components/home"
import Counter from "./components/counter"
import Login from "./components/login"
import React from "react"

function App() {
  return (
    <>
      <Provider store={store}>
        <Home/>
        <Counter/>
        <Login />
      </Provider>
    </>
  )
}


export default App

