import React, {Component} from "react";
import { connect } from 'react-redux'
import actions from "../../store/actions/home"


// 下面这种是服务端不会执行这个map代码的，因为他全部都字符串化了
// 因此服务器返回的代码是没有ul里面的数据的，只有在客户端执行的时候才会执行这个代码
// 但这就不符合服务器渲染的特征了
// 思路，在server那边send的时候，需要已经拿到仓库里面的数据，
// 然后放到模板字符串里面，然后才会返回有数据的代码


class Home extends Component{
  constructor(props) {
    super(props)
  }

  // componentDidMount() {
  //   // 服务器和客户端的仓库是不一样的，这里无法判断这个时候的异步数据是不是已经拿到了
  //   // 需要将两个仓库的数据共链接（客户端的仓库从浏览器本身的window大对象里面拿数据，然后作为初始值）
  //   // 然后在这里先判断仓库有没有值，有的话就不再dispatch了
  //   // (于是重新刷新页面，发现network那里不再请求api服务器了)
  //   if (this.props.list.length === 0) {
  //     this.props.getHomeList()
  //   }
  // }
  render() {
    const { staticContext, list } = this.props;
    return (
      <>
        <div>home2</div>
        <div>{staticContext && staticContext.name}</div>
        <div className="row">
          <div className="col-md-6 col-md-offset-3">
            <ul className="list-group">
              {
                list.map((item, index) => (
                  <li key={item.id} className="list-group-item">{item.name}</li>
                ))
              }
            </ul>
          </div>
        </div>
      </>
    )
  }
}

Home = connect(state => state.home, actions)(Home)



// 下面Home.loadData是在模仿客户端加载数据的情况，也就是模仿componentDidMount函数干的事
// componentDidMount() {
//   this.props.getHomeList()
// }
// 其中的this.props拿到的getHomeList函数是经过connect的构造被包裹了一个dispatch的函数，长成下面这样
// (...args) => dispatch(actionCreator(...args))

// 若想直接执行上面的函数，那么就直接从store拿到dispatch函数，然后派发这个函数式的actionCreator

// !注意，重点！！
// 1. 原生的dispatch返回的是action本身，没啥大问题
// 2. 经过中间件改造的升级版dispatch，假设中间件的第一个是thunk（一般第一个是他）
// 2.1 上面的情况下，当action为对象时，他的返回值就是dispatch的返回值，也是一个action对象
// 2.2 而当action为函数时，他返回的是这个函数执行之后的返回值！（一般是一个promise）
// 也就是action函数要写上一个return，才会在dispatch函数执行之后拿到想要的数据
// function getHomeList() {
//   return function(dispatch, getState) {
//     return axios.get('http://localhost:3002/api/users').then(res => {
//       let list = res.data
//       dispatch({
//         type: types.SET_HOME_LIST,
//         payload: list
//       })
//     })
//   }
// }


// 下面拿到的就是then的promise对象
Home.loadData = function(store) {
  return store.dispatch(actions.getHomeList())
}


export default Home


