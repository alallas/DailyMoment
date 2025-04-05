import React from "react";
import ReactDOM from 'react-dom'
// import { createRoot } from "react-dom/client";

import { BrowserRouter } from "react-router-dom";
import routes from "../routes";
import { Provider } from "react-redux";
import { getClientStore } from "../store";
import { Route, Routes } from "react-router-dom";
import { renderRoutes } from "react-router-config"


// 这里如果用ReactDOM.render相当于还是没有使用服务器渲染
// 因为服务器渲染完成之后，然后遇到script执行下面这个代码，
// 那么这个代码还是回到了客户端渲染的整个流程，即从根节点开始建立fiber，然后去completeWork建立真实DOM
// 也就是说这个时候直接忽略了客户端传过来的完整的真实的DOM树
// ReactDOM.render(
//   <Counter />, document.getElementById('root')
// )


// 这个时候不能使用render方法，应该使用的是hydrate方法
// 也就是这个时候拿到服务器返回的一整个DOM树，在此基础之上逐渐“水化”（？）
// 水化相当于：不构建DOM树了，直接绑定事件


// 服务端如何处理路由的事情？
// 不能仅仅使用BrowserRouter，因为这仅仅是客户端渲染才用的
// 要在server那边也要使用StaticRouter，静态路由容器（只有服务端渲染才用到）
// 服务端先用静态路由容器判断要显示什么，然后来到客户端，也同样判断要显示什么，两者才能对上

debugger
ReactDOM.hydrate(
  <Provider store={getClientStore()}>
    <BrowserRouter>
      {renderRoutes(routes)}
    </BrowserRouter>
  </Provider>
  , document.getElementById('root')
)


// createRoot(document.getElementById('root')).render(<Counter />)

// 客户端代码也需要打包，用三个打包配置文件



