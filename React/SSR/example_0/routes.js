import Home from "./pages/Home";
import About from "./pages/About";

const Routes = [
  { path: "/",
    component: Home,
    exact: true,
  },
  
  {
    path: "/about",
    component: About,
    exact: true,
    loadData: About.loadData,
  },
];

export default Routes