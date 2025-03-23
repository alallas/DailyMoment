import React, {Component} from "react";
import { connect } from "react-redux";

import { Link } from "react-router-dom";

const headers = [
  {
    path: '/',
    name: '首页',
    key: '/',
  },
  {
    path: '/counter',
    name: '计数器',
    key: '/counter',
  },
  {
    path: '/logout',
    name: '退出',
    key: '/logout',
    isNeedUserIn: true,
  },
  {
    path: '/profile',
    name: '个人中心',
    key: '/profile',
    isNeedUserIn: true,
  },
  {
    path: '/login',
    name: '登录',
    key: '/login',
    isNeedUserIn: false,
  },
]

class Header extends Component {
  render() {
    return (
      <div className="navbar navbar-inverse navbar-fixed-top">
        <div className="container-fluid">
          <div className="navbar-header">
            <a className="navbar-brand">ssr</a>
          </div>
          <div>
            <ul className="nav navbar-nav">
              {
                headers.filter(header => {
                  if (!this.props.user) {
                    return header.isNeedUserIn === undefined || header.isNeedUserIn === false
                  } else {
                    return header.isNeedUserIn === undefined || header.isNeedUserIn === true
                  }
                }).map(header => {
                  return (<li key={header.key}><Link to={header.path}>{header.name}</Link></li>)
                })
              }

              {/* <li><Link to={'/'}>首页</Link></li>
              <li><Link to={'/counter'}>计数器</Link></li>
              {this.props.user && <><li><Link to={'/logout'}>退出</Link></li><li><Link to={'/profile'}>个人中心</Link></li></>}
              {this.props.user || <li><Link to={'/login'}>登录</Link></li>} */}

              {
                this.props.user && (
                  <ul className="nav navbar-nav navbar-right">
                    <li><a>{this.props.user.username}</a></li>
                  </ul>
                )
              }

            </ul>
          </div>
        </div>
      </div>
    )
  }
}

Header = connect(state => state.session)(Header)


export default Header