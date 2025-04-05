// 服务器端的入口文件
// 基本的起服务的写法
// let express = require('express');
// let app = express();
// app.listen(3001);
debugger
import proxy from "express-http-proxy"
import render from './render';

let path = require('path')

// 注意：
// path、fs等【核心模块】不需要转译，也打包到一个js里面，因为打包的代码是给node执行的，node本来就有这些包
// 即node原生的包不需要打包进来
// 另外node里面也不能操作DOM
let express = require('express');
let app = express();


// 1. 设置根目录（以便script能够读到相应的值）
// <script>标签的src是路径（也就是在http://baidu.com/后面的路径部分）
// 但怎么让<script>标签的src里面写的本地的这个client文件被读取到呢？
// 使用下面把这个包的读取根目录改一下！
// 相当于以public静态文件为 读取的根目录，在去到script执行的时候，就能够读取里面的‘/client.js’路径
app.use(express.static(path.resolve('public2')))


// 3. 设置代理（只让浏览器和node服务器（也就是自己）通信！）
// 当路径是以 /api 开头的，就开启代理!
app.use('/api', proxy('http://127.0.0.1:3002', {
  proxyReqPathResolver(req) {
    // 这里的url实际上指的是path的部分，而且指的是除了api之外的剩下的部分
    return `/api${req.url}`
  }
}))
// proxy的原理是，当浏览器访问node服务器的/api开头的路径时（之前写在request那边了，浏览器请求数据都会访问node服务器）
// node服务器再传递给api服务器，拿到结果之后返回去传递给浏览器

// 这里有一个问题就是：
// 当浏览器访问的是/api/users，那么传递给api服务器的路径会把/api这部分去掉，变成http://127.0.0.1:3002/users
// 但实际上要访问的应该是http://127.0.0.1:3002/api/users
// 解决方法：加配置，二参传入一个对象
// {
//   proxyReqPathResolver(req) {
//     return `/api${req.url}`
//   }
// }


// 这里还有一个问题是：
// 浏览器假设带着cookie向本node服务器请求数据，但是在本node服务器向api请求数据的时候，cookie并没有跟着传递过去
// 因为在这里只是设置了代理，并没有设置cookie的传递
// 因此要在服务器的请求axios配置那边加一个参数，见本文件夹的request



// 2. 开始编写要发送的数据
// 这里写了所有路由*，意味者每次刷新或进入一个新路由（不管是什么）都要重新执行render函数
app.get('*', (req, res) => render(req, res))


app.listen(3001, function() {
  console.log('server running...')
});








// PS:补充一些知识
// package.json里面的命令
// "dev:build": "webpack --config webpack.config.js --watch",
// 意思是通过--config这个命令把配置文件改为watch模式，这样一旦文件变化就会重新打包

// 但是打包之后的文件的运行靠的是这个命令
// "dev:start": "node build/server.js"
// 每次有新的打包文件实际上都要运行一下这个命令，做不到“随时更新”
// 有一个工具包可以解决这个问题：nodemon，命令改成如下：
// "dev:start": "nodemon build/server.js"
// nodemon是监听页面变化，然后自动起服务的工具

// 还有一个问题，每次都要执行两次，能不能改成一次呢？
// 可以的，就是用到npm-run-all这个工具包
// 新建一个命令："dev": "npm-run-all --parallel dev:**"
// 意思是当执行dev时，执行所有以dev:开头的命令

// 整个流程就是：
// 执行npm run dev命令
// 相当于执行了build和start命令
// build命令在一监听代码变化就重新打包，覆盖原有的output文件
// start执行的就是output文件，它一变化，那么就立刻执行node xxx
// 然后express服务器就重新启动了


