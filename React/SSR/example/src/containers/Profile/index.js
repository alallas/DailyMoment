import React, { Component } from "react";
import { connect } from "react-redux";
import session from "../../store/actions/session";
import { Redirect } from "react-router";
// 下面这个是route6的组件
import { Navigate } from "react-router-dom";

// 两者的区别在于：
// <Redirect> (v5)触发时机是 渲染时立即触发跳转（同步）	
// <Navigate> (v6)触发时机是 渲染后通过 useEffect 触发（异步）


// 下面靠的是客户端渲染，
// 服务器传递过来的源代码是profile的，然后客户端redirect，然后开始渲染对应路由的组件
// 然而这个时候的源代码还是profile的内容
class Profile extends Component {
  render() {
    return (
      this.props.user ?
      <>
        <div className="row">
          <div className="col-md-6 col-md-offset-6">
            Profile
          </div>
        </div>
      </>
      : <Redirect to='/login' />
    )
  }
}


Profile = connect(state => state.session, session)(Profile)


export default Profile



