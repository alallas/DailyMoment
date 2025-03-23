import axios from "axios";

// 创建实例
// 入参是基本的大config

// 配置路由的基本路径
// 这里的目的是把路由的前缀拉出来，不用每次都写一遍！！
// 也就是让axios后面写 axios.get('xxx').then() 的时候，里面的xxx是相对路径！！
/*
export default axios.create({
  baseURL: 'http://localhost:3002',
})
*/
// 服务器向3002访问，也就是api服务器发出请求



// 为了把浏览器传递给node服务器的cookie再次传给api服务器
// 应该要从req里面使用req.get('cookie')方法拿到cookie
// 因此这里要加上一个参数，于是要写成函数的形式
export default (req) => axios.create({
  baseURL: 'http://localhost:3002',
  headers: {
    cookie: req.get('cookie')
  }
})

// 这个函数的执行最好在getServerStore那边，通过给getServerStore传入req来传递
// 不要在getUsers这种actionCreator函数上面加参数，以此在loadData那边传入req，这样会导致getUsers这种actionCreator函数变得很混乱，按道理他是不能有入参的




