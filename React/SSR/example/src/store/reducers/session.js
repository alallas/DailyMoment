import * as types from "../action-types"


// 因为登入登出只是一个交互为主的，因此不需要存储什么信息，
// 只需要存储是否有user，以及成功或失败的交互反馈信息

// reducer方面的话，只要有指令，就全部覆盖掉当前的这个数据，以保存一个用户！
// 因为api那边返回来的数据是三个属性都会变化的，这里直接覆盖之前的

// 但是！实际上user信息不能存在redux里面，因为假如我已经登录了，然后刷新一下页面，登录信息就没有了
// 因为刷新页面会重新加载代码从头到尾执行，这个时候的redux仓库使用的数据是初始的空值数据
// 解决方法：
// 每次刷新进来的时候都要调用api/users的接口，api服务器根据cookie的sessionId找内存看能否找到，然后看是不是有用户已经登录了！
// （而且是在顶层调用接口，因为每个组件都需要确保用户信息是否拿到）

let initState = {
  user: null,
  success: null,
  error: null,
}


export default function(state = initState, action) {
  switch(action.type) {
    case types.SET_SESSION:
      return action.payload;
    default:
      return state;
  }
}

