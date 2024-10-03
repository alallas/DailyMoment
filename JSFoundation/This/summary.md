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



