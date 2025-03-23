import axios from "axios";

// 创建实例
// 入参是基本的大config

// 配置路由的基本路径
// 这里的目的是把路由的前缀拉出来，不用每次都写一遍！！
// 也就是让axios后面写 axios.get('xxx').then() 的时候，里面的xxx是相对路径！！
export default axios.create({
  baseURL: '/'
})


// 客户端向/，也就是本地发出请求，也就是node服务器
// 'http://loacalhost:3001'


