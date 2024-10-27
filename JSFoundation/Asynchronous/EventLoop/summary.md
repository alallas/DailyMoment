
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





