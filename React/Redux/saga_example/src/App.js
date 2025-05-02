import Counter from "./components/Counter";
import { Provider } from "react-redux";
import store from "./store/index";
import React from "react";
function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}

export default App;
