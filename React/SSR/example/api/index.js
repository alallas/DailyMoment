let express = require('express')
let bodyParser = require('body-parser')
let session = require('express-session')

let homeData = [{id: 1, name: 'yyy'}, {id: 2, name: 'lll'}]
debugger
let app = express()


// 这个解决方法不好，这是允许介入跨域，不是终极解决方案
// 一般浏览器不会与api服务器直接对接，一是不安全，二是不好维护
// 后面让node服务器（代理服务器）去承接这个接口

// 如果访问本域的来源url是xxx，就能够传递数据给他
// 但这个一般写在java的
// let cors = require('cors')
// app.use(cors({
//   origin: 'http://localhost:3001'
// }))


// 用于解析 HTTP 请求体的中间件
// 解析表单格式的请求体（如 key1=value1&key2=value2），转换为对象
app.use(bodyParser.urlencoded({extended: true}))
// 解析 JSON 格式的请求体，将字符串转换为 JavaScript 对象
app.use(bodyParser.json())
// 为什么需要这个？
// 客户端发送的时候是以buffer（二进制数据）的格式发送的(xhr等底层的api将json格式转化为buffer数据格式)
// 这个bodyParser是把二进制数据即buffer数据转化为JSON（字符串），然后再转化为对象格式，
// 这样下面的app.get/post里面的req和res就能拿到对象格式的入参

// 他的大概逻辑（不是源码，只是问gpt的结果）
// function jsonParser(options) {
//   return function (req, res, next) {
//     仅处理 Content-Type 为 application/json 的请求
//     if (!isJson(req)) return next();

//     let data = [];
//     req.on('data', (chunk) => {
//       data.push(chunk); // 收集数据块
//     });

//     req.on('end', () => {
//       try {
//         const rawBody = Buffer.concat(data).toString(); // 拼接完整字符串
//         req.body = JSON.parse(rawBody); // 解析为 JSON 对象
//         next();
//       } catch (err) {
//         next(err); // 解析失败抛出错误
//       }
//     });

//     req.on('error', next);
//   };
// }

// body-parser 的 Content-Type 检查逻辑
// function isJson(req) {
//   const type = req.headers['content-type'] || '';
//   return type.includes('application/json');
// }

// 现代 Express 用法（无需安装 body-parser）
// app.use(express.json());       // 替代 bodyParser.json()
// app.use(express.urlencoded()); // 替代 bodyParser.urlencoded()





app.use(session({
  saveUninitialized: true,
  resave: true,
  secret: 'zzz'
}))


app.get('/api/home', (req, res) => {
  res.json(homeData)
})


app.get('/api/users', (req, res) => {
  let user = req.session.user;
  if (user) {
    res.json({
      code: 0,
      data: {
        user,
        success: 'get user info success'
      }
    })
  } else {
    res.json({
      code: 1,
      data: {
        error: 'user not login'
      }
    })
  }
})


// 这个user也是一个对象，里面有username等属性，一般login路由，user对象的属性都是由自己来定义的
// 在post那边发送的数据就是下面的user变量（一个对象）
app.post('/api/login', (req, res) => {
  let user = req.body;
  req.session.user = user;
  res.json({
    code: 0,
    data: {
      user,
      success: 'login ok! user saved!'
    }
  })
})


app.get('/api/logout', (req, res) => {
  req.session.user = null;
  res.json({
    code: 0,
    data: {
      success: 'logout ok! user pop!'
    }
  })
})







app.listen(3002)


// 那这个数据肯定是跨域了，怎么解决？
// 1. 加上一个Access-Control-Allow-Origin请求头就好
// 这个头叫 跨域资源共享

// 2. 让node服务器（代理服务器）去承接这个接口
// 浏览器访问的是自己的接口（也就是node服务器）
// 然后node服务器负责获取数据（node访问api不涉及跨域问题），然后才返回来给浏览器



