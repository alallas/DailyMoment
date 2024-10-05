## 原型模式
就是利用func.prototype()来使得各个对象的方法可以共享，使得他们的内存地址只有一个。

- 核心：保证某个对象或函数或实例只存在一次，其他都是对他的引用
- 好处是：可以减少内存
- 怎么做：
  - `Object.create(xx)`方法是创建一个以xx为原型的对象。在JavaScript中用于创建（克隆）一个新对象，并且这个新对象会继承另一个对象的原型链。
  - 参数：
    1. proto：要继承的原型对象。如果为 null，则创建的对象将不继承任何属性或方法。
    2. propertiesObject （可选）：一个包含一个或多个属性描述符的对象，这些属性将被添加到新创建的对象上。
    3. 属性描述符的格式是：

```
   {
     propName: {
       value: value,          // 属性的值
       writable: true/false,  // 属性是否可写
       configurable: true/false, // 属性是否可配置
       enumerable: true/false, // 属性是否可枚举
       // 也可以像普通属性描述符一样，设置getter和setter
       get: function() { ... }, 
       set: function(value) { ... }
     },
     // 可以包含多个属性
   }
```

例子：

```
const personPrototype = {
  sayHello: function() {
    console.log("Hello, my name is " + this.name);
  }
};

const janeDoe = Object.create(personPrototype, {
  name: {
    value: "Jane Doe",
    writable: true,
    configurable: true,
    enumerable: true
  }
});
```

- PS：是否共享一个内存地址？
  - 情况一：被继承的对象的属性==没有嵌套关系==：
在JavaScript中，使用Object.create()继承的是原型链上的属性和方法，并不是直接共享相同的内存地址。
具体来说，当你通过Object.create(proto)创建一个新对象时，新对象的内部原型[[Prototype]]（也就是__proto__属性）指向proto对象。这意味着新创建的对象会继承proto对象上的属性和方法，但是proto对象本身并没有被复制，也没有共享内存地址。
  - 情况二：被继承对象的属性==有嵌套关系：==
如果proto对象中有引用类型的属性（比如对象、数组），那么，新创建对象通过原型链能够访问到这些引用类型属性，但它们指向的是同一块内存空间（即同一个对象或数组）。
  - PS！然而，需要明确的是，每个对象本身（在此例中为obj1和obj2）都有自己的内存地址，它们是独立的对象实例。只有当你访问继承自原型的引用类型属性时，这些属性的值才会指向相同的内存地址。基本数据类型（如字符串、数字、布尔值）则不是存储在引用中的，因此每个对象都拥有自己的独立副本。


例子：
```
const obj1 = { a: 1, b: { c: 2 } };
const obj2 = Object.create(obj1);

obj2.a = 3;
obj2.b.c = 4;

console.log('obj1', obj1);
// { a: 1, b: { c: 4 } }

console.log('obj2', obj2);
// { a: 3 }
// 原型上有{ a: 1, b: { c: 4 } }的obj1
const proto = {
        //嵌套对象，指向某个对象
    complexAttribute: { key: 'value' }
};

const obj1 = Object.create(proto);
const obj2 = Object.create(proto);

console.log(obj1.complexAttribute === obj2.complexAttribute); // 输出 true
```



## 单例模式

- 核心目的：这个对象或函数只有一个实例，减少内存开销
- 例子：

1. 闭包方式实现

```
// 单例模式
// 写一个【闭包函数形式 + 自执行函数】
// 挂到构造函数的属性上，调用方便
function Obj(name) {
    this.name = name
    console.log('name', this.name)
}

Obj.getInstance = (function() {
    let instance = null
    return function(name) {
        if (!instance) {
            instance = new Obj(name)
        }
        return instance
    }
})()

const instance1 = Obj.getInstance('Tom') // 输出name Tom
const instance2 = Obj.getInstance('Sarah') // 没有输出
console.log(instance1 === instance2) // 输出true
```

2. 惰性方式实现

```
// 惰性写法
// 把构造函数写到里面，外面包裹一个大的自执行函数，返回对象
// 这里要用let
let Obj = (function() {
    function Obj(name) {
        this.name = name
        console.log('name', this.name)
    }

    let instance = null
    return {
        getInstance(name) {
            if (!instance) {
                instance = new Obj(name)
            }
            return instance
        }
    }
})()

const instance1 = Obj.getInstance('Tom') // 输出name Tom
const instance2 = Obj.getInstance('Sarah') // 没有输出
console.log(instance1 === instance2) // 输出true
```

3. 类方式实现

```
// ES6的类写法
class Obj {
    constructor() {
        this.instance = null
    }
    // 静态方法只能由类本身调用，实例不能调用
    static getInstance() {
        if (!this.instance) {
            this.instance = new Obj()
        }
        return this.instance
    }
}

const instance1 = Obj.getInstance('Tom')
const instance2 = Obj.getInstance('Sarah')
console.log(instance1 === instance2) // 输出true
```


## 工厂模式


- 解决了什么核心问题：有多个类似结构的对象，比如dom节点，只是标签名称和属性不一样，用户不需要写多个一样的代码
- 总体结构：（单元是对象，而不是对象和方法混合的，相当于分类标准是对象本身）
  - 一个公共对象（内部含有属性或方法）
  - 一个工厂管理不同类型的对象
- 需要解决的问题：如何让公共的部分只有一个，其他的实例指向这个唯一的，减少内存开销（公用的方法写在原型上）


- 简单工厂模式
1. 只有一类对象的情况

```
// 超级简单工厂模式（只有一个类型的对象）
function Product1(name, age) {
    this.name = name
    this.age = age
}

Product1.prototype.getName = function() {
    console.log(this.name)
}

Product1.prototype.msg = function() {
    console.log('msg', this.name, this.age)
}

const p1 = new Product1('1', 3)
const p2 = new Product1('2', 5)

p1.getName()
p2.msg()
```

- 上述需要关注的点：
- 用构造函数（母亲）来实现每次构造子实例
- 用原型（父辈）来实现每个子实例的公共的方法只有一个
- 其实可以换class的写法，在es6里面（见原型那一节）



2. 需要有多类对象，但对象的类数是固定的

```
// 简单工厂模式（只有固定的几类对象）
// 产品
// 第一类：人类
class Product1 {
    constructor(name, age) {
        this.name = name
        this.age = age
    }
    getName() {
        console.log('name', this.name)
    }
    msg() {
        console.log('msg', this.name, this.age)
    }
}

// 第二类：动物
class Product2 {
    constructor(animal, action) {
        this.animal = animal
        this.action = action
    }
    getAnimal() {
        console.log('animal', this.animal)
    }
}

// 生产的工厂
class Factory {
    constructor(type) {
        switch (type) {
            case 'product1':
                return new Product1(...Array.from(arguments).slice(1))
            case 'product2':
                return new Product2(...Array.from(arguments).slice(1))
            default:
                break
        }
    }
}

// 实例化生产
const human = new Factory('product1', 'ming', 25)
const animal = new Factory('product2', 'duck', 'swim')

human.getName()
animal.getAnimal()
```

（注意：上面拿取参数的第一个还有别的写法）：
```
...Array.from(arguments).slice(1)可以改成Array.prototype.shift.call(arguments)
```



- 工厂方法模式（一个工厂一个产品） / 抽象工厂模式（一个工厂n个产品）

（这里写到一起了）

需要有多类对象，且对象的类数是动态的，可不断新增减少

1. 其实是抛弃了【用一个工厂函数就可以造出多个子例的这种模式】，改成了造多个工厂函数。因为前者需要增加产品类别的时候，必然需要修改顶层函数；而后者需要增加产品的时候，直接增加具体产品类

2. 本质上，因为升级版的工厂多了一个维度，就是顶层的抽象类（其中产品大类是关键，如果不够可以随时增加）。原本的简单工厂直接在仅有的一个维度的工厂函数上增加产品。现在升级版就是在多个产品甚至多个工厂上增加了一个一个抽象维度。不同工厂之间是竞争对手的关系，不同产品可以无限增加

```
// 高级工厂模式

// 抽象工厂（造生物）
// 提供每个工厂公用方法，不干活，喊具体对应的工厂干活
class MetaFactory {
    // 造人
    createProduct1() {
        throw new Error('no product1')
    }
    // 造动物
    createProduct2() {
        throw new Error('no product2')
    }
}
// 抽象产品（人）
// 提供工厂里面每个产品公共的方法
class Product1 {
    getName() {
        throw new Error('no name')
    }
}
// 抽象产品（动物）
class Product2 {
    getFlur() {
        throw new Error('no flur')
    }
}

// 如果是用typeScript来写的话，可以不写类，直接写接口
// 上面都是写死的，一个工厂能够造多少种公用的大类产品，且分别是什么，需要事先商量好
// 后续如果要增加产品大类，就增加抽象产品类，然后在子工厂中新建一个方法返回这个具体产品子类


// 具体工厂（不同的竞争对手，比如女娲和上帝，造生物）
// 每个对象的具体的工厂，其方法是对父亲工厂的重写
// 这里以女娲工厂为例子
class NvwaFactory extends MetaFactory{
    // 造人
    createProduct1() {
        return new Tom()
    }
    // 造动物
    createProduct2() {
        return new Cat()
    }
}
// 具体产品（人）
class Tom extends Product1{
    getName() {
        console.log('name, tom')
    }
}
// 具体产品（动物）
class Cat extends Product2{
    getFlur() {
        console.log('flur, soft')
    }
}

const nvwaFactory = new NvwaFactory()
const human = nvwaFactory.createProduct1()
const cat = nvwaFactory.createProduct2()
human.getName()
cat.getFlur()
```




