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

1. 两个任务（且后一个任务不受前面的任务的控制）
- 题目：有一个事件，点击之后有两个异步函数，要求等前一个执行完，才执行后一个
- 思路：
  - 写一个顶部开关
  - 在执行中就让顶部开关直接等于`new Promise`，执行完之后立刻改变此Promise的状态，然后关掉开关
  - 另一个函数，拿到这个`new Promise`，等他执行完，因为他执行完相当于fetch执行完了

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


- 进阶：
  - 上面的思路其实就是：用Promise包裹长任务，放在一边不管他，继续执行后面的，等到时间到了，resolve这个开关会触发回调函数的执行
  - 相当于下面的代码，只是上面的只需要控制两个任务，且要考虑第二个任务不受第一个任务控制的情况

```
function task(num){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(num)
            resolve()
        }, 3000)
    })
}

task(1).then(res => 第二个任务)
```






2. 多个任务

- 题目：有一个数组，实现这个数组每一个元素隔3秒打印一次

```
const arr = [1, 2, 3]
function task(num){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(num)
            resolve()
        }, 3000)
    })
}
```


- 思路1：
  - 用覆盖式的Promise链
  - 为什么要覆盖式，利用then返回一个宏任务（宏任务里面才有resolve）的特征，使得变量被覆盖为一个pending的promise对象
  - 也就是说，每次调用回调函数，放入队列中都是受到setTimeout包裹的函数，需要等待上一个任务执行完毕，更清晰的说法就是：【上一个任务与resolve开关同时进行，只不过因为下一个任务受到setTimeout包裹，才会等待上一个任务执行】
  - 等待的是一个包

```
(function loopThroughArray(arr) {
    let promiseChain = Promise.resolve();

    arr.forEach(num => {
        promiseChain = promiseChain.then(() => task(num));
    });
})(arr);


// 下面的和上面的是一样的
let promiseChain = Promise.resolve();
promiseChain = promiseChain.then(() => task(1));
promiseChain = promiseChain.then(() => task(2));
promiseChain = promiseChain.then(() => task(3));


// 但是不能写成这样，不然相当于所有元素隔3秒之后会一起打印
Promise.resolve().then(() => task(1))
Promise.resolve().then(() => task(2))
Promise.resolve().then(() => task(3))


// 还有一种写法是用reduce的写法，相当于拼接所有【上一次.then(本次)】的单元
let promiseChain = Promise.resolve()
arr.reduce((accum, item) => {
    return accum.then(() => task(item))
}, promiseChain)

```


- 思路2
  - 用链式的包含return的Promise链
  - 为什么要包含return，对于每个then回调函数之间，如果不return且return一个Promise的话，（除了第一个回调函数受到控制）其他的回调函数执行完之后就会自动resolve，后面的回调函数就会立刻执行，导致第二个元素及后面的元素被同时加到webAPI中计时，完了一起打印出来
  - return相当于执行了`resolve(Promise)`，首先使得本次的状态不会立刻变为fullfilled，其次，根据传入的Promise的resolve时间点，执行【把本轮then的Promise的状态变为fullfilled】，具体如下：
    - return 已经瞬间resolve的promise ——> 与不return无区别
    - return 延后resolve的promise ——> 起实际作用，相当于打断默认的瞬间resolve
    - return 一直不resolve的promise ——> 相当于永远不会resolve，后面的then一直不会触发
    - （无论return的是一个新的promise还是怎么样，都可以保证最后resolve的是当前then的promise）
  

```
// 正确做法
task(arr[0]).then(res => {
    return task(arr[1])
}).then(res => {
    task(arr[2])
})

// 这个与不return没有区别，因为resolve是瞬间给到then函数的，导致then函数会瞬间执行，改变当前的resolve
task(arr[0]).then(res => {
    task(arr[1])
    return new Promise((resolve) => {resolve()})
}).then(res => {
    task(arr[2])
})

// 这个不会打印3，因为相当于永远不会resolve，最后的回调函数永远不会被执行
task(arr[0]).then(res => {
    task(arr[1])
    return new Promise((resolve) => {})
}).then(res => {
    task(arr[2])
})
```


- 思路3
  - 用递归构造包裹式的Promise链
  - 递归有两种思路，第一种是从上到下收集结果，也就是从外往里包裹。
    - 此时最外层为【一次操作单元】，即`本次.then(`
    - 这时需要注意末尾的处理，不能也是`本次.then(下一次)`的形式，应该只是最后一次。
    - 构造出的链条形如：`task(arr0).then(task(arr1).then(arr2))`
  
```
function recursivePrint(arr, index = 0) {
    if (index >= arr.length) return
    if (index < arr.length - 1) {
        task(arr[index]).then(() => {
            recursivePrint(arr, index + 1);
        });
    } else {
        task(arr[arr.length - 1])
    }
}
recursivePrint(arr, 0)
  
  - 第二种思路是从下往上收集结果，也就是从内往外包裹。
    - 此时内层为【一次操作单元】，即`下一次)`，因为需要先探底到最后一程，然后向上返回“下一次”的任务
    - 这时顶部肯定是遍历到最末尾，返回的应该是最末尾的任务，即`task(arr[arr.length - 1])`，为了防止这个时候就执行了，用一个函数包裹一下
    - 首部也需要额外构造，或者说首部应该是函数触发执行的导火索，这个逻辑应该放在递归函数的后面，等bottomUpToTop构造好了后面所有函数的时候，判断curIndex为0，然后执行
    
function back(arr, i) {
    if (i >= arr.length - 1) return () => task(arr[arr.length - 1])
    const bottomUpToTop = back(arr, i+1)
    const cur = i
    if (cur === 0) {
        task(arr[cur]).then(() => { bottomUpToTop()})
    }
    return () => task(arr[cur]).then(() => { bottomUpToTop()})
}

back(arr, 0)
```


- 思路4
  - 最简单的做法，直接同步遍历，然后await等待，执行完一句之后才去下一句

```
async function printSequentially(arr) {
    for (const num of arr) {
        await task(num);
    }
}
printSequentially(arr);
```



