import React, { memo, Suspense } from "react";
import { useRoutes, BrowserRouter } from "react-router-dom";
import routes from "../routes";

const App = memo(() => {
  return (
    <div>{useRoutes(routes)}</div>
  )
})

function TopApp () {
  return (
    <Suspense fallback={
      <div>loading。。。。</div>
    }>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Suspense>
  )
}

export default TopApp

