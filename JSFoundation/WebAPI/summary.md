## DOM
创建节点
- createElement
- cloneNode
- appendChild


## 事件onXXX
### 基础写法

1. 如果是原生的，不要加on，直接click
```
const input = document.querySelector('.input')
input.addEventListener('change', () => test())
function test() {
    console.log('on!!')
}
```

2. 如果是有框架的，要加on


### 表单相关
- onBlur：元素失去焦点的时候触发
- onFocus：某个元素获得焦点触发的事件
- onReset：RESET属性被激发时触发
- onSubmit：提交时触发
- onInput：每次输入框内容有变都会触发（包括加入内容和按下backspace键）
- onChange：元素失去焦点并且元素的内容发生改变（两个条件都会满足的时候才会执行）


### 页面交互相关
- onLoad：整个页面及所有依赖资源如样式表和图片都已完成加载时触发（与DOMContentLoaded不同，后者只要页面 DOM 加载完成就触发，无需等待依赖资源的加载。）

- onBeforeunload：当浏览器窗口关闭或者刷新时触发。（事件使网页能够触发一个确认对话框，询问用户是否真的要离开该页面。如果用户确认，浏览器将导航到新页面，否则导航将会取消。）
- onHashChange：当 URL 的片段标识符（以 # 符号开头和之后的 URL 部分）更改时触发 

### 用户具体操作交互相关
- onResize：浏览器的窗口大小发生变化
- onScroll：滚动条发生变化
- onClick：每次点击鼠标

- onKeyPress：当键盘上的某个键被按下并且释放时触发的事件（页面内必须有被聚焦的对象）



## 监听器
### addListener

1. 情况一：多个监听器监听同个对象同个动作（没有第三个参数）
  此时是事件冒泡，从叶子dom往上开始向上冒泡，并依次触发所有监听器。
  回调函数从上往下按照顺序执行
2. 情况二：多个监听器监听同个对象同个动作（有第三个参数，为true）
  此时是事件捕获，按照从根元素一层层往叶子元素的顺序监听
  回调函数从下往上反顺序执行
3. 几个额外api：
  1. 默认行为：
  某些事件（如 click 事件）可能会触发元素的默认行为（如链接跳转）。比如，我想针对a标签做一些点击之后的操作，但是不想点击之后他跳转到别的连接，那么调用 `event.preventDefault()`

```
<a href="https://example.com" id="myLink">Click me</a>

document.getElementById('myLink').addEventListener('click', function(event) {
    event.preventDefault(); // 阻止默认导航行为
    alert('Link clicked, but no navigation');
});
```

  2. 事件传播：在事件处理函数中，你可以使用 event.stopPropagation() 来阻止事件继续传播，这将影响事件的冒泡或捕获行为。



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




## 尺寸相关
### scrollTop
- 常用于：body
- 解释：scrollTop 是视口顶部距离内容顶部的垂直距离。

### innerHeight
- 常用于：window
- 解释：浏览器视口高度

### scrollHeight
- 常用于：长数据列表的dom，body
- 解释：scrollHeight 是一个元素内容的整体高度，包括那些因为溢出而不在当前视口内的部分。


代码参考：（滚动随时刷新）
```
class Scrolling extends React.Component(){
    constructor(props){
        super(props);
        this.listRef=React.createRef();
    }
    getSnapshotBeforeUpdate(prevProps,prevState){
        if(prevProps.list.length<this.props.list.length){
            let list =this.listRef.current;
            return list.scrollHeight-list.scrollTop;
        }
        return null;
    }
    componentDidUpdate(prevProps,prevState,snapshot){
        if(snapshot!==null){
            let list =this.listRef.current;
            list.scrollTop=list.scrollHeight-snapshot;
        }
    }
    render(){
        return(
            <div ref={this.listRef}>xxxxxxxx</div>
        )
    }
}
```

因为内容（this.props.list）的长度会随时变化，所以ScrollHeight也会随时变化，每次都会增加list.length增加的部分，因此scrollTop也会增加这一部分，因此滚动位置是随时刷新的

### offsetTop
- 常用于：单个小的dom
- 解释：一个元素（的border顶部）距离最近具有定位（非static）的父级元素（的padding顶部）的距离。（一个元素距离body的顶部的距离）

### getBoundingClientRect
- 常用于：单个小的dom
- 解释：
  - top：一个元素距离浏览器视口顶部的距离
  - bottom：一个元素距离浏览器视口底部的距离...
