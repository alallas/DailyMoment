import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./containers/Home";
import Counter from "./containers/Counter";
import App from "./containers/App";
import Login from "./containers/Login";
import Logout from "./containers/Logout";
import Profile from "./containers/Profile";
import NotFound from "./containers/NotFound";

// const AppRoutes = () => (
//   <Routes>
//     <Route path='/' element={<Home/>} />
//     <Route path='/counter' element={<Counter/>} />
//   </Routes>
// )
// export default AppRoutes



// 要渲染多级路由，且如果写<Routes>和<Route>的方式，不能用routes.map的方式！无法处理递归式的多级路由
// 除非用 useRoutes 钩子，但这个时候也要求组件是函数组件，那么类组件怎么办呢

// 类组件不能用<Routes>和<Route>的方式，就用 react-router-config 模块里面的renderRoutes和matchRoutes
// 写法是：{renderRoutes(routes)}，但是要写多次：【这么说来其实也不算内部处理递归，而是自己手动递归】
  // 这个在顶层Router的上下文下要写一次（这一层渲染的是最外层组件）
  // 在有孩子路由的一层组件内部也要再写一次，这次的routes从this.props.route.routes里面拿到（这一层渲染的是第二层组件）

// 因为在renderRoutes的源码里，他只是创建了一个switch函数组件，然后他的子组件就是一个个route函数组件，这些route函数组件的render属性保存着【最表层路由】的目标组件
// switch内部的逻辑是看 上下文传下来的当前的路由 和 众多route的路由能不能匹配上！
// 能得话就返回哪个子route组件



// 1. 下面是使用 useRoutes 钩子的配置属性名
// const routes = [
//   {
//     path:'/',
//     element: <App/>,
//     // 子路由
//     children: [
//       {
//         path: '/',
//         element: <Home/>,
//         key: '/',
//         // 这个属性专门用来在服务端传递异步数据！
//         // 如果有这个属性，表明他是要加载异步数据的
//         loadData: Home.loadData
//       },
//       {
//         path: '/counter',
//         element: <Counter/>,
//         key: '/counter',
//       },
//     ]
//   }
// ]



// 2. 下面是使用 react-router-config 模块的配置属性名
// renderRoutes是默认的模糊匹配，如果当前的路由是http://localhost:3001/counter
// 从头开始建立子路由数组的话，如果home写在前面，会【模糊】匹配到/，然后就退出了！因此一直显示的都是home组件的内容
// 需要让counter写在前面，或者直接在home组件对象里面加上exact: true
const routes = [
  {
    path:'/',
    component: App,
    loadData: App.loadData,

    // 子路由
    routes: [
      {
        path: '/',
        component: Home,
        exact: true,
        key: '/',
        // 这个属性专门用来在服务端传递异步数据！
        // 如果有这个属性，表明他是要加载异步数据的
        loadData: Home.loadData
      },
      {
        path: '/counter',
        component: Counter,
        key: '/counter',
      },
      {
        path: '/login',
        component: Login,
        key: '/login',
      },
      {
        path: '/logout',
        component: Logout,
        key: '/logout',
      },
      {
        path: '/profile',
        component: Profile,
        key: '/profile',
      },
      // 下面是一个404兜底组件，
      // 需要在路由配置的最后，因为别的匹配不上他就直接显示最后一个
      {
        component: NotFound,
      },
    ]
  }
]


export default routes



