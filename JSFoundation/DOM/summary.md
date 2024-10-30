# DOM



## DTD文档模式


- 标准模式：加上<!DOCTYPE html>

- 怪异（混杂）模式：没加<!DOCTYPE html>
  - 向后兼容，ie7的浏览器兼容ie6的语法

- 准标准模式：支持很多标准，但没有标准规定的这么严格




## document
- 含义：代表整个文档，硬要说的话是html上一级的标签

```
<document>
    <html>
        <head>
        </head>
        
        <body>
        </body>
    </html>
</document>
```


## dom
### 类型
1. 元素节点
2. 属性节点
3. 文本节点
4. 注释节点
5. document
6. DocumentFragment



### 属性
#### 节点类

- 所有节点
（任何浏览器都好使！）

1. parentNode：父节点

```
const html= document.getElementsByTagName('html')[0];

html.parentNode
// 输出document（顶层的）
```


2. childNodes：孩子节点
  1. 输出是类数组
  2. 包含文本节点和元素节点和注释节点，长度是【可视的节点数量 + (可视的节点数量 + 1)】
  3. 其中文本节点是每个可视标签前后都有

```
<div class="11">
    <strong></strong>
    <span></span>
    <!-- this is a comment -->
</div>


<div class="11">
    123
    <strong></strong>
    <span></span>
    <!-- this is a comment -->
</div>


const div = document.getElementsByClassName('11')[0]
console.log(div.childNodes.length)
// 两个代码块打印出来都是7
```


- 一个方法：hasChildNodes()：判断是否有任何一个类型的孩子节点


3. firstChild / lastChild：第一个孩子 / 最后一个孩子的节点

```
<div class="11">
    <strong></strong>
    <span></span>
    <!-- this is a comment -->
</div>


const div = document.getElementsByClassName('11')[0]
console.log(div.firstChild)
// 打印出来是text，即文本节点！！
```


4. nextSibling / previousSibling：后一个兄弟节点 / 前一个兄弟节点

```
<div>
    <strong></strong>
    <span class="11"></span>
    <!-- this is a comment -->
</div>


const span = document.getElementsByClassName('11')[0]
console.log(span.nextSibling)
// 输出text，即文本节点！！！
```


- 元素节点
（除了children，ie9及其以下不兼容！！！）

1. parentElement：父元素节点
2. children：孩子元素节点（不是childElement！！！）
3. firstElementChild / lastElementChild：第一个孩子元素节点 / 最后一个孩子元素节点
4. nextElementSibling / previousElementSibling：下一个兄弟元素节点 / 上一个兄弟元素节点

#### 信息类

- 标签本身
1. nodeName
  1. 输出节点的名称
  2. 每个节点类型都有
  3. 只能读取不能写入
  
2. nodeValue
  1. 输出节点的值
  2. 只有文本节点和注释节点有这个属性
  3. 可读可改
  
3. nodeType
  1. 输出节点的类型（标号）
  2. 每个节点都有


- 标签尖括号内的属性
1. attributes
  1. 输出属性的类数组
  2. 每个节点都有
  3. 可读可写


- 标签尖括号外的值
1. innerHTML
  1. 读取：获取标签的尖括号外的值
  2. 写入：自动识别输入的字符串内的内容为html格式

2. innerText
  1. 读取：获取标签的尖括号外的【文本值】
  2. 火狐不兼容（火狐拥有的是textContent）


#### css类
1. dom.className
  1. 读取：拿到class的内容
  2. 写入：字符串

2. dom.style
  1. 读取：拿到行内样式（大驼峰写法）
  2. 写入：字符串形式，如‘300px’
  
- PS：获取当前元素的显示出来的所有样式（不仅是行内样式）：window.getComputedStyle(div, null)
  - 输入第一个参数是节点，第二个参数是伪元素（'after'），输出一个对象，只读不修改！！
  - ie8及以下不支持（ie8有另一个方法：dom.currentStyle）




### 方法
#### 信息类

1. 获取/改变属性
- dom.setAttribute(a, b)
  - 输入两个字符串，前是属性名，后是属性值


- dom.getAttribute()
  - 输入一个字符串，属性名





## dom结构树



注意点：
- Document.prototype和Element.prototype上面都有的方法是：
  - getElementsByClassName()
  - getElementsByTagName()
  - querySelector()
  - querySelectorAll()

- Document.prototype上面的属性和方法是：
  - 属性：documentElement：直接选取的是html标签
  - 方法：getElementById()

- HTMLDocument.prototype上面的属性和方法是：
  - 属性：
    - body：直接选取body标签
    - head：直接选取head标签
  - 方法：
    - getElementByName()



例子：
- 题目：给一个节点，和一个数n，n大于0，输出这个节点下面的第n个节点，n小于0，输出这个节点上面的第n个节点
- 解答：

```
function getSiblingElement(ele, n) {
    while(ele && n) {
        console.log('enter while ele', ele, '---n', n)
        if (n > 0) {
            // 考虑到nextElementSibling的ie9兼容性问题，可以使用两个方案
            // 第一个方案使用ele = ele.nextElementSibling;
            // 另一个方案使用兼容性更强的nextSibling

            // 思路是：首先移动到下一个，然后发现下一个不是元素节点，继续移动指针；如果下一个是元素节点，停下循环
            // 特殊情况是ele为null，if里面执行不了，但也退出内部的while循环了，接着也退出外部的while循环了
            while(ele = ele.nextSibling) {
                if (ele.nodeType === 1) break;
            }
            n --;
        } else {
            while(ele = ele.previousSibling) {
                if (ele.nodeType === 1) break;
            }
            n ++;
        }
    }
    return ele;
}
```


## 操作dom
### 获取
#### 按名称
（都是document.）

- getElementsByName()
  - 输入纯的name名
  - 输出类数组
  - 缺点：（只有部分有name属性的标签才能用：表单、img、iframe！！）

- getElementsByTagName()
  - 输入纯的dom标签名
  - 输出类数组
  - 优点：（兼容性特别好！！！）

```
document.getElementByName('*')
// 表示选择所有的标签
```


- getElementsByClassName()
  - 输入纯的类名（前面没有点）
  - 输出类数组
  - 缺点：（ie8及以下没有这个方法！！！！）

- getElementById()
  - 输入纯的id名（前面没有#）
  - 输出单个标签本身
  - 缺点：（如果name有，id没有，但name的值和id的一样，那么把name的标签也选出来了）



- querySelector()
  - 输入【css怎么写就怎么写】，比如'div > span strong.demo'
  - 输出单个标签本身
  - 缺点：选出来的dom是镜像，不是实时的


- querySelectorAll()
  - 输入【css怎么写就怎么写】，比如'div > span strong.demo'
  - 输出类数组
  - 缺点：
    - ie7及以下不能用！！！
    - 选出来的元素是副本，不是实时的，后面对dom操作，不会反映到结果上


#### 按相对位置（节点树）
（都是dom.xxxx）

- 遍历所有节点树
1. parentNode：父节点
2. childNodes：孩子节点
3. firstChild / lastChild：第一个孩子 / 最后一个孩子的节点
4. nextSibling / previousSibling：后一个兄弟节点 / 前一个兄弟节点


- 遍历元素节点树
1. parentElement：父元素节点
2. children：孩子元素节点（不是childElement！！！）
3. firstElementChild / lastElementChild：第一个孩子元素节点 / 最后一个孩子元素节点
4. nextElementSibling / previousElementSibling：下一个兄弟元素节点 / 上一个兄弟元素节点


### 创建
（都是document.）

- document.createElement()
  - 输入纯的dom标签名
  - 输出标签本身


- document.createTextNode()
  - 输入字符串

- document.createComment()
  - 输入字符串

- document.createDocumentFragment
  - 无输入


### 插入
（都是dom.xxxx）

- dom.appendChild()
  - 输入节点
  - 剪切操作，如果输入的节点已经在页面中存在，那他会删除原来的，剪切原来的节点到新位置（dom的末尾）

- dom.insertBefore(a, b)
  - 输入两个节点
  - 在dom的范围内，Insert a, before b


### 删除
（都是dom.xxxx）

- dom.removeChild()
  - 输入节点
  - 返回被删除的节点（相当于剪切出来）
  - 删除dom下面的输入的孩子节点

- dom.remove()
  - dom是目标节点，自我删除dom


### 替换

- dom.replace(new, origin)
  - 输入两个节点，前是新，后是老（要被替换掉的那个）
  - dom节点下面的范围




## 尺寸与滚动
### 尺寸
#### 大body：滚动条距离（相对于视口顶端）
1. window.pageXOffset / pageYOffset
（ie9及以上可以使用）

2. document.body.scrollLeft / scrollTop
3. document.documentElement.scrollLeft / scrollTop
（ie8及以下可以使用，但哪个版本哪个有效不知道，所以写的时候要兼容；且一旦一个有效，另一个就是0）


#### 可视窗口尺寸
1. window.innerWidth / innerHeight：随着浏览器的缩放也会发生改变
（ie8及以下不兼容）

2. document.documentElement.clientWidth / clientHeight
（标准模式下，任意浏览器都兼容）

3. document.body.clientWidth / clientHeight
（混杂模式下）


#### 元素的尺寸
1. dom.getBoundingClientRect()：
  1. width、height
（返回的结果是拷贝值，不是实时的，不会跟着dom的变化而变化）

2. dom.offsetWidth / offsetHeight：是视觉上的尺寸（包含padding，不包含margin）

3. dom.scrollHeight: 是一个元素内容的整体高度，包括那些因为溢出而不在当前视口内的部分。
- 代码参考：（滚动随时刷新）
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
  - 因为内容（this.props.list）的长度会随时变化，所以ScrollHeight也会随时变化，每次都会增加list.length增加的部分，因此scrollTop也会增加这一部分，因此滚动位置是随时刷新的


#### 元素的位置
1. dom.getBoundingClientRect()：相对于视口左上角的坐标
  1. left、right、top、bottom
（返回的结果是拷贝值，不是实时的，不会跟着dom的变化而变化）

2. dom.offsetLeft / offsetTop：没有定位父级的元素（position为static），相对于文档。有定位父级，相对于最近的有定位父级
- PS：！！dom.offsetParent：返回最近的有定位父级的节点，否则返回<body>



### 滚动
1. window.scroll()
2. window.scrollTo()
（传入x和y坐标，让滚动条滚动到当前的位置，只滚动到某个点）

3. window.scrollBy()
（传入x和y坐标，让滚动条滚动到当前的位置，可以实现累加滚动）


- 小例子：页面自动滚动，可以暂停
- 思路：
  - 随时滚动：用setInterval，隔很小时间执行滚动一次
  - 滚动累加：滚动用scrollBy做累加
  - 停止用clearInterval
  - 进阶：！！如果用户不断点击按钮怎么办？不断生成更多的timer，导致暂停也不行，只能暂停最后被保留下来的那个
    - 问题简化为：回调函数在结束前执行次数大于1次，但目标是只需执行一次
    - 解答：锁机制！！！第一次执行，锁打开，执行完一次就关上。结束函数最后才重新打开锁

```
const div1 = document.getElementsByClassName('22')[0];
const div2 = document.getElementsByClassName('33')[0];
let timer = null;
let key = true;
div1.onclick(function () {
    // 默认锁是打开的，允许执行第一次
    // 函数执行完，关闭锁，下次定时函数还没被清除的时候，不能再次执行
    if (key) {
        timer = setInterval(() => {
            window.scrollBy(0, 10)
        }, 10);
        key = false;
    }
});
div2.onclick = function () {
    clearInterval(timer);
    key = true;
}
```




# 事件
## 事件绑定与解除（定义回调函数）

1. dom.onxxx = function () {}
- 优点：兼容性很好，就是给对象写方法！！
- 缺点：一个dom的一个事件只能绑定一个函数（不断覆盖之前的）
- 相当于：（句柄绑定方式）
```
<div onclick='console.log()'></div>
```

- this指向dom本身
- 解除事件：dom.onxxx = null;



2. dom.addEventListener('click', function () {}, false)
- 优点：一个dom的一个事件可以绑定多个函数，按照代码编写顺序从上往下执行
  - 前提：两个函数地址不一样，如果都是同一个函数引用，只打印一次

```
// 打印两次aa
div1.addEventListener('click', function () {
    console.log('aa')
}, false)
div1.addEventListener('click', function () {
    console.log('aa')
}, false)

// 只会打印一次aa
div1.addEventListener('click', test, false)
div1.addEventListener('click', test, false)
function test() {
    console.log('aa')
}
```

- 缺点：ie9以下不兼容

- this指向dom本身
- 解除事件：dom.removeEventListener('click', function () {}, false);



3. dom.attachEvent('on' + 事件类型, function () {})
- 优点：一个dom的一个事件绑定多个函数，不要求函数的地址必须一致，都会执行
- 缺点：ie独有的方法

- this指向window
// 函数写在外面，里面用call改变this
div1.attachEvent('onclick', function () {
    test.call(div1)
})
- 解除事件：dom.detachEvent('on' + 事件类型, function () {})





## 事件处理模型（传递关系）
### 事件冒泡

- 结构上，点击子元素，子元素的事件回调函数触发一层一层向上，直到顶层父元素的回调函数触发完毕
- 顺序：从内层向外层
```
dom.addEventListener('click', function () {}, false)
// 第三个参数默认是false，不输入也行
// false表示事件冒泡
```

- 不管点击的元素本身有无事件监听函数，只要他的父亲有（或儿子有（捕获）），就会触发



### 事件捕获
- 结构上，点击父元素，父元素的事件回调函数触发一层一层向下，直到底层子元素的回调函数触发完毕
```
dom.addEventListener('click', function () {}, true)
```
// 第三个参数true表示事件冒泡


### 处理顺序
1. 非自身的回调函数：先捕获，后冒泡
2. 自身的回调函数：先执行定义在前面的函数！！
  1. 经过测试！！！不一定！！！也是按照【先捕获后冒泡】的顺序
  2. 如果都是捕获或者都是冒泡，先执行定义在前面的函数！！

- 例子：

```
const outter = document.getElementsByClassName('outter')[0];
const middle = document.getElementsByClassName('middle')[0];
const inner = document.getElementsByClassName('inner')[0];

outter.addEventListener('click', () => {
    console.log('outter Bubble')
}, false)
middle.addEventListener('click', () => {
    console.log('middle Bubble')
}, false)
inner.addEventListener('click', () => {
    console.log('inner Bubble')
}, false)

outter.addEventListener('click', () => {
    console.log('outter')
}, true)
middle.addEventListener('click', () => {
    console.log('middle')
}, true)
inner.addEventListener('click', () => {
    console.log('inner')
}, true)
```

- 上述代码打印的结果是
```
// 疑问：我打印的是下面
outter
middle
inner
inner Bubble
middle Bubble
outter Bubble

// 但老师打印的是
outter
middle
inner Bubble
inner
middle Bubble
outter Bubble
```

3. 注意！以下事件不冒泡（基本都是表单事件）
  1. Focus
  2. Blur
  3. Change
  4. Submit
  5. Reset
  6. Select
  

### 事件委托
- 基于事件冒泡的原理：
  - 针对【多个（相似）dom】的事件监听，或【不断有新dom产生的一个dom“列表”】的监听
  - 包裹一个父元素，只绑定一次函数
  - 通过event.target对象拿到每个子dom的值

```
ul.onclick = function (e) {
    const event = e || window.event;
    const target = event.target || event.srcElement;
    console.log(target.innerText);
}
```




### 阻止事件

1. 阻止事件冒泡
- 事件回调函数的入参是一个事件对象，上面有一个方法是event.stopPropagation()
  - （不支持ie9以下的版本）

```
div.onclick = function (event) {
    event.stopPropagation();
}
```

- event.cancelBubble = true
  - （ie独有的方法）




2. 阻止默认事件

- 浏览器默认事件：（已经写好在内核的回调函数）
  - 表单提交
  - a标签：跳转页面或到页面顶部（写了#）
  - 右键出现菜单事件（oncontextmenu）


1. document.oncontextmenu = function () { return false }
- 直接return false，兼容性很好

2. event。preventDefault()
- ie9以下不兼容

3. event.returnValue = false
- 兼容ie


- 例子：取消a标签的默认事件

```
// 写法一
a.onclick = function () {
    return false;
}

// 写法二
// javascript:后面如果写void()，括号内表示函数的返回值
<a href="javascript: void(false)">click me</a>
```


### 事件对象

#### 拿到事件对象

1. ie浏览器：window.event
2. 其他：event（函数入参）

```
// 需要兼容
dom.onclick = function (e) {
    const event = e || window.event;
}
```


#### 属性

1. 事件源对象：用户实际点击的标签是谁
- target：火狐只有这个，谷歌也有这个
- srcElement：IE只有这个，谷歌也有这个

```
// 需要兼容
dom.onclick = function (e) {
    const event = e || window.event;
    const target = event.target || event.srcElement;
}
```


### 事件分类

#### 鼠标事件

（有on的版本）
1. onclick：鼠标点击
  1. 等于onmousedown + onmouseup
  2. 只能监听左键，不能监听右键
  
2. onmousedown：鼠标按下不松开
3. onmouseup：鼠标松开
- onmousedown和onmouseup的事件对象的button属性（其他没有，尤其是onclick没有！！）
  - button：0：左键
  - button：1：中间键
  - button：2：右键

4. onmousemove：鼠标移动
- 移动端的三件套是（touchstart、touchend、touchmove）

（css的hover）
5. onmouseover / onmouseenter：鼠标闯进某dom区域
6. onmouseout / onmouseleave：鼠标离开某dom区域

7. oncontextmenu：右键出菜单


- 问题：如何区分拖拽的点击？
  - 看【点击的瞬间与onmouseup的时间差】

```
let firstTime = 0, lastTime = 0;
let onClickKey = false;
// 定义一个开关，表示区分出了click事件

document.onmousedown = function () {
    firstTime = new Date().getTime();
}
document.onmouseup = function () {
    lastTime = new Date().getTime();
    if (lastTime - firstTime < 300) {
        onClickKey = true;
    }
}
document.onclick = function () {
    if (onClickKey) {
        console.log('click');
        onClickKey = false;
        // 末尾做完click该做的事情之后关闭开关
    }
}
```

- 例子：拖拽

```
// 按下鼠标，但不松开
outter.onmousedown = function (e) {

    // 按下鼠标的这一刻，鼠标可能在方块的中间
    // 但移动的那一刻，鼠标位置恢复成默认（dom的坐标原点（左上角））

    // 这对于dom方块来说呢？？？它往右下移动了
    // （为什么要思考对于方块来说如何，因为移动时改变的是方块的位置而不是鼠标的位置）

    // 移动的时刻：给方块往左上拉，减去【按下时鼠标距离方块原点】的x和y距离
    let disX = e.pageX - parseInt(outter.style.left);
    let disY = e.pageY - parseInt(outter.style.top);

    // 鼠标一直按着，开始移动
    // 注意！按着鼠标移动的时候，对移动事件的监听由document来触发，这样允许鼠标移出了方块也能触发到
    document.onmousemove = function (e) {
        const event = e || window.event;
        outter.style.left = event.pageX - disX + 'px';
        outter.style.top = event.pageY - disY + 'px';
    }

    // 松开鼠标
    // 松开鼠标允许在方块之外松开
    document.onmouseup = function () {
        document.onmousemove = null
    }
}
```

#### 键盘事件

1. onkeydown：键盘按着不松开，连续一直按着，事件一直被不断触发
  1. charCode永远是0，keyCode和which是按键位置码，不能识别按下了什么字符（不能区分大小写）
  2. 监测到所有按键
2. onkeypress：键盘按着不松开，连续一直按着，事件一直被不断触发
  1. charCode是按键的ascii码， 是对的。keyCode和which是按键位置码（能区分大小写）
  2. 只能监测到字符按键（ascii表里面有的）
```
// 识别ascii码转换成字符
console.log(String.fromCharCode(e.charCode))
```

3. onkeyup：键盘松开
- onkeydown > onkeypress > onkeyup


#### 文本事件

1. oninput
  1. 触发时机：鼠标聚焦 + 输入（输入一次触发一次，只要输入框内容变了都会触发）

2. onchange
  1. 触发时机：鼠标聚焦 + 输入不同的字符 + 鼠标失去焦点（如果两次时机的字符串一样，不会触发事件）



- placeholder的底层写法

```
<input placeholder="请输入" />

// 底层写法：
<input value="请输入" onfocus="if (this.value === '请输入') { this.value = '' }" onblur="if (this.value === '') { this.value = '请输入' }" />
```

#### 窗口事件

1. onscroll：滚动
2. onresize：浏览器的窗口大小发生变化

3. onload：dom的资源下载完 / window加载完       （除了ie不兼容，其他都兼容）
  1. window.onload 的触发时机：dom【解析完】，且图片、css、js等资源【下载完】且【执行完】，才执行回调函数
  2. dom.onload 的触发时机：dom的资源【下载完】，还【没执行】（这里的dom代指script、img、iframe等需要外部资源的标签）
- DOMContentLoaded：dom【解析完】，但图片、css、js等资源可能没有下载完

```
// ie的script标签上有readyState的属性
if (script.readyState) {
    // 监听readyState属性是否发生变化
    script.onreadystatechange = function () {
        if (script.readyState === 'complete' || script.readyState === 'loaded') {
            test();
        }
    }
} else {
    // 除了ie之外的其他浏览器
    script.onload = function () {
        test();
    }
}
```




# 执行时间线

## 前后数据传输
### 格式：JSON

- 本质：对象
- 格式：
  - 属性名必须加双引号
  - 形式是字符串

```
'{ "name": "zzz", "age": 55 }'
```


- 转换方法
  - 转化为JSON：JSON.stringify(obj)
  - 转化为对象：JSON.parse(str)







## 渲染过程

### 完整总览

（网络进程通过【通信】拿到html，创建渲染任务，放入渲染主线程的消息队列，渲染主线程开始执行这个任务）

（主线程同时开启【预加载扫描器】线程，
  - 快速浏览文档中所有【外部资源】，css或js或字体或图片（link、script、img）
  - 【下载】
  - 后续工作
    - css资源：css的预处理，完了交给渲染主线程
    - js资源：不会立刻执行js）


（开始生成dom树和cssom树）
1. 创建document对象，开始解析（构建dom树）
  1. 此时：document.readyState = 'loading'

2. 遇到link标签
  1. 跳过
  2. （这部分工作给预加载扫描器线程处理，预加载扫描器线程下载完资源，对css做好充分处理之后，交回给主线程构建cssom树，阻塞dom树构建）
3. 遇到style标签 / 行内样式 ，构建cssom树，阻塞dom树
4. 遇到img标签
  1. 跳过
  2. （这部分工作给预加载扫描器线程处理，预加载扫描器线程下载完资源，存到浏览器缓存）
5. 遇到script标签
  1. 没有设置async、defer，所有事情停止，开始下载src，下载完了开始执行，（或等待预加载扫描器下载完从缓存取出执行），执行完了才继续解析
  2. 有设置async、defer，创建新线程异步下载src，且继续解析文档（异步加载的js里面不能使用document.write()）
    1. async：新线程里面下载完立刻执行。（或预加载扫描器下载完从缓存取出执行）
    2. defer：新线程里面下载，等待主线程解析完之后执行。（或预加载扫描器下载完从缓存取出执行）


（dom树、cssom树构建完）
6. 文档解析完成
  1. 此时，document.readyState = 'interactive'

7. 设置了defer的脚本按照顺序执行
8. document触发DOMContentLoaded事件，执行回调函数   或者   $(document).ready(function () {})里面的回调函数执行
9. 所有异步的任务还在执行中（正在异步下载资源）

10. 所有资源下载完
  1. 此时，document.readyState = 'complete'

11. window对象触发onload事件，执行回调函数


（开始生成布局树）
12. 计算最终样式，得到丰满的dom树
13. 构建布局树（去掉不可见元素，加上可见元素）


（开始分层和分块）
14. 分层，每一层生成绘制指令合集
15. 对每一层分块，每个块填充颜色，得到每个位图


（最终 绘制）
16. quad命令，告知每个位图相对于屏幕的位置，显卡显示页面



### 加载
（注：加载等于下载）

#### script标签
##### 加载相关属性

1. 异步加载
- defer（只有ie能用）：加载完等dom解析完才会被执行（执行也是异步的，在另一个进程里面干）
  - 代码可以写到标签里面
- async（所有浏览器都能用）：加载完立刻执行（执行也是异步的，在另一个进程里面干）
  - 代码不能写到script标签里面


2. （进阶！！）按需加载
- 场景：一个按钮，用户按他的概率只有0.1%，那这个脚本可以不用放在当前页面首加载中，可以等到用户按了，才去加载

```
// 这表示默认是以async的方式进行加载的js
const script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'toos.js';
// 执行上面这一句的时候，浏览器就会立刻去下载js文件，异步地下载，在另一个线程里面下载
// 但还不会去执行

document.head.appendChild(script);
// 只有把dom加到页面中，script标签才会体现他的默认特征：下载完立刻执行里面的代码
// 此时如果还没下载完，但这行代码是已经执行了的，那他下载完的那一刻他自动回自己立即执行

// 如果这是一个默认的script标签，执行完第7行代码之后
// 所有dom解析，css解析都暂停，要一直等这个script【下载】且【执行】完



// 但有的浏览器不支持async，那就需要取消异步加载的方式
let script = document.createElement('script')
script.src = 'xxx.js'
script.async = false
document.head.appendChild(script)

// 但是动态加载的方式本身不可预见，又不是异步加载，很容易因为加载网络问题产生延迟，而一直阻塞渲染
// 解决：让浏览器预加载器提前知道这些要动态导入的文件的存在，使用rel的preload属性
<link rel="preload" href="xxx.js">
```


- 场景拓展：假设我只需要执行引入的tools.js文件里面的某个工具函数test()
  - onload的时机是：dom的src资源【下载】完成那一刻

```
// ie外其他浏览器
script.onload = function () {
    test();
}
// 兼容ie
script.onreadystatechange = function () {
    if (script.readyState === 'complete' || script.readyState === 'loaded') {
        test();
    }
}

// 注意一定要【在script被放到文档中】之前定义好
document.head.appendChild(script);
```


- 整合，封装成函数

```
function asyncLoadScript(url, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';

    if (script.readyState) {
        script.onreadystatechange = function () {
            if (script.readyState === 'complete' || script.readyState === 'loaded') {
                callback();
            }
        }
    } else {
        script.onload = function () {
            callback();
        }
    }

    // 为什么要把回调函数写在下载前？？？？？
    // 如果下载写在回调函数前面，万一下载是一瞬间的事，还没执行到【定义回调函数】的代码时，就已经下载完，错过了onload的时机
    // 回调函数即使被定义也永远不会执行了
    script.src = url;
    document.head.appendChild(script);
}


asyncLoadScript('tools.js', test)
// 直接写tools.js里面的test的函数名报错
// 执行到上面这一行的时候，预编译并不知道asyncLoadScript的具体执行内容，所以在这test找不到

asyncLoadScript('tools.js', function () { test() })
// 使用函数引用的方法，传入一个新函数，里面包裹目标函数
// 在这不需要知道新函数的函数体，传入到回调函数，回调函数真正执行的时候，tools.js已经下载完毕，test肯定就能找到了



// 办法二，传入字符串，用eval()执行
script.onload = function () {
    eval(callback);
}
asyncLoadScript('tools.js', 'test()')


// 办法三：tools.js导出一个对象，里面的属性对应的就是一个方法，直接调用属性
// const tools = {
//     test: function () {},
//     demo: function () {},
// }
script.onload = function () {
    // tools是导出的对象名字
    tools[callback]();
}
asyncLoadScript('tools.js', 'test')
```




##### 其他属性

1. crossorigin【网络】
- 默认：不使用cors
- anonymous：表示不设置凭据
- use-credentials：表示设置凭据

2. integrity【安全】
- 对比接受到的资源和加密签名来验证完整性，不匹配脚本不执行
- 确保CDN不会提供恶意内容

3. src
（有src，标签里面又有内容，只会执行src的）
- src可以是跨源的地址，发起请求可以成功拿到js数据
  - 一保证源可信，二使用上面的integrity属性
- 浏览器缓存可以缓存所有含有src的【外部链接】的js文件

4. type
- 定义脚本语言的类型（MIME类型）
- 默认是：‘text/javascript’（最好不要指定）
- 如果src的文件是jsx或ts或tsx格式的，服务器会根据扩展名来响应正确的MIME类型（因为服务器首先会识别脚本的扩展，浏览器则不关心）

##### 特殊注意

- 浏览器具有解析</script>的精细的规则（or算法？），所以不能在标签里面使用字符串的</script>，会报错显示Invalid or unexpected token，并把他当成结束符号。

```
function say() {
    console.log('</script>')
}
say()
```


- 需要对/进行转译

```
function say() {
    console.log('<\/script>')
}
say()
```


（浏览器如果不支持脚本（或对脚本的支持被关闭），noscript标签里面的内容会被渲染，相当于一个兜底方案）





### 生成
#### dom树
- 流程：
  - 创建一个空的document对象
  - 对dom一行一行解释，看到这是什么节点之后，立刻把节点挂到树上面
    - 比如img标签，不需要等图片下载完，就把img挂到树上了

- 原则：深度优先搜索




#### cssom树
- 结构：
  - StyleSheetList是一个类数组，是document对象的一个属性
  - 举例底层如何对所有div进行修改？？

```
document.styleSheets[0].addRule('div', 'border: 2px solid black')

// addRule方法的参数是：选择器、样式
```


- 流程：
  - 预加载扫描器线程
    - 开启预加载扫描器，快速浏览整个文档
    - 下载资源
    - css的预先处理
  - 回到主线程
    - 构建cssom树（阻塞dom树的构建）


PS：浏览器默认样式表在源码的：third_party--blink--renderer--core--html--resources--html.css


#### render树（布局树）

- 流程：
  1. 样式计算
  - 遍历dom树每一个节点
  - 根据cssom树计算每个dom节点的【最终样式】（预设值变为绝对值），计算结果挂到dom树每一个节点上
    - css的层叠
    - css的继承

```
比如：
red 变为 rgb(255, 0, 0)
em 变为 px
```


  2. layout
  - 根据修改后的DOM树生成Layout树
    - 处理：不显示的节点、显示伪元素、行盒和块盒的补充（内容必须在行盒中、行盒与块盒不能相同）
    - 每个节点（不是dom对象 ）包含的信息：
      - 尺寸
      - 位置（相对于【包含快？？？】的位置）





PS：布局对象在源码的：third_party--blink--renderer--core--layout文件夹


### 绘制
#### 分层与指令生成（渲染主线程）

1. 分层
- 问题：【未来绘画】直接按照布局树绘制，如果用户点击了什么，就要从头到尾再绘制一遍，成本太高了。
- 如何解决：分层抽离层次，后面交互改变页面内容的话可以复用不变的part

- 怎么分层？（根据堆叠上下文）
  - 与分层可能有关的：
    - z-index
    - transform
    - opacity
  - 与分层肯定有关的：
    - will-change: xxxx


2. 指令生成（官方话：绘制 paint）
- 为每一层生成【如何绘制的指令】集合

```
比如：

在10,20的位置画一条长20，宽5的直线
在直线的末尾的坐标向下画一条直线
```


#### 分块与光栅化（合成线程与GPU进程）

1. 分块（合成线程）
- 问题：【当次绘画】整个页面很大，层次很多，按照每一层从下往上画吗？，太浪费时间了。先画什么？什么优先级更高？
- 如何解决：对每一层再次细分成多个【栅格】（或块），先画位于视口内的栅格（块）

- 流程：
  - 开启合成线程
  - 合成线程开启多个子合成线程
  - 每个子合成线程同时：对每一分层细分成多个块


2. 光栅化（GPU进程）
- 流程：将每个块变为位图（优先处理视口内的块）
  - 第一个块有n个像素，每个像素填颜色，得到一个【有颜色的位图】
  - 第二个块......
  
- 用到GPU加速


#### 画
- 流程：
  - 合成线程对GPU进程发出quad指令
    - 告知每个【有颜色位图】相对于屏幕的位置
    - 计算transform的变形（效率高！！）
  - GPU进程交给显卡，计算并显示


- （为什么合成线程不直接把信息告诉显卡，要经过浏览器的GPU进程中转？？？）
  - 合成线程在渲染进程里面，渲染进程在沙盒里面，不能直接操作硬件或调用操作系统。借助GPU进程实现。



### 修改
#### 重排：样式计算开始

1. 哪些操作引起？？
- dom节点的删除、添加
- dom节点尺寸变化：width、height、padding、border-width、border、box-shadow...（注意：outline-width不算，它不占空间）
- dom节点位置变化：margin、left、top、bottom、right、flex、align-items、align-content...
- offsetWidth / offsetLeft 触发（为保证结果是实时的，调用这两个属性，浏览器内部会重新从根节点开始重排）


2. 从哪个步骤与开始重新渲染
- dom树改了吗
  - dom节点增删：改了
  - dom节点不变：没改
- 从render树生成的【样式计算】步骤开始


#### 重绘：指令绘制开始

1. 哪些操作引起？？
  - 颜色
  - visibility

2. 从哪个步骤与开始重新渲染
- 样式计算改了
- 从绘制指令开始


#### transform 或者滚动条滚动

1. 从哪个步骤开始？
- 样式计算改了吗
  - js改变的transform属性值：改了
  - animation：没改
- 从draw画开始

