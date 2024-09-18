
### 基本框架：
入参型：
```
function back(val)
【if 终止条件】
操作
back(val+1) （外部变量每层传入更新值）
【回溯】
```

返回值型：
```
function back()
【if 终止条件】
let val （每层一个变量）
操作
let xx = back()
操作
return val
```



### 例子：
- 深拷贝：

利用返回值的方法，下面所有层（包括下一层和后代层）返回的值并入当前层（可见一般用在顶层收集结果的情况）

每一层定义一个新的layer，进入新的一层递归，操作后返回当前层的layer

```
// 错误写法：忽略了obj如果是Array的话也会浅拷贝
function isObj(obj) {
    if (Object.prototype.toString.call(obj) === '[object Object]') {
        return true
    }
    return false
}
function copy(obj) {
    if (!isObj(obj)) return
    const keys = Object.keys(obj)
    let layer = {}
    for (let i = 0; i < keys.length; i++) {
        const curKey = keys[i]
        if (isObj(obj[curKey])) {
            const nextLayer = copy(obj[curKey])
            layer = Object.assign(layer, {[curKey]: nextLayer})
        } else {
            layer = Object.assign(layer, {[curKey]: obj[curKey]})
        }
    }
    return layer
}
const res = copy(obj)


// 正确写法：把obj是array的情况也考虑进来
function isObj(obj) {
    if (typeof obj === 'object' && obj !== null) {
        return true
    }
    return false
}
function copy(obj) {
    if (!isObj(obj)) return
    const keys = Object.keys(obj)
    let layer = Array.isArray(obj) ? [] : {}
    for (let i = 0; i < keys.length; i++) {
        const curKey = keys[i]
        if (isObj(obj[curKey])) {
            const nextLayer = copy(obj[curKey])
            layer[curKey] = nextLayer
        } else {
            layer[curKey] = obj[curKey]
        }
    }
    return layer
}
const res = copy(obj)
```


- 深度对比的useDeepEffect,重写useEffect

利用返回值的方法
```
function isObj(obj) {
  if (typeof obj === 'object' && obj !== null) {
    return true
  }
  return false
}
function deepDiff(obj1, obj2) {
  // 把不是对象的情况首先处理掉
  if (!isObj(obj1) || !isObj(obj2)) {
    let isSame = false
    if (!isObj(obj1) && !isObj(obj2)) {
      if (obj1 === obj2) {
        isSame = true
      }
    }
    return isSame
  }
  // 后面的两者都是对象了
  let keys1 = Object.keys(obj1)
  let keys2 = Object.keys(obj2)
  if (keys1.length !== keys2.length) {
    return false
  }
  for (let i of keys1) {
    const res = deepDiff(obj1[i], obj2[i])
    if (!res) {
      return false
    }
  }
  return true
}
const r = deepDiff(obj, res)


// 深度对比的useDeepEffect,重写useEffect
function useDeepEffect(callback, arr) {
  if (!Array.isArray(arr)) return new Error('not arr')
  const pre = useRef(arr)
  const init = useRef(false)
  if (!init.current) {
    callback.apply(this, arguments)
    init.current = true
  } else {
    const isSame = deepDiff(arr, pre.current)
    if (!isSame) {
      callback.apply(this, arguments)
      pre.current = arr
    }
  }
}
```