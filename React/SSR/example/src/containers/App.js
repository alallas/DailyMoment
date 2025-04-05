import React, { Component } from "react";
import { renderRoutes } from "react-router-config";
import Header from "../components/Header";
import session from "../store/actions/session";
import styles from './App.css'
import withStyles from "../withStyles";

// 2. 路由写法
// 类组件不能用useRouters的情况下
// 一级路由要渲染二级路由，在一级路由这里继续写{renderRoutes(route.routes)}
// 因为header是每个区域都一样，所以采用嵌套路由的方式来处理是一种方法
// 相当于模板布局，后面改的东西都在header下面

// 为什么this.props有route的属性


class App extends Component {
  constructor(props) {
    super(props)
  }

  // 在服务器渲染中，componentWillMount是会执行的
  // getDerivedStateFromProps不会执行
  // 但是最好不要用这个生命周期，如果有需要用到props的地方，直接在构造函数那边使用
  // componentWillMount() {
  //   if (this.props.staticContext) {
  //     往顶层的staticContext里面的context的csses加上本层的css
  //     styles._getCss()方法是webpack配置中isomorphic-style-loader封装的
  //     this.props.staticContext.csses.push(styles._getCss())
  //   }
  // }

  render() {
    const { route } = this.props
    return (
      <>
        <Header staticContext={this.props.staticContext}/>
        <div className={`${styles.app} container`}>
          {renderRoutes(route.routes)}
        </div>
      </>
    )
  }
}


// 3. 客户端使用模块化渲染css的弊端
// 在刷新页面的时候因为css还没被js加入，因此显示原始的样式，
// 当js把计算好的哈希值作为类名加入到<style>标签，并放到head头里面的时候，样式恢复，因此会出现闪一下爱的现象
// 解决方法是：在服务器就把css加入到style标签

App = withStyles(App, styles)


// 1. 全局用户验证
// 这里相当于把【全局】的初始用户验证放到了服务器那边执行
// 【全局】靠的是一个顶层路由组件！！（也就是需要用到嵌套路由）

App.loadData = function(store) {
  return store.dispatch(session.getUser())
}


export default App



