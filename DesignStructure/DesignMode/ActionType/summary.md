## 观察者模式

- 本质上：让多个观察者对象同时监听某一个目标对象。当这个目标对象的状态发生变化时,它会通知所有观察者对象,使它们能够自动更新自己。
- 缺点：将一个系统分割成一系列相互协作的类有一个副作用：需要维护相关对象间的一致性。不希望为了维持一致性而使各类紧密耦合，这样会降低可重用性。（即【分散有利于提高可用性】）
- 应用：
  - 异步操作和事件驱动

```
// 观察者模式
// 被观察者
class Sub {
    constructor() {
        this.observers = []
        this.state = null
    }
    addObservers(instance) {
        if (instance && instance.update) {
            this.observers.push(instance)
        }
    }
    notify(...args) {
        this.observers.forEach((i) => {
            i.update(...args)
        })
    }
    deleteObservers(instance) {
        this.observers.forEach((item, index) => {
            if (item === instance) {
                observers.splice(index, 1)
            }
        })
    }
    setState(state, ...args) {
        this.state = state;
        this.notify(...args)
    }
}

// 观察者
class Observer {
    update(...args) {
        console.log('watching....', ...args)
    }
}

// 使用
const s = new Sub()
const o = new Observer()
s.addObservers(o)
s.setState('activate', 'hello', 'Tom')

// 什么时候会notify，被观察者本身状态有变化的时候（下面是显式的手动notify）
s.notify('hello')
```

## 发布订阅模式

- 应用场景：

1. 交互事件的回调
   首先把回调函数订阅（subscribe）到某个事件上，用户点击的时候会执行发布（publish）函数

```
document.body.addEventListener( "click", function () {
  alert(2);
});
```

2. Vue的双向数据绑定
   Vue的数据双向绑定原理中：通过数据劫持结合发布-订阅模式的方式来实现的。

3. Node.js的`EventEmitter

4. redux

- 简单版本

```
// 简单版发布订阅模式
class EventZ {
    constructor() {
        this.masMsp = {}
    }

    // 订阅：把回调函数存起来
    subscribe(key, callback) {
        if (this.masMsp[key]) {
            this.masMsp[key].callbackFunc.push({callback})
        } else {
            this.masMsp[key] = {
                key,
                callbackFunc: [{callback}]
            }
        }
    }

    // 发布：（传参）执行回调函数
    publish(key, params) {
        if (this.masMsp[key]) {
            this.masMsp[key].callbackFunc.forEach((i) => {
                i.callback(params)
            })
        } else {
            console.log('无人订阅此消息')
        }
    }

    // 取消订阅
    cancelSubscribe(key) {
        if (this.masMsp[key]) {
            delete this.masMsp[key]
        } else {
            console.log('找不到此消息')
        }
    }
    // 只订阅一次
    // 还是用订阅的方法，只不过传入的callback函数被包裹了一层，在执行完callback之后，又删掉了
    onceSubscribe(key, callback) {
        function once() {
            callback.apply(this, arguments)
            this.cancelSubscribe(key)
        }
        this.subscribe(key, once.bind(this))
    }
}

// 使用
const e = new EventZ()
e.subscribe('run', (params) => console.log(params))
e.publish('run', 'i am running')
e.publish('run', 'i am running too')
e.cancelSubscribe('run')
e.publish('run', 'i am still running') // 无人订阅此消息

e.onceSubscribe('eat', (params) => console.log('eat', params))
e.publish('eat', 'egg')
e.publish('eat', 'apple') // 无人订阅此消息

```

## PS：发布订阅模式和观察者模式的区别

- 耦合度:
  观察者模式中,目标直接知道观察者,耦合度较高。
  发布-订阅模式通过一个中间件(事件通道)来管理订阅关系,发布者和订阅者互不了解,完全解耦。

- 通信方式:
  观察者模式是同步的,当目标发生变化时,会立即调用观察者的方法。
  发布-订阅模式可以是异步的,通过事件通道,可以实现延迟传递。

- 应用场景:
  观察者模式适用于目标和观察者之间有稳定的逻辑关系的场景。
  发布-订阅模式更适合于功能模块之间完全独立的场景。

- 通知方式:
  观察者模式中,目标主动将自身变化通知给所有观察者。
  发布-订阅模式中,发布者不知道谁会接收通知,它只负责发布事件。

- 代码结构:
  观察者模式通常定义在单个对象上。
  发布-订阅模式经常使用全局的事件总线。

## 策略模式

- 核心：
  现在要解决一个问题，有很多策略，通常不同场景下要换不同的策略

- 总体结构：

1. （执行者）一组策略类，策略类封装了具体的算法，并负责具体的计算过程
2. （分发者）环境类Context，Context接受客户的请求，随后把请求委托给某一个策略类。要做到这点，说明 Context中要维持对某个策略对象的引用

```
// 策略模式
// 调用和执行分开，一个用来指挥调用，一个用来执行实现
// 工厂模式也是类似的，指挥和实现是分开的（工厂是指挥，产品是实现）
// 工厂模式注重的是创建，而不是执行

// 有很多策略，分别实现策略具体类，后期可随意增加减少
// 每个策略具体类有一个同样的解决的方法名字（事先规定好, 采用接口或公共类）

// 抽象策略，调用指挥中心
class StrategyOfOneTrouble {
    // 把所选的类型保存起来
    constructor(choosedStrategy) {
        this.strategy = choosedStrategy
    }
    resolve(...args) {
        return this.strategy.resolve(...args)
    }
}

// 具体策略
class StrategyA {
    resolve(...args) {
        const a = args.reduce((accum, cur, index) => {
            const res = accum + cur + 1
            return res
        })
        console.log('StrategyA', a)
        return a
    }
}
class StrategyB {
    resolve(...args) {
        const b = args.reduce((accum, cur, index) => {
            const res = accum + cur + 2
            return res
        })
        console.log('StrategyB', b)
        return b
    }
}

// 使用
const a = new StrategyOfOneTrouble(new StrategyA())
a.resolve(2, 4, 5)

const b = new StrategyOfOneTrouble(new StrategyB())
b.resolve(2, 4, 5)
```
