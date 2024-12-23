# 浏览器
## 历史
- 真正显示图片的浏览器（迭代历史）
1. mosaic
2. Netscape navigator 网景
3. Mozilla Firefox

## 浏览器组成
- 两大部分
1. shell（贝壳，显示出来/用户能操作的部分）
2. 内核（看不到的部分）——>渲染进程？？里面的线程？？？
  1. 渲染引擎（从上到下，一层一层绘制，16.7ms更新一次）：语法规则和渲染
  2. js引擎
  3. 其他模块（异步）

- 其中js引擎的历史
  - ie6浏览器的js引擎：trident，把js引擎首次从内核独立出来
  - chrome浏览器的js引擎：webkit/blink（V8），把js代码直接转为机械码执行，速度快（原本应该是：js—>c++—>汇编码—>机械码—>执行）
  - firefox浏览器的js引擎：gecko，路径优化
  - Opera浏览器的js引擎：presto
  - safari浏览器的js引擎：webkit


# 语言
## 特征
1. 解释性语言
- 顶层语言翻译成机械码有不同的翻译的方法，分为：
  - 编译性：通篇翻译一下，然后一起执行。并非看一行执行一行
  - 解释性：翻译一行执行一行，然后在翻译第二行
- 优缺点：
  - 编译性：（c、c++）
    - 优点：快（系统类的底层）
    - 缺点：移植性不好（必须生成一个文件，因此不跨平台）

  - 解释性：（js、php）
    - 优点：跨平台（一行一行执行，不需要生成一个文件，不同平台都认识01）
    - 缺点：稍微慢

- 另外的：jvm（java虚拟机）
.java文件——（javac的指令）——（编译）——>.class文件——>jvm（解释执行）


2. 既面向对象又面向过程
- 面向对象：谁来干
- 面向过程：第一步第二步是什么



3. 单线程（js引擎）
（一个人一个时间只能干一件事，不能左手画圆右手画方）

- 分类
  - 同步：一件事做完再做下一件事。（但很快，且这一件事不一定是一件完整的事，看下面的#执行队列）
  - 异步：同时执行

- 执行队列
轮转时间片：类似吃饭

把任务切成一个个片段，随机性地排队，然后输入到js引擎里面


4. 语法规则
- 原生的：ECMAscript
- DOM
- BOM







## 编译
### 总体步骤
1. 语法分析（通篇扫描）
2. 预编译（解释为啥函数声明/变量-声明提升？？）
3. 解释执行（解释一行执行一行）


### 预编译
#### 问题引入
- 函数声明整体提升
```
test()
// 成功执行

function test() {
    console.log('ok')
}
```

- 变量-声明提升
```
console.log(a)
// 打印undefined
// 如果没有下面这一行，是会报错的，显示a is not defined

let a = '11'
```


#### 原则
- 变量没声明就赋值，此变量为全局对象（window）所有（也就是window是全局的域）

```
a = 10
// 等于window.a = 10


function test() {
    var a = b = 10
}
test()
// 首先把10赋值给b（但b是未声明的）
// 然后声明a
// 然后把b赋值给a
// 相当于从头到尾b都没有声明，也就是为全局变量

console.log(window.a)
// 值为undefined
console.log(window.b)
// 值为10
```


#### 干了什么，什么时候干
1. 局部预编译
（局部预编译发生在函数执行的前一刻）
```
function fn(a) {
    console.log(a);
    let a = 123;
    console.log(a);
    function a() {};
    console.log(a);
    let b = function() {};
    console.log(b);
    function d() {};
}
fn(1)
```

- 创建AO对象（Activation Object）（相当于执行上下文）
```
AO {

}
```

- 找形参（a）和变量声明（a和b），作为AO对象的key，值为undefined
```
AO {
    a: undefined,
    b: undefined,
}
```

- 形式参数的key的值为实际参数（实际参数和形式参数相统一）
```
AO {
    a: 1,
    b: undefined,
}
```

- 找函数声明（a和d），相应key值为函数体
```
AO {
    a: function a() {},
    b: undefined,
    d: function d() {},
}
```

！！！总结一下：
1. 形变
2. 形填充
3. 函填充（覆盖原有的实参数据，优先级最高）

- 最后结果
```
// 函数
function fn(a){
    console.log(a); //根据AO对象中的数据第一个打印的是：function a() {}
    
    // 变量声明+变量赋值（只提升变量声明，不提升变量赋值）
    var a = 123; // 执行到这时，由于变量赋值是不提升的，所以执行a = 123，a原本的函数值被123覆盖了
    // 注意！！上面这行代码换成let和const都说a已经被声明过了，var是正常的，因为var可以重复声明同名变量，且覆盖同名变量
    console.log(a); // 123
    
    // 函数声明
    function a(){}; // 这里被提升上去了，可以忽略
    console.log(a); // 123
    
    // 变量声明（函数表达式）
    var b = function(){};
    console.log(b); 
    // var b 作为变量声明已经提上去了，需要执行的是function() {} 赋值给b
    // AO对象中的数据被改了：function () {}
    
    // 函数声明
    function d(){};
}
//调用函数
fn(1);
```

2. 全局预编译
（全部预编译发生在页面加载完成时执行）
```
console.log(a)
// 返回function a() {}

let a = 123;
function a() {}
```

- 创建GO对象（Global Object）（相当于执行上下文）
```
GO {

}
```

- 找变量声明（a），作为AO对象的key，值为undefined
```
GO {
    a: undefined,
}
```

- 找函数声明（a和d），相应key值为函数体
```
GO {
    a: function a() {},
}
```


3. 当前局部上下文AO找不到目标值，才去上一级找（上一级的AO或者GO）。如果本身的AO有，就不需要去上一级找
- 简单版本
```
// 全局预编译写在最上面
GO = {
    global: undefined, // 后面执行第一行的时候变成100
    fn: function fn() {...},
}

global = 100;
function fn() {
    console.log(global);
    global = 200;
    console.log(global);
    var global = 300;
}

// 函数执行前预编译，所以写在这里
AO = {
    global: undefined, // 后面执行里面的global赋值的时候，global变为200，以及300
}

fn();
var global;
```


- 困难版本
```
GO = {
    test: function test() {...},
    a: undefined,
    c: 234, // 在执行到test函数内部的c = 234的时候，放到GO里面
}

function test() {
    console.log(b);
    if(a) {
        var b = 100;
    }
    console.log(b);
    c = 234;
    console.log(c);
}

var a;

AO = {
    b: undefined, 
    // 这里不管有没有if条件的限制，都会变量声明提升，直接忽略if条件
    // 但是在执行的时候，需要看if的条件是否满足，因为a此时为undefined，所以不满足条件，b后续不能被赋值
}

test();
a = 10;
console.log(c);
```

- 继续最后一个练习
```
// 第一个全局编译
function bar() {
    return foo;
    foo = 100;
    function foo() {}
    var foo = 11;
}
console.log(bar());
// 返回 function foo() {}


// 第二个全局编译
console.log(bar());
function bar() {
    foo = 10;
    function foo() {}
    var foo = 11;
    return foo;
}
// 返回 11
```




## 基础使用
### js的位置
- script标签
  - script标签的type还可以写成“text/tpl”，代码块无效，不执行，但里面可以存一下代码，后面可以取出来使用


### 规则
- 加分号：函数、for循环、if判断不用加；
- 错误：
  - 低级错误（语法解析错误）
    - 不对的符号
    - 在一行行解析之前，先通篇扫一遍看有没有低级错误，有则通篇都不会执行
  - 标准错误（逻辑错误）
    - 打印没有定义的变量
    - 执行到这行报错，然后后面的不再执行，上面的执行是正常的

（一个代码块的错误不会影响到另一个代码块的错误）



### 变量
- 变量声明与赋值：
  - 变量声明：

```
let a;

let a, b, c, d;
  - 变量赋值:
a = 100;
  - （先）变量声明，（后）赋值：
let a = 10,
    b = 20,
    c = 30;
  - （先）变量声明，（再）运算（从左到右），（最后）赋值（从右向左）
let a = b++ + 20;
```

- 变量命名：
_或$或字母为开头

_或$或字母或数字为内容



### 数据
- 数据类型
  - 原始值
    - Number
    - String
    - Boolean
    - Undefined
    - Null
  - 存放位置：栈（先进后出）
    - 栈内存之间的赋值是拷贝（比如用一个现有的值赋给一个新值）
    - 原始值是不可改变的！！！这句话如何理解？（数据进去房间之后就不能修改）

```
let num = 100;
num2 = num;
num = 200

// 最后的地方把num的值改变了，实际上已经存在房间里面的值是不可以被改变的
// 底层的实现不是去num的房间直接去改他的值
// 而是在新的房间赋值，把新房间的名字改为num，原来房间的名字恢复初始值
```

（房间里面值变化了，或被删除了，只是断开了房间号和房内数据的联系，实际上数据还在，只是房间号变成默认值了（maybe里面有一个房间号变化的历史的链表结构记录着））

（电脑的内存初始存：从头到尾存，发现到末尾了提示内存不足，然后删除东西，断开房间号和数据的联系，把房间号删除/恢复默认了，然后再存东西，把房间的数据覆盖了，然后才改房间号）


- 引用值
  - 原始值
    - Array
    - Object
    - Function
    - Date
    - RegExp
  - 存放位置：堆
    - 散列结构
    - 先新建一个房间到栈，然后拷贝目标值，如果目标值是引用值，则拷贝的是指向的地址


  - 例子：

```
let arr = [1, 2];
let arr2 = arr;
arr = [1, 3];

// 这个时候，arr2的值有变化吗？没有，因为[1, 3]在堆那边又新开辟了一个房间
// arr指向的地址改变了，但arr2的地址没有改变
```


运算
1. +
- 连接
- 加法

```
let a = 1 + 1 + 'a' + 1 + 1
// 输出2a11，前两个先算，然后遇到字符串变“2a”，再连接后面的

let a = 1 + 1 + 'a' + (1 + 2)
// 输出2a3，先算括号，再算前两个，再连接a

2. /
let a = 1 / 0
// 输出infinity

let a = -1 / 0
// 输出-infinity

let a = 0 / 0
// 输出NaN
```

3. 优先级
- =最弱，()最高
- ++的位置
  - a++：先执行本条语句，然后再++，这时a的值才改变
  - ++a：先++，a本身的值改变了，然后再执行本条语句

```
let a = 10;
let b = ++a - 1 + a++;
// b输出的是21——注意++a的时候a的值已经变成11了，所以第二个a++，这个时候的a是11
// a输出的是12
```

- += / %=

```
let a = 10;
a += 10 + 1;
// 输出21，拆开相当于 a = a + 10 + 1

a %= 2;
// 输出0，相当于a = a % 2

let a = 3
a %= 4
// 输出3，因为 0 * 4 + 3 = 3，相当于3是余数

a %= 0
// 输出0
```





### 比较
1. > 

```
let a = 'a' < 'b'
// 比较的是asc码
// 输出的是true

let a = '10' > '8'
// false
// 比顺序，首先1和8比，能比就比
```


- 比较字符串
  - 实际上比较的是他们对应的asc码
  - asc码本质上是七个01数，总共表示127个字符。
  - asc2码有8个01数，总共表示255个字符


2. ==和===
- 原始值转数字
- 引用值转字符串再转数字（转字符串之后其实相当于转为原始值了）

- ！（补充）：原始值转数字
  - 转为0
    - KFN
    - ""，false，null
  - 转为NaN
    - U（Y）
    - undefined、“包含非数字”


3. &&和||
- &&（找真）
  - 基础用法
    - 一表达式转布尔值为真？返回二表达式原始值（不转布尔）
    - 一表达式转布尔值为假？返回一表达式原始值（不转布尔）
    - 链式：一个为真，就往后看，一遇到假立刻返回假
  - 高级
    - （中断用法，短路语句）用作if语句：如果前面为真，就执行后面的语句

```
data && console.log(data)
```


- ||（找假）
  - 基础用法
    - 一表达式转布尔值为真？返回一表达式原始值（不转布尔）
    - 一表达式转布尔值为假？返回二表达式原始值（不转布尔）
  - 高级
    - （兼容/兜底用法）

```
let event = e || window.event
```


- ！（补充）：原始值转布尔值
  - 转为false
    - KUZAN
    - ""，undefined，0，NaN，null


- &
  - 与运算：相同为1，不同为0




### 类型判断与转换
#### 类型判断

1. 基础介绍：typeof

- typeof：UFO（undefined、function、object）
- 特殊：对于没有声明的变量，不管是在typeof语句后面声明还是压根没有声明，typeof xx就一定会返回undefined

```
typeof a
// 返回"undefined"

typeof b
var b = 1
// 返回"undefined"
```

- 困难版本
```
var x = 1;
if (function f() {}) {
    x += typeof f;
}
console.log(x);
```

  - function f() {}被括号包裹了，说明他变成了一个表达式，而不是变量声明了，因此不能提升
  - 且没有变量来承接这个表达式，相当于f没有被定义
  - 输出“1undefined”


2. 几个方案

  1. typeof + null + Array.isArray()
  2. instanceof

  - 注意：instanceof是看【某个对象的原型链是否含有另一对象的原型】
    - A instanceof B：看A对象的原型链上，是否有B的原型

    ```
    // 用于判断引用值类型
    [] instanceof Array

    // 对于跨域的场景，instanceof失效
    子域名的[] instanceof 父域名的Array
    // 返回的是false
    ```

  3. Object.prototype.toString.call(xxx)
  4. xx.constructor



#### 类型转换

1. 显式转换
- 转为数字：Number()
  - 转为0
    - KFN
    - ""，false，null
  - 转为NaN
    - U（Y）
    - undefined、“包含非数字”

- 转为整数：parseInt(string, radix)
  - 转为NaN：其他非数字类型，非数字开头的字符串
  - 转为整数：数字或数字开头的字符串
```
let a = '100px'
parseInt(a)
// 输出100
```
  
  - 第二个参数：【转10】把当前第一个参数当做：第二个参数表示的进制数，转化第一个参数为10进制
    - 范围是2-36
```
parseInt('b', 16)
// 输出的是11
```

- 转为小数：parseFloat(string)
  - 转为NaN：其他非数字类型，非数字开头的字符串
  - 转为整数：数字或数字开头的字符串



- 转为字符串：
  - String(xxx)或者+ ''
    - 什么东西都会转化成字符串
  - xxx.toString(radix)
    - undefined和null没有这个方法，用不了
    - 第二个参数：【10转】把前面的数字当成是10进制，然后转化成第二个参数定义的进制（注意：只有在前面的数据是数字的时候才ok）
```
'10'.toString(8)
// 输出12
```

- 转为布尔值
  - 转为false
    - KUZAN
    - ""，undefined，0，NaN，null



2. 隐式转换
- isNaN()
  - 内部先Number()，然后再把结果和NaN相比较

- 非加法运算：内部先Number()
  - ++/--或者+/-（正负）
  - *、-、/、%
- 加法运算（+）：有string就用toString方法

- 比较
  - < 或 > ：先Number()，如果两个都是字母字符串，比较asc码
  - && 或 || 或 ! ：转布尔值
  - == 或 === ：
    - 原始值转数字，Number()
    - 引用值转字符串再转数字（转字符串之后其实相当于转为原始值了）

- 特殊
  - undefined == null ——>true
  - NaN === NaN ——> false
  - typeof xxx ——>返回的值是字符串类型
```
typeof typeof undefined
// 返回string
// 相当于 typeof  'undefined'
```






### for/while
- for循环：底层执行顺序
```
for (let i = 0; i < 10; i++)
```
1. 【左】初始值的定义（只执行一遍）
2. 【中】判断limit条件
3. 【下】执行语句
4. 【右】执行下一步操作
5. step2-4循环执行！！！


- while循环：for循环不写分号前后两个就是while循环
（打印10次）

- do..while：不管while条件，首先都要执行do里面的语句





## 函数

原则：

高内聚，弱耦合

（耦合 = 重复）


### 定义
1. 函数声明
2. 函数表达式


### 入参
1. 形参和实参
  - 实参——arguments.length
  - 形参——函数名.length

```
function sum(a, b, c) {
    console.log(sum.length)
    // 打印3
    console.log(arguments.length)
    // 打印5
}
sum(2, 3, 4, 5, 6)
```

- 实参（arguments）的方法或属性
  - arguments.callee

```
// 求n的阶层，用递归！
const num = (function (n) {
    if (n === 1) {
        return 1;
    }
    // 这里外部函数没有名字，用arguments.callee来代替当前外部函数
    return n * arguments.callee(n - 1)

}(n));
```

  - func.caller：查看被调用时所处的环境
```
function test() {
    demo()
}
function demo() {
    console.log(demo.caller)
}
test()
```


2. 两者内部的映射关系

```
function sum(a, b) {
    // 原来是1
    a = 2;
    console.log(arguments[0])
    // 打印2
    
    arguments[0] = 3;
    console.log(a)
    // 打印3
    
    // 实际上两者不是一样的变量，只是内部有一个映射关系，把两个绑定在一起
    // 你变我也变，我变你也变
}
sum(1, 2)


function sum(a, b) {
    b = 2;
    console.log(arguments[1]);
    // 打印undefined，因为实际参数和形参不是完全一一对应，因此里面的映射关系是不存在的
}
sum(1)
```

### 作用域
#### 基本结构
- 作用域：函数每次执行都会生成一个新的执行期上下文，执行完就销毁（注意销毁的是[[scroll]]里面的当前的作用域的对象，其他作用域还是存在的！！）
- 作用域链：作用域的集合，也就是[[scope]]，是函数对象的一个属性
- 查找变量：作用域链的顶端往下找（栈结构）




#### 闭包
- 问题：内存泄漏
- 好处：
  - 实现共有变量：累加器（这个共有变量不能放在全局，因为要封装工具）
  - 可以做缓存：存数据结构
  - 实现封装：属性私有化
  - 模块化开发

- 使用

```
function Person() {
    const name = 'zzz'
    this.getPrivateName = function() {
        console.log(name)
    }
}
const person = new Person()
person.getPrivateName() // 打印‘zzz’
console.log(person.name) // 打印undefined
// name的属性，只有通过【外部调用的内部函数】才能被访问到
// 这个属性对于Person来说就是一个私有的，没人能随便修改，很安全！
```

#### 立即执行函数
- 场景：初始化（数据？？）
  - 只被执行一次，
  - 执行完立刻销毁


- 使用：（一般数据类的都要return）

```
// 形式为: (function (){}())
(function (a, b, c) {
    return a + b + c;
}(1, 2, 3))

// 只有表达式才能被执行符号()执行

// 下面是函数声明，直接立即执行不行，语法错误
function test() {
    console.log('222')
}()

// 下面是函数表达式，直接立即执行是ok的
const test = function () {
    console.log('111')
}()

// 且执行符号执行之后，函数的名字会被忽略
// 相当于我函数立即执行，完了之后这个函数对象被销毁了，因此针对上面的函数，打印test是undefined

console.log(test)
// 输出为undefined
```


#### 闭包和立即执行函数的合体
- 问题：打印什么

```
function test() {
    let arr = [];
    for (var i = 0; i < 10; i ++) {
        arr[i] = function () {
            console.log(i + ' ');
        }
    }
    return arr;
}
let myArr = test();
for (let i = 0; i < myArr.length; i ++) {
    myArr[i]();
}
```

- 初始结果：打印出10个10
因为执行的时候找上层作用域，此时里面的变量i已经是10了


- 如何使得打印出0-9
  - 思路1：在执行时存入一个形参，利用形参和实参统一，在每个arr[]的AO内部存一个变量，但是缺点是这个的i是被外部决定或赋予的

```
function test() {
    let arr = [];
    for (var i = 0; i < 10; i ++) {
        arr[i] = function (j) {
            console.log(j + ' ');
        }
    }
    return arr;
}
let myArr = test();
for (let i = 0; i < myArr.length; i ++) {
    myArr[i](i);
}
```

  - 思路2：用立即执行函数包裹定义函数的过程，相当于在当前函数作用域和上级作用域之间加了一层作用域，拦截了i的向上寻找

```
function test() {
    let arr = [];
    for (var i = 0; i < 10; i ++) {
        (function (j) {
            arr[j] = function () {
                console.log(j + ' ');
            }
        }(i))
    }
    return arr;
}
let myArr = test();
for (let i = 0; i < myArr.length; i ++) {
    myArr[i]();
}
```


- 使用场景，一个ul，点击里面的每个li，都显示他对应的索引值
应该要使用立即执行函数去包裹onclick函数的赋值！！！！因为到时候点击的时候相当于是在外部全局的作用域下执行onclick回调函数

```
window.onload = () => {
    for (var i = 0; i < ulList.length; i++) {
        ulList[i].onclick = function () {
            console.log(i)
        }
    }
}
```



#### 命名空间

- 历史

```
const obj = {
    department1: {
        zyl: {
            name: 'zyl',
            age: 123,
        },
        zzc: {
            name: 'zzc',
            age: 234,
        }
    },
    department2: {
        zxq: {
            name: 'zxq',
            age: 456,
        }
    }
}

with(obj.department1.zyl) {
    console.log(name) // 打印zyl
}
with(obj.department1.zzc) {
    console.log(name) // 打印zzc
}
```

with的作用是绑定执行的AO到栈顶，使得找变量直接在最近的AO里面找


- 闭包实现变量私有化

```
const name = '456'
const init = (function () {
    const name = '123';
    function callName() {
        console.log(name);
    }
    return function() {
        callName();
    }
}())
init()
// 打印的是123，而不是456
```




### 执行：try catch

- try里面的代码执行，其中某一行报错，这一行后面的（try里面的）代码不执行；但catch后面的代码正常运行
- 错误信息传到error里面
  - error.name ——> Reference errot
  - error.message ——> b is not defined

```
try {
} catch(error) {
}
```


- 错误类型
  - EvalError：eval()的使用与定义不一致
  - RangeError：数值越界
  - ReferenceError：非法或不能识别的引用数值
  - SyntaxError：发生语法解析错误
  - TypeError：操作数类型错误
  - URLError：URL处理函数使用不当





### 严格模式(es5.0)
- 默认浏览器使用的语法：es3.0所有 + es5.0新增的部分
- 定义
  - 开启：es3.0和es5.0产生冲突的部分，用es5.0的（eval3.0不能用）
  - 不开启：用es3.0的

- 开启严格模式的方法：全局脚本顶端首行写use strict，或函数局部顶端写use strict

```
// 全局脚本顶端
'use strict';


// 局部函数顶端
function test() {
    'use strict';
    console.log(arguments.callee);
}
```


  - 为什么写字符串的格式？
  - 最原始的值，防止某些老浏览器没法执行新操作，他们只能识别原始值

- es5.0不支持的es3.0的方法
  - with() {}
  - arguments.callee
  - func.caller
  - 变量赋值前必须声明
  - 局部的this必须被赋值，全局的this还是指向window

```
'use strict';
console.log(this) // 全局this打印window
function test() {
    console.log(this) // 局部this，没有被定义，打印undefined
}
test()
```
  - 拒绝重复使用形参







## 数组

1. 改变原数组：
  1. pop、push、unshift、shift
  2. sort、reverse、splice
2. 不改变原数组：
  1. slice、concat
  2. join、split

### Sort
- 底层实现：递归思路的比较顺序

```
const arr = [5, 2, 1, 8, 4, 10, 9]
arr.sort(() => a - b)
// 底层实现：递归思路的比较顺序
// 第一层：5和2对比，5和1对比...5和9对比
// 第二层：2和1比较，2和8比较...2和9比较
// ...

// 规则：
// 回调函数返回值大于0，后面的数在前面（大后前）
// 回调函数返回值小于0，前面的数在前面（小前前）
// 返回值为0，不动
```

- 给一个有序的数组，乱序

```
arr.sort(() => {
    return Math.random() - 0.5
})
```






## 对象
### 创建
#### 普通对象

1. 直接创建
```
let obj = {}
```

2. 构造函数
  1. 系统自带的构造函数
  2. 自定义一个构造函数

```
// 系统自带的构造函数
let obj = new Object()

// 自定义一个构造函数
// this相当于‘我的’
function Car() {
    this.name = 'BMW';
}

const car1 = new Car();
```

  - new触发的底层
    - 首先新建一个this
    - 然后执行语句，给this加东西
    - 最后return this

```
// 相当于以下过程
function Person(name, height) {
    const that = {};
    // 更完整的是Object.create(Person.prototype)
    that.name = name;
    that.height = height;
    return that;
}

const person1 = new Person('1', 180);
const person2 = new Person('2', 185);
```


3. Object.create(fatherObj)方法
创建子民，继承fatherObj的东西
```
function Father() {}
const f1 = Object.create(Father.prototype)

// 上面的写法相当于
// const f1 = new Father()

Object.create(null)
// 创造出来的对象没有原型
```


#### 包装类

```
new Number(123);
new String('abc');
new Boolean('true');
```


1. 原则
- 原始值没有属性和方法
- 但访问原始值的key输出的是undefined
- 原理是：内部自动new XXX()，然后给这个对象的key属性赋予value，然后再销毁这个属性key

```
const test = 'abc'
test.name = 'ss'
// new String('abc')
// new String('abc').name = 'ss'
// delete new String('abc').name
// (这里的new Sting('abc')表示同一个对象，为了表明步骤，这里写了三个)

console.log(test.name)
// new String('abc').name
// 打印的是undefined
```

- 实际上相当于，每写一次str.xxx，内部都会new一个类然后调用他一个属性
- PS：undefined 和 null 不能有属性


### 属性：如何获取
#### 获取单个属性
- 底层实现
  - 一概变成['xxx']的形式
  - 中括号里面必须是字符串

```
obj.name ——> obj['name']

const obj = {
    num1: {name: '111'},
    num2: {name: '222'},
    num3: {name: '333'},
    num4: {name: '444'},
    getNum: function(num) {
        console.log(this[`num${num}`])
    }
}
obj.getNum(2)
```


- 好处：
  - 字符串可以自定义构造，拼接！！！



#### 获取所有属性（对象的遍历）
1. for in
  - 遍历对象【本身+原型】的属性
  - 可枚举的属性

```
for (let i in obj) {
    console.log(obj[i])
}
```

- 这个遍历出来是字符串，一定要用[]去拿


2. hasOwn() / hasOwnProperty() + for in
  - 遍历对象【本身】的属性
  - 可枚举的属性

```
// 这样写才等于Object.key()或者等于Object.getOwnPropertyNames()
for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
    }
    // 或者下面的方法也行，一样的效果
    if (obj.hasOwn(i)) {
    }
}
```

- 注意：in操作符也有hasOwn的方法！但obj原型上的属性和方法也能被in访问到！不靠谱！

```
'原型的属性' in obj
// 返回true
```




### 方法：如何链式调用

函数的链式调用：返回this！！！！

```
const actions = {
    smoke: function () {
        console.log('smoking');
        return this;
    },
    drink: function () {
        console.log('drinking');
        return this;
    },
    perm: function () {
        console.log('perming');
        return this;
    },
};

actions.smoke().drink().perm().smoke()
```



## 原型
### 定义
- 大白话
  - function对象的一个属性
  - 构造函数的对象的祖先，给这个对象提供属性和方法，供他继承
  
- 好处
  - 可以提取共有属性，不需要每一次new都执行同样的【属性赋值】代码

### 修改
- 只能在构造函数的prototype上面操作（只能自己操作自己的原型）
- （特殊）新增：调用修改

```
function Father() {
    this.money = {
        card1: '100',
    };
}
const f1 = new Father();

Son.prototype = f1;
function Son() {

}
const s1 = new Son();

s1.money.card1 = '200'
console.log(f1.money)
// 打印200,
// 这是调用修改，调出那个对象那个房间，对他进行修改
```

### 方法截断（重写）
- 相当于Number的原型的方法截断了后面的Number.prototype.__proto__

```
let num = 123;
num.toString();
// 打印‘123’

// 内部发生了什么
// new Number(123).toString()
// 调用的是Number.prototype.toString()，而不是Object.prototype.toString()

let obj = {}
obj.toString()
// 返回的是[object Object]
```

### 找祖先
- constructor：返回祖先的构造函数的函数体，找【生产自己的工厂】，也就是找【母亲】（注意找的是顶端祖先的，如果母亲的祖先也有constructor，就找他的）
- __proto__：指向构造函数的原型，【祖先】和【孩子】的连接器
- prototype：返回构造函数的原型，找【祖先】

```
Person.prototype.name = 'sunny';
function Person() {
    // new底层的第一步：
    let this = {
        // __proto__相当于连接儿子和父亲
        // 当儿子本身没有一个属性或方法的时候，访问__proto__来访问父亲
        __proto__: Person.prototype,
    }

}
const person1 = new Person()

Person.prototype = {
    name: 'cherry',
}

console.log(person1.name)
// 结果是sunny，因为在定义this的时候已经把线连接上了原来的对象
// 后面的对象发生变化是另外开辟了一个空间，让这个对象指向这个新的空间，与原来的空间的连接断开
// 但是原来的空间还是有被其他人连接的


// 上面相当于下面的代码
let obj = {name: 'sunny'};
let obj1 = obj;
obj = {name: 'cherry'};

console.log(obj1)
// 打印出来是sunny
```


- 终点：

```
Person.prototype.__proto__ === Object.prototype
// 返回true
// 【构造函数的祖先的祖先】是【对象的祖先】


Object.prototype.__proto__
// 打印出来是null
// 结束链条
```

## 上下文
### 调用者拥有this（调用时产生this）
- 没有对象调用，this为window
- 有对象调用，this为对象

```
var name = '123';
const a = {
    name: '111',
    getName: function() {
        console.log(this.name);
    }
}
const fn = a.getName;
// 全局调用
fn(); // 打印123
// a对象调用
a.getName(); // 打印111

const b = {
    name: '222',
    getName: function(fn) {
        fn()
    }
}
// 全局调用
b.getName(a.getName) // 打印123
b.getName = a.getName
// b对象调用
b.getName() // 打印222
```


- 变量被this调出更改

```
var foo = 123;
function print() {
    this.foo = 234;
    console.log(foo);
}
print(); // 打印234
new print(); // 打印123
```

### 转移
1. call：
- 实际上，外面对象的this指向括号里面的对象（借用外面的工厂的属性和方法）

```
function Person(name, age) {
    // 内部相当于this = obj
    // 下面相当于
    // obj.name = name;
    // obj.age = age;
    this.name = name;
    this.age = age;
}
const person1 = new Person('z', 20);
let obj = {}
Person.call(obj, 'y', 30)
console.log(obj)
// 打印{name: 'y', age: 30,}
```

- 应用：
  - a的功能完全涵盖在b里面（a是b的子集/零件），不想重复写，又不想用原型
  - 每个人写一个零部件然后组合到一起

```
function Wheel(style, wheelSize) {
    this.style = style;
    this.wheelSize = wheelSize;
}

function Sit(sitColor) {
    this.sitColor = sitColor;
}

function Model(height, width, len) {
    this.height = height;
    this.width = width;
    this.len = len;
}

function Car(style, wheelSize, sitColor, height, width, len) {
    Wheel.call(this, style, wheelSize);
    Sit.call(this, sitColor);
    Model.call(this, height, width, len);
        // 上面相当于给Car(this)加上了各种属性（Wheel、Model、Sit的属性）

    // apply传递的参数是数组，但是顺序也要一样
    // Wheel.apply(this, [style, wheelSize]);
    // Sit.apply(this, [sitColor]);
    // Model.apply(this, [height, width, len]);
}

const myCar = new Car('z', 20, 'green', 200, 300, 400);
console.log(myCar)
```


### 例子
注意：
1. 
- 严格模式下，创建函数时全局的this不是绑定到windows，而是绑定到undefined；
- 非严格模式下，创建函数时全局this绑定在window上
- 但是如果创建时是非严格模式，然后调用时变成了严格模式，全局this还是window，不影响其绑定
2. 
setTimeout函数的内部回调函数的上下文永远都是全局上下文，如果没有显式用"use strict"，那就是非严格的全局上下文（即使setTimeout函数本身在一个严格环境下）


```
// 上下文判断的所有例子罗列(上下文与调用方式相关，闭包和箭头函数除外)
// 情况一：对象方法
// 情况1.1：普通函数
var color = 'green'
const obj = {
    color: 'red',
    getColor: function() {
        const color = 'blue'
        function inner() {
            console.log(this.color)
        }
        inner()
        console.log(this.color)
    }
}
// 调用方法1：直接指向调用目标函数
// this跟随目标函数
obj.getColor() //返回green和red

// 调用方法2：通过第三方间接调用目标函数
// this独立出来，创建自己的上下文（一般来说是全局）
const middle = obj.getColor
middle() // 返回green和green

// 调用方法3：在对象的方法内部自己调用(inner())
// 此时this指向外部全局window
// 因为调用时没有指定给某个实例，也不是某个对象的属性，单纯在一个函数里面调用
// inner函数返回green



// 再总结一下！！！
// 所谓与调用方式有关，就是调用是xx.xxx()还是xxx()的形式
// 如果是xx.xxx()的方式
// 说明我的this指向的是xx的上下文，在上面的例子中，obj的上下文就是他的{}里面的所有，因此调用返回red
// 如果是xxx()的方式
// 说明this指向的是全局的上下文，在上面的例子中，inner和middle的上下文就是全局，调用返回green



// 情况1.2：箭头函数
var color = 'green'
const obj = {
    color: 'red',
    getColor: () => {
        const color = 'blue'
        console.log(this.color)
    }
}
// 调用方法1：直接指向调用目标函数
// this指向定义函数时的变量
// 箭头函数没有this！！！只能找最外层定义的变量
obj.getColor() //返回green

// 调用方法2：通过第三方间接调用目标函数
// tthis指向定义函数时的变量
const middle = obj.getColor
middle() // 返回green


// 情况1.3：const还是var
const color = 'green'
const obj = {
    color: 'red',
    getColor: function() {
        const color = 'blue'
        console.log(this.color)
    }
}
// 调用方法1：直接指向调用目标函数
// this跟随目标函数
obj.getColor() //返回red

// 调用方法2：通过第三方间接调用目标函数
// this独立出来，创建自己的上下文（一般来说是全局）
// 但是全局上下文因为用的是const，没有挂载到this上，所以全局this为空
// const和let是局部变量，不会把变量挂载到全局this上，var会
const middle = obj.getColor
middle() // 返回undefined


// 情况1.3.5：var还是const/let
var callbacks = []
for (var i = 0; i < 4; i++) {
    callbacks.push(function() {
        console.log(i);
    });
}
callbacks.forEach(cb => cb());
// 返回 4, 4, 4, 4
// 因为是var，修改的是全局的i，要看最后时刻i是多少
// i到最后变为4，此时结束循环，那么数组里面每个i指向的值就变成4
// 相当于i不是存在栈里面每个栈帧frame里面，而是存在栈，每个函数指向的是同一个i
// i修改，全部引用这个变量的函数都要修改


// 情况1.4：有this还是无this（是this.xxx还是单纯变量）
var color = 'green'
const obj = {
    color: 'red',
    getColor: function() {
        const color = 'blue'
        console.log(color)
    }
}
// 调用方法1：直接指向调用目标函数
// 没有this，直接调用最近的作用域声明的变量
obj.getColor() //返回blue

// 调用方法2：通过第三方间接调用目标函数
// 虽然上下文在全局，但没有this，不用关心上下文，直接调用最近的作用域声明的变量
const middle = obj.getColor
middle() // 返回blue


// 情况1.5：继承关系
const obj1 = {
    color: 'pink'
    getColor: function() {
        console.log(this.color)
    }
}
const obj2 = {
    color: 'green'
    getColor: function() {
        return super.getColor()
    }
}
Object.setPrototypeOf(obj2, obj1)
obj2.getColor(); // 返回green
// 用super对象进行子调父
// super.getColor()相当于this.__proto__.getColor.call(this)
// super为对象的时候：静态方法中，指向父类；普通方法中指向父类原型对象
// super为对象的时候：在子类的静态方法中调用父类方法，this指向子类
// super为对象的时候：在子类的普通方法中调用父类方法，this指向子类的实例（本题）


// 情况二：函数（基本上被情况一涵盖了）
// 情况2.1：有this还是无this（是this.xxx还是单纯变量）
const color = 'pink'
function fn1(fn2) {
    const color = 'green'
    fn2()
}
function fn2() {
    console.log(color)
    console.log(this.color)
}
// 借靠调用
// 第一个打印，因为没有this，只关心最近的作用域声明的变量，不关系上下文，返回pink
// 第二个打印，上下文在全局，但const的变量没有挂载到全局this上，返回undefined
fn1(fn2) // 返回pink和undefined


// 情况三：闭包
function fn() {
    const num = 0
    return function() {
        console.log(num++)
    }
}
const fn1 = fn();
const fn2 = fn();
fn1(); // 返回0
fn1(); // 返回1
fn2(); // 返回0
// 闭包调用
// 每新建一个函数实例且保存到一个变量的，这个变量存在栈，相互独立。
// 函数内新建的变量，也存在栈，也是相互独立
// 综上，函数实例的调用和函数内变量的修改，不会相互影响
// 闭包的本质：其返回的函数可以使用父函数的变量的值（因为在使用变量的时候，默认从下往上的作用域寻找）


// 情况四：构造函数
// 情况4.1：是否通过new创建实例
var color = 'green'
function GetColor(col) {
    this.color = col
    console.log(this.color)
}
const a = GetColor('pink') // 返回pink
console.log(color) // 返回pink
console.log(a) // 返回undefined
const b = new GetColor('red') // 返回red
console.log(b) // 返回GetColor{color：'red'}
// 只要调用了构造函数，不管是否把值保存起来，都执行了函数，有返回值
// 没有通过new创建的实例，this指向全局，修改的是全局的变量
// 通过new创建的实例，this指向实例本身，即构造函数本身，修改的是构造函数的变量
// 通过new建立的构造函数返回的是构造对象，


// 情况4.2：new和bind谁的优先级高？
var color = 'green'
const getColor = {
    color: 'pink',
    change: function() {
        this.color = 'red'
    }.bind(window)
}
const fn = new getColor.change()
console.log(fn.color) // 返回red
console.log(this.color) // 返回green
// new的优先级比bind高，所以使用new指定的this，即实例or构造函数本身
// 这里修改的是实例的color


// 情况4.3：实例的复制
var fn1 = fn2 = fn
fn2.color = 'yellow'
console.log(fn1.color) // 返回yellow
// 实例的连续复制可以逐个拆开，即相当于：
// var fn1;
// fn1 = fn2;
// fn2 = fn;
// 实际上三者都是fn实例的复制，其引用的构造函数对象都是同一个，因此修改的对象内的key也是同一个变量
// 关于变量的存放地址看下面这个图


// 情况4.4：实例的this指向范围
function GetColor(col) {
    if (col) {
        this.color = col
    }
}
GetColor.prototype.color = 'pink'
const a = new GetColor()
console.log(a.color) // 返回pink
// 因为实例及其原型共享一个this，所有方法和变量都是共享的
// 如果实例在本身对象找不到变量或方法，就会去原型上面找

// 情况4.5：构造函数的固定声明写法
var color = 'green'
const GetColor = (col) => {
    this.color = col
    console.log(this.color)
}
const res = new GetColor('pink')
console.log(res)
// 返回undefined
// 构造函数不能用箭头函数来构造
```






## 继承


- 原型链：实例挂到原型上
  - 过多继承没用的属性

```
Grand.prototype.lastName = 'll';
function Grand() {
    
}
const grand = new Grand();

Father.prototype = grand;
function Father() {
    this.name = 'zz'
}
const father = new Father();

// Son 的本意是继承Grand的lastName，但是他必须要经过father这一层
// 有点像props的传递
Son.prototype = father;
function Son() {

}
const son = new Son;
```


- 构造函数：借用call来实现方法或属性借用
  - 构造一个东西要执行两个函数
  - 构造函数原型没有继承，只是继承了构造函数本身的属性和方法

```
function Person(name, age) {
    this.name = name;
    this.age = age;
}

function Student(name, age, grade) {
    Person.call(this, name, age)
    this.grade = grade
}

const s1 = new Student('z', 20, 3)
```


- 共享原型（公有原型）
  - 不能随便改自己的原型

```
Father.prototype.lastName = 'zz';
function Father() {

}
function Son() {

}
Son.prototype = Father.prototype;
// 相当于Father的原型给了Father和Son
// Father和Son的祖先是同一个对象

// 更好的写法：封装一个方法实现共有对象的继承
function inherit(target, origin) {
    target.prototype = origin.prototype;
}
inherit(Son, Father);

// 不能修改自己的原型，因为这时Son.prototype指向的是同一个房间
Son.prototype.gender = 'female';

const father = new Father();
const son = new Son();
console.log(father.gender)
// 打印female
```


- 圣杯模式
  - 设定一个中间层，一方面原型指向father，另一方面自己本身的属性或空间为son的原型

```
Father.prototype.lastName = 'zz';
function Father(name) {
    this.name = name
}
function Son() {
}
// 加一个中间层
// 一方面，中间层的原型和origin原型一致
// 另一方面，中间层本身是target的原型
// 修改target的原型不会改father的原型

function inherit(target, origin) {
    function Middle() {}
    Middle.prototype = origin.prototype
    target.prototype = new Middle()
}



// 但是这样有一个问题
// son 的constructor变成了Father() {}
// son.__proto__(找此实例的构造函数的原型即Son.prototype)为new Middle()
// new Middle().__proto__(找此实例的构造函数的原型即Middle.prototype)为Father.prototype
// Father.prototype.__proto__指向Object.prototype(Father.prototype是对象，其构造函数肯定是Object)，这时到头了
// 因此找Father.prototype.constructor，为Father() {}
function inherit(target, origin) {
    function Middle() {};
    Middle.prototype = origin.prototype; // 必须写在new的上面
    target.prototype = new Middle();
    
    // 改一下constructor
    target.prototype.constructor = target;

    // 记录一下真正继承的目标函数father.prototype
    target.prototype.super = origin.prototype

    // 如果想要继承father本身的属性
    target.prototype.super = function (name) {
        return new origin(name)
    }
}



// Middle本来就不是一个重要的变量，直接变成私有变量
const inherit = (function () {
    const Middle = function() {};
    return function(target, origin) {
        Middle.prototype = origin.prototype;
        target.prototype = new Middle();

        target.prototype.constructor = target;
        target.prototype.super = origin.prototype;
    }
}())
```


  - 更好的写法，用Object.create

```
// 父亲对象
function Father(gender) {
    this.gender = gender
}
Father.prototype.getGender = function() {
    console.log('this.gender', this.gender)
}

// 儿子对象
function Son(name, age) {
    this.name = name
    this.age = age
}

// 儿子继承父亲的对象
// 首先继承父亲的方法
Son.prototype = Object.create(Father.prototype)
// 改一下constructor
Son.prototype = Object.create(Father.prototype, {
    constructor: {
        value: Son,
        writable: true,
        configurable: true,
        enumerable: false,
    }
})

// 然后需要继承父亲的属性（因为属性要传递参数，必须用一个函数来实现）
Son.prototype.super = function(gender) {
    return new Father(gender)
}

// 儿子对象原本的自己的方法加上
Son.prototype.getName = function() {
    console.log(this.name)
}
Son.prototype.msg = function() {
    console.log('msg', this.name, this.age)
}

// 儿子的实例
const son = new Son('ming',25)

// 下面返回 this.gender female
son.super('female').getGender()

// 下面返回undefined，因为儿子实例本身是没有父亲的属性的
console.log(son.gender)
```





## 正则表达式
### 转译字符

1. \：将后面跟着的一个字符强行变为字符串

```
const str = "a\"b\"c"
// 打印a"b"c

// 代码中默认字符串不能换行写
document.body.innerHTML = "
<div></div>
<p></p>
"
// 上面报错！！！

// 利用转译符号，把中间换行的空处转译掉
// 每一行后面加一个转译符号
document.body.innerHTML = "\
<div></div>\
<p></p>\
"
```


2. \n：换行
3. \r：当前行结束（回车）
4. \t：一个缩进（4空格） /  制表符
5. \f：换页符


### 创建
1. const reg = /xxxx/ig
2. new RegExp('xxxx', 'ig') 或者 new RegExp(reg)

- 属性
  - i：忽视大小写
  - g：全局（匹配完一个不够，还要继续匹配）
  - m：多行


```
const reg = /^a/gm
const str = 'abcde\na'

// 匹配出来是两个a（能够识别换行符）
```


### 规则
#### 表达式

- []：一个【】表示一个字符位，【】里面表示区间，任取一个
  - [0-9A-z]：表示所有数字、大小写字母
  - [^a]：表示不是a的都行

- ()：一个（）表示多个字符位
  - 使用reg.exec()或者str.match()方法可以把括号的匹配拿出来
  - ()后面加\1，表示反向引用，引用第一个括号表达式的内容


```
const str = 'aaaa'
const reg = /(\w)\1\1\1/g
// 这里的 \1 表示与前面这个括号的表达式一直，也是找一个数母
// 匹配的是'aaaa'

const str2 = 'aabb'
// 原表达式匹配不到
const reg1 = /(\w)\1(\w)\2/g
// 匹配的是'aabb'
```

- |：表示或


#### 元符号

- \w：等于[0-9A-z_]（数字+字母）
- \W：等于[^\w]

- \d：等于[0-9]（数字）
- \D：等于[^\d]

- \s：等于空白字符（换行\n、回车\r、换页\f、制表\t、垂直制表\v、空格）
- \S：等于[^\s]

- \b：等于单词边界
- \B：非单词边界

- .：等于[^\r\n]

PS：匹配所有的东西：[\w\W]



#### 量词
- n+：一次到无限次
- n*：0次到无限次
- n?：0次到1次
- n{x}：x次
- n{x, y}：x次到y次
- n{x, }：x次到正无穷
- ^：开头
- $：结尾

```
const str = 'abc'
const reg = /\w*/g
// 匹配出  abc  和  ''
// 第一次匹配到值，光标继续往后移动，直到在最后一位，再次匹配0的数母

const reg = /\d*/g
// 匹配出  ''  和  ''  和  ''  和  ''
// 相当于每个光标都匹配一次0的数字，就是空
```



#### 预查
- /xx(?=b)/g：正向预查，找到后面跟着b的xx
- /xx(?!b)/g：负向预查找到后面不跟着b的xx

- 例子

```
// 100000000 ——> 100.000.000
const reg = /(?=(\B)(\d{3})+$)/g;
const str = '100000000';
console.log(str.replace(reg, '.'));
```

  - (?= ... )：验证后面的字符是否符合条件
  - $：字符串的末尾有一个或多个三位数字
  - 从右到左分析，找到后面紧跟着三位数字并且这些数字不是在单词边界的前面的位置
  - 先找最后三个数字 000，再检查前面的数字（100000）是否符合条件。
  


#### unicode编码
- \u0000（16进制）
  - 分层次：
  - \u010000 - \u01ffff
  - \u020000 - \u02ffff


#### 非贪婪模式
任何符号后面加？，能少则少




### 检验方法

1. reg.test()：返回boolean

2. reg.exec()：返回包含匹配结果的数组（可以拿出（）里面的内容）
  1. 查找的起始点受lastIndex控制
    1. 加上g：执行一次，匹配lastIndex往后找到的第一个；再执行一次，lastIndex移动到最新位置，继续找
    2. 没加g：每次执行，lastIndex都被重置为0

3. str.match()：返回包含匹配结果的数组  /  匹配结果
  1. 不加g：返回包含匹配结果的数组（可以拿出（）里面的内容）
  2. 加g：返回仅匹配结果的数组

4. str.search()：返回匹配到的东西的位置，匹配不到返回-1

5. str.replace()
  1. 如果第一个参数使用字符串，只是替换找到的第一个
  2. 如果使用反向引用
    1. 第二个字符串参数使用$n表示拿出正则里面第n个括号里面的内容；
    2. 第二个函数类参数的入参是：整个正则表达式、第一个括号内容、第二个括号内容......


```
const str = 'aabb'
const reg = /(\w)\1(\w)\2/g

str.replace(reg, '$2$2$1$1')
// 返回bbaa

str.replace(reg, function ($, $1, $2) {
    return $1 + 'add'
})
// return的值是【需要替换成的值】
```

