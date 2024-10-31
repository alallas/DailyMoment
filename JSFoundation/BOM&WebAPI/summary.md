
## Observer对象

### MutationObserver
利用 MutationObserver API 我们可以监视 DOM 的变化。DOM 的任何变化，比如节点的增加、减少、属性的变动、文本内容的变动，通过这个 API 我们都可以得到通知。

MutationObserver 有以下特点：
- 它等待所有脚本任务执行完成后，才会运行，它是异步触发的。即会等待当前所有 DOM 操作都结束才触发，这样设计是为了应对 DOM 频繁变动的问题。
- 它把 DOM 变动记录封装成一个数组进行统一处理，而不是一条一条进行处理。
- 它既可以观察 DOM 的所有类型变动，也可以指定只观察某一类变动。

```
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DOM 变动观察器示例</title>
    <style>
      .editor {border: 1px dashed grey; width: 400px; height: 300px;}
    </style>
  </head>
  <body>
    <h3>阿宝哥：DOM 变动观察器（Mutation observer）</h3>
    <div contenteditable id="container" class="editor">大家好，我是阿宝哥！</div>

    <script>
      const containerEle = document.querySelector("#container");

      // 相当于订阅，前者是订阅的callback函数，后者是订阅的目标对象
      let observer = new MutationObserver((mutationRecords) => {
        console.log(mutationRecords); // 输出变动记录
      });

      observer.observe(containerEle, {
        subtree: true, // 监视node所有后代的变动
        characterDataOldValue: true, // 记录任何有变动的属性的旧值
      });
    </script>
  </body>
</html>
```


### IntersectionObserver


```
  const imgList = document.querySelectorAll('img')

  // 懒加载图片加载原理
  // 基本写法
  function lazyLoad(){
      let imgList = document.querySelectorAll("img");
      let windowHeight = window.innerHeight;
      let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      for (let i = 0; i < imgList.length; i++) {
          if (imgList[i].offsetTop < scrollTop+windowHeight) {
              imgList[i].src = imgList[i].getAttribute("data-src")
          }
      }
  }

  
  // 更加优雅的方式
  function isInView(dom) {
      const bound = dom.getBoundingClientRect()
      return bound.top <= window.innerHeight
  }
  function loadImg(dom) {
      dom.src = dom.getAttribute('data-src')
  }
  function checkAndLoad() {
      for (let i = 0; i < imgList.length; i++) {
          if (isInView(imgList[i])) {
              loadImg(imgList[i])
          }
      }
  }
  window.addEventListener('scroll', () => checkAndLoad())


  // 优化方法：intersetsion observer
  const imgLazyObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
          if (entry.isIntersecting) {
              const img = entry.target
              img.src = img.getAttribute('data-src')

              // 这里需要取消监控重复加载
              imgLazyObserver.unobserve(img)
          }
      })
  })

  imgList.forEach((img) => {
      imgLazyObserver.observe(img)
  })
```


## window对象
### location属性

常用：
- location.host

location.host 返回域名？NOOOOOO！！
如果端口是默认的80或者443，确实只是返回域名，但如果是别的端口，返回域名加端口

如果端口是默认端口，路由就是
```https://www.baidu.com```

别的端口，路由就是
```https：//www.baidu.com:5500```

- location.hostname：返回域名的！！
- location.pathname：返回路径和文件名，（当前页面的），前面以/开头
- location.protocol：返回协议，后面结尾以:结束！！！
- port：端口号
- origin：协议和域名和端口号（没有页面的路由地址）
- href：整个url


## navigator对象
代表了用户代理的状态和身份，它允许脚本对其进行查询并注册自身以便执行某些活动

用户设备信息
- navigator.userAgent：返回当前浏览器的用户代理。
```Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36```
- navigator.userAgentData：返回一个ua对象，包含用户浏览器和操作系统的信息。



## date对象
### 新建实例
- 新建一个实例
const date = new Date();
（注意！不是实时的，每次要获得最新的时间，必须新建一个实例）

### 获取时间
#### 相对时间

- 获取时间
1. getFullYear()：第几年（xxxx）
2. getMonth()：第几个月（0-11）

3. getDate()：一个月的第xx天（1-31）(几号)
4. getDay()：一个星期的第xx天（星期几）

5. getHours()：第几小时（24小时制）（0-23）
6. getMinutes()：第几分钟（0-59）
7. getSeconds()：第几秒（0-59）
8. getMiliseconds()：第几毫秒（0-999）

- 定义时间
1. setDate()：....（见上）....
....（见上）....


#### 绝对时间
1. getTime()：1970年1月1日（纪元时刻）至今的毫秒数（重要！作为时间戳）
```
const date1 = new Date().getTime()
for (let i = 0; i < 10000000; i++) {}
const data2 = new  Date().getTime()
console.log(data2 - date1)
```

2. Date.now()：返回自1970年1月1日 00:00:00到当前时间的毫秒数（不需要创建一个 Date 对象的实例！！！更省内存！更快！）
```
let timestamp = Date.now();
console.log(timestamp);
// 1611814153365
```


### 按照本地语言显示日期
toLocaleString() 将日期和时间转换为本地化的字符串表示形式
- 参数
  - locales：一个字符串或字符串数组，表示要使用的本地化环境。（默认使用运行环境的默认语言环境）
  - options：一个对象，包含定制的日期和时间的格式。

```
let date = new Date();
console.log(date.toLocaleString()); 
// 输出当前日期和时间的本地化字符串，例如 "4/20/2023, 12:00:00 PM"

let date = new Date();
console.log(date.toLocaleString('en-US')); 
// 输出使用美国英语格式的日期和时间，例如 "4/20/2023, 12:00:00 PM"

let date = new Date();
console.log(date.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })); 
// 输出 "April 20, 2023"

let date = new Date();
console.log(date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })); 
// 输出 "12:00:00 PM"
```

options 对象可以包含以下属性：
- localeMatcher：指定如何匹配 locales 参数。可能的值有 "lookup" 和 "best fit"。
- timeZone：指定时区。
- hour12：指定是否使用 12 小时制（true）或 24 小时制（false）。
- weekday、year、month、day、hour、minute、second：指定日期和时间的各个部分的显示方式。

