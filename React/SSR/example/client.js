import ReactDom from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { renderRoutes } from "react-router-config";

import Routes from "./routes";
import createClientStore from "./store";

const App = () => {
  return (
    <Provider store={createClientStore()}>
      <BrowserRouter>
        <div>{ renderRoutes(Routes) }</div>
      </BrowserRouter>
    </Provider>
  );
};
 
ReactDom.hydrate(<App />, document.getElementById("root"));

