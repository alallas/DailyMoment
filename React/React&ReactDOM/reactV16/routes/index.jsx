import { Navigate } from "react-router-dom";
import React from "react";

const Login = React.lazy(
  () => import("../views/login")
);
const Home = React.lazy(
  () => import("../views/home")
);

const routes = [
  {
    path: "/",
    element: <Navigate to="/users/login" />,
  },
  {
    path: "/users/login",
    element: <Login />,
  },
  {
    path: "/users/home",
    element: <Home />,
  }
]

export default routes;


