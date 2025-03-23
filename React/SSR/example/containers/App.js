import React, { Component } from "react";
import { renderRoutes } from "react-router-config";
import Header from "../components/Header";
import session from "../store/actions/session";


// 类组件不能用useRouters的情况下
// 一级路由要渲染二级路由，在一级路由这里继续写{renderRoutes(route.routes)}

// 因为header是每个区域都一样，所以采用嵌套路由的方式来处理是一种方法
// 相当于模板布局，后面改的东西都在header下面

// 为什么this.props有route的属性

class App extends Component {

  render() {
    const { route } = this.props
    return (
      <>
        <Header/>
        <div className="container" style={{marginTop: 70}}>
          {renderRoutes(route.routes)}
        </div>
      </>
    )
  }
}

App.loadData = function(store) {
  return store.dispatch(session.getUser())
}


export default App



