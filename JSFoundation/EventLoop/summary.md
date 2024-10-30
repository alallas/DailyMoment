
## 浏览器的进程和线程
### 普遍概念

1. 进程：在哪运行？内存空间
2. 线程：谁来运行？人
- 一个进程至少有一个线程，主线程
- 主线程开启多个其他线程执行任务


### 进程
#### 浏览器进程
1. 界面展示（标签页展示、顶部url栏、收藏栏展示等）
2. 用户交互
  1. 识别出来用户进行了交互
  2. 通知给【渲染进程】的【事件触发进程】
3. 子进程管理

#### 网络进程
- 网络资源的加载

#### 渲染进程
- 一个tab页面一个渲染进程（如果是同一个站点属于同一个tab页面，只会开启一个渲染进程）
- 包含的线程有：
  - 渲染主线程（js引擎线程）
  - 异步http请求线程
  - 定时器线程
  - 事件触发线程
  - GUI渲染线程

### 线程
#### 渲染主线程
##### 结构

- 执行体（堆栈结构）
  - 执行一个任务相当于一次循环
  
- 消息队列
  - 其他线程随时【把回调函数包装成任务】放入队列
  - 类型：
    - 延时队列：计时器任务，优先级【中】
    - 交互队列：交互后的事件回调任务，优先级【高】
    - 微队列：需要最快执行的任务，优先级【最高】
      - Promise
      - MutationObserver
  
- 任务
  - 每个任务属于一个类型
  - 一个类型的任务必须都在一个队列


##### 一次循环

1. 按照优先级高低（最高到最低）依次检查不同类型消息队列
2. 检查此类型消息队列是否有任务，有则执行，无则休眠
3. 执行任务到完毕
4. （继续1步骤）



##### 不能立即执行（需要生成任务）的事情

1. 绘制：dom.textContent等（fiber对他做出了修改）
2. 定时器
3. 交互事件
4. http请求


## 定时器
### setInterval

1. 建立循环器
```
setInterval(function () {}, 1000)
```

- 循环器准不准？：不准！！
```
let firstTime = new Date().getTime();
setInterval(function () {
    let lastTime = new Date().getTime();
    console.log(lastTime - firstTime);
    firstTime = lastTime;
}, 1000)
```
js的执行是遵循时间切片的，每次setInterval的函数执行是放入队列中，并不是真正的执行


- 循环器的返回值是什么？：返回一个数字，作为timer的唯一标识

```
const timer1 = setInterval(function () {}, 1000)
const timer2 = setInterval(function () {}, 1000)
console.log(timer1, timer2)
// 打印1和2
```

2. 消除循环器
```
clearInterval(timer)
```


### setTimeout

1. 建立定时器
```
setTimeout(function () {}, 1000)
```

- 定时器的返回值和循环器的返回值会重叠吗？不会，一起在一个标识列表中
```
const timer1 = setInterval(function () {}, 1000)
const timer2 = setTimeout(function () {}, 1000)
console.log(timer1, timer2)
// 还是打印1和2
```

2. 消除定时器
```
clearTimeout(timer)
```

### 注意
两个setInterval和setTimeout里面的this都是指向window，严格模式也是！！





