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
  
  // 3.1 获取要渲染的路由
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

  // 【补充】5. 状态码方面————不存在的路由
  // 通过判断路由匹配结果数组中的【每一项是否有path属性】来看当前是否一个404的页面
  let not404 = matchedRoutes.every(item => item.route.path)
  if (!not404) {
    res.status(404)
  }

  // 3.2 拿到这些对应路由组件的loadData，然后拿到数据
  // 因为不确定matchRoutes数组到底有几个匹配上的路由，也就是有可能有多个组件都匹配上了这个路由（类似主页面 + 弹窗）
  // 因此在这里遍历这个数组，然后执行匹配上的组件的loadData函数，去异步拿数据。
  // 因为返回的是多个promise，因此放入一个数组里面，用all方法解决

  let promises = []
  matchedRoutes.forEach(route => {
    // 为什么要两个route，因为matchRoutes的返回值里面的对象里面的route属性才是匹配上的自己写的属性
    let realRoute = route.route
    if (realRoute.loadData) {
      // !改造all方法，不管每个接口成功还是失败，都变成成功！
      // 在axios().then()后面加上一个.then()，里面两个入参都填上resolve，
      // 使得外部自己手动new的promise实例肯定成功，并且外部自己手动new的promise实例保存的数据也是then之后传递过来的数据
      promises.push(new Promise((resolve, reject) => {
        realRoute.loadData(store).then(resolve, resolve)
      }))
    }
  })


  // 2. 路由方面，使用StaticRouter，
  // 并给props对象传递一个属性location，表明现在的页面上的路由是什么？
  // 这个location属性其实有点像BrowserRouter的作用，查看当前是什么路由（用的history方法）
  // 然后下面的routes和route元素，相当于useRoutes的作用，遍历routes的孩子的相关信息，逐个匹配，拿到匹配成功的对象

  let context = {csses: []}
  // 另外，这里的context与provider类型的上下文相似，但是仅仅【只传递一层】，也就是只传递给下一层，比如App
  // 第二层往后的staticContext数据需要依靠一步步传递！太麻烦了！！
  // 拿改的时候使用this.props.staticContext.xxxx
  // 但是这个上下文仅仅供服务端使用，客户端没有！需要加一个判断！

  // 5. 状态码方面，修改状态码特殊情况的状态码
  // 5.1 不存在的路由
  // 注意！如果服务器给到的是一个不存在的路由，他在chrome开发者页面nextwork那边显示的是200，而不是404
  // 需要判断当前的路由是一个不存在的路由，然后请求进来了就改一下res.statusCode，那怎么判断当前的路由是一个不存在的路由呢？
  // 1）一个方式是：依靠react router，在路由配置的最后一项，写上一个没有path属性的component，然后如果前面的路由都不匹配，就直接去到那个组件
  // 完整的流程是：输入一个不存在的url，回车之后，服务端的StaticRouter判断路由，拿到相应组件，转化成字符串传输，调用client.js，复用组件，
  // 等到那个组件在创造实例，执行构造函数时，给this.props.staticContext加上一个notFound为true的属性，说明是404的意思
  // 然后在send之前判断this.props.staticContext是不是已经有一个notFound为true的属性，有的话把响应码改为404
  // 2）另一个方式见上面，通过判断路由匹配结果数组中的【每一项是否有path属性】来看当前是否一个404的页面
  // if (context.notFound) {
  //   res.statusCode = 404
  // }

  // 5.2 重定向的路由
  // 1）一个方式是：重定向的时候，StaticRouter会给context对象自动加上xx属性
  let user = store.getState().session.user
  let needLoginPages = ['profile']
  if (!user && needLoginPages.some(item => req.path.indexOf(item) > -1)) {
    res.redirect(302, '/login')
    // 必须加上return，
    // 因为这里相当于再一次刷新页面了（node告诉浏览器说要重定向，让浏览器再次进入这个url），不能还去走下面的send
    return
  }
  // 2）另一个方式就是用context，在profile组件那边判断是否有user，没有的话依靠客户端跳转


  // 3.3 等数据全部拿完，send
  // 因此整个DOM树就在所有的promise完成之后，拿到数据之后构建，用all方法去包裹！
  // 但是all方法有个缺点就是只有所有请求都成功才会成功！
  Promise.all(promises).then(response => {

    // 1. 如果想要服务端渲染，又想要像客户端渲染那样写，那这里多一个工作，把正常的组件转化成字符串
    // 用到的工具就是renderToString
    // !注意！这里只是把类/函数组件的return的树变成字符串了，对于里面的一些hook或函数是不处理的！
    // 绑定事件必须要在客户端渲染！！！

    let html = renderToString(
      <Provider store={store}>
        <StaticRouter context={context} location={req.path}>
          {renderRoutes(routes)}
        </StaticRouter>
      </Provider>
    )


    // 4. css方面
    // 把css放到顶层的context里面，通过StaticRouter来传递空收集满
    // csses是一个数组，每个元素都是一个页面的所有css
    let cssStr = context.csses.join('\n')


    res.send(
      `
        <html>
          <head>
            <title>ssr</title>
            <link rel="stylesheet" href="https://cdn.bootcdn.net/ajax/libs/mini.css/3.0.1/mini-default.min.css" />
            <style>${cssStr}</style>
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

