import React from 'react';
import { renderToString } from 'react-dom/server';
// import { StaticRouter } from 'react-router-dom/server'
import { StaticRouter } from 'react-router';
import routes from '../routes';
import { Provider } from "react-redux";
import { getServerStore } from '../store';
import { matchPath } from "react-router"
// react-router-dom里面的这个match没法处理嵌套情况
// import { matchRoutes } from "react-router-dom"
import { matchRoutes, renderRoutes } from "react-router-config";


// 服务端渲染一般在首屏的DOM结构，对于首页的交互事件，都需要客户端执行

// react这个包虽然在下面没有显式地用到，但是还是要加上，因为在<Home>这里就用到了

// 注意，这里写的是*，表示不管什么路由，都需要返回这个字符串
// request和response
function render(req, res) {

  // 创建仓库的时候，仓库里面的数据已经有了默认值
  let store = getServerStore(req)

  // 3. 数据方面，想要拿到一些仓库里面的异步数据，
  // 首先知道当前渲染哪个路由/组件，看这个路由/组件是不是要异步数据，如果要然后等他异步获取数据，取完之后才send
  // 不需要把所有数据都获取，只获取当前页面下的数据，因为————
  // 第一：服务器渲染一般仅仅是首页渲染，第二：服务器渲染，每次转换页面的时候，都会重新send一遍数据的，所以一次send只构建一个页面的数据就可以了
  
  // （1）获取要渲染的路由
  // 使用react-router的matchPath的方法，匹配当前的req的path和路由配置的每个对象
  // 或者正则等等的匹配
  // 但是注意，如果routes是一个深度对象，react-router的matchPath的方法没法处理递归情况
  // let matchedRoutes = routes.filter(route => (
  //   matchPath(route, req.path)
  // ))
  // matchedRoutes长下面这样：
  // 包含一个虚拟DOM对象
  // [
  //   {
  //     path: '/',
  //     element: {
  //       '$$typeof': Symbol(react.element),
  //       type: [Object],
  //       key: null,
  //       ref: null,
  //       props: {},
  //       _owner: null,
  //       _store: {}
  //     },
  //     key: '/',
  //     loadData: undefined
  //   }
  // ]

  // 如果要处理递归，需要用react-router-config的matchRoutes方法
  // 可以处理嵌套路由！
  let matchedRoutes = matchRoutes(routes, req.path)
  // 返回的一个数组，里面的对象分别有route和match两个属性
  // [
  //   {
  //     route: {
  //       path: '/',
  //       component: [class App extends Component],
  //       loadData: [Function],
  //       routes: [Array]
  //     },
  //     match: { path: '/', url: '/', isExact: false, params: {} }
  //   },
  //   {
  //     route: {
  //       path: '/',
  //       component: [Object],
  //       key: '/',
  //       loadData: [Function (anonymous)]
  //     },
  //     match: { path: '/', url: '/', isExact: false, params: {} }
  //   }
  // ]


  // （2）拿到这些对应路由组件得loadData，然后拿到数据
  // 因为不确定matchRoutes数组到底有几个匹配上的路由，也就是有可能有多个组件都匹配上了这个路由（类似主页面 + 弹窗）
  // 因此在这里遍历这个数组，然后执行匹配上的组件的loadData函数，去异步拿数据。
  // 因为返回的是多个promise，因此放入一个数组里面，用all方法解决

  console.log('matchedRoutes', matchedRoutes)

  let promises = []
  matchedRoutes.forEach(route => {
    // 为什么要两个route，因为matchRoutes的返回值里面的对象里面的route属性才是匹配上的自己写的属性
    let realRoute = route.route
    if (realRoute.loadData) {
      let promise = realRoute.loadData(store)
      promises.push(promise)
    }
  })

  console.log('promises', promises)


  // （3）等数据全部拿完，send
  // 因此整个DOM树就在所有的promise完成之后，拿到数据之后构建，用all方法去包裹！
  Promise.all(promises).then(response => {

    // 1. 如果想要服务端渲染，又想要像客户端渲染那样写，那这里多一个工作，把正常的组件转化成字符串
    // 用到的工具就是renderToString
    // !注意！这里只是把类/函数组件的return的树变成字符串了，对于里面的一些hook或函数是不处理的！
    // 绑定事件必须要在客户端渲染！！！

    // 2. 路由方面，使用StaticRouter，
    // 并给props对象传递一个属性location，表明现在的页面上的路由是什么？
    // 这个location属性其实有点像BrowserRouter的作用，查看当前是什么路由
    // 然后下面的routes和route元素，相当于useRoutes的作用，遍历routes的孩子的相关信息，逐个匹配，拿到匹配成功的对象

    let context = {name:'xxxx'}
    // 另外，这里的context相当于一个provider类型，不仅能传递数据到下面，也能修改这个全局的context对象
    // 拿改的时候使用this.props.staticContext.xxxx
    // 但是这个上下文仅仅供服务端使用，客户端没有！需要加一个判断！

    let html = renderToString(
      <Provider store={store}>
        <StaticRouter context={context} location={req.path}>
          {renderRoutes(routes)}
        </StaticRouter>
      </Provider>
    )
    console.log('store.getState()', store.getState())


    res.send(
      `
        <html>
          <head>
            <title>ssr</title>
            <link rel="stylesheet" href="https://cdn.bootcdn.net/ajax/libs/mini.css/3.0.1/mini-default.min.css" />
          </head>
          <body>
            <div id='root'>${html}</div>
            ${
              ''
              // 下面是服务端和客户端两个仓库进行连接的道路
              // 在浏览器那边的window大对象创建一个数据存数据
              // 会有安全问题吗？本来这些数据就是要给客户端看的，那肯定没有安全问题，反而还有利于seo
            }
            <script>
              window.context = {
                state: ${JSON.stringify(store.getState())}
              }
            </script>
            ${''
              // 下面是，当页面需要添加事件交互代码的时候，引入一个一摸一样的代码，为什么？
              // 服务器渲染的目的是让 首屏大批DOM快速渲染，以及seo
              // 服务器传过来的文件已经有了DOM结构树了，客户端需要拿到同一份【一摸一样】的js文件
              // 这样一来在fiber构建的过程中非常快，而后面的事件绑定同客户端渲染一摸一样
              // 一样的代码就是【同构】！
            }
            <script src='/client.js'></script>
            ${''
              // 下面在举例客户端渲染的情况，服务器返回这么一个文档，然后只能由浏览器本身来执行这个script的js代码
              // <script>
              //   document.getElementById('root').innerHTML = 'hreee'
              // </script>
            }
          </body>
        </html>
      `
    )
  })
}



// 但是上面有一个问题！！
// node服务器只有在这个组件需要异步数据的时候才会send（整个代码被包裹在promiseAll的then里面了）

// 假设第一次输入url是home，那么访问node服务器拿数据下来，显示页面，
// 假设第一次输入url是counter，不需要异步数据，那么node服务器不send，
// 然后继续点击home，这个时候注意仅仅只是把url改了，而不是刷新页面，因为用的是router的<Link>，底层用的是history.pushState()
// 改了url之后，react重新执行performWork()，重新遍历DOM树，然后来到home，发现仓库里面没有数据，浏览器就直接访问api服务器去拿数据了！

// 根本原因在于：
// 客户端和服务端拉取数据都走的是函数式的action，而这个函数把目标服务器地址写死了，写成api服务器地址了
// 客户端想要访问node服务器（端口也就是3001，看自己定的app listen的是什么），也就是访问本机，让本机node作为代理，去访问api拿数据
// 并且这个时候，不需要写跨域了，因为浏览器自始至终访问的都是node本身的服务器


export default render

