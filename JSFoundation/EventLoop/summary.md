## 微任务
### promise
（见promise.js文件）

#### Promise.all

`const p=new Promise([p1,p2,p3])`

p的状态由p1、p2、p3决定，分成两种情况:

1. 只有p1、p2、p3的状态都变成fulfilled，p的状态才会变成fulfilled，此时p1、p2、p3的返回值组成一个数组，传递给p的回调函数。 
2. 只要p1、p2、p3之中有一个被rejected，p的状态就变成rejected，此时第一个被reject的实例的返回值，会传递给p的回调函数。 


- 手写promise.all
关键是用一个计数器来与入参数组的长度比较，如果相等就可以resolve

```
function promiseAll(promises) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(promises)) return new Error('not array')
        let resolveCounter = 0
        let resolveResult = []
        for (let i = 0; i < promises.length; i++) {
            // 这里是借助promise的resolve方法来实现对数组内各个函数的异步化处理，并拿到结果
            Promise.resolve(promises[i]).then((res) => {
                resolveCounter++
                resolveResult[i] = res
                if (resolveCounter === promises.length) {
                    // 如果所有结果成功的话，就返回一个resolve，但凡一个不成功都不行
                    return resolve(resolveResult)
                }
            // 第二个参数是error为入参的处理错误的函数
            }, (error) => {
                return reject(error)
            })
        }
    })
}
```

#### Promise.race
 
`const p = Promise.race([p1, p2, p3]);`

上面代码中，只要p1、p2、p3之中有一个实例率先改变状态，p的状态就跟着改变。那个率先改变的Promise实例的返回值，就传递给p的回调函数。 


## 异步例子
### 控制xx数量任务“同时”执行
- 题目：现在有一个类，需要写出里面的add方法，要求一次只能同时执行两个任务
- 信息：入参是一个异步函数，里面要求子函数delay执行完之后打印run

```
const queue = new MacroTaskQueue();  

function delay(time) {  
    return new Promise(resolve => setTimeout(() => {
        console.log('setTimeout', time, 'tag', new Date().getTime())
        resolve()
    }, time));  
}  

function addNum(time, data) {  
    queue.add(async () => {  
        await delay(time);  
        console.log('run', data, new Date().getTime());  
    }, data);  
}
addNum(400, '1');  
addNum(100, '2');  
addNum(1000, '3');  
addNum(300, '4');  
addNum(200, '5');  
// 执行1和2的函数，打印2，然后执行3函数，打印1，然后执行4函数，打印4，然后执行5函数，打印5，打印3
```

思路：
1. 每次执行addNum，就把任务加到队列里面，然后就去立刻挂起异步执行
2. 上面一句话可以分为两部分，
  1. 一部分是同步函数：任务加入队列；队列里面拿出任务；
  2. 一部分是异步函数：异步执行任务；（执行完任务之后重复一个同步函数：即队列里面拿出函数）
3. 使用【计数器】控制【拿出任务执行】这个步骤

```
class MacroTaskQueue {
    constructor() {
        this.tasks = [];
        this.concurrentTasks = 0;
        this.maxConcurrentTasks = 2;
    }

    // 执行的异步函数（需要隔开来写，与同步函数分开）
    // 执行完之后还要更新计数器并且再次拿任务执行
    async runTask(task) {
        await task();
        this.concurrentTasks--;
        this.checkAndRunNextTask();
    }

    // 拿任务执行的同步函数
    checkAndRunNextTask(data) {
        // 限制条件：有任务，且当前计数器小于限制值
        if (this.tasks.length > 0 && this.concurrentTasks < this.maxConcurrentTasks) {
            const task = this.tasks.shift();
            this.concurrentTasks++;
            this.runTask(task);
        }
    }

    // 加入任务后立刻拿任务执行
    add(taskFunction, data) {
        this.tasks.push(taskFunction);
        this.checkAndRunNextTask(data);
    }
}
```


### 控制xx任务“前后”执行

2. 题目：有一个事件，点击之后有两个异步函数，要求等前一个执行完，才执行后一个

思路：
- 写一个顶部开关
- 在执行中就让顶部开关直接等于new Promise，执行完之后立刻改变此Promise的状态，然后关掉开关
- 另一个函数，拿到这个new Promise，等他执行完，因为他执行完相当于fetch执行完了

```
let isFirstLoading = null

function firstClick() {
    console.log('first click start')
    const fetch = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('first click fetched')
        }, 1000)
    })
    isFirstLoading = new Promise((resolve, reject) => {
        fetch.then(res => {
            console.log('first click end')
            isFirstLoading = null
            resolve(res)
        })
    })
}

function secondClick() {
    if (isFirstLoading) {
        isFirstLoading.then(res => {
            console.log(res)
            console.log('second click')
        })
    } else {
        console.log('second click')
    }
}

firstClick()
secondClick()
```
